import type {
  VisualCatalogOdooAttribute,
  VisualCatalogProduct,
} from "@repo/shared/schemas/visual-catalog";
import { describe, expect, it } from "vitest";
import {
  getCompatibleVisualCatalogAttributes,
  isBindingAttributeInVisualSlot,
} from "./odoo-option-compatibility";

const neckAttribute: VisualCatalogOdooAttribute = {
  id: 145,
  name: "Modelo de cuello",
  sequence: 1,
  values: [
    {
      id: 334,
      sourceValueId: 554,
      name: "CUELLO V",
      sequence: 1,
      excludedValueIds: [5002],
    },
  ],
};

const trimAttribute: VisualCatalogOdooAttribute = {
  id: 157,
  name: "Sección de vivo",
  sequence: 2,
  values: [
    {
      id: 5001,
      sourceValueId: 630,
      name: "Cuello V lineal externo derecho",
      sequence: 1,
      excludedValueIds: [],
    },
    {
      id: 5002,
      sourceValueId: 1980,
      name: "Cuello Borde Dividido superior",
      sequence: 2,
      excludedValueIds: [],
    },
    {
      id: 5003,
      sourceValueId: 633,
      name: "Bolsillos inferiores parte superior derecha",
      sequence: 3,
      excludedValueIds: [],
    },
    {
      id: 5004,
      sourceValueId: 1979,
      name: "Cuello Borde Dividido inferior",
      sequence: 4,
      excludedValueIds: [334],
    },
    {
      id: 5005,
      sourceValueId: 2103,
      name: "Bolsillo inferior aletas",
      sequence: 5,
      excludedValueIds: [],
    },
  ],
};

const product: VisualCatalogProduct = {
  id: 5,
  name: "Blusa",
  family: "blouse",
  attributes: [neckAttribute, trimAttribute],
  warnings: [],
};

describe("compatibilidad de opciones del catálogo visual", () => {
  it("muestra solamente el atributo activador propio del componente", () => {
    expect(isBindingAttributeInVisualSlot("neck", neckAttribute)).toBe(true);
    expect(isBindingAttributeInVisualSlot("lower_pocket", neckAttribute)).toBe(
      false,
    );
    expect(isBindingAttributeInVisualSlot("boot", neckAttribute)).toBe(false);
  });

  it("aplica las exclusiones de Odoo en ambos sentidos", () => {
    const attributes = getCompatibleVisualCatalogAttributes(
      [product],
      [neckAttribute, trimAttribute],
      [{ attributeId: 145, sourceValueIds: [554] }],
    );
    const trimValues = attributes.find((attribute) => attribute.id === 157)?.values;

    expect(trimValues?.map((value) => value.sourceValueId)).toEqual([
      630,
      633,
      2103,
    ]);
  });

  it("deja que las exclusiones de Odoo decidan todas las opciones compatibles", () => {
    const compatibleAttributes = getCompatibleVisualCatalogAttributes(
      [product],
      [neckAttribute, trimAttribute],
      [{ attributeId: 145, sourceValueIds: [554] }],
    );
    const visibleNeckTrims = compatibleAttributes
      .find((attribute) => attribute.id === 157)
      ?.values;

    expect(visibleNeckTrims?.map((value) => value.sourceValueId)).toEqual([
      630,
      633,
      2103,
    ]);
  });

  it("recalcula todos los atributos con cada seleccion adicional de Odoo", () => {
    const auxiliaryType: VisualCatalogOdooAttribute = {
      id: 156,
      name: "Tipo de bolsillo auxiliar",
      sequence: 3,
      values: [
        {
          id: 6001,
          sourceValueId: 620,
          name: "Lizo izquierdo",
          sequence: 1,
          excludedValueIds: [5003],
        },
      ],
    };
    const productWithAuxiliaryType: VisualCatalogProduct = {
      ...product,
      attributes: [neckAttribute, auxiliaryType, trimAttribute],
    };

    const attributes = getCompatibleVisualCatalogAttributes(
      [productWithAuxiliaryType],
      [neckAttribute, auxiliaryType, trimAttribute],
      [
        { attributeId: 145, sourceValueIds: [554] },
        { attributeId: 156, sourceValueIds: [620] },
      ],
    );
    const trimValues = attributes.find((attribute) => attribute.id === 157)?.values;

    expect(trimValues?.map((value) => value.sourceValueId)).toEqual([
      630,
      2103,
    ]);
  });

  it("conserva una opcion cuando existe al menos una alternativa OR compatible", () => {
    const attributes = getCompatibleVisualCatalogAttributes(
      [product],
      [neckAttribute, trimAttribute],
      [{ attributeId: 157, sourceValueIds: [630, 1980] }],
    );

    expect(
      attributes
        .find((attribute) => attribute.id === 145)
        ?.values.map((value) => value.sourceValueId),
    ).toEqual([554]);
  });

  it("conserva opciones de Odoo aunque otra plantilla no tenga ese atributo", () => {
    const productWithoutTrim: VisualCatalogProduct = {
      id: 7,
      name: "Uniforme",
      family: "uniform",
      attributes: [neckAttribute],
      warnings: [],
    };
    const attributes = getCompatibleVisualCatalogAttributes(
      [product, productWithoutTrim],
      [trimAttribute],
      [{ attributeId: 145, sourceValueIds: [554] }],
    );

    expect(
      attributes
        .find((attribute) => attribute.id === 157)
        ?.values.map((value) => value.sourceValueId),
    ).toEqual([630, 633, 2103]);
  });
});
