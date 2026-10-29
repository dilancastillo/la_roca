import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { describe, expect, it } from "vitest";
import {
  applyFirstOptionDefaults,
  sanitizePantsKneePatchTypeSelections,
  sanitizeSelectedValueIdsForExclusions,
} from "./selection-exclusions";

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
  it("asigna la primera opcion compatible a los atributos simples vacios", () => {
    expect(
      applyFirstOptionDefaults(session, {
        "10": [101],
      }),
    ).toEqual({
      "10": [101],
      // La primera opcion de bolsillo entra en conflicto con Modelo 1; toma
      // la siguiente sin reemplazar la seleccion existente.
      "20": [202],
    });
  });

  it("elige Ninguno cuando el género invalida el cuello anterior", () => {
    const sessionWithEmptyNeck: ConfiguratorSession = {
      ...session,
      attributes: [
        {
          ...session.attributes[0]!,
          values: [
            {
              id: 100,
              name: "Sin selección",
              attributeId: 10,
              attributeName: "Modelo de cuello",
            },
            {
              id: 103,
              name: "Ninguno",
              attributeId: 10,
              attributeName: "Modelo de cuello",
            },
            ...session.attributes[0]!.values,
          ],
        },
        ...session.attributes.slice(1),
      ],
    };

    expect(applyFirstOptionDefaults(sessionWithEmptyNeck, {})).toMatchObject({
      "10": [103],
    });

    // Odoo puede dejar seleccionado el valor placeholder en vez de una lista
    // vacía al recalcular exclusiones después de cambiar el género.
    expect(
      applyFirstOptionDefaults(sessionWithEmptyNeck, { "10": [100] }),
    ).toMatchObject({
      "10": [103],
    });
  });

  it("reemplaza Sin selección en cualquier atributo simple por una opción real", () => {
    const sessionWithPlaceholderPocket: ConfiguratorSession = {
      ...session,
      attributes: [
        session.attributes[0]!,
        {
          ...session.attributes[1]!,
          name: "Modelo bolsillo de pecho",
          values: [
            {
              id: 200,
              name: "Sin seleccion",
              attributeId: 20,
              attributeName: "Modelo bolsillo de pecho",
            },
            ...session.attributes[1]!.values,
          ],
        },
        session.attributes[2]!,
      ],
    };

    expect(
      applyFirstOptionDefaults(sessionWithPlaceholderPocket, { "20": [200] }),
    ).toMatchObject({
      // Modelo 1 queda excluido por el cuello que se selecciona también por
      // defecto; el siguiente valor compatible demuestra que nunca persiste
      // el placeholder.
      "20": [202],
    });
  });

  it("conserva Sin selección como variante válida de Talla pantalón", () => {
    const pantsSizeAttribute = {
      id: 31,
      name: "Talla pantalón",
      displayType: "option" as const,
      selectionMode: "single" as const,
      variantMode: "dynamic" as const,
      values: [
        {
          id: 310,
          name: "SIN SELECCIÓN",
          attributeId: 31,
          attributeName: "Talla pantalón",
        },
        {
          id: 311,
          name: "6",
          attributeId: 31,
          attributeName: "Talla pantalón",
        },
      ],
    };
    const sessionWithPantsSize: ConfiguratorSession = {
      ...session,
      attributes: [pantsSizeAttribute, ...session.attributes],
    };

    expect(
      applyFirstOptionDefaults(sessionWithPantsSize, { "31": [310] }),
    ).toMatchObject({ "31": [310] });
    expect(applyFirstOptionDefaults(sessionWithPantsSize, {})).toMatchObject({
      "31": [310],
    });
  });

  it("inicia Sin selección, pero conserva Ninguno elegido en Modelo bolsillo inferior", () => {
    const lowerPocketAttribute = { id: 32, name: "Modelo bolsillo inferior", displayType: "option" as const, selectionMode: "single" as const, variantMode: "no_variant" as const, values: [{ id: 320, name: "Sin selección", attributeId: 32, attributeName: "Modelo bolsillo inferior" }, { id: 321, name: "Ninguno", attributeId: 32, attributeName: "Modelo bolsillo inferior" }, { id: 322, name: "COSTURA", attributeId: 32, attributeName: "Modelo bolsillo inferior" }] };
    const lowerPocketSession: ConfiguratorSession = { ...session, attributes: [lowerPocketAttribute, ...session.attributes] };
    expect(applyFirstOptionDefaults(lowerPocketSession, {})).toMatchObject({ "32": [320] });
    expect(applyFirstOptionDefaults(lowerPocketSession, { "32": [321] })).toMatchObject({ "32": [321] });
  });
  it("reemplaza Ninguno por un color concreto en Color de vivos", () => {
    const trimColorAttribute: ConfiguratorSession["attributes"][number] = {
      id: 33,
      name: "Color de vivos",
      displayType: "color",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        { id: 330, name: "Ninguno", attributeId: 33, attributeName: "Color de vivos" },
        { id: 331, name: "Azul", attributeId: 33, attributeName: "Color de vivos" },
      ],
    };
    const trimColorSession: ConfiguratorSession = {
      ...session,
      attributes: [trimColorAttribute, ...session.attributes],
    };

    expect(applyFirstOptionDefaults(trimColorSession, { "33": [330] })).toMatchObject({
      "33": [331],
    });
  });

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

describe("sanitizePantsKneePatchTypeSelections", () => {
  it("elige Liso por defecto para un bolsillo de rodilla rectangular", () => {
    const kneeSession = {
      attributes: [
        {
          id: 169, name: "Modelo rodilla derecha", displayType: "radio", selectionMode: "single", variantMode: "no_variant",
          values: [
            { id: 7600, sourceValueId: 760, name: "Rectangular", attributeId: 169, attributeName: "Modelo rodilla derecha" },
          ],
        },
        {
          id: 170, name: "Tipo rodilla derecha", displayType: "radio", selectionMode: "single", variantMode: "no_variant",
          values: [
            { id: 7660, sourceValueId: 766, name: "Velcro", attributeId: 170, attributeName: "Tipo rodilla derecha" },
            { id: 7650, sourceValueId: 765, name: "Liso", attributeId: 170, attributeName: "Tipo rodilla derecha" },
          ],
        },
      ],
      exclusions: [],
    } as unknown as ConfiguratorSession;

    expect(applyFirstOptionDefaults(kneeSession, { "169": [7600] }))
      .toMatchObject({ "170": [7650] });
  });

  it("conserva velcro para rectangular y lo limpia al cambiar a camuflado", () => {
    const kneeSession = {
      attributes: [
        {
          id: 169, name: "Modelo rodilla derecha", displayType: "radio", selectionMode: "single", variantMode: "no_variant",
          values: [
            { id: 7600, sourceValueId: 760, name: "Rectangular", attributeId: 169, attributeName: "Modelo rodilla derecha" },
            { id: 19330, sourceValueId: 1933, name: "Camuflado", attributeId: 169, attributeName: "Modelo rodilla derecha" },
          ],
        },
        {
          id: 170, name: "Tipo rodilla derecha", displayType: "radio", selectionMode: "single", variantMode: "no_variant",
          values: [
            { id: 7660, sourceValueId: 766, name: "Velcro", attributeId: 170, attributeName: "Tipo rodilla derecha" },
            { id: 19370, sourceValueId: 1937, name: "Broche", attributeId: 170, attributeName: "Tipo rodilla derecha" },
          ],
        },
      ],
      exclusions: [],
    } as unknown as ConfiguratorSession;

    expect(sanitizePantsKneePatchTypeSelections(kneeSession, {
      "169": [7600], "170": [7660],
    })).toMatchObject({ "170": [7660] });
    expect(sanitizePantsKneePatchTypeSelections(kneeSession, {
      "169": [19330], "170": [7660],
    })).toMatchObject({ "170": [] });
  });
});
