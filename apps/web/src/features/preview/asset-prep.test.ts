import { describe, expect, it } from "vitest";
import {
  buildPreparedOverlayFilename,
  getDefaultPresetForFamily,
  slugifyAssetLabel,
} from "./asset-prep";

describe("asset-prep helpers", () => {
  it("elige el preset correcto segun la familia", () => {
    expect(getDefaultPresetForFamily("lowerPocketModels")).toBe(
      "lowerPocketPair",
    );
    expect(getDefaultPresetForFamily("auxiliaryPocketModels")).toBe(
      "auxiliaryPocketPair",
    );
  });

  it("normaliza etiquetas para nombres de archivo estables", () => {
    expect(slugifyAssetLabel("Modelo 10 / Bolsillo Árbol")).toBe(
      "modelo-10-bolsillo-arbol",
    );
  });

  it("construye nombres sugeridos para overlays preparados", () => {
    expect(
      buildPreparedOverlayFilename(
        "blusa-antifluido-t180-24263",
        "auxiliaryPocketModels",
        "Modelo 3",
      ),
    ).toBe(
      "blusa-antifluido-t180-24263-auxiliary-pocket-modelo-3-overlay.png",
    );
  });
});
