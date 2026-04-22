import { describe, expect, it } from "vitest";
import { getImageSourceByIds, getProductAssetCatalog } from "./asset-catalog";

describe("getProductAssetCatalog", () => {
  it("resuelve la llave exacta del catalogo", () => {
    const catalog = getProductAssetCatalog("blusa-antifluido-t180");

    expect(catalog?.neckModelsByValueId[2592]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-03.svg",
    );
  });

  it("resuelve alias cuando Odoo envia el nombre base del producto", () => {
    expect(getImageSourceByIds("blusa-antifluido-t180", 63, 2590)).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );
  });

  it("resuelve llaves mas largas cuando incluyen sufijos extras", () => {
    expect(
      getImageSourceByIds(
        "blusa-antifluido-t180-24263-140957-amarillo-intenso-hombre",
        70,
        2578,
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg",
    );
  });

  it("no usa nombres como fallback cuando falta un ID mapeado", () => {
    expect(getImageSourceByIds("blusa-antifluido-t180", 63, 999999)).toBeUndefined();
  });
});
