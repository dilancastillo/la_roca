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

const overlayRegionPresets: Record<"lowerPocketPair" | "auxiliaryPocketPair", OverlayRegion[]> =
  {
    lowerPocketPair: [
      { x: 146, y: 572, width: 196, height: 312 },
      { x: 558, y: 572, width: 196, height: 312 },
    ],
    auxiliaryPocketPair: [
      { x: 116, y: 518, width: 248, height: 356 },
      { x: 536, y: 518, width: 248, height: 356 },
    ],
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

async function loadProcessedImage(assetPath: string): Promise<ProcessedImage> {
  const fileBuffer = await readFile(resolveAssetFilePath(assetPath));
  const { data, info } = await sharp(fileBuffer)
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

async function createOverlayBuffer(assetPath: string) {
  const processed = await loadProcessedImage(assetPath);
  const imageBuffer = await rgbaToPngBuffer(
    processed.data,
    processed.width,
    processed.height,
  );
  return await placeProcessedBufferOnCanvas(imageBuffer, processed.bounds);
}

function toDataUri(buffer: Buffer, mimeType = "image/png") {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function getChestPocketSvg(chestPocketType?: string) {
  if (!chestPocketType || normalize(chestPocketType).includes("sin bolsillo")) {
    return "";
  }

  const label = normalize(chestPocketType);

  if (label.includes("cremallera visible")) {
    return `
      <rect x="538" y="370" width="92" height="118" fill="none" stroke="#0f172a" stroke-width="7" />
      <line x1="584" y1="370" x2="584" y2="488" stroke="#0f172a" stroke-width="7" />
    `;
  }

  if (label.includes("cremallera invisible")) {
    return `
      <line x1="536" y1="372" x2="624" y2="484" stroke="#0f172a" stroke-width="7" stroke-linecap="round" />
    `;
  }

  if (label.includes("velcro")) {
    return `
      <rect x="538" y="370" width="92" height="118" fill="none" stroke="#0f172a" stroke-width="7" />
      <rect x="548" y="382" width="72" height="10" fill="#0f172a" />
    `;
  }

  return `<rect x="538" y="370" width="92" height="118" fill="none" stroke="#0f172a" stroke-width="7" />`;
}

function getTrimSectionsSvg(scene: AutomationRenderScene) {
  return scene.trimSections
    .map((section) => {
      const key = normalize(section.label || section.key);
      const parts: string[] = [];

      if (key.includes("cuello")) {
        parts.push(
          `<path d="M390 180 C415 245 485 245 510 180" fill="none" stroke="${section.colorHex}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />`,
        );
      }

      if (key.includes("frente") || key.includes("central")) {
        parts.push(
          `<line x1="450" y1="205" x2="450" y2="978" stroke="${section.colorHex}" stroke-width="10" stroke-linecap="round" />`,
        );
      }

      if (key.includes("pecho") && (!scene.chestPocketType || normalize(scene.chestPocketType).includes("sin bolsillo"))) {
        parts.push(
          `<rect x="530" y="362" width="110" height="128" fill="none" stroke="${section.colorHex}" stroke-width="10" />`,
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

  if (scene.neckAssetPath) {
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

  layers.push(getChestPocketSvg(scene.chestPocketType));

  if (scene.lowerPocketAssetPath) {
    const overlayBuffer = await createOverlayBuffer(scene.lowerPocketAssetPath);
    layers.push(
      getOverlaySvg(
        "lower-pocket-overlay",
        toDataUri(overlayBuffer),
        overlayRegionPresets.lowerPocketPair,
      ),
    );
  }

  if (scene.auxiliaryPocketAssetPath) {
    const overlayBuffer = await createOverlayBuffer(scene.auxiliaryPocketAssetPath);
    layers.push(
      getOverlaySvg(
        "aux-pocket-overlay",
        toDataUri(overlayBuffer),
        overlayRegionPresets.auxiliaryPocketPair,
      ),
    );
  }

  layers.push(getTrimSectionsSvg(scene));

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_WIDTH}" height="${CANVAS_HEIGHT}" viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}">
      ${layers.join("")}
    </svg>
  `;

  return await sharp(Buffer.from(svg)).png().toBuffer();
}
