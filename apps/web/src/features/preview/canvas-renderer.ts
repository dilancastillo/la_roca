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
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-20-lower-pocket.svg",
};

const lowerPocketSectionTrimOverlayByFileName: Record<
  string,
  { top?: string; bottom?: string }
> = {
  "blouse-model-18-costura-lower-pocket.svg": {
    top: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-18-costura-lower-pocket-upper.svg",
    bottom:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-18-costura-lower-pocket-lower.svg",
  },
  "blouse-model-20-costura-maria-lower-pocket.svg": {
    top: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-20-costura-maria-lower-pocket-upper.svg",
  },
};

const chestPocketTrimOverlayByFileName: Record<string, string> = {
  "chest-pocket-rectangular.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-trim.svg",
  "chest-pocket-rectangular-v2.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-trim.svg",
};

const garmentDetailOverlayByFileName: Record<string, string> = {
  "blouse-model-45-pespunte.svg":
    "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg",
};

const CHEST_POCKET_LOGO_MARKER_SRC =
  "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-logo-marker.svg";

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
  "blouse-model-01.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-internal-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-internal-right.svg",
  },
  "blouse-model-50-20-20.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-50-20-20-internal-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-50-20-20-internal-right.svg",
  },
};

const innerCollarTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-41-matrioska.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-41-matrioska-inner-collar.svg",
};

const externalCollarTrimOverlayByFileName: Record<
  string,
  { left: string; right: string }
> = {
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
};

const completeInteriorCollarTrimOverlayByFileName: Record<
  string,
  { left: string; right: string }
> = {
  "blouse-model-01.svg": {
    left: "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-complete-left.svg",
    right:
      "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-01-collar-v-complete-right.svg",
  },
};

const flapTrimOverlayByFileName: Record<string, string> = {
  "blouse-model-22-estrella.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-22-estrella-aletas.svg",
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
  "blouse-model-15-presillas.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-15-presillas-collar.svg",
  "blouse-model-22-estrella.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-22-estrella-collar.svg",
  "blouse-model-24-botones.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-24-botones-collar.svg",
  "blouse-model-26-cuello-redondo.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-26-cuello-redondo-collar.svg",
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
  "blouse-model-15-presillas.svg":
    "/assets/catalog/blusa-antifluido-t180/trim-overlays/blouse-model-15-presillas-rings.svg",
};

const completeCollarOnlyFileNames = new Set([
  "blouse-model-39-el-hato.svg",
  "blouse-model-11-fisiopracticas.svg",
  "blouse-model-13-p-paipilla.svg",
]);

const noCollarTrimFileNames = new Set([
  "blouse-model-21-deportivo.svg",
  "blouse-model-50-20-20.svg",
  "blouse-model-06-puntas.svg",
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

function isWholeCollarSection(section: PreviewScene["trimSections"][number]) {
  const key = getTrimSectionText(section);

  return (
    normalize(section.label || section.key) === "cuello" ||
    key.includes("cuello alto") ||
    key.includes("cuello-alto")
  );
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
    key.includes("cuello-aros")
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

function isLowerPocketTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  const key = getTrimSectionText(section);

  return section.role === "lowerPockets" || key.includes("bolsillos inferiores");
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

function isLowerPocketUpperTrimSection(
  section: PreviewScene["trimSections"][number],
) {
  return (
    isLowerPocketTrimSection(section) &&
    !isLowerPocketLowerTrimSection(section)
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
    ] as const) {
      const trimSrc = sectionTrimOverlays[section];

      if (!trimSrc || !trimColor) {
        continue;
      }

      const trimCanvas = await createRasterCanvas(trimSrc, sourceSrc);
      drawCanvasInRegions(
        context,
        createCanvasInkOutline(trimCanvas, "#f8fafc", 7),
        regions,
      );
      drawCanvasInRegions(
        context,
        recolorCanvasInk(trimCanvas, trimColor),
        regions,
      );
    }

    return;
  }

  const trimColor = trimColors?.top ?? trimColors?.bottom;

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
  trimColor?: string,
) {
  const overlayCanvas = await createRasterCanvas(sourceSrc, placementSrc);
  context.drawImage(overlayCanvas, 0, 0);

  if (!trimColor) {
    return;
  }

  const trimSrc = chestPocketTrimOverlayByFileName[getFileNameFromSource(sourceSrc)];

  if (!trimSrc) {
    return;
  }

  const trimCanvas = await createRasterCanvas(trimSrc, placementSrc);
  drawPocketTrimTopLine(context, trimCanvas, trimColor);
}

async function drawChestPocketLogoMarker(
  context: CanvasRenderingContext2D,
  placementSrc: string,
) {
  const markerCanvas = await createRasterCanvas(
    CHEST_POCKET_LOGO_MARKER_SRC,
    placementSrc,
  );

  context.drawImage(markerCanvas, 0, 0);
}

async function drawGarmentModelDetails(
  context: CanvasRenderingContext2D,
  garmentSrc: string | undefined,
  placementSrc: string,
) {
  if (!garmentSrc || garmentSrc === placementSrc) {
    return;
  }

  const overlaySrc =
    garmentDetailOverlayByFileName[getFileNameFromSource(garmentSrc)];

  if (!overlaySrc) {
    return;
  }

  const overlayCanvas = await createRasterCanvas(overlaySrc, placementSrc);
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

function drawBackNeckTrim(
  context: CanvasRenderingContext2D,
  trimColor: string | undefined,
  pathData?: string,
) {
  if (!trimColor) {
    return;
  }

  const path = createBackNeckTrimPath(pathData);

  context.save();
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
  const trimIndexes =
    backNeckTrimElementIndexesByFileName[getFileNameFromSource(sourceSrc)];

  if (!trimIndexes) {
    return false;
  }

  await drawCollarTrimFromAsset(context, sourceSrc, trimColor, trimIndexes);
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

function getCollarLineOutlineRadius(sourceSrc: string) {
  return getFileNameFromSource(sourceSrc) === "blouse-model-01.svg" ? 3 : 7;
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

  const baseAssetSrc = scene.neckImageSrc ?? scene.garmentImageSrc;

  if (baseAssetSrc) {
    await drawTintedBaseFromAsset(context, baseAssetSrc, scene.baseColorHex);
  } else {
    drawFallbackGarmentFill(context, scene.baseColorHex);
    drawGarmentBase(context, "transparent");
  }

  if (baseAssetSrc) {
    await drawGarmentModelDetails(
      context,
      scene.garmentImageSrc,
      baseAssetSrc,
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
    const leftCompleteInteriorCollarTrimColor = getTrimSectionColor(
      scene,
      isLeftCompleteInteriorCollarSection,
    );
    const rightCompleteInteriorCollarTrimColor = getTrimSectionColor(
      scene,
      isRightCompleteInteriorCollarSection,
    );
    const backNeckTrimColor = allowsBackNeckTrim(baseAssetSrc)
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
    const chestPocketTrimColor = getTrimSectionColor(
      scene,
      isChestPocketTrimSection,
    );
    const flapTrimColor = getTrimSectionColor(scene, isFlapTrimSection);

    await drawCollarTrimFromAsset(context, baseAssetSrc, collarTrimColor);
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
      drawBackNeckTrim(
        context,
        backNeckTrimColor,
        backNeckTrimPathDataByFileName[getFileNameFromSource(baseAssetSrc)],
      );
    }

    if (scene.lowerPocketImageSrc && scene.lowerPocketLayout !== "none") {
      await drawLowerPocketOverlay(
        context,
        scene.lowerPocketImageSrc,
        getOverlayRegionPreset(
          scene.lowerPocketLayout === "single"
            ? "lowerPocketSingleRight"
            : "lowerPocketPair",
        ),
        {
          top: lowerPocketUpperTrimColor,
          bottom: lowerPocketLowerTrimColor,
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
        chestPocketTrimColor,
      );

      if (scene.logoMarker) {
        await drawChestPocketLogoMarker(context, baseAssetSrc);
      }
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
