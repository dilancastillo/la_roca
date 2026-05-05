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
};

const collarTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-08.svg":
    "assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-08-collar.svg",
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function resolveAssetFilePath(assetPath: string) {
  return path.join(process.cwd(), "apps", "web", "public", assetPath);
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

function isWholeCollarSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  return normalize(section.label || section.key) === "cuello";
}

function isLowerPocketTrimSection(
  section: AutomationRenderScene["trimSections"][number],
) {
  const key = normalize(section.label || section.key);

  return section.role === "lowerPockets" || key.includes("bolsillos inferiores");
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
  const fileBuffer = await readFile(resolveAssetFilePath(assetPath));
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

async function createLowerPocketOverlayBuffer(
  assetPath: string,
  trimColor?: string,
) {
  const detailIndexes =
    lowerPocketDetailElementIndexesByFileName[getAssetFileName(assetPath)];

  if (!detailIndexes) {
    const fallbackBuffer = await createOverlayBuffer(assetPath);
    return trimColor
      ? await recolorPngInkBuffer(fallbackBuffer, trimColor)
      : fallbackBuffer;
  }

  const svgText = (await readFile(resolveAssetFilePath(assetPath))).toString(
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

  return trimColor
    ? await recolorPngInkBuffer(overlayBuffer, trimColor)
    : overlayBuffer;
}

async function createCollarTrimOverlayBuffer(
  assetPath: string,
  trimColor: string,
) {
  const overlayPath = collarTrimOverlayByFileName[getAssetFileName(assetPath)];

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

  if (scene.garmentAssetPath) {
    const baseBuffer = await createTintedBaseBuffer(
      scene.garmentAssetPath,
      scene.baseColorHex,
    );
    layers.push(
      `<image href="${toDataUri(baseBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
    );
  } else if (scene.neckAssetPath) {
    const baseBuffer = await createTintedBaseBuffer(
      scene.neckAssetPath,
      scene.baseColorHex,
    );
    layers.push(
      `<image href="${toDataUri(baseBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
    );
  } else {
    layers.push(getFallbackGarmentSvg(scene.baseColorHex));
  }

  if (!scene.garmentAssetPath) {
    const collarTrimColor = getTrimSectionColor(scene, isWholeCollarSection);
    const lowerPocketTrimColor = getTrimSectionColor(
      scene,
      isLowerPocketTrimSection,
    );

    if (scene.neckAssetPath && collarTrimColor) {
      const collarTrimOverlayBuffer = await createCollarTrimOverlayBuffer(
        scene.neckAssetPath,
        collarTrimColor,
      );

      if (collarTrimOverlayBuffer) {
        layers.push(
          `<image href="${toDataUri(collarTrimOverlayBuffer)}" x="0" y="0" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" />`,
        );
      } else {
        const collarBaseBuffer = await createTintedBaseBuffer(
          scene.neckAssetPath,
          collarTrimColor,
        );
        const collarInkBuffer = await recolorPngInkBuffer(
          await createOverlayBuffer(scene.neckAssetPath),
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

    if (scene.lowerPocketAssetPath && scene.lowerPocketLayout !== "none") {
      const lowerPocketRegions =
        scene.lowerPocketLayout === "single"
          ? overlayRegionPresets.lowerPocketSingleRight
          : overlayRegionPresets.lowerPocketPair;
      const overlayBuffer = await createLowerPocketOverlayBuffer(
        scene.lowerPocketAssetPath,
        lowerPocketTrimColor,
      );
      layers.push(
        getOverlaySvg(
          "lower-pocket-overlay",
          toDataUri(overlayBuffer),
          lowerPocketRegions,
        ),
      );
    }

    if (scene.auxiliaryPocketAssetPath) {
      const overlayBuffer = scene.neckAssetPath
        ? await createDetailOverlayBuffer(
            scene.auxiliaryPocketAssetPath,
            scene.neckAssetPath,
            overlayRegionPresets.auxiliaryPocketPair,
          )
        : await createOverlayBuffer(scene.auxiliaryPocketAssetPath);
      layers.push(
        getOverlaySvg(
          "aux-pocket-overlay",
          toDataUri(overlayBuffer),
          overlayRegionPresets.auxiliaryPocketPair,
        ),
      );
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
