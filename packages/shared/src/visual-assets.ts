export type VisualAssetCatalog = {
  productKey: string;
  aliases: string[];
  attributeIds: {
    garmentModel?: number;
    neckModel?: number;
    lowerPocketType?: number;
    lowerPocketModel?: number;
    chestPocketModel?: number;
    auxiliaryPocketModel?: number;
    baseColor: number;
    trimColor?: number;
    trimSections?: number;
  };
  attributeIdAliases?: Partial<
    Record<keyof VisualAssetCatalog["attributeIds"], number[]>
  >;
  trimSectionValueIds?: {
    backNeck: number;
    upperNeck: number;
    lowerNeck: number;
    chestPocket: number;
    lowerPockets: number;
    auxiliaryPocket: number;
    none: number;
  };
  lowerPocketTypeValueIds?: {
    none: number[];
    double: number[];
  };
  lowerPocketModelNoneValueIds?: number[];
  defaultGarmentAsset?: string;
  defaultChestPocketModelAsset?: string;
  garmentModelsByValueId?: Record<number, string>;
  neckModelsByValueId?: Record<number, string>;
  lowerPocketModelsByValueId?: Record<number, string>;
  chestPocketModelsByValueId?: Record<number, string>;
  auxiliaryPocketModelsByValueId?: Record<number, string>;
  garmentModelsByValueName?: Record<string, string>;
  neckModelsByValueName?: Record<string, string>;
  lowerPocketModelsByValueName?: Record<string, string>;
  chestPocketModelsByValueName?: Record<string, string>;
  auxiliaryPocketModelsByValueName?: Record<string, string>;
};

const BLUSA_ASSET_BASE = "assets/catalog/blusa-antifluido-t180/svg-clean";
const BLUSA_DETAIL_OVERLAY_BASE =
  "assets/catalog/blusa-antifluido-t180/detail-overlays";
const PANTALON_ASSET_BASE = "assets/catalog/pantalon/svg-clean";
const BLUSA_CHEROKEE_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-12-cherokee.svg`;
const BLUSA_EL_HATO_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-39-el-hato.svg`;
const BLUSA_EL_HATO_LOWER_POCKET_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-39-el-hato-lower-pocket.svg`;
const BLUSA_FISIOPRACTICAS_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-11-fisiopracticas.svg`;
const BLUSA_P_PAIPILLA_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-13-p-paipilla.svg`;

function blouseModelAsset(index: number) {
  return `${BLUSA_ASSET_BASE}/blouse-model-${String(index).padStart(2, "0")}.svg`;
}

function pantsModelAsset(index: number) {
  return `${PANTALON_ASSET_BASE}/pants-model-${String(index).padStart(2, "0")}.svg`;
}

function normalizeLookupKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ");
}

function findByNormalizedName(
  map: Record<string, string> | undefined,
  valueName: string | undefined,
) {
  if (!map || !valueName) {
    return undefined;
  }

  const normalizedValue = normalizeLookupKey(valueName);
  const entries = Object.entries(map).map(([key, path]) => [
    normalizeLookupKey(key),
    path,
  ] as const);

  return (
    entries.find(([key]) => key === normalizedValue)?.[1] ??
    entries.find(
      ([key]) => normalizedValue.includes(key) || key.includes(normalizedValue),
    )?.[1]
  );
}

function isNeckModelAttribute(attributeName: string | undefined) {
  const normalized = normalizeLookupKey(attributeName ?? "");

  return normalized.includes("modelo de cuello");
}

function isGarmentModelAttribute(attributeName: string | undefined) {
  const normalized = normalizeLookupKey(attributeName ?? "");

  return (
    normalized.includes("modelo de blusa") ||
    normalized.includes("modelo blusa") ||
    normalized.includes("modelo de pantalon") ||
    normalized.includes("modelo pantalon") ||
    normalized.includes("modelo de prenda")
  );
}

function isLowerPocketModelAttribute(attributeName: string | undefined) {
  const normalized = normalizeLookupKey(attributeName ?? "");

  return (
    normalized.includes("modelo bolsillo inferior") ||
    (normalized.includes("bolsillo inferior") && !normalized.includes("tipo"))
  );
}

function isChestPocketModelAttribute(attributeName: string | undefined) {
  const normalized = normalizeLookupKey(attributeName ?? "");

  return (
    normalized.includes("modelo") &&
    normalized.includes("bolsillo") &&
    normalized.includes("pecho")
  );
}

function isAuxiliaryPocketModelAttribute(attributeName: string | undefined) {
  const normalized = normalizeLookupKey(attributeName ?? "");

  return normalized.includes("modelo bolsillo auxiliar");
}

export function matchesVisualAssetAttributeId(
  catalog: VisualAssetCatalog,
  key: keyof VisualAssetCatalog["attributeIds"],
  attributeId: number,
) {
  return (
    catalog.attributeIds[key] === attributeId ||
    Boolean(catalog.attributeIdAliases?.[key]?.includes(attributeId))
  );
}

export const blusaAntifluidoT180VisualCatalog: VisualAssetCatalog = {
  productKey: "blusa-antifluido-t180",
  aliases: [
    "blusa-antifluido-t180-24263",
    "blusa-antifluido-t180-24263-140957-amarillo-intenso-hombre",
  ],
  attributeIds: {
    garmentModel: 811,
    neckModel: 145,
    lowerPocketType: 155,
    lowerPocketModel: 154,
    chestPocketModel: 153,
    baseColor: 798,
    trimColor: 802,
    trimSections: 157,
  },
  attributeIdAliases: {
    neckModel: [63],
    lowerPocketType: [69],
    lowerPocketModel: [70],
    chestPocketModel: [102],
    baseColor: [90],
    trimColor: [91],
    trimSections: [92],
  },
  trimSectionValueIds: {
    backNeck: 414,
    upperNeck: 415,
    lowerNeck: 422,
    chestPocket: 418,
    lowerPockets: 419,
    auxiliaryPocket: 420,
    none: 413,
  },
  lowerPocketTypeValueIds: {
    none: [402, 5342],
    double: [393, 394, 395, 396, 397, 398, 399, 400, 401, 5354, 5366, 5378, 5390],
  },
  lowerPocketModelNoneValueIds: [392, 5425],
  defaultGarmentAsset: blouseModelAsset(1),
  defaultChestPocketModelAsset: `${BLUSA_DETAIL_OVERLAY_BASE}/chest-pocket-rectangular-v2.svg`,
  neckModelsByValueId: {
    // IDs historicos de product.template.attribute.value.
    2590: blouseModelAsset(1), // CUELLO V.
    2591: blouseModelAsset(3), // PRESILLAS. Antes estaba asociado a PUNTAS.
    2592: blouseModelAsset(22), // PUNTAS. Nuevo SVG entregado por el usuario.
    2593: blouseModelAsset(10), // 2019.
    2594: blouseModelAsset(30), // JDC - CRUZADO.
    2595: blouseModelAsset(42), // JEAN.
    2597: blouseModelAsset(43), // ENFERMERA.
    2599: blouseModelAsset(9), // PRESILLA OVALO.
    2601: blouseModelAsset(8), // CUELLO ALTO.
    2602: blouseModelAsset(7), // Modelo 13.
    // IDs actuales en pstest-traininglaroca para product_tmpl_id=5 (Blusa).
    334: blouseModelAsset(1), // CUELLO V.
    335: blouseModelAsset(3), // PRESILLAS.
    336: blouseModelAsset(22), // PUNTAS.
    337: blouseModelAsset(10), // 20-19.
    338: blouseModelAsset(30), // JDC.
    339: blouseModelAsset(42), // JEAN.
    341: blouseModelAsset(43), // ENFERMERA UB.
    343: blouseModelAsset(9), // OVALADO.
    345: blouseModelAsset(8), // CUELLO ALTO.
    346: blouseModelAsset(7), // PUNTADAS.
    352: blouseModelAsset(12), // MATRIOSKA.
    353: blouseModelAsset(13), // MARIPOSA.
    354: blouseModelAsset(20), // 20-20.
    2956: BLUSA_EL_HATO_ASSET, // EL HATO.
    2958: BLUSA_FISIOPRACTICAS_ASSET, // FISIOPRACTICAS.
    2960: BLUSA_P_PAIPILLA_ASSET, // P-PAIPILLA.
    2962: BLUSA_CHEROKEE_ASSET, // CHEROKEE.
  },
  neckModelsByValueName: {
    "cuello v": blouseModelAsset(1),
    presillas: blouseModelAsset(3),
    puntas: blouseModelAsset(22),
    "20 19": blouseModelAsset(10),
    "20-19": blouseModelAsset(10),
    "2019": blouseModelAsset(10),
    jdc: blouseModelAsset(30),
    "jdc cruzado": blouseModelAsset(30),
    cruzado: blouseModelAsset(30),
    jean: blouseModelAsset(42),
    enfermera: blouseModelAsset(43),
    "enfermera ub": blouseModelAsset(43),
    ovalado: blouseModelAsset(9),
    "presilla ovalo": blouseModelAsset(9),
    "cuello alto": blouseModelAsset(8),
    puntadas: blouseModelAsset(7),
    "modelo 13": blouseModelAsset(7),
    matrioska: blouseModelAsset(12),
    mariposa: blouseModelAsset(13),
    "20 20": blouseModelAsset(20),
    "20-20": blouseModelAsset(20),
    "2020": blouseModelAsset(20),
    "el hato": BLUSA_EL_HATO_ASSET,
    fisiopracticas: BLUSA_FISIOPRACTICAS_ASSET,
    "fisio practicas": BLUSA_FISIOPRACTICAS_ASSET,
    "p paipilla": BLUSA_P_PAIPILLA_ASSET,
    "p-paipilla": BLUSA_P_PAIPILLA_ASSET,
    cherokee: BLUSA_CHEROKEE_ASSET,
  },
  lowerPocketModelsByValueId: {
    // IDs historicos. Los SVG disponibles para bolsillos inferiores son Modelo 14, 15, 16, 18, 19 y 20.
    2578: blouseModelAsset(14),
    2579: blouseModelAsset(15),
    2580: blouseModelAsset(16),
    2581: blouseModelAsset(18),
    2582: blouseModelAsset(19),
    2583: blouseModelAsset(20),
    // IDs actuales en pstest-traininglaroca.
    380: blouseModelAsset(14), // RECTANGULAR.
    381: blouseModelAsset(15), // AROS.
    382: blouseModelAsset(16), // COSTURA.
    383: blouseModelAsset(18), // RIBETE.
    384: blouseModelAsset(19), // COSTURA MARIA.
    385: blouseModelAsset(20), // COSTURA TRIANGULO.
    386: blouseModelAsset(14), // BOLSILLO INTERNO RECTANGULAR.
    388: blouseModelAsset(18), // RIBETE VERTICAL.
    389: blouseModelAsset(18), // RIBETE HORIZONTAL.
    391: blouseModelAsset(16), // COSTURA OVALADO.
    2964: BLUSA_EL_HATO_LOWER_POCKET_ASSET, // BOLSILLO PRESILLAS en Uniforme.
    2965: BLUSA_EL_HATO_LOWER_POCKET_ASSET, // BOLSILLO PRESILLAS en Blusa.
  },
  lowerPocketModelsByValueName: {
    rectangular: blouseModelAsset(14),
    aros: blouseModelAsset(15),
    costura: blouseModelAsset(16),
    ribete: blouseModelAsset(18),
    "costura maria": blouseModelAsset(19),
    "costura triangulo": blouseModelAsset(20),
    "bolsillo interno rectangular": blouseModelAsset(14),
    "ribete vertical": blouseModelAsset(18),
    "ribete horizontal": blouseModelAsset(18),
    "costura ovalado": blouseModelAsset(16),
    "bolsillo presillas": BLUSA_EL_HATO_LOWER_POCKET_ASSET,
  },
  chestPocketModelsByValueId: {
    376: `${BLUSA_DETAIL_OVERLAY_BASE}/chest-pocket-rectangular-v2.svg`,
  },
  chestPocketModelsByValueName: {
    rectangular: `${BLUSA_DETAIL_OVERLAY_BASE}/chest-pocket-rectangular-v2.svg`,
    "cremallera externo": `${BLUSA_DETAIL_OVERLAY_BASE}/chest-pocket-rectangular-v2.svg`,
    punta: `${BLUSA_DETAIL_OVERLAY_BASE}/chest-pocket-rectangular-v2.svg`,
    "cremallera interno": `${BLUSA_DETAIL_OVERLAY_BASE}/chest-pocket-rectangular-v2.svg`,
    "cremallera punta": `${BLUSA_DETAIL_OVERLAY_BASE}/chest-pocket-rectangular-v2.svg`,
  },
  auxiliaryPocketModelsByValueId: {},
};

export const pantalonVisualCatalog: VisualAssetCatalog = {
  productKey: "pantalon",
  aliases: ["pantalon"],
  attributeIds: {
    garmentModel: 810,
    baseColor: 798,
    trimColor: 802,
    trimSections: 157,
  },
  attributeIdAliases: {
    baseColor: [90],
    trimColor: [91],
    trimSections: [92],
  },
  // El producto Pantalon aun no tiene un atributo unico de modelo. Mientras se
  // define el mapeo funcional, usamos el primer SVG como base limpia por defecto.
  defaultGarmentAsset: pantsModelAsset(1),
  garmentModelsByValueId: {
    2863: pantsModelAsset(1), // Lizo.
    2864: pantsModelAsset(2), // Pespunte.
  },
  garmentModelsByValueName: {
    lizo: pantsModelAsset(1),
    pespunte: pantsModelAsset(2),
  },
  neckModelsByValueId: {},
  lowerPocketModelsByValueId: {},
  auxiliaryPocketModelsByValueId: {},
};

export const visualAssetCatalogs: VisualAssetCatalog[] = [
  blusaAntifluidoT180VisualCatalog,
  pantalonVisualCatalog,
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

  if (matchesVisualAssetAttributeId(catalog, "neckModel", attributeId)) {
    return catalog.neckModelsByValueId?.[valueId];
  }

  if (matchesVisualAssetAttributeId(catalog, "garmentModel", attributeId)) {
    return catalog.garmentModelsByValueId?.[valueId];
  }

  if (matchesVisualAssetAttributeId(catalog, "lowerPocketModel", attributeId)) {
    return catalog.lowerPocketModelsByValueId?.[valueId];
  }

  if (matchesVisualAssetAttributeId(catalog, "chestPocketModel", attributeId)) {
    return catalog.chestPocketModelsByValueId?.[valueId];
  }

  if (matchesVisualAssetAttributeId(catalog, "auxiliaryPocketModel", attributeId)) {
    return catalog.auxiliaryPocketModelsByValueId?.[valueId];
  }

  return undefined;
}

export function getVisualAssetPathForValue(
  graphicManifestKey: string,
  attributeId: number,
  valueId: number,
  attributeName?: string,
  valueName?: string,
) {
  const pathById = getVisualAssetPath(graphicManifestKey, attributeId, valueId);

  if (pathById) {
    return pathById;
  }

  const catalog = resolveVisualAssetCatalog(graphicManifestKey);

  if (!catalog) {
    return undefined;
  }

  if (isNeckModelAttribute(attributeName)) {
    return findByNormalizedName(catalog.neckModelsByValueName, valueName);
  }

  if (isGarmentModelAttribute(attributeName)) {
    return findByNormalizedName(catalog.garmentModelsByValueName, valueName);
  }

  if (isLowerPocketModelAttribute(attributeName)) {
    return findByNormalizedName(catalog.lowerPocketModelsByValueName, valueName);
  }

  if (isChestPocketModelAttribute(attributeName)) {
    return findByNormalizedName(catalog.chestPocketModelsByValueName, valueName);
  }

  if (isAuxiliaryPocketModelAttribute(attributeName)) {
    return findByNormalizedName(catalog.auxiliaryPocketModelsByValueName, valueName);
  }

  return undefined;
}

export function getDefaultVisualAssetPath(graphicManifestKey: string) {
  return resolveVisualAssetCatalog(graphicManifestKey)?.defaultGarmentAsset;
}

export function getDefaultChestPocketAssetPath(graphicManifestKey: string) {
  return resolveVisualAssetCatalog(graphicManifestKey)?.defaultChestPocketModelAsset;
}
