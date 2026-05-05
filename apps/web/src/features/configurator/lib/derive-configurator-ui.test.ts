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
});
