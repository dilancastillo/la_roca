/**
 * IDs estables de los atributos compartidos por Blusa, Pantalon y Uniforme.
 * Los nombres de Odoo son editables; estos IDs son la fuente principal para
 * resolver comportamiento visual y dependencias del configurador.
 */
export const CONFIGURATOR_ATTRIBUTE_IDS = {
  material: 141,
  gender: 142,
  blouseSize: 143,
  darts: 144,
  neckModel: 145,
  logo: 146,
  textAboveChestPocket: 147,
  textUpperChestPocket: 148,
  textLowerChestPocket: 149,
  textRightSleeve: 150,
  textLeftSleeve: 151,
  textBack: 152,
  chestPocketModel: 153,
  lowerPocketModel: 154,
  lowerPocketType: 155,
  auxiliaryPocketType: 156,
  trimSections: 157,
  bootType: 160,
  bootLength: 161,
  bootWidth: 162,
  pantsSize: 163,
  waistband: 164,
  waistbandDetail: 165,
  pantsSidePocket: 166,
  backPocketModel: 167,
  backPocketType: 168,
  rightKneePatchModel: 169,
  rightKneePatchType: 170,
  leftKneePatchModel: 171,
  leftKneePatchType: 172,
  pantsLining: 173,
  baseColor: 798,
  textAboveChestPocketStyle: 803,
  textUpperChestPocketStyle: 804,
  textLowerChestPocketStyle: 805,
  textRightSleeveStyle: 806,
  textLeftSleeveStyle: 807,
  textBackStyle: 808,
  sleeveModel: 809,
  pantsPespunte: 810,
  blousePespunte: 811,
  sleeveType: 812,
  invisibleSideZipper: 813,
  trimColor: 814,
  lowerPocketZipper: 815,
  textRightChest: 816,
  textRightChestStyle: 817,
  bootZipper: 818,
  additionalEmbroidery: 819,
  additionalPantsPockets: 820,
} as const;

export const CONFIGURATOR_VALUE_IDS = {
  yes: [579, 581, 583, 585, 587, 589, 1955, 1958, 1965, 2084, 2100, 2113, 2118, 2120],
  woman: [532],
  textStyle: [1900, 1902, 1904, 1906, 1908, 1910, 2101],
  pespunte: [1955, 1958, 2078],
  originalBoot: [723],
  noChestPocket: [593],
  pantsSidePocket: {
    original: [748],
    doubleZipper: [749],
    external: [750],
    asorsalud: [2091],
  },
  lowerPocketAuxiliary: {
    lizoBoth: [618],
    velcroBoth: [619],
    lizoLeft: [620],
    lizoRight: [621],
    velcroRight: [622],
    velcroLeft: [623],
    overlaidRight: [624],
    overlaidLeft: [625],
    overlaidBoth: [626],
  },
  logoPlacement: {
    chestPocketLeft: [572],
    chestPocketRight: [573],
    chestLeft: [574],
    chestRight: [575],
    lowerLeft: [576],
    lowerRight: [577],
  },
} as const;

export type SourceBackedValue = {
  id?: number | undefined;
  sourceValueId?: number | undefined;
  name?: string | undefined;
};

export function hasSourceValueId(
  value: SourceBackedValue | undefined,
  ids: readonly number[],
) {
  return value?.sourceValueId !== undefined && ids.includes(value.sourceValueId);
}

/**
 * Llave semantica inmutable para los vivos. El texto solo se usa cuando la
 * sesion historica no incluye el ID original de product.attribute.value.
 */
const trimSectionKeysBySourceValueId: Record<number, string> = {
  413: "sin vivos",
  414: "cogotera",
  415: "cuello",
  418: "bolsillo pecho superior",
  419: "bolsillos inferiores parte superior",
  420: "bolsillo auxiliar",
  422: "cuello bajo",
  627: "sin vivos",
  628: "cogotera",
  629: "cuello",
  630: "cuello v lineal externo derecho",
  631: "cuello v lineal interno derecho",
  632: "bolsillo pecho superior",
  633: "bolsillos inferiores parte superior",
  634: "bolsillo auxiliar",
  635: "cuello alto",
  636: "cuello bajo",
  637: "mangas",
  638: "bolsillos inferiores parte baja",
  639: "cuello v general",
  640: "cuello modelo 13",
  641: "cuello presilla",
  642: "cuello modelo 19",
  643: "bolsillo lateral de pantalon",
  644: "parche rodilla derecha",
  645: "parche trasero",
  1967: "cuello v lineal externo izquierdo",
  1968: "cuello v lineal interno izquierdo",
  1969: "cuello v completo interior derecho",
  1970: "cuello v completo interior izquierdo",
  1971: "presillas",
  1972: "manga lineal superior",
  1973: "manga lineal inferior",
  1974: "manga rellena",
  1975: "cuello interior grueso derecho",
  1976: "cuello interior grueso izquierdo",
  1977: "cuello inferior",
  1978: "cuello completo",
  1979: "cuello borde dividido inferior",
  1980: "cuello borde dividido superior",
  1981: "cuello arco",
  1982: "cuello puntadas",
  1983: "cuello aros",
  1984: "cuello interno",
  1985: "aletas",
  1986: "bolsillo pecho inferior",
  2077: "bolsillo de chef",
  2078: "pespunte",
  2085: "cremallera",
  2087: "bolsillos inferiores completa",
  2088: "aros",
  2089: "costura",
  2092: "aro rodilla derecha",
  2093: "rodilla derecha lineal superior",
  2094: "rodilla izquierda lineal superior",
  2095: "rodilla derecha lineal inferior",
  2096: "rodilla izquierda lineal inferior",
  2097: "aro rodilla izquierda",
  2103: "bolsillo inferior aletas",
  2104: "cremallera rodilla derecha",
  2105: "cremallera rodilla izquierda",
  2106: "ribete rodilla derecha",
  2107: "ribete rodilla izquierda",
  2108: "boton rodilla derecha",
  2109: "boton rodilla izquierda",
  2112: "parche rodilla izquierda",
};

export function getTrimSectionKeyBySourceValueId(sourceValueId: number | undefined) {
  return sourceValueId === undefined
    ? undefined
    : trimSectionKeysBySourceValueId[sourceValueId];
}
