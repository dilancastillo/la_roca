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
    {
      id: 156,
      name: "Tipo de bolsillo auxiliar",
      displayType: "radio",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 600,
          sourceValueId: 618,
          name: "Lizo doble",
          attributeId: 156,
          attributeName: "Tipo de bolsillo auxiliar",
        },
        {
          id: 601,
          sourceValueId: 620,
          name: "Lizo derecho",
          attributeId: 156,
          attributeName: "Tipo de bolsillo auxiliar",
        },
        {
          id: 602,
          sourceValueId: 621,
          name: "Lizo izquierdo",
          attributeId: 156,
          attributeName: "Tipo de bolsillo auxiliar",
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
    expect(svg).toContain('data-vc-linear-trim-texture="cord"');
    expect(svg).toContain("stroke-width:12px!important");
    expect(svg).toContain("stroke-dasharray:4 6!important");
    expect(svg).not.toContain("__VC_TRIM_STROKE_1000__");
    expect(svg).not.toContain("stroke:none");
  });

  it("aplica textura solo a Vivo, linea y conserva Vivo, relleno", () => {
    const definition = makeDefinition(
      "878f0d1a-6b95-44c9-b42f-b0b90b9c8466",
      "component",
      [],
    );
    definition.selectedElementIds = ["linear", "filled"];
    definition.elementPaints = {
      linear: {
        mode: "trim_stroke",
        trimSourceValueId: 1001,
        visibilityConditions: [],
      },
      filled: {
        mode: "trim_fill",
        trimSourceValueId: 1000,
        visibilityConditions: [],
      },
    };
    definition.runtimeSvg =
      '<svg><path id="linear" style="display:__VC_VISIBILITY_0__;fill:none;stroke:__VC_TRIM_STROKE_1001__!important;"/><path id="filled" style="display:__VC_VISIBILITY_1__;fill:__VC_TRIM_FILL_1000__!important;"/></svg>';

    const svg = decodeURIComponent(
      materializeVisualDefinitionSvg(
        definition,
        "#aabbcc",
        [
          { valueId: 501, sourceValueId: 1001, colorHex: "#123456" },
          { valueId: 502, sourceValueId: 1000, colorHex: "#654321" },
        ],
        { session, selectedValueIds: session.selectedValueIds },
      ).split(",")[1] ?? "",
    );

    expect(svg.match(/data-vc-linear-trim-texture="cord"/g)).toHaveLength(1);
    expect(svg).toContain("stroke:#123456!important");
    expect(svg).toContain("fill:#654321!important");
    expect(svg).not.toContain("stroke:#654321");
  });

  it("trata condiciones repetidas del mismo atributo como alternativas OR", () => {
    const definition = makeDefinition(
      "878f0d1a-6b95-44c9-b42f-b0b90b9c8466",
      "component",
      [],
    );
    definition.elementPaints.left!.visibilityConditions = [
      {
        attributeId: 90,
        attributeName: "Seccion de vivo",
        sourceValueIds: [1000],
        valueNames: ["Cuello"],
      },
      {
        attributeId: 90,
        attributeName: "Seccion de vivo",
        sourceValueIds: [1001],
        valueNames: ["Cogotera"],
      },
    ];

    const dataUri = materializeVisualDefinitionSvg(
      definition,
      "#aabbcc",
      [],
      { session, selectedValueIds: session.selectedValueIds },
    );
    const svg = decodeURIComponent(dataUri.split(",")[1] ?? "");

    expect(svg).toContain("display:inline");
  });

  it("activa ambos vectores laterales cuando Odoo selecciona Lizo doble", () => {
    const definition = makeDefinition(
      "878f0d1a-6b95-44c9-b42f-b0b90b9c8466",
      "component",
      [],
    );
    definition.elementPaints.left!.visibilityConditions = [
      {
        attributeId: 156,
        attributeName: "Tipo de bolsillo auxiliar",
        sourceValueIds: [621],
        valueNames: ["Lizo izquierdo"],
      },
    ];
    definition.elementPaints.right!.visibilityConditions = [
      {
        attributeId: 156,
        attributeName: "Tipo de bolsillo auxiliar",
        sourceValueIds: [620],
        valueNames: ["Lizo derecho"],
      },
    ];

    const svgWithDouble = decodeURIComponent(
      materializeVisualDefinitionSvg(definition, "#aabbcc", [], {
        session,
        selectedValueIds: { ...session.selectedValueIds, "156": [600] },
      }).split(",")[1] ?? "",
    );
    const svgWithRight = decodeURIComponent(
      materializeVisualDefinitionSvg(definition, "#aabbcc", [], {
        session,
        selectedValueIds: { ...session.selectedValueIds, "156": [601] },
      }).split(",")[1] ?? "",
    );

    expect(svgWithDouble.match(/display:inline/g)).toHaveLength(2);
    expect(svgWithRight.match(/display:inline/g)).toHaveLength(1);
    expect(svgWithRight.match(/display:none/g)).toHaveLength(1);
  });

  it("conserva el bolsillo original cuando la linea no resuelve el color de vivo", () => {
    const definition: ActiveVisualDefinition = {
      ...makeDefinition(
        "878f0d1a-6b95-44c9-b42f-b0b90b9c8466",
        "component",
        [],
      ),
      slot: "lower_pocket",
      selectedElementIds: ["left-pocket", "right-pocket", "auxiliary-line"],
      elementPaints: {
        "left-pocket": {
          mode: "trim_stroke",
          trimSourceValueId: 633,
          visibilityConditions: [],
        },
        "right-pocket": {
          mode: "trim_stroke",
          trimSourceValueId: 633,
          visibilityConditions: [],
        },
        "auxiliary-line": {
          mode: "trim_fill",
          trimSourceValueId: 634,
          visibilityConditions: [],
        },
      },
      runtimeSvg: `
        <svg>
          <style>.st1{fill:none;stroke:#000}</style>
          <polyline class="st1" style="stroke:__VC_TRIM_STROKE_633__!important;" />
          <polyline class="st1" style="stroke:__VC_TRIM_STROKE_633__!important;" />
          <line class="st1" style="fill:__VC_TRIM_FILL_634__!important;" />
        </svg>
      `,
    };
    const svgWithoutTrim = decodeURIComponent(
      materializeVisualDefinitionSvg(definition, "#aabbcc", []).split(",")[1] ?? "",
    );
    const svgWithTrim = decodeURIComponent(
      materializeVisualDefinitionSvg(
        definition,
        "#aabbcc",
        [
          { valueId: 633, sourceValueId: 633, colorHex: "#123456" },
          { valueId: 634, sourceValueId: 634, colorHex: "#654321" },
        ],
      ).split(",")[1] ?? "",
    );

    expect(svgWithoutTrim).toContain(".st1{fill:none;stroke:#000}");
    expect(svgWithoutTrim).not.toContain("stroke:none");
    expect(svgWithoutTrim).not.toMatch(/__VC_[A-Z0-9_]+__/);
    expect(svgWithTrim.match(/stroke:#123456/g)).toHaveLength(2);
    expect(svgWithTrim).toContain("stroke:#654321");
    expect(svgWithTrim).not.toContain("fill:#654321");
  });

  it("oculta el relleno original cuando una seccion de vivo no tiene color", () => {
    const definition: ActiveVisualDefinition = {
      ...makeDefinition(
        "878f0d1a-6b95-44c9-b42f-b0b90b9c8466",
        "component",
        [],
      ),
      selectedElementIds: ["neck-background"],
      elementPaints: {
        "neck-background": {
          mode: "trim_fill",
          trimSourceValueId: 1967,
          visibilityConditions: [],
        },
      },
      runtimeSvg:
        '<svg><path id="neck-background" fill="#ffffff" style="fill:__VC_TRIM_FILL_1967__!important;" /></svg>',
    };

    const svgWithoutTrim = decodeURIComponent(
      materializeVisualDefinitionSvg(definition, "#ffc400", []).split(",")[1] ??
        "",
    );

    expect(svgWithoutTrim).toContain('fill="#ffffff"');
    expect(svgWithoutTrim).toContain("fill:none!important");
    expect(svgWithoutTrim).not.toMatch(/__VC_[A-Z0-9_]+__/);
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
