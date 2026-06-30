import type { PreviewScene } from "../configurator/lib/derive-configurator-ui";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 1200;
const TARGET_RECT = {
  x: 88,
  y: 86,
  width: 724,
  height: 980,
};

export type OverlayRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const previewCanvasSize = {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
};

const PANTS_SIDE_POCKET_DOUBLE_ZIPPER_TRIM_SRC =
  "/assets/catalog/pantalon/trim-overlays/pants-side-pocket-double-zipper.svg";
const PANTS_SIDE_POCKET_ASORSALUD_TRIM_SRC =
  "/assets/catalog/pantalon/trim-overlays/pants-side-pocket-asorsalud.svg";
const PANTS_KNEE_PATCH_SQUARE_SRC_BY_SIDE = {
  left: "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-square-left.svg",
  right:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-square-right.svg",
} as const;
const PANTS_KNEE_PATCH_CAMOUFLAGE_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-left.svg",
  right:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-right.svg",
} as const;
const PANTS_KNEE_PATCH_POINT_SRC_BY_SIDE = {
  left: "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-point-left.svg",
  right:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-point-right.svg",
} as const;
const PANTS_KNEE_PATCH_INTERNAL_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-internal-left.svg",
  right:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-internal-right.svg",
} as const;
const PANTS_KNEE_PATCH_TRIANGULAR_FLAP_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-triangular-flap-left.svg",
  right:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-triangular-flap-right.svg",
} as const;
const PANTS_KNEE_PATCH_RIBETE_PLAIN_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-ribete-plain-left.svg",
  right:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-ribete-plain-right.svg",
} as const;
const PANTS_KNEE_PATCH_RIBETE_ZIPPER_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-ribete-zipper-left.svg",
  right:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-ribete-zipper-right.svg",
} as const;
const PANTS_KNEE_PATCH_ZIPPER_SRC_BY_SIDE = {
  left: "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-left.svg",
  right:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-right.svg",
} as const;
const PANTS_KNEE_PATCH_ZIPPER_FILL_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-fill-left.svg",
  right:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-fill-right.svg",
} as const;
const PANTS_KNEE_PATCH_VERTICAL_ZIPPER_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-vertical-left.svg",
  right:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-vertical-right.svg",
} as const;
const PANTS_KNEE_PATCH_VERTICAL_ZIPPER_FILL_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-vertical-fill-left.svg",
  right:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-vertical-fill-right.svg",
} as const;
const PANTS_KNEE_PATCH_SQUARE_TRIM_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-square-trim-left.svg",
  right:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-square-trim-right.svg",
} as const;
const PANTS_KNEE_PATCH_CAMOUFLAGE_FILL_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-camouflage-fill-left.svg",
  right:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-camouflage-fill-right.svg",
} as const;
const PANTS_KNEE_PATCH_CAMOUFLAGE_BUTTON_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-button-left.svg",
  right:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-button-right.svg",
} as const;
const PANTS_KNEE_PATCH_CAMOUFLAGE_BUCKLE_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-buckle-left.svg",
  right:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-buckle-right.svg",
} as const;
const PANTS_KNEE_PATCH_POINT_PEN_SEAM_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-point-pen-seam-left.svg",
  right:
    "/assets/catalog/pantalon/detail-overlays/pants-knee-patch-point-pen-seam-right.svg",
} as const;
const PANTS_KNEE_PATCH_POINT_PEN_SEAM_FILL_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-point-pen-seam-fill-left.svg",
  right:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-point-pen-seam-fill-right.svg",
} as const;
const PANTS_KNEE_PATCH_TRIANGULAR_FLAP_TRIM_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-triangular-flap-trim-left.svg",
  right:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-triangular-flap-trim-right.svg",
} as const;
const PANTS_KNEE_PATCH_RIBETE_PLAIN_FILL_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-ribete-plain-fill-left.svg",
  right:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-ribete-plain-fill-right.svg",
} as const;
const PANTS_KNEE_PATCH_RIBETE_ZIPPER_FILL_SRC_BY_SIDE = {
  left:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-ribete-zipper-fill-left.svg",
  right:
    "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-ribete-zipper-fill-right.svg",
} as const;
const PANTS_KNEE_PATCH_LINEAR_TRIM_SRC_BY_GROUP = {
  full: {
    upper: {
      left:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-full-upper-left.svg",
      right:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-full-upper-right.svg",
    },
    lower: {
      left:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-full-lower-left.svg",
      right:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-full-lower-right.svg",
    },
  },
  internal: {
    upper: {
      left:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-internal-upper-left.svg",
      right:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-internal-upper-right.svg",
    },
    lower: {
      left:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-internal-lower-left.svg",
      right:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-internal-lower-right.svg",
    },
  },
  ribetePlain: {
    upper: {
      left:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-plain-upper-left.svg",
      right:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-plain-upper-right.svg",
    },
    lower: {
      left:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-plain-lower-left.svg",
      right:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-plain-lower-right.svg",
    },
  },
  ribeteZipper: {
    upper: {
      left:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-zipper-upper-left.svg",
      right:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-zipper-upper-right.svg",
    },
    lower: {
      left:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-zipper-lower-left.svg",
      right:
        "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-zipper-lower-right.svg",
    },
  },
} as const;
const PANTS_KNEE_PATCH_LINEAR_UPPER_RING_SRC_BY_GROUP = {
  full: {
    left:
      "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-full-upper-ring-left.svg",
    right:
      "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-full-upper-ring-right.svg",
  },
  internal: {
    left:
      "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-internal-upper-ring-left.svg",
    right:
      "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-internal-upper-ring-right.svg",
  },
  ribetePlain: {
    left:
      "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-plain-upper-ring-left.svg",
    right:
      "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-plain-upper-ring-right.svg",
  },
  ribeteZipper: {
    left:
      "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-zipper-upper-ring-left.svg",
    right:
      "/assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-zipper-upper-ring-right.svg",
  },
} as const;

export const overlayRegionPresets: Record<
  "lowerPocketPair" | "lowerPocketSingleRight" | "auxiliaryPocketPair",
  OverlayRegion[]
> = {
  lowerPocketPair: [
    { x: 260, y: 690, width: 180, height: 340 },
    { x: 485, y: 690, width: 190, height: 340 },
  ],
  lowerPocketSingleRight: [
    { x: 485, y: 690, width: 190, height: 340 },
  ],
  auxiliaryPocketPair: [
    { x: 116, y: 518, width: 248, height: 356 },
    { x: 536, y: 518, width: 248, height: 356 },
  ],
};

const trimRegionPresets: Record<"collar", OverlayRegion[]> = {
  collar: [{ x: 320, y: 100, width: 270, height: 300 }],
};

const lowerPocketDetailElementIndexesByFileName: Record<string, number[]> = {
  "blouse-model-14.svg": [1, 2, 3, 4],
  "blouse-model-15.svg": [4, 5, 6, 7],
  "blouse-model-16.svg": [1, 2, 3, 4, 5],
  "blouse-model-18.svg": [1, 2, 3],
  "blouse-model-19.svg": [1, 2, 4, 5, 6, 7],
  "blouse-model-20.svg": [1, 2, 3],
  "blouse-model-18-costura-lower-pocket.svg": [1, 2, 3],
  "blouse-model-19-ribete-lower-pocket.svg": [1, 2, 3, 4, 5, 6],
  "blouse-model-20-costura-maria-lower-pocket.svg": [1, 2, 3],
  "blouse-model-33-oriental-lower-pocket.svg": [6, 7],
  "blouse-model-34-cuello-alto-cremallera-lower-pocket.svg": [67, 68, 69],
  "blouse-model-37-cirugia-lower-pocket.svg": [1, 2, 11, 12],
  "blouse-model-39-el-hato-lower-pocket.svg": [3, 4, 5, 6, 7, 8, 9, 10],
  "blouse-model-46-costura-triangulo-lower-pocket.svg": [1, 2, 3, 4],
  "blouse-model-47-ribete-horizontal-lower-pocket.svg": [1, 2],
  "blouse-model-48-los-andes-lower-pocket-v2.svg": [0, 1, 2, 3, 4],
  "blouse-model-49-bolsillo-interno-rectangular-lower-pocket.svg": [0, 1, 2],
};

const lowerPocketTrimElementIndexesByFileName: Record<string, number[]> = {
  "blouse-model-14.svg": [3, 4],
  "blouse-model-15.svg": [5, 7],
  "blouse-model-19.svg": [4, 5, 6, 7],
  "blouse-model-33-oriental-lower-pocket.svg": [8, 9],
};

const lowerPocketTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-20.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-20-lower-pocket.svg",
};

const lowerPocketSectionTrimOverlayByFileName: Record<
  string,
  { top?: string; bottom?: string; complete?: string; auxiliary?: string }
> = {
  "blouse-model-14.svg": {
    top: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-14-rectangular-lower-pocket-upper.svg",
    bottom:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-14-rectangular-lower-pocket-lower.svg",
    complete:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-14-rectangular-lower-pocket-complete.svg",
  },
  "blouse-model-18-costura-lower-pocket.svg": {
    top: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-18-costura-lower-pocket-upper.svg",
    bottom:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-18-costura-lower-pocket-lower.svg",
    auxiliary:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-18-costura-lower-pocket-auxiliary.svg",
  },
  "blouse-model-19-ribete-lower-pocket.svg": {
    top: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-19-ribete-lower-pocket-upper.svg",
    bottom:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-19-ribete-lower-pocket-lower.svg",
  },
  "blouse-model-20-costura-maria-lower-pocket.svg": {
    top: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-20-costura-maria-lower-pocket-upper.svg",
    auxiliary:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-20-costura-maria-lower-pocket-auxiliary.svg",
  },
  "blouse-model-34-cuello-alto-cremallera-lower-pocket.svg": {
    top: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-34-cuello-alto-cremallera-lower-pocket-andes-hombre-trim.svg",
    bottom:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-34-cuello-alto-cremallera-lower-pocket-andes-hombre-trim.svg",
  },
  "blouse-model-37-cirugia-lower-pocket.svg": {
    top: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-37-cirugia-lower-pocket-costura-ovalado-trim.svg",
    bottom:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-37-cirugia-lower-pocket-costura-ovalado-trim.svg",
  },
  "blouse-model-39-el-hato-lower-pocket.svg": {
    top: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-39-el-hato-lower-pocket-presillas-trim.svg",
    bottom:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-39-el-hato-lower-pocket-presillas-trim.svg",
  },
  "blouse-model-46-costura-triangulo-lower-pocket.svg": {
    top: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-46-costura-triangulo-lower-pocket-upper.svg",
    bottom:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-46-costura-triangulo-lower-pocket-trim.svg",
  },
  "blouse-model-47-ribete-horizontal-lower-pocket.svg": {
    top: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-47-ribete-horizontal-lower-pocket-trim.svg",
    bottom:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-47-ribete-horizontal-lower-pocket-trim.svg",
  },
};

const lowerPocketSectionTrimOutlineRadiusByFileName: Record<string, number> = {
  "blouse-model-14.svg": 3,
  "blouse-model-46-costura-triangulo-lower-pocket.svg": 3,
  "blouse-model-47-ribete-horizontal-lower-pocket.svg": 0,
};

const lowerPocketOverlayRegionsByFileName: Record<string, OverlayRegion[]> = {
  "blouse-model-48-los-andes-lower-pocket-v2.svg": [
    { x: 225, y: 675, width: 245, height: 385 },
    { x: 470, y: 675, width: 245, height: 385 },
  ],
};

const chestPocketTrimOverlayByFileName: Record<string, string> = {
  "chest-pocket-zipper-external.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external-trim.svg",
};

const chestPocketSectionTrimOverlayByFileName: Record<
  string,
  { upper?: string; zipper?: string; lower?: string }
> = {
  "chest-pocket-point-zipper.svg": {
    upper:
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-zipper-upper-trim.svg",
    zipper:
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-zipper-trim.svg",
    lower:
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-zipper-lower-trim.svg",
  },
  "chest-pocket-point.svg": {
    upper:
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-upper-trim.svg",
    lower:
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-lower-trim.svg",
  },
  "chest-pocket-rectangular-model.svg": {
    upper:
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-upper-trim.svg",
    lower:
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-lower-trim.svg",
  },
  "chest-pocket-zipper-external.svg": {
    upper:
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external-upper-trim.svg",
    zipper:
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external-trim.svg",
    lower:
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external-lower-trim.svg",
  },
  "chest-pocket-zipper-internal.svg": {
    zipper:
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-internal-trim.svg",
  },
};

const fullChestPocketTrimOverlayFileNames = new Set([
  "chest-pocket-zipper-external.svg",
]);

const defaultChestPocketSectionTrimOrder = [
  "upper",
  "zipper",
  "lower",
] as const;
const upperRaisedChestPocketSectionTrimOrder = [
  "zipper",
  "lower",
  "upper",
] as const;
type ChestPocketSectionTrimKey =
  (typeof defaultChestPocketSectionTrimOrder)[number];

function getChestPocketSectionTrimOrder(
  fileName: string,
): readonly ChestPocketSectionTrimKey[] {
  return fileName === "chest-pocket-zipper-external.svg"
    ? upperRaisedChestPocketSectionTrimOrder
    : defaultChestPocketSectionTrimOrder;
}

const CHEST_POCKET_VERTICAL_OFFSET = 28;

const BLUSA_PESPUNTE_MODEL_FILE_NAME = "blouse-model-45-pespunte.svg";

const garmentDetailOverlayByFileName: Record<string, string> = {
  [BLUSA_PESPUNTE_MODEL_FILE_NAME]:
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg",
};

const neckModelDetailOverlayByFileName: Record<string, string> = {
  "blouse-model-39-el-hato.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-39-el-hato-buttons.svg",
};

const earlyNeckModelDetailOverlayByFileName: Record<string, string> = {
  "blouse-model-04.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-04-mariposa-dividido-default.svg",
};

const LOGO_MARKER_FILL = "#1677ff";
const LOGO_MARKER_OUTLINE = "#f8fafc";
const LOGO_MARKER_RADIUS = 28;
const LOGO_MARKER_OUTLINE_RADIUS = 36;
const BACK_NECK_STRAIGHT_VERTICAL_OFFSET = 8;
const BACK_NECK_LOWERED_STRAIGHT_VERTICAL_OFFSET = 14;
const BACK_NECK_OVAL_VERTICAL_OFFSET = 20;
const BACK_NECK_OVERLAY_VERTICAL_OFFSET = 4;
const LOGO_MARKER_POSITIONS = {
  chestLeft: { x: 595, y: 430 },
  chestRight: { x: 330, y: 430 },
  chestPocketLeft: { x: 570, y: 455 },
  lowerLeft: { x: 585, y: 850 },
  lowerRight: { x: 355, y: 850 },
} as const;
const SLEEVE_TAB_MARKER_RADIUS = 24;
const SLEEVE_TAB_MARKER_OUTLINE_RADIUS = 30;
const SLEEVE_TAB_MARKER_POSITIONS = [
  { x: 170, y: 408 },
  { x: 742, y: 408 },
] as const;
const ORIGINAL_SLEEVES_DETAIL_FILE_NAME =
  "blouse-model-32-original-sleeves.svg";
const PUNTADAS_ORIGINAL_SLEEVES_DETAIL_OVERLAY =
  "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-07-puntadas-original-sleeves.svg";
const ORIGINAL_SLEEVE_TRIM_SHAPES = [
  {
    points: [
      [269.91, 653.14],
      [118.39, 515.53],
      [122.27, 500.54],
      [274.95, 638.85],
    ],
    upper: [
      [122.27, 500.54],
      [274.95, 638.85],
    ],
    lower: [
      [118.39, 515.53],
      [269.91, 653.14],
    ],
  },
  {
    points: [
      [966.37, 514.83],
      [825.74, 624.56],
      [816.49, 613.07],
      [962.26, 501.39],
    ],
    upper: [
      [962.26, 501.39],
      [816.49, 613.07],
    ],
    lower: [
      [966.37, 514.83],
      [825.74, 624.56],
    ],
  },
] as const;
const PUNTADAS_ORIGINAL_SLEEVE_TRIM_SHAPES = [
  ORIGINAL_SLEEVE_TRIM_SHAPES[0],
  {
    points: [
      [976.14, 517],
      [844.79, 623.6],
      [835.54, 612.11],
      [972.03, 503.56],
    ],
    upper: [
      [972.03, 503.56],
      [835.54, 612.11],
    ],
    lower: [
      [976.14, 517],
      [844.79, 623.6],
    ],
  },
] as const;
const CUELLO_V_ORIGINAL_SLEEVE_TRIM_SHAPES = [
  {
    points: [
      [262.51, 662.26],
      [116.28, 531.63],
      [120.16, 516.64],
      [267.55, 647.97],
    ],
    upper: [
      [120.16, 516.64],
      [267.55, 647.97],
    ],
    lower: [
      [116.28, 531.63],
      [262.51, 662.26],
    ],
  },
  {
    points: [
      [970.21, 515.32],
      [834.2, 642.19],
      [824.95, 630.7],
      [966.1, 501.88],
    ],
    upper: [
      [966.1, 501.88],
      [824.95, 630.7],
    ],
    lower: [
      [970.21, 515.32],
      [834.2, 642.19],
    ],
  },
] as const;
const PRESILLAS_ORIGINAL_SLEEVE_TRIM_SHAPES = [
  {
    points: [
      [266.39, 663.15],
      [116.33, 523.95],
      [122.27, 500.54],
      [274.95, 638.85],
    ],
    upper: [
      [122.27, 500.54],
      [274.95, 638.85],
    ],
    lower: [
      [116.33, 523.95],
      [266.39, 663.15],
    ],
  },
  {
    points: [
      [978.44, 524.53],
      [849.42, 629.35],
      [835.54, 612.11],
      [972.03, 503.56],
    ],
    upper: [
      [972.03, 503.56],
      [835.54, 612.11],
    ],
    lower: [
      [978.44, 524.53],
      [849.42, 629.35],
    ],
  },
] as const;
const PUNTADAS_ALIGNED_ORIGINAL_SLEEVE_BASE_FILE_NAMES = new Set([
  "blouse-model-02-jdc.svg",
  "blouse-model-04.svg",
  "blouse-model-05.svg",
  "blouse-model-10.svg",
  "blouse-model-11-fisiopracticas.svg",
  "blouse-model-12-cherokee.svg",
  "blouse-model-13-p-paipilla.svg",
  "blouse-model-15-presillas.svg",
  "blouse-model-21-deportivo.svg",
  "blouse-model-23-polo.svg",
  "blouse-model-24-botones.svg",
  "blouse-model-25-20-21.svg",
  "blouse-model-26-cuello-redondo.svg",
  "blouse-model-27-cremallera.svg",
  "blouse-model-28-modelo-29.svg",
  "blouse-model-29-pedagogia.svg",
  "blouse-model-30.svg",
  "blouse-model-33-oriental.svg",
  "blouse-model-34-cuello-alto-cremallera.svg",
  "blouse-model-37-cirugia.svg",
  "blouse-model-40-mariposa.svg",
  "blouse-model-41-matrioska.svg",
  "blouse-model-42.svg",
  "blouse-model-43.svg",
  "blouse-model-44-cucuta.svg",
  "blouse-model-50-20-20.svg",
]);
const SPACED_ORIGINAL_SLEEVE_TRIM_BASE_FILE_NAMES = new Set([
  "blouse-model-02-jdc.svg",
  "blouse-model-05.svg",
  "blouse-model-10.svg",
  "blouse-model-12-cherokee.svg",
  "blouse-model-15-presillas.svg",
  "blouse-model-21-deportivo.svg",
  "blouse-model-40-mariposa.svg",
  "blouse-model-41-matrioska.svg",
  "blouse-model-42.svg",
  "blouse-model-43.svg",
  "blouse-model-44-cucuta.svg",
  "blouse-model-50-20-20.svg",
]);
const ORIGINAL_SLEEVE_TRIM_SHAPES_BY_BASE_FILE_NAME = {
  "blouse-model-01.svg": [
    ...CUELLO_V_ORIGINAL_SLEEVE_TRIM_SHAPES,
  ],
  "blouse-model-04.svg": [
    ORIGINAL_SLEEVE_TRIM_SHAPES[0],
    {
      points: [
        [978.95, 517.44],
        [846.82, 624.41],
        [837.57, 612.92],
        [974.84, 504],
      ],
      upper: [
        [974.84, 504],
        [837.57, 612.92],
      ],
      lower: [
        [978.95, 517.44],
        [846.82, 624.41],
      ],
    },
  ],
  "blouse-model-06-puntas.svg": [
    ...PUNTADAS_ORIGINAL_SLEEVE_TRIM_SHAPES,
  ],
  "blouse-model-07.svg": [
    ...PUNTADAS_ORIGINAL_SLEEVE_TRIM_SHAPES,
  ],
  "blouse-model-08.svg": [
    {
      points: [
        [274.77, 660.65],
        [128.54, 530.02],
        [132.42, 515.03],
        [279.81, 646.36],
      ],
      upper: [
        [132.42, 515.03],
        [279.81, 646.36],
      ],
      lower: [
        [128.54, 530.02],
        [274.77, 660.65],
      ],
    },
    {
      points: [
        [978.41, 527.75],
        [847.06, 633.18],
        [837.81, 621.69],
        [974.3, 514.31],
      ],
      upper: [
        [974.3, 514.31],
        [837.81, 621.69],
      ],
      lower: [
        [978.41, 527.75],
        [847.06, 633.18],
      ],
    },
  ],
  "blouse-model-09.svg": [
    {
      points: [
        [274.07, 659.25],
        [127.84, 528.62],
        [131.72, 513.63],
        [279.11, 644.96],
      ],
      upper: [
        [131.72, 513.63],
        [279.11, 644.96],
      ],
      lower: [
        [127.84, 528.62],
        [274.07, 659.25],
      ],
    },
    {
      points: [
        [977.71, 526.35],
        [846.36, 631.78],
        [837.11, 620.29],
        [973.6, 512.91],
      ],
      upper: [
        [973.6, 512.91],
        [837.11, 620.29],
      ],
      lower: [
        [977.71, 526.35],
        [846.36, 631.78],
      ],
    },
  ],
  "blouse-model-22-estrella.svg": [
    {
      points: [
        [167.82, 599.62],
        [6.14, 455.22],
        [16.02, 442.48],
        [177.45, 586.86],
      ],
      upper: [
        [16.02, 442.48],
        [177.45, 586.86],
      ],
      lower: [
        [6.14, 455.22],
        [167.82, 599.62],
      ],
    },
    {
      points: [
        [945.83, 452.71],
        [800.6, 569.26],
        [788.35, 556.57],
        [933.19, 440.05],
      ],
      upper: [
        [933.19, 440.05],
        [788.35, 556.57],
      ],
      lower: [
        [945.83, 452.71],
        [800.6, 569.26],
      ],
    },
  ],
  "blouse-model-39-el-hato.svg": [
    {
      points: [
        [166.24, 605.07],
        [6.09, 461.97],
        [15.88, 449.35],
        [175.78, 592.42],
      ],
      upper: [
        [15.88, 449.35],
        [175.78, 592.42],
      ],
      lower: [
        [6.09, 461.97],
        [166.24, 605.07],
      ],
    },
    {
      points: [
        [936.89, 459.48],
        [793.03, 574.98],
        [780.9, 562.4],
        [924.37, 446.94],
      ],
      upper: [
        [924.37, 446.94],
        [780.9, 562.4],
      ],
      lower: [
        [936.89, 459.48],
        [793.03, 574.98],
      ],
    },
  ],
} as const;
const ORIGINAL_SLEEVES_DETAIL_OVERLAY_BY_BASE_FILE_NAME: Record<string, string> = {
  "blouse-model-01.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-01-cuello-v-original-sleeves.svg",
  "blouse-model-04.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-04-mariposa-dividido-original-sleeves.svg",
  "blouse-model-06-puntas.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-06-puntas-original-sleeves.svg",
  "blouse-model-07.svg":
    PUNTADAS_ORIGINAL_SLEEVES_DETAIL_OVERLAY,
  "blouse-model-08.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-08-cuello-alto-original-sleeves.svg",
  "blouse-model-09.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-09-ovalado-original-sleeves.svg",
  "blouse-model-22-estrella.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-22-estrella-original-sleeves.svg",
  "blouse-model-39-el-hato.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-39-el-hato-original-sleeves.svg",
};

const collarTrimElementIndexesByFileName: Record<string, number[]> = {
  "blouse-model-07.svg": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  "blouse-model-10.svg": [3, 4],
  "blouse-model-37-cirugia.svg": [3, 4, 5, 6, 8, 9, 10],
  "blouse-model-39-el-hato.svg": [11, 12, 13, 14, 15, 19, 20, 21],
};

const internalCollarTrimElementIndexesByFileName: Record<
  string,
  { left: number[]; right: number[] }
> = {
  "blouse-model-10.svg": {
    left: [3],
    right: [4],
  },
  "blouse-model-50-20-20.svg": {
    left: [1],
    right: [2],
  },
};

const internalCollarTrimOverlayByFileName: Record<
  string,
  { left: string; right: string }
> = {
  "blouse-model-02-jdc.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-02-jdc-collar-v-internal-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-02-jdc-collar-v-internal-right.svg",
  },
  "blouse-model-01.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-internal-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-internal-right.svg",
  },
  "blouse-model-08.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-08-internal-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-08-internal-right.svg",
  },
  "blouse-model-50-20-20.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-50-20-20-internal-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-50-20-20-internal-right.svg",
  },
  "blouse-model-30.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-internal-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-internal-right.svg",
  },
};

const innerCollarTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-44-cucuta.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-44-cucuta-inner-collar.svg",
  "blouse-model-41-matrioska.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-41-matrioska-inner-collar.svg",
};

const externalCollarTrimOverlayByFileName: Record<
  string,
  { left: string; right: string }
> = {
  "blouse-model-02-jdc.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-02-jdc-collar-v-external-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-02-jdc-collar-v-external-right.svg",
  },
  "blouse-model-01.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-external-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-external-right.svg",
  },
  "blouse-model-25-20-21.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-25-20-21-external-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-25-20-21-external-right.svg",
  },
  "blouse-model-12-cherokee.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-12-cherokee-external-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-12-cherokee-external-right.svg",
  },
  "blouse-model-30.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-external-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-external-right.svg",
  },
};

const defaultExternalCollarLineFileNames = new Set(["blouse-model-01.svg"]);

const thickInteriorCollarTrimOverlayByFileName: Record<
  string,
  { left: string; right: string }
> = {
  "blouse-model-30.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-thick-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-thick-right.svg",
  },
};

const lowerCollarTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-30.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-lower.svg",
};

const completeInteriorCollarTrimOverlayByFileName: Record<
  string,
  { left: string; right: string }
> = {
  "blouse-model-02-jdc.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-02-jdc-collar-v-complete-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-02-jdc-collar-v-complete-right.svg",
  },
  "blouse-model-01.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-complete-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-complete-right.svg",
  },
  "blouse-model-30.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-complete-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-complete-right.svg",
  },
};

const flapTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-22-estrella.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-22-estrella-aletas.svg",
};

const backNeckTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-44-cucuta.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-44-cucuta-back-neck.svg",
};

const backNeckTrimElementIndexesByFileName: Record<string, number[]> = {};

const backNeckTrimPathDataByFileName: Record<string, string> = {
  "blouse-model-30.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-21-deportivo.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-22-estrella.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-23-polo.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-24-botones.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-25-20-21.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-26-cuello-redondo.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-27-cremallera.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-28-modelo-29.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-29-pedagogia.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-40-mariposa.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-41-matrioska.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-42.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-43.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-09.svg": "M316 130 C390 150 478 163 568 127",
};

const backNeckTrimVerticalOffsetByFileName: Record<string, number> = {
  "blouse-model-01.svg": BACK_NECK_LOWERED_STRAIGHT_VERTICAL_OFFSET,
  "blouse-model-04.svg": BACK_NECK_LOWERED_STRAIGHT_VERTICAL_OFFSET,
  "blouse-model-11-fisiopracticas.svg":
    BACK_NECK_LOWERED_STRAIGHT_VERTICAL_OFFSET,
  "blouse-model-13-p-paipilla.svg": BACK_NECK_LOWERED_STRAIGHT_VERTICAL_OFFSET,
  "blouse-model-15-presillas.svg": BACK_NECK_LOWERED_STRAIGHT_VERTICAL_OFFSET,
};

const lowerPocketTrimModeByFileName: Record<string, "band" | "ink"> = {
  "blouse-model-14.svg": "band",
  "blouse-model-15.svg": "ink",
  "blouse-model-19.svg": "ink",
  "blouse-model-20.svg": "ink",
  "blouse-model-33-oriental-lower-pocket.svg": "ink",
};

const POCKET_TRIM_BAND_HEIGHT = 18;
const POCKET_TRIM_HORIZONTAL_PAD = 8;
const POCKET_TRIM_LINE_WIDTH = 5;
const POCKET_TRIM_LINE_HORIZONTAL_INSET = 4;
const POCKET_TRIM_OUTLINE_LINE_WIDTH = 11;

const collarTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-15-presillas.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-15-presillas-collar.svg",
  "blouse-model-22-estrella.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-22-estrella-collar.svg",
  "blouse-model-24-botones.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-24-botones-collar.svg",
  "blouse-model-26-cuello-redondo.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-26-cuello-redondo-collar.svg",
  "blouse-model-43.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-43-enfermera-ub-collar.svg",
  "blouse-model-08.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-08-collar.svg",
  "blouse-model-34-cuello-alto-cremallera.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-34-cuello-alto-cremallera-collar.svg",
  "blouse-model-37-cirugia.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-37-cirugia-collar.svg",
  "blouse-model-11-fisiopracticas.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-11-fisiopracticas-collar.svg",
  "blouse-model-13-p-paipilla.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-13-p-paipilla-collar.svg",
};

const collarRingsTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-09.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-09-ovalado-collar-arc.svg",
  "blouse-model-15-presillas.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-15-presillas-rings.svg",
};

const filledCollarTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-39-el-hato.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-39-el-hato-complete-collar-fill.svg",
};

const highCollarTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-39-el-hato.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-39-el-hato-high-collar-fill.svg",
  "blouse-model-37-cirugia.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-37-cirugia-high-collar.svg",
};

const dividedCollarTrimOverlayByFileName: Record<
  string,
  { upper: string; lower: string }
> = {
  "blouse-model-04.svg": {
    upper:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-04-mariposa-dividido-upper.svg",
    lower:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-04-mariposa-dividido-lower.svg",
  },
  "blouse-model-28-modelo-29.svg": {
    upper:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-28-modelo-29-divided-upper.svg",
    lower:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-28-modelo-29-divided-lower.svg",
  },
};

const completeCollarOnlyFileNames = new Set([
  "blouse-model-39-el-hato.svg",
  "blouse-model-37-cirugia.svg",
  "blouse-model-43.svg",
  "blouse-model-11-fisiopracticas.svg",
  "blouse-model-13-p-paipilla.svg",
]);

const noCollarTrimFileNames = new Set([
  "blouse-model-02-jdc.svg",
  "blouse-model-04.svg",
  "blouse-model-44-cucuta.svg",
  "blouse-model-09.svg",
  "blouse-model-21-deportivo.svg",
  "blouse-model-50-20-20.svg",
  "blouse-model-06-puntas.svg",
  "blouse-model-23-polo.svg",
  "blouse-model-25-20-21.svg",
  "blouse-model-27-cremallera.svg",
  "blouse-model-28-modelo-29.svg",
  "blouse-model-29-pedagogia.svg",
  "blouse-model-33-oriental.svg",
  "blouse-model-40-mariposa.svg",
  "blouse-model-41-matrioska.svg",
]);

const noBackNeckTrimFileNames = new Set([
  "blouse-model-08.svg",
  "blouse-model-33-oriental.svg",
  "blouse-model-39-el-hato.svg",
]);

export function getOverlayRegionPreset(
  key: keyof typeof overlayRegionPresets,
): OverlayRegion[] {
  return overlayRegionPresets[key];
}

function getLowerPocketOverlayRegions(
  sourceSrc: string,
  layout: PreviewScene["lowerPocketLayout"],
) {
  const fileName = getFileNameFromSource(sourceSrc);
  const override = lowerPocketOverlayRegionsByFileName[fileName];

  if (override) {
    const singleRegion = override[1] ?? override[0];
    return layout === "single" && singleRegion ? [singleRegion] : override;
  }

  return getOverlayRegionPreset(
    layout === "single" ? "lowerPocketSingleRight" : "lowerPocketPair",
  );
}

type ProcessedImage = {
  canvas: HTMLCanvasElement;
  bounds: { x: number; y: number; width: number; height: number };
};

const imageCache = new Map<string, Promise<ProcessedImage>>();
const maskCache = new Map<string, Promise<HTMLCanvasElement>>();
const rasterCache = new Map<string, Promise<HTMLCanvasElement>>();
const detailOverlayCache = new Map<string, Promise<HTMLCanvasElement>>();
const svgObjectUrlCache = new Map<string, Promise<string>>();
const lowerPocketDetailObjectUrlCache = new Map<string, Promise<string>>();
const lowerPocketTrimObjectUrlCache = new Map<string, Promise<string>>();
const collarTrimObjectUrlCache = new Map<string, Promise<string>>();
const collarRingsTrimValueIds = new Set([2897, 2898, 2899]);

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function isBlouseScene(scene: PreviewScene, baseAssetSrc?: string) {
  const normalizedProductName = normalize(scene.productName);

  return (
    !normalizedProductName.includes("pantalon") &&
    (normalizedProductName.includes("blusa") ||
      normalizedProductName.includes("uniforme") ||
      Boolean(baseAssetSrc?.includes("blusa-antifluido")))
  );
}

function getLogoMarkerPositions(placement: string) {
  const positions: Array<{ x: number; y: number }> = [];
  const selectedPlacements = placement
    .split(",")
    .map((value) => normalize(value))
    .filter(Boolean);

  for (const key of selectedPlacements) {
    if (
      key.includes("bolsillo") &&
      key.includes("pecho") &&
      key.includes("izquierd")
    ) {
      positions.push(LOGO_MARKER_POSITIONS.chestPocketLeft);
      continue;
    }

    if (
      key.includes("bolsillo") &&
      key.includes("inferior") &&
      key.includes("izquierd")
    ) {
      positions.push(LOGO_MARKER_POSITIONS.lowerLeft);
      continue;
    }

    if (
      key.includes("bolsillo") &&
      key.includes("inferior") &&
      key.includes("derech")
    ) {
      positions.push(LOGO_MARKER_POSITIONS.lowerRight);
      continue;
    }

    if (key.includes("pecho") && key.includes("izquierd")) {
      positions.push(LOGO_MARKER_POSITIONS.chestLeft);
      continue;
    }

    if (key.includes("pecho") && key.includes("derech")) {
      positions.push(LOGO_MARKER_POSITIONS.chestRight);
    }
  }

  return positions;
}

function isSvgSource(src: string) {
  return src.split("?")[0]?.toLowerCase().endsWith(".svg") ?? false;
}

function getFileNameFromSource(src: string) {
  return decodeURIComponent(src.split("?")[0]?.split("/").pop() ?? "");
}

function getTrimSectionColor(
  scene: PreviewScene,
  matcher: (section: PreviewScene["trimSections"][number]) => boolean,
) {
  return scene.trimSections.find(matcher)?.colorHex;
}

function getTrimSectionText(section: PreviewScene["trimSections"][number]) {
  return normalize(`${section.label} ${section.key}`);
}

function isPespunteTrimSection(section: PreviewScene["trimSections"][number]) {
  return getTrimSectionText(section).includes("pespunte");
}

function isWholeCollarSection(section: PreviewScene["trimSections"][number]) {
  const key = getTrimSectionText(section);

  return (
    normalize(section.label || section.key) === "cuello" ||
    key.includes("cuello alto") ||
    key.includes("cuello-alto")
  );
}

function isHighCollarSection(section: PreviewScene["trimSections"][number]) {
  const key = getTrimSectionText(section);

  return key.includes("cuello alto") || key.includes("cuello-alto");
}

function isCompleteCollarSection(section: PreviewScene["trimSections"][number]) {
  const key = getTrimSectionText(section);

  return key.includes("cuello completo") || key.includes("cuello-completo");
}

function isInnerCollarTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return key.includes("cuello interno") || key.includes("cuello-interno");
}

function isCollarRingsSection(section: PreviewScene["trimSections"][number]) {
  const key = getTrimSectionText(section);

  return (
    collarRingsTrimValueIds.has(section.valueId) ||
    key.includes("cuello aros") ||
    key.includes("cuello-aros") ||
    key.includes("cuello arco") ||
    key.includes("cuello-arco") ||
    key.includes("cuello arcos") ||
    key.includes("cuello-arcos")
  );
}

function isCollarStitchesSection(section: PreviewScene["trimSections"][number]) {
  const key = getTrimSectionText(section);

  return key.includes("cuello puntadas") || key.includes("cuello-puntadas");
}

function isUpperDividedCollarSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello borde dividido superior") ||
    key.includes("cuello-borde-dividido-superior")
  );
}

function isLowerDividedCollarSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello borde dividido inferior") ||
    key.includes("cuello-borde-dividido-inferior")
  );
}

function isLeftInternalCollarSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello v lineal interno izquierdo") ||
    key.includes("cuello-v-lineal-interno-izquierdo")
  );
}

function isRightInternalCollarSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello v lineal interno derecho") ||
    key.includes("cuello-v-lineal-interno-derecho")
  );
}

function isLeftExternalCollarSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello v lineal externo izquierdo") ||
    key.includes("cuello-v-lineal-externo-izquierdo")
  );
}

function isRightExternalCollarSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello v lineal externo derecho") ||
    key.includes("cuello-v-lineal-externo-derecho")
  );
}

function isLeftThickInteriorCollarSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello interior grueso izquierdo") ||
    key.includes("cuello-interior-grueso-izquierdo")
  );
}

function isRightThickInteriorCollarSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello interior grueso derecho") ||
    key.includes("cuello-interior-grueso-derecho")
  );
}

function isLeftCompleteInteriorCollarSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello v completo interior izquierdo") ||
    key.includes("cuello-v-completo-interior-izquierdo")
  );
}

function isRightCompleteInteriorCollarSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello v completo interior derecho") ||
    key.includes("cuello-v-completo-interior-derecho")
  );
}

function isLowerCollarSection(section: PreviewScene["trimSections"][number]) {
  const key = getTrimSectionText(section);

  return key.includes("cuello inferior") || key.includes("cuello-inferior");
}

function isLowerPocketTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return section.role === "lowerPockets" || key.includes("bolsillos inferiores");
}

function isLowerPocketRingsTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = normalize(section.label || section.key);

  return (
    key === "aros" ||
    key === "aro" ||
    key.includes("aros bolsillo") ||
    key.includes("aros-bolsillo") ||
    key.includes("bolsillo aros") ||
    key.includes("bolsillo-aros")
  );
}

function isLowerPocketLowerTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    isLowerPocketTrimSection(section) &&
    (key.includes("parte baja") ||
      key.includes("parte-baja") ||
      key.includes("parte inferior") ||
      key.includes("parte-inferior"))
  );
}

function isLowerPocketCompleteTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    isLowerPocketTrimSection(section) &&
    (key.includes("completa") ||
      key.includes("completo") ||
      key.includes("complete"))
  );
}

function isLowerPocketUpperTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  return (
    isLowerPocketTrimSection(section) &&
    !isLowerPocketCompleteTrimSection(section) &&
    !isLowerPocketLowerTrimSection(section)
  );
}

function isAuxiliaryPocketTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  if (
    key.includes("bolsillos inferiores") ||
    key.includes("bolsillos-inferiores")
  ) {
    return false;
  }

  return (
    section.role === "auxiliaryPocket" ||
    key.includes("bolsillo auxiliar") ||
    key.includes("bolsillo-auxiliar")
  );
}

function isPantsSidePocketTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("bolsillo lateral de pantalon") ||
    key.includes("bolsillo-lateral-de-pantalon") ||
    (key.includes("bolsillo lateral") && key.includes("pantalon"))
  );
}

function isPantsKneePatchTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    !hasPantsKneePatchSideTerm(key) &&
    (key.includes("parche rodilla") ||
      key.includes("parche-rodilla") ||
      (key.includes("parche") && key.includes("rodilla")))
  );
}

function hasPantsKneePatchSideTerm(key: string) {
  return key.includes("derecha") || key.includes("izquierda");
}

function isPantsKneePatchRightTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("parche") &&
    key.includes("rodilla") &&
    key.includes("derecha")
  );
}

function isPantsKneePatchLeftTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("parche") &&
    key.includes("rodilla") &&
    key.includes("izquierda")
  );
}

function isPantsKneePatchUpperLinearTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    !hasPantsKneePatchSideTerm(key) &&
    (key.includes("rodilla lineal superior") ||
      key.includes("rodilla-lineal-superior") ||
      (key.includes("rodilla") &&
        key.includes("lineal") &&
        key.includes("superior")))
  );
}

function isPantsKneePatchLowerLinearTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    !hasPantsKneePatchSideTerm(key) &&
    (key.includes("rodilla lineal inferior") ||
      key.includes("rodilla-lineal-inferior") ||
      (key.includes("rodilla") &&
        key.includes("lineal") &&
        key.includes("inferior")))
  );
}

function isPantsKneePatchRightUpperLinearTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("rodilla") &&
    key.includes("derecha") &&
    key.includes("lineal") &&
    key.includes("superior")
  );
}

function isPantsKneePatchLeftUpperLinearTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("rodilla") &&
    key.includes("izquierda") &&
    key.includes("lineal") &&
    key.includes("superior")
  );
}

function isPantsKneePatchRightLowerLinearTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("rodilla") &&
    key.includes("derecha") &&
    key.includes("lineal") &&
    key.includes("inferior")
  );
}

function isPantsKneePatchLeftLowerLinearTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("rodilla") &&
    key.includes("izquierda") &&
    key.includes("lineal") &&
    key.includes("inferior")
  );
}

function isPantsKneePatchRightRingTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("aro rodilla derecha") ||
    key.includes("aro-rodilla-derecha") ||
    (key.includes("aro") && key.includes("rodilla") && key.includes("derecha"))
  );
}

function isPantsKneePatchLeftRingTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("aro rodilla izquierda") ||
    key.includes("aro-rodilla-izquierda") ||
    (key.includes("aro") &&
      key.includes("rodilla") &&
      key.includes("izquierda"))
  );
}

function isPantsKneePatchRightVerticalZipperTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cremallera rodilla derecha") ||
    key.includes("cremallera-rodilla-derecha") ||
    (key.includes("cremallera") &&
      key.includes("rodilla") &&
      key.includes("derecha"))
  );
}

function isPantsKneePatchLeftVerticalZipperTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cremallera rodilla izquierda") ||
    key.includes("cremallera-rodilla-izquierda") ||
    (key.includes("cremallera") &&
      key.includes("rodilla") &&
      key.includes("izquierda"))
  );
}

function isPantsKneePatchRightButtonTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("boton") &&
    key.includes("rodilla") &&
    key.includes("derecha")
  );
}

function isPantsKneePatchLeftButtonTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("boton") &&
    key.includes("rodilla") &&
    key.includes("izquierda")
  );
}

function isChestPocketTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    section.role === "chestPocket" ||
    key.includes("bolsillo pecho") ||
    key.includes("bolsillo de pecho")
  );
}

function isChestPocketUpperTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("bolsillo pecho superior") ||
    key.includes("bolsillo de pecho superior") ||
    key.includes("bolsillo-pecho-superior")
  );
}

function isChestPocketLowerTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("bolsillo pecho inferior") ||
    key.includes("bolsillo de pecho inferior") ||
    key.includes("bolsillo-pecho-inferior")
  );
}

function isZipperTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  return normalize(section.label || section.key) === "cremallera";
}

function isSleeveTabTrimSection(section: PreviewScene["trimSections"][number]) {
  const key = getTrimSectionText(section);

  return key.includes("presilla");
}

function isSleeveUpperTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("manga lineal superior") ||
    key.includes("manga-lineal-superior")
  );
}

function isSleeveLowerTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("manga lineal inferior") ||
    key.includes("manga-lineal-inferior")
  );
}

function isSleeveFillTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return key.includes("manga rellena") || key.includes("manga-rellena");
}

function isFlapTrimSection(section: PreviewScene["trimSections"][number]) {
  const key = getTrimSectionText(section);

  return key.includes("aletas");
}

function isBackNeckTrimSection(section: PreviewScene["trimSections"][number]) {
  const key = normalize(section.label || section.key);

  return (
    section.role === "backNeck" ||
    key.includes("cogotera") ||
    key.includes("cuello-trasero") ||
    key.includes("cuello trasero")
  );
}

function getSvgViewBox(svgText: string) {
  const match = svgText.match(
    /viewBox=["']\s*([-\d.]+)[,\s]+([-\d.]+)[,\s]+([-\d.]+)[,\s]+([-\d.]+)\s*["']/i,
  );

  if (!match) {
    return undefined;
  }

  const width = Number(match[3]);
  const height = Number(match[4]);

  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return undefined;
  }

  return { width, height };
}

function withExplicitSvgDimensions(svgText: string) {
  const viewBox = getSvgViewBox(svgText);

  if (!viewBox) {
    return svgText;
  }

  const aspectRatio = viewBox.width / viewBox.height;
  let renderWidth = Math.max(Math.round(viewBox.width), CANVAS_WIDTH);
  let renderHeight = Math.round(renderWidth / aspectRatio);

  if (renderHeight < CANVAS_HEIGHT) {
    renderHeight = CANVAS_HEIGHT;
    renderWidth = Math.round(renderHeight * aspectRatio);
  }

  return svgText.replace(/<svg\b([^>]*)>/i, (match, attributes: string) => {
    const widthAttribute = /\swidth\s*=/.test(attributes)
      ? ""
      : ` width="${renderWidth}"`;
    const heightAttribute = /\sheight\s*=/.test(attributes)
      ? ""
      : ` height="${renderHeight}"`;

    if (!widthAttribute && !heightAttribute) {
      return match;
    }

    return `<svg${attributes}${widthAttribute}${heightAttribute}>`;
  });
}

async function getRenderableSvgObjectUrl(src: string) {
  const existing = svgObjectUrlCache.get(src);

  if (existing) {
    return await existing;
  }

  const promise = (async () => {
    const response = await fetch(src);

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${src}`);
    }

    const svgText = await response.text();
    const blob = new Blob([withExplicitSvgDimensions(svgText)], {
      type: "image/svg+xml",
    });

    return URL.createObjectURL(blob);
  })();

  svgObjectUrlCache.set(src, promise);
  return await promise;
}

function buildSvgFromDrawableIndexes(svgText: string, indexes: number[]) {
  const rootAttributes = svgText.match(/<svg\b([^>]*)>/i)?.[1] ?? "";
  const defs = svgText.match(/<defs\b[\s\S]*?<\/defs>/i)?.[0] ?? "";
  const drawableTags = [
    ...svgText.matchAll(
      /<(?:path|rect|line|polyline|polygon|ellipse|circle)\b[^>]*\/?>/gi,
    ),
  ].map((match) => match[0]);
  const selectedTags = indexes
    .map((index) => drawableTags[index])
    .filter((tag): tag is string => Boolean(tag));

  return withExplicitSvgDimensions(
    `<svg${rootAttributes}>${defs}${selectedTags.join("")}</svg>`,
  );
}

async function getLowerPocketDetailObjectUrl(src: string) {
  const fileName = getFileNameFromSource(src);
  const detailIndexes = lowerPocketDetailElementIndexesByFileName[fileName];

  if (!detailIndexes) {
    return undefined;
  }

  const existing = lowerPocketDetailObjectUrlCache.get(src);

  if (existing) {
    return await existing;
  }

  const promise = (async () => {
    const response = await fetch(src);

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${src}`);
    }

    const svgText = await response.text();
    const blob = new Blob([buildSvgFromDrawableIndexes(svgText, detailIndexes)], {
      type: "image/svg+xml",
    });

    return URL.createObjectURL(blob);
  })();

  lowerPocketDetailObjectUrlCache.set(src, promise);
  return await promise;
}

async function getLowerPocketTrimObjectUrl(src: string) {
  const fileName = getFileNameFromSource(src);
  const overlaySrc = lowerPocketTrimOverlayByFileName[fileName];

  if (overlaySrc) {
    return overlaySrc;
  }

  const trimIndexes = lowerPocketTrimElementIndexesByFileName[fileName];

  if (!trimIndexes) {
    return undefined;
  }

  const existing = lowerPocketTrimObjectUrlCache.get(src);

  if (existing) {
    return await existing;
  }

  const promise = (async () => {
    const response = await fetch(src);

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${src}`);
    }

    const svgText = await response.text();
    const blob = new Blob([buildSvgFromDrawableIndexes(svgText, trimIndexes)], {
      type: "image/svg+xml",
    });

    return URL.createObjectURL(blob);
  })();

  lowerPocketTrimObjectUrlCache.set(src, promise);
  return await promise;
}

async function getCollarTrimObjectUrl(
  src: string,
  trimIndexesOverride?: number[],
) {
  const fileName = getFileNameFromSource(src);
  const trimIndexes =
    trimIndexesOverride ?? collarTrimElementIndexesByFileName[fileName];

  if (!trimIndexes) {
    return undefined;
  }

  const cacheKey = `${src}::${trimIndexes.join(",")}`;
  const existing = collarTrimObjectUrlCache.get(cacheKey);

  if (existing) {
    return await existing;
  }

  const promise = (async () => {
    const response = await fetch(src);

    if (!response.ok) {
      throw new Error(`No se pudo cargar ${src}`);
    }

    const svgText = await response.text();
    const blob = new Blob([buildSvgFromDrawableIndexes(svgText, trimIndexes)], {
      type: "image/svg+xml",
    });

    return URL.createObjectURL(blob);
  })();

  collarTrimObjectUrlCache.set(cacheKey, promise);
  return await promise;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const imageSrc = isSvgSource(src) ? await getRenderableSvgObjectUrl(src) : src;

  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    image.src = imageSrc;
  });
}

async function getProcessedImage(src: string): Promise<ProcessedImage> {
  const existing = imageCache.get(src);
  if (existing) {
    return await existing;
  }

  const promise = (async () => {
    const image = await loadImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("No se pudo procesar la imagen.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let minX = canvas.width;
    let minY = canvas.height;
    let maxX = 0;
    let maxY = 0;
    let hasInk = false;

    for (let offset = 0; offset < data.length; offset += 4) {
      const red = data[offset] ?? 0;
      const green = data[offset + 1] ?? 0;
      const blue = data[offset + 2] ?? 0;
      const alpha = data[offset + 3] ?? 0;

      const isWhiteLike =
        alpha > 0 && red >= 240 && green >= 240 && blue >= 240;

      if (isWhiteLike) {
        data[offset + 3] = 0;
        continue;
      }

      if (alpha === 0) {
        continue;
      }

      const index = offset / 4;
      const x = index % canvas.width;
      const y = Math.floor(index / canvas.width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      hasInk = true;
    }

    context.putImageData(imageData, 0, 0);

    return {
      canvas,
      bounds: hasInk
        ? {
            x: minX,
            y: minY,
            width: maxX - minX + 1,
            height: maxY - minY + 1,
          }
        : { x: 0, y: 0, width: canvas.width, height: canvas.height },
    };
  })();

  imageCache.set(src, promise);
  return await promise;
}

function drawGarmentBase(
  context: CanvasRenderingContext2D,
  fillColor: string,
) {
  const body = new Path2D(`
    M250 180
    L180 290
    L235 355
    L270 330
    L300 980
    L600 980
    L630 330
    L665 355
    L720 290
    L650 180
    L560 140
    L340 140
    Z
  `);

  const neck = new Path2D("M405 140 C420 210 480 210 495 140");

  context.fillStyle = fillColor;
  context.strokeStyle = "#0f172a";
  context.lineWidth = 10;
  context.lineJoin = "round";
  context.lineCap = "round";
  context.fill(body);
  context.stroke(body);
  context.stroke(neck);

  context.strokeStyle = "#94a3b8";
  context.lineWidth = 4;
  context.setLineDash([18, 12]);
  context.beginPath();
  context.moveTo(450, 205);
  context.lineTo(450, 978);
  context.stroke();
  context.setLineDash([]);
}

function drawFallbackGarmentFill(
  context: CanvasRenderingContext2D,
  fillColor: string,
) {
  const body = new Path2D(`
    M250 180
    L180 290
    L235 355
    L270 330
    L300 980
    L600 980
    L630 330
    L665 355
    L720 290
    L650 180
    L560 140
    L340 140
    Z
  `);

  context.fillStyle = fillColor;
  context.fill(body);
}

function getDrawRect(bounds: ProcessedImage["bounds"]) {
  const scale = Math.min(
    TARGET_RECT.width / bounds.width,
    TARGET_RECT.height / bounds.height,
  );
  const drawWidth = bounds.width * scale;
  const drawHeight = bounds.height * scale;
  const drawX = TARGET_RECT.x + (TARGET_RECT.width - drawWidth) / 2;
  const drawY = TARGET_RECT.y + (TARGET_RECT.height - drawHeight) / 2;

  return {
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  };
}

async function getInteriorMask(src: string) {
  const existing = maskCache.get(src);
  if (existing) {
    return await existing;
  }

  const promise = (async () => {
    const processed = await getProcessedImage(src);
    const sourceContext = processed.canvas.getContext("2d");

    if (!sourceContext) {
      throw new Error("No se pudo crear la mascara de color.");
    }

    const { width, height } = processed.canvas;
    const imageData = sourceContext.getImageData(0, 0, width, height);
    const data = imageData.data;
    const pixelCount = width * height;
    const ink = new Uint8Array(pixelCount);
    const outside = new Uint8Array(pixelCount);
    const queue: number[] = [];

    for (let index = 0; index < pixelCount; index += 1) {
      const alpha = data[index * 4 + 3] ?? 0;
      if (alpha > 20) {
        ink[index] = 1;
      }
    }

    function enqueue(index: number) {
      if (index < 0 || index >= pixelCount || ink[index] || outside[index]) {
        return;
      }

      outside[index] = 1;
      queue.push(index);
    }

    for (let x = 0; x < width; x += 1) {
      enqueue(x);
      enqueue((height - 1) * width + x);
    }

    for (let y = 0; y < height; y += 1) {
      enqueue(y * width);
      enqueue(y * width + (width - 1));
    }

    while (queue.length > 0) {
      const index = queue.shift();
      if (index === undefined) {
        break;
      }

      const x = index % width;
      const y = Math.floor(index / width);

      if (x > 0) {
        enqueue(index - 1);
      }
      if (x < width - 1) {
        enqueue(index + 1);
      }
      if (y > 0) {
        enqueue(index - width);
      }
      if (y < height - 1) {
        enqueue(index + width);
      }
    }

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskContext = maskCanvas.getContext("2d");

    if (!maskContext) {
      throw new Error("No se pudo dibujar la mascara de color.");
    }

    const maskImageData = maskContext.createImageData(width, height);
    const maskData = maskImageData.data;

    for (let index = 0; index < pixelCount; index += 1) {
      if (ink[index] || outside[index]) {
        continue;
      }

      const offset = index * 4;
      maskData[offset] = 255;
      maskData[offset + 1] = 255;
      maskData[offset + 2] = 255;
      maskData[offset + 3] = 255;
    }

    maskContext.putImageData(maskImageData, 0, 0);
    return maskCanvas;
  })();

  maskCache.set(src, promise);
  return await promise;
}

function drawTrimSections(
  context: CanvasRenderingContext2D,
  scene: PreviewScene,
) {
  for (const section of scene.trimSections) {
    const key = normalize(section.label || section.key);
    context.save();
    context.strokeStyle = section.colorHex;
    context.fillStyle = section.colorHex;
    context.lineWidth = 10;
    context.lineJoin = "round";
    context.lineCap = "round";

    if (key.includes("frente") || key.includes("central")) {
      context.beginPath();
      context.moveTo(450, 205);
      context.lineTo(450, 978);
      context.stroke();
    }

    context.restore();
  }
}

async function drawFullOverlay(
  context: CanvasRenderingContext2D,
  src: string,
) {
  const rasterCanvas = await createRasterCanvas(src);
  context.drawImage(rasterCanvas, 0, 0);
}

export async function createRasterCanvas(src: string, placementSrc = src) {
  const cacheKey = `${src}::${placementSrc}`;
  const existing = rasterCache.get(cacheKey);
  if (existing) {
    return await existing;
  }

  const promise = (async () => {
    const [processed, placement] = await Promise.all([
      getProcessedImage(src),
      placementSrc === src ? getProcessedImage(src) : getProcessedImage(placementSrc),
    ]);
    const { bounds } = placement;
    const { drawX, drawY, drawWidth, drawHeight } = getDrawRect(bounds);
    const rasterCanvas = document.createElement("canvas");
    rasterCanvas.width = CANVAS_WIDTH;
    rasterCanvas.height = CANVAS_HEIGHT;
    const rasterContext = rasterCanvas.getContext("2d");

    if (!rasterContext) {
      throw new Error("No se pudo rasterizar el asset.");
    }

    rasterContext.imageSmoothingEnabled = true;
    rasterContext.imageSmoothingQuality = "high";
    rasterContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    rasterContext.drawImage(
      processed.canvas,
      bounds.x,
      bounds.y,
      bounds.width,
      bounds.height,
      drawX,
      drawY,
      drawWidth,
      drawHeight,
    );

    return rasterCanvas;
  })();

  rasterCache.set(cacheKey, promise);
  return await promise;
}

function hasNearbyInk(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  radius: number,
) {
  const minY = Math.max(0, y - radius);
  const maxY = Math.min(height - 1, y + radius);
  const minX = Math.max(0, x - radius);
  const maxX = Math.min(width - 1, x + radius);

  for (let sampleY = minY; sampleY <= maxY; sampleY += 1) {
    for (let sampleX = minX; sampleX <= maxX; sampleX += 1) {
      const offset = (sampleY * width + sampleX) * 4;
      const alpha = data[offset + 3] ?? 0;

      if (alpha > 24) {
        return true;
      }
    }
  }

  return false;
}

async function getDetailOverlay(
  sourceSrc: string,
  baseSrc: string,
  regions: OverlayRegion[],
  inkRadius = 4,
) {
  const cacheKey = `${sourceSrc}::${baseSrc}::${regions
    .map((region) => `${region.x},${region.y},${region.width},${region.height}`)
    .join("|")}::${inkRadius}`;

  const existing = detailOverlayCache.get(cacheKey);
  if (existing) {
    return await existing;
  }

  const promise = (async () => {
    const [sourceCanvas, baseCanvas] = await Promise.all([
      createRasterCanvas(sourceSrc),
      createRasterCanvas(baseSrc),
    ]);

    const sourceContext = sourceCanvas.getContext("2d");
    const baseContext = baseCanvas.getContext("2d");

    if (!sourceContext || !baseContext) {
      throw new Error("No se pudo preparar el overlay de detalle.");
    }

    const sourceData = sourceContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const baseData = baseContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    const outputCanvas = document.createElement("canvas");
    outputCanvas.width = CANVAS_WIDTH;
    outputCanvas.height = CANVAS_HEIGHT;
    const outputContext = outputCanvas.getContext("2d");

    if (!outputContext) {
      throw new Error("No se pudo crear el canvas de detalle.");
    }

    const outputImageData = outputContext.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);
    const outputData = outputImageData.data;
    const sourcePixels = sourceData.data;
    const basePixels = baseData.data;

    for (const region of regions) {
      const startX = Math.max(0, Math.floor(region.x));
      const endX = Math.min(CANVAS_WIDTH, Math.ceil(region.x + region.width));
      const startY = Math.max(0, Math.floor(region.y));
      const endY = Math.min(CANVAS_HEIGHT, Math.ceil(region.y + region.height));

      for (let y = startY; y < endY; y += 1) {
        for (let x = startX; x < endX; x += 1) {
          const offset = (y * CANVAS_WIDTH + x) * 4;
          const sourceAlpha = sourcePixels[offset + 3] ?? 0;

          if (sourceAlpha <= 24) {
            continue;
          }

          if (
            hasNearbyInk(basePixels, CANVAS_WIDTH, CANVAS_HEIGHT, x, y, inkRadius)
          ) {
            continue;
          }

          outputData[offset] = sourcePixels[offset] ?? 0;
          outputData[offset + 1] = sourcePixels[offset + 1] ?? 0;
          outputData[offset + 2] = sourcePixels[offset + 2] ?? 0;
          outputData[offset + 3] = sourceAlpha;
        }
      }
    }

    outputContext.putImageData(outputImageData, 0, 0);
    return outputCanvas;
  })();

  detailOverlayCache.set(cacheKey, promise);
  return await promise;
}

async function drawTintedBaseFromAsset(
  context: CanvasRenderingContext2D,
  src: string,
  fillColor: string,
) {
  const baseCanvas = await createTintedBaseCanvas(src, fillColor);
  context.drawImage(baseCanvas, 0, 0);
}

async function drawOverlayInRegions(
  context: CanvasRenderingContext2D,
  src: string,
  regions: Array<{ x: number; y: number; width: number; height: number }>,
) {
  for (const region of regions) {
    context.save();
    context.beginPath();
    context.rect(region.x, region.y, region.width, region.height);
    context.clip();
    await drawFullOverlay(context, src);
    context.restore();
  }
}

function recolorCanvasInk(canvas: HTMLCanvasElement, colorHex: string) {
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = canvas.width;
  outputCanvas.height = canvas.height;
  const outputContext = outputCanvas.getContext("2d");

  if (!outputContext) {
    throw new Error("No se pudo colorear el detalle del asset.");
  }

  outputContext.drawImage(canvas, 0, 0);
  outputContext.globalCompositeOperation = "source-in";
  outputContext.fillStyle = colorHex;
  outputContext.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  outputContext.globalCompositeOperation = "source-over";

  return outputCanvas;
}

function createCanvasInkOutline(
  canvas: HTMLCanvasElement,
  outlineColor = "#f8fafc",
  radius = 7,
) {
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = canvas.width;
  outputCanvas.height = canvas.height;
  const outputContext = outputCanvas.getContext("2d");

  if (!outputContext) {
    throw new Error("No se pudo contornear el detalle del asset.");
  }

  for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
    for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
      if (offsetX * offsetX + offsetY * offsetY > radius * radius) {
        continue;
      }

      outputContext.drawImage(canvas, offsetX, offsetY);
    }
  }

  outputContext.globalCompositeOperation = "source-in";
  outputContext.fillStyle = outlineColor;
  outputContext.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
  outputContext.globalCompositeOperation = "source-over";

  return outputCanvas;
}

function drawCanvasInRegions(
  context: CanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement,
  regions: OverlayRegion[],
) {
  for (const region of regions) {
    context.save();
    context.beginPath();
    context.rect(region.x, region.y, region.width, region.height);
    context.clip();
    context.drawImage(sourceCanvas, 0, 0);
    context.restore();
  }
}

function getCanvasInkBoundsInRegion(
  canvas: HTMLCanvasElement,
  region: OverlayRegion,
) {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("No se pudo analizar el vivo del bolsillo.");
  }

  const startX = Math.max(0, Math.floor(region.x));
  const startY = Math.max(0, Math.floor(region.y));
  const endX = Math.min(canvas.width, Math.ceil(region.x + region.width));
  const endY = Math.min(canvas.height, Math.ceil(region.y + region.height));
  const width = endX - startX;
  const height = endY - startY;

  if (width <= 0 || height <= 0) {
    return undefined;
  }

  const imageData = context.getImageData(startX, startY, width, height);
  const data = imageData.data;
  let minX = endX;
  let minY = endY;
  let maxX = startX;
  let maxY = startY;
  let hasInk = false;

  for (let offset = 0; offset < data.length; offset += 4) {
    const alpha = data[offset + 3] ?? 0;

    if (alpha <= 24) {
      continue;
    }

    const localIndex = offset / 4;
    const x = startX + (localIndex % width);
    const y = startY + Math.floor(localIndex / width);

    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    hasInk = true;
  }

  if (!hasInk) {
    return undefined;
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

function getCanvasInkBounds(canvas: HTMLCanvasElement) {
  return getCanvasInkBoundsInRegion(canvas, {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
  });
}

function buildPocketTrimBand(bounds: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const bandHeight = Math.max(POCKET_TRIM_BAND_HEIGHT, bounds.height + 8);
  const bandX = bounds.x - POCKET_TRIM_HORIZONTAL_PAD;
  const bandY = bounds.y - (bandHeight - bounds.height) / 2;

  return {
    x: bandX,
    y: bandY,
    width: bounds.width + POCKET_TRIM_HORIZONTAL_PAD * 2,
    height: bandHeight,
    topLineY: bounds.y + POCKET_TRIM_LINE_WIDTH / 2,
    bottomLineY: bandY + bandHeight - POCKET_TRIM_LINE_WIDTH / 2,
  };
}

type LowerPocketBandTrimColors = {
  top?: string | undefined;
  bottom?: string | undefined;
  complete?: string | undefined;
  auxiliary?: string | undefined;
};

type ChestPocketTrimColors = {
  generic?: string | undefined;
  upper?: string | undefined;
  zipper?: string | undefined;
  lower?: string | undefined;
};

function strokePocketTrimLine(
  context: CanvasRenderingContext2D,
  x1: number,
  x2: number,
  y: number,
  trimColor: string,
) {
  context.save();
  context.lineCap = "butt";
  context.lineJoin = "round";
  context.shadowColor = "rgba(248, 250, 252, 0.96)";
  context.shadowBlur = 9;
  context.strokeStyle = "#f8fafc";
  context.lineWidth = POCKET_TRIM_OUTLINE_LINE_WIDTH;
  context.beginPath();
  context.moveTo(x1, y);
  context.lineTo(x2, y);
  context.stroke();

  context.shadowColor = "rgba(15, 23, 42, 0.16)";
  context.shadowBlur = 2;
  context.strokeStyle = trimColor;
  context.lineWidth = POCKET_TRIM_LINE_WIDTH;
  context.beginPath();
  context.moveTo(x1, y);
  context.lineTo(x2, y);
  context.stroke();
  context.restore();
}

function drawLowerPocketTrimBandLines(
  context: CanvasRenderingContext2D,
  trimCanvas: HTMLCanvasElement,
  regions: OverlayRegion[],
  trimColors: LowerPocketBandTrimColors,
) {
  for (const region of regions) {
    const bounds = getCanvasInkBoundsInRegion(trimCanvas, region);

    if (!bounds) {
      continue;
    }

    const band = buildPocketTrimBand(bounds);

    if (trimColors.top) {
      strokePocketTrimLine(
        context,
        band.x + POCKET_TRIM_LINE_HORIZONTAL_INSET,
        band.x + band.width - POCKET_TRIM_LINE_HORIZONTAL_INSET,
        band.topLineY,
        trimColors.top,
      );
    }

    if (trimColors.bottom) {
      strokePocketTrimLine(
        context,
        band.x + POCKET_TRIM_LINE_HORIZONTAL_INSET,
        band.x + band.width - POCKET_TRIM_LINE_HORIZONTAL_INSET,
        band.bottomLineY,
        trimColors.bottom,
      );
    }
  }
}

function drawPocketTrimTopLine(
  context: CanvasRenderingContext2D,
  trimCanvas: HTMLCanvasElement,
  trimColor: string,
) {
  const bounds = getCanvasInkBounds(trimCanvas);

  if (!bounds) {
    return;
  }

  strokePocketTrimLine(
    context,
    bounds.x + POCKET_TRIM_LINE_HORIZONTAL_INSET,
    bounds.x + bounds.width - POCKET_TRIM_LINE_HORIZONTAL_INSET,
    bounds.y + POCKET_TRIM_LINE_WIDTH / 2,
    trimColor,
  );
}

async function drawDetailOverlayInRegions(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  baseSrc: string | undefined,
  regions: OverlayRegion[],
) {
  if (!baseSrc) {
    await drawOverlayInRegions(context, sourceSrc, regions);
    return;
  }

  const detailOverlay = await createDetailOverlayCanvas(
    sourceSrc,
    baseSrc,
    regions,
    14,
  );
  context.drawImage(detailOverlay, 0, 0);
}

async function drawLowerPocketOverlay(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  regions: OverlayRegion[],
  trimColors?: LowerPocketBandTrimColors,
) {
  const fileName = getFileNameFromSource(sourceSrc);
  const detailSrc = await getLowerPocketDetailObjectUrl(sourceSrc);
  const rasterCanvas = await createRasterCanvas(detailSrc ?? sourceSrc, sourceSrc);

  drawCanvasInRegions(context, rasterCanvas, regions);

  const sectionTrimOverlays = lowerPocketSectionTrimOverlayByFileName[fileName];

  if (sectionTrimOverlays) {
    for (const [section, trimColor] of [
      ["top", trimColors?.top],
      ["bottom", trimColors?.bottom],
      ["complete", trimColors?.complete],
      ["auxiliary", trimColors?.auxiliary],
    ] as const) {
      const trimSrc = sectionTrimOverlays[section];
      const outlineRadius =
        section === "complete"
          ? 0
          : lowerPocketSectionTrimOutlineRadiusByFileName[fileName] ?? 7;

      if (!trimSrc || !trimColor) {
        continue;
      }

      const trimCanvas = await createRasterCanvas(trimSrc, sourceSrc);
      if (outlineRadius > 0) {
        drawCanvasInRegions(
          context,
          createCanvasInkOutline(trimCanvas, "#f8fafc", outlineRadius),
          regions,
        );
      }
      drawCanvasInRegions(
        context,
        recolorCanvasInk(trimCanvas, trimColor),
        regions,
      );
    }

    return;
  }

  const trimColor = trimColors?.top ?? trimColors?.bottom ?? trimColors?.complete;

  if (!trimColor) {
    return;
  }

  const trimSrc = await getLowerPocketTrimObjectUrl(sourceSrc);

  if (!trimSrc) {
    return;
  }

  const trimCanvas = await createRasterCanvas(trimSrc, sourceSrc);
  const trimMode =
    lowerPocketTrimModeByFileName[fileName] ?? "ink";

  if (trimMode === "band") {
    drawLowerPocketTrimBandLines(context, trimCanvas, regions, trimColors ?? {});
    return;
  }

  drawCanvasInRegions(
    context,
    createCanvasInkOutline(trimCanvas, "#f8fafc", 7),
    regions,
  );
  drawCanvasInRegions(context, recolorCanvasInk(trimCanvas, trimColor), regions);
}

async function drawChestPocketOverlay(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  placementSrc: string,
  trimColors: ChestPocketTrimColors = {},
) {
  const overlayCanvas = await createRasterCanvas(sourceSrc, placementSrc);
  const fileName = getFileNameFromSource(sourceSrc);
  context.save();
  context.translate(0, CHEST_POCKET_VERTICAL_OFFSET);
  context.drawImage(overlayCanvas, 0, 0);

  const sectionTrimOverlays =
    chestPocketSectionTrimOverlayByFileName[fileName];

  if (sectionTrimOverlays) {
    const trimColorBySection = {
      upper: trimColors.upper,
      zipper: trimColors.zipper,
      lower: trimColors.lower,
    } satisfies Record<ChestPocketSectionTrimKey, string | undefined>;

    for (const section of getChestPocketSectionTrimOrder(fileName)) {
      const trimSrc = sectionTrimOverlays[section];
      const trimColor = trimColorBySection[section];

      if (!trimSrc || !trimColor) {
        continue;
      }

      const trimCanvas = await createRasterCanvas(trimSrc, placementSrc);
      context.drawImage(createCanvasInkOutline(trimCanvas, "#f8fafc", 4), 0, 0);
      context.drawImage(recolorCanvasInk(trimCanvas, trimColor), 0, 0);
    }

    context.restore();
    return;
  }

  const trimColor = trimColors.generic;

  if (!trimColor) {
    context.restore();
    return;
  }

  const trimSrc = chestPocketTrimOverlayByFileName[fileName];

  if (!trimSrc) {
    context.restore();
    return;
  }

  const trimCanvas = await createRasterCanvas(trimSrc, placementSrc);

  if (fullChestPocketTrimOverlayFileNames.has(fileName)) {
    context.drawImage(createCanvasInkOutline(trimCanvas, "#f8fafc", 4), 0, 0);
    context.drawImage(recolorCanvasInk(trimCanvas, trimColor), 0, 0);
    context.restore();
    return;
  }

  drawPocketTrimTopLine(context, trimCanvas, trimColor);
  context.restore();
}

function drawLogoMarker(
  context: CanvasRenderingContext2D,
  placement: string,
) {
  const positions = getLogoMarkerPositions(placement);

  if (positions.length === 0) {
    return;
  }

  context.save();

  for (const position of positions) {
    context.beginPath();
    context.fillStyle = LOGO_MARKER_OUTLINE;
    context.arc(
      position.x,
      position.y,
      LOGO_MARKER_OUTLINE_RADIUS,
      0,
      Math.PI * 2,
    );
    context.fill();

    context.beginPath();
    context.fillStyle = LOGO_MARKER_FILL;
    context.arc(position.x, position.y, LOGO_MARKER_RADIUS, 0, Math.PI * 2);
    context.fill();
  }

  context.restore();
}

function drawSleeveTabMarkers(
  context: CanvasRenderingContext2D,
  trimColor: string,
) {
  context.save();

  for (const position of SLEEVE_TAB_MARKER_POSITIONS) {
    context.beginPath();
    context.fillStyle = LOGO_MARKER_OUTLINE;
    drawCenteredTrianglePath(context, position, SLEEVE_TAB_MARKER_OUTLINE_RADIUS);
    context.fill();

    context.beginPath();
    context.fillStyle = trimColor;
    drawCenteredTrianglePath(context, position, SLEEVE_TAB_MARKER_RADIUS);
    context.fill();
  }

  context.restore();
}

function drawCenteredTrianglePath(
  context: CanvasRenderingContext2D,
  position: { x: number; y: number },
  radius: number,
) {
  const halfBase = radius * 0.866;
  const bottomY = position.y + radius * 0.5;

  context.moveTo(position.x, position.y - radius);
  context.lineTo(position.x + halfBase, bottomY);
  context.lineTo(position.x - halfBase, bottomY);
  context.closePath();
}

type OriginalSleevePoint = readonly [number, number];

type AssetToCanvasTransform = {
  drawX: number;
  drawY: number;
  scaleX: number;
  scaleY: number;
  sourceX: number;
  sourceY: number;
};

type OriginalSleevesTrimColors = {
  upper?: string | undefined;
  lower?: string | undefined;
  fill?: string | undefined;
};

async function getAssetToCanvasTransform(
  placementSrc: string,
): Promise<AssetToCanvasTransform> {
  const { bounds } = await getProcessedImage(placementSrc);
  const { drawX, drawY, drawWidth, drawHeight } = getDrawRect(bounds);

  return {
    drawX,
    drawY,
    scaleX: drawWidth / bounds.width,
    scaleY: drawHeight / bounds.height,
    sourceX: bounds.x,
    sourceY: bounds.y,
  };
}

function transformOriginalSleevePoint(
  point: OriginalSleevePoint,
  transform: AssetToCanvasTransform,
) {
  return {
    x: transform.drawX + (point[0] - transform.sourceX) * transform.scaleX,
    y: transform.drawY + (point[1] - transform.sourceY) * transform.scaleY,
  };
}

function traceOriginalSleevePolygon(
  context: CanvasRenderingContext2D,
  points: readonly OriginalSleevePoint[],
  transform: AssetToCanvasTransform,
) {
  const [firstPoint, ...restPoints] = points;

  if (!firstPoint) {
    return;
  }

  const first = transformOriginalSleevePoint(firstPoint, transform);
  context.beginPath();
  context.moveTo(first.x, first.y);

  for (const point of restPoints) {
    const transformed = transformOriginalSleevePoint(point, transform);
    context.lineTo(transformed.x, transformed.y);
  }

  context.closePath();
}

function strokeOriginalSleeveLine(
  context: CanvasRenderingContext2D,
  line: readonly [OriginalSleevePoint, OriginalSleevePoint],
  transform: AssetToCanvasTransform,
  trimColor: string,
) {
  const start = transformOriginalSleevePoint(line[0], transform);
  const end = transformOriginalSleevePoint(line[1], transform);

  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.strokeStyle = "#f8fafc";
  context.lineWidth = 12;
  context.stroke();

  context.beginPath();
  context.moveTo(start.x, start.y);
  context.lineTo(end.x, end.y);
  context.strokeStyle = trimColor;
  context.lineWidth = 7;
  context.stroke();
}

function isOriginalSleevesDetailOverlay(overlaySrc: string) {
  return (
    getFileNameFromSource(overlaySrc) === ORIGINAL_SLEEVES_DETAIL_FILE_NAME
  );
}

function hasOriginalSleevesDetailOverlay(overlaySrcs: readonly string[]) {
  return overlaySrcs.some(isOriginalSleevesDetailOverlay);
}

function isPespunteDetailOverlay(overlaySrc: string) {
  return getFileNameFromSource(overlaySrc) === "pants-pespunte-stitching.svg";
}

function getOriginalSleeveTrimShapes(placementSrc: string) {
  const placementFileName = getFileNameFromSource(placementSrc);

  if (placementFileName === "blouse-model-15-presillas.svg") {
    return PUNTADAS_ORIGINAL_SLEEVE_TRIM_SHAPES;
  }

  if (SPACED_ORIGINAL_SLEEVE_TRIM_BASE_FILE_NAMES.has(placementFileName)) {
    return PRESILLAS_ORIGINAL_SLEEVE_TRIM_SHAPES;
  }

  if (PUNTADAS_ALIGNED_ORIGINAL_SLEEVE_BASE_FILE_NAMES.has(placementFileName)) {
    return PUNTADAS_ORIGINAL_SLEEVE_TRIM_SHAPES;
  }

  return (
    ORIGINAL_SLEEVE_TRIM_SHAPES_BY_BASE_FILE_NAME[
      placementFileName as keyof typeof ORIGINAL_SLEEVE_TRIM_SHAPES_BY_BASE_FILE_NAME
    ] ?? ORIGINAL_SLEEVE_TRIM_SHAPES
  );
}

function getOriginalSleeveFillShapes(placementSrc: string) {
  if (
    ["blouse-model-05.svg", "blouse-model-15-presillas.svg"].includes(
      getFileNameFromSource(placementSrc),
    )
  ) {
    return PUNTADAS_ORIGINAL_SLEEVE_TRIM_SHAPES;
  }

  return getOriginalSleeveTrimShapes(placementSrc);
}

function resolveGarmentDetailOverlaySrc(overlaySrc: string, placementSrc: string) {
  if (getFileNameFromSource(overlaySrc) !== ORIGINAL_SLEEVES_DETAIL_FILE_NAME) {
    return overlaySrc;
  }

  const placementFileName = getFileNameFromSource(placementSrc);

  if (PUNTADAS_ALIGNED_ORIGINAL_SLEEVE_BASE_FILE_NAMES.has(placementFileName)) {
    return PUNTADAS_ORIGINAL_SLEEVES_DETAIL_OVERLAY;
  }

  return (
    ORIGINAL_SLEEVES_DETAIL_OVERLAY_BY_BASE_FILE_NAME[placementFileName] ??
    overlaySrc
  );
}

async function drawOriginalSleevesTrim(
  context: CanvasRenderingContext2D,
  placementSrc: string,
  trimColors: OriginalSleevesTrimColors,
) {
  if (!trimColors.upper && !trimColors.lower && !trimColors.fill) {
    return;
  }

  const transform = await getAssetToCanvasTransform(placementSrc);
  const trimShapes = getOriginalSleeveTrimShapes(placementSrc);
  const fillShapes = getOriginalSleeveFillShapes(placementSrc);
  context.save();

  if (trimColors.fill) {
    context.fillStyle = trimColors.fill;
    context.lineJoin = "round";

    for (const shape of fillShapes) {
      traceOriginalSleevePolygon(context, shape.points, transform);
      context.fill();
    }
  }

  const upperTrimColor = trimColors.upper;
  if (upperTrimColor) {
    for (const shape of trimShapes) {
      strokeOriginalSleeveLine(context, shape.upper, transform, upperTrimColor);
    }
  }

  const lowerTrimColor = trimColors.lower;
  if (lowerTrimColor) {
    for (const shape of trimShapes) {
      strokeOriginalSleeveLine(context, shape.lower, transform, lowerTrimColor);
    }
  }

  context.restore();
}

async function drawGarmentModelDetails(
  context: CanvasRenderingContext2D,
  garmentSrc: string | undefined,
  placementSrc: string,
  trimColor?: string,
) {
  if (!garmentSrc) {
    return;
  }

  const overlaySrc =
    garmentDetailOverlayByFileName[getFileNameFromSource(garmentSrc)];

  if (!overlaySrc) {
    return;
  }

  if (garmentSrc === placementSrc && !trimColor) {
    return;
  }

  const detailPlacementSrc =
    getFileNameFromSource(garmentSrc) === BLUSA_PESPUNTE_MODEL_FILE_NAME
      ? garmentSrc
      : placementSrc;
  const overlayCanvas = await createRasterCanvas(overlaySrc, detailPlacementSrc);
  context.drawImage(
    trimColor ? recolorCanvasInk(overlayCanvas, trimColor) : overlayCanvas,
    0,
    0,
  );
}

async function drawGarmentDetailOverlay(
  context: CanvasRenderingContext2D,
  overlaySrc: string | undefined,
  placementSrc: string,
  trimColor?: string,
) {
  if (!overlaySrc) {
    return;
  }

  const resolvedOverlaySrc = resolveGarmentDetailOverlaySrc(
    overlaySrc,
    placementSrc,
  );
  const overlayCanvas = await createRasterCanvas(resolvedOverlaySrc, placementSrc);
  context.drawImage(
    trimColor && isPespunteDetailOverlay(resolvedOverlaySrc)
      ? recolorCanvasInk(overlayCanvas, trimColor)
      : overlayCanvas,
    0,
    0,
  );
}

async function drawNeckModelDetails(
  context: CanvasRenderingContext2D,
  neckSrc: string,
  overlaysByFileName = neckModelDetailOverlayByFileName,
) {
  const overlaySrc =
    overlaysByFileName[getFileNameFromSource(neckSrc)];

  if (!overlaySrc) {
    return;
  }

  const overlayCanvas = await createRasterCanvas(overlaySrc, neckSrc);
  context.drawImage(overlayCanvas, 0, 0);
}

function createBackNeckTrimPath(pathData?: string) {
  if (pathData) {
    return new Path2D(pathData);
  }

  const path = new Path2D();
  path.moveTo(305, 128);
  path.lineTo(595, 128);
  return path;
}

function getBackNeckTrimVerticalOffset(
  sourceFileName: string,
  pathData?: string,
) {
  const override = backNeckTrimVerticalOffsetByFileName[sourceFileName];

  if (override !== undefined) {
    return override;
  }

  if (backNeckTrimOverlayByFileName[sourceFileName]) {
    return BACK_NECK_OVERLAY_VERTICAL_OFFSET;
  }

  return pathData
    ? BACK_NECK_OVAL_VERTICAL_OFFSET
    : BACK_NECK_STRAIGHT_VERTICAL_OFFSET;
}

function drawBackNeckTrim(
  context: CanvasRenderingContext2D,
  trimColor: string | undefined,
  pathData?: string,
  verticalOffset = BACK_NECK_STRAIGHT_VERTICAL_OFFSET,
) {
  if (!trimColor) {
    return;
  }

  const path = createBackNeckTrimPath(pathData);

  context.save();
  context.translate(0, verticalOffset);
  context.lineCap = "round";
  context.lineJoin = "round";
  context.shadowColor = "rgba(248, 250, 252, 0.98)";
  context.shadowBlur = 10;
  context.strokeStyle = "#f8fafc";
  context.lineWidth = 15;
  context.stroke(path);

  context.shadowBlur = 0;
  context.strokeStyle = trimColor;
  context.lineWidth = 9;
  context.stroke(path);
  context.restore();
}

async function drawBackNeckTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return false;
  }

  const overlaySrc =
    backNeckTrimOverlayByFileName[getFileNameFromSource(sourceSrc)];
  const verticalOffset = getBackNeckTrimVerticalOffset(
    getFileNameFromSource(sourceSrc),
  );

  if (overlaySrc) {
    const overlayCanvas = await createRasterCanvas(overlaySrc, sourceSrc);
    context.save();
    context.translate(0, verticalOffset);
    context.drawImage(createCanvasInkOutline(overlayCanvas, "#f8fafc", 3), 0, 0);
    context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
    context.restore();
    return true;
  }

  const trimIndexes =
    backNeckTrimElementIndexesByFileName[getFileNameFromSource(sourceSrc)];

  if (!trimIndexes) {
    return false;
  }

  context.save();
  context.translate(0, verticalOffset);
  await drawCollarTrimFromAsset(context, sourceSrc, trimColor, trimIndexes);
  context.restore();
  return true;
}

async function drawCollarTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string | undefined,
  trimColor: string | undefined,
  trimIndexesOverride?: number[],
) {
  if (!sourceSrc || !trimColor) {
    return;
  }

  const filledOverlaySrc =
    filledCollarTrimOverlayByFileName[getFileNameFromSource(sourceSrc)];

  if (filledOverlaySrc && !trimIndexesOverride) {
    const overlayCanvas = await createRasterCanvas(filledOverlaySrc, sourceSrc);
    context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
    return;
  }

  const overlaySrc = collarTrimOverlayByFileName[getFileNameFromSource(sourceSrc)];

  if (overlaySrc && !trimIndexesOverride) {
    const overlayCanvas = await createRasterCanvas(overlaySrc, sourceSrc);
    context.drawImage(createCanvasInkOutline(overlayCanvas), 0, 0);
    context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
    return;
  }

  const trimSrc = await getCollarTrimObjectUrl(sourceSrc, trimIndexesOverride);

  if (trimSrc) {
    const trimCanvas = await createRasterCanvas(trimSrc, sourceSrc);
    context.drawImage(createCanvasInkOutline(trimCanvas, "#f8fafc", 7), 0, 0);
    context.drawImage(recolorCanvasInk(trimCanvas, trimColor), 0, 0);
    return;
  }

  const collarRegions = trimRegionPresets.collar;
  const tintedCanvas = await createTintedBaseCanvas(sourceSrc, trimColor);
  const inkCanvas = recolorCanvasInk(await createRasterCanvas(sourceSrc), trimColor);

  drawCanvasInRegions(context, tintedCanvas, collarRegions);
  drawCanvasInRegions(context, inkCanvas, collarRegions);
}

async function drawHighCollarTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return;
  }

  const overlaySrc =
    highCollarTrimOverlayByFileName[getFileNameFromSource(sourceSrc)];

  if (!overlaySrc) {
    return;
  }

  const overlayCanvas = await createRasterCanvas(overlaySrc, sourceSrc);
  context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
}

async function drawPantsSidePocketTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  trimColor: string | undefined,
  sidePocketType: PreviewScene["pantsSidePocketType"],
) {
  if (!trimColor || !sidePocketType) {
    return;
  }

  const overlaySrc =
    sidePocketType === "asorsalud"
      ? PANTS_SIDE_POCKET_ASORSALUD_TRIM_SRC
      : PANTS_SIDE_POCKET_DOUBLE_ZIPPER_TRIM_SRC;
  const overlayCanvas = await createRasterCanvas(
    overlaySrc,
    sourceSrc,
  );
  context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
}

async function drawPantsKneePatchSideFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  side: "left" | "right",
  model:
    | "square"
    | "camouflage"
    | "point"
    | "internal"
    | "ribete"
    | "triangularFlap"
    | undefined,
  type: PreviewScene["pantsKneePatchLeftType"],
  trimColor: string | undefined,
  verticalZipperTrimColor: string | undefined,
  buttonTrimColor: string | undefined,
) {
  if (!model) {
    return;
  }

  if (model === "camouflage") {
    if (type === "buckle") {
      const buckleCanvas = await createRasterCanvas(
        PANTS_KNEE_PATCH_CAMOUFLAGE_BUCKLE_SRC_BY_SIDE[side],
        sourceSrc,
      );
      context.drawImage(buckleCanvas, 0, 0);
      return;
    }

    if (type === "button" && trimColor) {
      const fillCanvas = await createRasterCanvas(
        PANTS_KNEE_PATCH_CAMOUFLAGE_FILL_SRC_BY_SIDE[side],
        sourceSrc,
      );
      context.drawImage(recolorCanvasInk(fillCanvas, trimColor), 0, 0);
    }

    const patchCanvas = await createRasterCanvas(
      PANTS_KNEE_PATCH_CAMOUFLAGE_SRC_BY_SIDE[side],
      sourceSrc,
    );
    context.drawImage(patchCanvas, 0, 0);

    if (type === "button") {
      const buttonCanvas = await createRasterCanvas(
        PANTS_KNEE_PATCH_CAMOUFLAGE_BUTTON_SRC_BY_SIDE[side],
        sourceSrc,
      );
      context.drawImage(
        buttonTrimColor
          ? recolorCanvasInk(buttonCanvas, buttonTrimColor)
          : buttonCanvas,
        0,
        0,
      );
    }

    return;
  }

  if (model === "point") {
    const seamCanvas = await createRasterCanvas(
      trimColor
        ? PANTS_KNEE_PATCH_POINT_PEN_SEAM_FILL_SRC_BY_SIDE[side]
        : PANTS_KNEE_PATCH_POINT_PEN_SEAM_SRC_BY_SIDE[side],
      sourceSrc,
    );
    context.drawImage(
      trimColor ? recolorCanvasInk(seamCanvas, trimColor) : seamCanvas,
      0,
      0,
    );

    const patchCanvas = await createRasterCanvas(
      PANTS_KNEE_PATCH_POINT_SRC_BY_SIDE[side],
      sourceSrc,
    );
    context.drawImage(patchCanvas, 0, 0);
    return;
  }

  if (model === "internal") {
    const patchCanvas = await createRasterCanvas(
      PANTS_KNEE_PATCH_INTERNAL_SRC_BY_SIDE[side],
      sourceSrc,
    );
    context.drawImage(patchCanvas, 0, 0);
    return;
  }

  if (model === "ribete") {
    const isZipper =
      type === "zipper" ||
      type === "horizontalZipper" ||
      type === "verticalZipper";

    if (isZipper) {
      const zipperTrimColor =
        type === "verticalZipper" || type === "horizontalZipper"
          ? verticalZipperTrimColor
          : trimColor;
      const zipperCanvas = await createRasterCanvas(
        PANTS_KNEE_PATCH_RIBETE_ZIPPER_SRC_BY_SIDE[side],
        sourceSrc,
      );
      context.drawImage(zipperCanvas, 0, 0);

      if (zipperTrimColor) {
        const zipperFillCanvas = await createRasterCanvas(
          PANTS_KNEE_PATCH_RIBETE_ZIPPER_FILL_SRC_BY_SIDE[side],
          sourceSrc,
        );
        context.drawImage(
          recolorCanvasInk(zipperFillCanvas, zipperTrimColor),
          0,
          0,
        );
      }

      return;
    }

    if (trimColor) {
      const plainFillCanvas = await createRasterCanvas(
        PANTS_KNEE_PATCH_RIBETE_PLAIN_FILL_SRC_BY_SIDE[side],
        sourceSrc,
      );
      context.drawImage(recolorCanvasInk(plainFillCanvas, trimColor), 0, 0);
    }

    const plainCanvas = await createRasterCanvas(
      PANTS_KNEE_PATCH_RIBETE_PLAIN_SRC_BY_SIDE[side],
      sourceSrc,
    );
    context.drawImage(plainCanvas, 0, 0);
    return;
  }

  if (model === "triangularFlap") {
    const patchCanvas = await createRasterCanvas(
      PANTS_KNEE_PATCH_TRIANGULAR_FLAP_SRC_BY_SIDE[side],
      sourceSrc,
    );
    context.drawImage(patchCanvas, 0, 0);

    if (trimColor) {
      const trimCanvas = await createRasterCanvas(
        PANTS_KNEE_PATCH_TRIANGULAR_FLAP_TRIM_SRC_BY_SIDE[side],
        sourceSrc,
      );
      context.drawImage(recolorCanvasInk(trimCanvas, trimColor), 0, 0);
    }

    return;
  }

  const patchCanvas = await createRasterCanvas(
    PANTS_KNEE_PATCH_SQUARE_SRC_BY_SIDE[side],
    sourceSrc,
  );
  context.drawImage(patchCanvas, 0, 0);

  if (type === "plain" && trimColor) {
    const trimCanvas = await createRasterCanvas(
      PANTS_KNEE_PATCH_SQUARE_TRIM_SRC_BY_SIDE[side],
      sourceSrc,
    );
    context.drawImage(recolorCanvasInk(trimCanvas, trimColor), 0, 0);
    return;
  }

  if (type !== "horizontalZipper" && type !== "verticalZipper") {
    return;
  }

  const zipperTrimColor =
    type === "verticalZipper" || type === "horizontalZipper"
      ? verticalZipperTrimColor
      : trimColor;
  const zipperSrc =
    type === "verticalZipper"
      ? zipperTrimColor
        ? PANTS_KNEE_PATCH_VERTICAL_ZIPPER_FILL_SRC_BY_SIDE[side]
        : PANTS_KNEE_PATCH_VERTICAL_ZIPPER_SRC_BY_SIDE[side]
      : zipperTrimColor
        ? PANTS_KNEE_PATCH_ZIPPER_FILL_SRC_BY_SIDE[side]
        : PANTS_KNEE_PATCH_ZIPPER_SRC_BY_SIDE[side];
  const zipperCanvas = await createRasterCanvas(
    zipperSrc,
    sourceSrc,
  );
  context.drawImage(
    zipperTrimColor
      ? recolorCanvasInk(zipperCanvas, zipperTrimColor)
      : zipperCanvas,
    0,
    0,
  );
}

async function drawPantsKneePatchOverlaysFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  scene: PreviewScene,
  trimColor: string | undefined,
  rightTrimColor: string | undefined,
  leftTrimColor: string | undefined,
  upperLinearTrimColor: string | undefined,
  lowerLinearTrimColor: string | undefined,
  rightUpperLinearTrimColor: string | undefined,
  leftUpperLinearTrimColor: string | undefined,
  rightLowerLinearTrimColor: string | undefined,
  leftLowerLinearTrimColor: string | undefined,
  rightUpperRingTrimColor: string | undefined,
  leftUpperRingTrimColor: string | undefined,
  rightVerticalZipperTrimColor: string | undefined,
  leftVerticalZipperTrimColor: string | undefined,
  rightButtonTrimColor: string | undefined,
  leftButtonTrimColor: string | undefined,
) {
  await drawPantsKneePatchSideFromAsset(
    context,
    sourceSrc,
    "right",
    scene.pantsKneePatchRightModel,
    scene.pantsKneePatchRightType,
    rightTrimColor ?? trimColor,
    rightVerticalZipperTrimColor,
    rightButtonTrimColor,
  );
  await drawPantsKneePatchSideFromAsset(
    context,
    sourceSrc,
    "left",
    scene.pantsKneePatchLeftModel,
    scene.pantsKneePatchLeftType,
    leftTrimColor ?? trimColor,
    leftVerticalZipperTrimColor,
    leftButtonTrimColor,
  );

  for (const side of ["right", "left"] as const) {
    const model =
      side === "right"
        ? scene.pantsKneePatchRightModel
        : scene.pantsKneePatchLeftModel;
    const type =
      side === "right"
        ? scene.pantsKneePatchRightType
        : scene.pantsKneePatchLeftType;
    const sideUpperLinearTrimColor =
      side === "right" ? rightUpperLinearTrimColor : leftUpperLinearTrimColor;
    const sideLowerLinearTrimColor =
      side === "right" ? rightLowerLinearTrimColor : leftLowerLinearTrimColor;
    const upperColor = sideUpperLinearTrimColor ?? upperLinearTrimColor;
    const lowerColor = sideLowerLinearTrimColor ?? lowerLinearTrimColor;
    const upperRingTrimColor =
      side === "right" ? rightUpperRingTrimColor : leftUpperRingTrimColor;

    if (
      !model ||
      (!upperColor && !lowerColor && !upperRingTrimColor)
    ) {
      continue;
    }

    const isRibeteZipper =
      model === "ribete" &&
      (type === "zipper" ||
        type === "horizontalZipper" ||
        type === "verticalZipper");
    const group =
      model === "internal"
        ? "internal"
        : model === "ribete"
          ? isRibeteZipper
            ? "ribeteZipper"
            : "ribetePlain"
          : "full";

    for (const [position, color] of [
      ["upper", upperColor],
      ["lower", lowerColor],
    ] as const) {
      if (!color) {
        continue;
      }

      const lineCanvas = await createRasterCanvas(
        PANTS_KNEE_PATCH_LINEAR_TRIM_SRC_BY_GROUP[group][position][side],
        sourceSrc,
      );
      context.drawImage(recolorCanvasInk(lineCanvas, color), 0, 0);
    }

    if (upperRingTrimColor) {
      const ringCanvas = await createRasterCanvas(
        PANTS_KNEE_PATCH_LINEAR_UPPER_RING_SRC_BY_GROUP[group][side],
        sourceSrc,
      );
      context.drawImage(recolorCanvasInk(ringCanvas, upperRingTrimColor), 0, 0);
    }
  }
}

function getCollarLineOutlineRadius(sourceSrc: string) {
  return [
    "blouse-model-01.svg",
    "blouse-model-02-jdc.svg",
    "blouse-model-30.svg",
    "blouse-model-44-cucuta.svg",
  ].includes(getFileNameFromSource(sourceSrc))
    ? 3
    : 7;
}

async function drawInternalCollarTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  side: "left" | "right",
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return;
  }

  const overlaySrc =
    internalCollarTrimOverlayByFileName[getFileNameFromSource(sourceSrc)]?.[
      side
    ];

  if (overlaySrc) {
    const overlayCanvas = await createRasterCanvas(overlaySrc, sourceSrc);
    context.drawImage(
      createCanvasInkOutline(
        overlayCanvas,
        "#f8fafc",
        getCollarLineOutlineRadius(sourceSrc),
      ),
      0,
      0,
    );
    context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
    return;
  }

  const trimIndexes =
    internalCollarTrimElementIndexesByFileName[getFileNameFromSource(sourceSrc)]?.[
      side
    ];

  if (!trimIndexes) {
    return;
  }

  await drawCollarTrimFromAsset(context, sourceSrc, trimColor, trimIndexes);
}

async function drawInnerCollarTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return;
  }

  const overlaySrc =
    innerCollarTrimOverlayByFileName[getFileNameFromSource(sourceSrc)];

  if (!overlaySrc) {
    return;
  }

  const overlayCanvas = await createRasterCanvas(overlaySrc, sourceSrc);
  context.drawImage(
    createCanvasInkOutline(
      overlayCanvas,
      "#f8fafc",
      getCollarLineOutlineRadius(sourceSrc),
    ),
    0,
    0,
  );
  context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
}

async function drawCollarRingsTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return;
  }

  const overlaySrc =
    collarRingsTrimOverlayByFileName[getFileNameFromSource(sourceSrc)];

  if (!overlaySrc) {
    return;
  }

  const overlayCanvas = await createRasterCanvas(overlaySrc, sourceSrc);
  context.drawImage(createCanvasInkOutline(overlayCanvas, "#f8fafc", 7), 0, 0);
  context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
}

async function drawDividedCollarTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  section: "upper" | "lower",
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return;
  }

  const overlaySrc =
    dividedCollarTrimOverlayByFileName[getFileNameFromSource(sourceSrc)]?.[
      section
    ];

  if (!overlaySrc) {
    return;
  }

  const overlayCanvas = await createRasterCanvas(overlaySrc, sourceSrc);
  context.drawImage(createCanvasInkOutline(overlayCanvas, "#f8fafc", 7), 0, 0);
  context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
}

async function drawExternalCollarTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  side: "left" | "right",
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return;
  }

  const overlaySrc =
    externalCollarTrimOverlayByFileName[getFileNameFromSource(sourceSrc)]?.[
      side
    ];

  if (!overlaySrc) {
    return;
  }

  const overlayCanvas = await createRasterCanvas(overlaySrc, sourceSrc);
  context.drawImage(createCanvasInkOutline(overlayCanvas, "#f8fafc", 7), 0, 0);
  context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
}

async function drawThickInteriorCollarTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  side: "left" | "right",
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return;
  }

  const overlaySrc =
    thickInteriorCollarTrimOverlayByFileName[
      getFileNameFromSource(sourceSrc)
    ]?.[side];

  if (!overlaySrc) {
    return;
  }

  const overlayCanvas = await createRasterCanvas(overlaySrc, sourceSrc);
  context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
}

async function drawLowerCollarTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return;
  }

  const overlaySrc =
    lowerCollarTrimOverlayByFileName[getFileNameFromSource(sourceSrc)];

  if (!overlaySrc) {
    return;
  }

  const overlayCanvas = await createRasterCanvas(overlaySrc, sourceSrc);
  context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
}

async function drawDefaultExternalCollarLinesFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
) {
  const fileName = getFileNameFromSource(sourceSrc);

  if (!defaultExternalCollarLineFileNames.has(fileName)) {
    return;
  }

  const overlays = externalCollarTrimOverlayByFileName[fileName];

  if (!overlays) {
    return;
  }

  for (const side of ["left", "right"] as const) {
    const overlayCanvas = await createRasterCanvas(overlays[side], sourceSrc);
    context.drawImage(recolorCanvasInk(overlayCanvas, "#1d1d1b"), 0, 0);
  }
}

async function drawCompleteInteriorCollarTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  side: "left" | "right",
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return;
  }

  const overlaySrc =
    completeInteriorCollarTrimOverlayByFileName[
      getFileNameFromSource(sourceSrc)
    ]?.[side];

  if (!overlaySrc) {
    return;
  }

  const overlayCanvas = await createRasterCanvas(overlaySrc, sourceSrc);
  context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
}

async function drawFlapTrimFromAsset(
  context: CanvasRenderingContext2D,
  sourceSrc: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return;
  }

  const overlaySrc = flapTrimOverlayByFileName[getFileNameFromSource(sourceSrc)];

  if (!overlaySrc) {
    return;
  }

  const overlayCanvas = await createRasterCanvas(overlaySrc, sourceSrc);
  context.drawImage(createCanvasInkOutline(overlayCanvas, "#f8fafc", 7), 0, 0);
  context.drawImage(recolorCanvasInk(overlayCanvas, trimColor), 0, 0);
}

function getCollarTrimColorForAsset(
  scene: PreviewScene,
  sourceSrc: string,
) {
  const fileName = getFileNameFromSource(sourceSrc);

  if (noCollarTrimFileNames.has(fileName)) {
    return undefined;
  }

  const completeCollarTrimColor = getTrimSectionColor(
    scene,
    isCompleteCollarSection,
  );
  const isCompleteCollarOnlyNeck = completeCollarOnlyFileNames.has(fileName);

  if (isCompleteCollarOnlyNeck) {
    return completeCollarTrimColor;
  }

  return (
    completeCollarTrimColor ??
    getTrimSectionColor(scene, isWholeCollarSection)
  );
}

function allowsBackNeckTrim(sourceSrc: string) {
  return !noBackNeckTrimFileNames.has(getFileNameFromSource(sourceSrc));
}

export async function createTintedBaseCanvas(src: string, fillColor: string) {
  const processed = await getProcessedImage(src);
  const mask = await getInteriorMask(src);
  const { bounds } = processed;
  const { drawX, drawY, drawWidth, drawHeight } = getDrawRect(bounds);
  const tintCanvas = document.createElement("canvas");
  tintCanvas.width = CANVAS_WIDTH;
  tintCanvas.height = CANVAS_HEIGHT;
  const tintContext = tintCanvas.getContext("2d");

  if (!tintContext) {
    throw new Error("No se pudo generar la base coloreada.");
  }

  tintContext.imageSmoothingEnabled = true;
  tintContext.imageSmoothingQuality = "high";

  const fillCanvas = document.createElement("canvas");
  fillCanvas.width = processed.canvas.width;
  fillCanvas.height = processed.canvas.height;
  const fillContext = fillCanvas.getContext("2d");

  if (!fillContext) {
    throw new Error("No se pudo generar la base coloreada.");
  }

  fillContext.clearRect(0, 0, fillCanvas.width, fillCanvas.height);
  fillContext.fillStyle = fillColor;
  fillContext.fillRect(0, 0, fillCanvas.width, fillCanvas.height);
  fillContext.globalCompositeOperation = "destination-in";
  fillContext.drawImage(mask, 0, 0);
  fillContext.globalCompositeOperation = "source-over";

  tintContext.drawImage(
    fillCanvas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );

  tintContext.drawImage(
    processed.canvas,
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  );

  return tintCanvas;
}

export async function createDetailOverlayCanvas(
  sourceSrc: string,
  baseSrc: string,
  regions: OverlayRegion[],
  inkRadius = 2,
) {
  return await getDetailOverlay(sourceSrc, baseSrc, regions, inkRadius);
}

async function composeSingleDesign(
  canvas: HTMLCanvasElement,
  scene: PreviewScene,
): Promise<Blob> {
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D no disponible");
  }

  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const baseAssetSrc = scene.neckImageSrc ?? scene.garmentImageSrc;

  if (baseAssetSrc) {
    await drawTintedBaseFromAsset(context, baseAssetSrc, scene.baseColorHex);
  } else {
    drawFallbackGarmentFill(context, scene.baseColorHex);
    drawGarmentBase(context, "transparent");
  }

  if (baseAssetSrc) {
    const pespunteTrimColor = getTrimSectionColor(scene, isPespunteTrimSection);

    await drawGarmentModelDetails(
      context,
      scene.garmentImageSrc,
      baseAssetSrc,
      pespunteTrimColor,
    );
    const garmentDetailImageSrcs =
      scene.garmentDetailImageSrcs ??
      (scene.garmentDetailImageSrc ? [scene.garmentDetailImageSrc] : []);
    const hasOriginalSleevesOverlay =
      hasOriginalSleevesDetailOverlay(garmentDetailImageSrcs);

    for (const garmentDetailImageSrc of garmentDetailImageSrcs) {
      if (isOriginalSleevesDetailOverlay(garmentDetailImageSrc)) {
        continue;
      }

      await drawGarmentDetailOverlay(
        context,
        garmentDetailImageSrc,
        baseAssetSrc,
        pespunteTrimColor,
      );
    }
    await drawGarmentDetailOverlay(
      context,
      scene.waistbandImageSrc,
      baseAssetSrc,
    );
    await drawGarmentDetailOverlay(
      context,
      scene.bootImageSrc,
      baseAssetSrc,
    );
    await drawNeckModelDetails(
      context,
      baseAssetSrc,
      earlyNeckModelDetailOverlayByFileName,
    );

    const collarTrimColor = getCollarTrimColorForAsset(scene, baseAssetSrc);
    const innerCollarTrimColor = getTrimSectionColor(
      scene,
      isInnerCollarTrimSection,
    );
    const collarRingsTrimColor = getTrimSectionColor(
      scene,
      isCollarRingsSection,
    );
    const collarStitchesTrimColor = getTrimSectionColor(
      scene,
      isCollarStitchesSection,
    );
    const highCollarTrimColor = getTrimSectionColor(scene, isHighCollarSection);
    const upperDividedCollarTrimColor = getTrimSectionColor(
      scene,
      isUpperDividedCollarSection,
    );
    const lowerDividedCollarTrimColor = getTrimSectionColor(
      scene,
      isLowerDividedCollarSection,
    );
    const leftInternalCollarTrimColor = getTrimSectionColor(
      scene,
      isLeftInternalCollarSection,
    );
    const rightInternalCollarTrimColor = getTrimSectionColor(
      scene,
      isRightInternalCollarSection,
    );
    const leftExternalCollarTrimColor = getTrimSectionColor(
      scene,
      isLeftExternalCollarSection,
    );
    const rightExternalCollarTrimColor = getTrimSectionColor(
      scene,
      isRightExternalCollarSection,
    );
    const leftThickInteriorCollarTrimColor = getTrimSectionColor(
      scene,
      isLeftThickInteriorCollarSection,
    );
    const rightThickInteriorCollarTrimColor = getTrimSectionColor(
      scene,
      isRightThickInteriorCollarSection,
    );
    const leftCompleteInteriorCollarTrimColor = getTrimSectionColor(
      scene,
      isLeftCompleteInteriorCollarSection,
    );
    const rightCompleteInteriorCollarTrimColor = getTrimSectionColor(
      scene,
      isRightCompleteInteriorCollarSection,
    );
    const lowerCollarTrimColor = getTrimSectionColor(
      scene,
      isLowerCollarSection,
    );
    const backNeckTrimColor = allowsBackNeckTrim(baseAssetSrc)
      ? getTrimSectionColor(scene, isBackNeckTrimSection)
      : undefined;
    const lowerPocketFileName = scene.lowerPocketImageSrc
      ? getFileNameFromSource(scene.lowerPocketImageSrc)
      : "";
    const usesLowerPocketRingsTrim =
      lowerPocketFileName === "blouse-model-15.svg";
    const usesAuxiliaryOnlyLowerPocketTrim =
      lowerPocketFileName ===
        "blouse-model-34-cuello-alto-cremallera-lower-pocket.svg" ||
      lowerPocketFileName === "blouse-model-39-el-hato-lower-pocket.svg";
    const auxiliaryPocketTrimColor = getTrimSectionColor(
      scene,
      isAuxiliaryPocketTrimSection,
    );
    const lowerPocketUpperTrimColor = usesAuxiliaryOnlyLowerPocketTrim
      ? auxiliaryPocketTrimColor
      : usesLowerPocketRingsTrim
        ? getTrimSectionColor(scene, isLowerPocketRingsTrimSection)
        : getTrimSectionColor(scene, isLowerPocketUpperTrimSection);
    const lowerPocketLowerTrimColor = usesAuxiliaryOnlyLowerPocketTrim
      ? undefined
      : getTrimSectionColor(scene, isLowerPocketLowerTrimSection);
    const lowerPocketCompleteTrimColor = usesAuxiliaryOnlyLowerPocketTrim
      ? undefined
      : getTrimSectionColor(scene, isLowerPocketCompleteTrimSection);
    const chestPocketTrimColor = getTrimSectionColor(
      scene,
      isChestPocketTrimSection,
    );
    const chestPocketUpperTrimColor = getTrimSectionColor(
      scene,
      isChestPocketUpperTrimSection,
    );
    const chestPocketLowerTrimColor = getTrimSectionColor(
      scene,
      isChestPocketLowerTrimSection,
    );
    const chestPocketZipperTrimColor = getTrimSectionColor(
      scene,
      isZipperTrimSection,
    );
    const flapTrimColor = getTrimSectionColor(scene, isFlapTrimSection);
    const pantsSidePocketTrimColor = getTrimSectionColor(
      scene,
      isPantsSidePocketTrimSection,
    );
    const pantsKneePatchTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchTrimSection,
    );
    const pantsKneePatchRightTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchRightTrimSection,
    );
    const pantsKneePatchLeftTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchLeftTrimSection,
    );
    const pantsKneePatchUpperLinearTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchUpperLinearTrimSection,
    );
    const pantsKneePatchLowerLinearTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchLowerLinearTrimSection,
    );
    const pantsKneePatchRightUpperLinearTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchRightUpperLinearTrimSection,
    );
    const pantsKneePatchLeftUpperLinearTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchLeftUpperLinearTrimSection,
    );
    const pantsKneePatchRightLowerLinearTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchRightLowerLinearTrimSection,
    );
    const pantsKneePatchLeftLowerLinearTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchLeftLowerLinearTrimSection,
    );
    const pantsKneePatchRightUpperRingTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchRightRingTrimSection,
    );
    const pantsKneePatchLeftUpperRingTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchLeftRingTrimSection,
    );
    const pantsKneePatchRightVerticalZipperTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchRightVerticalZipperTrimSection,
    );
    const pantsKneePatchLeftVerticalZipperTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchLeftVerticalZipperTrimSection,
    );
    const pantsKneePatchRightButtonTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchRightButtonTrimSection,
    );
    const pantsKneePatchLeftButtonTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchLeftButtonTrimSection,
    );
    const sleeveTabTrimColor = getTrimSectionColor(
      scene,
      isSleeveTabTrimSection,
    );
    const sleeveUpperTrimColor = getTrimSectionColor(
      scene,
      isSleeveUpperTrimSection,
    );
    const sleeveLowerTrimColor = getTrimSectionColor(
      scene,
      isSleeveLowerTrimSection,
    );
    const sleeveFillTrimColor = getTrimSectionColor(
      scene,
      isSleeveFillTrimSection,
    );

    await drawPantsSidePocketTrimFromAsset(
      context,
      baseAssetSrc,
      pantsSidePocketTrimColor,
      scene.pantsSidePocketType,
    );
    await drawPantsKneePatchOverlaysFromAsset(
      context,
      baseAssetSrc,
      scene,
      pantsKneePatchTrimColor,
      pantsKneePatchRightTrimColor,
      pantsKneePatchLeftTrimColor,
      pantsKneePatchUpperLinearTrimColor,
      pantsKneePatchLowerLinearTrimColor,
      pantsKneePatchRightUpperLinearTrimColor,
      pantsKneePatchLeftUpperLinearTrimColor,
      pantsKneePatchRightLowerLinearTrimColor,
      pantsKneePatchLeftLowerLinearTrimColor,
      pantsKneePatchRightUpperRingTrimColor,
      pantsKneePatchLeftUpperRingTrimColor,
      pantsKneePatchRightVerticalZipperTrimColor,
      pantsKneePatchLeftVerticalZipperTrimColor,
      pantsKneePatchRightButtonTrimColor,
      pantsKneePatchLeftButtonTrimColor,
    );
    await drawCollarTrimFromAsset(context, baseAssetSrc, collarTrimColor);
    await drawCollarTrimFromAsset(context, baseAssetSrc, collarStitchesTrimColor);
    await drawHighCollarTrimFromAsset(
      context,
      baseAssetSrc,
      highCollarTrimColor,
    );
    await drawInnerCollarTrimFromAsset(
      context,
      baseAssetSrc,
      innerCollarTrimColor,
    );
    await drawCollarRingsTrimFromAsset(
      context,
      baseAssetSrc,
      collarRingsTrimColor,
    );
    await drawDividedCollarTrimFromAsset(
      context,
      baseAssetSrc,
      "upper",
      upperDividedCollarTrimColor,
    );
    await drawDividedCollarTrimFromAsset(
      context,
      baseAssetSrc,
      "lower",
      lowerDividedCollarTrimColor,
    );
    await drawCompleteInteriorCollarTrimFromAsset(
      context,
      baseAssetSrc,
      "left",
      leftCompleteInteriorCollarTrimColor,
    );
    await drawCompleteInteriorCollarTrimFromAsset(
      context,
      baseAssetSrc,
      "right",
      rightCompleteInteriorCollarTrimColor,
    );
    await drawLowerCollarTrimFromAsset(
      context,
      baseAssetSrc,
      lowerCollarTrimColor,
    );
    await drawThickInteriorCollarTrimFromAsset(
      context,
      baseAssetSrc,
      "left",
      leftThickInteriorCollarTrimColor,
    );
    await drawThickInteriorCollarTrimFromAsset(
      context,
      baseAssetSrc,
      "right",
      rightThickInteriorCollarTrimColor,
    );
    await drawDefaultExternalCollarLinesFromAsset(context, baseAssetSrc);
    await drawInternalCollarTrimFromAsset(
      context,
      baseAssetSrc,
      "left",
      leftInternalCollarTrimColor,
    );
    await drawInternalCollarTrimFromAsset(
      context,
      baseAssetSrc,
      "right",
      rightInternalCollarTrimColor,
    );
    await drawExternalCollarTrimFromAsset(
      context,
      baseAssetSrc,
      "left",
      leftExternalCollarTrimColor,
    );
    await drawExternalCollarTrimFromAsset(
      context,
      baseAssetSrc,
      "right",
      rightExternalCollarTrimColor,
    );
    await drawFlapTrimFromAsset(context, baseAssetSrc, flapTrimColor);
    const drewAssetBackNeckTrim = await drawBackNeckTrimFromAsset(
      context,
      baseAssetSrc,
      backNeckTrimColor,
    );

    if (!drewAssetBackNeckTrim) {
      const baseAssetFileName = getFileNameFromSource(baseAssetSrc);
      const backNeckPathData =
        backNeckTrimPathDataByFileName[baseAssetFileName];
      drawBackNeckTrim(
        context,
        backNeckTrimColor,
        backNeckPathData,
        getBackNeckTrimVerticalOffset(baseAssetFileName, backNeckPathData),
      );
    }

    await drawNeckModelDetails(context, baseAssetSrc);

    if (scene.lowerPocketImageSrc && scene.lowerPocketLayout !== "none") {
      await drawLowerPocketOverlay(
        context,
        scene.lowerPocketImageSrc,
        getLowerPocketOverlayRegions(
          scene.lowerPocketImageSrc,
          scene.lowerPocketLayout,
        ),
        {
          top: lowerPocketUpperTrimColor,
          bottom: lowerPocketLowerTrimColor,
          complete: lowerPocketCompleteTrimColor,
          auxiliary: auxiliaryPocketTrimColor,
        },
      );
    }

    if (scene.auxiliaryPocketImageSrc) {
      await drawDetailOverlayInRegions(
        context,
        scene.auxiliaryPocketImageSrc,
        baseAssetSrc,
        getOverlayRegionPreset("auxiliaryPocketPair"),
      );
    }

    if (scene.chestPocketImageSrc) {
      await drawChestPocketOverlay(
        context,
        scene.chestPocketImageSrc,
        baseAssetSrc,
        {
          generic: chestPocketTrimColor,
          upper: chestPocketUpperTrimColor,
          zipper: chestPocketZipperTrimColor,
          lower: chestPocketLowerTrimColor,
        },
      );
    }

    if (hasOriginalSleevesOverlay && isBlouseScene(scene, baseAssetSrc)) {
      await drawOriginalSleevesTrim(context, baseAssetSrc, {
        upper: sleeveUpperTrimColor,
        lower: sleeveLowerTrimColor,
        fill: sleeveFillTrimColor,
      });
    }

    if (scene.logoMarker && isBlouseScene(scene, baseAssetSrc)) {
      drawLogoMarker(context, scene.logoMarker.placement);
    }

    if (sleeveTabTrimColor && isBlouseScene(scene, baseAssetSrc)) {
      drawSleeveTabMarkers(context, sleeveTabTrimColor);
    }

    drawTrimSections(context, scene);
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo generar el PNG final."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function createInternalCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  return canvas;
}

async function composeUniformDesign(
  canvas: HTMLCanvasElement,
  scene: PreviewScene,
): Promise<Blob> {
  if (!scene.uniformParts) {
    return await composeSingleDesign(canvas, scene);
  }

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D no disponible");
  }

  const blouseCanvas = createInternalCanvas();
  const pantsCanvas = createInternalCanvas();

  await composeSingleDesign(blouseCanvas, scene.uniformParts.blouse);
  await composeSingleDesign(pantsCanvas, scene.uniformParts.pants);

  context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  context.drawImage(
    blouseCanvas,
    72,
    80,
    756,
    990,
    0,
    188,
    525,
    820,
  );
  context.drawImage(
    pantsCanvas,
    218,
    56,
    466,
    1090,
    600,
    145,
    300,
    900,
  );

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo generar el PNG final."));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

export async function composeDesign(
  canvas: HTMLCanvasElement,
  scene: PreviewScene,
): Promise<Blob> {
  if (scene.uniformParts) {
    return await composeUniformDesign(canvas, scene);
  }

  return await composeSingleDesign(canvas, scene);
}
