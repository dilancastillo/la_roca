import {
  getDefaultChestPocketAssetPath,
  getDefaultVisualAssetPath,
  getVisualBootAssetPathForValue,
  getVisualGarmentDetailAssetPathForValue,
  getVisualWaistbandAssetPathForValue,
  getVisualAssetPath,
  getVisualAssetPathForValue,
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

export function getImageSourceForValue(
  graphicManifestKey: string,
  attributeId: number,
  valueId: number,
  attributeName?: string,
  valueName?: string,
) {
  const path = getVisualAssetPathForValue(
    graphicManifestKey,
    attributeId,
    valueId,
    attributeName,
    valueName,
  );

  return path ? `/${path}` : undefined;
}

export function getGarmentDetailImageSourceForValue(
  graphicManifestKey: string,
  attributeId: number,
  valueId: number,
  attributeName?: string,
  valueName?: string,
) {
  const path = getVisualGarmentDetailAssetPathForValue(
    graphicManifestKey,
    attributeId,
    valueId,
    attributeName,
    valueName,
  );

  return path ? `/${path}` : undefined;
}

export function getBootImageSourceForValue(
  graphicManifestKey: string,
  attributeId: number,
  valueId: number,
  attributeName?: string,
  valueName?: string,
) {
  const path = getVisualBootAssetPathForValue(
    graphicManifestKey,
    attributeId,
    valueId,
    attributeName,
    valueName,
  );

  return path ? `/${path}` : undefined;
}

export function getWaistbandImageSourceForValue(
  graphicManifestKey: string,
  attributeId: number,
  valueId: number,
  attributeName?: string,
  valueName?: string,
) {
  const path = getVisualWaistbandAssetPathForValue(
    graphicManifestKey,
    attributeId,
    valueId,
    attributeName,
    valueName,
  );

  return path ? `/${path}` : undefined;
}

export function getDefaultImageSource(graphicManifestKey: string) {
  const path = getDefaultVisualAssetPath(graphicManifestKey);
  return path ? `/${path}` : undefined;
}

export function getDefaultChestPocketImageSource(graphicManifestKey: string) {
  const path = getDefaultChestPocketAssetPath(graphicManifestKey);
  return path ? `/${path}` : undefined;
}
