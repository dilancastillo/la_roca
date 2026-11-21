import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getOdooIdentityProfile, toVisualAttributeId, toVisualSourceValueId, toLivePtavId } from "./odoo-identity-profile.js";
const inventory = JSON.parse(readFileSync(new URL("./fixtures/odoo-training-production.json", import.meta.url), "utf8")) as {
    attributes: [
        string,
        number,
        number
    ][];
    values: [
        string,
        number,
        number,
        number,
        number
    ][];
    ptavs: [
        string,
        number,
        number,
        number,
        number,
        number,
        number,
        number,
        number[],
        number[]
    ][];
};
describe("verified Odoo identity inventory", () => {
    it("maps every verified attribute and PAV without changing training", () => {
        expect(inventory.attributes).toHaveLength(55);
        expect(inventory.values).toHaveLength(665);
        for (const [, training, production] of inventory.attributes) {
            expect(toVisualAttributeId("laroca-production", production)).toBe(training);
            expect(toVisualAttributeId("training", training)).toBe(training);
        }
        for (const [, training, production] of inventory.values) {
            expect(toVisualSourceValueId("laroca-production", production)).toBe(training);
            expect(toVisualSourceValueId("training", training)).toBe(training);
        }
    });
    it("maps historical PTAV references separately from PAVs", () => {
        expect(inventory.ptavs).toHaveLength(1476);
        for (const [, training, production] of inventory.ptavs) {
            expect(toLivePtavId("laroca-production", training)).toBe(production);
            expect(toLivePtavId("training", training)).toBe(training);
        }
    });
    it("selects a database profile, independently of the deployment environment", () => {
        expect(getOdooIdentityProfile({ ODOO_DB: "larocadotaciones", ODOO_BASE_URL: "https://larocadotaciones.odoo.com/" })).toBe("laroca-production");
        expect(getOdooIdentityProfile({ ODOO_DB: "pstest-traininglaroca", ODOO_BASE_URL: "https://pstest-traininglaroca.odoo.com" })).toBe("training");
        expect(getOdooIdentityProfile({ ODOO_DB: "larocadotaciones", ODOO_BASE_URL: "https://elsewhere.odoo.com" })).toBe("training");
        expect(getOdooIdentityProfile({ ODOO_ID_PROFILE: "training", ODOO_DB: "larocadotaciones", ODOO_BASE_URL: "https://larocadotaciones.odoo.com" })).toBe("training");
        expect(() => getOdooIdentityProfile({ ODOO_ID_PROFILE: "typo" })).toThrow("ODOO_ID_PROFILE");
    });
});
