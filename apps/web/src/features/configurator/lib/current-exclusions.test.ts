import { describe, expect, it } from "vitest";
import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { computeDisabledValueIds } from "./derive-configurator-ui.js";
import { sanitizeSelectedValueIdsForExclusions } from "./selection-exclusions.js";

describe("Odoo exclusions in both selection directions", () => {
  const session = {
    attributes: [],
    exclusions: [{ sourceValueId: 100, excludedValueId: 200 }],
  } as unknown as ConfiguratorSession;
  it("disables the excluded color when the material was selected first", () => {
    expect(computeDisabledValueIds(session, { material: [100] }).has(200)).toBe(true);
  });
  it("also disables the incompatible material when the color was selected first", () => {
    expect(computeDisabledValueIds(session, { color: [200] }).has(100)).toBe(true);
  });
  it("keeps selected conflicting options removable and restores availability after deselection", () => {
    expect(computeDisabledValueIds(session, { color: [200], material: [100] }).size).toBe(0);
    expect(computeDisabledValueIds(session, {}).size).toBe(0);
  });

  it("keeps both genders available even when the current neck and size exclude the other gender", () => {
    const genderSession = {
      attributes: [{ id: 142, name: "Género", values: [{ id: 1151 }, { id: 1152 }] }],
      exclusions: [
        { sourceValueId: 1152, excludedValueId: 200 },
        { sourceValueId: 300, excludedValueId: 1152 },
        { sourceValueId: 1151, excludedValueId: 400 },
      ],
    } as unknown as ConfiguratorSession;
    const disabled = computeDisabledValueIds(genderSession, { "142": [1151], neck: [200], size: [300] });
    expect(disabled.has(1151)).toBe(false);
    expect(disabled.has(1152)).toBe(false);
    expect(disabled.has(400)).toBe(true);
  });

  const maleNeckIds = [1156, 1160, 1164, 3072, 3088];
  const neckSession = {
    attributes: [
      { id: 142, name: "Género", values: [{ id: 1151 }, { id: 1152 }] },
      { id: 145, name: "Modelo de cuello", values: [...maleNeckIds.map((id) => ({ id })), { id: 1199 }] },
      { id: 146, name: "Talla", values: [{ id: 3121 }] },
      { id: 999, name: "Detalle", values: [{ id: 9000 }] },
    ],
    exclusions: [
      ...maleNeckIds.map((id) => ({ sourceValueId: 3121, excludedValueId: id })),
      ...maleNeckIds.map((id) => ({ sourceValueId: id, excludedValueId: 9000 })),
      { sourceValueId: 1151, excludedValueId: 1199 },
    ],
  } as unknown as ConfiguratorSession;
  it("allows all gender-compatible necks independently of selected size and dependent details", () => {
    const disabled = computeDisabledValueIds(neckSession, { "142": [1151], "146": [3121], "999": [9000] });
    for (const id of maleNeckIds) expect(disabled.has(id)).toBe(false);
    expect(disabled.has(1199)).toBe(true);
  });
  it("selecting any compatible neck clears incompatible dependents while preserving gender", () => {
    for (const id of maleNeckIds) {
      const result = sanitizeSelectedValueIdsForExclusions(neckSession, {
        "142": [1151], "145": [id], "146": [3121], "999": [9000],
      }, id);
      expect(result["142"]).toEqual([1151]);
      expect(result["145"]).toEqual([id]);
      expect(result["146"]).toEqual([]);
      expect(result["999"]).toEqual([]);
    }
  });
  it("a stale incompatible neck selection cannot silently change the chosen gender", () => {
    const result = sanitizeSelectedValueIdsForExclusions(neckSession, { "142": [1151], "145": [1199] }, 1199);
    expect(result["142"]).toEqual([1151]);
    expect(result["145"]).toEqual([]);
  });

  it("keeps real sizes available before the neck is selected, respecting gender, material and color", () => {
    const sizeSession = {
      attributes: [
        { id: 142, name: "Género", values: [{ id: 1151 }] },
        { id: 141, name: "Material", values: [{ id: 973 }] },
        { id: 798, name: "Color", values: [{ id: 2138 }] },
        { id: 143, name: "Talla de blusa", values: [{ id: 992 }, { id: 993 }, { id: 994 }, { id: 995 }] },
        { id: 145, name: "Modelo de cuello", values: [{ id: 3119 }] },
        { id: 163, name: "Talla pantalon", values: [{ id: 1236 }] },
      ],
      exclusions: [
        { sourceValueId: 3119, excludedValueId: 992 },
        { sourceValueId: 1151, excludedValueId: 993 },
        { sourceValueId: 994, excludedValueId: 973 },
        { sourceValueId: 2138, excludedValueId: 995 },
        { sourceValueId: 3119, excludedValueId: 1236 },
      ],
    } as unknown as ConfiguratorSession;
    const selected = { "142": [1151], "141": [973], "798": [2138], "145": [3119] };
    const disabled = computeDisabledValueIds(sizeSession, selected);
    expect(disabled.has(992)).toBe(false);
    expect(disabled.has(1236)).toBe(false);
    for (const id of [993, 994, 995]) expect(disabled.has(id)).toBe(true);
    const next = sanitizeSelectedValueIdsForExclusions(sizeSession, { ...selected, "143": [992] }, 992);
    expect(next["143"]).toEqual([992]);
    expect(next["145"]).toEqual([]);
    expect(next["142"]).toEqual([1151]);
  });

  it("a dependent Sin bolsillos selection cannot hide its parent models", () => {
    const flow = {
      attributes: [
        { id: 154, name: "Modelo bolsillo inferior", selectionMode: "single", values: [{ id: 1202 }, { id: 1203 }, { id: 1204 }] },
        { id: 155, name: "Tipo bolsillo inferior", selectionMode: "single", values: [{ id: 1300 }, { id: 1301 }] },
      ],
      exclusions: [
        { sourceValueId: 1300, excludedValueId: 1202 },
        { sourceValueId: 1203, excludedValueId: 1300 },
        { sourceValueId: 1204, excludedValueId: 1301 },
      ],
    } as unknown as ConfiguratorSession;
    const disabled = computeDisabledValueIds(flow, { "155": [1300] });
    for (const id of [1202, 1203, 1204]) expect(disabled.has(id)).toBe(false);
    expect(computeDisabledValueIds(flow, { "154": [1202] }).has(1300)).toBe(true);
    expect(computeDisabledValueIds(flow, { "154": [1204] }).has(1301)).toBe(true);
    expect(sanitizeSelectedValueIdsForExclusions(flow, { "154": [1202], "155": [1300] }, 1202))
      .toEqual({ "154": [1202], "155": [] });
  });

  it("single-choice alternatives remain reachable, while multi-choice conflicts remain blocked", () => {
    const flow = {
      attributes: [
        { id: 154, name: "Modelo", selectionMode: "single", values: [{ id: 100 }, { id: 200 }] },
        { id: 157, name: "Vivos", selectionMode: "multiple", values: [{ id: 300 }, { id: 400 }] },
      ],
      exclusions: [{ sourceValueId: 100, excludedValueId: 200 }, { sourceValueId: 300, excludedValueId: 400 }],
    } as unknown as ConfiguratorSession;
    const disabled = computeDisabledValueIds(flow, { "154": [100], "157": [300] });
    expect(disabled.has(200)).toBe(false);
    expect(disabled.has(400)).toBe(true);
  });
});
