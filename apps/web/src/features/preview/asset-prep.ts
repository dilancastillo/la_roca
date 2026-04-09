import type { ProductAssetCatalog } from "../configurator/lib/asset-catalog";

export type AssetFamily = "lowerPocketModels" | "auxiliaryPocketModels";
export type OverlayPresetKey = "lowerPocketPair" | "auxiliaryPocketPair";

export function getDefaultPresetForFamily(family: AssetFamily): OverlayPresetKey {
  return family === "auxiliaryPocketModels"
    ? "auxiliaryPocketPair"
    : "lowerPocketPair";
}

export function getAssetEntries(
  catalog: ProductAssetCatalog,
  family: "necks" | AssetFamily,
) {
  return Object.entries(catalog[family])
    .map(([label, src]) => ({ label, src }))
    .sort((left, right) => left.label.localeCompare(right.label, "es"));
}

export function slugifyAssetLabel(label: string) {
  return label
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildPreparedOverlayFilename(
  productKey: string,
  family: AssetFamily,
  assetLabel: string,
) {
  const familySlug =
    family === "auxiliaryPocketModels" ? "auxiliary-pocket" : "lower-pocket";

  return `${productKey}-${familySlug}-${slugifyAssetLabel(assetLabel)}-overlay.png`;
}
