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

describe("renderDesignImage", () => {
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
    const chestPocketInk = countDarkPixelsInRegion(
      pespunteWithoutNeck.data,
      pespunteWithoutNeck.info.width,
      { x: 500, y: 280, width: 180, height: 220 },
    );

    expect(
      countDifferentPixels(withLizo.data, withPespunte.data),
    ).toBeGreaterThan(300);
    expect(pespunteSideInk).toBeGreaterThan(lizoSideInk + 300);
    expect(chestPocketInk).toBeLessThan(800);
  }, 20000);

  it("renderiza Cherokee con color base y cogotera", async () => {
    const withoutBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath:
          "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-12-cherokee.svg",
      }),
    );
    const withBackNeck = await readRawPng(
      await renderDesignImage({
        ...baseScene,
        neckAssetPath:
          "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-12-cherokee.svg",
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

    expect(withoutBackNeck.info.width).toBe(900);
    expect(withoutBackNeck.info.height).toBe(1200);
    expect(countNeonGreenPixels(withoutBackNeck.data)).toBe(0);
    expect(
      countDifferentPixels(withoutBackNeck.data, withBackNeck.data),
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
    expect(leftCenterPinkPixels).toBeGreaterThan(500);
    expect(rightCenterPinkPixels).toBeGreaterThan(500);
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
    expect(countPurplePixels(withoutTrim.data)).toBe(0);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(countDifferentPixels(withoutTrim.data, withBackNeck.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withPresillasPocket.data),
    ).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withoutTrim.data, withCompleteCollar.data),
    ).toBeGreaterThan(100);
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

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(countDifferentPixels(withoutTrim.data, withGenericCollar.data)).toBe(0);
    expect(
      countDifferentPixels(withoutTrim.data, withCompleteCollar.data),
    ).toBeGreaterThan(100);
    expect(collarPinkPixels).toBeGreaterThan(500);
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

  it("renderiza COSTURA con vivos independientes para parte superior y baja", async () => {
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
    const upperLeftPinkPixels = countPastelPinkPixelsInRegion(
      withUpperTrim.data,
      withUpperTrim.info.width,
      { x: 260, y: 690, width: 180, height: 45 },
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
    expect(upperLeftPinkPixels).toBeGreaterThan(80);
    expect(upperRightPinkPixels).toBeGreaterThan(80);
    expect(lowerLeftPinkPixels).toBeGreaterThan(80);
    expect(lowerRightPinkPixels).toBeLessThan(20);
  }, 20000);

  it("renderiza COSTURA MARIA con vivo superior sin responder a parte baja", async () => {
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

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withUpperTrim.data),
    ).toBeGreaterThan(50);
    expect(countDifferentPixels(withoutTrim.data, withLowerTrim.data)).toBe(0);
    expect(upperLeftPinkPixels).toBeGreaterThan(50);
    expect(upperRightPinkPixels).toBeLessThan(20);
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

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withOvalPocket.data),
    ).toBeGreaterThan(500);
    expect(
      countDifferentPixels(withoutTrim.data, withHighCollar.data),
    ).toBeGreaterThan(100);
    expect(
      highCollarPinkPixels.left + highCollarPinkPixels.right,
    ).toBeGreaterThan(500);
    expect(highCollarInteriorPinkPixels).toBeGreaterThan(300);
    expect(highCollarBackPinkPixels).toBeGreaterThan(900);
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

    expect(withoutTrim.info.width).toBe(900);
    expect(withoutTrim.info.height).toBe(1200);
    expect(
      countDifferentPixels(withoutTrim.data, withAndesPocket.data),
    ).toBeGreaterThan(500);
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
      countDifferentPixels(withoutTrim.data, withBackNeck.data),
    ).toBeGreaterThan(100);
    expect(topBackNeckPinkPixels).toBeGreaterThan(100);
  }, 20000);
});
