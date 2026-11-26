import { describe, expect, it } from "vitest";
import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { isPantsKneePatchTypeAllowedForModel } from "@repo/shared/pants-knee-patch-rules";
import { deriveAutomationRenderScene } from "../render/derive-render-scene.js";
import { applyFirstOptionDefaults } from "./get-configurator-session.js";
import { deriveConfiguratorUi } from "../../../web/src/features/configurator/lib/derive-configurator-ui.js";
import { sanitizePantsKneePatchTypeSelections } from "../../../web/src/features/configurator/lib/selection-exclusions.js";

const specs = [
  [169, 3185, 1931, "Modelo bolsillo de parche rodilla izquierda", "Ribete"],
  [170, 1280, 765, "Tipo de bolsillo de parche rodilla izquierda", "Lizo"],
  [171, 3195, 1932, "Modelo bolsillo de parche rodilla derecha", "Ribete"],
  [172, 1288, 773, "Tipo de bolsillo de parche rodilla derecha", "Lizo"],
] as const;
const attributes = specs.map(([id, valueId, sourceValueId, name, valueName]) => ({
  id, name, displayType: "radio" as const, selectionMode: "single" as const, variantMode: "no_variant" as const,
  values: [{ id: valueId, sourceValueId, name: valueName, attributeId: id, attributeName: name }],
}));
const selected = { "169": [3185], "170": [1280], "171": [3195], "172": [1288] };
const session = {
  productName: "Pantalón", graphicManifestKey: "pantalon", attributes, exclusions: [], selectedValueIds: selected,
} as unknown as ConfiguratorSession;

describe("Odoo Ribete + Lizo compatibility", () => {
  it("preserves exactly the approved finish matrix with the Ribete plain exception", () => {
    for (const model of ["square", "ribete", "point", "camouflage", "triangularFlap", "internal"] as const) {
      expect(isPantsKneePatchTypeAllowedForModel(model, "plain")).toBe(model === "square" || model === "ribete");
      for (const type of ["velcro", "overlaid"] as const) {
        expect(isPantsKneePatchTypeAllowedForModel(model, type)).toBe(model === "square");
      }
      expect(isPantsKneePatchTypeAllowedForModel(model, "horizontalZipper")).toBe(true);
    }
  });

  it("retains Lizo on both actual Odoo sides during selection sanitization and defaults", () => {
    expect(sanitizePantsKneePatchTypeSelections(session, selected)).toEqual(selected);
    expect(applyFirstOptionDefaults(attributes, { "169": [3185], "171": [3195] }, []))
      .toEqual(selected);
  });

  it("keeps Ribete and Lizo in both web and PNG render scenes", () => {
    const web = deriveConfiguratorUi(session, selected).previewScene;
    const png = deriveAutomationRenderScene(session, selected);
    for (const scene of [web, png]) {
      expect(scene.pantsKneePatchLeftModel).toBe("ribete");
      expect(scene.pantsKneePatchLeftType).toBe("plain");
      expect(scene.pantsKneePatchRightModel).toBe("ribete");
      expect(scene.pantsKneePatchRightType).toBe("plain");
    }
  });
});
