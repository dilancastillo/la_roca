import type { ConfiguratorSession } from "./schemas/configurator.js";
import type {
  ActiveVisualDefinition,
  VisualActivationCondition,
  VisualSlot,
} from "./schemas/visual-catalog.js";

export type VisualRuntimeTrimSection = {
  valueId: number;
  sourceValueId?: number | undefined;
  colorHex: string;
};

export type MaterializedVisualDefinition = {
  definitionId: string;
  slot: VisualSlot;
  svgDataUri: string;
  replacesBaseSilhouette: boolean;
};


function replacesBaseSilhouette(definition: ActiveVisualDefinition) {
  // El reemplazo solo es válido para cuello y debe venir de una decisión
  // explícita guardada en el SVG. Los modelos históricos con el marcador
  // antiguo se mantienen; los SVG ambiguos sin marcador pasan a overlay.
  if (definition.slot !== "neck") {
    return false;
  }

  return (
    /<svg\b[^>]*\bdata-vc-render-mode=(?:"replace-base"|'replace-base')/i.test(
      definition.runtimeSvg,
    ) || definition.runtimeSvg.includes("data-vc-replaces-base-silhouette")
  );
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function isSlotSupportedByManifest(slot: VisualSlot, manifestKey: string) {
  const normalizedManifest = normalize(manifestKey);

  if (slot === "boot") {
    return (
      normalizedManifest.includes("pantalon") ||
      normalizedManifest.includes("uniforme")
    );
  }

  return (
    normalizedManifest.includes("blusa") ||
    normalizedManifest.includes("uniforme")
  );
}

function getSelectedSourceValueIds(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
  attributeId: number,
) {
  const selectedIds = new Set(selectedValueIds[String(attributeId)] ?? []);
  const attribute = session.attributes.find(
    (candidate) => candidate.id === attributeId,
  );

  if (!attribute) {
    return new Set<number>();
  }

  return new Set(
    attribute.values
      .filter(
        (value) =>
          selectedIds.has(value.id) ||
          (value.sourceValueId !== undefined &&
            selectedIds.has(value.sourceValueId)),
      )
      .map((value) => value.sourceValueId ?? value.id),
  );
}

function areActivationConditionsSelected(
  conditions: VisualActivationCondition[],
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const alternativesByAttribute = new Map<number, Set<number>>();

  for (const condition of conditions) {
    const alternatives =
      alternativesByAttribute.get(condition.attributeId) ?? new Set<number>();
    condition.sourceValueIds.forEach((sourceValueId) =>
      alternatives.add(sourceValueId),
    );
    alternativesByAttribute.set(condition.attributeId, alternatives);
  }

  return Array.from(alternativesByAttribute.entries()).every(
    ([attributeId, alternatives]) => {
    const selectedSourceIds = getSelectedSourceValueIds(
      session,
      selectedValueIds,
      attributeId,
    );

    return Array.from(alternatives).some((sourceValueId) =>
      selectedSourceIds.has(sourceValueId),
    );
    },
  );
}

function isBindingSelected(
  definition: ActiveVisualDefinition,
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const selectedIds =
    selectedValueIds[String(definition.binding.attributeId)] ?? [];

  if (selectedIds.includes(definition.binding.valueId)) {
    return true;
  }

  if (definition.binding.sourceValueId === undefined) {
    return false;
  }

  return getSelectedSourceValueIds(
    session,
    selectedValueIds,
    definition.binding.attributeId,
  ).has(definition.binding.sourceValueId);
}

function replaceTrimColorTokens(
  runtimeSvg: string,
  trimSections: VisualRuntimeTrimSection[],
  preserveUnselectedTrimStrokes = false,
) {
  return runtimeSvg
    .replace(
      /(fill|stroke):(__VC_TRIM_(?:FILL|STROKE)_(\d+)__)(!important)?;?/g,
      (
        _declaration,
        property: string,
        _token: string,
        sourceValueId: string,
        important: string | undefined,
      ) => {
        const color = getTrimColor(trimSections, Number(sourceValueId));

        if (color) {
          return `${property}:${color}${important ?? ""};`;
        }

        if (
          preserveUnselectedTrimStrokes &&
          _token.includes("__VC_TRIM_STROKE_")
        ) {
          return `${property}:#111827${important ?? ""};`;
        }

        // Una linea sin color conserva el trazo original porque ese mismo
        // vector puede dibujar el bolsillo. Un relleno sin color debe ocultarse:
        // conservarlo reactivaria fondos blancos del SVG sobre la prenda.
        return property === "fill"
          ? `fill:none${important ?? ""};`
          : "";
      },
    )
    .replace(
      /__VC_TRIM_FILL_(\d+)__/g,
      (_token, sourceValueId: string) =>
        getTrimColor(trimSections, Number(sourceValueId)) ?? "none",
    )
    .replace(
      /__VC_TRIM_STROKE_(\d+)__/g,
      (_token, sourceValueId: string) =>
        getTrimColor(trimSections, Number(sourceValueId)) ??
        (preserveUnselectedTrimStrokes ? "#111827" : "none"),
    );
}

function normalizeImpossibleLinePaints(runtimeSvg: string) {
  return runtimeSvg.replace(/<line\b[^>]*>/g, (lineMarkup) =>
    lineMarkup.replace(
      /fill:(__VC_(?:BASE_COLOR|TRIM_FILL_\d+)__)(!important)?;?/g,
      (_declaration, token: string, important: string | undefined) =>
        `stroke:${token}${important ?? ""};`,
    ),
  );
}

function normalizeUnfilledTrimAreas(runtimeSvg: string) {
  const unfilledClasses = new Set<string>();

  // Solo se analiza CSS dentro de <style>: metadata de Illustrator/Corel puede
  // contener decenas de miles de caracteres y no representa estilos SVG.
  for (const styleMatch of runtimeSvg.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    const styleText = styleMatch[1] ?? "";
    for (const rule of styleText.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
      const selectors = rule[1] ?? "";
      const declarations = rule[2] ?? "";
      if (!/\bfill\s*:\s*none\b/i.test(declarations)) continue;
      for (const className of selectors.matchAll(/\.([\w-]+)/g)) {
        if (className[1]) unfilledClasses.add(className[1]);
      }
    }
  }

  return runtimeSvg.replace(
    /<(path|rect|circle|ellipse|polyline|polygon)\b[^>]*>/gi,
    (markup) => {
      const trimFill = markup.match(
        /fill:(__VC_TRIM_FILL_\d+__)(!important)?;?/,
      );
      // El editor separa las áreas cerradas de un path compuesto y las marca
      // como seguras. Esas áreas sí representan relleno aunque el CSS de
      // Corel use `fill:none` como estilo base para el path original.
      if (
        !trimFill ||
        /\bdata-vc-safe-trim-fill=(?:"true"|'true')/i.test(markup)
      ) {
        return markup;
      }

      const classMatch = markup.match(
        /\bclass=(?:"([^"]*)"|'([^']*)')/i,
      );
      const classNames = (classMatch?.[1] ?? classMatch?.[2] ?? "")
        .split(/\s+/)
        .filter(Boolean);
      const isUnfilled =
        /\bfill=(?:"none"|'none')/i.test(markup) ||
        /(?:^|[;\s])fill\s*:\s*none(?:!important)?\s*;/i.test(markup) ||
        classNames.some((className) => unfilledClasses.has(className));

      return isUnfilled
        ? markup.replace(
            trimFill[0],
            `stroke:${trimFill[1]}${trimFill[2] ?? ""};`,
          )
        : markup;
    },
  );
}

function applyBaseColorToUnselectedSafeTrimFills(
  runtimeSvg: string,
  baseColorHex: string,
  trimSections: VisualRuntimeTrimSection[],
) {
  return runtimeSvg.replace(
    /<(path|rect|circle|ellipse|polyline|polygon)\b[^>]*>/gi,
    (markup) => {
      // Solo las áreas cerradas que el editor separó son seguras para recibir
      // color base. Así un cuello dinámico sin vivo se integra a la prenda sin
      // reactivar fondos o contornos exportados como fill:none por Corel.
      if (!/\bdata-vc-safe-trim-fill=(?:"true"|'true')/i.test(markup)) {
        return markup;
      }

      // Si la sección no tiene color de vivo, sustituimos el token por el
      // color base; si sí lo tiene, dejamos el token para que se resuelva al
      // color seleccionado en el paso normal de materialización.
      return markup.replace(
        /fill:(__VC_TRIM_FILL_(\d+)__)(!important)?;?/g,
        (
          declaration,
          _token: string,
          sourceValueId: string,
          important: string | undefined,
        ) =>
          getTrimColor(trimSections, Number(sourceValueId))
            ? declaration
            : `fill:${baseColorHex}${important ?? ""};`,
      );
    },
  );
}

export function isThinVisualPolygonPoints(rawPoints: string | undefined) {
  if (!rawPoints) {
    return false;
  }

  const coordinates = rawPoints.match(
    /[-+]?(?:\d*\.?\d+)(?:e[-+]?\d+)?/gi,
  );

  if (!coordinates || coordinates.length < 6 || coordinates.length % 2 !== 0) {
    return false;
  }

  const points = Array.from({ length: coordinates.length / 2 }, (_, index) => ({
    x: Number(coordinates[index * 2]),
    y: Number(coordinates[index * 2 + 1]),
  }));

  if (points.some(({ x, y }) => !Number.isFinite(x) || !Number.isFinite(y))) {
    return false;
  }

  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  const boundingArea =
    (Math.max(...xs) - Math.min(...xs)) *
    (Math.max(...ys) - Math.min(...ys));

  if (boundingArea <= 0) {
    return false;
  }

  const polygonArea = Math.abs(
    points.reduce((area, point, index) => {
      const nextPoint = points[(index + 1) % points.length] ?? point;
      return area + point.x * nextPoint.y - nextPoint.x * point.y;
    }, 0) / 2,
  );

  // Corel y otros editores convierten con frecuencia una linea gruesa en un
  // poligono largo y angosto. En esos casos el color visible pertenece al
  // relleno de la figura, aunque funcionalmente el usuario lo configure como
  // "Vivo, linea".
  return polygonArea / boundingArea <= 0.2;
}

function normalizeThinPolygonVisualStrokes(runtimeSvg: string) {
  return runtimeSvg.replace(/<polygon\b[^>]*>/g, (polygonMarkup) => {
    const persistedLinearFill = polygonMarkup.match(
      /fill:(__VC_TRIM_STROKE_\d+__)(!important)?;?/,
    );

    if (persistedLinearFill) {
      const token = persistedLinearFill[1] ?? "";
      const important = persistedLinearFill[2] ?? "";
      const withDarkEdgeToken = polygonMarkup.includes(`stroke:${token}`)
        ? polygonMarkup
        : polygonMarkup.replace(
            persistedLinearFill[0],
            `fill:${token}${important};stroke:${token}${important};`,
          );

      return withDarkEdgeToken.includes("data-vc-linear-trim-polygon")
        ? withDarkEdgeToken
        : withDarkEdgeToken.replace(
            /<polygon\b/i,
            '<polygon data-vc-linear-trim-polygon="true"',
          );
    }

    const points = polygonMarkup.match(/\bpoints=(?:"([^"]*)"|'([^']*)')/i);

    if (!isThinVisualPolygonPoints(points?.[1] ?? points?.[2])) {
      return polygonMarkup;
    }

    const normalizedMarkup = polygonMarkup.replace(
      /stroke:(__VC_TRIM_STROKE_\d+__)(!important)?;?/g,
      (_declaration, token: string, important: string | undefined) =>
        `fill:${token}${important ?? ""};stroke:${token}${important ?? ""};`,
    );

    return normalizedMarkup.replace(
      /<polygon\b/i,
      '<polygon data-vc-linear-trim-polygon="true"',
    );
  });
}

function normalizeNeckVectorStrokeWidths(runtimeSvg: string) {
  return runtimeSvg.replace(
    /<(path|rect|circle|ellipse|line|polyline|polygon|use)\b[^>]*__VC_TRIM_(?:FILL|STROKE)_\d+__[^>]*>/gi,
    (elementMarkup) => {
      const strokeStyle =
        "stroke-width:3px!important;vector-effect:non-scaling-stroke;stroke-linecap:round;stroke-linejoin:round;";
      const styleMatch = elementMarkup.match(/\bstyle=("([^"]*)"|'([^']*)')/i);

      if (styleMatch) {
        const styleValue = styleMatch[2] ?? styleMatch[3] ?? "";
        const quote = styleMatch[1]?.startsWith("'") ? "'" : '"';
        return elementMarkup.replace(
          styleMatch[0],
          `style=${quote}${styleValue}${strokeStyle}${quote}`,
        );
      }

      return elementMarkup.replace(/\s*\/>$|>$/, (ending: string) =>
        ending === "/>"
          ? ` style="${strokeStyle}"/>`
          : ` style="${strokeStyle}">`,
      );
    },
  );
}

const LINEAR_TRIM_MAIN_WIDTH = 10;
const LINEAR_TRIM_SHADOW_WIDTH = 15;
const LINEAR_TRIM_DARK_EDGE = "#003f59";
const LINEAR_TRIM_COLOR_FACTOR = 0.78;

function appendInlineSvgStyle(markup: string, declarations: string) {
  const styleAttribute = /\sstyle=("([^"]*)"|'([^']*)')/i;

  if (styleAttribute.test(markup)) {
    return markup.replace(
      styleAttribute,
      (_attribute, _quotedStyle: string, doubleStyle: string, singleStyle: string) => {
        const currentStyle = doubleStyle ?? singleStyle ?? "";
        const separator =
          currentStyle.length === 0 || currentStyle.endsWith(";") ? "" : ";";
        return ` style="${currentStyle}${separator}${declarations}"`;
      },
    );
  }

  return markup.replace(/\s*\/>$/, ` style="${declarations}" />`);
}

function removeDuplicateSvgIdentity(markup: string) {
  return markup
    .replace(/\s+id=("[^"]*"|'[^']*')/i, "")
    .replace(/\s+data-vc-id=("[^"]*"|'[^']*')/i, "");
}

function replaceLinearTrimStrokeToken(markup: string, stroke: string) {
  return markup.replace(
    /stroke:__VC_TRIM_STROKE_\d+__(?:!important)?;?/g,
    `stroke:${stroke}!important;`,
  );
}

function addLinearTrimTexture(
  runtimeSvg: string,
  trimSections: VisualRuntimeTrimSection[],
) {
  const geometryElement =
    /<(path|line|polyline|polygon|rect|circle|ellipse)\b[^>]*stroke:__VC_TRIM_STROKE_(\d+)__[^>]*\/>/gi;

  return runtimeSvg.replace(
    geometryElement,
    (markup, _tagName: string, sourceValueId: string) => {
      if (markup.includes('data-vc-linear-trim-polygon="true"')) {
        return markup;
      }

      const trimColor = getTrimColor(trimSections, Number(sourceValueId));
      if (!trimColor) {
        return markup;
      }
      const linearTrimColor = darkenTrimColor(trimColor);

      const visibility = markup.match(
        /display:(__VC_VISIBILITY_\d+__)(!important)?;?/,
      );
      const visibilityStyle = visibility
        ? ` style="display:${visibility[1]}${visibility[2] ?? ""};"`
        : "";
      const cleanMarkup = visibility ? markup.replace(visibility[0], "") : markup;
      const commonStyle =
        "fill:none!important;vector-effect:non-scaling-stroke;stroke-linecap:round!important;stroke-linejoin:round!important;";
      const main = appendInlineSvgStyle(
        replaceLinearTrimStrokeToken(cleanMarkup, linearTrimColor),
        `${commonStyle}stroke-width:${LINEAR_TRIM_MAIN_WIDTH}px!important;`,
      );
      const shadow = appendInlineSvgStyle(
        replaceLinearTrimStrokeToken(
          removeDuplicateSvgIdentity(cleanMarkup),
          LINEAR_TRIM_DARK_EDGE,
        ),
        `${commonStyle}stroke-width:${LINEAR_TRIM_SHADOW_WIDTH}px!important;stroke-opacity:0.9!important;`,
      );
      // Se eliminó highlight (línea blanca punteada stroke-dasharray:5 5) y weaveShadow (sombra punteada)
      // para quitar la textura blanca del vivo lineal (cord).
      return `<g data-vc-linear-trim-texture="cord"${visibilityStyle}>${shadow}${main}</g>`;
    },
  );
}

// La puntada blanca pertenecía a la textura eliminada; se retira el helper
// para que el runtime conserve únicamente el vivo poligonal sólido aprobado.
function addLinearTrimPolygonTexture(
  runtimeSvg: string,
  trimSections: VisualRuntimeTrimSection[],
) {
  const viewBox = runtimeSvg.match(
    /\bviewBox=(?:"[\d.+-]+[ ,]+[\d.+-]+[ ,]+([\d.+-]+)[ ,]+[\d.+-]+"|'[\d.+-]+[ ,]+[\d.+-]+[ ,]+([\d.+-]+)[ ,]+[\d.+-]+')/i,
  );
  const sourceWidth = Number(viewBox?.[1] ?? viewBox?.[2] ?? 1080);
  const patternSize = Math.max(8, sourceWidth / 105);
  const lightStroke = patternSize * 0.16;
  const darkStroke = patternSize * 0.11;
  const texturedPolygon =
    /<polygon\b[^>]*data-vc-linear-trim-polygon="true"[^>]*fill:__VC_TRIM_STROKE_(\d+)__[^>]*\/>/gi;
  let hasTexturedPolygon = false;
  const texturedSvg = runtimeSvg.replace(
    texturedPolygon,
    (markup, sourceValueId: string) => {
      const trimColor = getTrimColor(trimSections, Number(sourceValueId));
      if (!trimColor) {
        return markup;
      }
      const linearTrimColor = darkenTrimColor(trimColor);

      hasTexturedPolygon = true;
      const visibility = markup.match(
        /display:(__VC_VISIBILITY_\d+__)(!important)?;?/,
      );
      const visibilityStyle = visibility
        ? ` style="display:${visibility[1]}${visibility[2] ?? ""};"`
        : "";
      const cleanMarkup = visibility ? markup.replace(visibility[0], "") : markup;
      const shadow = appendInlineSvgStyle(
        replaceLinearTrimStrokeToken(
          removeDuplicateSvgIdentity(cleanMarkup).replace(
            /fill:__VC_TRIM_STROKE_\d+__(?:!important)?;?/g,
            "fill:none!important;",
          ),
          LINEAR_TRIM_DARK_EDGE,
        ),
        "vector-effect:non-scaling-stroke;stroke-width:11px!important;stroke-linejoin:round!important;stroke-opacity:0.82!important;",
      );
      const main = appendInlineSvgStyle(
        replaceLinearTrimStrokeToken(
          cleanMarkup.replace(
            /fill:__VC_TRIM_STROKE_\d+__(?:!important)?;?/g,
            `fill:${linearTrimColor}!important;`,
          ),
          linearTrimColor,
        ),
        "vector-effect:non-scaling-stroke;stroke-width:7px!important;stroke-linejoin:round!important;",
      );
      // No creamos las capas weave ni stitch: ambas introducían la textura
      // blanca que se retiró del vivo poligonal. Omitirlas evita variables
      // sin uso y conserva únicamente sombra + color sólido aprobados.
      return `<g data-vc-linear-trim-texture="woven"${visibilityStyle}>${shadow}${main}</g>`;
    },
  );

  if (!hasTexturedPolygon) {
    return texturedSvg;
  }

  const size = patternSize.toFixed(2);
  const half = (patternSize / 2).toFixed(2);
  const textureDefinition =
    `<defs data-vc-linear-trim-defs="true"><pattern id="vc-linear-trim-weave" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><path d="M0 ${size} L${size} 0" fill="none" stroke="#ffffff" stroke-width="${lightStroke.toFixed(2)}" opacity="0.95"/><path d="M0 0 L${size} ${size}" fill="none" stroke="${LINEAR_TRIM_DARK_EDGE}" stroke-width="${darkStroke.toFixed(2)}" opacity="0.82"/><circle cx="${half}" cy="${half}" r="${(patternSize * 0.08).toFixed(2)}" fill="#ffffff" opacity="0.9"/></pattern></defs>`;

  return texturedSvg.replace(/<svg\b[^>]*>/i, (svgTag) => `${svgTag}${textureDefinition}`);
}

function getTrimColor(
  trimSections: VisualRuntimeTrimSection[],
  sourceValueId: number,
) {
  return trimSections.find(
    (section) =>
      section.sourceValueId === sourceValueId ||
      section.valueId === sourceValueId,
  )?.colorHex;
}

function darkenTrimColor(colorHex: string) {
  const normalized = colorHex.trim().match(/^#([0-9a-f]{6})$/i);
  if (!normalized?.[1]) {
    return colorHex;
  }

  const channels = normalized[1].match(/.{2}/g) ?? [];
  const darkened = channels
    .map((channel) =>
      Math.round(Number.parseInt(channel, 16) * LINEAR_TRIM_COLOR_FACTOR)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

  return `#${darkened}`;
}

export function getSelectedVisualDefinitions(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
  manifestKey: string,
) {
  return (session.visualDefinitions ?? []).filter(
    (definition) =>
      definition.binding.productTemplateIds.includes(
        session.productTemplateId,
      ) &&
      isSlotSupportedByManifest(definition.slot, manifestKey) &&
      isBindingSelected(definition, session, selectedValueIds) &&
      areActivationConditionsSelected(
        definition.activationConditions,
        session,
        selectedValueIds,
      ),
  ).sort((left, right) => {
    const layerOrder = {
      structure: 0,
      component: 1,
      detail: 2,
      accent: 3,
    } as const;

    return (
      layerOrder[left.layer] - layerOrder[right.layer] ||
      left.displayName.localeCompare(right.displayName, "es") ||
      left.id.localeCompare(right.id)
    );
  });
}

export function getVisualElementVisibilityToken(index: number) {
  return `__VC_VISIBILITY_${index}__`;
}

export function materializeVisualDefinitionSvg(
  definition: ActiveVisualDefinition,
  baseColorHex: string,
  trimSections: VisualRuntimeTrimSection[],
  context?: {
    session: ConfiguratorSession;
    selectedValueIds: Record<string, number[]>;
  },
) {
  let runtimeSvg = normalizeThinPolygonVisualStrokes(
    normalizeUnfilledTrimAreas(normalizeImpossibleLinePaints(definition.runtimeSvg)),
  );

  if (definition.slot === "neck") {
    runtimeSvg = normalizeNeckVectorStrokeWidths(runtimeSvg);
    // Esta regla es exclusiva de cuellos dinámicos: los demás componentes
    // pueden tener áreas vacías intencionales y no deben recibir color base.
    runtimeSvg = applyBaseColorToUnselectedSafeTrimFills(
      runtimeSvg,
      baseColorHex,
      trimSections,
    );
  }

  runtimeSvg = addLinearTrimPolygonTexture(runtimeSvg, trimSections);
  runtimeSvg = addLinearTrimTexture(runtimeSvg, trimSections);

  definition.selectedElementIds.forEach((elementId, index) => {
    const conditions =
      definition.elementPaints[elementId]?.visibilityConditions ?? [];
    const isVisible =
      conditions.length === 0 ||
      (context
        ? areActivationConditionsSelected(
            conditions,
            context.session,
            context.selectedValueIds,
          )
        : true);
    runtimeSvg = runtimeSvg.replaceAll(
      getVisualElementVisibilityToken(index),
      isVisible ? "inline" : "none",
    );
  });

  const svg = replaceTrimColorTokens(
    runtimeSvg
      .replaceAll("__VC_BASE_COLOR__", baseColorHex)
      .replaceAll("__VC_OUTLINE_COLOR__", "#111827"),
    trimSections,
    replacesBaseSilhouette(definition),
  );

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function materializeSelectedVisualDefinitions(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
  manifestKey: string,
  baseColorHex: string,
  trimSections: VisualRuntimeTrimSection[],
): MaterializedVisualDefinition[] {
  return getSelectedVisualDefinitions(
    session,
    selectedValueIds,
    manifestKey,
  ).map((definition) => ({
    definitionId: definition.id,
    slot: definition.slot,
    replacesBaseSilhouette: replacesBaseSilhouette(definition),
    svgDataUri: materializeVisualDefinitionSvg(
      definition,
      baseColorHex,
      trimSections,
      { session, selectedValueIds },
    ),
  }));
}
