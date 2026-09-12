import type { ConfiguratorSession } from "./schemas/configurator.js";
import type {
  ActiveVisualDefinition,
  VisualActivationCondition,
  VisualSlot,
} from "./schemas/visual-catalog.js";
import { getLowerPocketAuxiliaryAddon } from "./lower-pocket-rules.js";

export type VisualRuntimeTrimSection = {
  valueId: number;
  sourceValueId?: number | undefined;
  colorHex: string;
};

export type MaterializedVisualDefinition = {
  definitionId: string;
  slot: VisualSlot;
  svgDataUri: string;
};

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

function isDoubleAuxiliarySelectionForSideCondition(
  condition: VisualActivationCondition,
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const attribute = session.attributes.find(
    (candidate) => candidate.id === condition.attributeId,
  );

  if (!attribute) {
    return false;
  }

  const selectedIds = new Set(
    selectedValueIds[String(condition.attributeId)] ?? [],
  );
  const selectedAddons = attribute.values
    .filter(
      (value) =>
        selectedIds.has(value.id) ||
        (value.sourceValueId !== undefined &&
          selectedIds.has(value.sourceValueId)),
    )
    .flatMap((value) => {
      const addon = getLowerPocketAuxiliaryAddon(value);
      return addon?.side === "both" ? [addon] : [];
    });
  const allowedAddons = attribute.values
    .filter((value) =>
      condition.sourceValueIds.includes(value.sourceValueId ?? value.id),
    )
    .flatMap((value) => {
      const addon = getLowerPocketAuxiliaryAddon(value);
      return addon ? [addon] : [];
    });

  return selectedAddons.some((selectedAddon) =>
    allowedAddons.some(
      (allowedAddon) => allowedAddon.kind === selectedAddon.kind,
    ),
  );
}

function areActivationConditionsSelected(
  conditions: VisualActivationCondition[],
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const sourceValueIdsByAttribute = new Map<number, Set<number>>();

  for (const condition of conditions) {
    const sourceValueIds =
      sourceValueIdsByAttribute.get(condition.attributeId) ?? new Set<number>();

    condition.sourceValueIds.forEach((sourceValueId) =>
      sourceValueIds.add(sourceValueId),
    );
    sourceValueIdsByAttribute.set(condition.attributeId, sourceValueIds);
  }

  return Array.from(sourceValueIdsByAttribute).every(
    ([attributeId, allowedSourceValueIds]) => {
      const selectedSourceIds = getSelectedSourceValueIds(
        session,
        selectedValueIds,
        attributeId,
      );

      return (
        Array.from(allowedSourceValueIds).some((sourceValueId) =>
          selectedSourceIds.has(sourceValueId),
        ) ||
        conditions
          .filter((condition) => condition.attributeId === attributeId)
          .some((condition) =>
            isDoubleAuxiliarySelectionForSideCondition(
              condition,
              session,
              selectedValueIds,
            ),
          )
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
        getTrimColor(trimSections, Number(sourceValueId)) ?? "none",
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
    const points = polygonMarkup.match(/\bpoints=(?:"([^"]*)"|'([^']*)')/i);

    if (!isThinVisualPolygonPoints(points?.[1] ?? points?.[2])) {
      return polygonMarkup;
    }

    return polygonMarkup.replace(
      /stroke:(__VC_TRIM_STROKE_\d+__)(!important)?;?/g,
      (_declaration, token: string, important: string | undefined) =>
        `fill:${token}${important ?? ""};`,
    );
  });
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
    normalizeImpossibleLinePaints(definition.runtimeSvg),
  );

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
    svgDataUri: materializeVisualDefinitionSvg(
      definition,
      baseColorHex,
      trimSections,
      { session, selectedValueIds },
    ),
  }));
}
