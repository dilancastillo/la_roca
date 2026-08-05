import { describe, expect, it } from "vitest";
import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import type { ActiveVisualDefinition } from "@repo/shared/schemas/visual-catalog";
import {
  getSelectedVisualDefinitions,
  materializeVisualDefinitionSvg,
} from "@repo/shared/visual-catalog-runtime";

const session: ConfiguratorSession = {
  saleOrderLineId: 1,
  saleOrderId: 2,
  orderName: "S00001",
  productId: 3,
  productTemplateId: 7,
  productName: "Uniforme",
  graphicManifestKey: "uniforme",
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
          sourceValueId: 562,
          name: "V - DIVIDIDO",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
      ],
    },
    {
      id: 90,
      name: "Seccion de vivo",
      displayType: "multi",
      selectionMode: "multiple",
      variantMode: "no_variant",
      values: [
        {
          id: 500,
          sourceValueId: 1000,
          name: "Cuello",
          attributeId: 90,
          attributeName: "Seccion de vivo",
        },
        {
          id: 501,
          sourceValueId: 1001,
          name: "Cogotera",
          attributeId: 90,
          attributeName: "Seccion de vivo",
        },
      ],
    },
  ],
  selectedValueIds: {
    "63": [334],
    "90": [501],
  },
  customValuesByValueId: {},
  exclusions: [],
  visualDefinitions: [],
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

function makeDefinition(
  id: string,
  layer: ActiveVisualDefinition["layer"],
  conditionSourceIds: number[],
): ActiveVisualDefinition {
  return {
    id,
    seriesId: "2387ea71-e800-40ca-82e0-b343a7740141",
    version: 1,
    displayName: id,
    slot: "neck",
    layer,
    binding: {
      productTemplateIds: [7],
      attributeId: 63,
      valueId: 334,
      sourceValueId: 562,
      attributeName: "Modelo de cuello",
      valueName: "V - DIVIDIDO",
    },
    activationConditions: conditionSourceIds.length
      ? [
          {
            attributeId: 90,
            attributeName: "Seccion de vivo",
            sourceValueIds: conditionSourceIds,
            valueNames: [],
          },
        ]
      : [],
    selectedElementIds: ["left", "right"],
    elementPaints: {
      left: {
        mode: "trim_stroke",
        trimSourceValueId: 1001,
        visibilityConditions: [
          {
            attributeId: 90,
            attributeName: "Seccion de vivo",
            sourceValueIds: [1001],
            valueNames: ["Cogotera"],
          },
        ],
      },
      right: {
        mode: "trim_stroke",
        trimSourceValueId: 1000,
        visibilityConditions: [
          {
            attributeId: 90,
            attributeName: "Seccion de vivo",
            sourceValueIds: [1000],
            valueNames: ["Cuello"],
          },
        ],
      },
    },
    runtimeSvg:
      '<svg><path style="display:__VC_VISIBILITY_0__;stroke:__VC_TRIM_STROKE_1001__"/><path style="display:__VC_VISIBILITY_1__;stroke:__VC_TRIM_STROKE_1000__"/></svg>',
  };
}

describe("runtime del catalogo visual general", () => {
  it("aplica AND entre condiciones, OR dentro de una condicion y orden por capa", () => {
    const definitions = [
      makeDefinition(
        "878f0d1a-6b95-44c9-b42f-b0b90b9c8466",
        "accent",
        [9999, 1001],
      ),
      makeDefinition(
        "96a59935-8513-429b-b7a0-9f931631a2f4",
        "structure",
        [1000],
      ),
      makeDefinition(
        "92ea851a-0ee5-4545-9458-12b3854c8d22",
        "component",
        [],
      ),
    ];
    const selected = getSelectedVisualDefinitions(
      { ...session, visualDefinitions: definitions },
      session.selectedValueIds,
      "uniforme",
    );

    expect(selected.map((definition) => definition.layer)).toEqual([
      "component",
      "accent",
    ]);
  });

  it("resuelve visibilidad por elemento y toma colores solo de la orden", () => {
    const definition = makeDefinition(
      "878f0d1a-6b95-44c9-b42f-b0b90b9c8466",
      "component",
      [],
    );
    const dataUri = materializeVisualDefinitionSvg(
      definition,
      "#aabbcc",
      [
        { valueId: 501, sourceValueId: 1001, colorHex: "#123456" },
      ],
      { session, selectedValueIds: session.selectedValueIds },
    );
    const svg = decodeURIComponent(dataUri.split(",")[1] ?? "");

    expect(svg).toContain("display:inline");
    expect(svg).toContain("display:none");
    expect(svg).toContain("stroke:#123456");
    expect(svg).toContain("stroke:none");
  });

  it("reconoce el ID fuente estable y no depende del PTAV representativo", () => {
    const definition = makeDefinition(
      "878f0d1a-6b95-44c9-b42f-b0b90b9c8466",
      "component",
      [],
    );
    const selected = getSelectedVisualDefinitions(
      { ...session, visualDefinitions: [definition] },
      {
        ...session.selectedValueIds,
        "63": [562],
      },
      "uniforme",
    );

    expect(selected.map((candidate) => candidate.id)).toEqual([
      definition.id,
    ]);
  });
});
