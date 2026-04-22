import {
  getVisualAssetPath,
  resolveVisualAssetCatalog,
  visualAssetCatalogs,
  type VisualAssetCatalog,
} from "@repo/shared/visual-assets";

export type ProductAssetCatalog = VisualAssetCatalog;

export const productAssetCatalogs = Object.fromEntries(
  visualAssetCatalogs.map((catalog) => [catalog.productKey, catalog]),
);

export function getProductAssetCatalog(graphicManifestKey: string) {
  return resolveVisualAssetCatalog(graphicManifestKey);
}

export function getImageSourceByIds(
  graphicManifestKey: string,
  attributeId: number,
  valueId: number,
) {
  const path = getVisualAssetPath(graphicManifestKey, attributeId, valueId);
  return path ? `/${path}` : undefined;
}
