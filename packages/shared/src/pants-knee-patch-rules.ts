export type PantsKneePatchModel =
  | "square"
  | "camouflage"
  | "point"
  | "internal"
  | "ribete"
  | "triangularFlap";

export type PantsKneePatchType =
  | "snap"
  | "overlaid"
  | "button"
  | "doubleButton"
  | "velcro"
  | "buckle"
  | "penSeam"
  | "plain"
  /** The zipper exists structurally, but its teeth are intentionally not shown. */
  | "invisibleZipper"
  | "zipper"
  | "horizontalZipper"
  | "verticalZipper";

export type PantsKneeTrimSection =
  | "patchRight"
  | "patchLeft"
  | "ringRight"
  | "ringLeft"
  | "linearUpperRight"
  | "linearUpperLeft"
  | "linearLowerRight"
  | "linearLowerLeft"
  | "zipperRight"
  | "zipperLeft"
  | "ribeteRight"
  | "ribeteLeft"
  | "buttonRight"
  | "buttonLeft";

/** Stable Odoo product.attribute IDs shared by Pantalon and Uniforme. */
export const PANTS_KNEE_PATCH_ATTRIBUTE_IDS = {
  rightModel: 169,
  rightType: 170,
  leftModel: 171,
  leftType: 172,
} as const;

const PANTS_KNEE_PATCH_MODEL_BY_SOURCE_VALUE_ID = new Map<
  number,
  PantsKneePatchModel
>([
  [760, "square"],
  [761, "point"],
  [1931, "ribete"],
  [1933, "camouflage"],
  [1949, "triangularFlap"],
  [1952, "internal"],
  [768, "square"],
  [769, "point"],
  [1932, "ribete"],
  [1934, "camouflage"],
  [1950, "triangularFlap"],
  [1953, "internal"],
]);

const PANTS_KNEE_PATCH_TYPE_BY_SOURCE_VALUE_ID = new Map<
  number,
  PantsKneePatchType
>([
  [763, "verticalZipper"],
  // Odoo calls this option "Cremallera invisible". It must not reuse the
  // visible horizontal zipper artwork.
  [764, "invisibleZipper"],
  [765, "plain"],
  [766, "velcro"],
  [1935, "buckle"],
  [1937, "snap"],
  [1942, "horizontalZipper"],
  [1945, "button"],
  [1947, "penSeam"],
  [2110, "overlaid"],
  [2115, "doubleButton"],
  [771, "verticalZipper"],
  [772, "invisibleZipper"],
  [773, "plain"],
  [774, "velcro"],
  [1936, "buckle"],
  [1938, "snap"],
  [1943, "horizontalZipper"],
  [1946, "button"],
  [1948, "penSeam"],
  [2111, "overlaid"],
  [2116, "doubleButton"],
]);

const PANTS_KNEE_TRIM_SECTION_BY_SOURCE_VALUE_ID = new Map<
  number,
  PantsKneeTrimSection
>([
  [644, "patchRight"],
  [2112, "patchLeft"],
  [2092, "ringRight"],
  [2097, "ringLeft"],
  [2093, "linearUpperRight"],
  [2094, "linearUpperLeft"],
  [2095, "linearLowerRight"],
  [2096, "linearLowerLeft"],
  [2104, "zipperRight"],
  [2105, "zipperLeft"],
  [2106, "ribeteRight"],
  [2107, "ribeteLeft"],
  [2108, "buttonRight"],
  [2109, "buttonLeft"],
]);

export function getPantsKneePatchModelBySourceValueId(
  sourceValueId: number | undefined,
) {
  return sourceValueId === undefined
    ? undefined
    : PANTS_KNEE_PATCH_MODEL_BY_SOURCE_VALUE_ID.get(sourceValueId);
}

export function getPantsKneePatchTypeBySourceValueId(
  sourceValueId: number | undefined,
) {
  return sourceValueId === undefined
    ? undefined
    : PANTS_KNEE_PATCH_TYPE_BY_SOURCE_VALUE_ID.get(sourceValueId);
}

/**
 * Odoo shares the type selector across knee-pocket models, but these finishes
 * are approved only for the rectangular patch. Keeping the rule here makes
 * the web preview and the generated image agree even for old configurations.
 */
export function isPantsKneePatchTypeAllowedForModel(
  model: PantsKneePatchModel | undefined,
  type: PantsKneePatchType | undefined,
) {
  if (!type) {
    return true;
  }

  return !["overlaid", "velcro", "plain"].includes(type) || model === "square";
}

export function getPantsKneeTrimSectionBySourceValueId(
  sourceValueId: number | undefined,
) {
  return sourceValueId === undefined
    ? undefined
    : PANTS_KNEE_TRIM_SECTION_BY_SOURCE_VALUE_ID.get(sourceValueId);
}
