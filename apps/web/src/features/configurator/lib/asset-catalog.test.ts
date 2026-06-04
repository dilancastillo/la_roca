import { describe, expect, it } from "vitest";
import {
  getBootImageSourceForValue,
  getDefaultImageSource,
  getGarmentDetailImageSourceForValue,
  getImageSourceByIds,
  getImageSourceForValue,
  getProductAssetCatalog,
  getWaistbandImageSourceForValue,
} from "./asset-catalog";

describe("getProductAssetCatalog", () => {
  it("resuelve la llave exacta del catalogo", () => {
    const catalog = getProductAssetCatalog("blusa-antifluido-t180");

    expect(catalog?.neckModelsByValueId?.[2592]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-06-puntas.svg",
    );
  });

  it("mantiene PUNTAS y PRESILLAS mapeados por ID aunque cambien nombres", () => {
    const catalog = getProductAssetCatalog("blusa-antifluido-t180");

    expect(catalog?.neckModelsByValueId?.[2591]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-15-presillas.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2592]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-06-puntas.svg",
    );
  });

  it("resuelve los nuevos modelos de cuello por PTAV ID", () => {
    const catalog = getProductAssetCatalog("blusa-antifluido-t180");

    expect(catalog?.garmentModelsByValueId?.[2866]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );
    expect(catalog?.garmentModelsByValueId?.[2867]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-45-pespunte.svg",
    );
    expect(catalog?.neckModelsByValueId?.[1156]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );
    expect(catalog?.neckModelsByValueId?.[335]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-15-presillas.svg",
    );
    expect(catalog?.neckModelsByValueId?.[1157]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-15-presillas.svg",
    );
    expect(catalog?.neckModelsByValueId?.[336]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-06-puntas.svg",
    );
    expect(catalog?.neckModelsByValueId?.[1158]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-06-puntas.svg",
    );
    expect(catalog?.neckModelsByValueId?.[2594]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-02-jdc.svg",
    );
    expect(catalog?.neckModelsByValueId?.[338]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-02-jdc.svg",
    );
    expect(catalog?.neckModelsByValueId?.[1160]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-02-jdc.svg",
    );
    expect(catalog?.neckModelsByValueId?.[339]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-42.svg",
    );
    expect(catalog?.neckModelsByValueId?.[340]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-44-cucuta.svg",
    );
    expect(catalog?.neckModelsByValueId?.[1162]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-44-cucuta.svg",
    );
    expect(catalog?.neckModelsByValueId?.[341]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-43.svg",
    );
    expect(catalog?.neckModelsByValueId?.[343]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-09.svg",
    );
    expect(catalog?.neckModelsByValueId?.[346]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-07.svg",
    );
    expect(catalog?.neckModelsByValueId?.[352]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-41-matrioska.svg",
    );
    expect(catalog?.neckModelsByValueId?.[1174]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-41-matrioska.svg",
    );
    expect(catalog?.neckModelsByValueId?.[353]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-40-mariposa.svg",
    );
    expect(catalog?.neckModelsByValueId?.[1175]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-40-mariposa.svg",
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
    expect(catalog?.lowerPocketModelsByValueId?.[386]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-49-bolsillo-interno-rectangular-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[2581]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-19-ribete-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[383]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-19-ribete-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[2583]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-46-costura-triangulo-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[385]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-46-costura-triangulo-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[2580]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-18-costura-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[382]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-18-costura-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[1204]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-18-costura-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[2582]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-20-costura-maria-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[384]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-20-costura-maria-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[1206]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-20-costura-maria-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[2964]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[2965]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato-lower-pocket.svg",
    );
    expect(catalog?.lowerPocketModelsByValueId?.[389]).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-47-ribete-horizontal-lower-pocket.svg",
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
        811,
        999976,
        "Modelo de Blusa",
        "Pespunte",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-45-pespunte.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        811,
        999977,
        "Modelo de Blusa",
        "Lizo",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        153,
        376,
        "Modelo bolsillo de pecho",
        "Rectangular",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-model.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        153,
        999980,
        "Modelo bolsillo de pecho",
        "Punta",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        153,
        999981,
        "Modelo bolsillo de pecho",
        "Cremallera punta",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-zipper.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        153,
        999982,
        "Modelo bolsillo de pecho",
        "Cremallera externo",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        153,
        999983,
        "Modelo bolsillo de pecho",
        "Cremallera externa",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external.svg",
    );

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
        999975,
        "Modelo de cuello",
        "PUNTADAS",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-07.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999976,
        "Modelo de cuello",
        "OVALADO",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-09.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999977,
        "Modelo de cuello",
        "ENFERMERA UB",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-43.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999978,
        "Modelo de cuello",
        "CUCUTA",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-44-cucuta.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999979,
        "Modelo de cuello",
        "MATRIOSKA",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-41-matrioska.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999980,
        "Modelo de cuello",
        "MARIPOSA",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-40-mariposa.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999998,
        "Modelo de cuello",
        "MARIPOSA DIVIDIDO",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-04.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        63,
        999999,
        "Nombre editable en Odoo",
        "MARIPOSA DIVIDIDO",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-04.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999981,
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
        999982,
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
        999983,
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
        999984,
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
        999985,
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
        999986,
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
        999987,
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
        999988,
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
        999989,
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
        888001,
        "Modelo de cuello",
        "MODELO 29",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-28-modelo-29.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        145,
        999990,
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
        999991,
        "Modelo bolsillo inferior",
        "COSTURA MARÍA",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-20-costura-maria-lower-pocket.svg",
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
        999993,
        "Modelo bolsillo inferior",
        "COSTURA",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-18-costura-lower-pocket.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        154,
        999989,
        "Modelo bolsillo inferior",
        "RIBETE",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-19-ribete-lower-pocket.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        154,
        999990,
        "Modelo bolsillo inferior",
        "COSTURA TRIANGULO",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-46-costura-triangulo-lower-pocket.svg",
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
        999997,
        "Modelo bolsillo inferior",
        "BOLSILLO INTERNO RECTANGULAR",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-49-bolsillo-interno-rectangular-lower-pocket.svg",
    );

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

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        154,
        999995,
        "Modelo bolsillo inferior",
        "RIBETE HORIZONTAL",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-47-ribete-horizontal-lower-pocket.svg",
    );

    expect(
      getImageSourceForValue(
        "blusa-antifluido-t180",
        154,
        999996,
        "Modelo bolsillo inferior",
        "LOS ANDES",
      ),
    ).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-48-los-andes-lower-pocket.svg",
    );
  });

  it("resuelve el SVG base de pantalon por la llave normalizada de Odoo", () => {
    expect(getDefaultImageSource("pantalon")).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
  });

  it("resuelve Pespunte de pantalon como detalle global sobre la base liza", () => {
    expect(
      getImageSourceForValue(
        "pantalon",
        810,
        2864,
        "Modelo de pantalon",
        "Pespunte",
      ),
    ).toBe("/assets/catalog/pantalon/svg-clean/pants-model-01.svg");
    expect(
      getGarmentDetailImageSourceForValue(
        "pantalon",
        810,
        2864,
        "Modelo de pantalon",
        "Pespunte",
      ),
    ).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-pespunte-stitching.svg",
    );
    expect(
      getGarmentDetailImageSourceForValue(
        "pantalon",
        810,
        999999,
        "Modelo de pantalon",
        "Pespunte",
      ),
    ).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-pespunte-stitching.svg",
    );
    expect(
      getGarmentDetailImageSourceForValue(
        "pantalon",
        810,
        2863,
        "Modelo de pantalon",
        "Lizo",
      ),
    ).toBeUndefined();
  });

  it("resuelve botas de pantalon por Tipo bota", () => {
    expect(
      getBootImageSourceForValue(
        "pantalon",
        84,
        999999,
        "Tipo bota",
        "Tradicional",
      ),
    ).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-boot-tradicional.svg",
    );

    expect(
      getBootImageSourceForValue(
        "pantalon",
        84,
        999998,
        "Tipo bota",
        "Resorte",
      ),
    ).toBe("/assets/catalog/pantalon/detail-overlays/pants-boot-resorte.svg");

    expect(
      getBootImageSourceForValue(
        "pantalon",
        84,
        999997,
        "Tipo bota",
        "Con abertura",
      ),
    ).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-boot-con-abertura.svg",
    );

    expect(
      getBootImageSourceForValue(
        "pantalon",
        84,
        999996,
        "Tipo bota",
        "Campana",
      ),
    ).toBe("/assets/catalog/pantalon/detail-overlays/pants-boot-campana.svg");

    expect(
      getBootImageSourceForValue(
        "pantalon",
        84,
        999995,
        "Tipo bota",
        "Cremallera",
      ),
    ).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-boot-cremallera.svg",
    );
  });

  it("resuelve cinturillas de pantalon por Cinturilla", () => {
    const resortadaAsset =
      "/assets/catalog/pantalon/detail-overlays/pants-waist-resortada.svg";

    expect(
      getWaistbandImageSourceForValue(
        "pantalon",
        999999,
        999999,
        "Cinturilla",
        "Completa resortada",
      ),
    ).toBe(resortadaAsset);

    expect(
      getWaistbandImageSourceForValue(
        "pantalon",
        999999,
        999998,
        "Cinturilla",
        "Media lisa",
      ),
    ).toBe(resortadaAsset);

    expect(
      getWaistbandImageSourceForValue(
        "pantalon",
        999999,
        999997,
        "Cinturilla",
        "Embarazo",
      ),
    ).toBe(resortadaAsset);

    expect(
      getWaistbandImageSourceForValue(
        "pantalon",
        999999,
        999996,
        "Cinturilla",
        "Pretina de botón",
      ),
    ).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-waist-pretina-boton.svg",
    );
  });
});
