import { describe, expect, it } from "vitest";
import { configuratorReducer } from "./configurator-reducer";

describe("configuratorReducer", () => {
  it("reemplaza una seleccion simple", () => {
    const next = configuratorReducer(
      { selectedValueIds: { "10": [100] } },
      { type: "SET_SINGLE", attributeId: 10, valueId: 200 },
    );

    expect(next.selectedValueIds["10"]).toEqual([200]);
  });

  it("activa y desactiva selecciones multiples", () => {
    const enabled = configuratorReducer(
      { selectedValueIds: { "20": [1] } },
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
});
