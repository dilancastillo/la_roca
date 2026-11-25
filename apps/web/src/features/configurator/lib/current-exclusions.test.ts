import { describe, expect, it } from "vitest";
import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { computeDisabledValueIds } from "./derive-configurator-ui.js";

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
});
