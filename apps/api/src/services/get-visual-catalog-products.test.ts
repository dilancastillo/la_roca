import { describe, expect, it } from "vitest";
import type { VisualDefinitionMutation } from "@repo/shared/schemas/visual-catalog";
import {
  getVisualDefinitionOdooIssues,
  mapVisualCatalogProducts,
} from "./get-visual-catalog-products.js";

const products = mapVisualCatalogProducts({
  templates: [
    { id: 6, name: "Blusa" },
    { id: 7, name: "Uniforme" },
    { id: 8, name: "Pantalon" },
    { id: 9, name: "Zapato" },
  ],
  attributes: [
    { id: 63, name: "Modelo de cuello" },
    { id: 90, name: "Seccion de vivo" },
  ],
  sourceValues: [
    { id: 957, name: "V - DIVIDIDO", sequence: 2 },
    { id: 1100, name: "Cuello", sequence: 1 },
  ],
  attributeLines: [
    {
      id: 1,
      product_tmpl_id: [6, "Blusa"],
      attribute_id: [90, "Seccion de vivo"],
      sequence: 20,
    },
    {
      id: 2,
      product_tmpl_id: [6, "Blusa"],
      attribute_id: [63, "Modelo de cuello"],
      sequence: 10,
    },
    {
      id: 3,
      product_tmpl_id: [7, "Uniforme"],
      attribute_id: [63, "Modelo de cuello"],
      sequence: 10,
    },
    {
      id: 4,
      product_tmpl_id: [7, "Uniforme"],
      attribute_id: [90, "Seccion de vivo"],
      sequence: 20,
    },
  ],
  ptavs: [
    {
      id: 2598,
      name: "V - DIVIDIDO",
      sequence: 2,
      attribute_id: [63, "Modelo de cuello"],
      product_attribute_value_id: [957, "V - DIVIDIDO"],
      product_tmpl_id: [6, "Blusa"],
      excluded_value_ids: [2700],
    },
    {
      id: 2600,
      name: "Cuello",
      sequence: 1,
      attribute_id: [90, "Seccion de vivo"],
      product_attribute_value_id: [1100, "Cuello"],
      product_tmpl_id: [6, "Blusa"],
    },
    {
      id: 3598,
      name: "V - DIVIDIDO",
      sequence: 2,
      attribute_id: [63, "Modelo de cuello"],
      product_attribute_value_id: [957, "V - DIVIDIDO"],
      product_tmpl_id: [7, "Uniforme"],
    },
    {
      id: 3600,
      name: "Cuello",
      sequence: 1,
      attribute_id: [90, "Seccion de vivo"],
      product_attribute_value_id: [1100, "Cuello"],
      product_tmpl_id: [7, "Uniforme"],
    },
  ],
});

const definition: VisualDefinitionMutation = {
  displayName: "V - DIVIDIDO",
  slot: "neck",
  layer: "component",
  binding: {
    productTemplateIds: [6, 7],
    attributeId: 63,
    valueId: 2598,
    sourceValueId: 957,
    attributeName: "Modelo de cuello",
    valueName: "V - DIVIDIDO",
  },
  activationConditions: [
    {
      attributeId: 90,
      attributeName: "Seccion de vivo",
      sourceValueIds: [1100],
      valueNames: ["Cuello"],
    },
  ],
  selectedElementIds: ["neck"],
  elementPaints: {
    neck: {
      mode: "trim_stroke",
      trimSourceValueId: 1100,
      visibilityConditions: [
        {
          attributeId: 90,
          attributeName: "Seccion de vivo",
          sourceValueIds: [1100],
          valueNames: ["Cuello"],
        },
      ],
    },
  },
  placement: {
    targetWidth: 1080,
    targetHeight: 1350,
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  },
  referenceAssetSrc: "/base.svg",
  originalSvg: "<svg></svg>",
  normalizedSvg: "<svg></svg>",
  runtimeSvg: "<svg></svg>",
};

describe("productos generales del catalogo visual", () => {
  it("clasifica productos y conserva el orden de atributos, valores y exclusiones", () => {
    expect(products.map((product) => product.family)).toEqual([
      "blouse",
      "pants",
      "uniform",
    ]);
    expect(products[0]?.attributes.map((attribute) => attribute.id)).toEqual([
      63,
      90,
    ]);
    expect(products[0]?.attributes[0]?.values[0]).toMatchObject({
      id: 2598,
      sourceValueId: 957,
      excludedValueIds: [2700],
    });
  });

  it("valida IDs fuente contra todas las plantillas objetivo", () => {
    expect(getVisualDefinitionOdooIssues(definition, products)).toEqual([]);

    expect(
      getVisualDefinitionOdooIssues(
        {
          ...definition,
          binding: {
            ...definition.binding,
            productTemplateIds: [6, 8],
          },
        },
        products,
      ),
    ).toContain("Pantalon no admite componentes del tipo neck.");
  });

  it("rechaza reglas imposibles segun las exclusiones de Odoo", () => {
    const excludedProducts = products.map((product) => ({
      ...product,
      attributes: product.attributes.map((attribute) => ({
        ...attribute,
        values: attribute.values.map((value) =>
          product.id === 6 && value.sourceValueId === 957
            ? { ...value, excludedValueIds: [2600] }
            : value,
        ),
      })),
    }));

    expect(
      getVisualDefinitionOdooIssues(definition, excludedProducts),
    ).toContain(
      "Blusa excluye todas las combinaciones posibles de las reglas generales.",
    );
  });
});
