export type ProductAssetCatalog = {
  necks: Record<string, string>;
  lowerPocketModels: Record<string, string>;
  auxiliaryPocketModels: Record<string, string>;
};

function buildIndexedAssetMap(
  prefix: string,
  count: number,
  pathBuilder: (index: number) => string,
) {
  return Object.fromEntries(
    Array.from({ length: count }, (_, index) => {
      const label = `${prefix} ${index + 1}`;
      return [label, pathBuilder(index + 1)];
    }),
  );
}

const blusaAntifluidoAssets: ProductAssetCatalog = {
  necks: buildIndexedAssetMap(
    "Modelo",
    18,
    (index) =>
      `/assets/catalog/blusa-antifluido-t180-24263/necks/neck-model-${String(index).padStart(2, "0")}.png`,
  ),
  lowerPocketModels: buildIndexedAssetMap(
    "Modelo",
    12,
    (index) =>
      `/assets/catalog/blusa-antifluido-t180-24263/lower-pockets/lower-pocket-model-${String(index).padStart(2, "0")}.png`,
  ),
  auxiliaryPocketModels: buildIndexedAssetMap(
    "Modelo",
    12,
    (index) =>
      `/assets/catalog/blusa-antifluido-t180-24263/lower-pockets/lower-pocket-model-${String(index).padStart(2, "0")}.png`,
  ),
};

export const productAssetCatalogs: Record<string, ProductAssetCatalog> = {
  "blusa-antifluido-t180-24263": blusaAntifluidoAssets,
};

export function getProductAssetCatalog(graphicManifestKey: string) {
  return productAssetCatalogs[graphicManifestKey];
}
