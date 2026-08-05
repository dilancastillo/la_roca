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

function areActivationConditionsSelected(
  conditions: VisualActivationCondition[],
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  return conditions.every((condition) => {
    const selectedSourceIds = getSelectedSourceValueIds(
      session,
      selectedValueIds,
      condition.attributeId,
    );

    return condition.sourceValueIds.some((sourceValueId) =>
      selectedSourceIds.has(sourceValueId),
    );
  });
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
  let runtimeSvg = definition.runtimeSvg;

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
