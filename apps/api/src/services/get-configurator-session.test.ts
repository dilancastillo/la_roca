import { describe, expect, it } from "vitest";
import { resolveSelectedIdsForAttributeValues } from "./get-configurator-session.js";

describe("resolveSelectedIdsForAttributeValues", () => {
  const colorValues = [
    { id: 100, name: "110601 - Blanco" },
    { id: 200, name: "150341 - Verde Olivo Claro" },
  ];

  it("prioriza el valor guardado explicitamente en la linea sobre el valor del producto", () => {
    expect(
      resolveSelectedIdsForAttributeValues(
        colorValues,
        new Set([200]),
        new Set([100]),
      ),
    ).toEqual([200]);
  });

  it("usa el valor del producto cuando la linea no tiene seleccion explicita", () => {
    expect(
      resolveSelectedIdsForAttributeValues(
        colorValues,
        new Set(),
        new Set([100]),
      ),
    ).toEqual([100]);
  });
});
