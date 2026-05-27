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
    expect(catalog?.neckModelsByValueId?.[354]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-50-20-20.svg",
    );
    expect(catalog?.neckModelsByValueId?.[1176]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-50-20-20.svg",
    );
    expect(catalog?.neckModelsByValueId?.[355]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-21-deportivo.svg",
    );
    expect(catalog?.neckModelsByValueId?.[1177]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-21-deportivo.svg",
    );
    expect(catalog?.neckModelsByValueId?.[356]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-22-estrella.svg",
    );
    expect(catalog?.neckModelsByValueId?.[1178]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-22-estrella.svg",
    );
    expect(catalog?.neckModelsByValueId?.[357]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-23-polo.svg",
    );
    expect(catalog?.neckModelsByValueId?.[1179]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-23-polo.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2938]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-24-botones.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2939]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-24-botones.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2940]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-25-20-21.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2941]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-25-20-21.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2942]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-26-cuello-redondo.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2943]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-26-cuello-redondo.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2944]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-27-cremallera.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2945]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-27-cremallera.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2948]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-29-pedagogia.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2949]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-29-pedagogia.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2950]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-33-oriental.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2951]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-33-oriental.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2952]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-34-cuello-alto-cremallera.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2953]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-34-cuello-alto-cremallera.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2954]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2955]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia.svg",
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
    expect(catalog?.lowerPocketModelsByValueId?.[388]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-33-oriental-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[1210]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-33-oriental-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[390]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-34-cuello-alto-cremallera-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[1212]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-34-cuello-alto-cremallera-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[391]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[1213]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[2964]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[2965]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato-lower-pocket.svg",
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
        999991,
        "Modelo de cuello",
        "CUELLO ALTO CON CREMALLERA",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-34-cuello-alto-cremallera.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999980,
        "Modelo de cuello",
        "20-20",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-50-20-20.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999981,
        "Modelo de cuello",
        "DEPORTIVO",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-21-deportivo.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999982,
        "Modelo de cuello",
        "ESTRELLA",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-22-estrella.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999983,
        "Modelo de cuello",
        "POLO",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-23-polo.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999984,
        "Modelo de cuello",
        "BOTONES",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-24-botones.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999985,
        "Modelo de cuello",
        "20-21",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-25-20-21.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999986,
        "Modelo de cuello",
        "CUELLO REDONDO",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-26-cuello-redondo.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999987,
        "Modelo de cuello",
        "CREMALLERA",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-27-cremallera.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999988,
        "Modelo de cuello",
        "PEDAGOGIA",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-29-pedagogia.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999989,
        "Modelo de cuello",
        "ORIENTAL",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-33-oriental.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999993,
        "Modelo de cuello",
        "CIRUGÍA",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia.svg",
    );

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
        999989,
        "Modelo bolsillo inferior",
        "RIBETE VERTICAL",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-33-oriental-lower-pocket.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        154,
        999990,
        "Modelo bolsillo inferior",
        "ANDES HOMBRE",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-34-cuello-alto-cremallera-lower-pocket.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        154,
        999992,
        "Modelo bolsillo inferior",
        "COSTURA OVALADO",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia-lower-pocket.svg",
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

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        154,
        999994,
        "Modelo bolsillo inferior",
        "BOLSILLO PRESILLAS",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato-lower-pocket.svg",
    );
  });

  it("resuelve el SVG base de pantalon por la llave normalizada de Odoo", () => {
    expect(getDefaultImageSource("pantalon")).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
  });
});
