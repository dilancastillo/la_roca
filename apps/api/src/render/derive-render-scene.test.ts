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
          id: 5149,
          name: "Bolsillo pecho",
          attributeId: 92,
          attributeName: "Sección de vivo",
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
    "63": [2601],
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

describe("deriveAutomationRenderScene", () => {
  it("pinta el cuello alto con el color de vivo sin depender de la sección escogida", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-08.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5147,
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5150,
        role: "lowerPockets",
        key: "bolsillos-inferiores",
        label: "Bolsillos inferiores",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("pinta el cuello 2019 con el color de vivo sin depender de la seccion escogida", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2593],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-10.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5147,
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5150,
        role: "lowerPockets",
        key: "bolsillos-inferiores",
        label: "Bolsillos inferiores",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("pinta presilla ovalo con el color de vivo sin depender de la seccion escogida", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [2599],
    });

    expect(scene.neckAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-09.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5147,
        key: "cuello",
        label: "Cuello",
        colorHex: "#f4c7cc",
      },
      {
        valueId: 5150,
        role: "lowerPockets",
        key: "bolsillos-inferiores",
        label: "Bolsillos inferiores",
        colorHex: "#f4c7cc",
      },
    ]);
  });

  it("pinta el vivo de bolsillo inferior aunque no dependa del cuello", () => {
    const scene = deriveAutomationRenderScene(session, {
      ...session.selectedValueIds,
      "63": [],
    });

    expect(scene.lowerPocketAssetPath).toBe(
      "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-14.svg",
    );
    expect(scene.trimSections).toEqual([
      {
        valueId: 5150,
        role: "lowerPockets",
        key: "bolsillos-inferiores",
        label: "Bolsillos inferiores",
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
});
