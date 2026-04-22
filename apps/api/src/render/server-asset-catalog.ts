import {
  getVisualAssetPath,
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
