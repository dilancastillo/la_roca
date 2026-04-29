import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { describe, expect, it } from "vitest";
import { sanitizeSelectedValueIdsForExclusions } from "./selection-exclusions";

const session = {
  attributes: [
    {
      id: 10,
      name: "Modelo de cuello",
      displayType: "radio",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 101,
          name: "Modelo 1",
          attributeId: 10,
          attributeName: "Modelo de cuello",
        },
        {
          id: 102,
          name: "Modelo 2",
          attributeId: 10,
          attributeName: "Modelo de cuello",
        },
      ],
    },
    {
      id: 20,
      name: "Modelo bolsillo inferior",
      displayType: "radio",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 201,
          name: "Bolsillo 1",
          attributeId: 20,
          attributeName: "Modelo bolsillo inferior",
        },
        {
          id: 202,
          name: "Bolsillo 2",
          attributeId: 20,
          attributeName: "Modelo bolsillo inferior",
        },
      ],
    },
    {
      id: 30,
      name: "Color de vivo",
      displayType: "color",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 301,
          name: "Rojo",
          attributeId: 30,
          attributeName: "Color de vivo",
        },
      ],
    },
  ],
  exclusions: [
    {
      sourceValueId: 101,
      excludedValueId: 201,
    },
    {
      sourceValueId: 202,
      excludedValueId: 301,
    },
  ],
} as ConfiguratorSession;

describe("sanitizeSelectedValueIdsForExclusions", () => {
  it("quita selecciones que quedan excluidas por la combinacion actual", () => {
    expect(
      sanitizeSelectedValueIdsForExclusions(session, {
        "10": [101],
        "20": [201],
        "30": [301],
      }),
    ).toEqual({
      "10": [101],
      "20": [],
      "30": [301],
    });
  });

  it("prioriza la ultima opcion elegida cuando entra en conflicto con una seleccion previa", () => {
    expect(
      sanitizeSelectedValueIdsForExclusions(
        session,
        {
          "10": [101],
          "20": [201],
        },
        201,
      ),
    ).toEqual({
      "10": [],
      "20": [201],
    });
  });

  it("limpia conflictos encadenados sin eliminar opciones que ya no estan excluidas", () => {
    expect(
      sanitizeSelectedValueIdsForExclusions(session, {
        "10": [101],
        "20": [202],
        "30": [301],
      }),
    ).toEqual({
      "10": [101],
      "20": [202],
      "30": [],
    });
  });
});
