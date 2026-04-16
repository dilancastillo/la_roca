import { describe, expect, it } from "vitest";
import { getProductAssetCatalog } from "./asset-catalog";

describe("getProductAssetCatalog", () => {
  it("resuelve la llave exacta del catalogo", () => {
    const catalog = getProductAssetCatalog("blusa-antifluido-t180-24263");

    expect(catalog?.necks["Modelo 3"]).toBe(
      "/assets/catalog/blusa-antifluido-t180-24263/necks/neck-model-03.png",
    );
  });

  it("resuelve alias cuando Odoo envia el nombre base del producto", () => {
    const catalog = getProductAssetCatalog("blusa-antifluido-t180");

    expect(catalog?.necks["Modelo 3"]).toBe(
      "/assets/catalog/blusa-antifluido-t180-24263/necks/neck-model-03.png",
    );
  });

  it("resuelve llaves mas largas cuando incluyen sufijos extras", () => {
    const catalog = getProductAssetCatalog(
      "blusa-antifluido-t180-24263-140957-amarillo-intenso-hombre",
    );

    expect(catalog?.lowerPocketModels["Modelo 1"]).toBe(
      "/assets/catalog/blusa-antifluido-t180-24263/lower-pockets/lower-pocket-model-01.png",
    );
  });
});
