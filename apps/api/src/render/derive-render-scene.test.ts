import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { describe, expect, it } from "vitest";
import { deriveAutomationRenderScene } from "./derive-render-scene.js";

const session: ConfiguratorSession = {
  saleOrderLineId: 290,
  saleOrderId: 119,
  orderName: "S00119",
  productId: 26830,
  productTemplateId: 6,
  productName: "Blusa",
  graphicManifestKey: "blusa-antifluido-t180",
  attributes: [
    {
      id: 63,
      name: "Modelo de cuello",
      displayType: "radio",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 334,
          name: "CUELLO V",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 335,
          name: "PRESILLAS",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 336,
          name: "PUNTAS",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 346,
          name: "PUNTADAS",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 338,
          name: "JDC",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2601,
          name: "Nombre editable del cuello alto",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2593,
          name: "2019",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2599,
          name: "PRESILLA OVALO",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 343,
          name: "OVALADO",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2956,
          name: "EL HATO",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 340,
          name: "CUCUTA",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 341,
          name: "ENFERMERA UB",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 352,
          name: "MATRIOSKA",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 353,
          name: "MARIPOSA",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 7013,
          name: "MARIPOSA DIVIDIDO",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 7014,
          name: "MODELO 29",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 354,
          name: "20-20",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 355,
          name: "DEPORTIVO",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 356,
          name: "ESTRELLA",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 357,
          name: "POLO",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2938,
          name: "BOTONES",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2940,
          name: "20-21",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2942,
          name: "CUELLO REDONDO",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2944,
          name: "CREMALLERA",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2948,
          name: "PEDAGOGIA",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2950,
          name: "ORIENTAL",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2954,
          name: "CIRUGÍA",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2952,
          name: "CUELLO ALTO CON CREMALLERA",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2962,
          name: "CHEROKEE",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
        {
          id: 2963,
          name: "PICOS",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
      ],
    },
    {
      id: 811,
      name: "Modelo de Blusa",
      displayType: "image",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 2866,
          name: "Lizo",
          attributeId: 811,
          attributeName: "Modelo de Blusa",
        },
        {
          id: 2867,
          name: "Pespunte",
          attributeId: 811,
          attributeName: "Modelo de Blusa",
        },
      ],
    },
    {
      id: 812,
      name: "Modelo de mangas",
      displayType: "image",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 8121,
          name: "Original",
          attributeId: 812,
          attributeName: "Modelo de mangas",
        },
      ],
    },
    {
      id: 90,
      name: "Color",
      displayType: "color",
      selectionMode: "single",
      variantMode: "variant",
      values: [
        {
          id: 4845,
          name: "135313 - Azul Aruba",
          attributeId: 90,
          attributeName: "Color",
          colorHex: "#B2D4D1",
        },
      ],
    },
    {
      id: 69,
      name: "Tipo de bolsillos inferiores",
      displayType: "radio",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 2561,
          name: "Lizo",
          attributeId: 69,
          attributeName: "Tipo de bolsillos inferiores",
        },
        {
          id: 5342,
          name: "Sin bolsillos",
          attributeId: 69,
          attributeName: "Tipo de bolsillos inferiores",
        },
      ],
    },
    {
      id: 70,
      name: "Modelo bolsillo inferior",
      displayType: "radio",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 2578,
          name: "Modelo Lizo",
          attributeId: 70,
          attributeName: "Modelo bolsillo inferior",
        },
        {
          id: 381,
          name: "AROS",
          attributeId: 70,
          attributeName: "Modelo bolsillo inferior",
        },
        {
          id: 383,
          name: "RIBETE",
          attributeId: 70,
          attributeName: "Modelo bolsillo inferior",
        },
        {
          id: 382,
          name: "COSTURA",
          attributeId: 70,
          attributeName: "Modelo bolsillo inferior",
        },
        {
          id: 384,
          name: "COSTURA MARÍA",
          attributeId: 70,
          attributeName: "Modelo bolsillo inferior",
        },
        {
          id: 2965,
          name: "BOLSILLO PRESILLAS",
          attributeId: 70,
          attributeName: "Modelo bolsillo inferior",
        },
        {
          id: 388,
          name: "RIBETE VERTICAL",
          attributeId: 70,
          attributeName: "Modelo bolsillo inferior",
        },
        {
          id: 391,
          name: "COSTURA OVALADO",
          attributeId: 70,
          attributeName: "Modelo bolsillo inferior",
        },
        {
          id: 390,
          name: "ANDES HOMBRE",
          attributeId: 70,
          attributeName: "Modelo bolsillo inferior",
        },
      ],
    },
    {
      id: 102,
      name: "Modelo bolsillo de pecho",
      displayType: "radio",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 6101,
          name: "Rectangular",
          attributeId: 102,
          attributeName: "Modelo bolsillo de pecho",
        },
        {
          id: 6102,
          name: "Ninguno",
          attributeId: 102,
          attributeName: "Modelo bolsillo de pecho",
        },
        {
          id: 6103,
          name: "Modelo 2",
          attributeId: 102,
          attributeName: "Modelo bolsillo de pecho",
        },
        {
          id: 6104,
          name: "Cremallera punta",
          attributeId: 102,
          attributeName: "Modelo bolsillo de pecho",
        },
        {
          id: 6106,
          name: "Punta",
          attributeId: 102,
          attributeName: "Modelo bolsillo de pecho",
        },
        {
          id: 6105,
          name: "Cremallera externo",
          attributeId: 102,
          attributeName: "Modelo bolsillo de pecho",
        },
        {
          id: 6107,
          name: "Cremallera interno",
          attributeId: 102,
          attributeName: "Modelo bolsillo de pecho",
        },
      ],
    },
    {
      id: 120,
      name: "Logo",
      displayType: "multi",
      selectionMode: "multiple",
      variantMode: "no_variant",
      values: [
        {
          id: 7001,
          name: "Bolsillo de pecho izquierdo",
          attributeId: 120,
          attributeName: "Logo",
        },
        {
          id: 7002,
          name: "Sin logo",
          attributeId: 120,
          attributeName: "Logo",
        },
      ],
    },
    {
      id: 91,
      name: "Color de vivo",
      displayType: "color",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 5152,
          name: "131906 - Rosa Pastel",
          attributeId: 91,
          attributeName: "Color de vivo",
          colorHex: "#f4c7cc",
        },
      ],
    },
    {
      id: 92,
      name: "Seccion de vivo",
      displayType: "multi",
      selectionMode: "multiple",
      variantMode: "no_variant",
      values: [
        {
          id: 5146,
          name: "Cogotera",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 5149,
          name: "Bolsillo pecho",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 7040,
          name: "Bolsillo pecho superior",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 7041,
          name: "Bolsillo pecho inferior",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 7042,
          name: "Cremallera",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 5147,
          name: "Cuello",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 2898,
          name: "Cuello aros",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 7010,
          name: "Cuello puntadas",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 7011,
          name: "Cuello Borde Dividido superior",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 7012,
          name: "Cuello Borde Dividido inferior",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 7009,
          name: "Cuello arco",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 2901,
          name: "Cuello interno",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 2877,
          name: "Aletas",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 416,
          name: "Cuello V lineal externo derecho",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 417,
          name: "Cuello V lineal interno derecho",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 2907,
          name: "Cuello V lineal externo izquierdo",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 2910,
          name: "Cuello V lineal interno izquierdo",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 2913,
          name: "Cuello V Completo interior derecho",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 2916,
          name: "Cuello V Completo interior izquierdo",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 421,
          name: "Cuello alto",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 5154,
          name: "Cuello completo",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 5155,
          name: "Cuello V lineal interno izquierdo",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 5156,
          name: "Cuello V lineal interno derecho",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 5150,
          name: "Bolsillos inferiores parte superior",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 5153,
          name: "Bolsillos inferiores parte baja",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
        {
          id: 5423,
          name: "Sin vivos",
          attributeId: 92,
          attributeName: "Seccion de vivo",
        },
      ],
    },
  ],
  selectedValueIds: {
    "63": [2601],
    "811": [2866],
    "69": [2561],
    "70": [2578],
    "90": [4845],
    "91": [5152],
  },
  customValuesByValueId: {},
  exclusions: [],
  status: {
    orderState: "draft",
    canEdit: true,
    isLocked: false,
    version: 0,
    generatedAt: null,
  },
  existingDesignBase64: null,
  warnings: [],
};

const pantalonSession: ConfiguratorSession = {
  saleOrderLineId: 289,
  saleOrderId: 118,
  orderName: "S00118",
  productId: 54857,
  productTemplateId: 19,
  productName: "Pantalon",
  graphicManifestKey: "pantalon",
  attributes: [
    {
      id: 90,
      name: "Color",
      displayType: "radio",
      selectionMode: "single",
      variantMode: "variant",
      values: [
        {
          id: 6921,
          name: "110601 - Blanco",
          attributeId: 90,
          attributeName: "Color",
          colorHex: "#F0F0F0",
        },
      ],
    },
    {
      id: 810,
      name: "Modelo de pantalón",
      displayType: "image",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 2863,
          name: "Lizo",
          attributeId: 810,
          attributeName: "Modelo de pantalón",
        },
        {
          id: 2864,
          name: "Pespunte",
          attributeId: 810,
          attributeName: "Modelo de pantalón",
        },
      ],
    },
  ],
  selectedValueIds: {
    "90": [6921],
    "810": [2864],
  },
  customValuesByValueId: {},
  exclusions: [],
  status: {
    orderState: "draft",
    canEdit: true,
    isLocked: false,
    version: 0,
    generatedAt: null,
  },
  existingDesignBase64: null,
  warnings: [],
};

describe("deriveAutomationRenderScene", () => {
  it("no pinta vivos solo con escoger color de vivo", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-08.svg",
    );
    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );
    expect(scene.trimSections).toEqual([]);
  });

  it("no pinta una seccion de vivo si Odoo no tiene color de vivo seleccionado", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "91": [],
      "92": [5146],
    });

    expect(scene.trimSections).toEqual([]);
  });

  it("muestra la blusa cerrada hasta arriba mientras no haya cuello seleccionado", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [],
    });

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg",
    );
    expect(scene.neckAssetPath).toBeUndefined();
  });

  it("usa la base recta para Hombre también en la imagen final", () => {
    const sessionWithManGender: ConfiguratorSession = {
      ...session,
      attributes: [
        {
          id: 142,
          name: "Género",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 531,
              name: "Hombre",
              attributeId: 142,
              attributeName: "Género",
            },
            {
              id: 532,
              name: "Mujer",
              attributeId: 142,
              attributeName: "Género",
            },
          ],
        },
        ...session.attributes,
      ],
    };

    const scene = deriveAutomationRenderScene(sessionWithManGender, {
      ...session.selectedValueIds,
      "63": [],
      "142": [531],
    });

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar-men.svg",
    );
    expect(scene.neckAssetPath).toBeUndefined();
  });

  it("mantiene el SVG completo del cuello y activa cuerpo recto para Hombre", () => {
    const sessionWithManGender: ConfiguratorSession = {
      ...session,
      attributes: [
        {
          id: 142,
          name: "Género",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            { id: 531, name: "Hombre", attributeId: 142, attributeName: "Género" },
          ],
        },
        ...session.attributes,
      ],
    };

    const scene = deriveAutomationRenderScene(sessionWithManGender, {
      ...session.selectedValueIds,
      "63": [2942],
      "142": [531],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-26-cuello-redondo.svg",
    );
    expect(scene.useMaleBlouseSilhouette).toBe(true);
  });

  it("usa el SVG masculino completo para un cuello Hombre compatible", () => {
    const sessionWithManGender: ConfiguratorSession = {
      ...session,
      attributes: [
        {
          id: 142,
          name: "Género",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [{ id: 531, name: "Hombre", attributeId: 142, attributeName: "Género" }],
        },
        ...session.attributes,
      ],
    };

    const scene = deriveAutomationRenderScene(sessionWithManGender, {
      ...session.selectedValueIds,
      "63": [334],
      "142": [531],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-men-model-01-cuello-v.svg",
    );
    expect(scene.useMaleBlouseSilhouette).toBeUndefined();
  });

  it("usa la base cerrada solo en la blusa del Uniforme sin cuello", () => {
    const uniformSession: ConfiguratorSession = {
      ...session,
      productTemplateId: 7,
      productName: "Uniforme",
      graphicManifestKey: "uniforme",
      selectedValueIds: {
        ...session.selectedValueIds,
        "63": [],
      },
    };
    const scene = deriveAutomationRenderScene(
      uniformSession,
      uniformSession.selectedValueIds,
    );

    expect(scene.uniformParts?.blouse.garmentAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg",
    );
    expect(scene.uniformParts?.blouse.neckAssetPath).toBeUndefined();
    expect(scene.uniformParts?.pants.garmentAssetPath).toBe(
      "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
  });

  it("carga Pespunte como modelo de blusa base sin reemplazar cuello ni bolsillos", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "811": [2867],
      "63": [2956],
      "70": [2965],
    });

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-45-pespunte.svg",
    );
    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato.svg",
    );
    expect(scene.lowerPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato-lower-pocket.svg",
    );
    expect(scene.garmentDetailAssetPath).toBeUndefined();
    expect(scene.garmentDetailAssetPaths).toBeUndefined();
  });

  it("no duplica el detalle cuando la blusa lleva pespunte", () => {
    const sessionWithPespunteToggle: ConfiguratorSession = {
      ...session,
      attributes: session.attributes.map((attribute) =>
        attribute.id === 811
          ? {
              ...attribute,
              name: "¿Lleva pespunte?",
              values: [
                {
                  id: 1957,
                  name: "No",
                  attributeId: 811,
                  attributeName: "¿Lleva pespunte?",
                },
                {
                  id: 1958,
                  name: "Si",
                  attributeId: 811,
                  attributeName: "¿Lleva pespunte?",
                },
              ],
            }
          : attribute,
      ),
    };
    const scene = deriveAutomationRenderScene(sessionWithPespunteToggle, {
      ...sessionWithPespunteToggle.selectedValueIds,
      "811": [1958],
      "63": [2956],
    });

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-45-pespunte.svg",
    );
    expect(scene.garmentDetailAssetPath).toBeUndefined();
    expect(scene.garmentDetailAssetPaths).toBeUndefined();
  });

  it("usa la blusa cerrada sin cuello si Pespunte no tiene cuello seleccionado", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "811": [2867],
      "63": [],
    });

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg",
    );
    expect(scene.garmentDetailAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg",
    );
    expect(scene.neckAssetPath).toBeUndefined();
  });

  it("usa la blusa cerrada si el cuello seleccionado no tiene asset", () => {
    const sessionWithEmptyNeck: ConfiguratorSession = {
      ...session,
      attributes: session.attributes.map((attribute) =>
        attribute.id === 63
          ? {
              ...attribute,
              values: [
                ...attribute.values,
                {
                  id: 999001,
                  name: "Ninguno",
                  attributeId: 63,
                  attributeName: "Modelo de cuello",
                },
              ],
            }
          : attribute,
      ),
    };
    const scene = deriveAutomationRenderScene(sessionWithEmptyNeck, {
      ...sessionWithEmptyNeck.selectedValueIds,
      "811": [2867],
      "63": [999001],
    });

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg",
    );
    expect(scene.garmentDetailAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg",
    );
    expect(scene.neckAssetPath).toBeUndefined();
  });

  it("no hereda bolsillos de rodilla del pantalon en la blusa del uniforme", () => {
    const uniformSession: ConfiguratorSession = {
      ...session,
      productTemplateId: 7,
      productName: "Uniforme",
      graphicManifestKey: "uniforme",
      attributes: [
        ...session.attributes.map((attribute) =>
          attribute.id === 92
            ? {
                ...attribute,
                values: [
                  ...attribute.values,
                  {
                    id: 22018,
                    name: "Bolsillo lateral de pantalon",
                    attributeId: 92,
                    attributeName: "Seccion de vivo",
                  },
                  {
                    id: 22019,
                    name: "Parche rodilla derecha",
                    attributeId: 92,
                    attributeName: "Seccion de vivo",
                  },
                ],
              }
            : attribute,
        ),
        {
          id: 22010,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 22011,
              name: "Cuadrado",
              attributeId: 22010,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 22012,
          name: "Tipo de bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 22013,
              name: "Lizo",
              attributeId: 22012,
              attributeName: "Tipo de bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 22014,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 22015,
              name: "Cuadrado",
              attributeId: 22014,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 22016,
          name: "Tipo de bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 22017,
              name: "Lizo",
              attributeId: 22016,
              attributeName: "Tipo de bolsillo de parche rodilla izquierda",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...session.selectedValueIds,
        "92": [5146, 5147, 22018, 22019],
        "22010": [22011],
        "22012": [22013],
        "22014": [22015],
        "22016": [22017],
      },
    };
    const scene = deriveAutomationRenderScene(
      uniformSession,
      uniformSession.selectedValueIds,
    );
    const uniformParts = scene.uniformParts;

    expect(uniformParts).toBeDefined();
    const blouseTrimKeys =
      uniformParts?.blouse.trimSections.map((section) => section.key) ?? [];
    const pantsTrimKeys =
      uniformParts?.pants.trimSections.map((section) => section.key) ?? [];

    expect(blouseTrimKeys).toEqual(
      expect.arrayContaining(["cogotera", "cuello"]),
    );
    expect(blouseTrimKeys).not.toContain("bolsillo-lateral-de-pantalon");
    expect(blouseTrimKeys).not.toContain("parche-rodilla-derecha");
    expect(pantsTrimKeys).toEqual(
      expect.arrayContaining([
        "bolsillo-lateral-de-pantalon",
        "parche-rodilla-derecha",
      ]),
    );
    expect(pantsTrimKeys).not.toContain("cogotera");
    expect(pantsTrimKeys).not.toContain("cuello");
    expect(uniformParts?.pants.pantsSidePocketType).toBe("doubleZipper");
    expect(uniformParts?.pants.pantsKneePatchRightModel).toBe("square");
    expect(uniformParts?.pants.pantsKneePatchRightType).toBe("plain");
    expect(uniformParts?.pants.pantsKneePatchLeftModel).toBe("square");
    expect(uniformParts?.pants.pantsKneePatchLeftType).toBe("plain");
    expect(uniformParts?.blouse.pantsSidePocketType).toBeUndefined();
    expect(uniformParts?.blouse.pantsKneePatchRightModel).toBeUndefined();
    expect(uniformParts?.blouse.pantsKneePatchRightType).toBeUndefined();
    expect(uniformParts?.blouse.pantsKneePatchLeftModel).toBeUndefined();
    expect(uniformParts?.blouse.pantsKneePatchLeftType).toBeUndefined();
  });

  it("aplica el vivo Pespunte de Uniforme a blusa y pantalon", () => {
    const uniformSession: ConfiguratorSession = {
      ...session,
      productTemplateId: 7,
      productName: "Uniforme",
      graphicManifestKey: "uniforme",
      attributes: session.attributes.map((attribute) =>
        attribute.id === 92
          ? {
              ...attribute,
              values: [
                ...attribute.values,
                {
                  id: 8803,
                  name: "Pespunte",
                  attributeId: 92,
                  attributeName: "Seccion de vivo",
                },
              ],
            }
          : attribute,
      ),
      selectedValueIds: {
        ...session.selectedValueIds,
        "91": [5152],
        "92": [8803],
      },
    };
    const scene = deriveAutomationRenderScene(
      uniformSession,
      uniformSession.selectedValueIds,
    );
    const uniformParts = scene.uniformParts;

    expect(uniformParts?.blouse.trimSections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "pespunte", colorHex: "#f4c7cc" }),
      ]),
    );
    expect(uniformParts?.pants.trimSections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "pespunte", colorHex: "#f4c7cc" }),
      ]),
    );
  });

  it("usa el relleno Asorsalud para Bolsillo de pretina en Uniforme", () => {
    const uniformSession: ConfiguratorSession = {
      ...session,
      productTemplateId: 7,
      productName: "Uniforme",
      graphicManifestKey: "uniforme",
      attributes: [
        ...session.attributes.map((attribute) =>
          attribute.id === 92
            ? {
                ...attribute,
                values: [
                  ...attribute.values,
                  {
                    id: 8810,
                    name: "Bolsillo lateral de pantalon",
                    attributeId: 92,
                    attributeName: "Seccion de vivo",
                  },
                ],
              }
            : attribute,
        ),
        {
          id: 8811,
          name: "Bolsillo de pretina",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 8812,
              name: "Asorsalud",
              attributeId: 8811,
              attributeName: "Bolsillo de pretina",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...session.selectedValueIds,
        "91": [5152],
        "92": [8810],
        "8811": [8812],
      },
    };

    const scene = deriveAutomationRenderScene(
      uniformSession,
      uniformSession.selectedValueIds,
    );

    expect(scene.uniformParts?.pants.pantsSidePocketType).toBe("asorsalud");
  });

  it("aplica pespunte a blusa y pantalon cuando Uniforme lleva pespunte", () => {
    const uniformSession: ConfiguratorSession = {
      ...session,
      productTemplateId: 7,
      productName: "Uniforme",
      graphicManifestKey: "uniforme",
      attributes: [
        ...session.attributes,
        {
          id: 880,
          name: "¿Lleva pespunte?",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 8801,
              name: "No",
              attributeId: 880,
              attributeName: "¿Lleva pespunte?",
            },
            {
              id: 8802,
              name: "Si",
              attributeId: 880,
              attributeName: "¿Lleva pespunte?",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...session.selectedValueIds,
        "880": [8802],
      },
    };
    const scene = deriveAutomationRenderScene(
      uniformSession,
      uniformSession.selectedValueIds,
    );
    const uniformParts = scene.uniformParts;

    expect(uniformParts?.blouse.garmentDetailAssetPaths).toContain(
      "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg",
    );
    expect(uniformParts?.pants.garmentDetailAssetPaths).toContain(
      "assets/catalog/pantalon/detail-overlays/pants-pespunte-stitching.svg",
    );
  });

  it("resuelve LOS ANDES y ALETAS con sus IDs actuales de Odoo", () => {
    const sessionWithCurrentLowerPocketIds: ConfiguratorSession = {
      ...session,
      attributes: session.attributes.map((attribute) =>
        attribute.id === 70
          ? {
              ...attribute,
              values: [
                ...attribute.values,
                {
                  id: 387,
                  name: "LOS ANDES",
                  attributeId: 70,
                  attributeName: "Modelo bolsillo inferior",
                },
                {
                  id: 3205,
                  name: "ALETAS",
                  attributeId: 70,
                  attributeName: "Modelo bolsillo inferior",
                },
              ],
            }
          : attribute,
      ),
    };
    const withLosAndes = deriveAutomationRenderScene(
      sessionWithCurrentLowerPocketIds,
      {
        ...sessionWithCurrentLowerPocketIds.selectedValueIds,
        "69": [2561],
        "70": [387],
      },
    );
    const withAletas = deriveAutomationRenderScene(
      sessionWithCurrentLowerPocketIds,
      {
        ...sessionWithCurrentLowerPocketIds.selectedValueIds,
        "69": [2561],
        "70": [3205],
      },
    );

    expect(withLosAndes.lowerPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-48-los-andes-lower-pocket-v2.svg",
    );
    expect(withAletas.lowerPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-16.svg",
    );
  });

  it("mantiene el cuello V-DIVIDIDO cuando la blusa base es Pespunte", () => {
    const sessionWithVDividido: ConfiguratorSession = {
      ...session,
      attributes: session.attributes.map((attribute) =>
        attribute.id === 63
          ? {
              ...attribute,
              values: attribute.values.map((value) =>
                value.id === 7013
                  ? { ...value, sourceValueId: 562, name: "V - DIVIDIDO" }
                  : value,
              ),
            }
          : attribute,
      ),
    };
    const scene = deriveAutomationRenderScene(sessionWithVDividido, {
      ...sessionWithVDividido.selectedValueIds,
      "811": [2867],
      "63": [7013],
    });

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-45-pespunte.svg",
    );
    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-36-v-dividido.svg",
    );
  });

  it("agrega mangas Original como overlay independiente del modelo de cuello", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2963],
      "812": [8121],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-12-cherokee.svg",
    );
    expect(scene.garmentDetailAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
    );
    expect(scene.garmentDetailAssetPaths).toEqual([
      "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
    ]);
  });

  it("usa Pespunte de pantalon como capa global sobre la base liza", () => {
    const scene = deriveAutomationRenderScene(
      pantalonSession,
      pantalonSession.selectedValueIds,
    );

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(scene.garmentDetailAssetPath).toBe(
      "assets/catalog/pantalon/detail-overlays/pants-pespunte-stitching.svg",
    );
  });

  it("usa Tipo bota Tradicional como overlay independiente del pantalon", () => {
    const sessionWithTraditionalBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 84,
          name: "Tipo bota",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 999999,
              name: "Tradicional",
              attributeId: 84,
              attributeName: "Tipo bota",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999999],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithTraditionalBoot,
      sessionWithTraditionalBoot.selectedValueIds,
    );

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(scene.bootAssetPath).toBe(
      "assets/catalog/pantalon/detail-overlays/pants-boot-tradicional.svg",
    );
  });

  it("usa Tipo bota Resorte como overlay independiente del pantalon", () => {
    const sessionWithElasticBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 84,
          name: "Tipo bota",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 999998,
              name: "Resorte",
              attributeId: 84,
              attributeName: "Tipo bota",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999998],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithElasticBoot,
      sessionWithElasticBoot.selectedValueIds,
    );

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(scene.bootAssetPath).toBe(
      "assets/catalog/pantalon/detail-overlays/pants-boot-resorte.svg",
    );
  });

  it("usa Tipo bota Con abertura como overlay independiente del pantalon", () => {
    const sessionWithOpenBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 84,
          name: "Tipo bota",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 999997,
              name: "Con abertura",
              attributeId: 84,
              attributeName: "Tipo bota",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999997],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithOpenBoot,
      sessionWithOpenBoot.selectedValueIds,
    );

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(scene.bootAssetPath).toBe(
      "assets/catalog/pantalon/detail-overlays/pants-boot-con-abertura.svg",
    );
  });

  it("usa Tipo bota Abertura frontal como overlay independiente del pantalon", () => {
    const sessionWithFrontOpeningBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 84,
          name: "Tipo bota",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 999994,
              name: "Abertura frontal",
              attributeId: 84,
              attributeName: "Tipo bota",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999994],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithFrontOpeningBoot,
      sessionWithFrontOpeningBoot.selectedValueIds,
    );

    expect(scene.bootAssetPath).toBe(
      "assets/catalog/pantalon/detail-overlays/pants-boot-abertura-frontal.svg",
    );
  });

  it("usa Tipo bota Abertura lateral como overlay independiente del pantalon", () => {
    const sessionWithSideOpeningBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 84,
          name: "Tipo bota",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 999993,
              name: "Abertura lateral",
              attributeId: 84,
              attributeName: "Tipo bota",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999993],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithSideOpeningBoot,
      sessionWithSideOpeningBoot.selectedValueIds,
    );

    expect(scene.bootAssetPath).toBe(
      "assets/catalog/pantalon/detail-overlays/pants-boot-abertura-lateral.svg",
    );
  });

  it("usa Tipo bota Campana como bota limpia independiente del pantalon", () => {
    const sessionWithBellBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 84,
          name: "Tipo bota",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 999996,
              name: "Campana",
              attributeId: 84,
              attributeName: "Tipo bota",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999996],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithBellBoot,
      sessionWithBellBoot.selectedValueIds,
    );

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(scene.bootAssetPath).toBe(
      "assets/catalog/pantalon/detail-overlays/pants-boot-campana.svg",
    );
  });

  it("usa Tipo bota Cremallera como overlay lateral independiente del pantalon", () => {
    const sessionWithZipperBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 84,
          name: "Tipo bota",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 999995,
              name: "Cremallera",
              attributeId: 84,
              attributeName: "Tipo bota",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999995],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithZipperBoot,
      sessionWithZipperBoot.selectedValueIds,
    );

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(scene.bootAssetPath).toBe(
      "assets/catalog/pantalon/detail-overlays/pants-boot-cremallera.svg",
    );
  });

  it("usa Cinturilla Completa resortada como overlay independiente del pantalon", () => {
    const sessionWithWaistband: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9999,
          name: "Cinturilla",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 999994,
              name: "Completa resortada",
              attributeId: 9999,
              attributeName: "Cinturilla",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9999": [999994],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithWaistband,
      sessionWithWaistband.selectedValueIds,
    );

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(scene.waistbandAssetPath).toBe(
      "assets/catalog/pantalon/detail-overlays/pants-waist-resortada.svg",
    );
  });

  it("usa Cinturilla Pretina de boton como overlay independiente del pantalon", () => {
    const sessionWithWaistband: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9999,
          name: "Cinturilla",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 999993,
              name: "Pretina de botón",
              attributeId: 9999,
              attributeName: "Cinturilla",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9999": [999993],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithWaistband,
      sessionWithWaistband.selectedValueIds,
    );

    expect(scene.garmentAssetPath).toBe(
      "assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(scene.waistbandAssetPath).toBe(
      "assets/catalog/pantalon/detail-overlays/pants-waist-pretina-boton.svg",
    );
  });

  it.each(["Doble cremallera", "Externo", "Original"])(
    "activa vivo de bolsillo lateral de pantalon con %s",
    (sidePocketName) => {
    const sessionWithSidePocket: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9001,
          name: "Bolsillo lateral",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9002,
              name: sidePocketName,
              attributeId: 9001,
              attributeName: "Bolsillo lateral",
            },
          ],
        },
        {
          id: 157,
          name: "Sección de vivo",
          displayType: "option",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9003,
              name: "Bolsillo lateral de pantalón",
              attributeId: 157,
              attributeName: "Sección de vivo",
            },
          ],
        },
        {
          id: 802,
          name: "Color de vivos",
          displayType: "color",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9004,
              name: "Violeta",
              attributeId: 802,
              attributeName: "Color de vivos",
              colorHex: "#a000b0",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9001": [9002],
        "157": [9003],
        "802": [9004],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithSidePocket,
      sessionWithSidePocket.selectedValueIds,
    );

    expect(scene.pantsSidePocketType).toBe("doubleZipper");
    expect(scene.trimSections).toContainEqual({
      valueId: 9003,
      key: "bolsillo-lateral-de-pantalon",
      label: "Bolsillo lateral de pantalón",
      colorHex: "#a000b0",
    });
    },
  );

  it("activa el bolsillo lateral Asorsalud para el vivo de pantalon", () => {
    const sessionWithSidePocket: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9001,
          name: "Bolsillo lateral",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9005,
              name: "Asorsalud",
              attributeId: 9001,
              attributeName: "Bolsillo lateral",
            },
          ],
        },
        {
          id: 157,
          name: "Seccion de vivo",
          displayType: "option",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9003,
              name: "Bolsillo lateral de pantalon",
              attributeId: 157,
              attributeName: "Seccion de vivo",
            },
          ],
        },
        {
          id: 802,
          name: "Color de vivos",
          displayType: "color",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9004,
              name: "Violeta",
              attributeId: 802,
              attributeName: "Color de vivos",
              colorHex: "#a000b0",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9001": [9005],
        "157": [9003],
        "802": [9004],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithSidePocket,
      sessionWithSidePocket.selectedValueIds,
    );

    expect(scene.pantsSidePocketType).toBe("asorsalud");
    expect(scene.trimSections).toContainEqual({
      valueId: 9003,
      key: "bolsillo-lateral-de-pantalon",
      label: "Bolsillo lateral de pantalon",
      colorHex: "#a000b0",
    });
  });

  it("activa bolsillos de parche de rodilla cuadrados con cremallera horizontal", () => {
    const sessionWithKneePatches: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9010,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9011,
              name: "Cuadrado",
              attributeId: 9010,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9012,
          name: "Tipo de bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9013,
              name: "Cremallera horizontal",
              attributeId: 9012,
              attributeName: "Tipo de bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9014,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9015,
              name: "Cuadrado",
              attributeId: 9014,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 9016,
          name: "Tipo de bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9017,
              name: "Cremallera horizontal",
              attributeId: 9016,
              attributeName: "Tipo de bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 157,
          name: "Seccion de vivo",
          displayType: "option",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9018,
              name: "Parche rodilla",
              attributeId: 157,
              attributeName: "Seccion de vivo",
            },
          ],
        },
        {
          id: 802,
          name: "Color de vivos",
          displayType: "color",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9019,
              name: "Violeta",
              attributeId: 802,
              attributeName: "Color de vivos",
              colorHex: "#a000b0",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9010": [9011],
        "9012": [9013],
        "9014": [9015],
        "9016": [9017],
        "157": [9018],
        "802": [9019],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithKneePatches,
      sessionWithKneePatches.selectedValueIds,
    );

    expect(scene.pantsKneePatchRightModel).toBe("square");
    expect(scene.pantsKneePatchRightType).toBe("horizontalZipper");
    expect(scene.pantsKneePatchLeftModel).toBe("square");
    expect(scene.pantsKneePatchLeftType).toBe("horizontalZipper");
    expect(scene.trimSections).toContainEqual({
      valueId: 9018,
      key: "parche-rodilla",
      label: "Parche rodilla",
      colorHex: "#a000b0",
    });
  });

  it("activa bolsillos de parche de rodilla cuadrados lisos", () => {
    const sessionWithPlainKneePatches: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9020,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9021,
              name: "Cuadrado",
              attributeId: 9020,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9022,
          name: "Tipo de bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9023,
              name: "Lizo",
              attributeId: 9022,
              attributeName: "Tipo de bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9024,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9025,
              name: "Cuadrado",
              attributeId: 9024,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 9026,
          name: "Tipo de bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9027,
              name: "Lizo",
              attributeId: 9026,
              attributeName: "Tipo de bolsillo de parche rodilla izquierda",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9020": [9021],
        "9022": [9023],
        "9024": [9025],
        "9026": [9027],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithPlainKneePatches,
      sessionWithPlainKneePatches.selectedValueIds,
    );

    expect(scene.pantsKneePatchRightModel).toBe("square");
    expect(scene.pantsKneePatchRightType).toBe("plain");
    expect(scene.pantsKneePatchLeftModel).toBe("square");
    expect(scene.pantsKneePatchLeftType).toBe("plain");
  });

  it("activa bolsillos de parche de rodilla cuadrados sobrepuestos", () => {
    const sessionWithOverlaidKneePatches: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 12010,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 12011,
              name: "Cuadrado",
              attributeId: 12010,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 12012,
          name: "Tipo de bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 12013,
              name: "Sobrepuesto derecho",
              attributeId: 12012,
              attributeName: "Tipo de bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 12014,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 12015,
              name: "Cuadrado",
              attributeId: 12014,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 12016,
          name: "Tipo de bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 12017,
              name: "Sobrepuesto izquierdo",
              attributeId: 12016,
              attributeName: "Tipo de bolsillo de parche rodilla izquierda",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "12010": [12011],
        "12012": [12013],
        "12014": [12015],
        "12016": [12017],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithOverlaidKneePatches,
      sessionWithOverlaidKneePatches.selectedValueIds,
    );

    expect(scene.pantsKneePatchRightModel).toBe("square");
    expect(scene.pantsKneePatchRightType).toBe("overlaid");
    expect(scene.pantsKneePatchLeftModel).toBe("square");
    expect(scene.pantsKneePatchLeftType).toBe("overlaid");
  });

  it("activa bolsillos de parche de rodilla cuadrados con cremallera vertical", () => {
    const sessionWithVerticalKneePatches: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9030,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9031,
              name: "Cuadrado",
              attributeId: 9030,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9032,
          name: "Tipo de bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9033,
              name: "Cremallera vertical",
              attributeId: 9032,
              attributeName: "Tipo de bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9034,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9035,
              name: "Cuadrado",
              attributeId: 9034,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 9036,
          name: "Tipo de bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9037,
              name: "Cremallera vertical",
              attributeId: 9036,
              attributeName: "Tipo de bolsillo de parche rodilla izquierda",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9030": [9031],
        "9032": [9033],
        "9034": [9035],
        "9036": [9037],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithVerticalKneePatches,
      sessionWithVerticalKneePatches.selectedValueIds,
    );

    expect(scene.pantsKneePatchRightModel).toBe("square");
    expect(scene.pantsKneePatchRightType).toBe("verticalZipper");
    expect(scene.pantsKneePatchLeftModel).toBe("square");
    expect(scene.pantsKneePatchLeftType).toBe("verticalZipper");
  });

  it("activa bolsillos de parche de rodilla camuflados con broche y boton", () => {
    const sessionWithCamouflageKneePatches: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9040,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9041,
              name: "Camuflado",
              attributeId: 9040,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9042,
          name: "Tipo de bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9043,
              name: "Broche",
              attributeId: 9042,
              attributeName: "Tipo de bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9044,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9045,
              name: "Camuflado",
              attributeId: 9044,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 9046,
          name: "Tipo de bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9047,
              name: "Boton",
              attributeId: 9046,
              attributeName: "Tipo de bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 157,
          name: "Seccion de vivo",
          displayType: "option",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9048,
              name: "Parche rodilla",
              attributeId: 157,
              attributeName: "Seccion de vivo",
            },
          ],
        },
        {
          id: 802,
          name: "Color de vivos",
          displayType: "color",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9049,
              name: "Violeta",
              attributeId: 802,
              attributeName: "Color de vivos",
              colorHex: "#a000b0",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9040": [9041],
        "9042": [9043],
        "9044": [9045],
        "9046": [9047],
        "157": [9048],
        "802": [9049],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithCamouflageKneePatches,
      sessionWithCamouflageKneePatches.selectedValueIds,
    );

    expect(scene.pantsKneePatchRightModel).toBe("camouflage");
    expect(scene.pantsKneePatchRightType).toBe("snap");
    expect(scene.pantsKneePatchLeftModel).toBe("camouflage");
    expect(scene.pantsKneePatchLeftType).toBe("button");
    expect(scene.trimSections).toContainEqual({
      valueId: 9048,
      key: "parche-rodilla",
      label: "Parche rodilla",
      colorHex: "#a000b0",
    });
  });

  it("activa velcro en bolsillos de parche de rodilla camuflados", () => {
    const sessionWithVelcroKneePatches: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 19140,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 19141,
              name: "Camuflado",
              attributeId: 19140,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 19142,
          name: "Tipo de bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 19143,
              name: "Velcro",
              attributeId: 19142,
              attributeName: "Tipo de bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 19144,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 19145,
              name: "Camuflado",
              attributeId: 19144,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 19146,
          name: "Tipo de bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 19147,
              name: "Velcro",
              attributeId: 19146,
              attributeName: "Tipo de bolsillo de parche rodilla izquierda",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "19140": [19141],
        "19142": [19143],
        "19144": [19145],
        "19146": [19147],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithVelcroKneePatches,
      sessionWithVelcroKneePatches.selectedValueIds,
    );

    expect(scene.pantsKneePatchRightModel).toBe("camouflage");
    expect(scene.pantsKneePatchRightType).toBe("velcro");
    expect(scene.pantsKneePatchLeftModel).toBe("camouflage");
    expect(scene.pantsKneePatchLeftType).toBe("velcro");
  });

  it("activa doble boton en bolsillos de parche de rodilla camuflados", () => {
    const sessionWithDoubleButtonKneePatches: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 19040,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 19041,
              name: "Camuflado",
              attributeId: 19040,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 19042,
          name: "Tipo de bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 19043,
              name: "Doble botón",
              attributeId: 19042,
              attributeName: "Tipo de bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 19044,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 19045,
              name: "Camuflado",
              attributeId: 19044,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 19046,
          name: "Tipo de bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 19047,
              name: "Doble botón",
              attributeId: 19046,
              attributeName: "Tipo de bolsillo de parche rodilla izquierda",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "19040": [19041],
        "19042": [19043],
        "19044": [19045],
        "19046": [19047],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithDoubleButtonKneePatches,
      sessionWithDoubleButtonKneePatches.selectedValueIds,
    );

    expect(scene.pantsKneePatchRightModel).toBe("camouflage");
    expect(scene.pantsKneePatchRightType).toBe("doubleButton");
    expect(scene.pantsKneePatchLeftModel).toBe("camouflage");
    expect(scene.pantsKneePatchLeftType).toBe("doubleButton");
  });

  it("activa bolsillos camuflados de rodilla con hebilla", () => {
    const sessionWithCamouflageBuckleKneePatches: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9070,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9071,
              name: "Camuflado",
              attributeId: 9070,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9072,
          name: "Tipo de bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9073,
              name: "Hebilla",
              attributeId: 9072,
              attributeName: "Tipo de bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9074,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9075,
              name: "Camuflado",
              attributeId: 9074,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 9076,
          name: "Tipo de bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9077,
              name: "Hebilla",
              attributeId: 9076,
              attributeName: "Tipo de bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 157,
          name: "Seccion de vivo",
          displayType: "option",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9078,
              name: "Parche rodilla",
              attributeId: 157,
              attributeName: "Seccion de vivo",
            },
          ],
        },
        {
          id: 802,
          name: "Color de vivos",
          displayType: "color",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9079,
              name: "Violeta",
              attributeId: 802,
              attributeName: "Color de vivos",
              colorHex: "#a000b0",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9070": [9071],
        "9072": [9073],
        "9074": [9075],
        "9076": [9077],
        "157": [9078],
        "802": [9079],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithCamouflageBuckleKneePatches,
      sessionWithCamouflageBuckleKneePatches.selectedValueIds,
    );

    expect(scene.pantsKneePatchRightModel).toBe("camouflage");
    expect(scene.pantsKneePatchRightType).toBe("buckle");
    expect(scene.pantsKneePatchLeftModel).toBe("camouflage");
    expect(scene.pantsKneePatchLeftType).toBe("buckle");
    expect(scene.trimSections).toContainEqual({
      valueId: 9078,
      key: "parche-rodilla",
      label: "Parche rodilla",
      colorHex: "#a000b0",
    });
  });

  it("activa bolsillos de parche de rodilla punta con costura esfero", () => {
    const sessionWithPointKneePatches: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9050,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9051,
              name: "Punta",
              attributeId: 9050,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9052,
          name: "Tipo de bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9053,
              name: "Costura esfero",
              attributeId: 9052,
              attributeName: "Tipo de bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9054,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9055,
              name: "Punta",
              attributeId: 9054,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 9056,
          name: "Tipo de bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9057,
              name: "Costura esfero",
              attributeId: 9056,
              attributeName: "Tipo de bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 157,
          name: "Seccion de vivo",
          displayType: "option",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9058,
              name: "Parche rodilla",
              attributeId: 157,
              attributeName: "Seccion de vivo",
            },
          ],
        },
        {
          id: 802,
          name: "Color de vivos",
          displayType: "color",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9059,
              name: "Violeta",
              attributeId: 802,
              attributeName: "Color de vivos",
              colorHex: "#a000b0",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9050": [9051],
        "9052": [9053],
        "9054": [9055],
        "9056": [9057],
        "157": [9058],
        "802": [9059],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithPointKneePatches,
      sessionWithPointKneePatches.selectedValueIds,
    );

    expect(scene.pantsKneePatchRightModel).toBe("point");
    expect(scene.pantsKneePatchRightType).toBe("penSeam");
    expect(scene.pantsKneePatchLeftModel).toBe("point");
    expect(scene.pantsKneePatchLeftType).toBe("penSeam");
    expect(scene.trimSections).toContainEqual({
      valueId: 9058,
      key: "parche-rodilla",
      label: "Parche rodilla",
      colorHex: "#a000b0",
    });
  });

  it("activa bolsillos de parche de rodilla con pestana triangular", () => {
    const sessionWithTriangularFlapKneePatches: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9060,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9061,
              name: "Pestaña triangular",
              attributeId: 9060,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9062,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9063,
              name: "Pestaña triangular",
              attributeId: 9062,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 157,
          name: "Seccion de vivo",
          displayType: "option",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9064,
              name: "Parche rodilla",
              attributeId: 157,
              attributeName: "Seccion de vivo",
            },
          ],
        },
        {
          id: 802,
          name: "Color de vivos",
          displayType: "color",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9065,
              name: "Violeta",
              attributeId: 802,
              attributeName: "Color de vivos",
              colorHex: "#a000b0",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9060": [9061],
        "9062": [9063],
        "157": [9064],
        "802": [9065],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithTriangularFlapKneePatches,
      sessionWithTriangularFlapKneePatches.selectedValueIds,
    );

    expect(scene.pantsKneePatchRightModel).toBe("triangularFlap");
    expect(scene.pantsKneePatchLeftModel).toBe("triangularFlap");
    expect(scene.trimSections).toContainEqual({
      valueId: 9064,
      key: "parche-rodilla",
      label: "Parche rodilla",
      colorHex: "#a000b0",
    });
  });

  it("activa bolsillos de parche de rodilla ribete con lizo y cremallera", () => {
    const sessionWithRibeteKneePatches: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9080,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9081,
              name: "Ribete",
              attributeId: 9080,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9082,
          name: "Tipo de bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9083,
              name: "Lizo",
              attributeId: 9082,
              attributeName: "Tipo de bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9084,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9085,
              name: "Ribete",
              attributeId: 9084,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 9086,
          name: "Tipo de bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9087,
              name: "Cremallera",
              attributeId: 9086,
              attributeName: "Tipo de bolsillo de parche rodilla izquierda",
            },
          ],
        },
        {
          id: 157,
          name: "Seccion de vivo",
          displayType: "option",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9088,
              name: "Parche rodilla",
              attributeId: 157,
              attributeName: "Seccion de vivo",
            },
          ],
        },
        {
          id: 802,
          name: "Color de vivos",
          displayType: "color",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9089,
              name: "Violeta",
              attributeId: 802,
              attributeName: "Color de vivos",
              colorHex: "#a000b0",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9080": [9081],
        "9082": [9083],
        "9084": [9085],
        "9086": [9087],
        "157": [9088],
        "802": [9089],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithRibeteKneePatches,
      sessionWithRibeteKneePatches.selectedValueIds,
    );

    expect(scene.pantsKneePatchRightModel).toBe("ribete");
    expect(scene.pantsKneePatchRightType).toBe("plain");
    expect(scene.pantsKneePatchLeftModel).toBe("ribete");
    expect(scene.pantsKneePatchLeftType).toBe("zipper");
    expect(scene.trimSections).toContainEqual({
      valueId: 9088,
      key: "parche-rodilla",
      label: "Parche rodilla",
      colorHex: "#a000b0",
    });
  });

  it("activa bolsillos de parche de rodilla internos sin tipo", () => {
    const sessionWithInternalKneePatches: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 9090,
          name: "Modelo bolsillo de parche rodilla derecha",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9091,
              name: "Interno",
              attributeId: 9090,
              attributeName: "Modelo bolsillo de parche rodilla derecha",
            },
          ],
        },
        {
          id: 9092,
          name: "Modelo bolsillo de parche rodilla izquierda",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9093,
              name: "Interno",
              attributeId: 9092,
              attributeName: "Modelo bolsillo de parche rodilla izquierda",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "9090": [9091],
        "9092": [9093],
      },
    };
    const scene = deriveAutomationRenderScene(
      sessionWithInternalKneePatches,
      sessionWithInternalKneePatches.selectedValueIds,
    );

    expect(scene.pantsKneePatchRightModel).toBe("internal");
    expect(scene.pantsKneePatchRightType).toBeUndefined();
    expect(scene.pantsKneePatchLeftModel).toBe("internal");
    expect(scene.pantsKneePatchLeftType).toBeUndefined();
  });

  it("carga PRESILLAS por ID con cuello, aros y cogotera como vivos independientes", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [335],
      "91": [5152],
      "92": [5147, 2898, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-15-presillas.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5147,
        role: "upperNeck",
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2898,
        key: "cuello-aros",
        label: "Cuello aros",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga PUNTAS por ID con el modelo nuevo", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [336],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-06-puntas.svg",
    );
  });

  it("carga PUNTADAS con Cuello puntadas y cogotera", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [346],
      "92": [7010, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-07.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 7010,
        key: "cuello-puntadas",
        label: "Cuello puntadas",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga MARIPOSA DIVIDIDO con bordes divididos y cogotera recta", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [7013],
      "92": [5146, 7011, 7012],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-04.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 7011,
        role: "upperNeck",
        key: "cuello-borde-dividido-superior",
        label: "Cuello Borde Dividido superior",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 7012,
        role: "lowerNeck",
        key: "cuello-borde-dividido-inferior",
        label: "Cuello Borde Dividido inferior",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga MODELO 29 con bordes divididos y cogotera ovalada", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [7014],
      "92": [5146, 7011, 7012],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-28-modelo-29.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 7011,
        role: "upperNeck",
        key: "cuello-borde-dividido-superior",
        label: "Cuello Borde Dividido superior",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 7012,
        role: "lowerNeck",
        key: "cuello-borde-dividido-inferior",
        label: "Cuello Borde Dividido inferior",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("pinta el cuello solo cuando Seccion de vivo tiene Cuello", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2593],
      "92": [5147],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-10.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5147,
        role: "upperNeck",
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("pinta cuello completo con el color de vivo seleccionado", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "92": [5154],
    });

    expect(scene.trimSections).toEqual([
      {
        valueId: 5154,
        role: "upperNeck",
        key: "cuello-completo",
        label: "Cuello completo",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("pasa los lados internos del cuello V con el color de vivo seleccionado", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2593],
      "92": [5155, 5156],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-10.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5155,
        key: "cuello-v-lineal-interno-izquierdo",
        label: "Cuello V lineal interno izquierdo",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5156,
        key: "cuello-v-lineal-interno-derecho",
        label: "Cuello V lineal interno derecho",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga CUELLO ALTO con cuello alto y lineas internas independientes", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2601],
      "92": [421, 5155, 5156],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-08.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 421,
        role: "upperNeck",
        key: "cuello-alto",
        label: "Cuello alto",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5155,
        key: "cuello-v-lineal-interno-izquierdo",
        label: "Cuello V lineal interno izquierdo",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5156,
        key: "cuello-v-lineal-interno-derecho",
        label: "Cuello V lineal interno derecho",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga 20-20 y pasa los vivos internos independientes con cogotera recta", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [354],
      "92": [417, 2910, 5146, 5147],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-50-20-20.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5147,
        role: "upperNeck",
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 417,
        key: "cuello-v-lineal-interno-derecho",
        label: "Cuello V lineal interno derecho",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2910,
        key: "cuello-v-lineal-interno-izquierdo",
        label: "Cuello V lineal interno izquierdo",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("pinta el vivo del bolsillo inferior solo con Bolsillos inferiores parte superior", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "92": [5150],
    });

    expect(scene.trimSections).toEqual([
      {
        valueId: 5150,
        role: "lowerPockets",
        key: "bolsillos-inferiores-parte-superior",
        label: "Bolsillos inferiores parte superior",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga CUELLO V con vivos lineales, completos interiores y cogotera recta", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [334],
      "92": [5146, 416, 417, 2907, 2910, 2913, 2916],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 416,
        key: "cuello-v-lineal-externo-derecho",
        label: "Cuello V lineal externo derecho",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 417,
        key: "cuello-v-lineal-interno-derecho",
        label: "Cuello V lineal interno derecho",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2907,
        key: "cuello-v-lineal-externo-izquierdo",
        label: "Cuello V lineal externo izquierdo",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2910,
        key: "cuello-v-lineal-interno-izquierdo",
        label: "Cuello V lineal interno izquierdo",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2913,
        key: "cuello-v-completo-interior-derecho",
        label: "Cuello V Completo interior derecho",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2916,
        key: "cuello-v-completo-interior-izquierdo",
        label: "Cuello V Completo interior izquierdo",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga JDC con vivos lineales, completos interiores y cogotera recta", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [338],
      "92": [5146, 416, 417, 2907, 2910, 2913, 2916],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-02-jdc.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 416,
        key: "cuello-v-lineal-externo-derecho",
        label: "Cuello V lineal externo derecho",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 417,
        key: "cuello-v-lineal-interno-derecho",
        label: "Cuello V lineal interno derecho",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2907,
        key: "cuello-v-lineal-externo-izquierdo",
        label: "Cuello V lineal externo izquierdo",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2910,
        key: "cuello-v-lineal-interno-izquierdo",
        label: "Cuello V lineal interno izquierdo",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2913,
        key: "cuello-v-completo-interior-derecho",
        label: "Cuello V Completo interior derecho",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2916,
        key: "cuello-v-completo-interior-izquierdo",
        label: "Cuello V Completo interior izquierdo",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("separa el cuello EL HATO del bolsillo inferior BOLSILLO PRESILLAS", () => {
    const withOtherPocket = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2956],
      "70": [2578],
    });
    const withPresillasPocket = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2956],
      "70": [2965],
    });

    expect(withOtherPocket.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato.svg",
    );
    expect(withOtherPocket.lowerPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg",
    );
    expect(withPresillasPocket.lowerPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato-lower-pocket.svg",
    );
  });

  it("marca el elemento auxiliar del bolsillo RECTANGULAR segun el tipo", () => {
    const sessionWithSideTypes: ConfiguratorSession = {
      ...session,
      attributes: session.attributes.map((attribute) =>
        attribute.id === 69
          ? {
              ...attribute,
              values: [
                ...attribute.values,
                {
                  id: 5354,
                  name: "Lizo doble",
                  attributeId: 69,
                  attributeName: "Tipo de bolsillos inferiores",
                },
                {
                  id: 5355,
                  name: "Lizo izquierdo",
                  attributeId: 69,
                  attributeName: "Tipo de bolsillos inferiores",
                },
                {
                  id: 5356,
                  name: "Lizo derecho",
                  attributeId: 69,
                  attributeName: "Tipo de bolsillos inferiores",
                },
                {
                  id: 5357,
                  name: "Sobrepuesto doble",
                  attributeId: 69,
                  attributeName: "Tipo de bolsillos inferiores",
                },
                {
                  id: 5358,
                  name: "Sobrepuesto izquierdo",
                  attributeId: 69,
                  attributeName: "Tipo de bolsillos inferiores",
                },
                {
                  id: 5359,
                  name: "Sobrepuesto derecho",
                  attributeId: 69,
                  attributeName: "Tipo de bolsillos inferiores",
                },
                {
                  id: 5360,
                  name: "Velcro doble",
                  attributeId: 69,
                  attributeName: "Tipo de bolsillos inferiores",
                },
                {
                  id: 5361,
                  name: "Velcro izquierdo",
                  attributeId: 69,
                  attributeName: "Tipo de bolsillos inferiores",
                },
                {
                  id: 5362,
                  name: "Velcro derecho",
                  attributeId: 69,
                  attributeName: "Tipo de bolsillos inferiores",
                },
              ],
            }
          : attribute,
      ),
    };
    const withDouble = deriveAutomationRenderScene(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5354],
      "70": [2578],
    });
    const withLeft = deriveAutomationRenderScene(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5355],
      "70": [2578],
    });
    const withRight = deriveAutomationRenderScene(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5356],
      "70": [2578],
    });
    const withOverlaidDouble = deriveAutomationRenderScene(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5357],
      "70": [2578],
    });
    const withOverlaidLeft = deriveAutomationRenderScene(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5358],
      "70": [2578],
    });
    const withOverlaidRight = deriveAutomationRenderScene(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5359],
      "70": [2578],
    });
    const withVelcroDouble = deriveAutomationRenderScene(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5360],
      "70": [2578],
    });
    const withVelcroLeft = deriveAutomationRenderScene(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5361],
      "70": [2578],
    });
    const withVelcroRight = deriveAutomationRenderScene(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5362],
      "70": [2578],
    });

    expect(withDouble.lowerPocketAuxiliaryAddonKind).toBe("lizo");
    expect(withDouble.lowerPocketAuxiliaryAddonSide).toBe("both");
    expect(withLeft.lowerPocketAuxiliaryAddonKind).toBe("lizo");
    expect(withLeft.lowerPocketAuxiliaryAddonSide).toBe("left");
    expect(withRight.lowerPocketAuxiliaryAddonKind).toBe("lizo");
    expect(withRight.lowerPocketAuxiliaryAddonSide).toBe("right");
    expect(withOverlaidDouble.lowerPocketAuxiliaryAddonKind).toBe("overlaid");
    expect(withOverlaidDouble.lowerPocketAuxiliaryAddonSide).toBe("both");
    expect(withOverlaidLeft.lowerPocketAuxiliaryAddonKind).toBe("overlaid");
    expect(withOverlaidLeft.lowerPocketAuxiliaryAddonSide).toBe("left");
    expect(withOverlaidRight.lowerPocketAuxiliaryAddonKind).toBe("overlaid");
    expect(withOverlaidRight.lowerPocketAuxiliaryAddonSide).toBe("right");
    expect(withVelcroDouble.lowerPocketAuxiliaryAddonKind).toBe("velcro");
    expect(withVelcroDouble.lowerPocketAuxiliaryAddonSide).toBe("both");
    expect(withVelcroLeft.lowerPocketAuxiliaryAddonKind).toBe("velcro");
    expect(withVelcroLeft.lowerPocketAuxiliaryAddonSide).toBe("left");
    expect(withVelcroRight.lowerPocketAuxiliaryAddonKind).toBe("velcro");
    expect(withVelcroRight.lowerPocketAuxiliaryAddonSide).toBe("right");

    for (const modelId of [381, 383]) {
      const withModelLizoDouble = deriveAutomationRenderScene(
        sessionWithSideTypes,
        {
          ...sessionWithSideTypes.selectedValueIds,
          "69": [5354],
          "70": [modelId],
        },
      );
      const withModelOverlaidLeft = deriveAutomationRenderScene(
        sessionWithSideTypes,
        {
          ...sessionWithSideTypes.selectedValueIds,
          "69": [5358],
          "70": [modelId],
        },
      );
      const withModelVelcroRight = deriveAutomationRenderScene(
        sessionWithSideTypes,
        {
          ...sessionWithSideTypes.selectedValueIds,
          "69": [5362],
          "70": [modelId],
        },
      );

      expect(withModelLizoDouble.lowerPocketAuxiliaryAddonKind).toBe("lizo");
      expect(withModelLizoDouble.lowerPocketAuxiliaryAddonSide).toBe("both");
      expect(withModelOverlaidLeft.lowerPocketAuxiliaryAddonKind).toBe(
        "overlaid",
      );
      expect(withModelOverlaidLeft.lowerPocketAuxiliaryAddonSide).toBe("left");
      expect(withModelVelcroRight.lowerPocketAuxiliaryAddonKind).toBe("velcro");
      expect(withModelVelcroRight.lowerPocketAuxiliaryAddonSide).toBe("right");
    }
  });

  it("aplica COSTURA como modelo de bolsillo inferior con vivos superior y bajo separados", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "70": [382],
      "92": [5150, 5153],
    });

    expect(scene.lowerPocketLayout).toBe("double");
    expect(scene.lowerPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-18-costura-lower-pocket.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5150,
        role: "lowerPockets",
        key: "bolsillos-inferiores-parte-superior",
        label: "Bolsillos inferiores parte superior",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5153,
        key: "bolsillos-inferiores-parte-baja",
        label: "Bolsillos inferiores parte baja",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("aplica COSTURA MARIA como modelo de bolsillo inferior con vivo superior", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "70": [384],
      "92": [5150],
    });

    expect(scene.lowerPocketLayout).toBe("double");
    expect(scene.lowerPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-20-costura-maria-lower-pocket.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5150,
        role: "lowerPockets",
        key: "bolsillos-inferiores-parte-superior",
        label: "Bolsillos inferiores parte superior",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga ORIENTAL y aplica RIBETE VERTICAL como bolsillo inferior independiente", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2950],
      "70": [388],
      "92": [421, 5146, 5150],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-33-oriental.svg",
    );
    expect(scene.lowerPocketLayout).toBe("double");
    expect(scene.lowerPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-33-oriental-lower-pocket.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 421,
        role: "upperNeck",
        key: "cuello-alto",
        label: "Cuello alto",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5150,
        role: "lowerPockets",
        key: "bolsillos-inferiores-parte-superior",
        label: "Bolsillos inferiores parte superior",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga PEDAGOGIA como modelo de cuello independiente", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2948],
      "92": [421, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-29-pedagogia.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 421,
        role: "upperNeck",
        key: "cuello-alto",
        label: "Cuello alto",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga CUELLO REDONDO y pinta el cuello con la seccion Cuello", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2942],
      "92": [5147, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-26-cuello-redondo.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5147,
        role: "upperNeck",
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga ESTRELLA y pasa Cuello, Aletas y cogotera como vivos independientes", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [356],
      "92": [5147, 2877, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-22-estrella.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5147,
        role: "upperNeck",
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2877,
        key: "aletas",
        label: "Aletas",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga BOTONES y pinta el cuello con la seccion Cuello", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2938],
      "92": [5147, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-24-botones.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5147,
        role: "upperNeck",
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga POLO como modelo sin overlay de cuello", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [357],
      "92": [5147, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-23-polo.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5147,
        role: "upperNeck",
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga DEPORTIVO como modelo sin overlay de cuello", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [355],
      "92": [5147, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-21-deportivo.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5147,
        role: "upperNeck",
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga MARIPOSA sin bolsillos integrados y sin overlay de cuello", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [353],
      "92": [5147, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-40-mariposa.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5147,
        role: "upperNeck",
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga MATRIOSKA y pasa Cuello interno con cogotera ovalada", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [352],
      "92": [2901, 5147, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-41-matrioska.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5147,
        role: "upperNeck",
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2901,
        key: "cuello-interno",
        label: "Cuello interno",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga CUCUTA y pasa Cuello interno con cogotera especial", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [340],
      "92": [2901, 5147, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-44-cucuta.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5147,
        role: "upperNeck",
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2901,
        key: "cuello-interno",
        label: "Cuello interno",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga ENFERMERA UB con Cuello completo y cogotera ovalada", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [341],
      "92": [5154, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-43.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5154,
        role: "upperNeck",
        key: "cuello-completo",
        label: "Cuello completo",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga OVALADO con Cuello arco y cogotera curva", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [343],
      "92": [7009, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-09.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 7009,
        key: "cuello-arco",
        label: "Cuello arco",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga 20-21 y pasa los vivos externos independientes", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2940],
      "92": [416, 2907, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-25-20-21.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 416,
        key: "cuello-v-lineal-externo-derecho",
        label: "Cuello V lineal externo derecho",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2907,
        key: "cuello-v-lineal-externo-izquierdo",
        label: "Cuello V lineal externo izquierdo",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("deja CHEROKEE pendiente sin modelo de cuello especifico", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2962],
      "92": [416, 2907, 5146],
    });

    expect(scene.neckAssetPath).toBeUndefined();
  });

  it("carga PICOS con el modelo que antes estaba en CHEROKEE y pasa vivos externos independientes con cogotera", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2963],
      "92": [416, 2907, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-12-cherokee.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 416,
        key: "cuello-v-lineal-externo-derecho",
        label: "Cuello V lineal externo derecho",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 2907,
        key: "cuello-v-lineal-externo-izquierdo",
        label: "Cuello V lineal externo izquierdo",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga CREMALLERA como modelo de cuello independiente", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2944],
      "92": [421, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-27-cremallera.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 421,
        role: "upperNeck",
        key: "cuello-alto",
        label: "Cuello alto",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga CIRUGÍA y aplica COSTURA OVALADO como bolsillo inferior independiente", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2954],
      "70": [391],
      "92": [421, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia.svg",
    );
    expect(scene.lowerPocketLayout).toBe("double");
    expect(scene.lowerPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia-lower-pocket.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 421,
        role: "upperNeck",
        key: "cuello-alto",
        label: "Cuello alto",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("carga CUELLO ALTO CON CREMALLERA y aplica ANDES HOMBRE como bolsillo inferior independiente", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2952],
      "70": [390],
      "92": [421, 5146],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-34-cuello-alto-cremallera.svg",
    );
    expect(scene.lowerPocketLayout).toBe("double");
    expect(scene.lowerPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-34-cuello-alto-cremallera-lower-pocket.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 421,
        role: "upperNeck",
        key: "cuello-alto",
        label: "Cuello alto",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("detecta la parte baja del vivo del bolsillo inferior aunque no tenga rol de catalogo", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "92": [5153],
    });

    expect(scene.trimSections).toEqual([
      {
        valueId: 5153,
        key: "bolsillos-inferiores-parte-baja",
        label: "Bolsillos inferiores parte baja",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("pinta cuello y bolsillo cuando ambas secciones estan seleccionadas", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "92": [5147, 5150],
    });

    expect(scene.trimSections).toEqual([
      {
        valueId: 5147,
        role: "upperNeck",
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5150,
        role: "lowerPockets",
        key: "bolsillos-inferiores-parte-superior",
        label: "Bolsillos inferiores parte superior",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("mantiene solo la cogotera seleccionada sin agregar vivos automaticos", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "92": [5146],
    });

    expect(scene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("respeta Sin vivos como apagado global para cuello alto", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "92": [5423],
    });

    expect(scene.trimSections).toEqual([]);
  });

  it("muestra bolsillo de pecho rectangular solo cuando el modelo seleccionado es Rectangular", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "102": [6101],
    });

    expect(scene.chestPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-model.svg",
    );
  });

  it("oculta bolsillo de pecho cuando el modelo seleccionado es Ninguno", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "102": [6102],
    });

    expect(scene.chestPocketAssetPath).toBeUndefined();
  });

  it("muestra bolsillo de pecho si Odoo envia un modelo numerado distinto de Ninguno", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "102": [6103],
    });

    expect(scene.chestPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-v2.svg",
    );
  });

  it("muestra bolsillo de pecho Cremallera punta por nombre y pinta superior o inferior", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "102": [6104],
      "92": [7040, 7041],
    });

    expect(scene.chestPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-zipper.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 7040,
        role: "chestPocket",
        key: "bolsillo-pecho-superior",
        label: "Bolsillo pecho superior",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 7041,
        role: "chestPocket",
        key: "bolsillo-pecho-inferior",
        label: "Bolsillo pecho inferior",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("muestra bolsillo de pecho Punta por nombre", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "102": [6106],
    });

    expect(scene.chestPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point.svg",
    );
  });

  it("muestra bolsillo de pecho Cremallera externo y separa sus tres vivos", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "102": [6105],
      "92": [7040, 7042, 7041],
    });

    expect(scene.chestPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 7040,
        role: "chestPocket",
        key: "bolsillo-pecho-superior",
        label: "Bolsillo pecho superior",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 7041,
        role: "chestPocket",
        key: "bolsillo-pecho-inferior",
        label: "Bolsillo pecho inferior",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 7042,
        key: "cremallera",
        label: "Cremallera",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("muestra bolsillo de pecho Cremallera interno por nombre y pinta la cremallera", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "102": [6107],
      "92": [7040, 7041],
    });

    expect(scene.chestPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-internal.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 7040,
        role: "chestPocket",
        key: "bolsillo-pecho-superior",
        label: "Bolsillo pecho superior",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 7041,
        role: "chestPocket",
        key: "bolsillo-pecho-inferior",
        label: "Bolsillo pecho inferior",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("pinta vivo de bolsillo de pecho solo con la seccion Bolsillo pecho", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "102": [6101],
      "92": [5149],
    });

    expect(scene.chestPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-model.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5149,
        role: "chestPocket",
        key: "bolsillo-pecho",
        label: "Bolsillo pecho",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("muestra punto de logo cuando se selecciona una posicion de logo", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "102": [6101],
      "120": [7001],
    });

    expect(scene.logoMarker).toEqual({
      placement: "Bolsillo de pecho izquierdo",
    });
  });

  it("no muestra punto de logo cuando la seleccion es Sin logo", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "102": [6101],
      "120": [7002],
    });

    expect(scene.logoMarker).toBeUndefined();
  });

  it("resuelve rodillas y vivos por IDs de Odoo aunque sus etiquetas cambien", () => {
    const renamedKneeSession: ConfiguratorSession = {
      ...session,
      productTemplateId: 7,
      productName: "Uniforme",
      graphicManifestKey: "uniforme",
      attributes: [
        {
          id: 169,
          name: "Patch derecho renovado",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9100,
              sourceValueId: 760,
              name: "Opcion renombrada",
              attributeId: 169,
              attributeName: "Patch derecho renovado",
            },
          ],
        },
        {
          id: 170,
          name: "Acabado derecho renovado",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9101,
              sourceValueId: 1942,
              name: "Opcion renombrada",
              attributeId: 170,
              attributeName: "Acabado derecho renovado",
            },
          ],
        },
        {
          id: 171,
          name: "Patch izquierdo renovado",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9102,
              sourceValueId: 1934,
              name: "Opcion renombrada",
              attributeId: 171,
              attributeName: "Patch izquierdo renovado",
            },
          ],
        },
        {
          id: 172,
          name: "Acabado izquierdo renovado",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9103,
              sourceValueId: 1946,
              name: "Opcion renombrada",
              attributeId: 172,
              attributeName: "Acabado izquierdo renovado",
            },
          ],
        },
        {
          id: 157,
          name: "Vivos personalizados",
          displayType: "multi",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9104,
              sourceValueId: 2093,
              name: "Vivo renombrado uno",
              attributeId: 157,
              attributeName: "Vivos personalizados",
            },
            {
              id: 9105,
              sourceValueId: 2109,
              name: "Vivo renombrado dos",
              attributeId: 157,
              attributeName: "Vivos personalizados",
            },
          ],
        },
        {
          id: 814,
          name: "Color de vivo personalizado",
          displayType: "color",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9106,
              name: "Color renombrado",
              attributeId: 814,
              attributeName: "Color de vivo personalizado",
              colorHex: "#f4c7cc",
            },
          ],
        },
      ],
      selectedValueIds: {
        "169": [9100],
        "170": [9101],
        "171": [9102],
        "172": [9103],
        "157": [9104, 9105],
        "814": [9106],
      },
    };

    const scene = deriveAutomationRenderScene(
      renamedKneeSession,
      renamedKneeSession.selectedValueIds,
    );

    expect(scene.uniformParts?.pants).toMatchObject({
      pantsKneePatchRightModel: "square",
      pantsKneePatchRightType: "horizontalZipper",
      pantsKneePatchLeftModel: "camouflage",
      pantsKneePatchLeftType: "button",
      trimSections: [
        { sourceValueId: 2093, colorHex: "#f4c7cc" },
        { sourceValueId: 2109, colorHex: "#f4c7cc" },
      ],
    });
    expect(scene.uniformParts?.blouse.trimSections).toEqual([]);

    const pantsOnlyScene = deriveAutomationRenderScene(
      {
        ...renamedKneeSession,
        productTemplateId: 6,
        productName: "Pantalon",
        graphicManifestKey: "pantalon",
      },
      renamedKneeSession.selectedValueIds,
    );

    expect(pantsOnlyScene).toMatchObject({
      pantsKneePatchRightModel: "square",
      pantsKneePatchRightType: "horizontalZipper",
      pantsKneePatchLeftModel: "camouflage",
      pantsKneePatchLeftType: "button",
      trimSections: [
        { sourceValueId: 2093 },
        { sourceValueId: 2109 },
      ],
    });
  });

  it("mantiene la semantica de los vivos por ID en Blusa y Pantalon", () => {
    const renamedTrimSession: ConfiguratorSession = {
      ...session,
      productTemplateId: 5,
      productName: "Blusa",
      graphicManifestKey: "blusa-antifluido-t180",
      attributes: [
        {
          id: 157,
          name: "Etiqueta de vivo cambiada",
          displayType: "multi",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9201,
              sourceValueId: 1972,
              name: "Etiqueta de valor cambiada",
              attributeId: 157,
              attributeName: "Etiqueta de vivo cambiada",
            },
          ],
        },
        {
          id: 814,
          name: "Etiqueta de color cambiada",
          displayType: "color",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9202,
              name: "Color renombrado",
              attributeId: 814,
              attributeName: "Etiqueta de color cambiada",
              colorHex: "#f4c7cc",
            },
          ],
        },
      ],
      selectedValueIds: { "157": [9201], "814": [9202] },
    };

    expect(
      deriveAutomationRenderScene(
        renamedTrimSession,
        renamedTrimSession.selectedValueIds,
      ).trimSections,
    ).toEqual([
      {
        valueId: 9201,
        sourceValueId: 1972,
        key: "manga lineal superior",
        label: "Etiqueta de valor cambiada",
        colorHex: "#f4c7cc",
      },
    ]);

    expect(
      deriveAutomationRenderScene(
        {
          ...renamedTrimSession,
          productTemplateId: 6,
          productName: "Pantalon",
          graphicManifestKey: "pantalon",
          attributes: [
            {
              id: 157,
              name: "Etiqueta de vivo cambiada",
              displayType: "multi",
              selectionMode: "multiple",
              variantMode: "no_variant",
              values: [
                {
                  id: 9201,
                  sourceValueId: 643,
                  name: "Etiqueta de valor cambiada",
                  attributeId: 157,
                  attributeName: "Etiqueta de vivo cambiada",
                },
              ],
            },
            {
              id: 814,
              name: "Etiqueta de color cambiada",
              displayType: "color",
              selectionMode: "single",
              variantMode: "no_variant",
              values: [
                {
                  id: 9202,
                  name: "Color renombrado",
                  attributeId: 814,
                  attributeName: "Etiqueta de color cambiada",
                  colorHex: "#f4c7cc",
                },
              ],
            },
          ],
        },
        renamedTrimSession.selectedValueIds,
      ).trimSections[0]?.key,
    ).toBe("bolsillo lateral de pantalon");
  });
});
