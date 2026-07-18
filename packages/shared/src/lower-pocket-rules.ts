import type { ConfiguratorSession } from "./schemas/configurator.js";
import {
  matchesVisualAssetAttributeId,
  resolveVisualAssetCatalog,
} from "./visual-assets.js";
import {
  CONFIGURATOR_VALUE_IDS,
  hasSourceValueId,
} from "./configurator-id-rules.js";

export type LowerPocketLayout = "none" | "single" | "double";
export type LowerPocketAuxiliaryAddonSide = "left" | "right" | "both";
export type LowerPocketAuxiliaryAddonKind = "lizo" | "overlaid" | "velcro";
export type LowerPocketAuxiliaryAddon = {
  kind: LowerPocketAuxiliaryAddonKind;
  side: LowerPocketAuxiliaryAddonSide;
};

type Attribute = ConfiguratorSession["attributes"][number];
type AttributeValue = Attribute["values"][number];
type SelectedValueIds = Record<string, number[]>;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function getSelectedValue(
  attribute: Attribute | undefined,
  selectedValueIds: SelectedValueIds,
) {
  if (!attribute) {
    return undefined;
  }

  const selectedIds = new Set(selectedValueIds[String(attribute.id)] ?? []);
  return attribute.values.find((value) => selectedIds.has(value.id));
}

function findAttributeByName(
  session: ConfiguratorSession,
  matcher: (normalizedName: string) => boolean,
) {
  return session.attributes.find((attribute) => matcher(normalize(attribute.name)));
}

export function getLowerPocketTypeAttribute(session: ConfiguratorSession) {
  const catalog = resolveVisualAssetCatalog(session.graphicManifestKey);

  return (
    session.attributes.find(
      (attribute) =>
        catalog
          ? matchesVisualAssetAttributeId(catalog, "lowerPocketType", attribute.id)
          : false,
    ) ??
    findAttributeByName(session, (name) =>
      name.includes("tipo de bolsillos inferiores"),
    )
  );
}

export function getLowerPocketModelAttribute(session: ConfiguratorSession) {
  const catalog = resolveVisualAssetCatalog(session.graphicManifestKey);

  return (
    session.attributes.find(
      (attribute) =>
        catalog
          ? matchesVisualAssetAttributeId(catalog, "lowerPocketModel", attribute.id)
          : false,
    ) ??
    findAttributeByName(session, (name) =>
      name.includes("modelo bolsillo inferior") ||
      (name.includes("bolsillo inferior") && !name.includes("tipo")),
    )
  );
}

function isNoneLowerPocketType(
  session: ConfiguratorSession,
  value: AttributeValue | undefined,
) {
  const catalog = resolveVisualAssetCatalog(session.graphicManifestKey);

  if (!value) {
    return false;
  }

  if (
    catalog?.lowerPocketTypeValueIds?.none.some(
      (id) => id === value.id || id === value.sourceValueId,
    )
  ) {
    return true;
  }

  return normalize(value.name).includes("sin bolsillo");
}

export function getLowerPocketAuxiliaryAddon(
  value: Pick<AttributeValue, "name" | "sourceValueId"> | string | undefined,
): LowerPocketAuxiliaryAddon | undefined {
  const sourceBackedValue = typeof value === "string" ? undefined : value;

  if (hasSourceValueId(sourceBackedValue, CONFIGURATOR_VALUE_IDS.lowerPocketAuxiliary.lizoBoth)) return { kind: "lizo", side: "both" };
  if (hasSourceValueId(sourceBackedValue, CONFIGURATOR_VALUE_IDS.lowerPocketAuxiliary.lizoLeft)) return { kind: "lizo", side: "left" };
  if (hasSourceValueId(sourceBackedValue, CONFIGURATOR_VALUE_IDS.lowerPocketAuxiliary.lizoRight)) return { kind: "lizo", side: "right" };
  if (hasSourceValueId(sourceBackedValue, CONFIGURATOR_VALUE_IDS.lowerPocketAuxiliary.velcroBoth)) return { kind: "velcro", side: "both" };
  if (hasSourceValueId(sourceBackedValue, CONFIGURATOR_VALUE_IDS.lowerPocketAuxiliary.velcroLeft)) return { kind: "velcro", side: "left" };
  if (hasSourceValueId(sourceBackedValue, CONFIGURATOR_VALUE_IDS.lowerPocketAuxiliary.velcroRight)) return { kind: "velcro", side: "right" };
  if (hasSourceValueId(sourceBackedValue, CONFIGURATOR_VALUE_IDS.lowerPocketAuxiliary.overlaidBoth)) return { kind: "overlaid", side: "both" };
  if (hasSourceValueId(sourceBackedValue, CONFIGURATOR_VALUE_IDS.lowerPocketAuxiliary.overlaidLeft)) return { kind: "overlaid", side: "left" };
  if (hasSourceValueId(sourceBackedValue, CONFIGURATOR_VALUE_IDS.lowerPocketAuxiliary.overlaidRight)) return { kind: "overlaid", side: "right" };

  const name = normalize(typeof value === "string" ? value : value?.name ?? "");
  const kind = name.includes("lizo")
    ? "lizo"
    : name.includes("sobrepuesto")
      ? "overlaid"
      : name.includes("velcro")
        ? "velcro"
      : undefined;

  if (!kind) {
    return undefined;
  }

  if (name.includes("doble")) {
    return { kind, side: "both" };
  }

  if (name.includes("izquierd")) {
    return { kind, side: "left" };
  }

  if (name.includes("derech")) {
    return { kind, side: "right" };
  }

  return undefined;
}

export function getLowerPocketAuxiliaryAddonSide(
  value: Pick<AttributeValue, "name" | "sourceValueId"> | string | undefined,
): LowerPocketAuxiliaryAddonSide | undefined {
  return getLowerPocketAuxiliaryAddon(value)?.side;
}

function findNoneLowerPocketModelValue(
  session: ConfiguratorSession,
  modelAttribute: Attribute | undefined,
) {
  const catalog = resolveVisualAssetCatalog(session.graphicManifestKey);
  const configuredIds = new Set(catalog?.lowerPocketModelNoneValueIds ?? []);

  return modelAttribute?.values.find(
    (value) =>
      configuredIds.has(value.id) ||
      (value.sourceValueId !== undefined && configuredIds.has(value.sourceValueId)) ||
      normalize(value.name).includes("ninguno") ||
      normalize(value.name).includes("sin modelo"),
  );
}

export function getLowerPocketLayout(
  session: ConfiguratorSession,
  selectedValueIds: SelectedValueIds,
): LowerPocketLayout {
  const typeAttribute = getLowerPocketTypeAttribute(session);
  const selectedType = getSelectedValue(typeAttribute, selectedValueIds);

  if (isNoneLowerPocketType(session, selectedType)) {
    return "none";
  }

  return "double";
}

export function normalizeLowerPocketSelectionsForSave(
  session: ConfiguratorSession,
  selectedValueIds: SelectedValueIds,
): SelectedValueIds {
  const layout = getLowerPocketLayout(session, selectedValueIds);

  if (layout !== "none") {
    return selectedValueIds;
  }

  const modelAttribute = getLowerPocketModelAttribute(session);

  if (!modelAttribute) {
    return selectedValueIds;
  }

  const noneValue = findNoneLowerPocketModelValue(session, modelAttribute);

  return {
    ...selectedValueIds,
    [String(modelAttribute.id)]: noneValue ? [noneValue.id] : [],
  };
}
