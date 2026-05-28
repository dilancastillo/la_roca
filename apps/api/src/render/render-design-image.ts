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
  "blouse-model-14.svg": [1, 2, 3, 4, 5, 6],
  "blouse-model-15.svg": [4, 5, 6, 7],
  "blouse-model-16.svg": [1, 2, 3, 4, 5],
  "blouse-model-18.svg": [1, 2, 3],
  "blouse-model-19.svg": [1, 2, 4, 5, 6, 7],
  "blouse-model-20.svg": [1, 2, 3],
  "blouse-model-18-costura-lower-pocket.svg": [1, 2, 3],
  "blouse-model-20-costura-maria-lower-pocket.svg": [1, 2, 3],
  "blouse-model-33-oriental-lower-pocket.svg": [6, 7],
  "blouse-model-34-cuello-alto-cremallera-lower-pocket.svg": [67, 68, 69],
  "blouse-model-37-cirugia-lower-pocket.svg": [1, 2, 11, 12],
  "blouse-model-39-el-hato-lower-pocket.svg": [3, 4, 5, 6, 7, 8, 9, 10],
};

const lowerPocketTrimElementIndexesByFileName: Record<string, number[]> = {
  "blouse-model-14.svg": [5, 6],
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
  { top?: string; bottom?: string }
> = {
  "blouse-model-18-costura-lower-pocket.svg": {
    top: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-18-costura-lower-pocket-upper.svg",
    bottom:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-18-costura-lower-pocket-lower.svg",
  },
  "blouse-model-20-costura-maria-lower-pocket.svg": {
    top: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-20-costura-maria-lower-pocket-upper.svg",
  },
};

const chestPocketTrimOverlayByFileName: Record<string, string> = {
  "chest-pocket-rectangular.svg":
    "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-trim.svg",
  "chest-pocket-rectangular-v2.svg":
    "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-trim.svg",
};

const garmentDetailOverlayByFileName: Record<string, string> = {
  "blouse-model-45-pespunte.svg":
    "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg",
};

const CHEST_POCKET_LOGO_MARKER_ASSET_PATH =
  "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-logo-marker.svg";

const collarTrimElementIndexesByFileName: Record<string, number[]> = {
  "blouse-model-07.svg": [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  "blouse-model-09.svg": [3],
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
  "blouse-model-50-20-20.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-50-20-20-internal-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-50-20-20-internal-right.svg",
  },
};

const innerCollarTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-41-matrioska.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-41-matrioska-inner-collar.svg",
};

const externalCollarTrimOverlayByFileName: Record<
  string,
  { left: string; right: string }
> = {
  "blouse-model-25-20-21.svg": {
    left: "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-25-20-21-external-left.svg",
    right:
      "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-25-20-21-external-right.svg",
  },
};

const flapTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-22-estrella.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-22-estrella-aletas.svg",
};

const backNeckTrimElementIndexesByFileName: Record<string, number[]> = {};

const backNeckTrimPathDataByFileName: Record<string, string> = {
  "blouse-model-21-deportivo.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-22-estrella.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-23-polo.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-24-botones.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-25-20-21.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-26-cuello-redondo.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-27-cremallera.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-29-pedagogia.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-40-mariposa.svg": "M305 140 C365 121 535 121 595 140",
  "blouse-model-41-matrioska.svg": "M305 140 C365 121 535 121 595 140",
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
  "blouse-model-22-estrella.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-22-estrella-collar.svg",
  "blouse-model-24-botones.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-24-botones-collar.svg",
  "blouse-model-26-cuello-redondo.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-26-cuello-redondo-collar.svg",
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

const completeCollarOnlyFileNames = new Set([
  "blouse-model-39-el-hato.svg",
  "blouse-model-11-fisiopracticas.svg",
  "blouse-model-13-p-paipilla.svg",
]);

const noCollarTrimFileNames = new Set([
  "blouse-model-21-deportivo.svg",
  "blouse-model-50-20-20.svg",
  "blouse-model-23-polo.svg",
  "blouse-model-25-20-21.svg",
  "blouse-model-27-cremallera.svg",
  "blouse-model-29-pedagogia.svg",
  "blouse-model-33-oriental.svg",
  "blouse-model-40-mariposa.svg",
  "blouse-model-41-matrioska.svg",
]);

const noBackNeckTrimFileNames = new Set([
  "blouse-model-33-oriental.svg",
  "blouse-model-39-el-hato.svg",
]);

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
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

function isLowerPocketTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return section.role === "lowerPockets" || key.includes("bolsillos inferiores");
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

function isLowerPocketUpperTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  return (
    isLowerPocketTrimSection(section) &&
    !isLowerPocketLowerTrimSection(section)
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
  section: "top" | "bottom",
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

async function createChestPocketLogoMarkerBuffer(placementAssetPath: string) {
  const [markerProcessed, placementProcessed] = await Promise.all([
    loadProcessedImage(CHEST_POCKET_LOGO_MARKER_ASSET_PATH),
    loadProcessedImage(placementAssetPath),
  ]);

  return await createOverlayBufferFromProcessed(
    markerProcessed,
    placementProcessed,
  );
}

async function createGarmentModelDetailOverlayBuffer(
  garmentAssetPath: string | undefined,
  placementAssetPath: string,
) {
  if (!garmentAssetPath || garmentAssetPath === placementAssetPath) {
    return undefined;
  }

  const overlayPath =
    garmentDetailOverlayByFileName[getAssetFileName(garmentAssetPath)];

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

function getBackNeckTrimSvg(trimColor: string, pathData = "M305 128 L595 128") {

  return `
    <defs>
      <filter id="back-neck-trim-glow" x="-35%" y="-220%" width="170%" height="520%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    <path d="${pathData}" fill="none" stroke="#f8fafc" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" filter="url(#back-neck-trim-glow)" />
    <path d="${pathData}" fill="none" stroke="${trimColor}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
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

function getImageSvg(imageDataUri: string) {
  return `<image href="${imageDataUri}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`;
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
    bounds.y + POCKET_TRIM_LINE_WIDTH / 2,
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

export async function renderDesignImage(scene: AutomationRenderScene): Promise<Buffer> {
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
    const garmentDetailOverlayBuffer =
      await createGarmentModelDetailOverlayBuffer(
        scene.garmentAssetPath,
        baseAssetPath,
      );

    if (garmentDetailOverlayBuffer) {
      layers.push(
        `<image href="${toDataUri(garmentDetailOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
      );
    }

    const collarTrimColor = getCollarTrimColorForAsset(scene, baseAssetPath);
    const innerCollarTrimColor = getTrimSectionColor(
      scene,
      isInnerCollarTrimSection,
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
    const backNeckTrimColor = allowsBackNeckTrim(baseAssetPath)
      ? getTrimSectionColor(scene, isBackNeckTrimSection)
      : undefined;
    const lowerPocketUpperTrimColor = getTrimSectionColor(
      scene,
      isLowerPocketUpperTrimSection,
    );
    const lowerPocketLowerTrimColor = getTrimSectionColor(
      scene,
      isLowerPocketLowerTrimSection,
    );
    const lowerPocketTrimColor =
      lowerPocketUpperTrimColor ?? lowerPocketLowerTrimColor;
    const chestPocketTrimColor = getTrimSectionColor(
      scene,
      isChestPocketTrimSection,
    );
    const flapTrimColor = getTrimSectionColor(scene, isFlapTrimSection);

    if (collarTrimColor) {
      const collarTrimOverlayBuffer = await createCollarTrimOverlayBuffer(
        baseAssetPath,
        collarTrimColor,
      );

      if (collarTrimOverlayBuffer) {
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

    const innerCollarTrimOverlayBuffer =
      await createInnerCollarTrimOverlayBuffer(
        baseAssetPath,
        innerCollarTrimColor,
      );

    if (innerCollarTrimOverlayBuffer) {
      const innerCollarTrimOutlineBuffer = await createPngInkOutlineBuffer(
        innerCollarTrimOverlayBuffer,
      );
      layers.push(
        `<image href="${toDataUri(innerCollarTrimOutlineBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        `<image href="${toDataUri(innerCollarTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
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
      const backNeckTrimOverlayBuffer =
        await createBackNeckTrimOverlayBuffer(
          baseAssetPath,
          backNeckTrimColor,
        );

      if (backNeckTrimOverlayBuffer) {
        const backNeckTrimOutlineBuffer = await createPngInkOutlineBuffer(
          backNeckTrimOverlayBuffer,
        );
        layers.push(
          `<image href="${toDataUri(backNeckTrimOutlineBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
          `<image href="${toDataUri(backNeckTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        );
      } else {
        layers.push(
          getBackNeckTrimSvg(
            backNeckTrimColor,
            backNeckTrimPathDataByFileName[getAssetFileName(baseAssetPath)],
          ),
        );
      }
    }

    if (scene.lowerPocketAssetPath && scene.lowerPocketLayout !== "none") {
      const lowerPocketRegions =
        scene.lowerPocketLayout === "single"
          ? overlayRegionPresets.lowerPocketSingleRight
          : overlayRegionPresets.lowerPocketPair;
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
        for (const [section, trimColor] of [
          ["top", lowerPocketUpperTrimColor],
          ["bottom", lowerPocketLowerTrimColor],
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

          const trimOutlineBuffer = await createPngInkOutlineBuffer(
            trimOverlayBuffer,
            "#f8fafc",
            7,
          );
          const trimColorBuffer = await recolorPngInkBuffer(
            trimOverlayBuffer,
            trimColor,
          );

          layers.push(
            getOverlaySvg(
              `lower-pocket-${section}-trim-outline`,
              toDataUri(trimOutlineBuffer),
              lowerPocketRegions,
            ),
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
      layers.push(getImageSvg(toDataUri(overlayBuffer)));

      if (chestPocketTrimColor) {
        const trimOverlayBuffer = await createChestPocketTrimOverlayBuffer(
          scene.chestPocketAssetPath,
          baseAssetPath,
        );

        if (trimOverlayBuffer) {
          layers.push(
            await getChestPocketTrimLineSvg(
              trimOverlayBuffer,
              chestPocketTrimColor,
            ),
          );
        }
      }

      if (scene.logoMarker) {
        const markerBuffer = await createChestPocketLogoMarkerBuffer(
          baseAssetPath,
        );
        layers.push(getImageSvg(toDataUri(markerBuffer)));
      }
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
