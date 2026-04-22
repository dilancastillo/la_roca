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
  const assetsByValueId =
    family === "necks"
      ? catalog.neckModelsByValueId
      : family === "auxiliaryPocketModels"
        ? catalog.auxiliaryPocketModelsByValueId
        : catalog.lowerPocketModelsByValueId;

  return Object.entries(assetsByValueId)
    .map(([valueId, src]) => ({
      label: buildAssetOptionLabel(Number(valueId), src),
      src: src.startsWith("/") ? src : `/${src}`,
    }))
    .sort((left, right) => left.label.localeCompare(right.label, "es"));
}

function buildAssetOptionLabel(valueId: number, src: string) {
  const match = src.match(/blouse-model-(\d+)/);
  const modelLabel = match?.[1] ? `Modelo ${Number(match[1])}` : "Asset";
  return `${modelLabel} · ID ${valueId}`;
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
