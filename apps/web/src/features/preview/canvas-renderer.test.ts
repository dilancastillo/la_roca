import { describe, expect, it } from "vitest";
import {
  getChestPocketSectionTrimOverlays,
  getOriginalSleeveTrimShapes,
} from "./canvas-renderer";

describe("vivos de bolsillo de pecho", () => {
  it("aplica las capas superior e inferior al modelo rectangular v2", () => {
    expect(
      getChestPocketSectionTrimOverlays(
        "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-v2.svg",
      ),
    ).toEqual({
      upper:
        "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-upper-trim.svg",
      lower:
        "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-lower-trim.svg",
    });
  });
});

describe("vivos de mangas originales", () => {
  it("ancla Cuello V al borde exterior del puño y no a la sisa", () => {
    const [left, right] = getOriginalSleeveTrimShapes(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );

    expect(left?.lower).toEqual([
      [110.72, 533.35],
      [264.49, 670.72],
    ]);
    expect(right?.lower).toEqual([
      [970.21, 515.32],
      [834.2, 642.19],
    ]);
  });

  it("conserva el ancla de Cuello V cuando el laboratorio materializa el SVG", () => {
    const [left, right] = getOriginalSleeveTrimShapes(
      "data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E",
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );

    expect(left?.lower).toEqual([
      [110.72, 533.35],
      [264.49, 670.72],
    ]);
    expect(right?.lower).toEqual([
      [970.21, 515.32],
      [834.2, 642.19],
    ]);
  });

  it.each([
    [
      "Mariposa cruzado",
      "blouse-model-40-mariposa.svg",
      [[109.82, 535.05], [263.59, 672.42]],
      [[965.25, 531.05], [833.9, 636.48]],
    ],
    [
      "El Hato",
      "blouse-model-39-el-hato.svg",
      [[0, 463.86], [168.42, 614.36]],
      [[941.85, 462.31], [792.42, 582.99]],
    ],
  ])("preserva el borde de puño real en %s", (_model, fileName, leftLower, rightLower) => {
    const [left, right] = getOriginalSleeveTrimShapes(
      `/assets/catalog/blusa-antifluido-t180/svg-clean/${fileName}`,
    );

    expect(left?.lower).toEqual(leftLower);
    expect(right?.lower).toEqual(rightLower);
  });
});
