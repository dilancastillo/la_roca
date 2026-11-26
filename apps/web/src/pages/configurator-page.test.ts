import { describe, expect, it } from "vitest";
import {
  getTextGroupsWithContent,
  getMissingRequiredSelectionGroups,
} from "./configurator-page";

describe("validación antes de guardar", () => {
  it("solicita color, tallas y modelos antes de las medidas sin inventar selecciones", () => {
    const groups = ["Color", "Talla de blusa", "Talla pantalón", "Modelo de cuello", "Modelo bolsillo inferior", "Tipo bota", "Largo bota", "Ancho bota"]
      .map((label, index) => ({
        attributeId: index + 1, label, controlType: "chips" as const, selectionMode: "single" as const,
        options: [{ id: 100 + index, name: "Elegido" }],
      }));
    const selected: Record<string, number[]> = {};
    for (const group of groups) {
      expect(getMissingRequiredSelectionGroups(groups, selected)[0]?.label).toBe(group.label);
      selected[String(group.attributeId)] = [group.options[0]!.id];
    }
    expect(getMissingRequiredSelectionGroups(groups, selected)).toEqual([]);
  });

  it("no considera completado un grupo con un ID que ya no existe en sus opciones", () => {
    const group = { attributeId: 1, label: "Talla de blusa", controlType: "chips" as const, selectionMode: "single" as const, options: [{ id: 10, name: "M" }] };
    expect(getMissingRequiredSelectionGroups([group], { "1": [999] })).toEqual([group]);
  });

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

  it("bloquea Ninguno en color y tallas, pero conserva Sin selección como variante válida", () => {
    const colorGroup = {
      attributeId: 71,
      label: "Color",
      controlType: "chips" as const,
      selectionMode: "single" as const,
      options: [
        { id: 1, name: "Ninguno" },
        { id: 2, name: "Azul" },
      ],
    };
    const pantsSizeGroup = {
      attributeId: 72,
      label: "Talla pantalón",
      controlType: "chips" as const,
      selectionMode: "single" as const,
      options: [
        { id: 3, name: "Ninguno" },
        { id: 4, name: "Sin selección" },
        { id: 5, name: "6" },
      ],
    };

    expect(
      getMissingRequiredSelectionGroups(
        [colorGroup, pantsSizeGroup],
        { "71": [1], "72": [3] },
      ),
    ).toEqual([colorGroup, pantsSizeGroup]);
    expect(
      getMissingRequiredSelectionGroups(
        [colorGroup, pantsSizeGroup],
        { "71": [2], "72": [4] },
      ),
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

  it("abre tallas y pespunte únicamente cuando tienen texto", () => {
    const sizeGroup = {
      attributeId: 152,
      label: "Talla de blusa",
      controlType: "chips" as const,
      selectionMode: "single" as const,
      options: [{ id: 13, name: "Personalizada", allowsCustomValue: true }],
    };
    const stitchingGroup = {
      attributeId: 153,
      label: "Pespunte",
      controlType: "chips" as const,
      selectionMode: "single" as const,
      options: [{ id: 14, name: "Personalizado", allowsCustomValue: true }],
    };

    expect(
      getTextGroupsWithContent(
        [sizeGroup, stitchingGroup],
        { "152": [13], "153": [14] },
        { "13": "M", "14": "Doble hilo" },
      ),
    ).toEqual(new Set([152, 153]));
  });

  it("se contrae al borrar el último contenido", () => {
    expect(
      getTextGroupsWithContent([textGroup], { "150": [11] }, { "11": "" }),
    ).toEqual(new Set());
  });
});
