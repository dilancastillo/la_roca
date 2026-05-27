import { describe, expect, it } from "vitest";
import {
  getDefaultImageSource,
  getImageSourceByIds,
  getImageSourceForValue,
  getProductAssetCatalog,
} from "./asset-catalog";

describe("getProductAssetCatalog", () => {
  it("resuelve la llave exacta del catalogo", () => {
    const catalog = getProductAssetCatalog("blusa-antifluido-t180");

    expect(catalog?.neckModelsByValueId?.[2592]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-22.svg",
    );
  });

  it("mantiene PUNTAS y PRESILLAS mapeados por ID aunque cambien nombres", () => {
    const catalog = getProductAssetCatalog("blusa-antifluido-t180");

    expect(catalog?.neckModelsByValueId?.[2591]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-03.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2592]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-22.svg",
    );
  });

  it("resuelve los nuevos modelos de cuello por PTAV ID", () => {
    const catalog = getProductAssetCatalog("blusa-antifluido-t180");

    expect(catalog?.neckModelsByValueId?.[338]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-30.svg",
    );
    expect(catalog?.neckModelsByValueId?.[339]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-42.svg",
    );
    expect(catalog?.neckModelsByValueId?.[341]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-43.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2956]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2958]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-11-fisiopracticas.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2960]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-13-p-paipilla.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2962]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-12-cherokee.svg",
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

  it("resuelve assets por nombre cuando Odoo cambia los IDs de PTAV", () => {
    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999999,
        "Modelo de cuello",
        "EL HATO",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999995,
        "Modelo de cuello",
        "FISIOPRÁCTICAS",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-11-fisiopracticas.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999996,
        "Modelo de cuello",
        "P-PAIPILLA",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-13-p-paipilla.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999997,
        "Modelo de cuello",
        "CHEROKEE",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-12-cherokee.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        154,
        999998,
        "Modelo bolsillo inferior",
        "RECTANGULAR",
      ),
    ).toBe("/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg");
  });

  it("resuelve el SVG base de pantalon por la llave normalizada de Odoo", () => {
    expect(getDefaultImageSource("pantalon")).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
  });
});
