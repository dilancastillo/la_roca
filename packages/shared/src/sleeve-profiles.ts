/**
 * Identidad estable de la geometría de mangas de una blusa.
 *
 * Un SVG materializado por el editor puede ser un data URI y cambiar en cada
 * edición del cuello. Ese SVG describe el arte que se ve, pero nunca debe
 * convertirse en la referencia geométrica de los vivos. Los renderizadores
 * deben resolver este id a partir del activo de catálogo que lo ancla.
 */
export type SleeveProfileId = `asset:${string}`;

function getFileName(assetPath: string | undefined) {
  if (!assetPath || assetPath.startsWith("data:")) {
    return undefined;
  }

  const withoutQuery = assetPath.split(/[?#]/, 1)[0] ?? "";
  const slashIndex = Math.max(
    withoutQuery.lastIndexOf("/"),
    withoutQuery.lastIndexOf("\\"),
  );
  const fileName = withoutQuery.slice(slashIndex + 1).trim().toLowerCase();

  return fileName.endsWith(".svg") ? fileName : undefined;
}

/**
 * Resuelve el perfil desde el activo estático del cuello. `anchorAssetPath`
 * siempre prevalece sobre la silueta de colocación: esta última puede ser un
 * SVG dinámico editado y no tiene una geometría de manga confiable.
 */
export function resolveSleeveProfileId(
  anchorAssetPath: string | undefined,
  placementAssetPath?: string,
): SleeveProfileId | undefined {
  const fileName = getFileName(anchorAssetPath) ?? getFileName(placementAssetPath);

  return fileName ? `asset:${fileName}` : undefined;
}

/** Exportado para validaciones y futuras herramientas de calibración visual. */
export function getSleeveProfileFileName(
  profileId: SleeveProfileId | undefined,
) {
  return profileId?.slice("asset:".length);
}
