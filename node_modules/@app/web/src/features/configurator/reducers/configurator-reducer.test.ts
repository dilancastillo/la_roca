import { describe, it, expect } from "vitest";
import { configuratorReducer } from "./configurator-reducer";

describe("configuratorReducer", () => {
  it("actualiza color base", () => {
    const next = configuratorReducer(
      { trimSections: {} },
      { type: "SET_BASE_COLOR", value: "Azul" }
    );

    expect(next.baseColor).toBe("Azul");
  });
});