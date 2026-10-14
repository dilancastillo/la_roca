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
  it("ancla Cuello V al borde de puño del SVG y no al contorno exterior", () => {
    const [left, right] = getOriginalSleeveTrimShapes(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );

    expect(left?.lower).toEqual([
      [116.28, 531.63],
      [262.51, 662.26],
    ]);
    expect(right?.lower).toEqual([
      [965.71, 512.68],
      [834.8, 634.8],
    ]);
  });

  it.each([
    [
      "Mariposa cruzado",
      "blouse-model-40-mariposa.svg",
      [[261.611, 663.952], [115.381, 533.322]],
      [[969.751, 533.692], [833.301, 643.882]],
    ],
    [
      "El Hato",
      "blouse-model-39-el-hato.svg",
      [[6.09, 461.97], [166.24, 605.07]],
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
