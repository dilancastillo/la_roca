import type { ConfiguratorSession } from "./schemas/configurator.js";
import { resolveVisualAssetCatalog } from "./visual-assets.js";

export type LowerPocketLayout = "none" | "single" | "double";

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
      (attribute) => attribute.id === catalog?.attributeIds.lowerPocketType,
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
      (attribute) => attribute.id === catalog?.attributeIds.lowerPocketModel,
    ) ??
    findAttributeByName(session, (name) =>
      name.includes("modelo bolsillo inferior"),
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

  if (catalog?.lowerPocketTypeValueIds?.none.includes(value.id)) {
    return true;
  }

  return normalize(value.name).includes("sin bolsillo");
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
