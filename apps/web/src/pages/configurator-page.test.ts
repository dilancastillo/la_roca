import { describe, expect, it } from "vitest";
import { getMissingRequiredSelectionGroups } from "./configurator-page";

describe("validación antes de guardar", () => {
  const neckGroup = {
    attributeId: 63,
    label: "Modelo de cuello",
    controlType: "image" as const,
    selectionMode: "single" as const,
    options: [
      { id: 1, name: "Ninguno" },
      { id: 2, name: "CUELLO V" },
    ],
  };

  it("permite guardar cuando el cuello se deja explicitamente en Ninguno", () => {
    expect(
      getMissingRequiredSelectionGroups([neckGroup], { "63": [1] }),
    ).toEqual([]);
  });

  it("permite guardar cuando se selecciona un cuello real", () => {
    expect(
      getMissingRequiredSelectionGroups([neckGroup], { "63": [2] }),
    ).toEqual([]);
  });

  it("acepta una primera opcion explicita para el bolsillo inferior", () => {
    const lowerPocketGroup = {
      attributeId: 70,
      label: "Modelo bolsillo inferior",
      controlType: "image" as const,
      selectionMode: "single" as const,
      options: [
        { id: 1, name: "Sin selección" },
        { id: 2, name: "Ninguno" },
        { id: 3, name: "COSTURA" },
      ],
    };

    expect(
      getMissingRequiredSelectionGroups([lowerPocketGroup], { "70": [1] }),
    ).toEqual([]);
    expect(
      getMissingRequiredSelectionGroups([lowerPocketGroup], { "70": [2] }),
    ).toEqual([]);
  });
});
