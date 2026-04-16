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

export const overlayRegionPresets: Record<
  "lowerPocketPair" | "auxiliaryPocketPair",
  OverlayRegion[]
> = {
  lowerPocketPair: [
    { x: 146, y: 572, width: 196, height: 312 },
    { x: 558, y: 572, width: 196, height: 312 },
  ],
  auxiliaryPocketPair: [
    { x: 116, y: 518, width: 248, height: 356 },
    { x: 536, y: 518, width: 248, height: 356 },
  ],
};

export function getOverlayRegionPreset(
  key: keyof typeof overlayRegionPresets,
): OverlayRegion[] {
  return overlayRegionPresets[key];
}

type ProcessedImage = {
  canvas: HTMLCanvasElement;
  bounds: { x: number; y: number; width: number; height: number };
};

const imageCache = new Map<string, Promise<ProcessedImage>>();
const maskCache = new Map<string, Promise<HTMLCanvasElement>>();
const rasterCache = new Map<string, Promise<HTMLCanvasElement>>();
const detailOverlayCache = new Map<string, Promise<HTMLCanvasElement>>();

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    image.src = src;
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
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("No se pudo procesar la imagen.");
    }

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

function drawChestPocket(
  context: CanvasRenderingContext2D,
  pocketLabel?: string,
) {
  if (!pocketLabel || normalize(pocketLabel).includes("sin bolsillo")) {
    return;
  }

  const label = normalize(pocketLabel);
  context.save();
  context.strokeStyle = "#0f172a";
  context.lineWidth = 7;
  context.lineJoin = "round";
  context.lineCap = "round";

  if (label.includes("cremallera visible")) {
    context.strokeRect(538, 370, 92, 118);
    context.beginPath();
    context.moveTo(584, 370);
    context.lineTo(584, 488);
    context.stroke();
  } else if (label.includes("cremallera invisible")) {
    context.beginPath();
    context.moveTo(536, 372);
    context.lineTo(624, 484);
    context.stroke();
  } else if (label.includes("velcro")) {
    context.strokeRect(538, 370, 92, 118);
    context.fillStyle = "#0f172a";
    context.fillRect(548, 382, 72, 10);
  } else {
    context.beginPath();
    context.rect(538, 370, 92, 118);
    context.stroke();
  }

  context.restore();
}

function drawTrimSections(
  context: CanvasRenderingContext2D,
  scene: PreviewScene,
) {
  const hasChestPocket =
    Boolean(scene.chestPocketType) &&
    !normalize(scene.chestPocketType ?? "").includes("sin bolsillo");

  for (const section of scene.trimSections) {
    const key = normalize(section.label || section.key);
    context.save();
    context.strokeStyle = section.colorHex;
    context.fillStyle = section.colorHex;
    context.lineWidth = 10;
    context.lineJoin = "round";
    context.lineCap = "round";

    if (key.includes("cuello")) {
      context.beginPath();
      context.moveTo(390, 180);
      context.bezierCurveTo(415, 245, 485, 245, 510, 180);
      context.stroke();
    }

    if (key.includes("frente") || key.includes("central")) {
      context.beginPath();
      context.moveTo(450, 205);
      context.lineTo(450, 978);
      context.stroke();
    }

    if (key.includes("pecho") && !hasChestPocket) {
      context.strokeRect(530, 362, 110, 128);
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

export async function createRasterCanvas(src: string) {
  const existing = rasterCache.get(src);
  if (existing) {
    return await existing;
  }

  const promise = (async () => {
    const processed = await getProcessedImage(src);
    const { bounds } = processed;
    const { drawX, drawY, drawWidth, drawHeight } = getDrawRect(bounds);
    const rasterCanvas = document.createElement("canvas");
    rasterCanvas.width = CANVAS_WIDTH;
    rasterCanvas.height = CANVAS_HEIGHT;
    const rasterContext = rasterCanvas.getContext("2d");

    if (!rasterContext) {
      throw new Error("No se pudo rasterizar el asset.");
    }

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

  rasterCache.set(src, promise);
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

export async function composeDesign(
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

  if (scene.neckImageSrc) {
    await drawTintedBaseFromAsset(context, scene.neckImageSrc, scene.baseColorHex);
  } else {
    drawFallbackGarmentFill(context, scene.baseColorHex);
    drawGarmentBase(context, "transparent");
  }

  drawChestPocket(context, scene.chestPocketType);

  if (scene.lowerPocketImageSrc) {
    await drawOverlayInRegions(
      context,
      scene.lowerPocketImageSrc,
      getOverlayRegionPreset("lowerPocketPair"),
    );
  }

  if (scene.auxiliaryPocketImageSrc) {
    await drawOverlayInRegions(
      context,
      scene.auxiliaryPocketImageSrc,
      getOverlayRegionPreset("auxiliaryPocketPair"),
    );
  }

  drawTrimSections(context, scene);

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
