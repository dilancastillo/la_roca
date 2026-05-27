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
      alpha > 0 &&
      red > 220 &&
      green > 150 &&
      green < 230 &&
      blue > 160 &&
      blue < 235
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
});
