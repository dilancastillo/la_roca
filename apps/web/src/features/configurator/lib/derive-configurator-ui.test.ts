import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { normalizeLowerPocketSelectionsForSave } from "@repo/shared/lower-pocket-rules";
import { describe, expect, it } from "vitest";
import {
  applyBootMeasurementSelections,
  applyDefaultTextStyleSelections,
  deriveConfiguratorUi,
  sanitizeSelectedValueIdsForHiddenTextAttributes,
} from "./derive-configurator-ui";

const session: ConfiguratorSession = {
  saleOrderLineId: 56,
  saleOrderId: 11,
  orderName: "S00011",
  productId: 26830,
  productTemplateId: 6,
  productName: "Blusa - Antifluido T180",
  graphicManifestKey: "blusa-antifluido-t180",
  attributes: [
    {
      id: 63,
      name: "Nombre editable en Odoo",
      displayType: "radio",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 2590,
          name: "Nombre cambiado del cuello",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 335,
          name: "PRESILLAS",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 336,
          name: "PUNTAS",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 346,
          name: "PUNTADAS",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 338,
          name: "JDC",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2601,
          name: "Nombre cambiado de cuello alto",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2593,
          name: "2019",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2599,
          name: "PRESILLA OVALO",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 343,
          name: "OVALADO",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2956,
          name: "EL HATO",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 340,
          name: "CUCUTA",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 341,
          name: "ENFERMERA UB",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 352,
          name: "MATRIOSKA",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 353,
          name: "MARIPOSA",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 7013,
          name: "MARIPOSA DIVIDIDO",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 7014,
          name: "MODELO 29",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 354,
          name: "20-20",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 355,
          name: "DEPORTIVO",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 356,
          name: "ESTRELLA",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 357,
          name: "POLO",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2938,
          name: "BOTONES",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2940,
          name: "20-21",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2942,
          name: "CUELLO REDONDO",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2944,
          name: "CREMALLERA",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2948,
          name: "PEDAGOGIA",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2950,
          name: "ORIENTAL",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2954,
          name: "CIRUGÍA",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2952,
          name: "CUELLO ALTO CON CREMALLERA",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2962,
          name: "CHEROKEE",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
        },
        {
          id: 2963,
          name: "PICOS",
          attributeId: 63,
          attributeName: "Nombre editable en Odoo",
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
        {
          id: 5354,
          name: "Lizo doble",
          attributeId: 69,
          attributeName: "Tipo de bolsillos inferiores",
        },
      ],
    },
    {
      id: 70,
      name: "Otro nombre para bolsillo inferior",
      displayType: "radio",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 2578,
          name: "Nombre cambiado del bolsillo",
          attributeId: 70,
          attributeName: "Otro nombre para bolsillo inferior",
        },
        {
          id: 381,
          name: "AROS",
          attributeId: 70,
          attributeName: "Otro nombre para bolsillo inferior",
        },
        {
          id: 383,
          name: "RIBETE",
          attributeId: 70,
          attributeName: "Otro nombre para bolsillo inferior",
        },
        {
          id: 382,
          name: "COSTURA",
          attributeId: 70,
          attributeName: "Otro nombre para bolsillo inferior",
        },
        {
          id: 384,
          name: "COSTURA MARÍA",
          attributeId: 70,
          attributeName: "Otro nombre para bolsillo inferior",
        },
        {
          id: 5425,
          name: "Ninguno",
          attributeId: 70,
          attributeName: "Otro nombre para bolsillo inferior",
        },
        {
          id: 2965,
          name: "BOLSILLO PRESILLAS",
          attributeId: 70,
          attributeName: "Otro nombre para bolsillo inferior",
        },
        {
          id: 388,
          name: "RIBETE VERTICAL",
          attributeId: 70,
          attributeName: "Otro nombre para bolsillo inferior",
        },
        {
          id: 391,
          name: "COSTURA OVALADO",
          attributeId: 70,
          attributeName: "Otro nombre para bolsillo inferior",
        },
        {
          id: 390,
          name: "ANDES HOMBRE",
          attributeId: 70,
          attributeName: "Otro nombre para bolsillo inferior",
        },
      ],
    },
    {
      id: 90,
      name: "Color renombrado",
      displayType: "color",
      selectionMode: "single",
      variantMode: "variant",
      values: [
        {
          id: 4845,
          name: "Azul Aruba",
          attributeId: 90,
          attributeName: "Color renombrado",
          colorHex: "#B2D4D1",
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
      name: "Sección de vivo",
      displayType: "multi",
      selectionMode: "multiple",
      variantMode: "no_variant",
      values: [
        {
          id: 5146,
          name: "Cogotera",
          attributeId: 92,
          attributeName: "SecciÃ³n de vivo",
        },
        {
          id: 5149,
          name: "Bolsillo pecho",
          attributeId: 92,
          attributeName: "Sección de vivo",
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
          attributeName: "Sección de vivo",
        },
      ],
    },
  ],
  selectedValueIds: {
    "63": [2590],
    "811": [2866],
    "69": [5354],
    "70": [2578],
    "90": [4845],
  },
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
      id: 84,
      name: "Tipo bota",
      displayType: "option",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 4266,
          name: "Original",
          attributeId: 84,
          attributeName: "Tipo bota",
        },
      ],
    },
  ],
  selectedValueIds: {
    "84": [4266],
    "90": [6921],
  },
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

describe("deriveConfiguratorUi", () => {
  it("no pinta una seccion de vivo si Odoo no tiene color de vivo seleccionado", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "91": [],
      "92": [5146],
    });

    expect(ui.previewScene.trimSections).toEqual([]);
  });

  it("muestra Bota con cremallera solo para las aberturas frontal y lateral en Pantalon y Uniforme", () => {
    const sessionWithBootZipper: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        pantalonSession.attributes[0]!,
        {
          id: 160,
          name: "Tipo bota",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 4266,
              sourceValueId: 724,
              name: "Tradicional",
              attributeId: 160,
              attributeName: "Tipo bota",
            },
            {
              id: 4267,
              sourceValueId: 726,
              name: "Frontal renombrada",
              attributeId: 160,
              attributeName: "Tipo bota",
            },
            {
              id: 4268,
              sourceValueId: 1956,
              name: "Lateral renombrada",
              attributeId: 160,
              attributeName: "Tipo bota",
            },
          ],
        },
        {
          id: 818,
          name: "¿Bota con cremallera?",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 8181,
              name: "Si",
              attributeId: 818,
              attributeName: "¿Bota con cremallera?",
            },
            {
              id: 8182,
              name: "No",
              attributeId: 818,
              attributeName: "¿Bota con cremallera?",
            },
          ],
        },
      ],
      selectedValueIds: {
        "90": [6921],
        "160": [4266],
        "818": [8181],
      },
    };
    const getVisibleAttributeIds = (
      targetSession: ConfiguratorSession,
      bootTypeValueId: number,
    ) =>
      deriveConfiguratorUi(targetSession, {
        ...targetSession.selectedValueIds,
        "160": [bootTypeValueId],
      }).groups.map((group) => group.attributeId);

    expect(getVisibleAttributeIds(sessionWithBootZipper, 4266)).not.toContain(
      818,
    );
    expect(getVisibleAttributeIds(sessionWithBootZipper, 4267)).toContain(818);
    expect(getVisibleAttributeIds(sessionWithBootZipper, 4268)).toContain(818);
    expect(
      sanitizeSelectedValueIdsForHiddenTextAttributes(
        sessionWithBootZipper,
        sessionWithBootZipper.selectedValueIds,
      )["818"],
    ).toEqual([8181]);

    const uniformSessionWithBootZipper: ConfiguratorSession = {
      ...sessionWithBootZipper,
      productTemplateId: 7,
      productName: "Uniforme",
      graphicManifestKey: "uniforme",
    };

    expect(
      getVisibleAttributeIds(uniformSessionWithBootZipper, 4267),
    ).toContain(818);
    expect(
      getVisibleAttributeIds(uniformSessionWithBootZipper, 4266),
    ).not.toContain(818);
  });

  it("selecciona Largo bota y Ancho bota automaticamente cuando Tipo bota no es Original", () => {
    const sessionWithBootMeasurements: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes.map((attribute) =>
          attribute.id === 84
            ? {
                ...attribute,
                values: [
                  ...attribute.values,
                  {
                    id: 4267,
                    name: "Abertura frontal",
                    attributeId: 84,
                    attributeName: "Tipo bota",
                  },
                ],
              }
            : attribute,
        ),
        {
          id: 85,
          name: "Largo bota",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 8501,
              name: "Largo bota",
              attributeId: 85,
              attributeName: "Largo bota",
              allowsCustomValue: true,
            },
          ],
        },
        {
          id: 86,
          name: "Ancho bota",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 8601,
              name: "Ancho bota",
              attributeId: 86,
              attributeName: "Ancho bota",
              allowsCustomValue: true,
            },
          ],
        },
      ],
      selectedValueIds: {
        "84": [4267],
        "90": [6921],
      },
    };

    expect(
      applyBootMeasurementSelections(
        sessionWithBootMeasurements,
        sessionWithBootMeasurements.selectedValueIds,
      ),
    ).toMatchObject({
      "84": [4267],
      "85": [8501],
      "86": [8601],
    });
  });

  it("limpia Largo bota y Ancho bota automaticamente cuando Tipo bota es Original", () => {
    const sessionWithBootMeasurements: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: 85,
          name: "Largo bota",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 8501,
              name: "Largo bota",
              attributeId: 85,
              attributeName: "Largo bota",
              allowsCustomValue: true,
            },
          ],
        },
        {
          id: 86,
          name: "Ancho bota",
          displayType: "option",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 8601,
              name: "Ancho bota",
              attributeId: 86,
              attributeName: "Ancho bota",
              allowsCustomValue: true,
            },
          ],
        },
      ],
      selectedValueIds: {
        "84": [4266],
        "85": [8501],
        "86": [8601],
        "90": [6921],
      },
    };

    expect(
      applyBootMeasurementSelections(
        sessionWithBootMeasurements,
        sessionWithBootMeasurements.selectedValueIds,
      ),
    ).toMatchObject({
      "84": [4266],
      "85": [],
      "86": [],
    });
  });

  it("resuelve assets por IDs aunque Odoo cambie nombres de atributos o valores", () => {
    const ui = deriveConfiguratorUi(session, session.selectedValueIds);

    expect(ui.previewScene.baseColorHex).toBe("#B2D4D1");
    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );
    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );
    expect(ui.previewScene.lowerPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg",
    );
    expect(ui.previewScene.lowerPocketLayout).toBe("double");
    expect(ui.groups.find((group) => group.attributeId === 63)?.controlType).toBe(
      "chips",
    );
  });

  it("muestra la blusa cerrada hasta arriba si no hay cuello seleccionado", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [],
    });

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg",
    );
    expect(ui.previewScene.neckImageSrc).toBeUndefined();
  });

  it("usa la base cerrada solo en la blusa del preview de Uniforme", () => {
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
    const ui = deriveConfiguratorUi(
      uniformSession,
      uniformSession.selectedValueIds,
    );

    expect(ui.previewScene.uniformParts?.blouse.garmentImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg",
    );
    expect(ui.previewScene.uniformParts?.blouse.neckImageSrc).toBeUndefined();
    expect(ui.previewScene.uniformParts?.pants.garmentImageSrc).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
  });

  it("carga Pespunte como modelo de blusa base sin reemplazar cuello ni bolsillos", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "811": [2867],
      "63": [2956],
      "70": [2965],
    });

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-45-pespunte.svg",
    );
    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato.svg",
    );
    expect(ui.previewScene.lowerPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato-lower-pocket.svg",
    );
    expect(ui.previewScene.garmentDetailImageSrc).toBeUndefined();
    expect(ui.previewScene.garmentDetailImageSrcs).toBeUndefined();
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
    const ui = deriveConfiguratorUi(sessionWithPespunteToggle, {
      ...sessionWithPespunteToggle.selectedValueIds,
      "811": [1958],
      "63": [2956],
    });

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-45-pespunte.svg",
    );
    expect(ui.previewScene.garmentDetailImageSrc).toBeUndefined();
    expect(ui.previewScene.garmentDetailImageSrcs).toBeUndefined();
  });

  it("usa la blusa cerrada si Pespunte no tiene cuello seleccionado", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "811": [2867],
      "63": [],
    });

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg",
    );
    expect(ui.previewScene.garmentDetailImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg",
    );
    expect(ui.previewScene.neckImageSrc).toBeUndefined();
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
    const ui = deriveConfiguratorUi(sessionWithEmptyNeck, {
      ...sessionWithEmptyNeck.selectedValueIds,
      "811": [2867],
      "63": [999001],
    });

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg",
    );
    expect(ui.previewScene.garmentDetailImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg",
    );
    expect(ui.previewScene.neckImageSrc).toBeUndefined();
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
    const ui = deriveConfiguratorUi(sessionWithVDividido, {
      ...sessionWithVDividido.selectedValueIds,
      "811": [2867],
      "63": [7013],
    });

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-45-pespunte.svg",
    );
    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-36-v-dividido.svg",
    );
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
        "91": [5152],
        "92": [5146, 5147, 22018, 22019],
        "22010": [22011],
        "22012": [22013],
        "22014": [22015],
        "22016": [22017],
      },
    };
    const ui = deriveConfiguratorUi(
      uniformSession,
      uniformSession.selectedValueIds,
    );
    const uniformParts = ui.previewScene.uniformParts;

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
    const ui = deriveConfiguratorUi(
      uniformSession,
      uniformSession.selectedValueIds,
    );
    const uniformParts = ui.previewScene.uniformParts;

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

    const ui = deriveConfiguratorUi(
      uniformSession,
      uniformSession.selectedValueIds,
    );

    expect(ui.previewScene.uniformParts?.pants.pantsSidePocketType).toBe(
      "asorsalud",
    );
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
    const ui = deriveConfiguratorUi(
      uniformSession,
      uniformSession.selectedValueIds,
    );
    const uniformParts = ui.previewScene.uniformParts;

    expect(uniformParts?.blouse.garmentDetailImageSrcs).toContain(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg",
    );
    expect(uniformParts?.pants.garmentDetailImageSrcs).toContain(
      "/assets/catalog/pantalon/detail-overlays/pants-pespunte-stitching.svg",
    );
  });

  it("muestra Modelo de Blusa y Pinzas solamente cuando Genero es Mujer", () => {
    const genderAttribute = {
      id: 813,
      name: "Género",
      displayType: "radio" as const,
      selectionMode: "single" as const,
      variantMode: "no_variant" as const,
      values: [
        {
          id: 8131,
          name: "Hombre",
          attributeId: 813,
          attributeName: "Género",
        },
        {
          id: 8132,
          name: "Mujer",
          attributeId: 813,
          attributeName: "Género",
        },
      ],
    };
    const dartsAttribute = {
      id: 144,
      name: "¿Pinzas?",
      displayType: "radio" as const,
      selectionMode: "single" as const,
      variantMode: "no_variant" as const,
      values: [
        {
          id: 1441,
          name: "No",
          attributeId: 144,
          attributeName: "¿Pinzas?",
        },
        {
          id: 1442,
          name: "Si",
          attributeId: 144,
          attributeName: "¿Pinzas?",
        },
      ],
    };
    const sessionWithGender: ConfiguratorSession = {
      ...session,
      attributes: [genderAttribute, dartsAttribute, ...session.attributes],
    };

    const womanUi = deriveConfiguratorUi(sessionWithGender, {
      ...session.selectedValueIds,
      "144": [1441],
      "813": [8132],
    });
    const manUi = deriveConfiguratorUi(sessionWithGender, {
      ...session.selectedValueIds,
      "144": [1441],
      "813": [8131],
    });

    expect(
      womanUi.groups.some((group) => group.attributeId === 811),
    ).toBe(true);
    expect(
      womanUi.summary.some((item) => item.label === "Modelo de Blusa"),
    ).toBe(true);
    expect(womanUi.groups.some((group) => group.attributeId === 144)).toBe(
      true,
    );
    expect(womanUi.summary.some((item) => item.label === "¿Pinzas?")).toBe(
      true,
    );
    expect(manUi.groups.some((group) => group.attributeId === 811)).toBe(
      false,
    );
    expect(
      manUi.summary.some((item) => item.label === "Modelo de Blusa"),
    ).toBe(false);
    expect(manUi.groups.some((group) => group.attributeId === 144)).toBe(
      false,
    );
    expect(manUi.summary.some((item) => item.label === "¿Pinzas?")).toBe(
      false,
    );
  });

  it("mantiene Modelo de Blusa visible si el producto no tiene Genero", () => {
    const ui = deriveConfiguratorUi(session, session.selectedValueIds);

    expect(ui.groups.some((group) => group.attributeId === 811)).toBe(true);
  });

  it("agrega mangas Original como overlay independiente del modelo de cuello", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2963],
      "812": [8121],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-12-cherokee.svg",
    );
    expect(ui.previewScene.garmentDetailImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
    );
    expect(ui.previewScene.garmentDetailImageSrcs).toEqual([
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
    ]);
    expect(ui.groups.find((group) => group.attributeId === 812)?.controlType).toBe(
      "image",
    );
  });

  it("respeta el tipo de Odoo aunque una opcion tenga un asset visual local", () => {
    const sessionWithRadioSleeves: ConfiguratorSession = {
      ...session,
      attributes: session.attributes.map((attribute) =>
        attribute.id === 812
          ? {
              ...attribute,
              displayType: "radio",
            }
          : attribute,
      ),
    };

    const ui = deriveConfiguratorUi(
      sessionWithRadioSleeves,
      {
        ...sessionWithRadioSleeves.selectedValueIds,
        "812": [8121],
      },
    );
    const sleeveGroup = ui.groups.find((group) => group.attributeId === 812);

    expect(sleeveGroup?.controlType).toBe("chips");
    expect(
      sleeveGroup?.options.find((option) => option.id === 8121)?.imageSrc,
    ).toBeUndefined();
    expect(ui.previewScene.garmentDetailImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-32-original-sleeves.svg",
    );
  });

  it("carga PRESILLAS por ID con cuello, aros y cogotera como vivos independientes", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [335],
      "91": [5152],
      "92": [5147, 2898, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-15-presillas.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [336],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-06-puntas.svg",
    );
  });

  it("carga PUNTADAS con Cuello puntadas y cogotera", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [346],
      "91": [5152],
      "92": [7010, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-07.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [7013],
      "91": [5152],
      "92": [5146, 7011, 7012],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-04.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [7014],
      "91": [5152],
      "92": [5146, 7011, 7012],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-28-modelo-29.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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

  it("usa miniaturas de Odoo en la barra lateral sin enviarlas al canvas", () => {
    const odooOptionImageSrc = "data:image/png;base64,odoo-neck-preview";
    const sessionWithOdooPreview: ConfiguratorSession = {
      ...session,
      attributes: session.attributes.map((attribute) =>
        attribute.id === 63
          ? {
              ...attribute,
              displayType: "image",
              values: attribute.values.map((value) =>
                value.id === 2590
                  ? { ...value, optionImageSrc: odooOptionImageSrc }
                  : value,
              ),
            }
          : attribute,
      ),
    };

    const ui = deriveConfiguratorUi(
      sessionWithOdooPreview,
      sessionWithOdooPreview.selectedValueIds,
    );
    const neckGroup = ui.groups.find((group) => group.attributeId === 63);

    expect(neckGroup?.controlType).toBe("image");
    expect(
      neckGroup?.options.find((option) => option.id === 2590)?.imageSrc,
    ).toBe(odooOptionImageSrc);
    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );
  });

  it("dibuja dos bolsillos inferiores cuando el tipo no es Sin bolsillos", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "69": [2561],
    });

    expect(ui.previewScene.lowerPocketLayout).toBe("double");
    expect(ui.previewScene.lowerPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg",
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
    const withDouble = deriveConfiguratorUi(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5354],
      "70": [2578],
    });
    const withLeft = deriveConfiguratorUi(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5355],
      "70": [2578],
    });
    const withRight = deriveConfiguratorUi(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5356],
      "70": [2578],
    });
    const withOverlaidDouble = deriveConfiguratorUi(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5357],
      "70": [2578],
    });
    const withOverlaidLeft = deriveConfiguratorUi(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5358],
      "70": [2578],
    });
    const withOverlaidRight = deriveConfiguratorUi(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5359],
      "70": [2578],
    });
    const withVelcroDouble = deriveConfiguratorUi(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5360],
      "70": [2578],
    });
    const withVelcroLeft = deriveConfiguratorUi(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5361],
      "70": [2578],
    });
    const withVelcroRight = deriveConfiguratorUi(sessionWithSideTypes, {
      ...sessionWithSideTypes.selectedValueIds,
      "69": [5362],
      "70": [2578],
    });

    expect(withDouble.previewScene.lowerPocketAuxiliaryAddonKind).toBe("lizo");
    expect(withDouble.previewScene.lowerPocketAuxiliaryAddonSide).toBe("both");
    expect(withLeft.previewScene.lowerPocketAuxiliaryAddonKind).toBe("lizo");
    expect(withLeft.previewScene.lowerPocketAuxiliaryAddonSide).toBe("left");
    expect(withRight.previewScene.lowerPocketAuxiliaryAddonKind).toBe("lizo");
    expect(withRight.previewScene.lowerPocketAuxiliaryAddonSide).toBe("right");
    expect(withOverlaidDouble.previewScene.lowerPocketAuxiliaryAddonKind).toBe(
      "overlaid",
    );
    expect(withOverlaidDouble.previewScene.lowerPocketAuxiliaryAddonSide).toBe(
      "both",
    );
    expect(withOverlaidLeft.previewScene.lowerPocketAuxiliaryAddonKind).toBe(
      "overlaid",
    );
    expect(withOverlaidLeft.previewScene.lowerPocketAuxiliaryAddonSide).toBe(
      "left",
    );
    expect(withOverlaidRight.previewScene.lowerPocketAuxiliaryAddonKind).toBe(
      "overlaid",
    );
    expect(withOverlaidRight.previewScene.lowerPocketAuxiliaryAddonSide).toBe(
      "right",
    );
    expect(withVelcroDouble.previewScene.lowerPocketAuxiliaryAddonKind).toBe(
      "velcro",
    );
    expect(withVelcroDouble.previewScene.lowerPocketAuxiliaryAddonSide).toBe(
      "both",
    );
    expect(withVelcroLeft.previewScene.lowerPocketAuxiliaryAddonKind).toBe(
      "velcro",
    );
    expect(withVelcroLeft.previewScene.lowerPocketAuxiliaryAddonSide).toBe(
      "left",
    );
    expect(withVelcroRight.previewScene.lowerPocketAuxiliaryAddonKind).toBe(
      "velcro",
    );
    expect(withVelcroRight.previewScene.lowerPocketAuxiliaryAddonSide).toBe(
      "right",
    );

    for (const modelId of [381, 383]) {
      const withModelLizoDouble = deriveConfiguratorUi(sessionWithSideTypes, {
        ...sessionWithSideTypes.selectedValueIds,
        "69": [5354],
        "70": [modelId],
      });
      const withModelOverlaidLeft = deriveConfiguratorUi(sessionWithSideTypes, {
        ...sessionWithSideTypes.selectedValueIds,
        "69": [5358],
        "70": [modelId],
      });
      const withModelVelcroRight = deriveConfiguratorUi(sessionWithSideTypes, {
        ...sessionWithSideTypes.selectedValueIds,
        "69": [5362],
        "70": [modelId],
      });

      expect(
        withModelLizoDouble.previewScene.lowerPocketAuxiliaryAddonKind,
      ).toBe("lizo");
      expect(
        withModelLizoDouble.previewScene.lowerPocketAuxiliaryAddonSide,
      ).toBe("both");
      expect(
        withModelOverlaidLeft.previewScene.lowerPocketAuxiliaryAddonKind,
      ).toBe("overlaid");
      expect(
        withModelOverlaidLeft.previewScene.lowerPocketAuxiliaryAddonSide,
      ).toBe("left");
      expect(
        withModelVelcroRight.previewScene.lowerPocketAuxiliaryAddonKind,
      ).toBe("velcro");
      expect(
        withModelVelcroRight.previewScene.lowerPocketAuxiliaryAddonSide,
      ).toBe("right");
    }
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
    const withLosAndes = deriveConfiguratorUi(
      sessionWithCurrentLowerPocketIds,
      {
        ...sessionWithCurrentLowerPocketIds.selectedValueIds,
        "69": [2561],
        "70": [387],
      },
    );
    const withAletas = deriveConfiguratorUi(
      sessionWithCurrentLowerPocketIds,
      {
        ...sessionWithCurrentLowerPocketIds.selectedValueIds,
        "69": [2561],
        "70": [3205],
      },
    );

    expect(withLosAndes.previewScene.lowerPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-48-los-andes-lower-pocket-v2.svg",
    );
    expect(withAletas.previewScene.lowerPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-16.svg",
    );
  });

  it("aplica COSTURA como modelo de bolsillo inferior con vivos superior y bajo separados", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "69": [2561],
      "70": [382],
      "91": [5152],
      "92": [5150, 5153],
    });

    expect(ui.previewScene.lowerPocketLayout).toBe("double");
    expect(ui.previewScene.lowerPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-18-costura-lower-pocket.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "69": [2561],
      "70": [384],
      "91": [5152],
      "92": [5150],
    });

    expect(ui.previewScene.lowerPocketLayout).toBe("double");
    expect(ui.previewScene.lowerPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-20-costura-maria-lower-pocket.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
      {
        valueId: 5150,
        role: "lowerPockets",
        key: "bolsillos-inferiores-parte-superior",
        label: "Bolsillos inferiores parte superior",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("separa el cuello EL HATO del bolsillo inferior BOLSILLO PRESILLAS", () => {
    const withOtherPocket = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2956],
      "69": [2561],
      "70": [2578],
    });
    const withPresillasPocket = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2956],
      "69": [2561],
      "70": [2965],
    });

    expect(withOtherPocket.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato.svg",
    );
    expect(withOtherPocket.previewScene.lowerPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg",
    );
    expect(withPresillasPocket.previewScene.lowerPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-39-el-hato-lower-pocket.svg",
    );
  });

  it("carga ORIENTAL y aplica RIBETE VERTICAL como bolsillo inferior independiente", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2950],
      "69": [2561],
      "70": [388],
      "91": [5152],
      "92": [421, 5146, 5150],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-33-oriental.svg",
    );
    expect(ui.previewScene.lowerPocketLayout).toBe("double");
    expect(ui.previewScene.lowerPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-33-oriental-lower-pocket.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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

  it("carga CIRUGÍA y aplica COSTURA OVALADO como bolsillo inferior independiente", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2954],
      "69": [2561],
      "70": [391],
      "91": [5152],
      "92": [421, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia.svg",
    );
    expect(ui.previewScene.lowerPocketLayout).toBe("double");
    expect(ui.previewScene.lowerPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-37-cirugia-lower-pocket.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2952],
      "69": [2561],
      "70": [390],
      "91": [5152],
      "92": [421, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-34-cuello-alto-cremallera.svg",
    );
    expect(ui.previewScene.lowerPocketLayout).toBe("double");
    expect(ui.previewScene.lowerPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-34-cuello-alto-cremallera-lower-pocket.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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

  it("oculta bolsillos inferiores y normaliza modelo a Ninguno cuando el tipo es Sin bolsillos", () => {
    const selectedValueIds = {
      ...session.selectedValueIds,
      "69": [5342],
      "70": [2578],
    };
    const ui = deriveConfiguratorUi(session, selectedValueIds);
    const normalized = normalizeLowerPocketSelectionsForSave(
      session,
      selectedValueIds,
    );

    expect(ui.previewScene.lowerPocketLayout).toBe("none");
    expect(ui.previewScene.lowerPocketImageSrc).toBeUndefined();
    expect(normalized["70"]).toEqual([5425]);
  });

  it("usa el SVG base de pantalon cuando el producto no tiene atributo unico de modelo", () => {
    const ui = deriveConfiguratorUi(
      pantalonSession,
      pantalonSession.selectedValueIds,
    );

    expect(ui.previewScene.baseColorHex).toBe("#F0F0F0");
    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(ui.previewScene.neckImageSrc).toBeUndefined();
  });

  it("usa Pespunte de pantalon como capa global sobre la base liza", () => {
    const sessionWithPantsModel: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
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
    };
    const ui = deriveConfiguratorUi(sessionWithPantsModel, {
      ...pantalonSession.selectedValueIds,
      "810": [2864],
    });

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(ui.previewScene.garmentDetailImageSrc).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-pespunte-stitching.svg",
    );
  });

  it("usa Tipo bota Tradicional como overlay independiente del pantalon", () => {
    const sessionWithTraditionalBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: pantalonSession.attributes.map((attribute) =>
        attribute.id === 84
          ? {
              ...attribute,
              values: [
                {
                  id: 999999,
                  name: "Tradicional",
                  attributeId: 84,
                  attributeName: "Tipo bota",
                },
              ],
            }
          : attribute,
      ),
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999999],
      },
    };
    const ui = deriveConfiguratorUi(
      sessionWithTraditionalBoot,
      sessionWithTraditionalBoot.selectedValueIds,
    );

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(ui.previewScene.bootImageSrc).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-boot-tradicional.svg",
    );
  });

  it("usa Tipo bota Resorte como overlay independiente del pantalon", () => {
    const sessionWithElasticBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: pantalonSession.attributes.map((attribute) =>
        attribute.id === 84
          ? {
              ...attribute,
              values: [
                {
                  id: 999998,
                  name: "Resorte",
                  attributeId: 84,
                  attributeName: "Tipo bota",
                },
              ],
            }
          : attribute,
      ),
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999998],
      },
    };
    const ui = deriveConfiguratorUi(
      sessionWithElasticBoot,
      sessionWithElasticBoot.selectedValueIds,
    );

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(ui.previewScene.bootImageSrc).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-boot-resorte.svg",
    );
  });

  it("usa Tipo bota Con abertura como overlay independiente del pantalon", () => {
    const sessionWithOpenBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: pantalonSession.attributes.map((attribute) =>
        attribute.id === 84
          ? {
              ...attribute,
              values: [
                {
                  id: 999997,
                  name: "Con abertura",
                  attributeId: 84,
                  attributeName: "Tipo bota",
                },
              ],
            }
          : attribute,
      ),
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999997],
      },
    };
    const ui = deriveConfiguratorUi(
      sessionWithOpenBoot,
      sessionWithOpenBoot.selectedValueIds,
    );

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(ui.previewScene.bootImageSrc).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-boot-con-abertura.svg",
    );
  });

  it("usa Tipo bota Abertura frontal como overlay independiente del pantalon", () => {
    const sessionWithFrontOpeningBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: pantalonSession.attributes.map((attribute) =>
        attribute.id === 84
          ? {
              ...attribute,
              values: [
                {
                  id: 999994,
                  name: "Abertura frontal",
                  attributeId: 84,
                  attributeName: "Tipo bota",
                },
              ],
            }
          : attribute,
      ),
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999994],
      },
    };
    const ui = deriveConfiguratorUi(
      sessionWithFrontOpeningBoot,
      sessionWithFrontOpeningBoot.selectedValueIds,
    );

    expect(ui.previewScene.bootImageSrc).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-boot-abertura-frontal.svg",
    );
  });

  it("usa Tipo bota Abertura lateral como overlay independiente del pantalon", () => {
    const sessionWithSideOpeningBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: pantalonSession.attributes.map((attribute) =>
        attribute.id === 84
          ? {
              ...attribute,
              values: [
                {
                  id: 999993,
                  name: "Abertura lateral",
                  attributeId: 84,
                  attributeName: "Tipo bota",
                },
              ],
            }
          : attribute,
      ),
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999993],
      },
    };
    const ui = deriveConfiguratorUi(
      sessionWithSideOpeningBoot,
      sessionWithSideOpeningBoot.selectedValueIds,
    );

    expect(ui.previewScene.bootImageSrc).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-boot-abertura-lateral.svg",
    );
  });

  it("usa Tipo bota Campana como bota limpia independiente del pantalon", () => {
    const sessionWithBellBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: pantalonSession.attributes.map((attribute) =>
        attribute.id === 84
          ? {
              ...attribute,
              values: [
                {
                  id: 999996,
                  name: "Campana",
                  attributeId: 84,
                  attributeName: "Tipo bota",
                },
              ],
            }
          : attribute,
      ),
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999996],
      },
    };
    const ui = deriveConfiguratorUi(
      sessionWithBellBoot,
      sessionWithBellBoot.selectedValueIds,
    );

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(ui.previewScene.bootImageSrc).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-boot-campana.svg",
    );
  });

  it("usa Tipo bota Cremallera como overlay lateral independiente del pantalon", () => {
    const sessionWithZipperBoot: ConfiguratorSession = {
      ...pantalonSession,
      attributes: pantalonSession.attributes.map((attribute) =>
        attribute.id === 84
          ? {
              ...attribute,
              values: [
                {
                  id: 999995,
                  name: "Cremallera",
                  attributeId: 84,
                  attributeName: "Tipo bota",
                },
              ],
            }
          : attribute,
      ),
      selectedValueIds: {
        ...pantalonSession.selectedValueIds,
        "84": [999995],
      },
    };
    const ui = deriveConfiguratorUi(
      sessionWithZipperBoot,
      sessionWithZipperBoot.selectedValueIds,
    );

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(ui.previewScene.bootImageSrc).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-boot-cremallera.svg",
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
    const ui = deriveConfiguratorUi(
      sessionWithWaistband,
      sessionWithWaistband.selectedValueIds,
    );

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(ui.previewScene.waistbandImageSrc).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-waist-resortada.svg",
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
    const ui = deriveConfiguratorUi(
      sessionWithWaistband,
      sessionWithWaistband.selectedValueIds,
    );

    expect(ui.previewScene.garmentImageSrc).toBe(
      "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
    );
    expect(ui.previewScene.waistbandImageSrc).toBe(
      "/assets/catalog/pantalon/detail-overlays/pants-waist-pretina-boton.svg",
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
    const ui = deriveConfiguratorUi(
      sessionWithSidePocket,
      sessionWithSidePocket.selectedValueIds,
    );

    expect(ui.previewScene.pantsSidePocketType).toBe("doubleZipper");
    expect(ui.previewScene.trimSections).toContainEqual({
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
    const ui = deriveConfiguratorUi(
      sessionWithSidePocket,
      sessionWithSidePocket.selectedValueIds,
    );

    expect(ui.previewScene.pantsSidePocketType).toBe("asorsalud");
    expect(ui.previewScene.trimSections).toContainEqual({
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
    const ui = deriveConfiguratorUi(
      sessionWithKneePatches,
      sessionWithKneePatches.selectedValueIds,
    );

    expect(ui.previewScene.pantsKneePatchRightModel).toBe("square");
    expect(ui.previewScene.pantsKneePatchRightType).toBe("horizontalZipper");
    expect(ui.previewScene.pantsKneePatchLeftModel).toBe("square");
    expect(ui.previewScene.pantsKneePatchLeftType).toBe("horizontalZipper");
    expect(ui.previewScene.trimSections).toContainEqual({
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
    const ui = deriveConfiguratorUi(
      sessionWithPlainKneePatches,
      sessionWithPlainKneePatches.selectedValueIds,
    );

    expect(ui.previewScene.pantsKneePatchRightModel).toBe("square");
    expect(ui.previewScene.pantsKneePatchRightType).toBe("plain");
    expect(ui.previewScene.pantsKneePatchLeftModel).toBe("square");
    expect(ui.previewScene.pantsKneePatchLeftType).toBe("plain");
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
    const ui = deriveConfiguratorUi(
      sessionWithOverlaidKneePatches,
      sessionWithOverlaidKneePatches.selectedValueIds,
    );

    expect(ui.previewScene.pantsKneePatchRightModel).toBe("square");
    expect(ui.previewScene.pantsKneePatchRightType).toBe("overlaid");
    expect(ui.previewScene.pantsKneePatchLeftModel).toBe("square");
    expect(ui.previewScene.pantsKneePatchLeftType).toBe("overlaid");
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
    const ui = deriveConfiguratorUi(
      sessionWithVerticalKneePatches,
      sessionWithVerticalKneePatches.selectedValueIds,
    );

    expect(ui.previewScene.pantsKneePatchRightModel).toBe("square");
    expect(ui.previewScene.pantsKneePatchRightType).toBe("verticalZipper");
    expect(ui.previewScene.pantsKneePatchLeftModel).toBe("square");
    expect(ui.previewScene.pantsKneePatchLeftType).toBe("verticalZipper");
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
    const ui = deriveConfiguratorUi(
      sessionWithCamouflageKneePatches,
      sessionWithCamouflageKneePatches.selectedValueIds,
    );

    expect(ui.previewScene.pantsKneePatchRightModel).toBe("camouflage");
    expect(ui.previewScene.pantsKneePatchRightType).toBe("snap");
    expect(ui.previewScene.pantsKneePatchLeftModel).toBe("camouflage");
    expect(ui.previewScene.pantsKneePatchLeftType).toBe("button");
    expect(ui.previewScene.trimSections).toContainEqual({
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
    const ui = deriveConfiguratorUi(
      sessionWithVelcroKneePatches,
      sessionWithVelcroKneePatches.selectedValueIds,
    );

    expect(ui.previewScene.pantsKneePatchRightModel).toBe("camouflage");
    expect(ui.previewScene.pantsKneePatchRightType).toBe("velcro");
    expect(ui.previewScene.pantsKneePatchLeftModel).toBe("camouflage");
    expect(ui.previewScene.pantsKneePatchLeftType).toBe("velcro");
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
    const ui = deriveConfiguratorUi(
      sessionWithDoubleButtonKneePatches,
      sessionWithDoubleButtonKneePatches.selectedValueIds,
    );

    expect(ui.previewScene.pantsKneePatchRightModel).toBe("camouflage");
    expect(ui.previewScene.pantsKneePatchRightType).toBe("doubleButton");
    expect(ui.previewScene.pantsKneePatchLeftModel).toBe("camouflage");
    expect(ui.previewScene.pantsKneePatchLeftType).toBe("doubleButton");
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
    const ui = deriveConfiguratorUi(
      sessionWithCamouflageBuckleKneePatches,
      sessionWithCamouflageBuckleKneePatches.selectedValueIds,
    );

    expect(ui.previewScene.pantsKneePatchRightModel).toBe("camouflage");
    expect(ui.previewScene.pantsKneePatchRightType).toBe("buckle");
    expect(ui.previewScene.pantsKneePatchLeftModel).toBe("camouflage");
    expect(ui.previewScene.pantsKneePatchLeftType).toBe("buckle");
    expect(ui.previewScene.trimSections).toContainEqual({
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
    const ui = deriveConfiguratorUi(
      sessionWithPointKneePatches,
      sessionWithPointKneePatches.selectedValueIds,
    );

    expect(ui.previewScene.pantsKneePatchRightModel).toBe("point");
    expect(ui.previewScene.pantsKneePatchRightType).toBe("penSeam");
    expect(ui.previewScene.pantsKneePatchLeftModel).toBe("point");
    expect(ui.previewScene.pantsKneePatchLeftType).toBe("penSeam");
    expect(ui.previewScene.trimSections).toContainEqual({
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
    const ui = deriveConfiguratorUi(
      sessionWithTriangularFlapKneePatches,
      sessionWithTriangularFlapKneePatches.selectedValueIds,
    );

    expect(ui.previewScene.pantsKneePatchRightModel).toBe("triangularFlap");
    expect(ui.previewScene.pantsKneePatchLeftModel).toBe("triangularFlap");
    expect(ui.previewScene.trimSections).toContainEqual({
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
    const ui = deriveConfiguratorUi(
      sessionWithRibeteKneePatches,
      sessionWithRibeteKneePatches.selectedValueIds,
    );

    expect(ui.previewScene.pantsKneePatchRightModel).toBe("ribete");
    expect(ui.previewScene.pantsKneePatchRightType).toBe("plain");
    expect(ui.previewScene.pantsKneePatchLeftModel).toBe("ribete");
    expect(ui.previewScene.pantsKneePatchLeftType).toBe("zipper");
    expect(ui.previewScene.trimSections).toContainEqual({
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
    const ui = deriveConfiguratorUi(
      sessionWithInternalKneePatches,
      sessionWithInternalKneePatches.selectedValueIds,
    );

    expect(ui.previewScene.pantsKneePatchRightModel).toBe("internal");
    expect(ui.previewScene.pantsKneePatchRightType).toBeUndefined();
    expect(ui.previewScene.pantsKneePatchLeftModel).toBe("internal");
    expect(ui.previewScene.pantsKneePatchLeftType).toBeUndefined();
  });

  it("no pinta vivos solo con escoger color de vivo", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2601],
      "91": [5152],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-08.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([]);
  });

  it("pinta el cuello solo cuando Seccion de vivo tiene Cuello", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2593],
      "91": [5152],
      "92": [5147],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-10.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "91": [5152],
      "92": [5154],
    });

    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2593],
      "91": [5152],
      "92": [5155, 5156],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-10.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2601],
      "91": [5152],
      "92": [421, 5155, 5156],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-08.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [354],
      "91": [5152],
      "92": [417, 2910, 5146, 5147],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-50-20-20.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "91": [5152],
      "92": [5150],
    });

    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2590],
      "91": [5152],
      "92": [5146, 416, 417, 2907, 2910, 2913, 2916],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [338],
      "91": [5152],
      "92": [5146, 416, 417, 2907, 2910, 2913, 2916],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-02-jdc.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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

  it("detecta la parte baja del vivo del bolsillo inferior aunque no tenga rol de catalogo", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "91": [5152],
      "92": [5153],
    });

    expect(ui.previewScene.trimSections).toEqual([
      {
        valueId: 5153,
        key: "bolsillos-inferiores-parte-baja",
        label: "Bolsillos inferiores parte baja",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("pinta cuello y bolsillo cuando ambas secciones estan seleccionadas", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "91": [5152],
      "92": [5147, 5150],
    });

    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2601],
      "91": [5152],
      "92": [5146],
    });

    expect(ui.previewScene.trimSections).toEqual([
      {
        valueId: 5146,
        role: "backNeck",
        key: "cogotera",
        label: "Cogotera",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("no pinta vivos del cuello alto cuando la sección está en Sin vivos", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2601],
      "91": [5152],
      "92": [5423],
    });

    expect(ui.previewScene.trimSections).toEqual([]);
  });

  it("muestra bolsillo de pecho rectangular solo cuando el modelo seleccionado es Rectangular", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "102": [6101],
    });

    expect(ui.previewScene.chestPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-model.svg",
    );
  });

  it("carga PEDAGOGIA como modelo de cuello independiente", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2948],
      "91": [5152],
      "92": [421, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-29-pedagogia.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2942],
      "91": [5152],
      "92": [5147, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-26-cuello-redondo.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [356],
      "91": [5152],
      "92": [5147, 2877, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-22-estrella.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2938],
      "91": [5152],
      "92": [5147, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-24-botones.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [357],
      "91": [5152],
      "92": [5147, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-23-polo.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [355],
      "91": [5152],
      "92": [5147, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-21-deportivo.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [353],
      "91": [5152],
      "92": [5147, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-40-mariposa.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [352],
      "91": [5152],
      "92": [2901, 5147, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-41-matrioska.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [340],
      "91": [5152],
      "92": [2901, 5147, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-44-cucuta.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [341],
      "91": [5152],
      "92": [5154, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-43.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [343],
      "91": [5152],
      "92": [7009, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-09.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2940],
      "91": [5152],
      "92": [416, 2907, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-25-20-21.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2962],
      "91": [5152],
      "92": [416, 2907, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBeUndefined();
  });

  it("carga PICOS con el modelo que antes estaba en CHEROKEE y pasa vivos externos independientes con cogotera", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2963],
      "91": [5152],
      "92": [416, 2907, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-12-cherokee.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "63": [2944],
      "91": [5152],
      "92": [421, 5146],
    });

    expect(ui.previewScene.neckImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-27-cremallera.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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

  it("oculta bolsillo de pecho cuando el modelo seleccionado es Ninguno", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "102": [6102],
    });

    expect(ui.previewScene.chestPocketImageSrc).toBeUndefined();
  });

  it("muestra bolsillo de pecho si Odoo envia un modelo numerado distinto de Ninguno", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "102": [6103],
    });

    expect(ui.previewScene.chestPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-v2.svg",
    );
  });

  it("muestra bolsillo de pecho Cremallera punta por nombre y pinta superior o inferior", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "102": [6104],
      "91": [5152],
      "92": [7040, 7041],
    });

    expect(ui.previewScene.chestPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point-zipper.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "102": [6106],
    });

    expect(ui.previewScene.chestPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-point.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([]);
  });

  it("muestra bolsillo de pecho Cremallera externo y separa sus tres vivos", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "102": [6105],
      "91": [5152],
      "92": [7040, 7042, 7041],
    });

    expect(ui.previewScene.chestPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-external.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "102": [6107],
      "91": [5152],
      "92": [7040, 7041],
    });

    expect(ui.previewScene.chestPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-zipper-internal.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "102": [6101],
      "91": [5152],
      "92": [5149],
    });

    expect(ui.previewScene.chestPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-model.svg",
    );
    expect(ui.previewScene.trimSections).toEqual([
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
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "102": [6101],
      "120": [7001],
    });

    expect(ui.logoSelection).toEqual({
      attributeId: 120,
      valueIds: [7001],
      label: "Bolsillo de pecho izquierdo",
    });
    expect(ui.previewScene.logoMarker).toEqual({
      placement: "Bolsillo de pecho izquierdo",
    });
  });

  it("no muestra punto de logo cuando la seleccion es Sin logo", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "102": [6101],
      "120": [7002],
    });

    expect(ui.logoSelection).toBeUndefined();
    expect(ui.previewScene.logoMarker).toBeUndefined();
  });

  it("oculta los atributos de color y fuente de texto mientras el texto no este en Si", () => {
    const textDependencies: Array<readonly [string, string]> = [
      [
        "¿Texto en pecho derecho?",
        "Color y fuente de Texto en pecho derecho",
      ],
      [
        "Texto en pecho encima del bolsillo?",
        "Color y fuente de texto en pecho encima del bolsillo",
      ],
      [
        "Texto en bolsillo superior de pecho?",
        "Color y fuente de Texto en bolsillo superior de pecho",
      ],
      [
        "Texto en bolsillo inferior de pecho?",
        "Color y fuente de Texto en bolsillo inferior de pecho",
      ],
      [
        "Texto en manga derecha?",
        "Color y fuente de Texto en manga derecha",
      ],
      [
        "Texto en manga izquierda?",
        "Color y fuente de Texto en manga izquierda",
      ],
      ["Texto en espalda?", "Color y fuente de Texto en espalda"],
    ];
    const textAttributes = textDependencies.flatMap(
      ([toggleName, styleName], index) => {
        const baseId = 12000 + index * 10;

        return [
          {
            id: baseId,
            name: toggleName,
            displayType: "radio" as const,
            selectionMode: "single" as const,
            variantMode: "no_variant" as const,
            values: [
              {
                id: baseId + 1,
                name: "No",
                attributeId: baseId,
                attributeName: toggleName,
              },
              {
                id: baseId + 2,
                name: "Si",
                attributeId: baseId,
                attributeName: toggleName,
              },
              {
                id: baseId + 5,
                name: "Sin seleccion",
                attributeId: baseId,
                attributeName: toggleName,
              },
            ],
          },
          {
            id: baseId + 3,
            name: styleName,
            displayType: "radio" as const,
            selectionMode: "single" as const,
            variantMode: "no_variant" as const,
            values: [
              {
                id: baseId + 4,
                name: "Azul - Arial",
                attributeId: baseId + 3,
                attributeName: styleName,
              },
            ],
          },
        ];
      },
    );
    const sessionWithTextAttributes = {
      ...session,
      attributes: [...session.attributes, ...textAttributes],
    };
    const selectedValueIds = {
      ...session.selectedValueIds,
      ...Object.fromEntries(
        textDependencies.flatMap((_, index) => {
          const baseId = 12000 + index * 10;

          return [
            [String(baseId), [baseId + 1]],
            [String(baseId + 3), [baseId + 4]],
          ];
        }),
      ),
    };
    const ui = deriveConfiguratorUi(sessionWithTextAttributes, selectedValueIds);
    const labels = ui.groups.map((group) => group.label);
    const summaryLabels = ui.summary.map((item) => item.label);

    for (const [toggleName, styleName] of textDependencies) {
      expect(labels).toContain(toggleName);
      expect(labels).not.toContain(styleName);
      expect(summaryLabels).not.toContain(styleName);
    }

    const uiWithoutAnswer = deriveConfiguratorUi(sessionWithTextAttributes, {
      ...session.selectedValueIds,
    });
    const labelsWithoutAnswer = uiWithoutAnswer.groups.map(
      (group) => group.label,
    );

    for (const [, styleName] of textDependencies) {
      expect(labelsWithoutAnswer).not.toContain(styleName);
    }

    const uiWithSinSelection = deriveConfiguratorUi(sessionWithTextAttributes, {
      ...session.selectedValueIds,
      "12010": [12015],
      "12013": [12014],
    });

    expect(uiWithSinSelection.groups.map((group) => group.label)).not.toContain(
      "Color y fuente de texto en pecho encima del bolsillo",
    );

    expect(
      sanitizeSelectedValueIdsForHiddenTextAttributes(
        sessionWithTextAttributes,
        selectedValueIds,
      ),
    ).toEqual(selectedValueIds);
  });

  it("muestra los atributos de color y fuente de texto cuando el texto esta en Si", () => {
    const toggleAttributeId = 12100;
    const styleAttributeId = 12103;
    const sessionWithTextAttributes = {
      ...session,
      attributes: [
        ...session.attributes,
        {
          id: toggleAttributeId,
          name: "Texto en manga derecha?",
          displayType: "radio" as const,
          selectionMode: "single" as const,
          variantMode: "no_variant" as const,
          values: [
            {
              id: 12101,
              name: "No",
              attributeId: toggleAttributeId,
              attributeName: "Texto en manga derecha?",
            },
            {
              id: 12102,
              name: "Si",
              attributeId: toggleAttributeId,
              attributeName: "Texto en manga derecha?",
            },
          ],
        },
        {
          id: styleAttributeId,
          name: "Color y fuente de Texto en manga derecha",
          displayType: "radio" as const,
          selectionMode: "single" as const,
          variantMode: "no_variant" as const,
          values: [
            {
              id: 12104,
              name: "Negro - Arial",
              attributeId: styleAttributeId,
              attributeName: "Color y fuente de Texto en manga derecha",
            },
          ],
        },
      ],
    };
    const ui = deriveConfiguratorUi(sessionWithTextAttributes, {
      ...session.selectedValueIds,
      [String(toggleAttributeId)]: [12102],
    });

    expect(ui.groups.map((group) => group.label)).toContain(
      "Color y fuente de Texto en manga derecha",
    );
  });

  it("solo muestra Opciones de cremallera cuando los bolsillos inferiores llevan cremallera", () => {
    const toggleAttributeId = 12200;
    const optionsAttributeId = 12203;
    const sessionWithZipperOptions = {
      ...session,
      attributes: [
        ...session.attributes,
        {
          id: toggleAttributeId,
          name: "¿Bolsillos inferiores con cremallera?",
          displayType: "radio" as const,
          selectionMode: "single" as const,
          variantMode: "no_variant" as const,
          values: [
            {
              id: 12201,
              name: "No",
              attributeId: toggleAttributeId,
              attributeName: "¿Bolsillos inferiores con cremallera?",
            },
            {
              id: 12202,
              name: "Sí",
              attributeId: toggleAttributeId,
              attributeName: "¿Bolsillos inferiores con cremallera?",
            },
          ],
        },
        {
          id: optionsAttributeId,
          name: "Opciones de cremallera",
          displayType: "radio" as const,
          selectionMode: "single" as const,
          variantMode: "no_variant" as const,
          values: [
            {
              id: 12204,
              name: "Cremallera visible",
              attributeId: optionsAttributeId,
              attributeName: "Opciones de cremallera",
            },
          ],
        },
      ],
    };
    const selectedWithNo = {
      ...session.selectedValueIds,
      [String(toggleAttributeId)]: [12201],
      [String(optionsAttributeId)]: [12204],
    };

    const uiWithNo = deriveConfiguratorUi(
      sessionWithZipperOptions,
      selectedWithNo,
    );
    const uiWithoutAnswer = deriveConfiguratorUi(sessionWithZipperOptions, {
      ...session.selectedValueIds,
      [String(optionsAttributeId)]: [12204],
    });
    const uiWithYes = deriveConfiguratorUi(sessionWithZipperOptions, {
      ...session.selectedValueIds,
      [String(toggleAttributeId)]: [12202],
    });

    expect(uiWithNo.groups.map((group) => group.label)).not.toContain(
      "Opciones de cremallera",
    );
    expect(uiWithoutAnswer.groups.map((group) => group.label)).not.toContain(
      "Opciones de cremallera",
    );
    expect(uiWithYes.groups.map((group) => group.label)).toContain(
      "Opciones de cremallera",
    );
    expect(
      sanitizeSelectedValueIdsForHiddenTextAttributes(
        sessionWithZipperOptions,
        selectedWithNo,
      )[String(optionsAttributeId)],
    ).toEqual([12204]);
  });

  it("oculta cremallera y bolsillo auxiliar cuando el modelo inferior es Ninguno", () => {
    const lowerPocketZipperAttributeId = 815;
    const auxiliaryPocketTypeAttributeId = 156;
    const sessionWithLowerPocketDependencies: ConfiguratorSession = {
      ...session,
      attributes: [
        ...session.attributes,
        {
          id: lowerPocketZipperAttributeId,
          name: "¿Bolsillos inferiores con cremallera?",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 12401,
              name: "No",
              attributeId: lowerPocketZipperAttributeId,
              attributeName: "¿Bolsillos inferiores con cremallera?",
            },
            {
              id: 12402,
              name: "Si",
              attributeId: lowerPocketZipperAttributeId,
              attributeName: "¿Bolsillos inferiores con cremallera?",
            },
          ],
        },
        {
          id: auxiliaryPocketTypeAttributeId,
          name: "Tipo de bolsillo auxiliar",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 12403,
              name: "Lizo doble",
              attributeId: auxiliaryPocketTypeAttributeId,
              attributeName: "Tipo de bolsillo auxiliar",
            },
          ],
        },
      ],
    };
    const selectedWithNone = {
      ...session.selectedValueIds,
      "70": [5425],
      [String(lowerPocketZipperAttributeId)]: [12402],
      [String(auxiliaryPocketTypeAttributeId)]: [12403],
    };
    const selectedWithModel = {
      ...selectedWithNone,
      "70": [2578],
    };
    const uiWithNone = deriveConfiguratorUi(
      sessionWithLowerPocketDependencies,
      selectedWithNone,
    );
    const uiWithoutModel = deriveConfiguratorUi(
      sessionWithLowerPocketDependencies,
      {
        ...selectedWithNone,
        "70": [],
      },
    );
    const uiWithModel = deriveConfiguratorUi(
      sessionWithLowerPocketDependencies,
      selectedWithModel,
    );
    const sanitizedWithNone =
      sanitizeSelectedValueIdsForHiddenTextAttributes(
        sessionWithLowerPocketDependencies,
        selectedWithNone,
      );

    expect(
      uiWithNone.groups.map((group) => group.attributeId),
    ).not.toContain(lowerPocketZipperAttributeId);
    expect(
      uiWithNone.groups.map((group) => group.attributeId),
    ).not.toContain(auxiliaryPocketTypeAttributeId);
    expect(
      uiWithoutModel.groups.map((group) => group.attributeId),
    ).not.toContain(lowerPocketZipperAttributeId);
    expect(
      uiWithoutModel.groups.map((group) => group.attributeId),
    ).not.toContain(auxiliaryPocketTypeAttributeId);
    expect(uiWithModel.groups.map((group) => group.attributeId)).toContain(
      lowerPocketZipperAttributeId,
    );
    expect(uiWithModel.groups.map((group) => group.attributeId)).toContain(
      auxiliaryPocketTypeAttributeId,
    );
    expect(sanitizedWithNone[String(lowerPocketZipperAttributeId)]).toEqual([
      12402,
    ]);
    expect(sanitizedWithNone[String(auxiliaryPocketTypeAttributeId)]).toEqual(
      [12403],
    );
  });

  it("solo muestra bolsillos adicionales de pantalon cuando estan en Si", () => {
    const additionalPocketsAttributeId = 12300;
    const additionalPocketsNoValueId = 12301;
    const additionalPocketsYesValueId = 12302;
    const dependentAttributes = [
      { id: 12310, name: "Modelo bolsillo trasero" },
      { id: 12320, name: "Tipo de bolsillo trasero" },
      { id: 12330, name: "Modelo bolsillo de parche rodilla derecha" },
      { id: 12340, name: "Tipo de bolsillo de parche rodilla derecha" },
      { id: 12350, name: "Modelo bolsillo de parche rodilla izquierda" },
      { id: 12360, name: "Tipo de bolsillo de parche rodilla izquierda" },
    ].map(({ id, name }) => ({
      id,
      name,
      displayType: "radio" as const,
      selectionMode: "single" as const,
      variantMode: "no_variant" as const,
      values: [
        {
          id: id + 1,
          name: "Configurado",
          attributeId: id,
          attributeName: name,
        },
      ],
    }));
    const sessionWithAdditionalPantsPockets: ConfiguratorSession = {
      ...pantalonSession,
      attributes: [
        ...pantalonSession.attributes,
        {
          id: additionalPocketsAttributeId,
          name: "¿Bolsillos adicionales en pantalón?",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: additionalPocketsNoValueId,
              name: "No",
              attributeId: additionalPocketsAttributeId,
              attributeName: "¿Bolsillos adicionales en pantalón?",
            },
            {
              id: additionalPocketsYesValueId,
              name: "Si",
              attributeId: additionalPocketsAttributeId,
              attributeName: "¿Bolsillos adicionales en pantalón?",
            },
          ],
        },
        ...dependentAttributes,
      ],
    };
    const selectedDependentValues = Object.fromEntries(
      dependentAttributes.map((attribute) => [
        String(attribute.id),
        [attribute.id + 1],
      ]),
    );
    const selectedWithNo = {
      ...pantalonSession.selectedValueIds,
      [String(additionalPocketsAttributeId)]: [additionalPocketsNoValueId],
      ...selectedDependentValues,
    };
    const expectedDependentLabels = dependentAttributes.map(
      (attribute) => attribute.name,
    );

    for (const pantsSession of [
      sessionWithAdditionalPantsPockets,
      {
        ...sessionWithAdditionalPantsPockets,
        productTemplateId: 7,
        productName: "Uniforme",
        graphicManifestKey: "uniforme",
      },
    ]) {
      const labelsWithNo = deriveConfiguratorUi(
        pantsSession,
        selectedWithNo,
      ).groups.map((group) => group.label);
      const labelsWithYes = deriveConfiguratorUi(pantsSession, {
        ...pantalonSession.selectedValueIds,
        [String(additionalPocketsAttributeId)]: [additionalPocketsYesValueId],
      }).groups.map((group) => group.label);

      for (const label of expectedDependentLabels) {
        expect(labelsWithNo).not.toContain(label);
        expect(labelsWithYes).toContain(label);
      }

      const preservedSelections =
        sanitizeSelectedValueIdsForHiddenTextAttributes(
          pantsSession,
          selectedWithNo,
        );

      expect(preservedSelections).toMatchObject(selectedDependentValues);
      expect({
        ...preservedSelections,
        [String(additionalPocketsAttributeId)]: [
          additionalPocketsYesValueId,
        ],
      }).toMatchObject(selectedDependentValues);
    }
  });

  it("selecciona Color y fuente al activar cualquiera de los textos dependientes", () => {
    const textDependencies: Array<readonly [string, string]> = [
      [
        "¿Texto en pecho encima del bolsillo?",
        "Color y fuente de texto en pecho encima del bolsillo",
      ],
      [
        "¿Texto en bolsillo superior de pecho?",
        "Color y fuente de Texto en bolsillo superior de pecho",
      ],
      [
        "¿Texto en bolsillo inferior de pecho?",
        "Color y fuente de Texto en bolsillo inferior de pecho",
      ],
      [
        "¿Texto en manga derecha?",
        "Color y fuente de Texto en manga derecha",
      ],
      [
        "¿Texto en manga izquierda?",
        "Color y fuente de Texto en manga izquierda",
      ],
      ["¿Texto en espalda?", "Color y fuente de Texto en espalda"],
    ];
    const textAttributes = textDependencies.flatMap(
      ([toggleName, styleName], index) => {
        const baseId = 13000 + index * 10;

        return [
          {
            id: baseId,
            name: toggleName,
            displayType: "radio" as const,
            selectionMode: "single" as const,
            variantMode: "no_variant" as const,
            values: [
              {
                id: baseId + 1,
                name: "No",
                attributeId: baseId,
                attributeName: toggleName,
              },
              {
                id: baseId + 2,
                name: "Sí",
                attributeId: baseId,
                attributeName: toggleName,
              },
            ],
          },
          {
            id: baseId + 3,
            name: styleName,
            displayType: "radio" as const,
            selectionMode: "single" as const,
            variantMode: "no_variant" as const,
            values: [
              {
                id: baseId + 4,
                name: "Color y fuente",
                attributeId: baseId + 3,
                attributeName: styleName,
              },
              {
                id: baseId + 5,
                name: "Otra configuración",
                attributeId: baseId + 3,
                attributeName: styleName,
              },
            ],
          },
        ];
      },
    );
    const sessionWithTextAttributes = {
      ...session,
      attributes: [...session.attributes, ...textAttributes],
    };
    const selectedValueIds = {
      ...session.selectedValueIds,
      ...Object.fromEntries(
        textDependencies.map((_, index) => {
          const baseId = 13000 + index * 10;
          return [String(baseId), [baseId + 2]];
        }),
      ),
      "13013": [13015],
    };

    const result = applyDefaultTextStyleSelections(
      sessionWithTextAttributes,
      selectedValueIds,
    );

    for (let index = 0; index < textDependencies.length; index += 1) {
      const baseId = 13000 + index * 10;
      const expectedValueId = index === 1 ? baseId + 5 : baseId + 4;

      expect(result[String(baseId + 3)]).toEqual([expectedValueId]);
    }
  });

  it("muestra Color y fuente de Texto en pecho derecho solo con texto en Si y selecciona Color y fuente", () => {
    const toggleAttributeId = 14000;
    const styleAttributeId = 14003;
    const colorAndFontValueId = 14004;
    const sessionWithRightChestText = {
      ...session,
      attributes: [
        ...session.attributes,
        {
          id: toggleAttributeId,
          name: "¿Texto en pecho derecho?",
          displayType: "radio" as const,
          selectionMode: "single" as const,
          variantMode: "no_variant" as const,
          values: [
            {
              id: 14001,
              name: "No",
              attributeId: toggleAttributeId,
              attributeName: "¿Texto en pecho derecho?",
            },
            {
              id: 14002,
              name: "Si",
              attributeId: toggleAttributeId,
              attributeName: "¿Texto en pecho derecho?",
            },
          ],
        },
        {
          id: styleAttributeId,
          name: "Color y fuente de Texto en pecho derecho",
          displayType: "radio" as const,
          selectionMode: "single" as const,
          variantMode: "no_variant" as const,
          values: [
            {
              id: colorAndFontValueId,
              name: "Color y fuente",
              attributeId: styleAttributeId,
              attributeName: "Color y fuente de Texto en pecho derecho",
            },
            {
              id: 14005,
              name: "Otra configuracion",
              attributeId: styleAttributeId,
              attributeName: "Color y fuente de Texto en pecho derecho",
            },
          ],
        },
      ],
    };
    const withoutAnswerUi = deriveConfiguratorUi(sessionWithRightChestText, {
      ...session.selectedValueIds,
    });
    const withNoUi = deriveConfiguratorUi(sessionWithRightChestText, {
      ...session.selectedValueIds,
      [String(toggleAttributeId)]: [14001],
      [String(styleAttributeId)]: [colorAndFontValueId],
    });
    const withYesSelection = applyDefaultTextStyleSelections(
      sessionWithRightChestText,
      {
        ...session.selectedValueIds,
        [String(toggleAttributeId)]: [14002],
      },
    );
    const withYesUi = deriveConfiguratorUi(
      sessionWithRightChestText,
      withYesSelection,
    );

    expect(withoutAnswerUi.groups.map((group) => group.label)).not.toContain(
      "Color y fuente de Texto en pecho derecho",
    );
    expect(withNoUi.groups.map((group) => group.label)).not.toContain(
      "Color y fuente de Texto en pecho derecho",
    );
    expect(withYesUi.groups.map((group) => group.label)).toContain(
      "Color y fuente de Texto en pecho derecho",
    );
    expect(withYesSelection[String(styleAttributeId)]).toEqual([
      colorAndFontValueId,
    ]);
    expect(
      sanitizeSelectedValueIdsForHiddenTextAttributes(
        sessionWithRightChestText,
        {
          ...session.selectedValueIds,
          [String(toggleAttributeId)]: [14001],
          [String(styleAttributeId)]: [colorAndFontValueId],
        },
      )[String(styleAttributeId)],
    ).toEqual([colorAndFontValueId]);
  });

  it("oculta textos de bordados adicionales en Uniforme cuando Bordados adicionales esta en No", () => {
    const additionalEmbroideryAttributeId = 15000;
    const additionalEmbroideryNoValueId = 15001;
    const additionalEmbroideryYesValueId = 15002;
    const textDependencies: Array<readonly [string, string]> = [
      [
        "Texto en pecho encima del bolsillo?",
        "Color y fuente de texto en pecho encima del bolsillo",
      ],
      [
        "Texto en bolsillo superior de pecho?",
        "Color y fuente de Texto en bolsillo superior de pecho",
      ],
      [
        "Texto en bolsillo inferior de pecho?",
        "Color y fuente de Texto en bolsillo inferior de pecho",
      ],
      [
        "Texto en pecho derecho?",
        "Color y fuente de Texto en pecho derecho",
      ],
      [
        "Texto en manga derecha?",
        "Color y fuente de Texto en manga derecha",
      ],
      [
        "Texto en manga izquierda?",
        "Color y fuente de Texto en manga izquierda",
      ],
      ["Texto en espalda?", "Color y fuente de Texto en espalda"],
    ];
    const textAttributes = textDependencies.flatMap(
      ([toggleName, styleName], index) => {
        const baseId = 15100 + index * 10;

        return [
          {
            id: baseId,
            name: toggleName,
            displayType: "radio" as const,
            selectionMode: "single" as const,
            variantMode: "no_variant" as const,
            values: [
              {
                id: baseId + 1,
                name: "No",
                attributeId: baseId,
                attributeName: toggleName,
              },
              {
                id: baseId + 2,
                name: "Si",
                attributeId: baseId,
                attributeName: toggleName,
              },
            ],
          },
          {
            id: baseId + 3,
            name: styleName,
            displayType: "radio" as const,
            selectionMode: "single" as const,
            variantMode: "no_variant" as const,
            values: [
              {
                id: baseId + 4,
                name: "Color y fuente",
                attributeId: baseId + 3,
                attributeName: styleName,
              },
            ],
          },
        ];
      },
    );
    const sessionWithAdditionalEmbroidery: ConfiguratorSession = {
      ...session,
      productTemplateId: 7,
      productName: "Uniforme",
      graphicManifestKey: "uniforme",
      attributes: [
        ...session.attributes,
        {
          id: additionalEmbroideryAttributeId,
          name: "Bordados adicionales?",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: additionalEmbroideryNoValueId,
              name: "No",
              attributeId: additionalEmbroideryAttributeId,
              attributeName: "Bordados adicionales?",
            },
            {
              id: additionalEmbroideryYesValueId,
              name: "Si",
              attributeId: additionalEmbroideryAttributeId,
              attributeName: "Bordados adicionales?",
            },
          ],
        },
        ...textAttributes,
      ],
    };
    const selectedTextValues = Object.fromEntries(
      textDependencies.flatMap((_, index) => {
        const baseId = 15100 + index * 10;

        return [
          [String(baseId), [baseId + 2]],
          [String(baseId + 3), [baseId + 4]],
        ];
      }),
    );
    const selectedWithNo = {
      ...session.selectedValueIds,
      [String(additionalEmbroideryAttributeId)]: [
        additionalEmbroideryNoValueId,
      ],
      ...selectedTextValues,
    };
    const uiWithNo = deriveConfiguratorUi(
      sessionWithAdditionalEmbroidery,
      selectedWithNo,
    );
    const labelsWithNo = uiWithNo.groups.map((group) => group.label);
    const summaryLabelsWithNo = uiWithNo.summary.map((item) => item.label);

    for (const [toggleName, styleName] of textDependencies) {
      expect(labelsWithNo).not.toContain(toggleName);
      expect(labelsWithNo).not.toContain(styleName);
      expect(summaryLabelsWithNo).not.toContain(toggleName);
      expect(summaryLabelsWithNo).not.toContain(styleName);
    }

    expect(
      sanitizeSelectedValueIdsForHiddenTextAttributes(
        sessionWithAdditionalEmbroidery,
        selectedWithNo,
      ),
    ).toEqual(selectedWithNo);

    const uiWithYes = deriveConfiguratorUi(sessionWithAdditionalEmbroidery, {
      ...session.selectedValueIds,
      [String(additionalEmbroideryAttributeId)]: [
        additionalEmbroideryYesValueId,
      ],
    });
    const labelsWithYes = uiWithYes.groups.map((group) => group.label);

    for (const [toggleName, styleName] of textDependencies) {
      expect(labelsWithYes).toContain(toggleName);
      expect(labelsWithYes).not.toContain(styleName);
    }

    const blouseSession: ConfiguratorSession = {
      ...sessionWithAdditionalEmbroidery,
      productTemplateId: 6,
      productName: "Blusa",
      graphicManifestKey: "blusa-antifluido-t180",
    };
    const blouseUiWithNo = deriveConfiguratorUi(blouseSession, selectedWithNo);
    const blouseLabelsWithNo = blouseUiWithNo.groups.map(
      (group) => group.label,
    );

    for (const [toggleName, styleName] of textDependencies) {
      expect(blouseLabelsWithNo).not.toContain(toggleName);
      expect(blouseLabelsWithNo).not.toContain(styleName);
    }

    expect(
      sanitizeSelectedValueIdsForHiddenTextAttributes(
        blouseSession,
        selectedWithNo,
      ),
    ).toEqual(selectedWithNo);

    const blouseUiWithYes = deriveConfiguratorUi(blouseSession, {
      ...session.selectedValueIds,
      [String(additionalEmbroideryAttributeId)]: [
        additionalEmbroideryYesValueId,
      ],
    });

    for (const [toggleName, styleName] of textDependencies) {
      expect(blouseUiWithYes.groups.map((group) => group.label)).toContain(
        toggleName,
      );
      expect(blouseUiWithYes.groups.map((group) => group.label)).not.toContain(
        styleName,
      );
    }
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

    const scene = deriveConfiguratorUi(
      renamedKneeSession,
      renamedKneeSession.selectedValueIds,
    ).previewScene;

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

    const pantsOnlyScene = deriveConfiguratorUi(
      {
        ...renamedKneeSession,
        productTemplateId: 6,
        productName: "Pantalon",
        graphicManifestKey: "pantalon",
      },
      renamedKneeSession.selectedValueIds,
    ).previewScene;

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
      deriveConfiguratorUi(
        renamedTrimSession,
        renamedTrimSession.selectedValueIds,
      ).previewScene.trimSections,
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
      deriveConfiguratorUi(
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
      ).previewScene.trimSections[0]?.key,
    ).toBe("bolsillo lateral de pantalon");
  });
});
