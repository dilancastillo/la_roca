import { readFile } from "node:fs/promises";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import type { AutomationRenderScene } from "./derive-render-scene.js";
import { renderDesignImage } from "./render-design-image.js";

const baseScene: AutomationRenderScene = {
  productName: "Blusa",
  baseColorHex: "#B2D4D1",
  garmentAssetPath:
    "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
  lowerPocketLayout: "double",
  trimSections: [],
};

async function readRawPng(buffer: Buffer) {
  return await sharp(buffer).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });
}

async function readRawBlouseSvgAsset(fileName: string) {
  const svgBuffer = await readFile(
    new URL(
      `../../../../apps/web/public/assets/catalog/blusa-antifluido-t180/svg-clean/${fileName}`,
      import.meta.url,
    ),
  );

  return await sharp(svgBuffer)
    .resize(900, 1200, { fit: "fill" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

function countDifferentPixels(left: Buffer, right: Buffer) {
  let count = 0;

  for (let offset = 0; offset < left.length; offset += 4) {
    if (
      left[offset] !== right[offset] ||
      left[offset + 1] !== right[offset + 1] ||
      left[offset + 2] !== right[offset + 2] ||
      left[offset + 3] !== right[offset + 3]
    ) {
      count += 1;
    }
  }

  return count;
}

function countNeonGreenPixels(buffer: Buffer) {
  let count = 0;

  for (let offset = 0; offset < buffer.length; offset += 4) {
    const red = buffer[offset] ?? 0;
    const green = buffer[offset + 1] ?? 0;
    const blue = buffer[offset + 2] ?? 0;
    const alpha = buffer[offset + 3] ?? 0;

    if (alpha > 0 && red < 80 && green > 200 && blue < 80) {
      count += 1;
    }
  }

  return count;
}

function countOrangePixels(buffer: Buffer) {
  let count = 0;

  for (let offset = 0; offset < buffer.length; offset += 4) {
    const red = buffer[offset] ?? 0;
    const green = buffer[offset + 1] ?? 0;
    const blue = buffer[offset + 2] ?? 0;
    const alpha = buffer[offset + 3] ?? 0;

    if (alpha > 0 && red > 220 && green > 120 && green < 190 && blue < 80) {
      count += 1;
    }
  }

  return count;
}

function countSourceTealPixels(buffer: Buffer) {
  let count = 0;

  for (let offset = 0; offset < buffer.length; offset += 4) {
    const red = buffer[offset] ?? 0;
    const green = buffer[offset + 1] ?? 0;
    const blue = buffer[offset + 2] ?? 0;
    const alpha = buffer[offset + 3] ?? 0;

    if (
      alpha > 0 &&
      red > 20 &&
      red < 80 &&
      green > 150 &&
      green < 200 &&
      blue > 120 &&
      blue < 190
    ) {
      count += 1;
    }
  }

  return count;
}

function countBrightCyanPixels(buffer: Buffer) {
  let count = 0;

  for (let offset = 0; offset < buffer.length; offset += 4) {
    const red = buffer[offset] ?? 0;
    const green = buffer[offset + 1] ?? 0;
    const blue = buffer[offset + 2] ?? 0;
    const alpha = buffer[offset + 3] ?? 0;

    if (alpha > 0 && red < 80 && green > 200 && blue > 180) {
      count += 1;
    }
  }

  return count;
}

function countYellowPixels(buffer: Buffer) {
  let count = 0;

  for (let offset = 0; offset < buffer.length; offset += 4) {
    const red = buffer[offset] ?? 0;
    const green = buffer[offset + 1] ?? 0;
    const blue = buffer[offset + 2] ?? 0;
    const alpha = buffer[offset + 3] ?? 0;

    if (alpha > 0 && red > 220 && green > 210 && blue < 80) {
      count += 1;
    }
  }

  return count;
}

function countPurplePixels(buffer: Buffer) {
  let count = 0;

  for (let offset = 0; offset < buffer.length; offset += 4) {
    const red = buffer[offset] ?? 0;
    const green = buffer[offset + 1] ?? 0;
    const blue = buffer[offset + 2] ?? 0;
    const alpha = buffer[offset + 3] ?? 0;

    if (alpha > 0 && red > 100 && red < 180 && green < 110 && blue > 110) {
      count += 1;
    }
  }

  return count;
}

function countPurplePixelsInRegion(
  buffer: Buffer,
  width: number,
  region: { x: number; y: number; width: number; height: number },
) {
  let count = 0;

  for (let y = region.y; y < region.y + region.height; y += 1) {
    for (let x = region.x; x < region.x + region.width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = buffer[offset] ?? 0;
      const green = buffer[offset + 1] ?? 0;
      const blue = buffer[offset + 2] ?? 0;
      const alpha = buffer[offset + 3] ?? 0;

      if (alpha > 0 && red > 100 && red < 180 && green < 110 && blue > 110) {
        count += 1;
      }
    }
  }

  return count;
}

function countPinkPixelsByHalf(buffer: Buffer, width: number) {
  const counts = { left: 0, right: 0 };

  for (let offset = 0; offset < buffer.length; offset += 4) {
    const red = buffer[offset] ?? 0;
    const green = buffer[offset + 1] ?? 0;
    const blue = buffer[offset + 2] ?? 0;
    const alpha = buffer[offset + 3] ?? 0;

    if (
      alpha > 200 &&
      red > 230 &&
      red < 255 &&
      green > 180 &&
      green < 215 &&
      blue > 185 &&
      blue < 225
    ) {
      const pixelIndex = offset / 4;
      const x = pixelIndex % width;

      if (x < width / 2) {
        counts.left += 1;
      } else {
        counts.right += 1;
      }
    }
  }

  return counts;
}

function countPastelPinkPixelsByHalf(buffer: Buffer, width: number) {
  const counts = { left: 0, right: 0 };

  for (let offset = 0; offset < buffer.length; offset += 4) {
    const red = buffer[offset] ?? 0;
    const green = buffer[offset + 1] ?? 0;
    const blue = buffer[offset + 2] ?? 0;
    const alpha = buffer[offset + 3] ?? 0;

    if (
      alpha > 0 &&
      red > 230 &&
      red < 255 &&
      green > 180 &&
      green < 215 &&
      blue > 185 &&
      blue < 225
    ) {
      const pixelIndex = offset / 4;
      const x = pixelIndex % width;

      if (x < width / 2) {
        counts.left += 1;
      } else {
        counts.right += 1;
      }
    }
  }

  return counts;
}

function countPinkPixelsInRegion(
  buffer: Buffer,
  width: number,
  region: { x: number; y: number; width: number; height: number },
) {
  let count = 0;

  for (let y = region.y; y < region.y + region.height; y += 1) {
    for (let x = region.x; x < region.x + region.width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = buffer[offset] ?? 0;
      const green = buffer[offset + 1] ?? 0;
      const blue = buffer[offset + 2] ?? 0;
      const alpha = buffer[offset + 3] ?? 0;

      if (
        alpha > 0 &&
        red > 220 &&
        green > 150 &&
        green < 230 &&
        blue > 160 &&
        blue < 235
      ) {
        count += 1;
      }
    }
  }

  return count;
}

function countPastelPinkPixelsInRegion(
  buffer: Buffer,
  width: number,
  region: { x: number; y: number; width: number; height: number },
) {
  let count = 0;

  for (let y = region.y; y < region.y + region.height; y += 1) {
    for (let x = region.x; x < region.x + region.width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = buffer[offset] ?? 0;
      const green = buffer[offset + 1] ?? 0;
      const blue = buffer[offset + 2] ?? 0;
      const alpha = buffer[offset + 3] ?? 0;

      if (
        alpha > 200 &&
        red > 230 &&
        red < 255 &&
        green > 180 &&
        green < 215 &&
        blue > 185 &&
        blue < 225
      ) {
        count += 1;
      }
    }
  }

  return count;
}

function countFuchsiaPixelsInRegion(
  buffer: Buffer,
  width: number,
  region: { x: number; y: number; width: number; height: number },
) {
  let count = 0;

  for (let y = region.y; y < region.y + region.height; y += 1) {
    for (let x = region.x; x < region.x + region.width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = buffer[offset] ?? 0;
      const green = buffer[offset + 1] ?? 0;
      const blue = buffer[offset + 2] ?? 0;
      const alpha = buffer[offset + 3] ?? 0;

      if (alpha > 200 && red > 190 && green < 80 && blue > 80 && blue < 170) {
        count += 1;
      }
    }
  }

  return count;
}

function getPastelPinkPixelBounds(
  buffer: Buffer,
  width: number,
  height: number,
) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let count = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = buffer[offset] ?? 0;
      const green = buffer[offset + 1] ?? 0;
      const blue = buffer[offset + 2] ?? 0;
      const alpha = buffer[offset + 3] ?? 0;

      if (
        alpha <= 200 ||
        red <= 230 ||
        red >= 255 ||
        green <= 180 ||
        green >= 215 ||
        blue <= 185 ||
        blue >= 225
      ) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      count += 1;
    }
  }

  return count > 0 ? { minX, minY, maxX, maxY, count } : undefined;
}

function getDarkPixelBoundsInRegion(
  buffer: Buffer,
  width: number,
  region: { x: number; y: number; width: number; height: number },
) {
  let minX = region.x + region.width;
  let minY = region.y + region.height;
  let maxX = region.x;
  let maxY = region.y;
  let count = 0;

  for (let y = region.y; y < region.y + region.height; y += 1) {
    for (let x = region.x; x < region.x + region.width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = buffer[offset] ?? 0;
      const green = buffer[offset + 1] ?? 0;
      const blue = buffer[offset + 2] ?? 0;
      const alpha = buffer[offset + 3] ?? 0;

      if (alpha <= 0 || red >= 80 || green >= 80 || blue >= 80) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      count += 1;
    }
  }

  return count > 0 ? { minX, minY, maxX, maxY, count } : undefined;
}

function countBaseColorPixelsInRegion(
  buffer: Buffer,
  width: number,
  region: { x: number; y: number; width: number; height: number },
) {
  let count = 0;

  for (let y = region.y; y < region.y + region.height; y += 1) {
    for (let x = region.x; x < region.x + region.width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = buffer[offset] ?? 0;
      const green = buffer[offset + 1] ?? 0;
      const blue = buffer[offset + 2] ?? 0;
      const alpha = buffer[offset + 3] ?? 0;

      if (
        alpha > 200 &&
        red > 165 &&
        red < 190 &&
        green > 200 &&
        green < 225 &&
        blue > 195 &&
        blue < 220
      ) {
        count += 1;
      }
    }
  }

  return count;
}

function countNeutralGrayPixelsInRegion(
  buffer: Buffer,
  width: number,
  region: { x: number; y: number; width: number; height: number },
) {
  let count = 0;

  for (let y = region.y; y < region.y + region.height; y += 1) {
    for (let x = region.x; x < region.x + region.width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = buffer[offset] ?? 0;
      const green = buffer[offset + 1] ?? 0;
      const blue = buffer[offset + 2] ?? 0;
      const alpha = buffer[offset + 3] ?? 0;

      if (
        alpha > 0 &&
        red > 150 &&
        red < 230 &&
        Math.abs(red - green) < 6 &&
        Math.abs(green - blue) < 6
      ) {
        count += 1;
      }
    }
  }

  return count;
}

function countDarkPixelsInRegion(
  buffer: Buffer,
  width: number,
  region: { x: number; y: number; width: number; height: number },
) {
  let count = 0;

  for (let y = region.y; y < region.y + region.height; y += 1) {
    for (let x = region.x; x < region.x + region.width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = buffer[offset] ?? 0;
      const green = buffer[offset + 1] ?? 0;
      const blue = buffer[offset + 2] ?? 0;
      const alpha = buffer[offset + 3] ?? 0;

      if (alpha > 0 && red < 80 && green < 80 && blue < 80) {
        count += 1;
      }
    }
  }

  return count;
}

function countWhitePixelsInRegion(
  buffer: Buffer,
  width: number,
  region: { x: number; y: number; width: number; height: number },
) {
  let count = 0;

  for (let y = region.y; y < region.y + region.height; y += 1) {
    for (let x = region.x; x < region.x + region.width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = buffer[offset] ?? 0;
      const green = buffer[offset + 1] ?? 0;
      const blue = buffer[offset + 2] ?? 0;
      const alpha = buffer[offset + 3] ?? 0;

      if (alpha > 200 && red > 245 && green > 245 && blue > 245) {
        count += 1;
      }
    }
  }

  return count;
}

const straightBackNeckModelFileNames = [
  "blouse-model-01.svg",
  "blouse-model-02-jdc.svg",
  "blouse-model-04.svg",
  "blouse-model-06-puntas.svg",
  "blouse-model-07.svg",
  "blouse-model-10.svg",
  "blouse-model-11-fisiopracticas.svg",
  "blouse-model-12-cherokee.svg",
  "blouse-model-13-p-paipilla.svg",
  "blouse-model-15-presillas.svg",
  "blouse-model-34-cuello-alto-cremallera.svg",
  "blouse-model-37-cirugia.svg",
  "blouse-model-50-20-20.svg",
];

const straightBackNeckModelsWithoutUpperContour = new Set([
  "blouse-model-50-20-20.svg",
]);

describe("renderDesignImage", () => {
  it("mantiene la cogotera recta justo debajo del contorno en todos los modelos rectos", async () => {
    for (const fileName of straightBackNeckModelFileNames) {
      const neckAssetPath = `assets/catalog/blusa-antifluido-t180/svg-clean/${fileName}`;
      const sourceInk = await readRawBlouseSvgAsset(fileName);
      const withBackNeck = await readRawPng(
        await renderDesignImage({
          ...baseScene,
          neckAssetPath,
          trimSections: [
            {
              valueId: 5146,
              role: "backNeck",
              key: "cogotera",
              label: "Cogotera",
              colorHex: "#f4c7cc",
            },
          ],
        }),
      );
      const pinkBounds = getPastelPinkPixelBounds(
        withBackNeck.data,
        withBackNeck.info.width,
        withBackNeck.info.height,
      );

      expect(pinkBounds, fileName).toBeDefined();

      if (!pinkBounds) {
        continue;
      }

      if (straightBackNeckModelsWithoutUpperContour.has(fileName)) {
        expect(pinkBounds.minY, fileName).toBe(132);
        expect(pinkBounds.maxY, fileName).toBe(139);
        continue;
      }

      const searchX = Math.max(pinkBounds.minX - 8, 0);
      const searchY = Math.max(pinkBounds.minY - 55, 0);
      const contourBounds = getDarkPixelBoundsInRegion(
        sourceInk.data,
        sourceInk.info.width,
        {
          x: searchX,
          y: searchY,
          width: Math.min(
            pinkBounds.maxX - pinkBounds.minX + 17,
            sourceInk.info.width - searchX,
          ),
          height: pinkBounds.minY - searchY,
        },
      );

      expect(
        contourBounds,
        `${fileName} pink=${JSON.stringify(pinkBounds)} search=${JSON.stringify({
          x: searchX,
          y: searchY,
          width: Math.min(
            pinkBounds.maxX - pinkBounds.minX + 17,
            sourceInk.info.width - searchX,
          ),
          height: pinkBounds.minY - searchY,
        })}`,
      ).toBeDefined();

      if (!contourBounds) {
        continue;
      }

      const verticalGap = pinkBounds.minY - contourBounds.maxY;

      expect(verticalGap, fileName).toBeGreaterThanOrEqual(0);
      expect(verticalGap, fileName).toBeLessThanOrEqual(12);
    }
  }, 60000);

  it("pinta capas de cuello y bolsillos aunque exista una base de prenda", async () => {
    const base = await readRawPng(await renderDesignImage(baseScene));
    const withNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath:
          "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-08.svg",
      }),
    );
    const withPocket = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath:
          "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-08.svg",
        lowerPocketAssetPath:
          "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg",
      }),
    );

    expect(base.info.width).toBe(900);
    expect(base.info.height).toBe(1200);
    expect(countDifferentPixels(base.data, withNeck.data)).toBeGreaterThan(500);
    expect(countDifferentPixels(withNeck.data, withPocket.data)).toBeGreaterThan(
      500,
    );
  }, 20000);

  it("superpone las lineas de Pespunte sobre cualquier cuello sin traer bolsillo de pecho", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato.svg";
    const pespunteAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-45-pespunte.svg";
    const withLizo = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        garmentAssetPath:
          "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
        neckAssetPath,
      }),
    );
    const withPespunte = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        garmentAssetPath: pespunteAssetPath,
        neckAssetPath,
      }),
    );
    const withPespunteDetail = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        garmentAssetPath:
          "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
        garmentDetailAssetPath:
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg",
        neckAssetPath,
      }),
    );
    const withPespunteTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        garmentAssetPath: pespunteAssetPath,
        neckAssetPath,
        trimSections: [
          {
            valueId: 990001,
            label: "Pespunte",
            key: "pespunte",
            colorHex: "#39ff14",
          },
        ],
      }),
    );
    const pespunteWithoutNeck = await readRawPng(
      await renderDesignImage({
        productName: baseScene.productName,
        baseColorHex: baseScene.baseColorHex,
        garmentAssetPath: pespunteAssetPath,
        lowerPocketLayout: baseScene.lowerPocketLayout,
        trimSections: [],
      }),
    );
    const lizoSideInk =
      countDarkPixelsInRegion(withLizo.data, withLizo.info.width, {
        x: 230,
        y: 300,
        width: 180,
        height: 650,
      }) +
      countDarkPixelsInRegion(withLizo.data, withLizo.info.width, {
        x: 490,
        y: 300,
        width: 180,
        height: 650,
      });
    const pespunteSideInk =
      countDarkPixelsInRegion(withPespunte.data, withPespunte.info.width, {
        x: 230,
        y: 300,
        width: 180,
        height: 650,
      }) +
      countDarkPixelsInRegion(withPespunte.data, withPespunte.info.width, {
        x: 490,
        y: 300,
        width: 180,
        height: 650,
      });
    const pespunteDetailSideInk =
      countDarkPixelsInRegion(
        withPespunteDetail.data,
        withPespunteDetail.info.width,
        {
          x: 230,
          y: 300,
          width: 180,
          height: 650,
        },
      ) +
      countDarkPixelsInRegion(
        withPespunteDetail.data,
        withPespunteDetail.info.width,
        {
          x: 490,
          y: 300,
          width: 180,
          height: 650,
        },
      );
    const chestPocketInk = countDarkPixelsInRegion(
      pespunteWithoutNeck.data,
      pespunteWithoutNeck.info.width,
      { x: 500, y: 280, width: 180, height: 220 },
    );

    expect(
      countDifferentPixels(withLizo.data, withPespunte.data),
    ).toBeGreaterThan(300);
    expect(
      countDifferentPixels(withLizo.data, withPespunteDetail.data),
    ).toBeGreaterThan(300);
    expect(pespunteSideInk).toBeGreaterThan(lizoSideInk + 300);
    expect(pespunteDetailSideInk).toBeGreaterThan(lizoSideInk + 300);
    expect(chestPocketInk).toBeLessThan(800);
    expect(countNeonGreenPixels(withPespunte.data)).toBe(0);
    expect(countNeonGreenPixels(withPespunteTrim.data)).toBeGreaterThan(300);
  }, 20000);

  it("mantiene visible el cuello V-DIVIDIDO sobre la base Pespunte", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-36-v-dividido.svg";
    const pespunteAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-45-pespunte.svg";
    const withVDividido = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        garmentAssetPath: pespunteAssetPath,
        neckAssetPath,
      }),
    );
    const withoutNeck = await readRawPng(
      await renderDesignImage({
        productName: baseScene.productName,
        baseColorHex: baseScene.baseColorHex,
        garmentAssetPath: pespunteAssetPath,
        lowerPocketLayout: baseScene.lowerPocketLayout,
        trimSections: [],
      }),
    );
    const neckRegion = { x: 300, y: 90, width: 300, height: 270 };
    const neckInk = countDarkPixelsInRegion(
      withVDividido.data,
      withVDividido.info.width,
      neckRegion,
    );
    const baseInk = countDarkPixelsInRegion(
      withoutNeck.data,
      withoutNeck.info.width,
      neckRegion,
    );

    expect(neckInk).toBeGreaterThan(baseInk + 300);
  }, 20000);

  it("pinta los bordes divididos del cuello V-DIVIDIDO por separado", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-36-v-dividido.svg";
    const withUpperBorder = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5141,
            key: "cuello-borde-dividido-superior",
            label: "Cuello Borde Dividido superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerBorder = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5142,
            key: "cuello-borde-dividido-inferior",
            label: "Cuello Borde Dividido inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const rightBorderRegion = { x: 485, y: 150, width: 125, height: 285 };
    const leftBorderRegion = { x: 315, y: 150, width: 130, height: 285 };
    const upperRightPinkPixels = countPastelPinkPixelsInRegion(
      withUpperBorder.data,
      withUpperBorder.info.width,
      rightBorderRegion,
    );
    const upperLeftPinkPixels = countPastelPinkPixelsInRegion(
      withUpperBorder.data,
      withUpperBorder.info.width,
      leftBorderRegion,
    );
    const lowerLeftPinkPixels = countPastelPinkPixelsInRegion(
      withLowerBorder.data,
      withLowerBorder.info.width,
      leftBorderRegion,
    );
    const lowerRightPinkPixels = countPastelPinkPixelsInRegion(
      withLowerBorder.data,
      withLowerBorder.info.width,
      rightBorderRegion,
    );

    expect(upperRightPinkPixels).toBeGreaterThan(300);
    expect(upperLeftPinkPixels).toBeLessThan(100);
    expect(lowerLeftPinkPixels).toBeGreaterThan(300);
    expect(lowerRightPinkPixels).toBeLessThan(100);
  }, 20000);

  it("pinta por separado los tres vivos de la cremallera punta", async () => {
    const pointZipperPocketMarkup = (
      await readFile(
        new URL(
          "../../../../apps/web/public/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-zipper.svg",
          import.meta.url,
        ),
      )
    ).toString("utf8");
    const pocketScene: AutomationRenderScene = {
      ...baseScene,
      chestPocketAssetPath:
        "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-zipper.svg",
      trimSections: [],
    };
    const withoutTrim = await readRawPng(await renderDesignImage(pocketScene));
    const withUpperTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7040,
            role: "chestPocket",
            key: "bolsillo-pecho-superior",
            label: "Bolsillo pecho superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withZipperTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7041,
            role: "chestPocket",
            key: "cremallera",
            label: "Cremallera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7042,
            role: "chestPocket",
            key: "bolsillo-pecho-inferior",
            label: "Bolsillo pecho inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const pocketInk = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 495, y: 345, width: 170, height: 230 },
    );
    const zipperPinkWithoutTrim = countPastelPinkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 500, y: 345, width: 155, height: 95 },
    );
    const upperTrimBounds = getPastelPinkPixelBounds(
      withUpperTrim.data,
      withUpperTrim.info.width,
      withUpperTrim.info.height,
    );
    const zipperTrimBounds = getPastelPinkPixelBounds(
      withZipperTrim.data,
      withZipperTrim.info.width,
      withZipperTrim.info.height,
    );
    const lowerTrimBounds = getPastelPinkPixelBounds(
      withLowerTrim.data,
      withLowerTrim.info.width,
      withLowerTrim.info.height,
    );
    expect(pointZipperPocketMarkup).toContain("L190,430");
    expect(pointZipperPocketMarkup).toContain("point-zipper-hatch");
    expect(pointZipperPocketMarkup).not.toContain("<circle");
    expect(pointZipperPocketMarkup).not.toContain("stroke-dasharray");
    expect(pocketInk).toBeGreaterThan(500);
    expect(zipperPinkWithoutTrim).toBeLessThan(20);
    expect(upperTrimBounds?.count).toBeGreaterThan(100);
    expect(zipperTrimBounds?.count).toBeGreaterThan(180);
    expect(lowerTrimBounds?.count).toBeGreaterThan(100);
    expect(upperTrimBounds?.maxY ?? 0).toBeLessThan(
      lowerTrimBounds?.minY ?? 0,
    );
    expect(
      (zipperTrimBounds?.maxY ?? 0) - (zipperTrimBounds?.minY ?? 0),
    ).toBeGreaterThan(
      (upperTrimBounds?.maxY ?? 0) - (upperTrimBounds?.minY ?? 0),
    );
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withZipperTrim.data),
    ).toBeGreaterThan(250);
    expect(
      countDifferentPixels(withoutTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(100);
  }, 20000);

  it("pinta por separado los tres vivos de la cremallera externa", async () => {
    const externalZipperPocketMarkup = (
      await readFile(
        new URL(
          "../../../../apps/web/public/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external.svg",
          import.meta.url,
        ),
      )
    ).toString("utf8");
    const pocketScene: AutomationRenderScene = {
      ...baseScene,
      chestPocketAssetPath:
        "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external.svg",
      trimSections: [],
    };
    const withoutTrim = await readRawPng(await renderDesignImage(pocketScene));
    const withUpperTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7040,
            role: "chestPocket",
            key: "bolsillo-pecho-superior",
            label: "Bolsillo pecho superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withZipperTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7042,
            key: "cremallera",
            label: "Cremallera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7041,
            role: "chestPocket",
            key: "bolsillo-pecho-inferior",
            label: "Bolsillo pecho inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withUpperAndZipperTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7040,
            role: "chestPocket",
            key: "bolsillo-pecho-superior",
            label: "Bolsillo pecho superior",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 7042,
            key: "cremallera",
            label: "Cremallera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const pocketInk = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 500, y: 330, width: 185, height: 250 },
    );
    const zipperPinkWithoutTrim = getPastelPinkPixelBounds(
      withoutTrim.data,
      withoutTrim.info.width,
      withoutTrim.info.height,
    );
    const upperTrimBounds = getPastelPinkPixelBounds(
      withUpperTrim.data,
      withUpperTrim.info.width,
      withUpperTrim.info.height,
    );
    const zipperTrimBounds = getPastelPinkPixelBounds(
      withZipperTrim.data,
      withZipperTrim.info.width,
      withZipperTrim.info.height,
    );
    const lowerTrimBounds = getPastelPinkPixelBounds(
      withLowerTrim.data,
      withLowerTrim.info.width,
      withLowerTrim.info.height,
    );

    expect(externalZipperPocketMarkup).toContain('width="320"');
    expect(externalZipperPocketMarkup).toContain("external-zipper-hatch");
    expect(externalZipperPocketMarkup).not.toContain("stroke-dasharray");
    expect(pocketInk).toBeGreaterThan(900);
    expect(zipperPinkWithoutTrim).toBeUndefined();
    expect(upperTrimBounds?.count).toBeGreaterThan(100);
    expect(zipperTrimBounds?.count).toBeGreaterThan(180);
    expect(lowerTrimBounds?.count).toBeGreaterThan(100);
    expect(upperTrimBounds).toBeDefined();
    expect(upperTrimBounds?.maxY ?? 0).toBeLessThan(
      lowerTrimBounds?.minY ?? 0,
    );
    const upperLineRegion = {
      x: upperTrimBounds?.minX ?? 0,
      y: upperTrimBounds?.minY ?? 0,
      width: (upperTrimBounds?.maxX ?? 0) - (upperTrimBounds?.minX ?? 0) + 1,
      height: Math.min(
        8,
        (upperTrimBounds?.maxY ?? 0) - (upperTrimBounds?.minY ?? 0) + 1,
      ),
    };
    const upperLinePixelsWithZipper = countPastelPinkPixelsInRegion(
      withUpperAndZipperTrim.data,
      withUpperAndZipperTrim.info.width,
      upperLineRegion,
    );
    const zipperOnlyPixelsInUpperLine = countPastelPinkPixelsInRegion(
      withZipperTrim.data,
      withZipperTrim.info.width,
      upperLineRegion,
    );

    expect(upperLinePixelsWithZipper).toBeGreaterThan(
      zipperOnlyPixelsInUpperLine + 80,
    );
    expect(
      (zipperTrimBounds?.maxY ?? 0) - (zipperTrimBounds?.minY ?? 0),
    ).toBeGreaterThan(
      (upperTrimBounds?.maxY ?? 0) - (upperTrimBounds?.minY ?? 0),
    );
    expect(
      countDifferentPixels(withUpperTrim.data, withZipperTrim.data),
    ).toBeGreaterThan(250);
    expect(
      countDifferentPixels(withZipperTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(250);
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withZipperTrim.data),
    ).toBeGreaterThan(250);
    expect(
      countDifferentPixels(withoutTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(100);
  }, 20000);

  it("pinta la cremallera interna del bolsillo de pecho", async () => {
    const internalZipperPocketMarkup = (
      await readFile(
        new URL(
          "../../../../apps/web/public/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-internal.svg",
          import.meta.url,
        ),
      )
    ).toString("utf8");
    const pocketScene: AutomationRenderScene = {
      ...baseScene,
      chestPocketAssetPath:
        "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-internal.svg",
      trimSections: [],
    };
    const withoutTrim = await readRawPng(await renderDesignImage(pocketScene));
    const withUpperTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7040,
            role: "chestPocket",
            key: "bolsillo-pecho-superior",
            label: "Bolsillo pecho superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withZipperTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7041,
            role: "chestPocket",
            key: "cremallera",
            label: "Cremallera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const zipperInk = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 500, y: 350, width: 185, height: 180 },
    );
    const zipperPinkWithoutTrim = countPastelPinkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 500, y: 350, width: 185, height: 180 },
    );
    const zipperPinkWithUpperTrim = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 500, y: 350, width: 185, height: 180 },
    );
    const zipperPinkWithZipperTrim = countPastelPinkPixelsInRegion(
      withZipperTrim.data,
      withZipperTrim.info.width,
      { x: 500, y: 350, width: 185, height: 180 },
    );

    expect(internalZipperPocketMarkup).toContain('width="320"');
    expect(internalZipperPocketMarkup).toContain("internal-zipper-hatch");
    expect(internalZipperPocketMarkup).not.toContain("<ellipse");
    expect(internalZipperPocketMarkup).not.toContain("stroke-dasharray");
    expect(zipperInk).toBeGreaterThan(250);
    expect(zipperPinkWithoutTrim).toBeLessThan(20);
    expect(zipperPinkWithUpperTrim).toBeLessThan(20);
    expect(zipperPinkWithZipperTrim).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withZipperTrim.data),
    ).toBeGreaterThan(150);
  }, 20000);

  it("pinta por separado los vivos superior e inferior del bolsillo rectangular", async () => {
    const rectangularPocketMarkup = (
      await readFile(
        new URL(
          "../../../../apps/web/public/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-model.svg",
          import.meta.url,
        ),
      )
    ).toString("utf8");
    const pocketScene: AutomationRenderScene = {
      ...baseScene,
      chestPocketAssetPath:
        "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-model.svg",
      trimSections: [],
    };
    const withoutTrim = await readRawPng(await renderDesignImage(pocketScene));
    const withUpperTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7040,
            role: "chestPocket",
            key: "bolsillo-pecho-superior",
            label: "Bolsillo pecho superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7041,
            role: "chestPocket",
            key: "bolsillo-pecho-inferior",
            label: "Bolsillo pecho inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );

    expect(rectangularPocketMarkup).toContain('width="320"');
    expect(rectangularPocketMarkup).not.toContain('y1="105"');
    expect(rectangularPocketMarkup).not.toContain("stroke-dasharray");
    const upperTrimBounds = getPastelPinkPixelBounds(
      withUpperTrim.data,
      withUpperTrim.info.width,
      withUpperTrim.info.height,
    );
    const lowerTrimBounds = getPastelPinkPixelBounds(
      withLowerTrim.data,
      withLowerTrim.info.width,
      withLowerTrim.info.height,
    );

    expect(upperTrimBounds?.count).toBeGreaterThan(100);
    expect(lowerTrimBounds?.count).toBeGreaterThan(100);
    expect(upperTrimBounds?.maxY ?? 0).toBeLessThan(
      lowerTrimBounds?.minY ?? 0,
    );
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(100);
    expect(
      getPastelPinkPixelBounds(
        withoutTrim.data,
        withoutTrim.info.width,
        withoutTrim.info.height,
      ),
    ).toBeUndefined();
  }, 20000);

  it("pinta por separado los vivos superior e inferior del bolsillo punta", async () => {
    const pointPocketMarkup = (
      await readFile(
        new URL(
          "../../../../apps/web/public/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point.svg",
          import.meta.url,
        ),
      )
    ).toString("utf8");
    const pocketScene: AutomationRenderScene = {
      ...baseScene,
      chestPocketAssetPath:
        "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point.svg",
      trimSections: [],
    };
    const withoutTrim = await readRawPng(await renderDesignImage(pocketScene));
    const withUpperTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7040,
            role: "chestPocket",
            key: "bolsillo-pecho-superior",
            label: "Bolsillo pecho superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerTrim = await readRawPng(
      await renderDesignImage({
        ...pocketScene,
        trimSections: [
          {
            valueId: 7041,
            role: "chestPocket",
            key: "bolsillo-pecho-inferior",
            label: "Bolsillo pecho inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const pocketInk = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 500, y: 345, width: 180, height: 250 },
    );
    const upperTrimBounds = getPastelPinkPixelBounds(
      withUpperTrim.data,
      withUpperTrim.info.width,
      withUpperTrim.info.height,
    );
    const lowerTrimBounds = getPastelPinkPixelBounds(
      withLowerTrim.data,
      withLowerTrim.info.width,
      withLowerTrim.info.height,
    );

    expect(pointPocketMarkup).toContain("L190,430");
    expect(pointPocketMarkup).not.toContain('y1="105"');
    expect(pointPocketMarkup).not.toContain("stroke-dasharray");
    expect(pocketInk).toBeGreaterThan(350);
    expect(upperTrimBounds?.count).toBeGreaterThan(100);
    expect(lowerTrimBounds?.count).toBeGreaterThan(100);
    expect(upperTrimBounds?.maxY ?? 0).toBeLessThan(
      lowerTrimBounds?.minY ?? 0,
    );
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(100);
    expect(
      getPastelPinkPixelBounds(
        withoutTrim.data,
        withoutTrim.info.width,
        withoutTrim.info.height,
      ),
    ).toBeUndefined();
  }, 20000);

  it("superpone las lineas de Pespunte del pantalon sobre la base liza", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withLizo = await readRawPng(await renderDesignImage(pantsScene));
    const withPespunte = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        garmentDetailAssetPath:
          "assets/catalog/pantalon/detail-overlays/pants-pespunte-stitching.svg",
      }),
    );
    const withPespunteTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        garmentDetailAssetPath:
          "assets/catalog/pantalon/detail-overlays/pants-pespunte-stitching.svg",
        trimSections: [
          {
            valueId: 990001,
            label: "Pespunte",
            key: "pespunte",
            colorHex: "#39ff14",
          },
        ],
      }),
    );
    const lizoSideInk =
      countDarkPixelsInRegion(withLizo.data, withLizo.info.width, {
        x: 290,
        y: 260,
        width: 85,
        height: 610,
      }) +
      countDarkPixelsInRegion(withLizo.data, withLizo.info.width, {
        x: 525,
        y: 260,
        width: 85,
        height: 610,
      });
    const pespunteSideInk =
      countDarkPixelsInRegion(withPespunte.data, withPespunte.info.width, {
        x: 290,
        y: 260,
        width: 85,
        height: 610,
      }) +
      countDarkPixelsInRegion(withPespunte.data, withPespunte.info.width, {
        x: 525,
        y: 260,
        width: 85,
        height: 610,
      });

    expect(
      countDifferentPixels(withLizo.data, withPespunte.data),
    ).toBeGreaterThan(300);
    expect(pespunteSideInk).toBeGreaterThan(lizoSideInk + 200);
    expect(countNeonGreenPixels(withPespunte.data)).toBe(0);
    expect(countNeonGreenPixels(withPespunteTrim.data)).toBeGreaterThan(200);
  }, 20000);

  it("superpone la bota Tradicional del pantalon sin reemplazar la base", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutBoot = await readRawPng(await renderDesignImage(pantsScene));
    const withBoot = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        bootAssetPath:
          "assets/catalog/pantalon/detail-overlays/pants-boot-tradicional.svg",
      }),
    );
    const baseBootInk =
      countDarkPixelsInRegion(withoutBoot.data, withoutBoot.info.width, {
        x: 205,
        y: 1010,
        width: 220,
        height: 90,
      }) +
      countDarkPixelsInRegion(withoutBoot.data, withoutBoot.info.width, {
        x: 475,
        y: 1010,
        width: 220,
        height: 90,
      });
    const traditionalBootInk =
      countDarkPixelsInRegion(withBoot.data, withBoot.info.width, {
        x: 205,
        y: 1010,
        width: 220,
        height: 90,
      }) +
      countDarkPixelsInRegion(withBoot.data, withBoot.info.width, {
        x: 475,
        y: 1010,
        width: 220,
        height: 90,
      });

    expect(
      countDifferentPixels(withoutBoot.data, withBoot.data),
    ).toBeGreaterThan(100);
    expect(traditionalBootInk).toBeGreaterThan(baseBootInk + 100);
    expect(countNeonGreenPixels(withBoot.data)).toBe(0);
  }, 20000);

  it("superpone la bota Resorte del pantalon sin reemplazar la base", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutBoot = await readRawPng(await renderDesignImage(pantsScene));
    const withBoot = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        bootAssetPath:
          "assets/catalog/pantalon/detail-overlays/pants-boot-resorte.svg",
      }),
    );
    const baseBootInk =
      countDarkPixelsInRegion(withoutBoot.data, withoutBoot.info.width, {
        x: 205,
        y: 1010,
        width: 220,
        height: 90,
      }) +
      countDarkPixelsInRegion(withoutBoot.data, withoutBoot.info.width, {
        x: 475,
        y: 1010,
        width: 220,
        height: 90,
      });
    const elasticBootInk =
      countDarkPixelsInRegion(withBoot.data, withBoot.info.width, {
        x: 205,
        y: 1010,
        width: 220,
        height: 90,
      }) +
      countDarkPixelsInRegion(withBoot.data, withBoot.info.width, {
        x: 475,
        y: 1010,
        width: 220,
        height: 90,
      });

    expect(
      countDifferentPixels(withoutBoot.data, withBoot.data),
    ).toBeGreaterThan(500);
    expect(elasticBootInk).toBeGreaterThan(baseBootInk + 500);
    expect(countNeonGreenPixels(withBoot.data)).toBe(0);
  }, 20000);

  it("superpone la bota Con abertura sin traer pespunte ni bota tradicional", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutBoot = await readRawPng(await renderDesignImage(pantsScene));
    const withBoot = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        bootAssetPath:
          "assets/catalog/pantalon/detail-overlays/pants-boot-con-abertura.svg",
      }),
    );
    const baseOpeningInk =
      countDarkPixelsInRegion(withoutBoot.data, withoutBoot.info.width, {
        x: 250,
        y: 870,
        width: 120,
        height: 200,
      }) +
      countDarkPixelsInRegion(withoutBoot.data, withoutBoot.info.width, {
        x: 535,
        y: 870,
        width: 120,
        height: 200,
      });
    const openBootInk =
      countDarkPixelsInRegion(withBoot.data, withBoot.info.width, {
        x: 250,
        y: 870,
        width: 120,
        height: 200,
      }) +
      countDarkPixelsInRegion(withBoot.data, withBoot.info.width, {
        x: 535,
        y: 870,
        width: 120,
        height: 200,
      });

    expect(
      countDifferentPixels(withoutBoot.data, withBoot.data),
    ).toBeGreaterThan(100);
    expect(openBootInk).toBeGreaterThan(baseOpeningInk + 100);
    expect(countNeonGreenPixels(withBoot.data)).toBe(0);
  }, 20000);

  it("superpone las botas Abertura frontal y lateral sin traer color fijo", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutBoot = await readRawPng(await renderDesignImage(pantsScene));

    for (const bootAssetPath of [
      "assets/catalog/pantalon/detail-overlays/pants-boot-abertura-frontal.svg",
      "assets/catalog/pantalon/detail-overlays/pants-boot-abertura-lateral.svg",
    ]) {
      const withBoot = await readRawPng(
        await renderDesignImage({
          ...pantsScene,
          bootAssetPath,
        }),
      );
      const baseOpeningInk =
        countDarkPixelsInRegion(withoutBoot.data, withoutBoot.info.width, {
          x: 250,
          y: 870,
          width: 120,
          height: 200,
        }) +
        countDarkPixelsInRegion(withoutBoot.data, withoutBoot.info.width, {
          x: 535,
          y: 870,
          width: 120,
          height: 200,
        });
      const openBootInk =
        countDarkPixelsInRegion(withBoot.data, withBoot.info.width, {
          x: 250,
          y: 870,
          width: 120,
          height: 200,
        }) +
        countDarkPixelsInRegion(withBoot.data, withBoot.info.width, {
          x: 535,
          y: 870,
          width: 120,
          height: 200,
        });

      expect(
        countDifferentPixels(withoutBoot.data, withBoot.data),
      ).toBeGreaterThan(50);
      expect(openBootInk).toBeGreaterThan(baseOpeningInk + 50);
      expect(countNeonGreenPixels(withBoot.data)).toBe(0);
    }
  }, 20000);

  it("mantiene la bota Campana limpia sin agregar trazos", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutBoot = await readRawPng(await renderDesignImage(pantsScene));
    const withBellBoot = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        bootAssetPath:
          "assets/catalog/pantalon/detail-overlays/pants-boot-campana.svg",
      }),
    );

    expect(countDifferentPixels(withoutBoot.data, withBellBoot.data)).toBe(0);
    expect(countNeonGreenPixels(withBellBoot.data)).toBe(0);
  }, 20000);

  it("superpone la bota Cremallera solo como lateral derecho", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutBoot = await readRawPng(await renderDesignImage(pantsScene));
    const withZipperBoot = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        bootAssetPath:
          "assets/catalog/pantalon/detail-overlays/pants-boot-cremallera.svg",
      }),
    );
    const zipperRegion = { x: 570, y: 800, width: 130, height: 270 };
    const baseZipperInk = countDarkPixelsInRegion(
      withoutBoot.data,
      withoutBoot.info.width,
      zipperRegion,
    );
    const zipperInk = countDarkPixelsInRegion(
      withZipperBoot.data,
      withZipperBoot.info.width,
      zipperRegion,
    );

    expect(
      countDifferentPixels(withoutBoot.data, withZipperBoot.data),
    ).toBeGreaterThan(100);
    expect(zipperInk).toBeGreaterThan(baseZipperInk + 100);
    expect(countNeonGreenPixels(withZipperBoot.data)).toBe(0);
  }, 20000);

  it("superpone la Cinturilla Completa resortada sin dejarla fija en la base", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutWaist = await readRawPng(await renderDesignImage(pantsScene));
    const withWaist = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        waistbandAssetPath:
          "assets/catalog/pantalon/detail-overlays/pants-waist-resortada.svg",
      }),
    );
    const waistbandRegion = { x: 300, y: 65, width: 330, height: 235 };
    const baseWaistInk = countDarkPixelsInRegion(
      withoutWaist.data,
      withoutWaist.info.width,
      waistbandRegion,
    );
    const resortedWaistInk = countDarkPixelsInRegion(
      withWaist.data,
      withWaist.info.width,
      waistbandRegion,
    );

    expect(
      countDifferentPixels(withoutWaist.data, withWaist.data),
    ).toBeGreaterThan(300);
    expect(resortedWaistInk).toBeGreaterThan(baseWaistInk + 300);
    expect(countNeonGreenPixels(withWaist.data)).toBe(0);
  }, 20000);

  it("superpone la Cinturilla Pretina de boton sin activar el resorte", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutWaist = await readRawPng(await renderDesignImage(pantsScene));
    const withResortedWaist = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        waistbandAssetPath:
          "assets/catalog/pantalon/detail-overlays/pants-waist-resortada.svg",
      }),
    );
    const withButtonWaist = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        waistbandAssetPath:
          "assets/catalog/pantalon/detail-overlays/pants-waist-pretina-boton.svg",
      }),
    );
    const buttonRegion = { x: 425, y: 65, width: 90, height: 85 };
    const waistbandRegion = { x: 300, y: 65, width: 330, height: 235 };
    const baseButtonInk = countDarkPixelsInRegion(
      withoutWaist.data,
      withoutWaist.info.width,
      buttonRegion,
    );
    const buttonInk = countDarkPixelsInRegion(
      withButtonWaist.data,
      withButtonWaist.info.width,
      buttonRegion,
    );
    const buttonWaistInk = countDarkPixelsInRegion(
      withButtonWaist.data,
      withButtonWaist.info.width,
      waistbandRegion,
    );
    const resortedWaistInk = countDarkPixelsInRegion(
      withResortedWaist.data,
      withResortedWaist.info.width,
      waistbandRegion,
    );

    expect(
      countDifferentPixels(withoutWaist.data, withButtonWaist.data),
    ).toBeGreaterThan(40);
    expect(buttonInk).toBeGreaterThan(baseButtonInk + 20);
    expect(resortedWaistInk).toBeGreaterThan(buttonWaistInk + 150);
    expect(countNeonGreenPixels(withButtonWaist.data)).toBe(0);
  }, 20000);

  it("pinta el borde del bolsillo lateral para Doble cremallera y Externo", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [
        {
          valueId: 9003,
          key: "bolsillo-lateral-de-pantalon",
          label: "Bolsillo lateral de pantalón",
          colorHex: "#a000b0",
        },
      ],
    };
    const withoutDoubleZipper = await readRawPng(
      await renderDesignImage(pantsScene),
    );
    const withDoubleZipper = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsSidePocketType: "doubleZipper",
      }),
    );

    expect(countPurplePixels(withoutDoubleZipper.data)).toBeLessThan(20);
    expect(countPurplePixels(withDoubleZipper.data)).toBeGreaterThan(250);
    expect(
      countDifferentPixels(withoutDoubleZipper.data, withDoubleZipper.data),
    ).toBeGreaterThan(250);
  }, 20000);

  it("rellena el bolsillo lateral Asorsalud solo con su seccion de vivo", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
      pantsSidePocketType: "asorsalud",
    };
    const withoutTrimSection = await readRawPng(
      await renderDesignImage(pantsScene),
    );
    const withTrimSection = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9003,
            key: "bolsillo-lateral-de-pantalon",
            label: "Bolsillo lateral de pantalon",
            colorHex: "#a000b0",
          },
        ],
      }),
    );

    expect(countPurplePixels(withoutTrimSection.data)).toBeLessThan(20);
    expect(countPurplePixels(withTrimSection.data)).toBeGreaterThan(250);
    expect(
      countDifferentPixels(withoutTrimSection.data, withTrimSection.data),
    ).toBeGreaterThan(250);
  }, 20000);

  it("superpone bolsillos de parche de rodilla cuadrados y pinta la cremallera horizontal por lado con Cremallera rodilla", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutPatch = await readRawPng(await renderDesignImage(pantsScene));
    const withSquarePatch = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "square",
        pantsKneePatchLeftModel: "square",
      }),
    );
    const withHorizontalZipper = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "square",
        pantsKneePatchRightType: "horizontalZipper",
        pantsKneePatchLeftModel: "square",
        pantsKneePatchLeftType: "horizontalZipper",
      }),
    );
    const withPatchTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "square",
        pantsKneePatchRightType: "horizontalZipper",
        pantsKneePatchLeftModel: "square",
        pantsKneePatchLeftType: "horizontalZipper",
        trimSections: [
          {
            valueId: 9018,
            key: "parche-rodilla",
            label: "Parche rodilla",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withRightZipperTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "square",
        pantsKneePatchRightType: "horizontalZipper",
        pantsKneePatchLeftModel: "square",
        pantsKneePatchLeftType: "horizontalZipper",
        trimSections: [
          {
            valueId: 9103,
            key: "cremallera-rodilla-derecha",
            label: "Cremallera rodilla derecha",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withLeftZipperTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "square",
        pantsKneePatchRightType: "horizontalZipper",
        pantsKneePatchLeftModel: "square",
        pantsKneePatchLeftType: "horizontalZipper",
        trimSections: [
          {
            valueId: 9104,
            key: "cremallera-rodilla-izquierda",
            label: "Cremallera rodilla izquierda",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withBothZipperTrims = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "square",
        pantsKneePatchRightType: "horizontalZipper",
        pantsKneePatchLeftModel: "square",
        pantsKneePatchLeftType: "horizontalZipper",
        trimSections: [
          {
            valueId: 9103,
            key: "cremallera-rodilla-derecha",
            label: "Cremallera rodilla derecha",
            colorHex: "#a000b0",
          },
          {
            valueId: 9104,
            key: "cremallera-rodilla-izquierda",
            label: "Cremallera rodilla izquierda",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const patchRegions = [
      { x: 195, y: 520, width: 145, height: 125 },
      { x: 560, y: 520, width: 145, height: 125 },
    ];
    const leftZipperRegion = { x: 215, y: 535, width: 105, height: 35 };
    const rightZipperRegion = { x: 585, y: 535, width: 105, height: 35 };
    const zipperRegions = [leftZipperRegion, rightZipperRegion];
    const basePatchInk = patchRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withoutPatch.data,
          withoutPatch.info.width,
          region,
        ),
      0,
    );
    const squarePatchInk = patchRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withSquarePatch.data,
          withSquarePatch.info.width,
          region,
        ),
      0,
    );
    const squareZipperInk = zipperRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withSquarePatch.data,
          withSquarePatch.info.width,
          region,
        ),
      0,
    );
    const zipperInk = zipperRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withHorizontalZipper.data,
          withHorizontalZipper.info.width,
          region,
        ),
      0,
    );
    const patchPurpleZipperPixels = zipperRegions.reduce(
      (total, region) =>
        total +
        countPurplePixelsInRegion(
          withPatchTrim.data,
          withPatchTrim.info.width,
          region,
        ),
      0,
    );
    const rightPurplePixels = countPurplePixelsInRegion(
      withRightZipperTrim.data,
      withRightZipperTrim.info.width,
      rightZipperRegion,
    );
    const rightTrimLeftPurplePixels = countPurplePixelsInRegion(
      withRightZipperTrim.data,
      withRightZipperTrim.info.width,
      leftZipperRegion,
    );
    const leftPurplePixels = countPurplePixelsInRegion(
      withLeftZipperTrim.data,
      withLeftZipperTrim.info.width,
      leftZipperRegion,
    );
    const leftTrimRightPurplePixels = countPurplePixelsInRegion(
      withLeftZipperTrim.data,
      withLeftZipperTrim.info.width,
      rightZipperRegion,
    );

    expect(
      countDifferentPixels(withoutPatch.data, withSquarePatch.data),
    ).toBeGreaterThan(200);
    expect(squarePatchInk).toBeGreaterThan(basePatchInk + 120);
    expect(zipperInk).toBeGreaterThan(squareZipperInk + 80);
    expect(countPurplePixels(withHorizontalZipper.data)).toBeLessThan(20);
    expect(patchPurpleZipperPixels).toBeLessThan(20);
    expect(rightPurplePixels).toBeGreaterThan(120);
    expect(rightTrimLeftPurplePixels).toBeLessThan(20);
    expect(leftPurplePixels).toBeGreaterThan(120);
    expect(leftTrimRightPurplePixels).toBeLessThan(20);
    expect(
      countPurplePixelsInRegion(
        withBothZipperTrims.data,
        withBothZipperTrims.info.width,
        rightZipperRegion,
      ),
    ).toBeGreaterThan(120);
    expect(
      countPurplePixelsInRegion(
        withBothZipperTrims.data,
        withBothZipperTrims.info.width,
        leftZipperRegion,
      ),
    ).toBeGreaterThan(120);
    expect(countBrightCyanPixels(withRightZipperTrim.data)).toBe(0);
  }, 20000);

  it("pinta solo los lineales superior e inferior del parche de rodilla liso", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      pantsKneePatchRightModel: "square",
      pantsKneePatchRightType: "plain",
      pantsKneePatchLeftModel: "square",
      pantsKneePatchLeftType: "plain",
      trimSections: [
        {
          valueId: 9018,
          key: "parche-rodilla",
          label: "Parche rodilla",
          colorHex: "#a000b0",
        },
      ],
    };
    const withPlainTrim = await readRawPng(await renderDesignImage(pantsScene));
    const topAndBottomRegions = [
      { x: 215, y: 520, width: 140, height: 18 },
      { x: 215, y: 630, width: 140, height: 22 },
      { x: 548, y: 520, width: 145, height: 18 },
      { x: 548, y: 630, width: 145, height: 22 },
    ];
    const middleRegions = [
      { x: 230, y: 550, width: 105, height: 60 },
      { x: 565, y: 550, width: 105, height: 60 },
    ];
    const linePurplePixels = topAndBottomRegions.reduce(
      (total, region) =>
        total +
        countPurplePixelsInRegion(
          withPlainTrim.data,
          withPlainTrim.info.width,
          region,
        ),
      0,
    );
    const middlePurplePixels = middleRegions.reduce(
      (total, region) =>
        total +
        countPurplePixelsInRegion(
          withPlainTrim.data,
          withPlainTrim.info.width,
          region,
        ),
      0,
    );

    expect(linePurplePixels).toBeGreaterThan(350);
    expect(middlePurplePixels).toBeLessThan(20);
    expect(countBrightCyanPixels(withPlainTrim.data)).toBe(0);
  }, 20000);

  it("dibuja el lineal inferior base en bolsillos cuadrados sobrepuestos", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      pantsKneePatchRightModel: "square",
      pantsKneePatchLeftModel: "square",
      trimSections: [],
    };
    const withoutOverlaid = await readRawPng(await renderDesignImage(pantsScene));
    const withOverlaid = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightType: "overlaid",
        pantsKneePatchLeftType: "overlaid",
      }),
    );
    const withRightLowerTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightType: "overlaid",
        pantsKneePatchLeftType: "overlaid",
        trimSections: [
          {
            valueId: 12018,
            key: "rodilla-derecha-lineal-inferior",
            label: "Rodilla derecha lineal inferior",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const leftLowerRegion = { x: 205, y: 534, width: 145, height: 10 };
    const rightLowerRegion = { x: 548, y: 534, width: 145, height: 10 };
    const baseLeftLowerInk = countDarkPixelsInRegion(
      withoutOverlaid.data,
      withoutOverlaid.info.width,
      leftLowerRegion,
    );
    const baseRightLowerInk = countDarkPixelsInRegion(
      withoutOverlaid.data,
      withoutOverlaid.info.width,
      rightLowerRegion,
    );

    expect(
      countDarkPixelsInRegion(
        withOverlaid.data,
        withOverlaid.info.width,
        leftLowerRegion,
      ),
    ).toBeGreaterThan(baseLeftLowerInk + 80);
    expect(
      countDarkPixelsInRegion(
        withOverlaid.data,
        withOverlaid.info.width,
        rightLowerRegion,
      ),
    ).toBeGreaterThan(baseRightLowerInk + 80);
    expect(countPurplePixels(withOverlaid.data)).toBeLessThan(20);
    expect(
      countPurplePixelsInRegion(
        withRightLowerTrim.data,
        withRightLowerTrim.info.width,
        rightLowerRegion,
      ),
    ).toBeGreaterThan(80);
    expect(
      countPurplePixelsInRegion(
        withRightLowerTrim.data,
        withRightLowerTrim.info.width,
        leftLowerRegion,
      ),
    ).toBeLessThan(20);
  }, 20000);

  it("pinta Rodilla lineal superior e inferior de forma independiente en ambos lados", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      pantsKneePatchRightModel: "square",
      pantsKneePatchLeftModel: "square",
      trimSections: [],
    };
    const withUpper = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9101,
            key: "rodilla-lineal-superior",
            label: "Rodilla lineal superior",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withLower = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9102,
            key: "rodilla-lineal-inferior",
            label: "Rodilla lineal inferior",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withBoth = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9101,
            key: "rodilla-lineal-superior",
            label: "Rodilla lineal superior",
            colorHex: "#a000b0",
          },
          {
            valueId: 9102,
            key: "rodilla-lineal-inferior",
            label: "Rodilla lineal inferior",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const upperRegions = [
      { x: 205, y: 522, width: 145, height: 10 },
      { x: 548, y: 522, width: 145, height: 10 },
    ];
    const lowerRegions = [
      { x: 205, y: 534, width: 145, height: 10 },
      { x: 548, y: 534, width: 145, height: 10 },
    ];

    for (const region of upperRegions) {
      expect(
        countPurplePixelsInRegion(
          withUpper.data,
          withUpper.info.width,
          region,
        ),
      ).toBeGreaterThan(80);
      expect(
        countPurplePixelsInRegion(
          withLower.data,
          withLower.info.width,
          region,
        ),
      ).toBeLessThan(20);
    }

    for (const region of lowerRegions) {
      expect(
        countPurplePixelsInRegion(
          withLower.data,
          withLower.info.width,
          region,
        ),
      ).toBeGreaterThan(80);
      expect(
        countPurplePixelsInRegion(
          withUpper.data,
          withUpper.info.width,
          region,
        ),
      ).toBeLessThan(20);
    }

    expect(countPurplePixels(withBoth.data)).toBeGreaterThan(
      countPurplePixels(withUpper.data) + 150,
    );
    expect(countPurplePixels(withBoth.data)).toBeGreaterThan(
      countPurplePixels(withLower.data) + 150,
    );
  }, 20000);

  it("pinta los lineales de rodilla derecha e izquierda solo en su lado", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      pantsKneePatchRightModel: "square",
      pantsKneePatchLeftModel: "square",
      trimSections: [],
    };
    const withRightLinears = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9120,
            key: "rodilla-derecha-lineal-superior",
            label: "Rodilla derecha lineal superior",
            colorHex: "#a000b0",
          },
          {
            valueId: 9121,
            key: "rodilla-derecha-lineal-inferior",
            label: "Rodilla derecha lineal inferior",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withLeftLinears = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9122,
            key: "rodilla-izquierda-lineal-superior",
            label: "Rodilla izquierda lineal superior",
            colorHex: "#a000b0",
          },
          {
            valueId: 9123,
            key: "rodilla-izquierda-lineal-inferior",
            label: "Rodilla izquierda lineal inferior",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const leftUpperRegion = { x: 205, y: 522, width: 145, height: 10 };
    const rightUpperRegion = { x: 548, y: 522, width: 145, height: 10 };
    const leftLowerRegion = { x: 205, y: 534, width: 145, height: 10 };
    const rightLowerRegion = { x: 548, y: 534, width: 145, height: 10 };

    expect(
      countPurplePixelsInRegion(
        withRightLinears.data,
        withRightLinears.info.width,
        rightUpperRegion,
      ),
    ).toBeGreaterThan(80);
    expect(
      countPurplePixelsInRegion(
        withRightLinears.data,
        withRightLinears.info.width,
        rightLowerRegion,
      ),
    ).toBeGreaterThan(80);
    expect(
      countPurplePixelsInRegion(
        withRightLinears.data,
        withRightLinears.info.width,
        leftUpperRegion,
      ),
    ).toBeLessThan(20);
    expect(
      countPurplePixelsInRegion(
        withRightLinears.data,
        withRightLinears.info.width,
        leftLowerRegion,
      ),
    ).toBeLessThan(20);

    expect(
      countPurplePixelsInRegion(
        withLeftLinears.data,
        withLeftLinears.info.width,
        leftUpperRegion,
      ),
    ).toBeGreaterThan(80);
    expect(
      countPurplePixelsInRegion(
        withLeftLinears.data,
        withLeftLinears.info.width,
        leftLowerRegion,
      ),
    ).toBeGreaterThan(80);
    expect(
      countPurplePixelsInRegion(
        withLeftLinears.data,
        withLeftLinears.info.width,
        rightUpperRegion,
      ),
    ).toBeLessThan(20);
    expect(
      countPurplePixelsInRegion(
        withLeftLinears.data,
        withLeftLinears.info.width,
        rightLowerRegion,
      ),
    ).toBeLessThan(20);
  }, 20000);

  it("pinta Aro rodilla derecha e izquierda en el lineal superior del lado seleccionado", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      pantsKneePatchRightModel: "square",
      pantsKneePatchLeftModel: "square",
      trimSections: [],
    };
    const withRightRing = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9110,
            key: "aro-rodilla-derecha",
            label: "Aro rodilla derecha",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withLeftRing = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9111,
            key: "aro-rodilla-izquierda",
            label: "Aro rodilla izquierda",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withoutRightPatch = await readRawPng(
      await renderDesignImage({
        productName: "Pantalon",
        baseColorHex: "#D1D5DB",
        garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
        lowerPocketLayout: "none",
        pantsKneePatchLeftModel: "square",
        trimSections: [
          {
            valueId: 9110,
            key: "aro-rodilla-derecha",
            label: "Aro rodilla derecha",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const leftRingRegion = { x: 255, y: 520, width: 60, height: 35 };
    const rightRingRegion = { x: 598, y: 520, width: 60, height: 35 };

    expect(
      countPurplePixelsInRegion(
        withRightRing.data,
        withRightRing.info.width,
        rightRingRegion,
      ),
    ).toBeGreaterThan(60);
    expect(
      countPurplePixelsInRegion(
        withRightRing.data,
        withRightRing.info.width,
        leftRingRegion,
      ),
    ).toBeLessThan(20);
    expect(
      countPurplePixelsInRegion(
        withLeftRing.data,
        withLeftRing.info.width,
        leftRingRegion,
      ),
    ).toBeGreaterThan(60);
    expect(
      countPurplePixelsInRegion(
        withLeftRing.data,
        withLeftRing.info.width,
        rightRingRegion,
      ),
    ).toBeLessThan(20);
    expect(
      countPurplePixelsInRegion(
        withoutRightPatch.data,
        withoutRightPatch.info.width,
        rightRingRegion,
      ),
    ).toBeLessThan(20);
  }, 20000);

  it("aplica los lineales universales a parches internos y ribete", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      pantsKneePatchRightModel: "internal",
      pantsKneePatchLeftModel: "ribete",
      pantsKneePatchLeftType: "plain",
      trimSections: [
        {
          valueId: 9101,
          key: "rodilla-lineal-superior",
          label: "Rodilla lineal superior",
          colorHex: "#a000b0",
        },
        {
          valueId: 9102,
          key: "rodilla-lineal-inferior",
          label: "Rodilla lineal inferior",
          colorHex: "#a000b0",
        },
      ],
    };
    const withInternalAndPlainRibete = await readRawPng(
      await renderDesignImage(pantsScene),
    );
    const withZipperRibete = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchLeftType: "zipper",
      }),
    );
    const internalRegion = { x: 555, y: 535, width: 135, height: 30 };
    const plainRibeteRegion = { x: 245, y: 605, width: 130, height: 30 };
    const zipperRibeteRegion = { x: 235, y: 605, width: 150, height: 30 };

    expect(
      countPurplePixelsInRegion(
        withInternalAndPlainRibete.data,
        withInternalAndPlainRibete.info.width,
        internalRegion,
      ),
    ).toBeGreaterThan(160);
    expect(
      countPurplePixelsInRegion(
        withInternalAndPlainRibete.data,
        withInternalAndPlainRibete.info.width,
        plainRibeteRegion,
      ),
    ).toBeGreaterThan(130);
    expect(
      countPurplePixelsInRegion(
        withZipperRibete.data,
        withZipperRibete.info.width,
        zipperRibeteRegion,
      ),
    ).toBeGreaterThan(150);
  }, 20000);

  it("pinta la cremallera vertical del parche de rodilla por lado con Cremallera rodilla", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      pantsKneePatchRightModel: "square",
      pantsKneePatchRightType: "verticalZipper",
      pantsKneePatchLeftModel: "square",
      pantsKneePatchLeftType: "verticalZipper",
      trimSections: [],
    };
    const withoutTrim = await readRawPng(await renderDesignImage(pantsScene));
    const withPatchTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9018,
            key: "parche-rodilla",
            label: "Parche rodilla",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withRightZipperTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9103,
            key: "cremallera-rodilla-derecha",
            label: "Cremallera rodilla derecha",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withLeftZipperTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9104,
            key: "cremallera-rodilla-izquierda",
            label: "Cremallera rodilla izquierda",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withBothZipperTrims = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9103,
            key: "cremallera-rodilla-derecha",
            label: "Cremallera rodilla derecha",
            colorHex: "#a000b0",
          },
          {
            valueId: 9104,
            key: "cremallera-rodilla-izquierda",
            label: "Cremallera rodilla izquierda",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const leftVerticalZipperRegion = { x: 220, y: 535, width: 40, height: 95 };
    const rightVerticalZipperRegion = { x: 640, y: 535, width: 40, height: 95 };
    const verticalZipperRegions = [
      leftVerticalZipperRegion,
      rightVerticalZipperRegion,
    ];
    const darkVerticalPixels = verticalZipperRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withoutTrim.data,
          withoutTrim.info.width,
          region,
        ),
      0,
    );
    const patchPurpleVerticalPixels = verticalZipperRegions.reduce(
      (total, region) =>
        total +
        countPurplePixelsInRegion(
          withPatchTrim.data,
          withPatchTrim.info.width,
          region,
        ),
      0,
    );
    const rightPurplePixels = countPurplePixelsInRegion(
      withRightZipperTrim.data,
      withRightZipperTrim.info.width,
      rightVerticalZipperRegion,
    );
    const rightTrimLeftPurplePixels = countPurplePixelsInRegion(
      withRightZipperTrim.data,
      withRightZipperTrim.info.width,
      leftVerticalZipperRegion,
    );
    const leftPurplePixels = countPurplePixelsInRegion(
      withLeftZipperTrim.data,
      withLeftZipperTrim.info.width,
      leftVerticalZipperRegion,
    );
    const leftTrimRightPurplePixels = countPurplePixelsInRegion(
      withLeftZipperTrim.data,
      withLeftZipperTrim.info.width,
      rightVerticalZipperRegion,
    );

    expect(darkVerticalPixels).toBeGreaterThan(120);
    expect(countPurplePixels(withoutTrim.data)).toBeLessThan(20);
    expect(patchPurpleVerticalPixels).toBeLessThan(20);
    expect(rightPurplePixels).toBeGreaterThan(350);
    expect(rightTrimLeftPurplePixels).toBeLessThan(20);
    expect(leftPurplePixels).toBeGreaterThan(350);
    expect(leftTrimRightPurplePixels).toBeLessThan(20);
    expect(
      countPurplePixelsInRegion(
        withBothZipperTrims.data,
        withBothZipperTrims.info.width,
        rightVerticalZipperRegion,
      ),
    ).toBeGreaterThan(350);
    expect(
      countPurplePixelsInRegion(
        withBothZipperTrims.data,
        withBothZipperTrims.info.width,
        leftVerticalZipperRegion,
      ),
    ).toBeGreaterThan(350);
    expect(countBrightCyanPixels(withRightZipperTrim.data)).toBe(0);
  }, 20000);

  it("superpone bolsillos de parche de rodilla camuflados y pinta la pieza superior con Parche rodilla", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutPatch = await readRawPng(await renderDesignImage(pantsScene));
    const withCamouflagePatch = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "camouflage",
        pantsKneePatchLeftModel: "camouflage",
      }),
    );
    const withButtonWithoutTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "camouflage",
        pantsKneePatchRightType: "button",
        pantsKneePatchLeftModel: "camouflage",
        pantsKneePatchLeftType: "button",
      }),
    );
    const withSnapWithoutTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "camouflage",
        pantsKneePatchRightType: "snap",
        pantsKneePatchLeftModel: "camouflage",
        pantsKneePatchLeftType: "snap",
      }),
    );
    const withTrimmedButton = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "camouflage",
        pantsKneePatchRightType: "button",
        pantsKneePatchLeftModel: "camouflage",
        pantsKneePatchLeftType: "button",
        trimSections: [
          {
            valueId: 9018,
            key: "parche-rodilla",
            label: "Parche rodilla",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withLeftTrimmedButton = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "camouflage",
        pantsKneePatchRightType: "button",
        pantsKneePatchLeftModel: "camouflage",
        pantsKneePatchLeftType: "button",
        trimSections: [
          {
            valueId: 9080,
            key: "parche-rodilla-izquierda",
            label: "Parche rodilla izquierda",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withRightButtonTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "camouflage",
        pantsKneePatchRightType: "button",
        pantsKneePatchLeftModel: "camouflage",
        pantsKneePatchLeftType: "button",
        trimSections: [
          {
            valueId: 9081,
            key: "boton-rodilla-derecha",
            label: "Boton rodilla derecha",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withLeftButtonTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "camouflage",
        pantsKneePatchRightType: "button",
        pantsKneePatchLeftModel: "camouflage",
        pantsKneePatchLeftType: "button",
        trimSections: [
          {
            valueId: 9082,
            key: "boton-rodilla-izquierda",
            label: "Boton rodilla izquierda",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const patchRegions = [
      { x: 195, y: 520, width: 145, height: 125 },
      { x: 560, y: 520, width: 145, height: 125 },
    ];
    const leftFlapRegion = { x: 210, y: 535, width: 130, height: 30 };
    const rightFlapRegion = { x: 560, y: 535, width: 140, height: 30 };
    const leftButtonRegion = { x: 238, y: 530, width: 28, height: 28 };
    const rightButtonRegion = { x: 610, y: 530, width: 28, height: 28 };
    const flapRegions = [leftFlapRegion, rightFlapRegion];
    const basePatchInk = patchRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withoutPatch.data,
          withoutPatch.info.width,
          region,
        ),
      0,
    );
    const camouflagePatchInk = patchRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withCamouflagePatch.data,
          withCamouflagePatch.info.width,
          region,
        ),
      0,
    );
    const purpleFlapPixels = flapRegions.reduce(
      (total, region) =>
        total +
        countPurplePixelsInRegion(
          withTrimmedButton.data,
          withTrimmedButton.info.width,
          region,
        ),
      0,
    );
    const leftOnlyPurpleFlapPixels = countPurplePixelsInRegion(
      withLeftTrimmedButton.data,
      withLeftTrimmedButton.info.width,
      leftFlapRegion,
    );
    const rightPurpleFlapPixelsWithLeftTrim = countPurplePixelsInRegion(
      withLeftTrimmedButton.data,
      withLeftTrimmedButton.info.width,
      rightFlapRegion,
    );
    const rightButtonPurplePixels = countPurplePixelsInRegion(
      withRightButtonTrim.data,
      withRightButtonTrim.info.width,
      rightButtonRegion,
    );
    const rightButtonLeftPurplePixels = countPurplePixelsInRegion(
      withRightButtonTrim.data,
      withRightButtonTrim.info.width,
      leftButtonRegion,
    );
    const leftButtonPurplePixels = countPurplePixelsInRegion(
      withLeftButtonTrim.data,
      withLeftButtonTrim.info.width,
      leftButtonRegion,
    );
    const leftButtonRightPurplePixels = countPurplePixelsInRegion(
      withLeftButtonTrim.data,
      withLeftButtonTrim.info.width,
      rightButtonRegion,
    );

    expect(
      countDifferentPixels(withoutPatch.data, withCamouflagePatch.data),
    ).toBeGreaterThan(260);
    expect(camouflagePatchInk).toBeGreaterThan(basePatchInk + 180);
    expect(
      countDifferentPixels(withButtonWithoutTrim.data, withSnapWithoutTrim.data),
    ).toBeGreaterThan(20);
    expect(countPurplePixels(withButtonWithoutTrim.data)).toBeLessThan(20);
    expect(purpleFlapPixels).toBeGreaterThan(1200);
    expect(leftOnlyPurpleFlapPixels).toBeGreaterThan(500);
    expect(rightPurpleFlapPixelsWithLeftTrim).toBeLessThan(20);
    expect(rightButtonPurplePixels).toBeGreaterThan(20);
    expect(rightButtonLeftPurplePixels).toBeLessThan(10);
    expect(leftButtonPurplePixels).toBeGreaterThan(20);
    expect(leftButtonRightPurplePixels).toBeLessThan(10);
    expect(countBrightCyanPixels(withTrimmedButton.data)).toBe(0);
  }, 20000);

  it("superpone bolsillos camuflados con hebilla sin color ni vivo", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutPatch = await readRawPng(await renderDesignImage(pantsScene));
    const withBucklePatch = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "camouflage",
        pantsKneePatchRightType: "buckle",
        pantsKneePatchLeftModel: "camouflage",
        pantsKneePatchLeftType: "buckle",
      }),
    );
    const withTrimmedBucklePatch = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "camouflage",
        pantsKneePatchRightType: "buckle",
        pantsKneePatchLeftModel: "camouflage",
        pantsKneePatchLeftType: "buckle",
        trimSections: [
          {
            valueId: 9078,
            key: "parche-rodilla",
            label: "Parche rodilla",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const patchRegions = [
      { x: 195, y: 520, width: 145, height: 125 },
      { x: 560, y: 520, width: 145, height: 125 },
    ];
    const buckleRegions = [
      { x: 245, y: 560, width: 45, height: 60 },
      { x: 615, y: 560, width: 45, height: 60 },
    ];
    const baseBuckleInk = buckleRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withoutPatch.data,
          withoutPatch.info.width,
          region,
        ),
      0,
    );
    const buckleInk = buckleRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withBucklePatch.data,
          withBucklePatch.info.width,
          region,
        ),
      0,
    );
    const purplePatchPixels = patchRegions.reduce(
      (total, region) =>
        total +
        countPurplePixelsInRegion(
          withTrimmedBucklePatch.data,
          withTrimmedBucklePatch.info.width,
          region,
        ),
      0,
    );

    expect(
      countDifferentPixels(withoutPatch.data, withBucklePatch.data),
    ).toBeGreaterThan(300);
    expect(buckleInk).toBeGreaterThan(baseBuckleInk + 80);
    expect(purplePatchPixels).toBeLessThan(30);
    expect(countBrightCyanPixels(withTrimmedBucklePatch.data)).toBe(0);
  }, 20000);

  it("superpone bolsillos de parche de rodilla punta y pinta la costura esfero con Parche rodilla", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutPatch = await readRawPng(await renderDesignImage(pantsScene));
    const withPointPatch = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "point",
        pantsKneePatchLeftModel: "point",
      }),
    );
    const withTrimmedPointPatch = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "point",
        pantsKneePatchLeftModel: "point",
        trimSections: [
          {
            valueId: 9018,
            key: "parche-rodilla",
            label: "Parche rodilla",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const patchRegions = [
      { x: 195, y: 520, width: 145, height: 125 },
      { x: 560, y: 520, width: 145, height: 125 },
    ];
    const penSeamRegions = [
      { x: 225, y: 535, width: 85, height: 105 },
      { x: 630, y: 535, width: 85, height: 105 },
    ];
    const basePatchInk = patchRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withoutPatch.data,
          withoutPatch.info.width,
          region,
        ),
      0,
    );
    const pointPatchInk = patchRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withPointPatch.data,
          withPointPatch.info.width,
          region,
        ),
      0,
    );
    const basePenSeamInk = penSeamRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withoutPatch.data,
          withoutPatch.info.width,
          region,
        ),
      0,
    );
    const penSeamInk = penSeamRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withPointPatch.data,
          withPointPatch.info.width,
          region,
        ),
      0,
    );
    const purplePenSeamPixels = penSeamRegions.reduce(
      (total, region) =>
        total +
        countPurplePixelsInRegion(
          withTrimmedPointPatch.data,
          withTrimmedPointPatch.info.width,
          region,
        ),
      0,
    );

    expect(countDifferentPixels(withoutPatch.data, withPointPatch.data)).toBeGreaterThan(
      220,
    );
    expect(pointPatchInk).toBeGreaterThan(basePatchInk + 150);
    expect(penSeamInk).toBeGreaterThan(basePenSeamInk + 35);
    expect(countPurplePixels(withPointPatch.data)).toBeLessThan(20);
    expect(purplePenSeamPixels).toBeGreaterThan(160);
    expect(countBrightCyanPixels(withTrimmedPointPatch.data)).toBe(0);
  }, 20000);

  it("superpone bolsillos de parche de rodilla pestana triangular y pinta solo la linea superior con Parche rodilla", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutPatch = await readRawPng(await renderDesignImage(pantsScene));
    const withTriangularFlapPatch = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "triangularFlap",
        pantsKneePatchLeftModel: "triangularFlap",
      }),
    );
    const withTrimmedTriangularFlapPatch = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "triangularFlap",
        pantsKneePatchLeftModel: "triangularFlap",
        trimSections: [
          {
            valueId: 9064,
            key: "parche-rodilla",
            label: "Parche rodilla",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const patchRegions = [
      { x: 195, y: 520, width: 145, height: 125 },
      { x: 560, y: 520, width: 145, height: 125 },
    ];
    const topLineRegions = [
      { x: 205, y: 520, width: 140, height: 15 },
      { x: 555, y: 520, width: 145, height: 15 },
    ];
    const lowerLineRegions = [
      { x: 220, y: 565, width: 115, height: 85 },
      { x: 575, y: 565, width: 115, height: 85 },
    ];
    const basePatchInk = patchRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withoutPatch.data,
          withoutPatch.info.width,
          region,
        ),
      0,
    );
    const triangularFlapPatchInk = patchRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withTriangularFlapPatch.data,
          withTriangularFlapPatch.info.width,
          region,
        ),
      0,
    );
    const purpleTopLinePixels = topLineRegions.reduce(
      (total, region) =>
        total +
        countPurplePixelsInRegion(
          withTrimmedTriangularFlapPatch.data,
          withTrimmedTriangularFlapPatch.info.width,
          region,
        ),
      0,
    );
    const purpleLowerLinePixels = lowerLineRegions.reduce(
      (total, region) =>
        total +
        countPurplePixelsInRegion(
          withTrimmedTriangularFlapPatch.data,
          withTrimmedTriangularFlapPatch.info.width,
          region,
        ),
      0,
    );
    expect(
      countDifferentPixels(withoutPatch.data, withTriangularFlapPatch.data),
    ).toBeGreaterThan(260);
    expect(triangularFlapPatchInk).toBeGreaterThan(basePatchInk + 160);
    expect(purpleTopLinePixels).toBeGreaterThan(450);
    expect(purpleLowerLinePixels).toBeLessThan(40);
    expect(countBrightCyanPixels(withTrimmedTriangularFlapPatch.data)).toBe(0);
  }, 20000);

  it("superpone bolsillos de parche de rodilla ribete y no pinta lizo con Parche rodilla", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutPatch = await readRawPng(await renderDesignImage(pantsScene));
    const withRibetePatch = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "ribete",
        pantsKneePatchRightType: "plain",
        pantsKneePatchLeftModel: "ribete",
        pantsKneePatchLeftType: "zipper",
      }),
    );
    const withTrimmedRibetePatch = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "ribete",
        pantsKneePatchRightType: "plain",
        pantsKneePatchLeftModel: "ribete",
        pantsKneePatchLeftType: "zipper",
        trimSections: [
          {
            valueId: 9088,
            key: "parche-rodilla",
            label: "Parche rodilla",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const ribeteRegions = [
      { x: 255, y: 610, width: 120, height: 35 },
      { x: 535, y: 610, width: 110, height: 35 },
    ];
    const plainRegion = { x: 535, y: 610, width: 110, height: 35 };
    const zipperRegion = { x: 255, y: 610, width: 120, height: 35 };
    const baseRibeteInk = ribeteRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withoutPatch.data,
          withoutPatch.info.width,
          region,
        ),
      0,
    );
    const ribeteInk = ribeteRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withRibetePatch.data,
          withRibetePatch.info.width,
          region,
        ),
      0,
    );
    const purplePlainPixels = countPurplePixelsInRegion(
      withTrimmedRibetePatch.data,
      withTrimmedRibetePatch.info.width,
      plainRegion,
    );
    const purpleZipperPixels = countPurplePixelsInRegion(
      withTrimmedRibetePatch.data,
      withTrimmedRibetePatch.info.width,
      zipperRegion,
    );

    expect(countDifferentPixels(withoutPatch.data, withRibetePatch.data)).toBeGreaterThan(
      160,
    );
    expect(ribeteInk).toBeGreaterThan(baseRibeteInk + 90);
    expect(countPurplePixels(withRibetePatch.data)).toBeLessThan(30);
    expect(purplePlainPixels).toBeLessThan(30);
    expect(purpleZipperPixels).toBeGreaterThan(180);
    expect(countBrightCyanPixels(withTrimmedRibetePatch.data)).toBe(0);
  }, 20000);

  it("pinta ribete lizo de rodilla por lado con secciones de ribete", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      pantsKneePatchRightModel: "ribete",
      pantsKneePatchRightType: "plain",
      pantsKneePatchLeftModel: "ribete",
      pantsKneePatchLeftType: "plain",
      trimSections: [],
    };
    const withRightRibeteTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9089,
            key: "ribete-rodilla-derecha",
            label: "Ribete rodilla derecha",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const withLeftRibeteTrim = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        trimSections: [
          {
            valueId: 9090,
            key: "ribete-rodilla-izquierda",
            label: "Ribete rodilla izquierda",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const leftRibeteRegion = { x: 255, y: 610, width: 120, height: 35 };
    const rightRibeteRegion = { x: 535, y: 610, width: 110, height: 35 };

    expect(
      countPurplePixelsInRegion(
        withRightRibeteTrim.data,
        withRightRibeteTrim.info.width,
        rightRibeteRegion,
      ),
    ).toBeGreaterThan(450);
    expect(
      countPurplePixelsInRegion(
        withRightRibeteTrim.data,
        withRightRibeteTrim.info.width,
        leftRibeteRegion,
      ),
    ).toBeLessThan(30);
    expect(
      countPurplePixelsInRegion(
        withLeftRibeteTrim.data,
        withLeftRibeteTrim.info.width,
        leftRibeteRegion,
      ),
    ).toBeGreaterThan(450);
    expect(
      countPurplePixelsInRegion(
        withLeftRibeteTrim.data,
        withLeftRibeteTrim.info.width,
        rightRibeteRegion,
      ),
    ).toBeLessThan(30);
  }, 20000);

  it("superpone bolsillos de parche de rodilla internos sin color ni vivo", async () => {
    const pantsScene: AutomationRenderScene = {
      productName: "Pantalon",
      baseColorHex: "#D1D5DB",
      garmentAssetPath: "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
      lowerPocketLayout: "none",
      trimSections: [],
    };
    const withoutPatch = await readRawPng(await renderDesignImage(pantsScene));
    const withInternalPatch = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "internal",
        pantsKneePatchLeftModel: "internal",
      }),
    );
    const withTrimmedInternalPatch = await readRawPng(
      await renderDesignImage({
        ...pantsScene,
        pantsKneePatchRightModel: "internal",
        pantsKneePatchLeftModel: "internal",
        trimSections: [
          {
            valueId: 9094,
            key: "parche-rodilla",
            label: "Parche rodilla",
            colorHex: "#a000b0",
          },
        ],
      }),
    );
    const internalRegions = [
      { x: 235, y: 540, width: 120, height: 120 },
      { x: 545, y: 540, width: 120, height: 120 },
    ];
    const baseInternalInk = internalRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withoutPatch.data,
          withoutPatch.info.width,
          region,
        ),
      0,
    );
    const internalInk = internalRegions.reduce(
      (total, region) =>
        total +
        countDarkPixelsInRegion(
          withInternalPatch.data,
          withInternalPatch.info.width,
          region,
        ),
      0,
    );
    const internalPurple = countPurplePixels(withInternalPatch.data);
    const trimmedInternalPurple = countPurplePixels(
      withTrimmedInternalPatch.data,
    );

    expect(countDifferentPixels(withoutPatch.data, withInternalPatch.data)).toBeGreaterThan(
      500,
    );
    expect(internalInk).toBeGreaterThan(baseInternalInk + 380);
    expect(countNeonGreenPixels(withInternalPatch.data)).toBe(0);
    expect(trimmedInternalPurple).toBeLessThanOrEqual(internalPurple + 5);
    expect(
      countDifferentPixels(withInternalPatch.data, withTrimmedInternalPatch.data),
    ).toBeLessThan(10);
  }, 20000);

  it("renderiza Picos con color base y cogotera", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-12-cherokee.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withLeftExternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2907,
            key: "cuello-v-lineal-externo-izquierdo",
            label: "Cuello V lineal externo izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightExternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 416,
            key: "cuello-v-lineal-externo-derecho",
            label: "Cuello V lineal externo derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const basePinkPixels = countPastelPinkPixelsByHalf(
      withoutTrim.data,
      withoutTrim.info.width,
    );
    const leftPinkPixels = countPastelPinkPixelsByHalf(
      withLeftExternal.data,
      withLeftExternal.info.width,
    );
    const rightPinkPixels = countPastelPinkPixelsByHalf(
      withRightExternal.data,
      withRightExternal.info.width,
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countNeonGreenPixels(withoutTrim.data)).toBe(0);
    expect(basePinkPixels.left + basePinkPixels.right).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withLeftExternal.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withRightExternal.data),
    ).toBeGreaterThan(100);
    expect(leftPinkPixels.left).toBeGreaterThan(100);
    expect(leftPinkPixels.left).toBeGreaterThan(leftPinkPixels.right);
    expect(rightPinkPixels.right).toBeGreaterThan(100);
    expect(rightPinkPixels.right).toBeGreaterThan(rightPinkPixels.left);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
  }, 20000);

  it("renderiza P-PAIPILLA con color base y cogotera", async () => {
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath:
          "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-13-p-paipilla.svg",
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath:
          "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-13-p-paipilla.svg",
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath:
          "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-13-p-paipilla.svg",
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withCompleteCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath:
          "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-13-p-paipilla.svg",
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello-completo",
            label: "Cuello completo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countNeonGreenPixels(withoutTrim.data)).toBe(0);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withCompleteCollar.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
  }, 20000);

  it("renderiza FISIOPRACTICAS con color base, cuello completo y cogotera", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-11-fisiopracticas.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withCompleteCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello-completo",
            label: "Cuello completo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countOrangePixels(withoutTrim.data)).toBe(0);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withCompleteCollar.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
  }, 20000);

  it("renderiza OVALADO con Cuello arco y cogotera curva", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-09.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5147,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withCollarArc = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 7009,
            key: "cuello-arco",
            label: "Cuello arco",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5146,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const collarArcPinkPixels = countPastelPinkPixelsInRegion(
      withCollarArc.data,
      withCollarArc.info.width,
      { x: 390, y: 300, width: 110, height: 70 },
    );
    const curvedBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 370, y: 140, width: 170, height: 45 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withCollarArc.data),
    ).toBeGreaterThan(50);
    expect(collarArcPinkPixels).toBeGreaterThan(50);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(curvedBackNeckPinkPixels).toBeGreaterThan(100);
  }, 20000);

  it("renderiza CUELLO ALTO con vivos internos y sin cogotera", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-08.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withHighCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 421,
            role: "upperNeck",
            key: "cuello-alto",
            label: "Cuello alto",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLeftInternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5155,
            key: "cuello-v-lineal-interno-izquierdo",
            label: "Cuello V lineal interno izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightInternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5156,
            key: "cuello-v-lineal-interno-derecho",
            label: "Cuello V lineal interno derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5146,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const highCollarPinkPixels = countPastelPinkPixelsInRegion(
      withHighCollar.data,
      withHighCollar.info.width,
      { x: 330, y: 105, width: 250, height: 100 },
    );
    const leftInternalPinkPixels = countPastelPinkPixelsInRegion(
      withLeftInternal.data,
      withLeftInternal.info.width,
      { x: 385, y: 165, width: 75, height: 235 },
    );
    const rightInternalPinkPixels = countPastelPinkPixelsInRegion(
      withRightInternal.data,
      withRightInternal.info.width,
      { x: 440, y: 165, width: 75, height: 235 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withHighCollar.data),
    ).toBeGreaterThan(100);
    expect(highCollarPinkPixels).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withoutTrim.data, withLeftInternal.data),
    ).toBeGreaterThan(100);
    expect(leftInternalPinkPixels).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withRightInternal.data),
    ).toBeGreaterThan(100);
    expect(rightInternalPinkPixels).toBeGreaterThan(100);
    expect(countDifferentPixels(withoutTrim.data, withBackNeck.data)).toBe(0);
  }, 20000);

  it("renderiza lados internos independientes en cuello 20-19", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-10.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withLeftInternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 6001,
            key: "cuello-v-lineal-interno-izquierdo",
            label: "Cuello V lineal interno izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightInternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 6002,
            key: "cuello-v-lineal-interno-derecho",
            label: "Cuello V lineal interno derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );

    const leftPinkPixels = countPinkPixelsByHalf(
      withLeftInternal.data,
      withLeftInternal.info.width,
    );
    const rightPinkPixels = countPinkPixelsByHalf(
      withRightInternal.data,
      withRightInternal.info.width,
    );

    expect(
      countDifferentPixels(withoutTrim.data, withLeftInternal.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withRightInternal.data),
    ).toBeGreaterThan(100);
    expect(leftPinkPixels.left).toBeGreaterThan(leftPinkPixels.right);
    expect(rightPinkPixels.right).toBeGreaterThan(rightPinkPixels.left);
  }, 20000);

  it("renderiza CUELLO V con vivos lineales, completos interiores y cogotera recta", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withLeftExternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2907,
            key: "cuello-v-lineal-externo-izquierdo",
            label: "Cuello V lineal externo izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightExternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 416,
            key: "cuello-v-lineal-externo-derecho",
            label: "Cuello V lineal externo derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLeftInternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2910,
            key: "cuello-v-lineal-interno-izquierdo",
            label: "Cuello V lineal interno izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightInternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 417,
            key: "cuello-v-lineal-interno-derecho",
            label: "Cuello V lineal interno derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLeftComplete = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2916,
            key: "cuello-v-completo-interior-izquierdo",
            label: "Cuello V Completo interior izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightComplete = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2913,
            key: "cuello-v-completo-interior-derecho",
            label: "Cuello V Completo interior derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5146,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftExternalPinkPixels = countPinkPixelsByHalf(
      withLeftExternal.data,
      withLeftExternal.info.width,
    );
    const rightExternalPinkPixels = countPinkPixelsByHalf(
      withRightExternal.data,
      withRightExternal.info.width,
    );
    const leftInternalPinkPixels = countPinkPixelsByHalf(
      withLeftInternal.data,
      withLeftInternal.info.width,
    );
    const rightInternalPinkPixels = countPinkPixelsByHalf(
      withRightInternal.data,
      withRightInternal.info.width,
    );
    const leftCompletePinkPixels = countPinkPixelsByHalf(
      withLeftComplete.data,
      withLeftComplete.info.width,
    );
    const rightCompletePinkPixels = countPinkPixelsByHalf(
      withRightComplete.data,
      withRightComplete.info.width,
    );
    const backNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 120, width: 300, height: 35 },
    );

    expect(
      countDarkPixelsInRegion(withoutTrim.data, withoutTrim.info.width, {
        x: 425,
        y: 345,
        width: 25,
        height: 45,
      }),
    ).toBeGreaterThan(15);
    expect(
      countDarkPixelsInRegion(withoutTrim.data, withoutTrim.info.width, {
        x: 450,
        y: 345,
        width: 25,
        height: 45,
      }),
    ).toBeGreaterThan(15);
    expect(
      countDifferentPixels(withoutTrim.data, withLeftExternal.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withRightExternal.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withLeftInternal.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withRightInternal.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withLeftComplete.data),
    ).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withoutTrim.data, withRightComplete.data),
    ).toBeGreaterThan(500);
    expect(leftExternalPinkPixels.left).toBeGreaterThan(
      leftExternalPinkPixels.right,
    );
    expect(rightExternalPinkPixels.right).toBeGreaterThan(
      rightExternalPinkPixels.left,
    );
    expect(leftInternalPinkPixels.left).toBeGreaterThan(
      leftInternalPinkPixels.right,
    );
    expect(rightInternalPinkPixels.right).toBeGreaterThan(
      rightInternalPinkPixels.left,
    );
    expect(leftCompletePinkPixels.left).toBeGreaterThan(
      leftCompletePinkPixels.right,
    );
    expect(rightCompletePinkPixels.right).toBeGreaterThan(
      rightCompletePinkPixels.left,
    );
    expect(backNeckPinkPixels).toBeGreaterThan(100);
  }, 20000);

  it("renderiza JDC con vivos lineales, completos interiores y cogotera recta", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-02-jdc.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5147,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLeftExternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2907,
            key: "cuello-v-lineal-externo-izquierdo",
            label: "Cuello V lineal externo izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightExternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 416,
            key: "cuello-v-lineal-externo-derecho",
            label: "Cuello V lineal externo derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLeftInternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2910,
            key: "cuello-v-lineal-interno-izquierdo",
            label: "Cuello V lineal interno izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightInternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 417,
            key: "cuello-v-lineal-interno-derecho",
            label: "Cuello V lineal interno derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLeftComplete = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2916,
            key: "cuello-v-completo-interior-izquierdo",
            label: "Cuello V Completo interior izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightComplete = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2913,
            key: "cuello-v-completo-interior-derecho",
            label: "Cuello V Completo interior derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5146,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftExternalPinkPixels = countPinkPixelsByHalf(
      withLeftExternal.data,
      withLeftExternal.info.width,
    );
    const rightExternalPinkPixels = countPinkPixelsByHalf(
      withRightExternal.data,
      withRightExternal.info.width,
    );
    const leftInternalPinkPixels = countPinkPixelsByHalf(
      withLeftInternal.data,
      withLeftInternal.info.width,
    );
    const rightInternalPinkPixels = countPinkPixelsByHalf(
      withRightInternal.data,
      withRightInternal.info.width,
    );
    const leftCompletePinkPixels = countPinkPixelsByHalf(
      withLeftComplete.data,
      withLeftComplete.info.width,
    );
    const rightCompletePinkPixels = countPinkPixelsByHalf(
      withRightComplete.data,
      withRightComplete.info.width,
    );
    const backNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 120, width: 300, height: 35 },
    );

    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(
      0,
    );
    expect(
      countDifferentPixels(withoutTrim.data, withLeftExternal.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withRightExternal.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withLeftInternal.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withRightInternal.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withLeftComplete.data),
    ).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withoutTrim.data, withRightComplete.data),
    ).toBeGreaterThan(500);
    expect(leftExternalPinkPixels.left).toBeGreaterThan(
      leftExternalPinkPixels.right,
    );
    expect(rightExternalPinkPixels.right).toBeGreaterThan(
      rightExternalPinkPixels.left,
    );
    expect(leftInternalPinkPixels.left).toBeGreaterThan(
      leftInternalPinkPixels.right,
    );
    expect(rightInternalPinkPixels.right).toBeGreaterThan(
      rightInternalPinkPixels.left,
    );
    expect(leftCompletePinkPixels.left).toBeGreaterThan(
      leftCompletePinkPixels.right,
    );
    expect(rightCompletePinkPixels.right).toBeGreaterThan(
      rightCompletePinkPixels.left,
    );
    expect(backNeckPinkPixels).toBeGreaterThan(100);
  }, 20000);

  it("renderiza 20-20 con vivos internos independientes y cogotera recta", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-50-20-20.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLeftInternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2910,
            key: "cuello-v-lineal-interno-izquierdo",
            label: "Cuello V lineal interno izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightInternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 417,
            key: "cuello-v-lineal-interno-derecho",
            label: "Cuello V lineal interno derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftPinkPixels = countPinkPixelsByHalf(
      withLeftInternal.data,
      withLeftInternal.info.width,
    );
    const rightPinkPixels = countPinkPixelsByHalf(
      withRightInternal.data,
      withRightInternal.info.width,
    );
    const leftCenterPinkPixels = countPinkPixelsInRegion(
      withLeftInternal.data,
      withLeftInternal.info.width,
      { x: 390, y: 210, width: 70, height: 90 },
    );
    const rightCenterPinkPixels = countPinkPixelsInRegion(
      withRightInternal.data,
      withRightInternal.info.width,
      { x: 475, y: 210, width: 70, height: 90 },
    );
    const leftOuterContourPinkPixels = countPinkPixelsInRegion(
      withLeftInternal.data,
      withLeftInternal.info.width,
      { x: 360, y: 210, width: 35, height: 90 },
    );
    const rightOuterContourPinkPixels = countPinkPixelsInRegion(
      withRightInternal.data,
      withRightInternal.info.width,
      { x: 535, y: 210, width: 35, height: 90 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const necklinePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 165, width: 300, height: 130 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withLeftInternal.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withRightInternal.data),
    ).toBeGreaterThan(100);
    expect(leftPinkPixels.left).toBeGreaterThan(100);
    expect(leftPinkPixels.left).toBeGreaterThan(leftPinkPixels.right);
    expect(rightPinkPixels.right).toBeGreaterThan(100);
    expect(rightPinkPixels.right).toBeGreaterThan(rightPinkPixels.left);
    expect(leftCenterPinkPixels).toBeGreaterThan(300);
    expect(rightCenterPinkPixels).toBeGreaterThan(250);
    expect(leftOuterContourPinkPixels).toBeLessThan(10);
    expect(rightOuterContourPinkPixels).toBeLessThan(10);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
    expect(necklinePinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza EL HATO sin bolsillos integrados y aplica BOLSILLO PRESILLAS por separado", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato.svg";
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato-lower-pocket.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withPresillasPocket = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
      }),
    );
    const withPresillasPocketUpperTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 419,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withPresillasPocketLowerTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 420,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-baja",
            label: "Bolsillos inferiores parte baja",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withPresillasPocketAuxiliaryTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 420,
            role: "auxiliaryPocket",
            key: "bolsillo-auxiliar",
            label: "Bolsillo auxiliar",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withCompleteCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello-completo",
            label: "Cuello completo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withHighCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 421,
            role: "upperNeck",
            key: "cuello-alto",
            label: "Cuello alto",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const highCollarPinkPixels = countPastelPinkPixelsInRegion(
      withHighCollar.data,
      withHighCollar.info.width,
      { x: 320, y: 110, width: 310, height: 120 },
    );
    const highCollarInnerOpeningPinkPixels = countPastelPinkPixelsInRegion(
      withHighCollar.data,
      withHighCollar.info.width,
      { x: 390, y: 130, width: 140, height: 45 },
    );
    const highCollarFrontOpeningPinkPixels = countPastelPinkPixelsInRegion(
      withHighCollar.data,
      withHighCollar.info.width,
      { x: 440, y: 190, width: 45, height: 28 },
    );
    const highCollarLowerVPinkPixels = countPastelPinkPixelsInRegion(
      withHighCollar.data,
      withHighCollar.info.width,
      { x: 390, y: 250, width: 150, height: 270 },
    );
    const completeCollarTopPinkPixels = countPastelPinkPixelsInRegion(
      withCompleteCollar.data,
      withCompleteCollar.info.width,
      { x: 320, y: 110, width: 310, height: 120 },
    );
    const completeCollarVPinkPixels = countPastelPinkPixelsInRegion(
      withCompleteCollar.data,
      withCompleteCollar.info.width,
      { x: 390, y: 250, width: 150, height: 270 },
    );
    const completeCollarButtonDarkPixels = countDarkPixelsInRegion(
      withCompleteCollar.data,
      withCompleteCollar.info.width,
      { x: 445, y: 430, width: 35, height: 90 },
    );
    const upperLowerPocketTrimPinkPixels = countPastelPinkPixelsInRegion(
      withPresillasPocketUpperTrim.data,
      withPresillasPocketUpperTrim.info.width,
      { x: 250, y: 680, width: 450, height: 250 },
    );
    const lowerLowerPocketTrimPinkPixels = countPastelPinkPixelsInRegion(
      withPresillasPocketLowerTrim.data,
      withPresillasPocketLowerTrim.info.width,
      { x: 250, y: 680, width: 450, height: 250 },
    );
    const auxiliaryLowerPocketTrimPinkPixels = countPastelPinkPixelsInRegion(
      withPresillasPocketAuxiliaryTrim.data,
      withPresillasPocketAuxiliaryTrim.info.width,
      { x: 250, y: 680, width: 450, height: 250 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countPurplePixels(withoutTrim.data)).toBe(0);
    expect(countPurplePixels(withPresillasPocket.data)).toBe(0);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(countDifferentPixels(withoutTrim.data, withBackNeck.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withPresillasPocket.data),
    ).toBeGreaterThan(500);
    expect(
      countDifferentPixels(
        withPresillasPocket.data,
        withPresillasPocketUpperTrim.data,
      ),
    ).toBe(0);
    expect(
      countDifferentPixels(
        withPresillasPocket.data,
        withPresillasPocketLowerTrim.data,
      ),
    ).toBe(0);
    expect(
      countDifferentPixels(
        withPresillasPocket.data,
        withPresillasPocketAuxiliaryTrim.data,
      ),
    ).toBeGreaterThan(100);
    expect(upperLowerPocketTrimPinkPixels).toBe(0);
    expect(lowerLowerPocketTrimPinkPixels).toBe(0);
    expect(auxiliaryLowerPocketTrimPinkPixels).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withHighCollar.data),
    ).toBeGreaterThan(100);
    expect(highCollarPinkPixels).toBeGreaterThan(250);
    expect(highCollarInnerOpeningPinkPixels).toBeLessThan(200);
    expect(highCollarFrontOpeningPinkPixels).toBeLessThan(80);
    expect(highCollarLowerVPinkPixels).toBeLessThan(80);
    expect(
      countDifferentPixels(withoutTrim.data, withCompleteCollar.data),
    ).toBeGreaterThan(100);
    expect(completeCollarTopPinkPixels).toBeGreaterThan(250);
    expect(completeCollarVPinkPixels).toBeGreaterThan(250);
    expect(completeCollarButtonDarkPixels).toBeGreaterThan(80);
  }, 20000);

  it("ajusta las mangas Original al contorno de EL HATO", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato.svg";
    const withSleeveTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7401,
            key: "manga-lineal-superior",
            label: "Manga lineal superior",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 7402,
            key: "manga-lineal-inferior",
            label: "Manga lineal inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftSleevePinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 84, y: 440, width: 155, height: 160 },
    );
    const rightSleevePinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 680, y: 438, width: 150, height: 145 },
    );
    const leftBodyStrayPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 250, y: 575, width: 110, height: 120 },
    );
    const rightOutsideStrayPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 825, y: 510, width: 70, height: 150 },
    );
    const rightChestStrayPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 575, y: 455, width: 100, height: 110 },
    );

    expect(leftSleevePinkPixels).toBeGreaterThan(900);
    expect(rightSleevePinkPixels).toBeGreaterThan(900);
    expect(leftBodyStrayPinkPixels).toBeLessThan(80);
    expect(rightOutsideStrayPinkPixels).toBeLessThan(80);
    expect(rightChestStrayPinkPixels).toBeLessThan(80);
  }, 20000);

  it("oculta las lineas de manga Original hasta seleccionar su vivo", async () => {
    const originalSleevesAssetPath =
      "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg";
    const withoutSleeveModel = await readRawPng(
      await renderDesignImage(baseScene),
    );
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        garmentDetailAssetPaths: [originalSleevesAssetPath],
      }),
    );
    const withUpperTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        garmentDetailAssetPaths: [originalSleevesAssetPath],
        trimSections: [
          {
            valueId: 7401,
            key: "manga-lineal-superior",
            label: "Manga lineal superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        garmentDetailAssetPaths: [originalSleevesAssetPath],
        trimSections: [
          {
            valueId: 7402,
            key: "manga-lineal-inferior",
            label: "Manga lineal inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );

    expect(
      countDifferentPixels(withoutSleeveModel.data, withoutTrim.data),
    ).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withoutTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withUpperTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(500);
  }, 20000);

  it("ajusta las mangas Original al contorno de ESTRELLA", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-22-estrella.svg";
    const withSleeveTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7401,
            key: "manga-lineal-superior",
            label: "Manga lineal superior",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 7402,
            key: "manga-lineal-inferior",
            label: "Manga lineal inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftSleevePinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 82, y: 430, width: 165, height: 175 },
    );
    const rightSleevePinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 675, y: 425, width: 150, height: 165 },
    );
    const leftBodyStrayPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 250, y: 565, width: 115, height: 120 },
    );
    const rightChestStrayPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 570, y: 445, width: 100, height: 120 },
    );

    expect(leftSleevePinkPixels).toBeGreaterThan(900);
    expect(rightSleevePinkPixels).toBeGreaterThan(900);
    expect(leftBodyStrayPinkPixels).toBeLessThan(80);
    expect(rightChestStrayPinkPixels).toBeLessThan(80);
  }, 20000);

  it("ajusta la manga derecha Original al contorno de MARIPOSA DIVIDIDO", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-04.svg";
    const withSleeveTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7401,
            key: "manga-lineal-superior",
            label: "Manga lineal superior",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 7402,
            key: "manga-lineal-inferior",
            label: "Manga lineal inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftSleevePinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 155, y: 450, width: 130, height: 125 },
    );
    const rightSleevePinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 645, y: 450, width: 115, height: 120 },
    );
    const oldRightInnerStrayPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 625, y: 520, width: 18, height: 38 },
    );

    expect(leftSleevePinkPixels).toBeGreaterThan(700);
    expect(rightSleevePinkPixels).toBeGreaterThan(700);
    expect(oldRightInnerStrayPinkPixels).toBeLessThan(80);
  }, 20000);

  it("ajusta la manga derecha Original al contorno de PUNTADAS", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-07.svg";
    const withSleeveTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7401,
            key: "manga-lineal-superior",
            label: "Manga lineal superior",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 7402,
            key: "manga-lineal-inferior",
            label: "Manga lineal inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftSleevePinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 155, y: 450, width: 130, height: 125 },
    );
    const rightSleevePinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 645, y: 450, width: 115, height: 120 },
    );
    const oldRightInnerStrayPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 625, y: 520, width: 18, height: 38 },
    );

    expect(leftSleevePinkPixels).toBeGreaterThan(700);
    expect(rightSleevePinkPixels).toBeGreaterThan(700);
    expect(oldRightInnerStrayPinkPixels).toBeLessThan(80);
  }, 20000);

  it("pega las mangas Original al borde real de CUELLO V", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg";
    const withLowerSleeveTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7402,
            key: "manga-lineal-inferior",
            label: "Manga lineal inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftInnerEdgePinkPixels = countPastelPinkPixelsInRegion(
      withLowerSleeveTrim.data,
      withLowerSleeveTrim.info.width,
      { x: 200, y: 545, width: 35, height: 35 },
    );
    const rightInnerEdgePinkPixels = countPastelPinkPixelsInRegion(
      withLowerSleeveTrim.data,
      withLowerSleeveTrim.info.width,
      { x: 675, y: 515, width: 40, height: 40 },
    );

    expect(leftInnerEdgePinkPixels).toBeGreaterThan(100);
    expect(rightInnerEdgePinkPixels).toBeGreaterThan(100);
  }, 20000);

  it("usa las mangas Original alineadas a PUNTADAS en modelos solicitados", async () => {
    const alignedNeckAssetPaths = [
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-02-jdc.svg",
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-05.svg",
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-15-presillas.svg",
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-21-deportivo.svg",
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-40-mariposa.svg",
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-41-matrioska.svg",
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-42.svg",
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-43.svg",
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-44-cucuta.svg",
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-50-20-20.svg",
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia.svg",
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-12-cherokee.svg",
    ];

    for (const neckAssetPath of alignedNeckAssetPaths) {
      const withSleeveTrim = await readRawPng(
        await renderDesignImage({
          ...baseScene,
          neckAssetPath,
          garmentDetailAssetPaths: [
            "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
          ],
          trimSections: [
            {
              valueId: 7401,
              key: "manga-lineal-superior",
              label: "Manga lineal superior",
              colorHex: "#f4c7cc",
            },
            {
              valueId: 7402,
              key: "manga-lineal-inferior",
              label: "Manga lineal inferior",
              colorHex: "#f4c7cc",
            },
          ],
        }),
      );
      const leftSleevePinkPixels = countPastelPinkPixelsInRegion(
        withSleeveTrim.data,
        withSleeveTrim.info.width,
        { x: 155, y: 450, width: 130, height: 125 },
      );
      const rightSleevePinkPixels = countPastelPinkPixelsInRegion(
        withSleeveTrim.data,
        withSleeveTrim.info.width,
        { x: 645, y: 450, width: 115, height: 120 },
      );
      const oldRightInnerStrayPinkPixels = countPastelPinkPixelsInRegion(
        withSleeveTrim.data,
        withSleeveTrim.info.width,
        { x: 625, y: 520, width: 18, height: 38 },
      );

      expect(leftSleevePinkPixels, neckAssetPath).toBeGreaterThan(700);
      expect(rightSleevePinkPixels, neckAssetPath).toBeGreaterThan(700);
      expect(oldRightInnerStrayPinkPixels, neckAssetPath).toBeLessThan(80);
    }
  }, 40000);

  it("mantiene los vivos de mangas pegados al borde en los modelos solicitados", async () => {
    const requestedNeckAssetPaths = [
      ["CUCUTA", "blouse-model-44-cucuta.svg"],
      ["ENFERMERA UB", "blouse-model-43.svg"],
      ["PICOS", "blouse-model-12-cherokee.svg"],
      ["MATRIOSKA", "blouse-model-41-matrioska.svg"],
      ["MARIPOSA", "blouse-model-40-mariposa.svg"],
      ["20-20", "blouse-model-50-20-20.svg"],
      ["DEPORTIVO", "blouse-model-21-deportivo.svg"],
      ["POLO", "blouse-model-23-polo.svg"],
      ["CRUZADO", "blouse-model-30.svg"],
      ["BOTONES", "blouse-model-24-botones.svg"],
      ["20-21", "blouse-model-25-20-21.svg"],
      ["CUELLO REDONDO", "blouse-model-26-cuello-redondo.svg"],
      ["CREMALLERA", "blouse-model-27-cremallera.svg"],
      ["MODELO 29", "blouse-model-28-modelo-29.svg"],
      ["PEDAGOGIA", "blouse-model-29-pedagogia.svg"],
      ["ORIENTAL", "blouse-model-33-oriental.svg"],
      [
        "CUELLO ALTO CON CREMALLERA",
        "blouse-model-34-cuello-alto-cremallera.svg",
      ],
      ["CIRUJIA", "blouse-model-37-cirugia.svg"],
      ["FISIOPRACTICAS", "blouse-model-11-fisiopracticas.svg"],
      ["P-PAIPILLA", "blouse-model-13-p-paipilla.svg"],
    ] as const;

    for (const [label, fileName] of requestedNeckAssetPaths) {
      const withSleeveTrim = await readRawPng(
        await renderDesignImage({
          ...baseScene,
          neckAssetPath: `assets/catalog/blusa-antifluido-t180/svg-clean/${fileName}`,
          garmentDetailAssetPaths: [
            "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
          ],
          trimSections: [
            {
              valueId: 7401,
              key: "manga-lineal-superior",
              label: "Manga lineal superior",
              colorHex: "#f4c7cc",
            },
            {
              valueId: 7402,
              key: "manga-lineal-inferior",
              label: "Manga lineal inferior",
              colorHex: "#f4c7cc",
            },
            {
              valueId: 7403,
              key: "manga-rellena",
              label: "Manga rellena",
              colorHex: "#f4c7cc",
            },
          ],
        }),
      );
      const leftSleevePixels = countPastelPinkPixelsInRegion(
        withSleeveTrim.data,
        withSleeveTrim.info.width,
        { x: 80, y: 430, width: 175, height: 160 },
      );
      const rightSleevePixels = countPastelPinkPixelsInRegion(
        withSleeveTrim.data,
        withSleeveTrim.info.width,
        { x: 675, y: 430, width: 165, height: 155 },
      );

      expect(leftSleevePixels, label).toBeGreaterThan(1500);
      expect(rightSleevePixels, label).toBeGreaterThan(1200);
    }
  }, 80000);

  it("mantiene el relleno de mangas de 20-19 pegado al borde del modelo", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-10.svg";
    const withSleeveFill = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7403,
            key: "manga-rellena",
            label: "Manga rellena",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withSleeveLines = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7401,
            key: "manga-lineal-superior",
            label: "Manga lineal superior",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 7402,
            key: "manga-lineal-inferior",
            label: "Manga lineal inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftSleeveFillPixels = countPastelPinkPixelsInRegion(
      withSleeveFill.data,
      withSleeveFill.info.width,
      { x: 85, y: 440, width: 135, height: 130 },
    );
    const rightSleeveFillPixels = countPastelPinkPixelsInRegion(
      withSleeveFill.data,
      withSleeveFill.info.width,
      { x: 685, y: 440, width: 125, height: 120 },
    );
    const oldLeftProtrusionPixels = countPastelPinkPixelsInRegion(
      withSleeveFill.data,
      withSleeveFill.info.width,
      { x: 125, y: 570, width: 85, height: 8 },
    );
    const oldRightProtrusionPixels = countPastelPinkPixelsInRegion(
      withSleeveFill.data,
      withSleeveFill.info.width,
      { x: 710, y: 545, width: 85, height: 8 },
    );
    const leftSleeveLinePixels = countPastelPinkPixelsInRegion(
      withSleeveLines.data,
      withSleeveLines.info.width,
      { x: 90, y: 440, width: 140, height: 135 },
    );
    const rightSleeveLinePixels = countPastelPinkPixelsInRegion(
      withSleeveLines.data,
      withSleeveLines.info.width,
      { x: 690, y: 440, width: 130, height: 120 },
    );
    const oldLeftHighLinePixels = countPastelPinkPixelsInRegion(
      withSleeveLines.data,
      withSleeveLines.info.width,
      { x: 95, y: 430, width: 35, height: 14 },
    );
    const oldRightOuterLinePixels = countPastelPinkPixelsInRegion(
      withSleeveLines.data,
      withSleeveLines.info.width,
      { x: 814, y: 445, width: 15, height: 20 },
    );

    expect(leftSleeveFillPixels).toBeGreaterThan(1500);
    expect(rightSleeveFillPixels).toBeGreaterThan(1200);
    expect(oldLeftProtrusionPixels).toBeLessThan(20);
    expect(oldRightProtrusionPixels).toBeLessThan(20);
    expect(leftSleeveLinePixels).toBeGreaterThan(700);
    expect(rightSleeveLinePixels).toBeGreaterThan(700);
    expect(oldLeftHighLinePixels).toBeLessThan(25);
    expect(oldRightOuterLinePixels).toBeLessThan(25);
  }, 20000);

  it("mantiene los vivos de mangas de JEAN pegados al borde del modelo", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-42.svg";
    const withSleeveFill = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7403,
            key: "manga-rellena",
            label: "Manga rellena",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withSleeveLines = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7401,
            key: "manga-lineal-superior",
            label: "Manga lineal superior",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 7402,
            key: "manga-lineal-inferior",
            label: "Manga lineal inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftSleeveFillPixels = countPastelPinkPixelsInRegion(
      withSleeveFill.data,
      withSleeveFill.info.width,
      { x: 85, y: 435, width: 145, height: 135 },
    );
    const rightSleeveFillPixels = countPastelPinkPixelsInRegion(
      withSleeveFill.data,
      withSleeveFill.info.width,
      { x: 680, y: 435, width: 140, height: 125 },
    );
    const oldRightOuterFillPixels = countPastelPinkPixelsInRegion(
      withSleeveFill.data,
      withSleeveFill.info.width,
      { x: 814, y: 440, width: 18, height: 28 },
    );
    const leftSleeveLinePixels = countPastelPinkPixelsInRegion(
      withSleeveLines.data,
      withSleeveLines.info.width,
      { x: 85, y: 435, width: 150, height: 140 },
    );
    const rightSleeveLinePixels = countPastelPinkPixelsInRegion(
      withSleeveLines.data,
      withSleeveLines.info.width,
      { x: 680, y: 435, width: 145, height: 125 },
    );
    const oldRightOuterLinePixels = countPastelPinkPixelsInRegion(
      withSleeveLines.data,
      withSleeveLines.info.width,
      { x: 814, y: 440, width: 18, height: 28 },
    );

    expect(leftSleeveFillPixels).toBeGreaterThan(1500);
    expect(rightSleeveFillPixels).toBeGreaterThan(1200);
    expect(oldRightOuterFillPixels).toBeLessThan(25);
    expect(leftSleeveLinePixels).toBeGreaterThan(700);
    expect(rightSleeveLinePixels).toBeGreaterThan(700);
    expect(oldRightOuterLinePixels).toBeLessThan(25);
  }, 20000);

  it("mantiene el relleno de mangas de PRESILLAS dentro del contorno de PUNTADAS", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-15-presillas.svg";
    const withSleeveFill = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7403,
            key: "manga-rellena",
            label: "Manga rellena",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftSleeveFillPixels = countPastelPinkPixelsInRegion(
      withSleeveFill.data,
      withSleeveFill.info.width,
      { x: 105, y: 445, width: 120, height: 110 },
    );
    const rightSleeveFillPixels = countPastelPinkPixelsInRegion(
      withSleeveFill.data,
      withSleeveFill.info.width,
      { x: 705, y: 445, width: 115, height: 95 },
    );
    const oldLeftProtrusionPixels = countPastelPinkPixelsInRegion(
      withSleeveFill.data,
      withSleeveFill.info.width,
      { x: 224, y: 560, width: 28, height: 16 },
    );
    const oldRightProtrusionPixels = countPastelPinkPixelsInRegion(
      withSleeveFill.data,
      withSleeveFill.info.width,
      { x: 662, y: 535, width: 28, height: 16 },
    );

    expect(leftSleeveFillPixels).toBeGreaterThan(1500);
    expect(rightSleeveFillPixels).toBeGreaterThan(1200);
    expect(oldLeftProtrusionPixels).toBeLessThan(20);
    expect(oldRightProtrusionPixels).toBeLessThan(20);
  }, 20000);

  it("pega los lineales inferiores de PRESILLAS al borde de PUNTADAS", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-15-presillas.svg";
    const withLowerSleeveTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7402,
            key: "manga-lineal-inferior",
            label: "Manga lineal inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftAlignedPixels = countPastelPinkPixelsInRegion(
      withLowerSleeveTrim.data,
      withLowerSleeveTrim.info.width,
      { x: 145, y: 500, width: 40, height: 30 },
    );
    const rightAlignedPixels = countPastelPinkPixelsInRegion(
      withLowerSleeveTrim.data,
      withLowerSleeveTrim.info.width,
      { x: 700, y: 530, width: 40, height: 30 },
    );
    const oldLeftOutsidePixels = countPastelPinkPixelsInRegion(
      withLowerSleeveTrim.data,
      withLowerSleeveTrim.info.width,
      { x: 224, y: 560, width: 28, height: 16 },
    );
    const oldRightOutsidePixels = countPastelPinkPixelsInRegion(
      withLowerSleeveTrim.data,
      withLowerSleeveTrim.info.width,
      { x: 662, y: 535, width: 28, height: 16 },
    );

    expect(leftAlignedPixels).toBeGreaterThan(80);
    expect(rightAlignedPixels).toBeGreaterThan(80);
    expect(oldLeftOutsidePixels).toBeLessThan(20);
    expect(oldRightOutsidePixels).toBeLessThan(20);
  }, 20000);

  it("ajusta ambas mangas Original al contorno de CUELLO ALTO", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-08.svg";
    const withSleeveTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7401,
            key: "manga-lineal-superior",
            label: "Manga lineal superior",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 7402,
            key: "manga-lineal-inferior",
            label: "Manga lineal inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftSleevePinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 155, y: 450, width: 135, height: 135 },
    );
    const rightSleevePinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 645, y: 450, width: 125, height: 130 },
    );
    const leftBodyStrayPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 285, y: 545, width: 45, height: 85 },
    );
    const rightBodyStrayPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 600, y: 535, width: 45, height: 90 },
    );

    expect(leftSleevePinkPixels).toBeGreaterThan(700);
    expect(rightSleevePinkPixels).toBeGreaterThan(700);
    expect(leftBodyStrayPinkPixels).toBeLessThan(80);
    expect(rightBodyStrayPinkPixels).toBeLessThan(80);
  }, 20000);

  it("ajusta ambas mangas Original al contorno de OVALADO", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-09.svg";
    const withSleeveTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        garmentDetailAssetPaths: [
          "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
        ],
        trimSections: [
          {
            valueId: 7401,
            key: "manga-lineal-superior",
            label: "Manga lineal superior",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 7402,
            key: "manga-lineal-inferior",
            label: "Manga lineal inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftSleevePinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 155, y: 450, width: 135, height: 135 },
    );
    const rightSleevePinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 645, y: 450, width: 125, height: 130 },
    );
    const leftBodyStrayPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 285, y: 545, width: 45, height: 85 },
    );
    const rightBodyStrayPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTrim.data,
      withSleeveTrim.info.width,
      { x: 600, y: 535, width: 45, height: 90 },
    );

    expect(leftSleevePinkPixels).toBeGreaterThan(700);
    expect(rightSleevePinkPixels).toBeGreaterThan(700);
    expect(leftBodyStrayPinkPixels).toBeLessThan(80);
    expect(rightBodyStrayPinkPixels).toBeLessThan(80);
  }, 20000);

  it("renderiza PEDAGOGIA sin vivos de cuello y conserva cogotera", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-29-pedagogia.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withHighCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 421,
            role: "upperNeck",
            key: "cuello-alto",
            label: "Cuello alto",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const necklinePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 165, width: 300, height: 130 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countDifferentPixels(withoutTrim.data, withHighCollar.data)).toBe(0);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
    expect(necklinePinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza CUELLO REDONDO con color base, vivo de cuello y cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-26-cuello-redondo.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const collarPinkPixels = countPastelPinkPixelsInRegion(
      withCollar.data,
      withCollar.info.width,
      { x: 320, y: 110, width: 280, height: 170 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const necklinePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 165, width: 300, height: 130 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countNeonGreenPixels(withoutTrim.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withCollar.data),
    ).toBeGreaterThan(100);
    expect(collarPinkPixels).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
    expect(necklinePinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza JEAN con cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-42.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftCurveEndPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 292, y: 135, width: 42, height: 22 },
    );
    const rightCurveEndPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 565, y: 135, width: 42, height: 22 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(leftCurveEndPinkPixels).toBeGreaterThan(20);
    expect(rightCurveEndPinkPixels).toBeGreaterThan(20);
  }, 20000);

  it("renderiza CRUZADO con cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-30.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftLowerCurvePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 292, y: 150, width: 42, height: 26 },
    );
    const rightLowerCurvePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 565, y: 150, width: 42, height: 26 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(leftLowerCurvePinkPixels).toBeGreaterThan(20);
    expect(rightLowerCurvePinkPixels).toBeGreaterThan(20);
  }, 20000);

  it("renderiza CRUZADO sin vivos gruesos por defecto y activa sus líneas de cuello", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-30.svg";
    const collarRegion = { x: 290, y: 125, width: 330, height: 285 };
    const leftThickRegion = { x: 300, y: 125, width: 160, height: 285 };
    const rightThickRegion = { x: 430, y: 125, width: 180, height: 285 };
    const lowerCollarRegion = { x: 420, y: 330, width: 75, height: 70 };
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withLeftThick = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 6111,
            key: "cuello-interior-grueso-izquierdo",
            label: "Cuello Interior grueso izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightThick = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 6112,
            key: "cuello-interior-grueso-derecho",
            label: "Cuello Interior grueso derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLineTrims = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 6113,
            key: "cuello-v-lineal-externo-izquierdo",
            label: "Cuello V lineal externo izquierdo",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 6114,
            key: "cuello-v-lineal-externo-derecho",
            label: "Cuello V lineal externo derecho",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 6115,
            key: "cuello-v-lineal-interno-izquierdo",
            label: "Cuello V lineal interno izquierdo",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 6116,
            key: "cuello-v-lineal-interno-derecho",
            label: "Cuello V lineal interno derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLeftComplete = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 6117,
            key: "cuello-v-completo-interior-izquierdo",
            label: "Cuello V Completo interior izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightComplete = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 6118,
            key: "cuello-v-completo-interior-derecho",
            label: "Cuello V Completo interior derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 6119,
            key: "cuello-inferior",
            label: "Cuello inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );

    expect(
      countFuchsiaPixelsInRegion(
        withoutTrim.data,
        withoutTrim.info.width,
        collarRegion,
      ),
    ).toBeLessThan(5);
    expect(
      countPastelPinkPixelsInRegion(
        withLeftThick.data,
        withLeftThick.info.width,
        leftThickRegion,
      ),
    ).toBeGreaterThan(150);
    expect(
      countPastelPinkPixelsInRegion(
        withRightThick.data,
        withRightThick.info.width,
        rightThickRegion,
      ),
    ).toBeGreaterThan(150);
    expect(
      countPastelPinkPixelsInRegion(
        withLeftComplete.data,
        withLeftComplete.info.width,
        leftThickRegion,
      ),
    ).toBeGreaterThan(1200);
    expect(
      countPastelPinkPixelsInRegion(
        withRightComplete.data,
        withRightComplete.info.width,
        rightThickRegion,
      ),
    ).toBeGreaterThan(1200);
    expect(
      countPastelPinkPixelsInRegion(
        withLowerCollar.data,
        withLowerCollar.info.width,
        lowerCollarRegion,
      ),
    ).toBeGreaterThan(80);
    expect(
      countPastelPinkPixelsInRegion(
        withLineTrims.data,
        withLineTrims.info.width,
        collarRegion,
      ),
    ).toBeGreaterThan(250);
  }, 20000);

  it("renderiza ESTRELLA con vivo de cuello, aletas y cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-22-estrella.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withFlaps = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2877,
            key: "aletas",
            label: "Aletas",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const collarPinkPixels = countPastelPinkPixelsInRegion(
      withCollar.data,
      withCollar.info.width,
      { x: 300, y: 110, width: 310, height: 260 },
    );
    const collarTopArcPinkPixels = countPastelPinkPixelsInRegion(
      withCollar.data,
      withCollar.info.width,
      { x: 330, y: 90, width: 240, height: 80 },
    );
    const flapPinkPixels = countPastelPinkPixelsInRegion(
      withFlaps.data,
      withFlaps.info.width,
      { x: 295, y: 135, width: 320, height: 130 },
    );
    const baseFlapPinkPixels = countPastelPinkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 295, y: 135, width: 320, height: 130 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const necklinePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 165, width: 300, height: 130 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(baseFlapPinkPixels).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withCollar.data),
    ).toBeGreaterThan(100);
    expect(collarPinkPixels).toBeGreaterThan(500);
    expect(collarTopArcPinkPixels).toBeLessThan(20);
    expect(
      countDifferentPixels(withoutTrim.data, withFlaps.data),
    ).toBeGreaterThan(100);
    expect(flapPinkPixels).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
    expect(necklinePinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza BOTONES con color base, vivo de cuello y cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-24-botones.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const collarPinkPixels = countPastelPinkPixelsInRegion(
      withCollar.data,
      withCollar.info.width,
      { x: 310, y: 110, width: 300, height: 560 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const necklinePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 165, width: 300, height: 130 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countSourceTealPixels(withoutTrim.data)).toBe(0);
    expect(countYellowPixels(withoutTrim.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withCollar.data),
    ).toBeGreaterThan(100);
    expect(collarPinkPixels).toBeGreaterThan(1_000);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
    expect(necklinePinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza POLO solo con color base y conserva cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-23-polo.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const necklinePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 165, width: 300, height: 130 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countYellowPixels(withoutTrim.data)).toBe(0);
    expect(countSourceTealPixels(withoutTrim.data)).toBe(0);
    expect(countOrangePixels(withoutTrim.data)).toBe(0);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
    expect(necklinePinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza DEPORTIVO solo con color base y conserva cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-21-deportivo.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const fixedGrayPixels = countNeutralGrayPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 330, y: 185, width: 240, height: 220 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const necklinePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 165, width: 300, height: 130 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(fixedGrayPixels).toBeLessThan(300);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
    expect(necklinePinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza MARIPOSA sin bolsillos, sin vivo de cuello y con cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-40-mariposa.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const lowerPocketInteriorInk = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 335, y: 650, width: 230, height: 260 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const necklinePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 165, width: 300, height: 130 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(lowerPocketInteriorInk).toBeLessThan(30);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
    expect(necklinePinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza MARIPOSA DIVIDIDO con bordes superior e inferior y cogotera recta", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-04.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5147,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withUpperDivided = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 7011,
            role: "upperNeck",
            key: "cuello-borde-dividido-superior",
            label: "Cuello Borde Dividido superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerDivided = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 7012,
            role: "lowerNeck",
            key: "cuello-borde-dividido-inferior",
            label: "Cuello Borde Dividido inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5146,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const upperDividedPinkPixels = countPastelPinkPixelsInRegion(
      withUpperDivided.data,
      withUpperDivided.info.width,
      { x: 285, y: 115, width: 330, height: 170 },
    );
    const lowerDividedPinkPixels = countPastelPinkPixelsInRegion(
      withLowerDivided.data,
      withLowerDivided.info.width,
      { x: 335, y: 235, width: 230, height: 180 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const fixedInnerVDarkPixels = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 440, y: 375, width: 22, height: 28 },
    );
    const defaultUpperDividedDarkPixels = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 285, y: 115, width: 330, height: 170 },
    );
    const defaultLowerDividedDarkPixels = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 335, y: 235, width: 230, height: 180 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(fixedInnerVDarkPixels).toBeGreaterThan(10);
    expect(defaultUpperDividedDarkPixels).toBeGreaterThan(400);
    expect(defaultLowerDividedDarkPixels).toBeGreaterThan(400);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withUpperDivided.data),
    ).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withoutTrim.data, withLowerDivided.data),
    ).toBeGreaterThan(500);
    expect(upperDividedPinkPixels).toBeGreaterThan(400);
    expect(lowerDividedPinkPixels).toBeGreaterThan(400);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
  }, 20000);

  it("renderiza MODELO 29 con bordes divididos y cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-28-modelo-29.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5147,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withUpperDivided = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 7011,
            role: "upperNeck",
            key: "cuello-borde-dividido-superior",
            label: "Cuello Borde Dividido superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerDivided = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 7012,
            role: "lowerNeck",
            key: "cuello-borde-dividido-inferior",
            label: "Cuello Borde Dividido inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5146,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const upperDividedPinkPixels = countPastelPinkPixelsInRegion(
      withUpperDivided.data,
      withUpperDivided.info.width,
      { x: 365, y: 250, width: 140, height: 95 },
    );
    const lowerDividedPinkPixels = countPastelPinkPixelsInRegion(
      withLowerDivided.data,
      withLowerDivided.info.width,
      { x: 425, y: 260, width: 145, height: 105 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withUpperDivided.data),
    ).toBeGreaterThan(250);
    expect(
      countDifferentPixels(withoutTrim.data, withLowerDivided.data),
    ).toBeGreaterThan(500);
    expect(upperDividedPinkPixels).toBeGreaterThan(200);
    expect(lowerDividedPinkPixels).toBeGreaterThan(450);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
  }, 20000);

  it("renderiza MATRIOSKA con vivo de Cuello interno y cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-41-matrioska.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withInnerCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2901,
            key: "cuello-interno",
            label: "Cuello interno",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const innerCollarPinkPixels = countPastelPinkPixelsInRegion(
      withInnerCollar.data,
      withInnerCollar.info.width,
      { x: 300, y: 110, width: 320, height: 270 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const necklinePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 165, width: 300, height: 130 },
    );
    const fixedCollarDarkPixels = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 300, y: 120, width: 320, height: 260 },
    );
    const bodyBaseColorPixels = countBaseColorPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 330, y: 380, width: 260, height: 420 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countPurplePixels(withoutTrim.data)).toBe(0);
    expect(fixedCollarDarkPixels).toBeLessThan(5000);
    expect(bodyBaseColorPixels).toBeGreaterThan(20000);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withInnerCollar.data),
    ).toBeGreaterThan(100);
    expect(innerCollarPinkPixels).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
    expect(necklinePinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza CUCUTA con vivo de Cuello interno y cogotera especial", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-44-cucuta.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withInnerCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2901,
            key: "cuello-interno",
            label: "Cuello interno",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const innerCollarPinkPixels = countPastelPinkPixelsInRegion(
      withInnerCollar.data,
      withInnerCollar.info.width,
      { x: 420, y: 190, width: 90, height: 220 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 100, width: 300, height: 120 },
    );
    const bodyBaseColorPixels = countBaseColorPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 330, y: 380, width: 260, height: 420 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(bodyBaseColorPixels).toBeGreaterThan(20000);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withInnerCollar.data),
    ).toBeGreaterThan(100);
    expect(innerCollarPinkPixels).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
  }, 20000);

  it("renderiza ENFERMERA UB con Cuello completo en lineas y cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-43.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5147,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withCompleteCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5154,
            role: "upperNeck",
            key: "cuello-completo",
            label: "Cuello completo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5146,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const collarPinkPixels = countPastelPinkPixelsInRegion(
      withCompleteCollar.data,
      withCompleteCollar.info.width,
      { x: 240, y: 95, width: 430, height: 430 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const lowerHorizontalPinkPixels = countPastelPinkPixelsInRegion(
      withCompleteCollar.data,
      withCompleteCollar.info.width,
      { x: 560, y: 470, width: 110, height: 40 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withCompleteCollar.data),
    ).toBeGreaterThan(100);
    expect(collarPinkPixels).toBeGreaterThan(500);
    expect(lowerHorizontalPinkPixels).toBeLessThan(120);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
  }, 20000);

  it("renderiza 20-21 con vivos externos independientes y cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-25-20-21.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withLeftExternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2907,
            key: "cuello-v-lineal-externo-izquierdo",
            label: "Cuello V lineal externo izquierdo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRightExternal = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 416,
            key: "cuello-v-lineal-externo-derecho",
            label: "Cuello V lineal externo derecho",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const basePinkPixels = countPastelPinkPixelsByHalf(
      withoutTrim.data,
      withoutTrim.info.width,
    );
    const leftPinkPixels = countPastelPinkPixelsByHalf(
      withLeftExternal.data,
      withLeftExternal.info.width,
    );
    const rightPinkPixels = countPastelPinkPixelsByHalf(
      withRightExternal.data,
      withRightExternal.info.width,
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const necklinePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 165, width: 300, height: 130 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(basePinkPixels.left + basePinkPixels.right).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withLeftExternal.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withRightExternal.data),
    ).toBeGreaterThan(100);
    expect(leftPinkPixels.left).toBeGreaterThan(100);
    expect(leftPinkPixels.left).toBeGreaterThan(leftPinkPixels.right);
    expect(rightPinkPixels.right).toBeGreaterThan(100);
    expect(rightPinkPixels.right).toBeGreaterThan(rightPinkPixels.left);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
    expect(necklinePinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza CREMALLERA sin vivos de cuello y con cogotera ovalada", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-27-cremallera.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withHighCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 421,
            role: "upperNeck",
            key: "cuello-alto",
            label: "Cuello alto",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withGenericCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 415,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const necklinePinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 300, y: 165, width: 300, height: 130 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countDifferentPixels(withoutTrim.data, withHighCollar.data)).toBe(0);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
    expect(necklinePinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza ORIENTAL sin vivos de cuello y colorea RIBETE VERTICAL solo por vivo", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-33-oriental.svg";
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-33-oriental-lower-pocket.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withRibetePocket = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
      }),
    );
    const withHighCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 421,
            role: "upperNeck",
            key: "cuello-alto",
            label: "Cuello alto",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withPocketTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5150,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const fixedPocketPinkPixels = countPastelPinkPixelsByHalf(
      withRibetePocket.data,
      withRibetePocket.info.width,
    );
    const livePocketPinkPixels = countPastelPinkPixelsByHalf(
      withPocketTrim.data,
      withPocketTrim.info.width,
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countDifferentPixels(withoutTrim.data, withHighCollar.data)).toBe(0);
    expect(countDifferentPixels(withoutTrim.data, withBackNeck.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withRibetePocket.data),
    ).toBeGreaterThan(500);
    expect(fixedPocketPinkPixels.left + fixedPocketPinkPixels.right).toBe(0);
    expect(
      countDifferentPixels(withRibetePocket.data, withPocketTrim.data),
    ).toBeGreaterThan(100);
    expect(livePocketPinkPixels.left).toBeGreaterThan(100);
    expect(livePocketPinkPixels.right).toBeGreaterThan(100);
  }, 20000);

  it("renderiza COSTURA con vivos independientes para superior, baja y auxiliar", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-18-costura-lower-pocket.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withUpperTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5150,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5153,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-baja",
            label: "Bolsillos inferiores parte baja",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withAuxiliaryTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5154,
            role: "auxiliaryPocket",
            key: "bolsillo-auxiliar",
            label: "Bolsillo auxiliar",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const upperLeftPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 260, y: 708, width: 180, height: 55 },
    );
    const upperRightPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 485, y: 690, width: 190, height: 55 },
    );
    const lowerLeftPinkPixels = countPastelPinkPixelsInRegion(
      withLowerTrim.data,
      withLowerTrim.info.width,
      { x: 260, y: 708, width: 180, height: 55 },
    );
    const lowerRightPinkPixels = countPastelPinkPixelsInRegion(
      withLowerTrim.data,
      withLowerTrim.info.width,
      { x: 485, y: 708, width: 190, height: 55 },
    );
    const auxiliaryLeftPinkPixels = countPastelPinkPixelsInRegion(
      withAuxiliaryTrim.data,
      withAuxiliaryTrim.info.width,
      { x: 260, y: 690, width: 180, height: 45 },
    );
    const auxiliaryRightPinkPixels = countPastelPinkPixelsInRegion(
      withAuxiliaryTrim.data,
      withAuxiliaryTrim.info.width,
      { x: 485, y: 690, width: 190, height: 55 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withUpperTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withUpperTrim.data, withAuxiliaryTrim.data),
    ).toBeGreaterThan(100);
    expect(upperLeftPinkPixels).toBeGreaterThan(80);
    expect(upperRightPinkPixels).toBeGreaterThan(80);
    expect(lowerLeftPinkPixels).toBeGreaterThan(80);
    expect(lowerRightPinkPixels).toBeLessThan(20);
    expect(auxiliaryLeftPinkPixels).toBeGreaterThan(80);
    expect(auxiliaryRightPinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza RECTANGULAR con el vivo inferior mas abajo que el superior", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg";
    const lowerPocketSvg = (
      await readFile(
        new URL(
          "../../../../apps/web/public/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg",
          import.meta.url,
        ),
      )
    ).toString("utf8");
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withUpperTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5150,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5153,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-baja",
            label: "Bolsillos inferiores parte baja",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withCompleteTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5154,
            role: "lowerPockets",
            key: "bolsillos-inferiores-completa",
            label: "Bolsillos inferiores completa",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const upperPinkBounds = getPastelPinkPixelBounds(
      withUpperTrim.data,
      withUpperTrim.info.width,
      withUpperTrim.info.height,
    );
    const lowerPinkBounds = getPastelPinkPixelBounds(
      withLowerTrim.data,
      withLowerTrim.info.width,
      withLowerTrim.info.height,
    );
    const completePinkBounds = getPastelPinkPixelBounds(
      withCompleteTrim.data,
      withCompleteTrim.info.width,
      withCompleteTrim.info.height,
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(lowerPocketSvg).toContain('y1="903.51"');
    expect(lowerPocketSvg).not.toContain('y1="916.1"');
    expect(upperPinkBounds).toBeDefined();
    expect(lowerPinkBounds).toBeDefined();
    expect(completePinkBounds).toBeDefined();
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withUpperTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withUpperTrim.data, withCompleteTrim.data),
    ).toBeGreaterThan(100);
    expect(upperPinkBounds?.count).toBeGreaterThan(100);
    expect(lowerPinkBounds?.count).toBeGreaterThan(100);
    expect(completePinkBounds?.count).toBeGreaterThan(
      (upperPinkBounds?.count ?? 0) * 1.6,
    );
    expect(lowerPinkBounds?.minY).toBeGreaterThan(
      (upperPinkBounds?.minY ?? 0) + 5,
    );
    expect(completePinkBounds?.minY).toBeLessThan(
      lowerPinkBounds?.minY ?? Number.POSITIVE_INFINITY,
    );
    expect(completePinkBounds?.maxY).toBeGreaterThan(
      (upperPinkBounds?.maxY ?? 0) + 3,
    );
  }, 20000);

  it("agrega el elemento auxiliar sobre el bolsillo RECTANGULAR por lado y pinta su franja", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg";
    const leftTabRegion = { x: 295, y: 735, width: 120, height: 40 };
    const rightTabRegion = { x: 515, y: 735, width: 120, height: 40 };
    const withoutAddon = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withLeftAddon = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        lowerPocketAuxiliaryAddonSide: "left",
      }),
    );
    const withRightAddon = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        lowerPocketAuxiliaryAddonSide: "right",
      }),
    );
    const withBothAddonTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        lowerPocketAuxiliaryAddonSide: "both",
        trimSections: [
          {
            valueId: 420,
            role: "auxiliaryPocket",
            key: "bolsillo-auxiliar",
            label: "Bolsillo auxiliar",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const baseLeftDarkPixels = countDarkPixelsInRegion(
      withoutAddon.data,
      withoutAddon.info.width,
      leftTabRegion,
    );
    const baseRightDarkPixels = countDarkPixelsInRegion(
      withoutAddon.data,
      withoutAddon.info.width,
      rightTabRegion,
    );
    const leftAddonDarkPixels = countDarkPixelsInRegion(
      withLeftAddon.data,
      withLeftAddon.info.width,
      leftTabRegion,
    );
    const leftAddonRightDarkPixels = countDarkPixelsInRegion(
      withLeftAddon.data,
      withLeftAddon.info.width,
      rightTabRegion,
    );
    const rightAddonDarkPixels = countDarkPixelsInRegion(
      withRightAddon.data,
      withRightAddon.info.width,
      rightTabRegion,
    );
    const rightAddonLeftDarkPixels = countDarkPixelsInRegion(
      withRightAddon.data,
      withRightAddon.info.width,
      leftTabRegion,
    );
    const leftAddonWhitePixels = countWhitePixelsInRegion(
      withLeftAddon.data,
      withLeftAddon.info.width,
      leftTabRegion,
    );
    const rightAddonWhitePixels = countWhitePixelsInRegion(
      withRightAddon.data,
      withRightAddon.info.width,
      rightTabRegion,
    );
    const leftTrimPinkPixels = countPastelPinkPixelsInRegion(
      withBothAddonTrim.data,
      withBothAddonTrim.info.width,
      leftTabRegion,
    );
    const rightTrimPinkPixels = countPastelPinkPixelsInRegion(
      withBothAddonTrim.data,
      withBothAddonTrim.info.width,
      rightTabRegion,
    );

    expect(leftAddonDarkPixels).toBeGreaterThan(baseLeftDarkPixels + 100);
    expect(leftAddonRightDarkPixels).toBeLessThan(baseRightDarkPixels + 20);
    expect(rightAddonDarkPixels).toBeGreaterThan(baseRightDarkPixels + 100);
    expect(rightAddonLeftDarkPixels).toBeLessThan(baseLeftDarkPixels + 20);
    expect(leftAddonWhitePixels).toBeLessThan(30);
    expect(rightAddonWhitePixels).toBeLessThan(30);
    expect(leftTrimPinkPixels).toBeGreaterThan(150);
    expect(rightTrimPinkPixels).toBeGreaterThan(150);
  }, 20000);

  it("agrega el elemento auxiliar sobrepuesto dentro del bolsillo RECTANGULAR por lado y pinta su franja", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg";
    const leftInnerRegion = { x: 300, y: 790, width: 110, height: 120 };
    const rightInnerRegion = { x: 518, y: 790, width: 110, height: 120 };
    const leftTrimRegion = { x: 300, y: 790, width: 110, height: 18 };
    const rightTrimRegion = { x: 518, y: 790, width: 110, height: 18 };
    const withoutAddon = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withLeftAddon = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        lowerPocketAuxiliaryAddonKind: "overlaid",
        lowerPocketAuxiliaryAddonSide: "left",
      }),
    );
    const withRightAddon = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        lowerPocketAuxiliaryAddonKind: "overlaid",
        lowerPocketAuxiliaryAddonSide: "right",
      }),
    );
    const withBothAddonTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        lowerPocketAuxiliaryAddonKind: "overlaid",
        lowerPocketAuxiliaryAddonSide: "both",
        trimSections: [
          {
            valueId: 421,
            role: "auxiliaryPocket",
            key: "bolsillo-auxiliar",
            label: "Bolsillo auxiliar",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const baseLeftDarkPixels = countDarkPixelsInRegion(
      withoutAddon.data,
      withoutAddon.info.width,
      leftInnerRegion,
    );
    const baseRightDarkPixels = countDarkPixelsInRegion(
      withoutAddon.data,
      withoutAddon.info.width,
      rightInnerRegion,
    );
    const leftAddonDarkPixels = countDarkPixelsInRegion(
      withLeftAddon.data,
      withLeftAddon.info.width,
      leftInnerRegion,
    );
    const leftAddonRightDarkPixels = countDarkPixelsInRegion(
      withLeftAddon.data,
      withLeftAddon.info.width,
      rightInnerRegion,
    );
    const rightAddonDarkPixels = countDarkPixelsInRegion(
      withRightAddon.data,
      withRightAddon.info.width,
      rightInnerRegion,
    );
    const rightAddonLeftDarkPixels = countDarkPixelsInRegion(
      withRightAddon.data,
      withRightAddon.info.width,
      leftInnerRegion,
    );
    const leftAddonWhitePixels = countWhitePixelsInRegion(
      withLeftAddon.data,
      withLeftAddon.info.width,
      leftInnerRegion,
    );
    const rightAddonWhitePixels = countWhitePixelsInRegion(
      withRightAddon.data,
      withRightAddon.info.width,
      rightInnerRegion,
    );
    const leftTrimPinkPixels = countPastelPinkPixelsInRegion(
      withBothAddonTrim.data,
      withBothAddonTrim.info.width,
      leftTrimRegion,
    );
    const rightTrimPinkPixels = countPastelPinkPixelsInRegion(
      withBothAddonTrim.data,
      withBothAddonTrim.info.width,
      rightTrimRegion,
    );

    expect(leftAddonDarkPixels).toBeGreaterThan(baseLeftDarkPixels + 100);
    expect(leftAddonRightDarkPixels).toBeLessThan(baseRightDarkPixels + 20);
    expect(rightAddonDarkPixels).toBeGreaterThan(baseRightDarkPixels + 100);
    expect(rightAddonLeftDarkPixels).toBeLessThan(baseLeftDarkPixels + 20);
    expect(leftAddonWhitePixels).toBeLessThan(30);
    expect(rightAddonWhitePixels).toBeLessThan(30);
    expect(leftTrimPinkPixels).toBeGreaterThan(400);
    expect(rightTrimPinkPixels).toBeGreaterThan(400);
  }, 20000);

  it("agrega el velcro auxiliar sobre el bolsillo RECTANGULAR por lado y pinta su x", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg";
    const leftVelcroRegion = { x: 335, y: 742, width: 40, height: 28 };
    const rightVelcroRegion = { x: 553, y: 742, width: 40, height: 28 };
    const leftMarkRegion = { x: 344, y: 748, width: 22, height: 16 };
    const rightMarkRegion = { x: 562, y: 748, width: 22, height: 16 };
    const withoutAddon = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withLeftAddon = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        lowerPocketAuxiliaryAddonKind: "velcro",
        lowerPocketAuxiliaryAddonSide: "left",
      }),
    );
    const withRightAddon = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        lowerPocketAuxiliaryAddonKind: "velcro",
        lowerPocketAuxiliaryAddonSide: "right",
      }),
    );
    const withBothAddonTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        lowerPocketAuxiliaryAddonKind: "velcro",
        lowerPocketAuxiliaryAddonSide: "both",
        trimSections: [
          {
            valueId: 422,
            role: "auxiliaryPocket",
            key: "bolsillo-auxiliar",
            label: "Bolsillo auxiliar",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const baseLeftDarkPixels = countDarkPixelsInRegion(
      withoutAddon.data,
      withoutAddon.info.width,
      leftVelcroRegion,
    );
    const baseRightDarkPixels = countDarkPixelsInRegion(
      withoutAddon.data,
      withoutAddon.info.width,
      rightVelcroRegion,
    );
    const leftAddonDarkPixels = countDarkPixelsInRegion(
      withLeftAddon.data,
      withLeftAddon.info.width,
      leftVelcroRegion,
    );
    const leftAddonRightDarkPixels = countDarkPixelsInRegion(
      withLeftAddon.data,
      withLeftAddon.info.width,
      rightVelcroRegion,
    );
    const rightAddonDarkPixels = countDarkPixelsInRegion(
      withRightAddon.data,
      withRightAddon.info.width,
      rightVelcroRegion,
    );
    const rightAddonLeftDarkPixels = countDarkPixelsInRegion(
      withRightAddon.data,
      withRightAddon.info.width,
      leftVelcroRegion,
    );
    const leftMarkPinkPixels = countPastelPinkPixelsInRegion(
      withBothAddonTrim.data,
      withBothAddonTrim.info.width,
      leftMarkRegion,
    );
    const rightMarkPinkPixels = countPastelPinkPixelsInRegion(
      withBothAddonTrim.data,
      withBothAddonTrim.info.width,
      rightMarkRegion,
    );

    expect(leftAddonDarkPixels).toBeGreaterThan(baseLeftDarkPixels + 40);
    expect(leftAddonRightDarkPixels).toBeLessThan(baseRightDarkPixels + 20);
    expect(rightAddonDarkPixels).toBeGreaterThan(baseRightDarkPixels + 40);
    expect(rightAddonLeftDarkPixels).toBeLessThan(baseLeftDarkPixels + 20);
    expect(leftMarkPinkPixels).toBeGreaterThan(20);
    expect(rightMarkPinkPixels).toBeGreaterThan(20);
  }, 20000);

  it("dibuja la presilla de manga con el elemento extraido y color de vivo", async () => {
    const withoutTrim = await readRawPng(await renderDesignImage(baseScene));
    const withSleeveTabs = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        trimSections: [
          {
            valueId: 5149,
            key: "presillas",
            label: "Presillas",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftSleeveTabRegion = { x: 145, y: 378, width: 55, height: 65 };
    const rightSleeveTabRegion = { x: 717, y: 378, width: 55, height: 65 };
    const baseLeftDarkPixels = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      leftSleeveTabRegion,
    );
    const baseRightDarkPixels = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      rightSleeveTabRegion,
    );
    const leftSleeveTabPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTabs.data,
      withSleeveTabs.info.width,
      leftSleeveTabRegion,
    );
    const rightSleeveTabPinkPixels = countPastelPinkPixelsInRegion(
      withSleeveTabs.data,
      withSleeveTabs.info.width,
      rightSleeveTabRegion,
    );
    const leftSleeveTabDarkPixels = countDarkPixelsInRegion(
      withSleeveTabs.data,
      withSleeveTabs.info.width,
      leftSleeveTabRegion,
    );
    const rightSleeveTabDarkPixels = countDarkPixelsInRegion(
      withSleeveTabs.data,
      withSleeveTabs.info.width,
      rightSleeveTabRegion,
    );

    expect(leftSleeveTabPinkPixels).toBeGreaterThan(300);
    expect(rightSleeveTabPinkPixels).toBeGreaterThan(300);
    expect(leftSleeveTabDarkPixels).toBeGreaterThan(baseLeftDarkPixels + 40);
    expect(rightSleeveTabDarkPixels).toBeGreaterThan(baseRightDarkPixels + 40);
  }, 20000);

  it("pinta los aros del bolsillo inferior AROS con su vivo especifico", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-15.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withRingsTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5155,
            key: "aros",
            label: "Aros",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withGenericUpperTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5150,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftRingPinkPixels = countPastelPinkPixelsInRegion(
      withRingsTrim.data,
      withRingsTrim.info.width,
      { x: 260, y: 690, width: 180, height: 160 },
    );
    const rightRingPinkPixels = countPastelPinkPixelsInRegion(
      withRingsTrim.data,
      withRingsTrim.info.width,
      { x: 485, y: 690, width: 190, height: 160 },
    );

    expect(
      getPastelPinkPixelBounds(
        withoutTrim.data,
        withoutTrim.info.width,
        withoutTrim.info.height,
      ),
    ).toBeUndefined();
    expect(
      getPastelPinkPixelBounds(
        withGenericUpperTrim.data,
        withGenericUpperTrim.info.width,
        withGenericUpperTrim.info.height,
      ),
    ).toBeUndefined();
    expect(leftRingPinkPixels).toBeGreaterThan(40);
    expect(rightRingPinkPixels).toBeGreaterThan(40);
    expect(
      countDifferentPixels(withoutTrim.data, withRingsTrim.data),
    ).toBeGreaterThan(100);
  }, 20000);

  it("renderiza ALETAS como bolsillo inferior sin color fijo ni vivo", async () => {
    const withoutLowerPocket = await readRawPng(
      await renderDesignImage(baseScene),
    );
    const withAletas = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath:
          "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-16.svg",
      }),
    );

    expect(
      countDifferentPixels(withoutLowerPocket.data, withAletas.data),
    ).toBeGreaterThan(100);
    expect(countOrangePixels(withAletas.data)).toBe(0);
  }, 20000);

  it("rellena ALETAS como bolsillo inferior con Bolsillo inferior aletas", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-16.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withAletasTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 2877,
            key: "aletas",
            label: "Bolsillo inferior aletas",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftAletaFillPinkPixels = countPastelPinkPixelsInRegion(
      withAletasTrim.data,
      withAletasTrim.info.width,
      { x: 280, y: 715, width: 160, height: 110 },
    );
    const rightAletaFillPinkPixels = countPastelPinkPixelsInRegion(
      withAletasTrim.data,
      withAletasTrim.info.width,
      { x: 460, y: 715, width: 170, height: 110 },
    );
    const leftAletaWithoutTrimPinkPixels = countPastelPinkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 280, y: 715, width: 160, height: 110 },
    );
    const rightAletaWithoutTrimPinkPixels = countPastelPinkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 460, y: 715, width: 170, height: 110 },
    );

    expect(leftAletaFillPinkPixels).toBeGreaterThan(500);
    expect(rightAletaFillPinkPixels).toBeGreaterThan(500);
    expect(leftAletaWithoutTrimPinkPixels).toBe(0);
    expect(rightAletaWithoutTrimPinkPixels).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withAletasTrim.data),
    ).toBeGreaterThan(500);
  }, 20000);

  it("renderiza RIBETE con vivos separados para franja superior e inferior", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-19-ribete-lower-pocket.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withUpperTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5150,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5153,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-baja",
            label: "Bolsillos inferiores parte baja",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const upperLeftPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 290, y: 770, width: 150, height: 25 },
    );
    const upperRightPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 505, y: 770, width: 155, height: 25 },
    );
    const lowerLeftPinkPixels = countPastelPinkPixelsInRegion(
      withLowerTrim.data,
      withLowerTrim.info.width,
      { x: 290, y: 792, width: 150, height: 32 },
    );
    const lowerRightPinkPixels = countPastelPinkPixelsInRegion(
      withLowerTrim.data,
      withLowerTrim.info.width,
      { x: 505, y: 792, width: 155, height: 32 },
    );
    const upperRenderLowerBandPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 290, y: 800, width: 150, height: 22 },
    );
    const lowerRenderUpperBandPinkPixels = countPastelPinkPixelsInRegion(
      withLowerTrim.data,
      withLowerTrim.info.width,
      { x: 290, y: 770, width: 150, height: 25 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withoutTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withUpperTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(500);
    expect(upperLeftPinkPixels).toBeGreaterThan(300);
    expect(upperRightPinkPixels).toBeGreaterThan(300);
    expect(lowerLeftPinkPixels).toBeGreaterThan(300);
    expect(lowerRightPinkPixels).toBeGreaterThan(300);
    expect(upperRenderLowerBandPinkPixels).toBeLessThan(50);
    expect(lowerRenderUpperBandPinkPixels).toBeLessThan(50);
  }, 20000);

  it("renderiza COSTURA MARIA con vivos superior y auxiliar sin responder a parte baja", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-20-costura-maria-lower-pocket.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withUpperTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5150,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5153,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-baja",
            label: "Bolsillos inferiores parte baja",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withAuxiliaryTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5154,
            role: "auxiliaryPocket",
            key: "bolsillo-auxiliar",
            label: "Bolsillo auxiliar",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const upperLeftPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 250, y: 770, width: 200, height: 90 },
    );
    const upperRightPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 485, y: 770, width: 190, height: 90 },
    );
    const auxiliaryLeftPinkPixels = countPastelPinkPixelsInRegion(
      withAuxiliaryTrim.data,
      withAuxiliaryTrim.info.width,
      { x: 250, y: 770, width: 200, height: 90 },
    );
    const auxiliaryRightPinkPixels = countPastelPinkPixelsInRegion(
      withAuxiliaryTrim.data,
      withAuxiliaryTrim.info.width,
      { x: 485, y: 770, width: 190, height: 90 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBeGreaterThan(50);
    expect(
      countDifferentPixels(withoutTrim.data, withAuxiliaryTrim.data),
    ).toBeGreaterThan(50);
    expect(countDifferentPixels(withoutTrim.data, withLowerTrim.data)).toBe(0);
    expect(upperLeftPinkPixels).toBeGreaterThan(50);
    expect(upperRightPinkPixels).toBeLessThan(20);
    expect(auxiliaryLeftPinkPixels).toBeGreaterThan(50);
    expect(auxiliaryRightPinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza COSTURA TRIANGULO con vivo solo en las secciones superiores", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-46-costura-triangulo-lower-pocket.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withUpperTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5150,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5153,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-baja",
            label: "Bolsillos inferiores parte baja",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const upperLeftPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 245, y: 725, width: 200, height: 30 },
    );
    const upperRightPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 500, y: 725, width: 210, height: 30 },
    );
    const lowerLeftPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 290, y: 860, width: 95, height: 180 },
    );
    const lowerRightPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 515, y: 860, width: 95, height: 180 },
    );
    const upperTrimBounds = getPastelPinkPixelBounds(
      withUpperTrim.data,
      withUpperTrim.info.width,
      withUpperTrim.info.height,
    );
    const lowerTrimBounds = getPastelPinkPixelBounds(
      withLowerTrim.data,
      withLowerTrim.info.width,
      withLowerTrim.info.height,
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withUpperTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(100);
    expect(upperLeftPinkPixels).toBeGreaterThan(120);
    expect(upperRightPinkPixels).toBeGreaterThan(120);
    expect(lowerLeftPinkPixels).toBeLessThan(20);
    expect(lowerRightPinkPixels).toBeLessThan(20);
    expect(upperTrimBounds).toBeDefined();
    expect(lowerTrimBounds).toBeDefined();
    expect(
      (upperTrimBounds?.maxY ?? 0) - (upperTrimBounds?.minY ?? 0),
    ).toBeLessThan(
      ((lowerTrimBounds?.maxY ?? 0) - (lowerTrimBounds?.minY ?? 0)) / 2,
    );
  }, 20000);

  it("rellena RIBETE HORIZONTAL con Bolsillos inferiores parte superior", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-47-ribete-horizontal-lower-pocket.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withUpperTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5150,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5153,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-baja",
            label: "Bolsillos inferiores parte baja",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const leftPocketTrimPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 250, y: 760, width: 200, height: 80 },
    );
    const rightPocketTrimPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 480, y: 760, width: 210, height: 80 },
    );
    const lowerLeftPocketTrimPinkPixels = countPastelPinkPixelsInRegion(
      withLowerTrim.data,
      withLowerTrim.info.width,
      { x: 250, y: 760, width: 200, height: 80 },
    );
    const lowerRightPocketTrimPinkPixels = countPastelPinkPixelsInRegion(
      withLowerTrim.data,
      withLowerTrim.info.width,
      { x: 480, y: 760, width: 210, height: 80 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withUpperTrim.data, withLowerTrim.data),
    ).toBeGreaterThan(100);
    expect(leftPocketTrimPinkPixels).toBeGreaterThan(
      lowerLeftPocketTrimPinkPixels + 200,
    );
    expect(rightPocketTrimPinkPixels).toBeGreaterThan(
      lowerRightPocketTrimPinkPixels + 200,
    );
  }, 20000);

  it("renderiza LOS ANDES como bolsillo inferior sin vivos", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-48-los-andes-lower-pocket-v2.svg";
    const withoutPocket = await readRawPng(
      await renderDesignImage({
        ...baseScene,
      }),
    );
    const withLosAndesPocket = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withIgnoredTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5150,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 5153,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-baja",
            label: "Bolsillos inferiores parte baja",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );

    expect(withoutPocket.info.width).toBe(900);
    expect(withoutPocket.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutPocket.data, withLosAndesPocket.data),
    ).toBeGreaterThan(500);
    const leftPocketInk = countDarkPixelsInRegion(
      withLosAndesPocket.data,
      withLosAndesPocket.info.width,
      { x: 245, y: 700, width: 200, height: 340 },
    );
    const leftBaseInk = countDarkPixelsInRegion(
      withoutPocket.data,
      withoutPocket.info.width,
      { x: 245, y: 700, width: 200, height: 340 },
    );
    const rightPocketInk = countDarkPixelsInRegion(
      withLosAndesPocket.data,
      withLosAndesPocket.info.width,
      { x: 475, y: 700, width: 205, height: 340 },
    );
    const rightBaseInk = countDarkPixelsInRegion(
      withoutPocket.data,
      withoutPocket.info.width,
      { x: 475, y: 700, width: 205, height: 340 },
    );

    expect(leftPocketInk).toBeGreaterThan(leftBaseInk + 500);
    expect(rightPocketInk).toBeGreaterThan(rightBaseInk + 500);
    expect(
      countDifferentPixels(withLosAndesPocket.data, withIgnoredTrim.data),
    ).toBe(0);
  }, 20000);

  it("rellena BOLSILLO INTERNO RECTANGULAR con Bolsillos inferiores completa", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-49-bolsillo-interno-rectangular-lower-pocket.svg";
    const withCompleteTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5154,
            role: "lowerPockets",
            key: "bolsillos-inferiores-completa",
            label: "Bolsillos inferiores completa",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );

    const leftPocketFillPinkPixels = countPastelPinkPixelsInRegion(
      withCompleteTrim.data,
      withCompleteTrim.info.width,
      { x: 220, y: 650, width: 230, height: 260 },
    );
    const rightPocketFillPinkPixels = countPastelPinkPixelsInRegion(
      withCompleteTrim.data,
      withCompleteTrim.info.width,
      { x: 450, y: 650, width: 240, height: 260 },
    );

    expect(leftPocketFillPinkPixels).toBeGreaterThan(1000);
    expect(rightPocketFillPinkPixels).toBeGreaterThan(1000);
  }, 20000);

  it("renderiza BOLSILLO INTERNO RECTANGULAR sin color amarillo ni vivos", async () => {
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-49-bolsillo-interno-rectangular-lower-pocket.svg";
    const withoutPocket = await readRawPng(
      await renderDesignImage({
        ...baseScene,
      }),
    );
    const withInternalRectangularPocket = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
      }),
    );
    const withIgnoredTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5150,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
          {
            valueId: 5153,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-baja",
            label: "Bolsillos inferiores parte baja",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );

    expect(withoutPocket.info.width).toBe(900);
    expect(withoutPocket.info.height).toBe(1200);
    expect(
      countDifferentPixels(
        withoutPocket.data,
        withInternalRectangularPocket.data,
      ),
    ).toBeGreaterThan(500);
    expect(countYellowPixels(withInternalRectangularPocket.data)).toBe(0);
    expect(
      countDifferentPixels(
        withInternalRectangularPocket.data,
        withIgnoredTrim.data,
      ),
    ).toBe(0);
  }, 20000);

  it("renderiza CIRUGÍA con COSTURA OVALADO, Cuello alto y cogotera", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia.svg";
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia-lower-pocket.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withOvalPocket = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
      }),
    );
    const withOvalPocketUpperTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5150,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withOvalPocketLowerTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5153,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-baja",
            label: "Bolsillos inferiores parte baja",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withHighCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 421,
            role: "upperNeck",
            key: "cuello-alto",
            label: "Cuello alto",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const highCollarPinkPixels = countPinkPixelsByHalf(
      withHighCollar.data,
      withHighCollar.info.width,
    );
    const highCollarInteriorPinkPixels = countPinkPixelsInRegion(
      withHighCollar.data,
      withHighCollar.info.width,
      { x: 425, y: 285, width: 18, height: 40 },
    );
    const highCollarBackPinkPixels = countPinkPixelsInRegion(
      withHighCollar.data,
      withHighCollar.info.width,
      { x: 420, y: 130, width: 60, height: 20 },
    );
    const highCollarLeftJoinPinkPixels = countPinkPixelsInRegion(
      withHighCollar.data,
      withHighCollar.info.width,
      { x: 398, y: 188, width: 34, height: 45 },
    );
    const highCollarRightJoinPinkPixels = countPinkPixelsInRegion(
      withHighCollar.data,
      withHighCollar.info.width,
      { x: 500, y: 188, width: 34, height: 45 },
    );
    const ovalUpperPocketTrimPinkPixels = countPastelPinkPixelsInRegion(
      withOvalPocketUpperTrim.data,
      withOvalPocketUpperTrim.info.width,
      { x: 280, y: 760, width: 340, height: 90 },
    );
    const ovalLowerPocketTrimPinkPixels = countPastelPinkPixelsInRegion(
      withOvalPocketLowerTrim.data,
      withOvalPocketLowerTrim.info.width,
      { x: 280, y: 760, width: 340, height: 90 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withOvalPocket.data),
    ).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withOvalPocket.data, withOvalPocketUpperTrim.data),
    ).toBeGreaterThan(100);
    expect(
      countDifferentPixels(
        withOvalPocketUpperTrim.data,
        withOvalPocketLowerTrim.data,
      ),
    ).toBe(0);
    expect(ovalUpperPocketTrimPinkPixels).toBeGreaterThan(100);
    expect(ovalLowerPocketTrimPinkPixels).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withHighCollar.data),
    ).toBeGreaterThan(100);
    expect(
      highCollarPinkPixels.left + highCollarPinkPixels.right,
    ).toBeGreaterThan(500);
    expect(highCollarInteriorPinkPixels).toBeLessThan(80);
    expect(highCollarBackPinkPixels).toBeGreaterThan(900);
    expect(highCollarLeftJoinPinkPixels).toBeGreaterThan(100);
    expect(highCollarRightJoinPinkPixels).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
  }, 20000);

  it("renderiza CUELLO ALTO CON CREMALLERA con ANDES HOMBRE, Cuello alto y cogotera", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-34-cuello-alto-cremallera.svg";
    const lowerPocketAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-34-cuello-alto-cremallera-lower-pocket.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withAndesPocket = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
      }),
    );
    const withAndesPocketUpperTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5150,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-superior",
            label: "Bolsillos inferiores parte superior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withAndesPocketLowerTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 5153,
            role: "lowerPockets",
            key: "bolsillos-inferiores-parte-baja",
            label: "Bolsillos inferiores parte baja",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withAndesPocketAuxiliaryTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        lowerPocketAssetPath,
        trimSections: [
          {
            valueId: 420,
            role: "auxiliaryPocket",
            key: "bolsillo-auxiliar",
            label: "Bolsillo auxiliar",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withHighCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 421,
            role: "upperNeck",
            key: "cuello-alto",
            label: "Cuello alto",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 414,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const highCollarRingPinkPixels = countPinkPixelsInRegion(
      withHighCollar.data,
      withHighCollar.info.width,
      { x: 380, y: 125, width: 170, height: 60 },
    );
    const andesAuxPocketTrimPinkPixels = countPastelPinkPixelsInRegion(
      withAndesPocketAuxiliaryTrim.data,
      withAndesPocketAuxiliaryTrim.info.width,
      { x: 260, y: 735, width: 150, height: 80 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withAndesPocket.data),
    ).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withAndesPocket.data, withAndesPocketUpperTrim.data),
    ).toBe(0);
    expect(
      countDifferentPixels(
        withAndesPocket.data,
        withAndesPocketLowerTrim.data,
      ),
    ).toBe(0);
    expect(
      countDifferentPixels(
        withAndesPocket.data,
        withAndesPocketAuxiliaryTrim.data,
      ),
    ).toBeGreaterThan(50);
    expect(andesAuxPocketTrimPinkPixels).toBeGreaterThan(40);
    expect(
      countDifferentPixels(withoutTrim.data, withHighCollar.data),
    ).toBeGreaterThan(100);
    expect(highCollarRingPinkPixels).toBeGreaterThan(2000);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
  }, 20000);

  it("renderiza PRESILLAS sin botones y pinta cuello, aros y cogotera por separado", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-15-presillas.svg";
    const baseAssetMarkup = (
      await readFile(
        new URL(
          "../../../../apps/web/public/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-15-presillas.svg",
          import.meta.url,
        ),
      )
    ).toString("utf8");
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5147,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withRings = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 2898,
            key: "nombre-cambiado",
            label: "Nombre cambiado en Odoo",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5146,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const collarPinkPixels = countPastelPinkPixelsInRegion(
      withCollar.data,
      withCollar.info.width,
      { x: 290, y: 120, width: 330, height: 270 },
    );
    const ringPinkPixels = countPastelPinkPixelsInRegion(
      withRings.data,
      withRings.info.width,
      { x: 380, y: 300, width: 135, height: 80 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );
    const lowerLeftButtonDarkPixels = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 325, y: 760, width: 70, height: 70 },
    );
    const lowerRightButtonDarkPixels = countDarkPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 545, y: 760, width: 70, height: 70 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(baseAssetMarkup).not.toContain("M486.68,423.96");
    expect(
      countDifferentPixels(withoutTrim.data, withCollar.data),
    ).toBeGreaterThan(100);
    expect(collarPinkPixels).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withoutTrim.data, withRings.data),
    ).toBeGreaterThan(100);
    expect(ringPinkPixels).toBeGreaterThan(120);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
    expect(lowerLeftButtonDarkPixels).toBeLessThan(30);
    expect(lowerRightButtonDarkPixels).toBeLessThan(30);
  }, 20000);

  it("renderiza PUNTAS solo con color general y cogotera recta", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-06-puntas.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withCollarSection = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5147,
            role: "upperNeck",
            key: "cuello",
            label: "Cuello",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5146,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withLowerCollar = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5148,
            key: "cuello-inferior",
            label: "Cuello inferior",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const bodyBaseColorPixels = countBaseColorPixelsInRegion(
      withoutTrim.data,
      withoutTrim.info.width,
      { x: 410, y: 520, width: 80, height: 120 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countYellowPixels(withoutTrim.data)).toBe(0);
    expect(bodyBaseColorPixels).toBeGreaterThan(1000);
    expect(
      countDifferentPixels(withoutTrim.data, withCollarSection.data),
    ).toBe(0);
    expect(
      countPastelPinkPixelsInRegion(
        withLowerCollar.data,
        withLowerCollar.info.width,
        { x: 395, y: 185, width: 115, height: 145 },
      ),
    ).toBeGreaterThan(180);
    expect(
      countPastelPinkPixelsInRegion(
        withLowerCollar.data,
        withLowerCollar.info.width,
        { x: 430, y: 225, width: 30, height: 45 },
      ),
    ).toBeLessThan(40);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
  }, 20000);

  it("renderiza PUNTADAS con Cuello puntadas y cogotera", async () => {
    const neckAssetPath =
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-07.svg";
    const withoutTrim = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
      }),
    );
    const withStitches = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 7010,
            key: "cuello-puntadas",
            label: "Cuello puntadas",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath,
        trimSections: [
          {
            valueId: 5146,
            role: "backNeck",
            key: "cogotera",
            label: "Cogotera",
            colorHex: "#f4c7cc",
          },
        ],
      }),
    );
    const centerStitchPinkPixels = countPastelPinkPixelsInRegion(
      withStitches.data,
      withStitches.info.width,
      { x: 275, y: 140, width: 345, height: 220 },
    );
    const leftShoulderStitchPinkPixels = countPastelPinkPixelsInRegion(
      withStitches.data,
      withStitches.info.width,
      { x: 165, y: 180, width: 250, height: 175 },
    );
    const rightShoulderStitchPinkPixels = countPastelPinkPixelsInRegion(
      withStitches.data,
      withStitches.info.width,
      { x: 510, y: 170, width: 225, height: 190 },
    );
    const topBackNeckPinkPixels = countPastelPinkPixelsInRegion(
      withBackNeck.data,
      withBackNeck.info.width,
      { x: 280, y: 90, width: 340, height: 80 },
    );

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withStitches.data),
    ).toBeGreaterThan(100);
    expect(centerStitchPinkPixels).toBeGreaterThan(200);
    expect(leftShoulderStitchPinkPixels).toBeGreaterThan(100);
    expect(rightShoulderStitchPinkPixels).toBeGreaterThan(100);
    expect(
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
  }, 20000);
});
