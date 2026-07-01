import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { AutomationRenderScene } from "./derive-render-scene.js";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 1200;
const TARGET_RECT = {
  x: 88,
  y: 86,
  width: 724,
  height: 980,
};

const PANTS_SIDE_POCKET_DOUBLE_ZIPPER_TRIM_ASSET =
  "assets/catalog/pantalon/trim-overlays/pants-side-pocket-double-zipper.svg";
const PANTS_SIDE_POCKET_ASORSALUD_TRIM_ASSET =
  "assets/catalog/pantalon/trim-overlays/pants-side-pocket-asorsalud.svg";
const PANTS_KNEE_PATCH_SQUARE_ASSET_BY_SIDE = {
  left: "assets/catalog/pantalon/detail-overlays/pants-knee-patch-square-left.svg",
  right:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-square-right.svg",
} as const;
const PANTS_KNEE_PATCH_CAMOUFLAGE_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-left.svg",
  right:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-right.svg",
} as const;
const PANTS_KNEE_PATCH_POINT_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-point-left.svg",
  right:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-point-right.svg",
} as const;
const PANTS_KNEE_PATCH_INTERNAL_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-internal-left.svg",
  right:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-internal-right.svg",
} as const;
const PANTS_KNEE_PATCH_TRIANGULAR_FLAP_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-triangular-flap-left.svg",
  right:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-triangular-flap-right.svg",
} as const;
const PANTS_KNEE_PATCH_RIBETE_PLAIN_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-ribete-plain-left.svg",
  right:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-ribete-plain-right.svg",
} as const;
const PANTS_KNEE_PATCH_RIBETE_ZIPPER_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-ribete-zipper-left.svg",
  right:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-ribete-zipper-right.svg",
} as const;
const PANTS_KNEE_PATCH_ZIPPER_ASSET_BY_SIDE = {
  left: "assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-left.svg",
  right:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-right.svg",
} as const;
const PANTS_KNEE_PATCH_ZIPPER_FILL_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-fill-left.svg",
  right:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-fill-right.svg",
} as const;
const PANTS_KNEE_PATCH_VERTICAL_ZIPPER_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-vertical-left.svg",
  right:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-vertical-right.svg",
} as const;
const PANTS_KNEE_PATCH_VERTICAL_ZIPPER_FILL_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-vertical-fill-left.svg",
  right:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-zipper-vertical-fill-right.svg",
} as const;
const PANTS_KNEE_PATCH_SQUARE_TRIM_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-square-trim-left.svg",
  right:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-square-trim-right.svg",
} as const;
const PANTS_KNEE_PATCH_CAMOUFLAGE_FILL_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-camouflage-fill-left.svg",
  right:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-camouflage-fill-right.svg",
} as const;
const PANTS_KNEE_PATCH_CAMOUFLAGE_BUTTON_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-button-left.svg",
  right:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-button-right.svg",
} as const;
const PANTS_KNEE_PATCH_CAMOUFLAGE_SNAP_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-snap-left.svg",
  right:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-snap-right.svg",
} as const;
const PANTS_KNEE_PATCH_CAMOUFLAGE_BUCKLE_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-buckle-left.svg",
  right:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-camouflage-buckle-right.svg",
} as const;
const PANTS_KNEE_PATCH_POINT_PEN_SEAM_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-point-pen-seam-left.svg",
  right:
    "assets/catalog/pantalon/detail-overlays/pants-knee-patch-point-pen-seam-right.svg",
} as const;
const PANTS_KNEE_PATCH_POINT_PEN_SEAM_FILL_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-point-pen-seam-fill-left.svg",
  right:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-point-pen-seam-fill-right.svg",
} as const;
const PANTS_KNEE_PATCH_TRIANGULAR_FLAP_TRIM_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-triangular-flap-trim-left.svg",
  right:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-triangular-flap-trim-right.svg",
} as const;
const PANTS_KNEE_PATCH_RIBETE_PLAIN_FILL_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-ribete-plain-fill-left.svg",
  right:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-ribete-plain-fill-right.svg",
} as const;
const PANTS_KNEE_PATCH_RIBETE_ZIPPER_FILL_ASSET_BY_SIDE = {
  left:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-ribete-zipper-fill-left.svg",
  right:
    "assets/catalog/pantalon/trim-overlays/pants-knee-patch-ribete-zipper-fill-right.svg",
} as const;
const PANTS_KNEE_PATCH_LINEAR_TRIM_ASSET_BY_GROUP = {
  full: {
    upper: {
      left:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-full-upper-left.svg",
      right:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-full-upper-right.svg",
    },
    lower: {
      left:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-full-lower-left.svg",
      right:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-full-lower-right.svg",
    },
  },
  internal: {
    upper: {
      left:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-internal-upper-left.svg",
      right:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-internal-upper-right.svg",
    },
    lower: {
      left:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-internal-lower-left.svg",
      right:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-internal-lower-right.svg",
    },
  },
  ribetePlain: {
    upper: {
      left:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-plain-upper-left.svg",
      right:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-plain-upper-right.svg",
    },
    lower: {
      left:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-plain-lower-left.svg",
      right:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-plain-lower-right.svg",
    },
  },
  ribeteZipper: {
    upper: {
      left:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-zipper-upper-left.svg",
      right:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-zipper-upper-right.svg",
    },
    lower: {
      left:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-zipper-lower-left.svg",
      right:
        "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-zipper-lower-right.svg",
    },
  },
} as const;
const PANTS_KNEE_PATCH_LINEAR_UPPER_RING_ASSET_BY_GROUP = {
  full: {
    left:
      "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-full-upper-ring-left.svg",
    right:
      "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-full-upper-ring-right.svg",
  },
  internal: {
    left:
      "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-internal-upper-ring-left.svg",
    right:
      "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-internal-upper-ring-right.svg",
  },
  ribetePlain: {
    left:
      "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-plain-upper-ring-left.svg",
    right:
      "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-plain-upper-ring-right.svg",
  },
  ribeteZipper: {
    left:
      "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-zipper-upper-ring-left.svg",
    right:
      "assets/catalog/pantalon/trim-overlays/pants-knee-patch-linear-ribete-zipper-upper-ring-right.svg",
  },
} as const;

type OverlayRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type ProcessedImage = {
  width: number;
  height: number;
  data: Uint8ClampedArray;
  bounds: { x: number; y: number; width: number; height: number };
};

const overlayRegionPresets: Record<
  "lowerPocketPair" | "lowerPocketSingleRight" | "auxiliaryPocketPair",
  OverlayRegion[]
> =
  {
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
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-20-lower-pocket.svg",
};

const lowerPocketSectionTrimOverlayByFileName: Record<
  string,
  { top?: string; bottom?: string; complete?: string; auxiliary?: string }
> = {
  "blouse-model-14.svg": {
    top: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-14-rectangular-lower-pocket-upper.svg",
    bottom:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-14-rectangular-lower-pocket-lower.svg",
    complete:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-14-rectangular-lower-pocket-complete.svg",
  },
  "blouse-model-18-costura-lower-pocket.svg": {
    top: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-18-costura-lower-pocket-upper.svg",
    bottom:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-18-costura-lower-pocket-lower.svg",
    auxiliary:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-18-costura-lower-pocket-auxiliary.svg",
  },
  "blouse-model-19-ribete-lower-pocket.svg": {
    top: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-19-ribete-lower-pocket-upper.svg",
    bottom:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-19-ribete-lower-pocket-lower.svg",
  },
  "blouse-model-20-costura-maria-lower-pocket.svg": {
    top: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-20-costura-maria-lower-pocket-upper.svg",
    auxiliary:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-20-costura-maria-lower-pocket-auxiliary.svg",
  },
  "blouse-model-34-cuello-alto-cremallera-lower-pocket.svg": {
    top: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-34-cuello-alto-cremallera-lower-pocket-andes-hombre-trim.svg",
    bottom:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-34-cuello-alto-cremallera-lower-pocket-andes-hombre-trim.svg",
  },
  "blouse-model-37-cirugia-lower-pocket.svg": {
    top: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-37-cirugia-lower-pocket-costura-ovalado-trim.svg",
    bottom:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-37-cirugia-lower-pocket-costura-ovalado-trim.svg",
  },
  "blouse-model-39-el-hato-lower-pocket.svg": {
    top: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-39-el-hato-lower-pocket-presillas-trim.svg",
    bottom:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-39-el-hato-lower-pocket-presillas-trim.svg",
  },
  "blouse-model-46-costura-triangulo-lower-pocket.svg": {
    top: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-46-costura-triangulo-lower-pocket-upper.svg",
    bottom:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-46-costura-triangulo-lower-pocket-trim.svg",
  },
  "blouse-model-47-ribete-horizontal-lower-pocket.svg": {
    top: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-47-ribete-horizontal-lower-pocket-trim.svg",
    bottom:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-47-ribete-horizontal-lower-pocket-trim.svg",
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
    "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external-trim.svg",
};

const chestPocketSectionTrimOverlayByFileName: Record<
  string,
  { upper?: string; zipper?: string; lower?: string }
> = {
  "chest-pocket-point-zipper.svg": {
    upper:
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-zipper-upper-trim.svg",
    zipper:
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-zipper-trim.svg",
    lower:
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-zipper-lower-trim.svg",
  },
  "chest-pocket-point.svg": {
    upper:
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-upper-trim.svg",
    lower:
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-lower-trim.svg",
  },
  "chest-pocket-rectangular-model.svg": {
    upper:
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-upper-trim.svg",
    lower:
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-lower-trim.svg",
  },
  "chest-pocket-zipper-external.svg": {
    upper:
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external-upper-trim.svg",
    zipper:
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external-trim.svg",
    lower:
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external-lower-trim.svg",
  },
  "chest-pocket-zipper-internal.svg": {
    zipper:
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-internal-trim.svg",
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
    "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg",
};

const neckModelDetailOverlayByFileName: Record<string, string> = {
  "blouse-model-39-el-hato.svg":
    "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-39-el-hato-buttons.svg",
};

const earlyNeckModelDetailOverlayByFileName: Record<string, string> = {
  "blouse-model-04.svg":
    "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-04-mariposa-dividido-default.svg",
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
  "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-07-puntadas-original-sleeves.svg";
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
const PRESILLAS_NECK_ORIGINAL_SLEEVE_TRIM_SHAPES = [
  {
    points: [
      [128.29, 517.6],
      [274.52, 648.23],
      [287.85, 633.29],
      [141.62, 502.66],
    ],
    upper: [
      [141.62, 502.66],
      [287.85, 633.29],
    ],
    lower: [
      [128.29, 517.6],
      [274.52, 648.23],
    ],
  },
  {
    points: [
      [952.33, 514.67],
      [820.98, 620.1],
      [808.48, 604.5],
      [939.83, 499.07],
    ],
    upper: [
      [939.83, 499.07],
      [808.48, 604.5],
    ],
    lower: [
      [952.33, 514.67],
      [820.98, 620.1],
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
    "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-01-cuello-v-original-sleeves.svg",
  "blouse-model-04.svg":
    "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-04-mariposa-dividido-original-sleeves.svg",
  "blouse-model-06-puntas.svg":
    "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-06-puntas-original-sleeves.svg",
  "blouse-model-07.svg":
    PUNTADAS_ORIGINAL_SLEEVES_DETAIL_OVERLAY,
  "blouse-model-08.svg":
    "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-08-cuello-alto-original-sleeves.svg",
  "blouse-model-09.svg":
    "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-09-ovalado-original-sleeves.svg",
  "blouse-model-22-estrella.svg":
    "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-22-estrella-original-sleeves.svg",
  "blouse-model-39-el-hato.svg":
    "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-39-el-hato-original-sleeves.svg",
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
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-02-jdc-collar-v-internal-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-02-jdc-collar-v-internal-right.svg",
  },
  "blouse-model-01.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-internal-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-internal-right.svg",
  },
  "blouse-model-08.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-08-internal-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-08-internal-right.svg",
  },
  "blouse-model-50-20-20.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-50-20-20-internal-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-50-20-20-internal-right.svg",
  },
  "blouse-model-30.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-internal-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-internal-right.svg",
  },
};

const innerCollarTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-44-cucuta.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-44-cucuta-inner-collar.svg",
  "blouse-model-41-matrioska.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-41-matrioska-inner-collar.svg",
};

const externalCollarTrimOverlayByFileName: Record<
  string,
  { left: string; right: string }
> = {
  "blouse-model-02-jdc.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-02-jdc-collar-v-external-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-02-jdc-collar-v-external-right.svg",
  },
  "blouse-model-01.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-external-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-external-right.svg",
  },
  "blouse-model-25-20-21.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-25-20-21-external-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-25-20-21-external-right.svg",
  },
  "blouse-model-12-cherokee.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-12-cherokee-external-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-12-cherokee-external-right.svg",
  },
  "blouse-model-30.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-external-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-external-right.svg",
  },
};

const defaultExternalCollarLineFileNames = new Set(["blouse-model-01.svg"]);

const thickInteriorCollarTrimOverlayByFileName: Record<
  string,
  { left: string; right: string }
> = {
  "blouse-model-30.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-thick-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-thick-right.svg",
  },
};

const lowerCollarTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-06-puntas.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-06-puntas-collar-lower.svg",
  "blouse-model-30.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-lower.svg",
};

const completeInteriorCollarTrimOverlayByFileName: Record<
  string,
  { left: string; right: string }
> = {
  "blouse-model-02-jdc.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-02-jdc-collar-v-complete-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-02-jdc-collar-v-complete-right.svg",
  },
  "blouse-model-01.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-complete-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-complete-right.svg",
  },
  "blouse-model-30.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-complete-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-30-cruzado-collar-v-complete-right.svg",
  },
};

const flapTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-22-estrella.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-22-estrella-aletas.svg",
};

const backNeckTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-44-cucuta.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-44-cucuta-back-neck.svg",
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
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-15-presillas-collar.svg",
  "blouse-model-22-estrella.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-22-estrella-collar.svg",
  "blouse-model-24-botones.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-24-botones-collar.svg",
  "blouse-model-26-cuello-redondo.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-26-cuello-redondo-collar.svg",
  "blouse-model-43.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-43-enfermera-ub-collar.svg",
  "blouse-model-08.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-08-collar.svg",
  "blouse-model-34-cuello-alto-cremallera.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-34-cuello-alto-cremallera-collar.svg",
  "blouse-model-37-cirugia.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-37-cirugia-collar.svg",
  "blouse-model-11-fisiopracticas.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-11-fisiopracticas-collar.svg",
  "blouse-model-13-p-paipilla.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-13-p-paipilla-collar.svg",
};

const collarRingsTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-09.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-09-ovalado-collar-arc.svg",
  "blouse-model-15-presillas.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-15-presillas-rings.svg",
};

const filledCollarTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-39-el-hato.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-39-el-hato-complete-collar-fill.svg",
};

const highCollarTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-39-el-hato.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-39-el-hato-high-collar-fill.svg",
  "blouse-model-37-cirugia.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-37-cirugia-high-collar.svg",
};

const dividedCollarTrimOverlayByFileName: Record<
  string,
  { upper: string; lower: string }
> = {
  "blouse-model-04.svg": {
    upper:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-04-mariposa-dividido-upper.svg",
    lower:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-04-mariposa-dividido-lower.svg",
  },
  "blouse-model-28-modelo-29.svg": {
    upper:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-28-modelo-29-divided-upper.svg",
    lower:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-28-modelo-29-divided-lower.svg",
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
const collarRingsTrimValueIds = new Set([2897, 2898, 2899]);

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function isBlouseScene(scene: AutomationRenderScene, baseAssetPath?: string) {
  const normalizedProductName = normalize(scene.productName);

  return (
    !normalizedProductName.includes("pantalon") &&
    (normalizedProductName.includes("blusa") ||
      normalizedProductName.includes("uniforme") ||
      Boolean(baseAssetPath?.includes("blusa-antifluido")))
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

function resolveAssetFilePaths(assetPath: string): [string, string] {
  return [
    path.join(process.cwd(), "apps", "web", "public", assetPath),
    path.join(process.cwd(), "..", "web", "public", assetPath),
  ];
}

async function readAssetFile(assetPath: string) {
  const [fromRepoRoot, fromApiWorkspace] = resolveAssetFilePaths(assetPath);

  try {
    return await readFile(fromRepoRoot);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return await readFile(fromApiWorkspace);
    }

    throw error;
  }
}

function getAssetFileName(assetPath: string) {
  return assetPath.split(/[\\/]/).pop() ?? assetPath;
}

function getTrimSectionColor(
  scene: AutomationRenderScene,
  matcher: (section: AutomationRenderScene["trimSections"][number]) => boolean,
) {
  return scene.trimSections.find(matcher)?.colorHex;
}

function getTrimSectionText(
  section: AutomationRenderScene["trimSections"][number],
) {
  return normalize(`${section.label} ${section.key}`);
}

function isPespunteTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  return getTrimSectionText(section).includes("pespunte");
}

function isWholeCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    normalize(section.label || section.key) === "cuello" ||
    key.includes("cuello alto") ||
    key.includes("cuello-alto")
  );
}

function isHighCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return key.includes("cuello alto") || key.includes("cuello-alto");
}

function isCompleteCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return key.includes("cuello completo") || key.includes("cuello-completo");
}

function isInnerCollarTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return key.includes("cuello interno") || key.includes("cuello-interno");
}

function isCollarRingsSection(
  section: AutomationRenderScene["trimSections"][number],
) {
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

function isCollarStitchesSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return key.includes("cuello puntadas") || key.includes("cuello-puntadas");
}

function isUpperDividedCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello borde dividido superior") ||
    key.includes("cuello-borde-dividido-superior")
  );
}

function isLowerDividedCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello borde dividido inferior") ||
    key.includes("cuello-borde-dividido-inferior")
  );
}

function isLeftInternalCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello v lineal interno izquierdo") ||
    key.includes("cuello-v-lineal-interno-izquierdo")
  );
}

function isRightInternalCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello v lineal interno derecho") ||
    key.includes("cuello-v-lineal-interno-derecho")
  );
}

function isLeftExternalCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello v lineal externo izquierdo") ||
    key.includes("cuello-v-lineal-externo-izquierdo")
  );
}

function isRightExternalCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello v lineal externo derecho") ||
    key.includes("cuello-v-lineal-externo-derecho")
  );
}

function isLeftThickInteriorCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello interior grueso izquierdo") ||
    key.includes("cuello-interior-grueso-izquierdo")
  );
}

function isRightThickInteriorCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello interior grueso derecho") ||
    key.includes("cuello-interior-grueso-derecho")
  );
}

function isLeftCompleteInteriorCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello v completo interior izquierdo") ||
    key.includes("cuello-v-completo-interior-izquierdo")
  );
}

function isRightCompleteInteriorCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("cuello v completo interior derecho") ||
    key.includes("cuello-v-completo-interior-derecho")
  );
}

function isLowerCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return key.includes("cuello inferior") || key.includes("cuello-inferior");
}

function isLowerPocketTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return section.role === "lowerPockets" || key.includes("bolsillos inferiores");
}

function isLowerPocketRingsTrimSection(
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
) {
  return (
    isLowerPocketTrimSection(section) &&
    !isLowerPocketCompleteTrimSection(section) &&
    !isLowerPocketLowerTrimSection(section)
  );
}

function isAuxiliaryPocketTrimSection(
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("bolsillo lateral de pantalon") ||
    key.includes("bolsillo-lateral-de-pantalon") ||
    (key.includes("bolsillo lateral") && key.includes("pantalon"))
  );
}

function isPantsKneePatchTrimSection(
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("parche") &&
    key.includes("rodilla") &&
    key.includes("derecha")
  );
}

function isPantsKneePatchLeftTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("parche") &&
    key.includes("rodilla") &&
    key.includes("izquierda")
  );
}

function isPantsKneePatchRightRibeteTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("ribete") &&
    key.includes("rodilla") &&
    key.includes("derecha")
  );
}

function isPantsKneePatchLeftRibeteTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("ribete") &&
    key.includes("rodilla") &&
    key.includes("izquierda")
  );
}

function isPantsKneePatchUpperLinearTrimSection(
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("aro rodilla derecha") ||
    key.includes("aro-rodilla-derecha") ||
    (key.includes("aro") && key.includes("rodilla") && key.includes("derecha"))
  );
}

function isPantsKneePatchLeftRingTrimSection(
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
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
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("boton") &&
    key.includes("rodilla") &&
    key.includes("derecha")
  );
}

function isPantsKneePatchLeftButtonTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("boton") &&
    key.includes("rodilla") &&
    key.includes("izquierda")
  );
}

function isChestPocketTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    section.role === "chestPocket" ||
    key.includes("bolsillo pecho") ||
    key.includes("bolsillo de pecho")
  );
}

function isChestPocketUpperTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("bolsillo pecho superior") ||
    key.includes("bolsillo de pecho superior") ||
    key.includes("bolsillo-pecho-superior")
  );
}

function isChestPocketLowerTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("bolsillo pecho inferior") ||
    key.includes("bolsillo de pecho inferior") ||
    key.includes("bolsillo-pecho-inferior")
  );
}

function isZipperTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  return normalize(section.label || section.key) === "cremallera";
}

function isSleeveTabTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return key.includes("presilla");
}

function isSleeveUpperTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("manga lineal superior") ||
    key.includes("manga-lineal-superior")
  );
}

function isSleeveLowerTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return (
    key.includes("manga lineal inferior") ||
    key.includes("manga-lineal-inferior")
  );
}

function isSleeveFillTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return key.includes("manga rellena") || key.includes("manga-rellena");
}

function isFlapTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return key.includes("aletas");
}

function isBackNeckTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = normalize(section.label || section.key);

  return (
    section.role === "backNeck" ||
    key.includes("cogotera") ||
    key.includes("cuello-trasero") ||
    key.includes("cuello trasero")
  );
}

function isSvgAsset(assetPath: string) {
  return assetPath.toLowerCase().endsWith(".svg");
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

async function processImageBuffer(renderBuffer: Buffer): Promise<ProcessedImage> {
  const { data, info } = await sharp(renderBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = new Uint8ClampedArray(data);
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;
  let hasInk = false;

  for (let offset = 0; offset < rgba.length; offset += 4) {
    const red = rgba[offset] ?? 0;
    const green = rgba[offset + 1] ?? 0;
    const blue = rgba[offset + 2] ?? 0;
    const alpha = rgba[offset + 3] ?? 0;
    const isWhiteLike = alpha > 0 && red >= 240 && green >= 240 && blue >= 240;

    if (isWhiteLike) {
      rgba[offset + 3] = 0;
      continue;
    }

    if (alpha === 0) {
      continue;
    }

    const index = offset / 4;
    const x = index % info.width;
    const y = Math.floor(index / info.width);
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
    hasInk = true;
  }

  return {
    width: info.width,
    height: info.height,
    data: rgba,
    bounds: hasInk
      ? {
          x: minX,
          y: minY,
          width: maxX - minX + 1,
          height: maxY - minY + 1,
        }
      : {
          x: 0,
          y: 0,
          width: info.width,
          height: info.height,
      },
  };
}

async function loadProcessedImage(assetPath: string): Promise<ProcessedImage> {
  const fileBuffer = await readAssetFile(assetPath);
  const renderBuffer = isSvgAsset(assetPath)
    ? Buffer.from(withExplicitSvgDimensions(fileBuffer.toString("utf8")))
    : fileBuffer;

  return await processImageBuffer(renderBuffer);
}

function getDrawRect(bounds: ProcessedImage["bounds"]) {
  const scale = Math.min(
    TARGET_RECT.width / bounds.width,
    TARGET_RECT.height / bounds.height,
  );
  const drawWidth = Math.max(1, Math.round(bounds.width * scale));
  const drawHeight = Math.max(1, Math.round(bounds.height * scale));
  const drawX = Math.round(TARGET_RECT.x + (TARGET_RECT.width - drawWidth) / 2);
  const drawY = Math.round(TARGET_RECT.y + (TARGET_RECT.height - drawHeight) / 2);

  return {
    drawX,
    drawY,
    drawWidth,
    drawHeight,
  };
}

function computeInteriorMask(processed: ProcessedImage) {
  const pixelCount = processed.width * processed.height;
  const ink = new Uint8Array(pixelCount);
  const outside = new Uint8Array(pixelCount);
  const queue: number[] = [];

  for (let index = 0; index < pixelCount; index += 1) {
    if ((processed.data[index * 4 + 3] ?? 0) > 20) {
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

  for (let x = 0; x < processed.width; x += 1) {
    enqueue(x);
    enqueue((processed.height - 1) * processed.width + x);
  }

  for (let y = 0; y < processed.height; y += 1) {
    enqueue(y * processed.width);
    enqueue(y * processed.width + (processed.width - 1));
  }

  while (queue.length > 0) {
    const index = queue.shift();
    if (index === undefined) {
      break;
    }

    const x = index % processed.width;
    const y = Math.floor(index / processed.width);

    if (x > 0) enqueue(index - 1);
    if (x < processed.width - 1) enqueue(index + 1);
    if (y > 0) enqueue(index - processed.width);
    if (y < processed.height - 1) enqueue(index + processed.width);
  }

  const mask = new Uint8ClampedArray(pixelCount * 4);

  for (let index = 0; index < pixelCount; index += 1) {
    if (ink[index] || outside[index]) {
      continue;
    }

    const offset = index * 4;
    mask[offset] = 255;
    mask[offset + 1] = 255;
    mask[offset + 2] = 255;
    mask[offset + 3] = 255;
  }

  return mask;
}

async function rgbaToPngBuffer(
  data: Uint8ClampedArray,
  width: number,
  height: number,
) {
  return await sharp(Buffer.from(data), {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function placeProcessedBufferOnCanvas(
  imageBuffer: Buffer,
  bounds: ProcessedImage["bounds"],
) {
  const { drawX, drawY, drawWidth, drawHeight } = getDrawRect(bounds);
  const cropped = await sharp(imageBuffer)
    .extract({
      left: bounds.x,
      top: bounds.y,
      width: bounds.width,
      height: bounds.height,
    })
    .resize(drawWidth, drawHeight, { fit: "fill" })
    .png()
    .toBuffer();

  return await sharp({
    create: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: cropped, left: drawX, top: drawY }])
    .png()
    .toBuffer();
}

async function createTintedBaseBuffer(assetPath: string, fillColor: string) {
  const processed = await loadProcessedImage(assetPath);
  const mask = computeInteriorMask(processed);
  const tint = new Uint8ClampedArray(processed.data.length);
  const color = sharp({
    create: { width: 1, height: 1, channels: 4, background: fillColor },
  });
  const { data: colorSample } = await color
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [red, green, blue, alpha] = colorSample;

  for (let offset = 0; offset < tint.length; offset += 4) {
    if ((mask[offset + 3] ?? 0) > 0) {
      tint[offset] = red ?? 0;
      tint[offset + 1] = green ?? 0;
      tint[offset + 2] = blue ?? 0;
      tint[offset + 3] = alpha ?? 255;
    }

    if ((processed.data[offset + 3] ?? 0) > 0) {
      tint[offset] = processed.data[offset] ?? 0;
      tint[offset + 1] = processed.data[offset + 1] ?? 0;
      tint[offset + 2] = processed.data[offset + 2] ?? 0;
      tint[offset + 3] = processed.data[offset + 3] ?? 0;
    }
  }

  const imageBuffer = await rgbaToPngBuffer(tint, processed.width, processed.height);
  return await placeProcessedBufferOnCanvas(imageBuffer, processed.bounds);
}

async function createOverlayBufferFromProcessed(
  processed: ProcessedImage,
  placement = processed,
) {
  const imageBuffer = await rgbaToPngBuffer(
    processed.data,
    processed.width,
    processed.height,
  );
  return await placeProcessedBufferOnCanvas(imageBuffer, placement.bounds);
}

async function createOverlayBuffer(assetPath: string) {
  const processed = await loadProcessedImage(assetPath);
  return await createOverlayBufferFromProcessed(processed);
}

async function recolorPngInkBuffer(buffer: Buffer, colorHex: string) {
  const { data, width, height } = await pngBufferToRaw(buffer);
  const color = sharp({
    create: { width: 1, height: 1, channels: 4, background: colorHex },
  });
  const { data: colorSample } = await color
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [red, green, blue] = colorSample;

  for (let offset = 0; offset < data.length; offset += 4) {
    if ((data[offset + 3] ?? 0) <= 0) {
      continue;
    }

    data[offset] = red ?? 0;
    data[offset + 1] = green ?? 0;
    data[offset + 2] = blue ?? 0;
  }

  return await rgbaToPngBuffer(data, width, height);
}

async function createPngInkOutlineBuffer(
  buffer: Buffer,
  outlineColor = "#f8fafc",
  radius = 7,
) {
  const { data, width, height } = await pngBufferToRaw(buffer);
  const color = sharp({
    create: { width: 1, height: 1, channels: 4, background: outlineColor },
  });
  const { data: colorSample } = await color
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const [red, green, blue] = colorSample;
  const output = new Uint8ClampedArray(data.length);

  for (let sourceOffset = 0; sourceOffset < data.length; sourceOffset += 4) {
    const alpha = data[sourceOffset + 3] ?? 0;

    if (alpha <= 0) {
      continue;
    }

    const index = sourceOffset / 4;
    const x = index % width;
    const y = Math.floor(index / width);

    for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
      for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
        if (offsetX * offsetX + offsetY * offsetY > radius * radius) {
          continue;
        }

        const targetX = x + offsetX;
        const targetY = y + offsetY;

        if (
          targetX < 0 ||
          targetX >= width ||
          targetY < 0 ||
          targetY >= height
        ) {
          continue;
        }

        const targetOffset = (targetY * width + targetX) * 4;
        output[targetOffset] = red ?? 0;
        output[targetOffset + 1] = green ?? 0;
        output[targetOffset + 2] = blue ?? 0;
        output[targetOffset + 3] = Math.max(
          output[targetOffset + 3] ?? 0,
          alpha,
        );
      }
    }
  }

  return await rgbaToPngBuffer(output, width, height);
}

async function createLowerPocketOverlayBuffer(assetPath: string) {
  const detailIndexes =
    lowerPocketDetailElementIndexesByFileName[getAssetFileName(assetPath)];

  if (!detailIndexes) {
    return await createOverlayBuffer(assetPath);
  }

  const svgText = (await readAssetFile(assetPath)).toString(
    "utf8",
  );
  const detailProcessed = await processImageBuffer(
    Buffer.from(buildSvgFromDrawableIndexes(svgText, detailIndexes)),
  );
  const placementProcessed = await loadProcessedImage(assetPath);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    detailProcessed,
    placementProcessed,
  );

  return overlayBuffer;
}

async function createLowerPocketTrimOverlayBuffer(assetPath: string) {
  const overlayPath =
    lowerPocketTrimOverlayByFileName[getAssetFileName(assetPath)];

  if (overlayPath) {
    const [trimProcessed, placementProcessed] = await Promise.all([
      loadProcessedImage(overlayPath),
      loadProcessedImage(assetPath),
    ]);

    return await createOverlayBufferFromProcessed(
      trimProcessed,
      placementProcessed,
    );
  }

  const trimIndexes =
    lowerPocketTrimElementIndexesByFileName[getAssetFileName(assetPath)];

  if (!trimIndexes) {
    return undefined;
  }

  const svgText = (await readAssetFile(assetPath)).toString(
    "utf8",
  );
  const trimProcessed = await processImageBuffer(
    Buffer.from(buildSvgFromDrawableIndexes(svgText, trimIndexes)),
  );
  const placementProcessed = await loadProcessedImage(assetPath);

  return await createOverlayBufferFromProcessed(trimProcessed, placementProcessed);
}

async function createLowerPocketSectionTrimOverlayBuffer(
  assetPath: string,
  section: "top" | "bottom" | "complete" | "auxiliary",
) {
  const overlayPath =
    lowerPocketSectionTrimOverlayByFileName[getAssetFileName(assetPath)]?.[
      section
    ];

  if (!overlayPath) {
    return undefined;
  }

  const [trimProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(assetPath),
  ]);

  return await createOverlayBufferFromProcessed(
    trimProcessed,
    placementProcessed,
  );
}

async function createPantsSidePocketTrimOverlayBuffer(
  placementAssetPath: string,
  trimColor: string | undefined,
  sidePocketType: AutomationRenderScene["pantsSidePocketType"],
) {
  if (!trimColor || !sidePocketType) {
    return undefined;
  }

  const overlayAssetPath =
    sidePocketType === "asorsalud"
      ? PANTS_SIDE_POCKET_ASORSALUD_TRIM_ASSET
      : PANTS_SIDE_POCKET_DOUBLE_ZIPPER_TRIM_ASSET;
  const [trimProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayAssetPath),
    loadProcessedImage(placementAssetPath),
  ]);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    trimProcessed,
    placementProcessed,
  );

  return await recolorPngInkBuffer(overlayBuffer, trimColor);
}

async function createPantsKneePatchSideOverlayBuffers(
  placementAssetPath: string,
  side: "left" | "right",
  model:
    | "square"
    | "camouflage"
    | "point"
    | "internal"
    | "ribete"
    | "triangularFlap"
    | undefined,
  type: AutomationRenderScene["pantsKneePatchLeftType"],
  trimColor: string | undefined,
  verticalZipperTrimColor: string | undefined,
  buttonTrimColor: string | undefined,
  ribeteTrimColor: string | undefined,
) {
  if (!model) {
    return [];
  }

  const buffers: Buffer[] = [];
  if (model === "camouflage") {
    if (type === "buckle") {
      const buckleOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
        PANTS_KNEE_PATCH_CAMOUFLAGE_BUCKLE_ASSET_BY_SIDE[side],
        placementAssetPath,
      );

      if (buckleOverlayBuffer) {
        buffers.push(buckleOverlayBuffer);
      }

      return buffers;
    }

    if ((type === "button" || type === "snap") && trimColor) {
      const fillOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
        PANTS_KNEE_PATCH_CAMOUFLAGE_FILL_ASSET_BY_SIDE[side],
        placementAssetPath,
      );

      if (fillOverlayBuffer) {
        buffers.push(await recolorPngInkBuffer(fillOverlayBuffer, trimColor));
      }
    }

    const patchOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
      PANTS_KNEE_PATCH_CAMOUFLAGE_ASSET_BY_SIDE[side],
      placementAssetPath,
    );

    if (patchOverlayBuffer) {
      buffers.push(patchOverlayBuffer);
    }

    if (type === "button") {
      const buttonOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
        PANTS_KNEE_PATCH_CAMOUFLAGE_BUTTON_ASSET_BY_SIDE[side],
        placementAssetPath,
      );

      if (buttonOverlayBuffer) {
        buffers.push(
          buttonTrimColor
            ? await recolorPngInkBuffer(buttonOverlayBuffer, buttonTrimColor)
            : buttonOverlayBuffer,
        );
      }
    }

    if (type === "snap") {
      const snapOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
        PANTS_KNEE_PATCH_CAMOUFLAGE_SNAP_ASSET_BY_SIDE[side],
        placementAssetPath,
      );

      if (snapOverlayBuffer) {
        buffers.push(snapOverlayBuffer);
      }
    }

    return buffers;
  }

  if (model === "point") {
    const seamOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
      trimColor
        ? PANTS_KNEE_PATCH_POINT_PEN_SEAM_FILL_ASSET_BY_SIDE[side]
        : PANTS_KNEE_PATCH_POINT_PEN_SEAM_ASSET_BY_SIDE[side],
      placementAssetPath,
    );

    if (seamOverlayBuffer) {
      buffers.push(
        trimColor
          ? await recolorPngInkBuffer(seamOverlayBuffer, trimColor)
          : seamOverlayBuffer,
      );
    }

    const patchOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
      PANTS_KNEE_PATCH_POINT_ASSET_BY_SIDE[side],
      placementAssetPath,
    );

    if (patchOverlayBuffer) {
      buffers.push(patchOverlayBuffer);
    }

    return buffers;
  }

  if (model === "internal") {
    const patchOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
      PANTS_KNEE_PATCH_INTERNAL_ASSET_BY_SIDE[side],
      placementAssetPath,
    );

    if (patchOverlayBuffer) {
      buffers.push(patchOverlayBuffer);
    }

    return buffers;
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
      const zipperOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
        PANTS_KNEE_PATCH_RIBETE_ZIPPER_ASSET_BY_SIDE[side],
        placementAssetPath,
      );

      if (zipperOverlayBuffer) {
        buffers.push(zipperOverlayBuffer);
      }

      if (zipperTrimColor) {
        const zipperFillOverlayBuffer =
          await createGarmentDetailAssetOverlayBuffer(
            PANTS_KNEE_PATCH_RIBETE_ZIPPER_FILL_ASSET_BY_SIDE[side],
            placementAssetPath,
          );

        if (zipperFillOverlayBuffer) {
          buffers.push(
            await recolorPngInkBuffer(
              zipperFillOverlayBuffer,
              zipperTrimColor,
            ),
          );
        }
      }

      return buffers;
    }

    const plainRibeteTrimColor = type === "plain" ? ribeteTrimColor : undefined;

    if (plainRibeteTrimColor) {
      const plainFillOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
        PANTS_KNEE_PATCH_RIBETE_PLAIN_FILL_ASSET_BY_SIDE[side],
        placementAssetPath,
      );

      if (plainFillOverlayBuffer) {
        buffers.push(
          await recolorPngInkBuffer(
            plainFillOverlayBuffer,
            plainRibeteTrimColor,
          ),
        );
      }
    }

    const plainOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
      PANTS_KNEE_PATCH_RIBETE_PLAIN_ASSET_BY_SIDE[side],
      placementAssetPath,
    );

    if (plainOverlayBuffer) {
      buffers.push(plainOverlayBuffer);
    }

    return buffers;
  }

  if (model === "triangularFlap") {
    const patchOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
      PANTS_KNEE_PATCH_TRIANGULAR_FLAP_ASSET_BY_SIDE[side],
      placementAssetPath,
    );

    if (patchOverlayBuffer) {
      buffers.push(patchOverlayBuffer);
    }

    if (trimColor) {
      const trimOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
        PANTS_KNEE_PATCH_TRIANGULAR_FLAP_TRIM_ASSET_BY_SIDE[side],
        placementAssetPath,
      );

      if (trimOverlayBuffer) {
        buffers.push(await recolorPngInkBuffer(trimOverlayBuffer, trimColor));
      }
    }

    return buffers;
  }

  const patchOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
    PANTS_KNEE_PATCH_SQUARE_ASSET_BY_SIDE[side],
    placementAssetPath,
  );

  if (patchOverlayBuffer) {
    buffers.push(patchOverlayBuffer);
  }

  if (type === "overlaid") {
    const lowerLineOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
      PANTS_KNEE_PATCH_LINEAR_TRIM_ASSET_BY_GROUP.full.lower[side],
      placementAssetPath,
    );

    if (lowerLineOverlayBuffer) {
      buffers.push(lowerLineOverlayBuffer);
    }

    return buffers;
  }

  if (type === "plain" && trimColor) {
    const trimOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
      PANTS_KNEE_PATCH_SQUARE_TRIM_ASSET_BY_SIDE[side],
      placementAssetPath,
    );

    if (trimOverlayBuffer) {
      buffers.push(await recolorPngInkBuffer(trimOverlayBuffer, trimColor));
    }

    return buffers;
  }

  if (type !== "horizontalZipper" && type !== "verticalZipper") {
    return buffers;
  }

  const zipperTrimColor =
    type === "verticalZipper" || type === "horizontalZipper"
      ? verticalZipperTrimColor
      : trimColor;
  const zipperOverlayAsset =
    type === "verticalZipper"
      ? zipperTrimColor
        ? PANTS_KNEE_PATCH_VERTICAL_ZIPPER_FILL_ASSET_BY_SIDE[side]
        : PANTS_KNEE_PATCH_VERTICAL_ZIPPER_ASSET_BY_SIDE[side]
      : zipperTrimColor
        ? PANTS_KNEE_PATCH_ZIPPER_FILL_ASSET_BY_SIDE[side]
        : PANTS_KNEE_PATCH_ZIPPER_ASSET_BY_SIDE[side];
  const zipperOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
    zipperOverlayAsset,
    placementAssetPath,
  );

  if (!zipperOverlayBuffer) {
    return buffers;
  }

  buffers.push(
    zipperTrimColor
      ? await recolorPngInkBuffer(zipperOverlayBuffer, zipperTrimColor)
      : zipperOverlayBuffer,
  );

  return buffers;
}

async function createPantsKneePatchOverlayBuffers(
  scene: AutomationRenderScene,
  placementAssetPath: string,
  trimColor: string | undefined,
  rightTrimColor: string | undefined,
  leftTrimColor: string | undefined,
  rightRibeteTrimColor: string | undefined,
  leftRibeteTrimColor: string | undefined,
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
  const rightBuffers = await createPantsKneePatchSideOverlayBuffers(
    placementAssetPath,
    "right",
    scene.pantsKneePatchRightModel,
    scene.pantsKneePatchRightType,
    rightTrimColor ?? trimColor,
    rightVerticalZipperTrimColor,
    rightButtonTrimColor,
    rightRibeteTrimColor,
  );
  const leftBuffers = await createPantsKneePatchSideOverlayBuffers(
    placementAssetPath,
    "left",
    scene.pantsKneePatchLeftModel,
    scene.pantsKneePatchLeftType,
    leftTrimColor ?? trimColor,
    leftVerticalZipperTrimColor,
    leftButtonTrimColor,
    leftRibeteTrimColor,
  );

  const buffers = [...rightBuffers, ...leftBuffers];

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

      const lineOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
        PANTS_KNEE_PATCH_LINEAR_TRIM_ASSET_BY_GROUP[group][position][side],
        placementAssetPath,
      );

      if (lineOverlayBuffer) {
        buffers.push(await recolorPngInkBuffer(lineOverlayBuffer, color));
      }
    }

    if (upperRingTrimColor) {
      const ringOverlayBuffer = await createGarmentDetailAssetOverlayBuffer(
        PANTS_KNEE_PATCH_LINEAR_UPPER_RING_ASSET_BY_GROUP[group][side],
        placementAssetPath,
      );

      if (ringOverlayBuffer) {
        buffers.push(
          await recolorPngInkBuffer(ringOverlayBuffer, upperRingTrimColor),
        );
      }
    }
  }

  return buffers;
}

async function createChestPocketOverlayBuffer(
  assetPath: string,
  placementAssetPath: string,
) {
  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(assetPath),
    loadProcessedImage(placementAssetPath),
  ]);

  return await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );
}

async function createChestPocketTrimOverlayBuffer(
  assetPath: string,
  placementAssetPath: string,
) {
  const overlayPath =
    chestPocketTrimOverlayByFileName[getAssetFileName(assetPath)];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(placementAssetPath),
  ]);

  return await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );
}

async function createChestPocketSectionTrimOverlayBuffer(
  assetPath: string,
  placementAssetPath: string,
  section: "upper" | "zipper" | "lower",
) {
  const overlayPath =
    chestPocketSectionTrimOverlayByFileName[getAssetFileName(assetPath)]?.[
      section
    ];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(placementAssetPath),
  ]);

  return await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );
}

async function createGarmentModelDetailOverlayBuffer(
  garmentAssetPath: string | undefined,
  placementAssetPath: string,
  trimColor?: string,
) {
  if (!garmentAssetPath) {
    return undefined;
  }

  const overlayPath =
    garmentDetailOverlayByFileName[getAssetFileName(garmentAssetPath)];

  if (!overlayPath) {
    return undefined;
  }

  if (garmentAssetPath === placementAssetPath && !trimColor) {
    return undefined;
  }

  const detailPlacementAssetPath =
    getAssetFileName(garmentAssetPath) === BLUSA_PESPUNTE_MODEL_FILE_NAME
      ? garmentAssetPath
      : placementAssetPath;

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(detailPlacementAssetPath),
  ]);

  const overlayBuffer = await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );

  return trimColor
    ? await recolorPngInkBuffer(overlayBuffer, trimColor)
    : overlayBuffer;
}

function isPespunteDetailOverlayAsset(assetPath: string) {
  const fileName = getAssetFileName(assetPath);

  return (
    fileName === "pants-pespunte-stitching.svg" ||
    fileName === "blouse-model-45-pespunte-stitching.svg"
  );
}

async function createGarmentDetailAssetOverlayBuffer(
  overlayAssetPath: string | undefined,
  placementAssetPath: string,
  trimColor?: string,
) {
  if (!overlayAssetPath) {
    return undefined;
  }

  const resolvedOverlayAssetPath = resolveGarmentDetailOverlayAssetPath(
    overlayAssetPath,
    placementAssetPath,
  );
  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(resolvedOverlayAssetPath),
    loadProcessedImage(placementAssetPath),
  ]);

  const overlayBuffer = await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );

  return trimColor && isPespunteDetailOverlayAsset(resolvedOverlayAssetPath)
    ? await recolorPngInkBuffer(overlayBuffer, trimColor)
    : overlayBuffer;
}

async function createNeckModelDetailOverlayBuffer(
  neckAssetPath: string,
  overlaysByFileName = neckModelDetailOverlayByFileName,
) {
  const overlayPath =
    overlaysByFileName[getAssetFileName(neckAssetPath)];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(neckAssetPath),
  ]);

  return await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );
}

async function createCollarTrimOverlayBuffer(
  assetPath: string,
  trimColor: string,
  trimIndexesOverride?: number[],
) {
  const assetFileName = getAssetFileName(assetPath);
  const overlayPath = collarTrimOverlayByFileName[assetFileName];

  if (overlayPath && !trimIndexesOverride) {
    const [overlayProcessed, placementProcessed] = await Promise.all([
      loadProcessedImage(overlayPath),
      loadProcessedImage(assetPath),
    ]);
    const overlayBuffer = await createOverlayBufferFromProcessed(
      overlayProcessed,
      placementProcessed,
    );

    return await recolorPngInkBuffer(overlayBuffer, trimColor);
  }

  const trimIndexes =
    trimIndexesOverride ?? collarTrimElementIndexesByFileName[assetFileName];

  if (!trimIndexes) {
    return undefined;
  }

  const svgText = (await readAssetFile(assetPath)).toString(
    "utf8",
  );
  const trimProcessed = await processImageBuffer(
    Buffer.from(buildSvgFromDrawableIndexes(svgText, trimIndexes)),
  );
  const placementProcessed = await loadProcessedImage(assetPath);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    trimProcessed,
    placementProcessed,
  );

  return await recolorPngInkBuffer(overlayBuffer, trimColor);
}

async function createFilledCollarTrimOverlayBuffer(
  assetPath: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return undefined;
  }

  const overlayPath =
    filledCollarTrimOverlayByFileName[getAssetFileName(assetPath)];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(assetPath),
  ]);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );

  return await recolorPngInkBuffer(overlayBuffer, trimColor);
}

async function createHighCollarTrimOverlayBuffer(
  assetPath: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return undefined;
  }

  const overlayPath = highCollarTrimOverlayByFileName[getAssetFileName(assetPath)];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(assetPath),
  ]);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );

  return await recolorPngInkBuffer(overlayBuffer, trimColor);
}

async function createInternalCollarTrimOverlayBuffer(
  assetPath: string,
  side: "left" | "right",
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return undefined;
  }

  const overlayPath =
    internalCollarTrimOverlayByFileName[getAssetFileName(assetPath)]?.[side];

  if (overlayPath) {
    const [overlayProcessed, placementProcessed] = await Promise.all([
      loadProcessedImage(overlayPath),
      loadProcessedImage(assetPath),
    ]);
    const overlayBuffer = await createOverlayBufferFromProcessed(
      overlayProcessed,
      placementProcessed,
    );

    return await recolorPngInkBuffer(overlayBuffer, trimColor);
  }

  const trimIndexes =
    internalCollarTrimElementIndexesByFileName[getAssetFileName(assetPath)]?.[
      side
    ];

  if (!trimIndexes) {
    return undefined;
  }

  return await createCollarTrimOverlayBuffer(
    assetPath,
    trimColor,
    trimIndexes,
  );
}

async function createInnerCollarTrimOverlayBuffer(
  assetPath: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return undefined;
  }

  const overlayPath =
    innerCollarTrimOverlayByFileName[getAssetFileName(assetPath)];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(assetPath),
  ]);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );

  return await recolorPngInkBuffer(overlayBuffer, trimColor);
}

async function createCollarRingsTrimOverlayBuffer(
  assetPath: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return undefined;
  }

  const overlayPath =
    collarRingsTrimOverlayByFileName[getAssetFileName(assetPath)];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(assetPath),
  ]);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );

  return await recolorPngInkBuffer(overlayBuffer, trimColor);
}

async function createDividedCollarTrimOverlayBuffer(
  assetPath: string,
  section: "upper" | "lower",
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return undefined;
  }

  const overlayPath =
    dividedCollarTrimOverlayByFileName[getAssetFileName(assetPath)]?.[section];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(assetPath),
  ]);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );

  return await recolorPngInkBuffer(overlayBuffer, trimColor);
}

async function createExternalCollarTrimOverlayBuffer(
  assetPath: string,
  side: "left" | "right",
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return undefined;
  }

  const overlayPath =
    externalCollarTrimOverlayByFileName[getAssetFileName(assetPath)]?.[side];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(assetPath),
  ]);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );

  return await recolorPngInkBuffer(overlayBuffer, trimColor);
}

async function createDefaultExternalCollarLineOverlayBuffers(
  assetPath: string,
) {
  if (!defaultExternalCollarLineFileNames.has(getAssetFileName(assetPath))) {
    return [];
  }

  const buffers = await Promise.all(
    (["left", "right"] as const).map((side) =>
      createExternalCollarTrimOverlayBuffer(assetPath, side, "#1d1d1b"),
    ),
  );

  return buffers.filter((buffer): buffer is Buffer => Boolean(buffer));
}

async function createThickInteriorCollarTrimOverlayBuffer(
  assetPath: string,
  side: "left" | "right",
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return undefined;
  }

  const overlayPath =
    thickInteriorCollarTrimOverlayByFileName[getAssetFileName(assetPath)]?.[
      side
    ];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(assetPath),
  ]);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );

  return await recolorPngInkBuffer(overlayBuffer, trimColor);
}

async function createLowerCollarTrimOverlayBuffer(
  assetPath: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return undefined;
  }

  const overlayPath =
    lowerCollarTrimOverlayByFileName[getAssetFileName(assetPath)];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(assetPath),
  ]);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );

  return await recolorPngInkBuffer(overlayBuffer, trimColor);
}

async function createCompleteInteriorCollarTrimOverlayBuffer(
  assetPath: string,
  side: "left" | "right",
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return undefined;
  }

  const overlayPath =
    completeInteriorCollarTrimOverlayByFileName[getAssetFileName(assetPath)]?.[
      side
    ];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(assetPath),
  ]);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );

  return await recolorPngInkBuffer(overlayBuffer, trimColor);
}

async function createFlapTrimOverlayBuffer(
  assetPath: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return undefined;
  }

  const overlayPath = flapTrimOverlayByFileName[getAssetFileName(assetPath)];

  if (!overlayPath) {
    return undefined;
  }

  const [overlayProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(overlayPath),
    loadProcessedImage(assetPath),
  ]);
  const overlayBuffer = await createOverlayBufferFromProcessed(
    overlayProcessed,
    placementProcessed,
  );

  return await recolorPngInkBuffer(overlayBuffer, trimColor);
}

async function createBackNeckTrimOverlayBuffer(
  assetPath: string,
  trimColor: string | undefined,
) {
  if (!trimColor) {
    return undefined;
  }

  const overlayPath =
    backNeckTrimOverlayByFileName[getAssetFileName(assetPath)];

  if (overlayPath) {
    const [overlayProcessed, placementProcessed] = await Promise.all([
      loadProcessedImage(overlayPath),
      loadProcessedImage(assetPath),
    ]);
    const overlayBuffer = await createOverlayBufferFromProcessed(
      overlayProcessed,
      placementProcessed,
    );

    return await recolorPngInkBuffer(overlayBuffer, trimColor);
  }

  const trimIndexes =
    backNeckTrimElementIndexesByFileName[getAssetFileName(assetPath)];

  if (!trimIndexes) {
    return undefined;
  }

  return await createCollarTrimOverlayBuffer(
    assetPath,
    trimColor,
    trimIndexes,
  );
}

function getCollarTrimColorForAsset(
  scene: AutomationRenderScene,
  assetPath: string,
) {
  const assetFileName = getAssetFileName(assetPath);

  if (noCollarTrimFileNames.has(assetFileName)) {
    return undefined;
  }

  const completeCollarTrimColor = getTrimSectionColor(
    scene,
    isCompleteCollarSection,
  );
  const isCompleteCollarOnlyNeck =
    completeCollarOnlyFileNames.has(assetFileName);

  if (isCompleteCollarOnlyNeck) {
    return completeCollarTrimColor;
  }

  return (
    completeCollarTrimColor ??
    getTrimSectionColor(scene, isWholeCollarSection)
  );
}

function allowsBackNeckTrim(assetPath: string) {
  return !noBackNeckTrimFileNames.has(getAssetFileName(assetPath));
}

function getCollarLineOutlineRadius(assetPath: string) {
  return [
    "blouse-model-01.svg",
    "blouse-model-02-jdc.svg",
    "blouse-model-30.svg",
    "blouse-model-44-cucuta.svg",
  ].includes(getAssetFileName(assetPath))
    ? 3
    : 7;
}

async function pngBufferToRaw(buffer: Buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data: new Uint8ClampedArray(data),
    width: info.width,
    height: info.height,
  };
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

async function createDetailOverlayBuffer(
  sourceAssetPath: string,
  baseAssetPath: string,
  regions: OverlayRegion[],
  inkRadius = 8,
) {
  const [sourceBuffer, baseBuffer] = await Promise.all([
    createOverlayBuffer(sourceAssetPath),
    createOverlayBuffer(baseAssetPath),
  ]);
  const [source, base] = await Promise.all([
    pngBufferToRaw(sourceBuffer),
    pngBufferToRaw(baseBuffer),
  ]);
  const output = new Uint8ClampedArray(CANVAS_WIDTH * CANVAS_HEIGHT * 4);

  for (const region of regions) {
    const startX = Math.max(0, Math.floor(region.x));
    const endX = Math.min(CANVAS_WIDTH, Math.ceil(region.x + region.width));
    const startY = Math.max(0, Math.floor(region.y));
    const endY = Math.min(CANVAS_HEIGHT, Math.ceil(region.y + region.height));

    for (let y = startY; y < endY; y += 1) {
      for (let x = startX; x < endX; x += 1) {
        const offset = (y * CANVAS_WIDTH + x) * 4;
        const sourceAlpha = source.data[offset + 3] ?? 0;

        if (sourceAlpha <= 24) {
          continue;
        }

        if (hasNearbyInk(base.data, base.width, base.height, x, y, inkRadius)) {
          continue;
        }

        output[offset] = source.data[offset] ?? 0;
        output[offset + 1] = source.data[offset + 1] ?? 0;
        output[offset + 2] = source.data[offset + 2] ?? 0;
        output[offset + 3] = sourceAlpha;
      }
    }
  }

  return await rgbaToPngBuffer(output, CANVAS_WIDTH, CANVAS_HEIGHT);
}

function toDataUri(buffer: Buffer, mimeType = "image/png") {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function getTrimSectionsSvg(scene: AutomationRenderScene) {
  return scene.trimSections
    .map((section) => {
      const key = normalize(section.label || section.key);
      const parts: string[] = [];

      if (key.includes("frente") || key.includes("central")) {
        parts.push(
          `<line x1="450" y1="205" x2="450" y2="978" stroke="${section.colorHex}" stroke-width="10" stroke-linecap="round" />`,
        );
      }

      return parts.join("");
    })
    .join("");
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

function getBackNeckTrimSvg(
  trimColor: string,
  pathData = "M305 128 L595 128",
  verticalOffset = BACK_NECK_STRAIGHT_VERTICAL_OFFSET,
) {
  return `
    <defs>
      <filter id="back-neck-trim-glow" x="-35%" y="-220%" width="170%" height="520%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    <g transform="translate(0 ${verticalOffset})">
      <path d="${pathData}" fill="none" stroke="#f8fafc" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" filter="url(#back-neck-trim-glow)" />
      <path d="${pathData}" fill="none" stroke="${trimColor}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  `;
}

function getOverlaySvg(
  clipId: string,
  overlayDataUri: string,
  regions: OverlayRegion[],
) {
  const rectangles = regions
    .map(
      (region) =>
        `<rect x="${region.x}" y="${region.y}" width="${region.width}" height="${region.height}" />`,
    )
    .join("");

  return `
    <defs>
      <clipPath id="${clipId}">${rectangles}</clipPath>
    </defs>
    <image href="${overlayDataUri}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" clip-path="url(#${clipId})" />
  `;
}

function getLowerPocketOverlayRegions(
  assetPath: string,
  layout: AutomationRenderScene["lowerPocketLayout"],
) {
  const override =
    lowerPocketOverlayRegionsByFileName[getAssetFileName(assetPath)];

  if (override) {
    const singleRegion = override[1] ?? override[0];
    return layout === "single" && singleRegion ? [singleRegion] : override;
  }

  return layout === "single"
    ? overlayRegionPresets.lowerPocketSingleRight
    : overlayRegionPresets.lowerPocketPair;
}

function getImageSvg(imageDataUri: string, y = 0) {
  return `<image href="${imageDataUri}" x="0" y="${y}" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`;
}

function getLogoMarkerSvg(placement: string) {
  return getLogoMarkerPositions(placement)
    .map(
      (position) => `
        <circle cx="${position.x}" cy="${position.y}" r="${LOGO_MARKER_OUTLINE_RADIUS}" fill="${LOGO_MARKER_OUTLINE}" />
        <circle cx="${position.x}" cy="${position.y}" r="${LOGO_MARKER_RADIUS}" fill="${LOGO_MARKER_FILL}" />
      `,
    )
    .join("");
}

function getSleeveTabMarkersSvg(trimColor: string) {
  return SLEEVE_TAB_MARKER_POSITIONS.map(
    (position) => `
      ${getSleeveTabMarkerTriangleSvg(position, SLEEVE_TAB_MARKER_OUTLINE_RADIUS, LOGO_MARKER_OUTLINE)}
      ${getSleeveTabMarkerTriangleSvg(position, SLEEVE_TAB_MARKER_RADIUS, trimColor)}
    `,
  ).join("");
}

function getSleeveTabMarkerTriangleSvg(
  position: { x: number; y: number },
  radius: number,
  fill: string,
) {
  const halfBase = radius * 0.866;
  const bottomY = position.y + radius * 0.5;
  const points = [
    `${position.x},${position.y - radius}`,
    `${position.x + halfBase},${bottomY}`,
    `${position.x - halfBase},${bottomY}`,
  ].join(" ");

  return `<polygon points="${points}" fill="${fill}" />`;
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

function getAssetToCanvasTransformFromProcessed(
  processed: ProcessedImage,
): AssetToCanvasTransform {
  const { drawX, drawY, drawWidth, drawHeight } = getDrawRect(processed.bounds);

  return {
    drawX,
    drawY,
    scaleX: drawWidth / processed.bounds.width,
    scaleY: drawHeight / processed.bounds.height,
    sourceX: processed.bounds.x,
    sourceY: processed.bounds.y,
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

function formatSvgNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

function getTransformedPolygonPoints(
  points: readonly OriginalSleevePoint[],
  transform: AssetToCanvasTransform,
) {
  return points
    .map((point) => {
      const transformed = transformOriginalSleevePoint(point, transform);
      return `${formatSvgNumber(transformed.x)},${formatSvgNumber(transformed.y)}`;
    })
    .join(" ");
}

function getOriginalSleeveLineSvg(
  line: readonly [OriginalSleevePoint, OriginalSleevePoint],
  transform: AssetToCanvasTransform,
  trimColor: string,
) {
  const start = transformOriginalSleevePoint(line[0], transform);
  const end = transformOriginalSleevePoint(line[1], transform);
  const lineAttrs = `x1="${formatSvgNumber(start.x)}" y1="${formatSvgNumber(start.y)}" x2="${formatSvgNumber(end.x)}" y2="${formatSvgNumber(end.y)}" stroke-linecap="round" stroke-linejoin="round"`;

  return `
    <line ${lineAttrs} stroke="#f8fafc" stroke-width="12" />
    <line ${lineAttrs} stroke="${trimColor}" stroke-width="7" />
  `;
}

function isOriginalSleevesDetailAsset(assetPath: string) {
  return getAssetFileName(assetPath) === ORIGINAL_SLEEVES_DETAIL_FILE_NAME;
}

function hasOriginalSleevesDetailAsset(assetPaths: readonly string[]) {
  return assetPaths.some(isOriginalSleevesDetailAsset);
}

function getOriginalSleeveTrimShapes(placementAssetPath: string) {
  const placementFileName = getAssetFileName(placementAssetPath);

  if (placementFileName === "blouse-model-15-presillas.svg") {
    return PRESILLAS_NECK_ORIGINAL_SLEEVE_TRIM_SHAPES;
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

function getOriginalSleeveFillShapes(placementAssetPath: string) {
  if (getAssetFileName(placementAssetPath) === "blouse-model-15-presillas.svg") {
    return PRESILLAS_NECK_ORIGINAL_SLEEVE_TRIM_SHAPES;
  }

  if (getAssetFileName(placementAssetPath) === "blouse-model-05.svg") {
    return PUNTADAS_ORIGINAL_SLEEVE_TRIM_SHAPES;
  }

  return getOriginalSleeveTrimShapes(placementAssetPath);
}

function resolveGarmentDetailOverlayAssetPath(
  overlayAssetPath: string,
  placementAssetPath: string,
) {
  if (getAssetFileName(overlayAssetPath) !== ORIGINAL_SLEEVES_DETAIL_FILE_NAME) {
    return overlayAssetPath;
  }

  const placementFileName = getAssetFileName(placementAssetPath);

  if (PUNTADAS_ALIGNED_ORIGINAL_SLEEVE_BASE_FILE_NAMES.has(placementFileName)) {
    return PUNTADAS_ORIGINAL_SLEEVES_DETAIL_OVERLAY;
  }

  return (
    ORIGINAL_SLEEVES_DETAIL_OVERLAY_BY_BASE_FILE_NAME[placementFileName] ??
    overlayAssetPath
  );
}

async function getOriginalSleevesTrimSvg(
  placementAssetPath: string,
  trimColors: OriginalSleevesTrimColors,
) {
  if (!trimColors.upper && !trimColors.lower && !trimColors.fill) {
    return "";
  }

  const transform = getAssetToCanvasTransformFromProcessed(
    await loadProcessedImage(placementAssetPath),
  );
  const trimShapes = getOriginalSleeveTrimShapes(placementAssetPath);
  const fillShapes = getOriginalSleeveFillShapes(placementAssetPath);
  const layers: string[] = [];

  const fillTrimColor = trimColors.fill;
  if (fillTrimColor) {
    layers.push(
      ...fillShapes.map(
        (shape) => `
          <polygon
            points="${getTransformedPolygonPoints(shape.points, transform)}"
            fill="${fillTrimColor}"
          />
        `,
      ),
    );
  }

  const upperTrimColor = trimColors.upper;
  if (upperTrimColor) {
    layers.push(
      ...trimShapes.map((shape) =>
        getOriginalSleeveLineSvg(shape.upper, transform, upperTrimColor),
      ),
    );
  }

  const lowerTrimColor = trimColors.lower;
  if (lowerTrimColor) {
    layers.push(
      ...trimShapes.map((shape) =>
        getOriginalSleeveLineSvg(shape.lower, transform, lowerTrimColor),
      ),
    );
  }

  return `<g id="original-sleeves-trim">${layers.join("")}</g>`;
}

function getRawInkBoundsInRegion(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  region: OverlayRegion,
) {
  const startX = Math.max(0, Math.floor(region.x));
  const startY = Math.max(0, Math.floor(region.y));
  const endX = Math.min(width, Math.ceil(region.x + region.width));
  const endY = Math.min(height, Math.ceil(region.y + region.height));
  let minX = endX;
  let minY = endY;
  let maxX = startX;
  let maxY = startY;
  let hasInk = false;

  for (let y = startY; y < endY; y += 1) {
    for (let x = startX; x < endX; x += 1) {
      const offset = (y * width + x) * 4;
      const alpha = data[offset + 3] ?? 0;

      if (alpha <= 24) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      hasInk = true;
    }
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

function getRawInkBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
) {
  return getRawInkBoundsInRegion(data, width, height, {
    x: 0,
    y: 0,
    width,
    height,
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
};

function getPocketTrimLineSvg(
  x1: number,
  x2: number,
  y: number,
  trimColor: string,
  filterId = "lower-pocket-trim-glow",
) {
  const pathData = `M${x1} ${y} L${x2} ${y}`;

  return `
    <path d="${pathData}" fill="none" stroke="#f8fafc" stroke-width="${POCKET_TRIM_OUTLINE_LINE_WIDTH}" stroke-linecap="butt" stroke-linejoin="round" filter="url(#${filterId})" />
    <path d="${pathData}" fill="none" stroke="${trimColor}" stroke-width="${POCKET_TRIM_LINE_WIDTH}" stroke-linecap="butt" stroke-linejoin="round" />
  `;
}

async function getLowerPocketTrimBandSvg(
  trimOverlayBuffer: Buffer,
  trimColors: LowerPocketBandTrimColors,
  regions: OverlayRegion[],
) {
  const raw = await pngBufferToRaw(trimOverlayBuffer);
  const bands = regions
    .map((region) => {
      const bounds = getRawInkBoundsInRegion(
        raw.data,
        raw.width,
        raw.height,
        region,
      );

      if (!bounds) {
        return "";
      }

      const band = buildPocketTrimBand(bounds);
      const lines: string[] = [];

      if (trimColors.top) {
        lines.push(
          getPocketTrimLineSvg(
            band.x + POCKET_TRIM_LINE_HORIZONTAL_INSET,
            band.x + band.width - POCKET_TRIM_LINE_HORIZONTAL_INSET,
            band.topLineY,
            trimColors.top,
          ),
        );
      }

      if (trimColors.bottom) {
        lines.push(
          getPocketTrimLineSvg(
            band.x + POCKET_TRIM_LINE_HORIZONTAL_INSET,
            band.x + band.width - POCKET_TRIM_LINE_HORIZONTAL_INSET,
            band.bottomLineY,
            trimColors.bottom,
          ),
        );
      }

      return lines.join("");
    })
    .join("");

  if (!bands.trim()) {
    return "";
  }

  return `
    <defs>
      <filter id="lower-pocket-trim-glow" x="-30%" y="-120%" width="160%" height="340%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    ${bands}
  `;
}

async function getChestPocketTrimLineSvg(
  trimOverlayBuffer: Buffer,
  trimColor: string,
) {
  const raw = await pngBufferToRaw(trimOverlayBuffer);
  const bounds = getRawInkBounds(raw.data, raw.width, raw.height);

  if (!bounds) {
    return "";
  }

  const lineSvg = getPocketTrimLineSvg(
    bounds.x + POCKET_TRIM_LINE_HORIZONTAL_INSET,
    bounds.x + bounds.width - POCKET_TRIM_LINE_HORIZONTAL_INSET,
    bounds.y + CHEST_POCKET_VERTICAL_OFFSET + POCKET_TRIM_LINE_WIDTH / 2,
    trimColor,
    "chest-pocket-trim-glow",
  );

  return `
    <defs>
      <filter id="chest-pocket-trim-glow" x="-30%" y="-120%" width="160%" height="340%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    ${lineSvg}
  `;
}

function getFallbackGarmentSvg(fillColor: string) {
  return `
    <path d="M250 180 L180 290 L235 355 L270 330 L300 980 L600 980 L630 330 L665 355 L720 290 L650 180 L560 140 L340 140 Z" fill="${fillColor}" stroke="#0f172a" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" />
    <path d="M405 140 C420 210 480 210 495 140" fill="none" stroke="#0f172a" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
    <line x1="450" y1="205" x2="450" y2="978" stroke="#94a3b8" stroke-width="4" stroke-dasharray="18 12" />
  `;
}

async function createUniformCompositeBuffer(scene: AutomationRenderScene) {
  if (!scene.uniformParts) {
    throw new Error("La escena de uniforme no tiene partes configuradas.");
  }

  const [blouseBuffer, pantsBuffer] = await Promise.all([
    renderDesignImage(scene.uniformParts.blouse),
    renderDesignImage(scene.uniformParts.pants),
  ]);
  const blouseLayer = await sharp(blouseBuffer)
    .extract({ left: 72, top: 80, width: 756, height: 990 })
    .resize(525, 820, { fit: "fill" })
    .png()
    .toBuffer();
  const pantsLayer = await sharp(pantsBuffer)
    .extract({ left: 218, top: 56, width: 466, height: 1090 })
    .resize(300, 900, { fit: "fill" })
    .png()
    .toBuffer();

  return await sharp({
    create: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      channels: 4,
      background: "#ffffff",
    },
  })
    .composite([
      { input: blouseLayer, left: 0, top: 188 },
      { input: pantsLayer, left: 600, top: 145 },
    ])
    .png()
    .toBuffer();
}

export async function renderDesignImage(scene: AutomationRenderScene): Promise<Buffer> {
  if (scene.uniformParts) {
    return await createUniformCompositeBuffer(scene);
  }

  const layers: string[] = [
    `<rect width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" fill="#ffffff" />`,
  ];
  const baseAssetPath = scene.neckAssetPath ?? scene.garmentAssetPath;

  if (baseAssetPath) {
    const baseBuffer = await createTintedBaseBuffer(
      baseAssetPath,
      scene.baseColorHex,
    );
    layers.push(
      `<image href="${toDataUri(baseBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
    );
  } else {
    layers.push(getFallbackGarmentSvg(scene.baseColorHex));
  }

  if (baseAssetPath) {
    const pespunteTrimColor = getTrimSectionColor(scene, isPespunteTrimSection);

    const garmentDetailOverlayBuffer =
      await createGarmentModelDetailOverlayBuffer(
        scene.garmentAssetPath,
        baseAssetPath,
        pespunteTrimColor,
      );

    if (garmentDetailOverlayBuffer) {
      layers.push(
        `<image href="${toDataUri(garmentDetailOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    const garmentDetailAssetPaths =
      scene.garmentDetailAssetPaths ??
      (scene.garmentDetailAssetPath ? [scene.garmentDetailAssetPath] : []);
    const hasOriginalSleevesOverlay =
      hasOriginalSleevesDetailAsset(garmentDetailAssetPaths);

    for (const garmentDetailAssetPath of garmentDetailAssetPaths) {
      if (isOriginalSleevesDetailAsset(garmentDetailAssetPath)) {
        continue;
      }

      const garmentDetailAssetOverlayBuffer =
        await createGarmentDetailAssetOverlayBuffer(
          garmentDetailAssetPath,
          baseAssetPath,
          pespunteTrimColor,
        );

      if (garmentDetailAssetOverlayBuffer) {
        layers.push(
          `<image href="${toDataUri(garmentDetailAssetOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        );
      }
    }

    const waistbandAssetOverlayBuffer =
      await createGarmentDetailAssetOverlayBuffer(
        scene.waistbandAssetPath,
        baseAssetPath,
      );

    if (waistbandAssetOverlayBuffer) {
      layers.push(
        `<image href="${toDataUri(waistbandAssetOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    const bootAssetOverlayBuffer =
      await createGarmentDetailAssetOverlayBuffer(
        scene.bootAssetPath,
        baseAssetPath,
      );

    if (bootAssetOverlayBuffer) {
      layers.push(
        `<image href="${toDataUri(bootAssetOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    const earlyNeckModelDetailOverlayBuffer =
      await createNeckModelDetailOverlayBuffer(
        baseAssetPath,
        earlyNeckModelDetailOverlayByFileName,
      );

    if (earlyNeckModelDetailOverlayBuffer) {
      layers.push(
        `<image href="${toDataUri(earlyNeckModelDetailOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    const collarTrimColor = getCollarTrimColorForAsset(scene, baseAssetPath);
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
    const backNeckTrimColor = allowsBackNeckTrim(baseAssetPath)
      ? getTrimSectionColor(scene, isBackNeckTrimSection)
      : undefined;
    const lowerPocketFileName = scene.lowerPocketAssetPath
      ? getAssetFileName(scene.lowerPocketAssetPath)
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
    const lowerPocketTrimColor =
      lowerPocketUpperTrimColor ??
      lowerPocketLowerTrimColor ??
      lowerPocketCompleteTrimColor;
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
    const pantsKneePatchRightRibeteTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchRightRibeteTrimSection,
    );
    const pantsKneePatchLeftRibeteTrimColor = getTrimSectionColor(
      scene,
      isPantsKneePatchLeftRibeteTrimSection,
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

    const pantsSidePocketTrimOverlayBuffer =
      await createPantsSidePocketTrimOverlayBuffer(
        baseAssetPath,
        pantsSidePocketTrimColor,
        scene.pantsSidePocketType,
      );
    const pantsKneePatchOverlayBuffers =
      await createPantsKneePatchOverlayBuffers(
        scene,
        baseAssetPath,
        pantsKneePatchTrimColor,
        pantsKneePatchRightTrimColor,
        pantsKneePatchLeftTrimColor,
        pantsKneePatchRightRibeteTrimColor,
        pantsKneePatchLeftRibeteTrimColor,
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

    if (pantsSidePocketTrimOverlayBuffer) {
      layers.push(
        `<image href="${toDataUri(pantsSidePocketTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    for (const pantsKneePatchOverlayBuffer of pantsKneePatchOverlayBuffers) {
      layers.push(getImageSvg(toDataUri(pantsKneePatchOverlayBuffer)));
    }

    if (collarTrimColor) {
      const filledCollarTrimOverlayBuffer =
        await createFilledCollarTrimOverlayBuffer(
          baseAssetPath,
          collarTrimColor,
        );
      const collarTrimOverlayBuffer = filledCollarTrimOverlayBuffer
        ? undefined
        : await createCollarTrimOverlayBuffer(
            baseAssetPath,
            collarTrimColor,
          );

      if (filledCollarTrimOverlayBuffer) {
        layers.push(
          `<image href="${toDataUri(filledCollarTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        );
      } else if (collarTrimOverlayBuffer) {
        const collarTrimOutlineBuffer = await createPngInkOutlineBuffer(
          collarTrimOverlayBuffer,
        );
        layers.push(
          `<image href="${toDataUri(collarTrimOutlineBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
          `<image href="${toDataUri(collarTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        );
      } else {
        const collarBaseBuffer = await createTintedBaseBuffer(
          baseAssetPath,
          collarTrimColor,
        );
        const collarInkBuffer = await recolorPngInkBuffer(
          await createOverlayBuffer(baseAssetPath),
          collarTrimColor,
        );

        layers.push(
          getOverlaySvg(
            "collar-fill-overlay",
            toDataUri(collarBaseBuffer),
            trimRegionPresets.collar,
          ),
          getOverlaySvg(
            "collar-ink-overlay",
            toDataUri(collarInkBuffer),
            trimRegionPresets.collar,
          ),
        );
      }
    }

    const highCollarTrimOverlayBuffer =
      await createHighCollarTrimOverlayBuffer(
        baseAssetPath,
        highCollarTrimColor,
      );

    if (highCollarTrimOverlayBuffer) {
      layers.push(
        `<image href="${toDataUri(highCollarTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    if (collarStitchesTrimColor) {
      const collarStitchesTrimOverlayBuffer = await createCollarTrimOverlayBuffer(
        baseAssetPath,
        collarStitchesTrimColor,
      );

      if (collarStitchesTrimOverlayBuffer) {
        const collarStitchesTrimOutlineBuffer = await createPngInkOutlineBuffer(
          collarStitchesTrimOverlayBuffer,
        );
        layers.push(
          `<image href="${toDataUri(collarStitchesTrimOutlineBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
          `<image href="${toDataUri(collarStitchesTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        );
      }
    }

    const innerCollarTrimOverlayBuffer =
      await createInnerCollarTrimOverlayBuffer(
        baseAssetPath,
        innerCollarTrimColor,
      );

    if (innerCollarTrimOverlayBuffer) {
      const innerCollarTrimOutlineBuffer = await createPngInkOutlineBuffer(
        innerCollarTrimOverlayBuffer,
        "#f8fafc",
        getCollarLineOutlineRadius(baseAssetPath),
      );
      layers.push(
        `<image href="${toDataUri(innerCollarTrimOutlineBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        `<image href="${toDataUri(innerCollarTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    const collarRingsTrimOverlayBuffer =
      await createCollarRingsTrimOverlayBuffer(
        baseAssetPath,
        collarRingsTrimColor,
      );

    if (collarRingsTrimOverlayBuffer) {
      const collarRingsTrimOutlineBuffer = await createPngInkOutlineBuffer(
        collarRingsTrimOverlayBuffer,
        "#f8fafc",
        7,
      );
      layers.push(
        `<image href="${toDataUri(collarRingsTrimOutlineBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        `<image href="${toDataUri(collarRingsTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    for (const [section, trimColor] of [
      ["upper", upperDividedCollarTrimColor],
      ["lower", lowerDividedCollarTrimColor],
    ] as const) {
      const dividedCollarTrimOverlayBuffer =
        await createDividedCollarTrimOverlayBuffer(
          baseAssetPath,
          section,
          trimColor,
        );

      if (!dividedCollarTrimOverlayBuffer) {
        continue;
      }

      const dividedCollarTrimOutlineBuffer = await createPngInkOutlineBuffer(
        dividedCollarTrimOverlayBuffer,
        "#f8fafc",
        7,
      );
      layers.push(
        `<image href="${toDataUri(dividedCollarTrimOutlineBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        `<image href="${toDataUri(dividedCollarTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    for (const [side, trimColor] of [
      ["left", leftCompleteInteriorCollarTrimColor],
      ["right", rightCompleteInteriorCollarTrimColor],
    ] as const) {
      const completeInteriorCollarTrimOverlayBuffer =
        await createCompleteInteriorCollarTrimOverlayBuffer(
          baseAssetPath,
          side,
          trimColor,
        );

      if (!completeInteriorCollarTrimOverlayBuffer) {
        continue;
      }

      layers.push(
        `<image href="${toDataUri(completeInteriorCollarTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    const lowerCollarTrimOverlayBuffer =
      await createLowerCollarTrimOverlayBuffer(
        baseAssetPath,
        lowerCollarTrimColor,
      );

    if (lowerCollarTrimOverlayBuffer) {
      layers.push(
        `<image href="${toDataUri(lowerCollarTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    for (const [side, trimColor] of [
      ["left", leftThickInteriorCollarTrimColor],
      ["right", rightThickInteriorCollarTrimColor],
    ] as const) {
      const thickInteriorCollarTrimOverlayBuffer =
        await createThickInteriorCollarTrimOverlayBuffer(
          baseAssetPath,
          side,
          trimColor,
        );

      if (!thickInteriorCollarTrimOverlayBuffer) {
        continue;
      }

      layers.push(
        `<image href="${toDataUri(thickInteriorCollarTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    const defaultExternalCollarLineOverlayBuffers =
      await createDefaultExternalCollarLineOverlayBuffers(baseAssetPath);

    for (const overlayBuffer of defaultExternalCollarLineOverlayBuffers) {
      layers.push(
        `<image href="${toDataUri(overlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    for (const [side, trimColor] of [
      ["left", leftInternalCollarTrimColor],
      ["right", rightInternalCollarTrimColor],
    ] as const) {
      const internalCollarTrimOverlayBuffer =
        await createInternalCollarTrimOverlayBuffer(
          baseAssetPath,
          side,
          trimColor,
        );

      if (!internalCollarTrimOverlayBuffer) {
        continue;
      }

      const internalCollarTrimOutlineBuffer = await createPngInkOutlineBuffer(
        internalCollarTrimOverlayBuffer,
        "#f8fafc",
        getCollarLineOutlineRadius(baseAssetPath),
      );
      layers.push(
        `<image href="${toDataUri(internalCollarTrimOutlineBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        `<image href="${toDataUri(internalCollarTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    for (const [side, trimColor] of [
      ["left", leftExternalCollarTrimColor],
      ["right", rightExternalCollarTrimColor],
    ] as const) {
      const externalCollarTrimOverlayBuffer =
        await createExternalCollarTrimOverlayBuffer(
          baseAssetPath,
          side,
          trimColor,
        );

      if (!externalCollarTrimOverlayBuffer) {
        continue;
      }

      const externalCollarTrimOutlineBuffer = await createPngInkOutlineBuffer(
        externalCollarTrimOverlayBuffer,
        "#f8fafc",
        getCollarLineOutlineRadius(baseAssetPath),
      );
      layers.push(
        `<image href="${toDataUri(externalCollarTrimOutlineBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        `<image href="${toDataUri(externalCollarTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    const flapTrimOverlayBuffer = await createFlapTrimOverlayBuffer(
      baseAssetPath,
      flapTrimColor,
    );

    if (flapTrimOverlayBuffer) {
      const flapTrimOutlineBuffer = await createPngInkOutlineBuffer(
        flapTrimOverlayBuffer,
        "#f8fafc",
        7,
      );
      layers.push(
        `<image href="${toDataUri(flapTrimOutlineBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        `<image href="${toDataUri(flapTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    if (backNeckTrimColor) {
      const baseAssetFileName = getAssetFileName(baseAssetPath);
      const backNeckPathData =
        backNeckTrimPathDataByFileName[baseAssetFileName];
      const backNeckVerticalOffset = getBackNeckTrimVerticalOffset(
        baseAssetFileName,
        backNeckPathData,
      );
      const backNeckTrimOverlayBuffer =
        await createBackNeckTrimOverlayBuffer(
          baseAssetPath,
          backNeckTrimColor,
        );

      if (backNeckTrimOverlayBuffer) {
        const backNeckTrimOutlineBuffer = await createPngInkOutlineBuffer(
          backNeckTrimOverlayBuffer,
          "#f8fafc",
          getCollarLineOutlineRadius(baseAssetPath),
        );
        layers.push(
          `<image href="${toDataUri(backNeckTrimOutlineBuffer)}" x="0" y="${backNeckVerticalOffset}" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
          `<image href="${toDataUri(backNeckTrimOverlayBuffer)}" x="0" y="${backNeckVerticalOffset}" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        );
      } else {
        layers.push(
          getBackNeckTrimSvg(
            backNeckTrimColor,
            backNeckPathData,
            backNeckVerticalOffset,
          ),
        );
      }
    }

    const neckModelDetailOverlayBuffer =
      await createNeckModelDetailOverlayBuffer(baseAssetPath);

    if (neckModelDetailOverlayBuffer) {
      layers.push(
        `<image href="${toDataUri(neckModelDetailOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    if (scene.lowerPocketAssetPath && scene.lowerPocketLayout !== "none") {
      const lowerPocketRegions = getLowerPocketOverlayRegions(
        scene.lowerPocketAssetPath,
        scene.lowerPocketLayout,
      );
      const overlayBuffer = await createLowerPocketOverlayBuffer(
        scene.lowerPocketAssetPath,
      );
      layers.push(
        getOverlaySvg(
          "lower-pocket-overlay",
          toDataUri(overlayBuffer),
          lowerPocketRegions,
        ),
      );

      const sectionTrimOverlays =
        lowerPocketSectionTrimOverlayByFileName[
          getAssetFileName(scene.lowerPocketAssetPath)
        ];

      if (sectionTrimOverlays) {
        const sectionTrimOutlineRadius =
          lowerPocketSectionTrimOutlineRadiusByFileName[
            getAssetFileName(scene.lowerPocketAssetPath)
          ] ?? 7;

        for (const [section, trimColor] of [
          ["top", lowerPocketUpperTrimColor],
          ["bottom", lowerPocketLowerTrimColor],
          ["complete", lowerPocketCompleteTrimColor],
          ["auxiliary", auxiliaryPocketTrimColor],
        ] as const) {
          if (!trimColor) {
            continue;
          }

          const trimOverlayBuffer =
            await createLowerPocketSectionTrimOverlayBuffer(
              scene.lowerPocketAssetPath,
              section,
            );

          if (!trimOverlayBuffer) {
            continue;
          }

          const trimColorBuffer = await recolorPngInkBuffer(
            trimOverlayBuffer,
            trimColor,
          );

          if (section !== "complete" && sectionTrimOutlineRadius > 0) {
            const trimOutlineBuffer = await createPngInkOutlineBuffer(
              trimOverlayBuffer,
              "#f8fafc",
              sectionTrimOutlineRadius,
            );

            layers.push(
              getOverlaySvg(
                `lower-pocket-${section}-trim-outline`,
                toDataUri(trimOutlineBuffer),
                lowerPocketRegions,
              ),
            );
          }

          layers.push(
            getOverlaySvg(
              `lower-pocket-${section}-trim-color`,
              toDataUri(trimColorBuffer),
              lowerPocketRegions,
            ),
          );
        }
      } else if (lowerPocketTrimColor) {
        const trimOverlayBuffer = await createLowerPocketTrimOverlayBuffer(
          scene.lowerPocketAssetPath,
        );

        if (trimOverlayBuffer) {
          const trimMode =
            lowerPocketTrimModeByFileName[
              getAssetFileName(scene.lowerPocketAssetPath)
            ] ?? "ink";

          if (trimMode === "band") {
            layers.push(
              await getLowerPocketTrimBandSvg(
                trimOverlayBuffer,
                {
                  top: lowerPocketUpperTrimColor,
                  bottom: lowerPocketLowerTrimColor,
                  complete: lowerPocketCompleteTrimColor,
                },
                lowerPocketRegions,
              ),
            );
          } else {
            const trimOutlineBuffer = await createPngInkOutlineBuffer(
              trimOverlayBuffer,
              "#f8fafc",
              7,
            );
            const trimColorBuffer = await recolorPngInkBuffer(
              trimOverlayBuffer,
              lowerPocketTrimColor,
            );

            layers.push(
              getOverlaySvg(
                "lower-pocket-trim-outline",
                toDataUri(trimOutlineBuffer),
                lowerPocketRegions,
              ),
              getOverlaySvg(
                "lower-pocket-trim-color",
                toDataUri(trimColorBuffer),
                lowerPocketRegions,
              ),
            );
          }
        }
      }
    }

    if (scene.auxiliaryPocketAssetPath) {
      const overlayBuffer = await createDetailOverlayBuffer(
        scene.auxiliaryPocketAssetPath,
        baseAssetPath,
        overlayRegionPresets.auxiliaryPocketPair,
      );
      layers.push(
        getOverlaySvg(
          "aux-pocket-overlay",
          toDataUri(overlayBuffer),
          overlayRegionPresets.auxiliaryPocketPair,
        ),
      );
    }

    if (scene.chestPocketAssetPath) {
      const overlayBuffer = await createChestPocketOverlayBuffer(
        scene.chestPocketAssetPath,
        baseAssetPath,
      );
      layers.push(
        getImageSvg(toDataUri(overlayBuffer), CHEST_POCKET_VERTICAL_OFFSET),
      );

      const chestPocketSectionTrimOverlays =
        chestPocketSectionTrimOverlayByFileName[
          getAssetFileName(scene.chestPocketAssetPath)
        ];

      if (chestPocketSectionTrimOverlays) {
        const chestPocketFileName = getAssetFileName(
          scene.chestPocketAssetPath,
        );
        const trimColorBySection = {
          upper: chestPocketUpperTrimColor,
          zipper: chestPocketZipperTrimColor,
          lower: chestPocketLowerTrimColor,
        } satisfies Record<ChestPocketSectionTrimKey, string | undefined>;

        for (const section of getChestPocketSectionTrimOrder(
          chestPocketFileName,
        )) {
          const trimColor = trimColorBySection[section];

          if (!trimColor) {
            continue;
          }

          const trimOverlayBuffer =
            await createChestPocketSectionTrimOverlayBuffer(
              scene.chestPocketAssetPath,
              baseAssetPath,
              section,
            );

          if (!trimOverlayBuffer) {
            continue;
          }

          const trimOutlineBuffer = await createPngInkOutlineBuffer(
            trimOverlayBuffer,
            "#f8fafc",
            4,
          );
          const trimColorBuffer = await recolorPngInkBuffer(
            trimOverlayBuffer,
            trimColor,
          );

          layers.push(
            getImageSvg(
              toDataUri(trimOutlineBuffer),
              CHEST_POCKET_VERTICAL_OFFSET,
            ),
            getImageSvg(
              toDataUri(trimColorBuffer),
              CHEST_POCKET_VERTICAL_OFFSET,
            ),
          );
        }
      } else if (chestPocketTrimColor) {
        const trimOverlayBuffer = await createChestPocketTrimOverlayBuffer(
          scene.chestPocketAssetPath,
          baseAssetPath,
        );

        if (trimOverlayBuffer) {
          if (
            fullChestPocketTrimOverlayFileNames.has(
              getAssetFileName(scene.chestPocketAssetPath),
            )
          ) {
            const trimOutlineBuffer = await createPngInkOutlineBuffer(
              trimOverlayBuffer,
              "#f8fafc",
              4,
            );
            const trimColorBuffer = await recolorPngInkBuffer(
              trimOverlayBuffer,
              chestPocketTrimColor,
            );

            layers.push(
              getImageSvg(
                toDataUri(trimOutlineBuffer),
                CHEST_POCKET_VERTICAL_OFFSET,
              ),
              getImageSvg(
                toDataUri(trimColorBuffer),
                CHEST_POCKET_VERTICAL_OFFSET,
              ),
            );
          } else {
            layers.push(
              await getChestPocketTrimLineSvg(
                trimOverlayBuffer,
                chestPocketTrimColor,
              ),
            );
          }
        }
      }

    }

    if (hasOriginalSleevesOverlay && isBlouseScene(scene, baseAssetPath)) {
      layers.push(
        await getOriginalSleevesTrimSvg(baseAssetPath, {
          upper: sleeveUpperTrimColor,
          lower: sleeveLowerTrimColor,
          fill: sleeveFillTrimColor,
        }),
      );
    }

    if (scene.logoMarker && isBlouseScene(scene, baseAssetPath)) {
      layers.push(getLogoMarkerSvg(scene.logoMarker.placement));
    }

    if (sleeveTabTrimColor && isBlouseScene(scene, baseAssetPath)) {
      layers.push(getSleeveTabMarkersSvg(sleeveTabTrimColor));
    }

    layers.push(getTrimSectionsSvg(scene));
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}">
      ${layers.join("")}
    </svg>
  `;

  return await sharp(Buffer.from(svg)).png().toBuffer();
}
