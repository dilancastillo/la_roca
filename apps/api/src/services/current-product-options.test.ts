import { describe, expect, it } from "vitest";
import { filterCurrentProductOptions } from "./get-configurator-session.js";

describe("current product options", () => {
  const option = {
    id: 3072, name: "CRUZADO", ptav_active: true,
    attribute_id: [145, "Modelo de cuello"] as [number, string],
    product_attribute_value_id: [2137, "CRUZADO"] as [number, string],
    product_tmpl_id: [7, "Uniforme"] as [number, string],
    attribute_line_id: [49, "Modelo de cuello"] as [number, string],
  };
  const attribute = { id: 145, name: "Modelo de cuello", active: true };
  const value = { id: 2137, name: "CRUZADO", active: true, attribute_id: option.attribute_id };
  const line = { id: 49, attribute_id: option.attribute_id, active: true, value_ids: [2137] };
  it("retains current options even when their production and training IDs differ", () => {
    expect(filterCurrentProductOptions([option], [attribute], [value], [line])).toEqual([option]);
  });
  it("rejects a surviving PTAV after its value was removed from the product", () => {
    expect(filterCurrentProductOptions([option], [attribute], [value], [{ ...line, value_ids: [] }])).toEqual([]);
  });
  it("rejects archived attributes, values, lines and PTAVs independently", () => {
    expect(filterCurrentProductOptions([option], [{ ...attribute, active: false }], [value], [line])).toEqual([]);
    expect(filterCurrentProductOptions([option], [attribute], [{ ...value, active: false }], [line])).toEqual([]);
    expect(filterCurrentProductOptions([option], [attribute], [value], [{ ...line, active: false }])).toEqual([]);
    expect(filterCurrentProductOptions([{ ...option, ptav_active: false }], [attribute], [value], [line])).toEqual([]);
  });
  it("does not borrow another line or attribute to validate an orphaned PTAV", () => {
    expect(filterCurrentProductOptions([option], [attribute], [value], [{ ...line, id: 999 }])).toEqual([]);
    expect(filterCurrentProductOptions([option], [attribute], [{ ...value, attribute_id: [157, "Vivos"] }], [line])).toEqual([]);
    expect(filterCurrentProductOptions([option], [attribute], [], [line])).toEqual([]);
    expect(filterCurrentProductOptions([option], [attribute], [value], [])).toEqual([]);
  });
});
