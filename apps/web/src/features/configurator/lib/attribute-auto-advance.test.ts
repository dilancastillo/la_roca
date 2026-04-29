import { describe, expect, it } from "vitest";
import type { UiAttributeGroup } from "./derive-configurator-ui";
import { getNextAutoExpandedAttributeId } from "./attribute-auto-advance";

const groups: UiAttributeGroup[] = [
  {
    attributeId: 10,
    label: "Color",
    controlType: "color",
    selectionMode: "single",
    options: [{ id: 101, name: "Blanco" }],
  },
  {
    attributeId: 20,
    label: "Modelo de cuello",
    controlType: "image",
    selectionMode: "single",
    options: [{ id: 201, name: "Modelo 1" }],
  },
  {
    attributeId: 30,
    label: "Tipo de bolsillos inferiores",
    controlType: "chips",
    selectionMode: "single",
    options: [{ id: 301, name: "Lizo" }],
  },
];

describe("getNextAutoExpandedAttributeId", () => {
  it("abre la siguiente seccion en orden despues de la seleccion actual", () => {
    expect(
      getNextAutoExpandedAttributeId({
        groups,
        currentAttributeId: 10,
        selectedValueIds: { "10": [101] },
      }),
    ).toBe(20);
  });

  it("abre la siguiente seccion en orden aunque ya tenga seleccion desde Odoo", () => {
    expect(
      getNextAutoExpandedAttributeId({
        groups,
        currentAttributeId: 10,
        selectedValueIds: {
          "10": [101],
          "20": [201],
          "30": [301],
        },
      }),
    ).toBe(20);
  });

  it("no regresa a una seccion anterior pendiente porque el avance debe ser secuencial", () => {
    expect(
      getNextAutoExpandedAttributeId({
        groups,
        currentAttributeId: 20,
        selectedValueIds: {
          "20": [201],
          "30": [301],
        },
      }),
    ).toBe(30);
  });

  it("no abre secciones si la actual es la ultima y todo esta listo", () => {
    expect(
      getNextAutoExpandedAttributeId({
        groups,
        currentAttributeId: 30,
        selectedValueIds: {
          "10": [101],
          "20": [201],
          "30": [301],
        },
      }),
    ).toBeNull();
  });

  it("evita abrir una seccion sin opciones visibles", () => {
    expect(
      getNextAutoExpandedAttributeId({
        groups,
        currentAttributeId: 10,
        selectedValueIds: { "10": [101] },
        disabledValueIds: new Set([201]),
      }),
    ).toBe(30);
  });

  it("permite abrir una seccion con una opcion seleccionada aunque esa opcion quede excluida", () => {
    expect(
      getNextAutoExpandedAttributeId({
        groups,
        currentAttributeId: 10,
        selectedValueIds: { "10": [101], "20": [201] },
        disabledValueIds: new Set([201]),
      }),
    ).toBe(20);
  });
});
