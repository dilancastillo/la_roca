import { describe, expect, it } from "vitest";
import { configuratorReducer } from "./configurator-reducer";

describe("configuratorReducer", () => {
  it("reemplaza una seleccion simple", () => {
    const next = configuratorReducer(
      { selectedValueIds: { "10": [100] }, customValuesByValueId: {} },
      { type: "SET_SINGLE", attributeId: 10, valueId: 200 },
    );

    expect(next.selectedValueIds["10"]).toEqual([200]);
  });

  it("activa y desactiva selecciones multiples", () => {
    const enabled = configuratorReducer(
      { selectedValueIds: { "20": [1] }, customValuesByValueId: {} },
      { type: "TOGGLE_MULTI", attributeId: 20, valueId: 2 },
    );

    const disabled = configuratorReducer(enabled, {
      type: "TOGGLE_MULTI",
      attributeId: 20,
      valueId: 1,
    });

    expect(enabled.selectedValueIds["20"]).toEqual([1, 2]);
    expect(disabled.selectedValueIds["20"]).toEqual([2]);
  });

  it("actualiza textos personalizados sin tocar las selecciones", () => {
    const next = configuratorReducer(
      { selectedValueIds: { "30": [300] }, customValuesByValueId: {} },
      { type: "SET_CUSTOM_VALUE", valueId: 300, value: "Bordado La Roca" },
    );

    expect(next.selectedValueIds["30"]).toEqual([300]);
    expect(next.customValuesByValueId["300"]).toBe("Bordado La Roca");
  });
});
