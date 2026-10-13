import { describe, expect, it } from "vitest";
import { getChestPocketSectionTrimOverlays } from "./canvas-renderer";

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
