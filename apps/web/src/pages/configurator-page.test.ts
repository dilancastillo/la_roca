import { describe, expect, it } from "vitest";
import {
  getTextGroupsWithContent,
  getMissingRequiredSelectionGroups,
} from "./configurator-page";

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

  it("bloquea Sin selección y permite una selección explícita en el bolsillo inferior", () => {
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
    ).toEqual([lowerPocketGroup]);
    expect(
      getMissingRequiredSelectionGroups([lowerPocketGroup], { "70": [2] }),
    ).toEqual([]);
  });
});

describe("expansión condicional de campos de texto", () => {
  const textGroup = {
    attributeId: 150,
    label: "¿Texto en manga derecha?",
    controlType: "chips" as const,
    selectionMode: "single" as const,
    options: [
      { id: 10, name: "No", allowsCustomValue: false },
      { id: 11, name: "Si", allowsCustomValue: true },
    ],
  };

  it("abre automáticamente el texto seleccionado que contiene información", () => {
    expect(
      getTextGroupsWithContent(
        [textGroup],
        { "150": [11] },
        { "11": "LA ROCA" },
      ),
    ).toEqual(new Set([150]));
  });

  it("no abre un texto vacío ni una medida", () => {
    const measurementGroup = {
      attributeId: 151,
      label: "Largo bota",
      controlType: "chips" as const,
      selectionMode: "single" as const,
      options: [{ id: 12, name: "Largo", allowsCustomValue: true }],
    };

    expect(
      getTextGroupsWithContent(
        [measurementGroup, textGroup],
        { "151": [12], "150": [11] },
        {},
      ),
    ).toEqual(new Set());
  });

  it("se contrae al borrar el último contenido", () => {
    expect(
      getTextGroupsWithContent([textGroup], { "150": [11] }, { "11": "" }),
    ).toEqual(new Set());
  });
});
