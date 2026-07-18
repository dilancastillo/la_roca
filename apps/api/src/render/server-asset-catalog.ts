import {
  getDefaultChestPocketAssetPath,
  getDefaultVisualAssetPath,
  getVisualBootAssetPathForValue,
  getVisualGarmentDetailAssetPathForValue,
  getVisualWaistbandAssetPathForValue,
  getVisualAssetPath,
  getVisualAssetPathForValue,
  resolveVisualAssetCatalog,
  type VisualAssetCatalog,
} from "@repo/shared/visual-assets";

export type ServerProductAssetCatalog = VisualAssetCatalog;

export function getServerProductAssetCatalog(graphicManifestKey: string) {
  return resolveVisualAssetCatalog(graphicManifestKey);
}

export function getServerAssetPathByIds(
  graphicManifestKey: string,
  attributeId: number,
  valueId: number,
) {
  return getVisualAssetPath(graphicManifestKey, attributeId, valueId);
}

export function getServerAssetPathForValue(
  graphicManifestKey: string,
  attributeId: number,
  valueId: number,
  attributeName?: string,
  valueName?: string,
  sourceValueId?: number,
) {
  return getVisualAssetPathForValue(
    graphicManifestKey,
    attributeId,
    valueId,
    attributeName,
    valueName,
    sourceValueId,
  );
}

export function getServerGarmentDetailAssetPathForValue(
  graphicManifestKey: string,
  attributeId: number,
  valueId: number,
  attributeName?: string,
  valueName?: string,
  sourceValueId?: number,
) {
  return getVisualGarmentDetailAssetPathForValue(
    graphicManifestKey,
    attributeId,
    valueId,
    attributeName,
    valueName,
    sourceValueId,
  );
}

export function getServerBootAssetPathForValue(
  graphicManifestKey: string,
  attributeId: number,
  valueId: number,
  attributeName?: string,
  valueName?: string,
  sourceValueId?: number,
) {
  return getVisualBootAssetPathForValue(
    graphicManifestKey,
    attributeId,
    valueId,
    attributeName,
    valueName,
    sourceValueId,
  );
}

export function getServerWaistbandAssetPathForValue(
  graphicManifestKey: string,
  attributeId: number,
  valueId: number,
  attributeName?: string,
  valueName?: string,
  sourceValueId?: number,
) {
  return getVisualWaistbandAssetPathForValue(
    graphicManifestKey,
    attributeId,
    valueId,
    attributeName,
    valueName,
    sourceValueId,
  );
}

export function getServerDefaultAssetPath(graphicManifestKey: string) {
  return getDefaultVisualAssetPath(graphicManifestKey);
}

export function getServerDefaultChestPocketAssetPath(graphicManifestKey: string) {
  return getDefaultChestPocketAssetPath(graphicManifestKey);
}
