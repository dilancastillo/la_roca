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
});
