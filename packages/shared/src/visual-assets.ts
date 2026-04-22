export type VisualAssetCatalog = {
  productKey: string;
  aliases: string[];
  attributeIds: {
    neckModel: number;
    lowerPocketModel: number;
    auxiliaryPocketModel?: number;
    baseColor: number;
    trimColor: number;
    trimSections: number;
  };
  trimSectionValueIds: {
    backNeck: number;
    upperNeck: number;
    lowerNeck: number;
    chestPocket: number;
    lowerPockets: number;
    auxiliaryPocket: number;
    none: number;
  };
  neckModelsByValueId: Record<number, string>;
  lowerPocketModelsByValueId: Record<number, string>;
  auxiliaryPocketModelsByValueId: Record<number, string>;
};

const BLUSA_ASSET_BASE = "assets/catalog/blusa-antifluido-t180/svg-clean";

function blouseModelAsset(index: number) {
  return `${BLUSA_ASSET_BASE}/blouse-model-${String(index).padStart(2, "0")}.svg`;
}

export const blusaAntifluidoT180VisualCatalog: VisualAssetCatalog = {
  productKey: "blusa-antifluido-t180",
  aliases: [
    "blusa-antifluido-t180-24263",
    "blusa-antifluido-t180-24263-140957-amarillo-intenso-hombre",
  ],
  attributeIds: {
    neckModel: 63,
    lowerPocketModel: 70,
    baseColor: 90,
    trimColor: 91,
    trimSections: 92,
  },
  trimSectionValueIds: {
    backNeck: 5146,
    upperNeck: 5147,
    lowerNeck: 5148,
    chestPocket: 5149,
    lowerPockets: 5150,
    auxiliaryPocket: 5151,
    none: 5423,
  },
  neckModelsByValueId: {
    2590: blouseModelAsset(1), // CUELLO V, inferido desde el valor actual de Odoo.
    2592: blouseModelAsset(3), // PUNTAS, confirmado por usuario.
    2593: blouseModelAsset(10), // 2019, confirmado por usuario.
    2599: blouseModelAsset(9), // PRESILLA OVALO, confirmado por usuario.
    2601: blouseModelAsset(8), // CUELLO ALTO, confirmado por usuario.
    2602: blouseModelAsset(7), // Modelo 13, confirmado por usuario.
  },
  lowerPocketModelsByValueId: {
    // Los SVG disponibles para bolsillos inferiores son Modelo 14, 15, 16, 18, 19 y 20.
    2578: blouseModelAsset(14),
    2579: blouseModelAsset(15),
    2580: blouseModelAsset(16),
    2581: blouseModelAsset(18),
    2582: blouseModelAsset(19),
    2583: blouseModelAsset(20),
  },
  auxiliaryPocketModelsByValueId: {},
};

export const visualAssetCatalogs: VisualAssetCatalog[] = [
  blusaAntifluidoT180VisualCatalog,
];

function normalizeCatalogKey(value: string) {
  return value.trim().toLowerCase();
}

export function resolveVisualAssetCatalog(
  graphicManifestKey: string,
): VisualAssetCatalog | undefined {
  const normalizedKey = normalizeCatalogKey(graphicManifestKey);

  return visualAssetCatalogs.find((catalog) => {
    const keys = [catalog.productKey, ...catalog.aliases].map(normalizeCatalogKey);

    return (
      keys.includes(normalizedKey) ||
      keys.some(
        (key) =>
          key.startsWith(`${normalizedKey}-`) ||
          normalizedKey.startsWith(`${key}-`),
      )
    );
  });
}

export function getVisualAssetPath(
  graphicManifestKey: string,
  attributeId: number,
  valueId: number,
) {
  const catalog = resolveVisualAssetCatalog(graphicManifestKey);

  if (!catalog) {
    return undefined;
  }

  if (attributeId === catalog.attributeIds.neckModel) {
    return catalog.neckModelsByValueId[valueId];
  }

  if (attributeId === catalog.attributeIds.lowerPocketModel) {
    return catalog.lowerPocketModelsByValueId[valueId];
  }

  if (attributeId === catalog.attributeIds.auxiliaryPocketModel) {
    return catalog.auxiliaryPocketModelsByValueId[valueId];
  }

  return undefined;
}
