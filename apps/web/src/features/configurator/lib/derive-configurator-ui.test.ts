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
          id: 5425,
          name: "Ninguno",
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
