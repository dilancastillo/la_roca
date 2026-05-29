import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { normalizeLowerPocketSelectionsForSave } from "@repo/shared/lower-pocket-rules";
import { describe, expect, it } from "vitest";
import { deriveConfiguratorUi } from "./derive-configurator-ui";

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
      "image",
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
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-v2.svg",
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

  it("pinta vivo de bolsillo de pecho solo con la seccion Bolsillo pecho", () => {
    const ui = deriveConfiguratorUi(session, {
      ...session.selectedValueIds,
      "102": [6101],
      "91": [5152],
      "92": [5149],
    });

    expect(ui.previewScene.chestPocketImageSrc).toBe(
      "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-v2.svg",
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
});
