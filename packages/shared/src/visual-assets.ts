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
const BLUSA_BOTONES_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-24-botones.svg`;
const BLUSA_CHEROKEE_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-12-cherokee.svg`;
const BLUSA_POLO_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-23-polo.svg`;
const BLUSA_2021_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-25-20-21.svg`;
const BLUSA_2020_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-50-20-20.svg`;
const BLUSA_DEPORTIVO_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-21-deportivo.svg`;
const BLUSA_ESTRELLA_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-22-estrella.svg`;
const BLUSA_MARIPOSA_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-40-mariposa.svg`;
const BLUSA_MARIPOSA_DIVIDIDO_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-04.svg`;
const BLUSA_MATRIOSKA_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-41-matrioska.svg`;
const BLUSA_JDC_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-02-jdc.svg`;
const BLUSA_CUCUTA_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-44-cucuta.svg`;
const BLUSA_PESPUNTE_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-45-pespunte.svg`;
const BLUSA_PRESILLAS_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-15-presillas.svg`;
const BLUSA_PUNTAS_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-06-puntas.svg`;
const BLUSA_CREMALLERA_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-27-cremallera.svg`;
const BLUSA_CUELLO_REDONDO_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-26-cuello-redondo.svg`;
const BLUSA_PEDAGOGIA_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-29-pedagogia.svg`;
const BLUSA_MODELO_29_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-28-modelo-29.svg`;
const BLUSA_ORIENTAL_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-33-oriental.svg`;
const BLUSA_ORIENTAL_LOWER_POCKET_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-33-oriental-lower-pocket.svg`;
const BLUSA_CIRUGIA_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-37-cirugia.svg`;
const BLUSA_CIRUGIA_LOWER_POCKET_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-37-cirugia-lower-pocket.svg`;
const BLUSA_CUELLO_ALTO_CREMALLERA_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-34-cuello-alto-cremallera.svg`;
const BLUSA_CUELLO_ALTO_CREMALLERA_LOWER_POCKET_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-34-cuello-alto-cremallera-lower-pocket.svg`;
const BLUSA_EL_HATO_ASSET = `${BLUSA_ASSET_BASE}/blouse-model-39-el-hato.svg`;
const BLUSA_EL_HATO_LOWER_POCKET_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-39-el-hato-lower-pocket.svg`;
const BLUSA_COSTURA_LOWER_POCKET_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-18-costura-lower-pocket.svg`;
const BLUSA_COSTURA_MARIA_LOWER_POCKET_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-20-costura-maria-lower-pocket.svg`;
const BLUSA_RIBETE_HORIZONTAL_LOWER_POCKET_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-47-ribete-horizontal-lower-pocket.svg`;
const BLUSA_LOS_ANDES_LOWER_POCKET_ASSET =
  `${BLUSA_ASSET_BASE}/blouse-model-48-los-andes-lower-pocket.svg`;
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
  garmentModelsByValueId: {
    2866: blouseModelAsset(1), // Lizo en Blusa.
    2867: BLUSA_PESPUNTE_ASSET, // Pespunte en Blusa.
  },
  neckModelsByValueId: {
    // IDs historicos de product.template.attribute.value.
    2590: blouseModelAsset(1), // CUELLO V.
    2591: BLUSA_PRESILLAS_ASSET, // PRESILLAS. Antes estaba asociado a PUNTAS.
    2592: BLUSA_PUNTAS_ASSET, // PUNTAS.
    2593: blouseModelAsset(10), // 2019.
    2594: BLUSA_JDC_ASSET, // JDC - CRUZADO.
    2595: blouseModelAsset(42), // JEAN.
    2597: blouseModelAsset(43), // ENFERMERA.
    2599: blouseModelAsset(9), // PRESILLA OVALO.
    2601: blouseModelAsset(8), // CUELLO ALTO.
    2602: blouseModelAsset(7), // Modelo 13.
    // IDs actuales en pstest-traininglaroca para product_tmpl_id=5 (Blusa).
    334: blouseModelAsset(1), // CUELLO V.
    335: BLUSA_PRESILLAS_ASSET, // PRESILLAS en Blusa.
    1157: BLUSA_PRESILLAS_ASSET, // PRESILLAS en Uniforme.
    336: BLUSA_PUNTAS_ASSET, // PUNTAS en Blusa.
    1158: BLUSA_PUNTAS_ASSET, // PUNTAS en Uniforme.
    337: blouseModelAsset(10), // 20-19.
    338: BLUSA_JDC_ASSET, // JDC en Blusa.
    1160: BLUSA_JDC_ASSET, // JDC en Uniforme.
    339: blouseModelAsset(42), // JEAN.
    340: BLUSA_CUCUTA_ASSET, // CUCUTA en Blusa.
    1162: BLUSA_CUCUTA_ASSET, // CUCUTA en Uniforme.
    341: blouseModelAsset(43), // ENFERMERA UB.
    343: blouseModelAsset(9), // OVALADO.
    345: blouseModelAsset(8), // CUELLO ALTO.
    346: blouseModelAsset(7), // PUNTADAS.
    1156: blouseModelAsset(1), // CUELLO V en Uniforme.
    352: BLUSA_MATRIOSKA_ASSET, // MATRIOSKA en Blusa.
    1174: BLUSA_MATRIOSKA_ASSET, // MATRIOSKA en Uniforme.
    353: BLUSA_MARIPOSA_ASSET, // MARIPOSA en Blusa.
    1175: BLUSA_MARIPOSA_ASSET, // MARIPOSA en Uniforme.
    354: BLUSA_2020_ASSET, // 20-20 en Blusa.
    1176: BLUSA_2020_ASSET, // 20-20 en Uniforme.
    355: BLUSA_DEPORTIVO_ASSET, // DEPORTIVO en Blusa.
    1177: BLUSA_DEPORTIVO_ASSET, // DEPORTIVO en Uniforme.
    356: BLUSA_ESTRELLA_ASSET, // ESTRELLA en Blusa.
    1178: BLUSA_ESTRELLA_ASSET, // ESTRELLA en Uniforme.
    357: BLUSA_POLO_ASSET, // POLO en Blusa.
    1179: BLUSA_POLO_ASSET, // POLO en Uniforme.
    2938: BLUSA_BOTONES_ASSET, // BOTONES en Blusa.
    2939: BLUSA_BOTONES_ASSET, // BOTONES en Uniforme.
    2940: BLUSA_2021_ASSET, // 20-21 en Blusa.
    2941: BLUSA_2021_ASSET, // 20-21 en Uniforme.
    2942: BLUSA_CUELLO_REDONDO_ASSET, // CUELLO REDONDO en Blusa.
    2943: BLUSA_CUELLO_REDONDO_ASSET, // CUELLO REDONDO en Uniforme.
    2944: BLUSA_CREMALLERA_ASSET, // CREMALLERA en Blusa.
    2945: BLUSA_CREMALLERA_ASSET, // CREMALLERA en Uniforme.
    2948: BLUSA_PEDAGOGIA_ASSET, // PEDAGOGIA en Blusa.
    2949: BLUSA_PEDAGOGIA_ASSET, // PEDAGOGIA en Uniforme.
    2950: BLUSA_ORIENTAL_ASSET, // ORIENTAL en Blusa.
    2951: BLUSA_ORIENTAL_ASSET, // ORIENTAL en Uniforme.
    2952: BLUSA_CUELLO_ALTO_CREMALLERA_ASSET, // CUELLO ALTO CON CREMALLERA en Blusa.
    2953: BLUSA_CUELLO_ALTO_CREMALLERA_ASSET, // CUELLO ALTO CON CREMALLERA en Uniforme.
    2954: BLUSA_CIRUGIA_ASSET, // CIRUGIA en Blusa.
    2955: BLUSA_CIRUGIA_ASSET, // CIRUGIA en Uniforme.
    2956: BLUSA_EL_HATO_ASSET, // EL HATO.
    2958: BLUSA_FISIOPRACTICAS_ASSET, // FISIOPRACTICAS.
    2960: BLUSA_P_PAIPILLA_ASSET, // P-PAIPILLA.
    2962: BLUSA_CHEROKEE_ASSET, // CHEROKEE.
  },
  neckModelsByValueName: {
    "cuello v": blouseModelAsset(1),
    presillas: BLUSA_PRESILLAS_ASSET,
    puntas: BLUSA_PUNTAS_ASSET,
    "20 19": blouseModelAsset(10),
    "20-19": blouseModelAsset(10),
    "2019": blouseModelAsset(10),
    jdc: BLUSA_JDC_ASSET,
    "jdc cruzado": BLUSA_JDC_ASSET,
    cruzado: blouseModelAsset(30),
    jean: blouseModelAsset(42),
    cucuta: BLUSA_CUCUTA_ASSET,
    enfermera: blouseModelAsset(43),
    "enfermera ub": blouseModelAsset(43),
    ovalado: blouseModelAsset(9),
    "presilla ovalo": blouseModelAsset(9),
    "cuello alto": blouseModelAsset(8),
    puntadas: blouseModelAsset(7),
    "modelo 13": blouseModelAsset(7),
    matrioska: BLUSA_MATRIOSKA_ASSET,
    mariposa: BLUSA_MARIPOSA_ASSET,
    "mariposa dividido": BLUSA_MARIPOSA_DIVIDIDO_ASSET,
    "20 20": BLUSA_2020_ASSET,
    "20-20": BLUSA_2020_ASSET,
    "2020": BLUSA_2020_ASSET,
    deportivo: BLUSA_DEPORTIVO_ASSET,
    estrella: BLUSA_ESTRELLA_ASSET,
    "20 21": BLUSA_2021_ASSET,
    "20-21": BLUSA_2021_ASSET,
    "2021": BLUSA_2021_ASSET,
    botones: BLUSA_BOTONES_ASSET,
    polo: BLUSA_POLO_ASSET,
    "cuello redondo": BLUSA_CUELLO_REDONDO_ASSET,
    "cuello alto con cremallera": BLUSA_CUELLO_ALTO_CREMALLERA_ASSET,
    cremallera: BLUSA_CREMALLERA_ASSET,
    pedagogia: BLUSA_PEDAGOGIA_ASSET,
    "modelo 29": BLUSA_MODELO_29_ASSET,
    oriental: BLUSA_ORIENTAL_ASSET,
    cirugia: BLUSA_CIRUGIA_ASSET,
    "el hato": BLUSA_EL_HATO_ASSET,
    fisiopracticas: BLUSA_FISIOPRACTICAS_ASSET,
    "fisio practicas": BLUSA_FISIOPRACTICAS_ASSET,
    "p paipilla": BLUSA_P_PAIPILLA_ASSET,
    "p-paipilla": BLUSA_P_PAIPILLA_ASSET,
    cherokee: BLUSA_CHEROKEE_ASSET,
  },
  garmentModelsByValueName: {
    lizo: blouseModelAsset(1),
    pespunte: BLUSA_PESPUNTE_ASSET,
  },
  lowerPocketModelsByValueId: {
    // IDs historicos. Los SVG disponibles para bolsillos inferiores son Modelo 14, 15, 16, 18, 19 y 20.
    2578: blouseModelAsset(14),
    2579: blouseModelAsset(15),
    2580: BLUSA_COSTURA_LOWER_POCKET_ASSET,
    2581: blouseModelAsset(18),
    2582: BLUSA_COSTURA_MARIA_LOWER_POCKET_ASSET,
    2583: blouseModelAsset(20),
    // IDs actuales en pstest-traininglaroca.
    380: blouseModelAsset(14), // RECTANGULAR.
    381: blouseModelAsset(15), // AROS.
    382: BLUSA_COSTURA_LOWER_POCKET_ASSET, // COSTURA en Blusa.
    383: blouseModelAsset(18), // RIBETE.
    384: BLUSA_COSTURA_MARIA_LOWER_POCKET_ASSET, // COSTURA MARIA en Blusa.
    385: blouseModelAsset(20), // COSTURA TRIANGULO.
    386: blouseModelAsset(14), // BOLSILLO INTERNO RECTANGULAR.
    388: BLUSA_ORIENTAL_LOWER_POCKET_ASSET, // RIBETE VERTICAL en Blusa.
    389: BLUSA_RIBETE_HORIZONTAL_LOWER_POCKET_ASSET, // RIBETE HORIZONTAL.
    390: BLUSA_CUELLO_ALTO_CREMALLERA_LOWER_POCKET_ASSET, // ANDES HOMBRE en Blusa.
    391: BLUSA_CIRUGIA_LOWER_POCKET_ASSET, // COSTURA OVALADO en Blusa.
    1204: BLUSA_COSTURA_LOWER_POCKET_ASSET, // COSTURA en Uniforme.
    1206: BLUSA_COSTURA_MARIA_LOWER_POCKET_ASSET, // COSTURA MARIA en Uniforme.
    1210: BLUSA_ORIENTAL_LOWER_POCKET_ASSET, // RIBETE VERTICAL en Uniforme.
    1212: BLUSA_CUELLO_ALTO_CREMALLERA_LOWER_POCKET_ASSET, // ANDES HOMBRE en Uniforme.
    1213: BLUSA_CIRUGIA_LOWER_POCKET_ASSET, // COSTURA OVALADO en Uniforme.
    2964: BLUSA_EL_HATO_LOWER_POCKET_ASSET, // BOLSILLO PRESILLAS en Uniforme.
    2965: BLUSA_EL_HATO_LOWER_POCKET_ASSET, // BOLSILLO PRESILLAS en Blusa.
  },
  lowerPocketModelsByValueName: {
    rectangular: blouseModelAsset(14),
    aros: blouseModelAsset(15),
    costura: BLUSA_COSTURA_LOWER_POCKET_ASSET,
    ribete: blouseModelAsset(18),
    "costura maria": BLUSA_COSTURA_MARIA_LOWER_POCKET_ASSET,
    "costura triangulo": blouseModelAsset(20),
    "bolsillo interno rectangular": blouseModelAsset(14),
    "ribete vertical": BLUSA_ORIENTAL_LOWER_POCKET_ASSET,
    "ribete horizontal": BLUSA_RIBETE_HORIZONTAL_LOWER_POCKET_ASSET,
    "los andes": BLUSA_LOS_ANDES_LOWER_POCKET_ASSET,
    "andes hombre": BLUSA_CUELLO_ALTO_CREMALLERA_LOWER_POCKET_ASSET,
    "costura ovalado": BLUSA_CIRUGIA_LOWER_POCKET_ASSET,
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

  if (
    matchesVisualAssetAttributeId(catalog, "neckModel", attributeId) ||
    isNeckModelAttribute(attributeName)
  ) {
    return findByNormalizedName(catalog.neckModelsByValueName, valueName);
  }

  if (
    matchesVisualAssetAttributeId(catalog, "garmentModel", attributeId) ||
    isGarmentModelAttribute(attributeName)
  ) {
    return findByNormalizedName(catalog.garmentModelsByValueName, valueName);
  }

  if (
    matchesVisualAssetAttributeId(catalog, "lowerPocketModel", attributeId) ||
    isLowerPocketModelAttribute(attributeName)
  ) {
    return findByNormalizedName(catalog.lowerPocketModelsByValueName, valueName);
  }

  if (
    matchesVisualAssetAttributeId(catalog, "chestPocketModel", attributeId) ||
    isChestPocketModelAttribute(attributeName)
  ) {
    return findByNormalizedName(catalog.chestPocketModelsByValueName, valueName);
  }

  if (
    matchesVisualAssetAttributeId(catalog, "auxiliaryPocketModel", attributeId) ||
    isAuxiliaryPocketModelAttribute(attributeName)
  ) {
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
