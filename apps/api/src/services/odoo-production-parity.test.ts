import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import type { OdooEnv } from "../lib/app-env.js";
import { getConfiguratorSession } from "./get-configurator-session.js";
import { deriveAutomationRenderScene } from "../render/derive-render-scene.js";
import { deriveConfiguratorUi } from "../../../web/src/features/configurator/lib/derive-configurator-ui.js";
import { mapVisualCatalogProducts, getVisualDefinitionOdooIssues } from "./get-visual-catalog-products.js";
import { PRODUCTION_PTAV_TO_TRAINING } from "../lib/odoo-production-identities.js";
import { getSelectedVisualDefinitions, materializeSelectedVisualDefinitions } from "@repo/shared/visual-catalog-runtime";
import type { ActiveVisualDefinition } from "@repo/shared/schemas/visual-catalog";
const inv = JSON.parse(readFileSync(new URL("../lib/fixtures/odoo-training-production.json", import.meta.url), "utf8")) as {
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
const mocks = vi.hoisted(() => ({ read: vi.fn(), search: vi.fn(), definitions: vi.fn() }));
vi.mock("../lib/odoo-client.js", () => ({ odooRead: mocks.read, odooSearchRead: mocks.search }));
vi.mock("./visual-catalog-repository.js", () => ({ loadActiveVisualDefinitions: mocks.definitions, getSharedSleeveTabCalibration: async () => undefined }));
vi.mock("./visual-release-repository.js", () => ({ getOrCreateLineVisualRelease: async () => null, getVisualRelease: async () => null }));
const visualAttrs = new Set([142, 145, 157, 798, 809, 814]);
function database(production: boolean, template: number, neck: number, gender: number, trimColor: string) {
    const templateName = template === 5 ? "Blusa" : "Uniforme";
    const rows = inv.ptavs.filter(r => r[3] === template && visualAttrs.has(r[4]));
    const idx = production ? 2 : 1;
    const attributes = inv.attributes.filter(a => visualAttrs.has(a[1])).map(a => ({ id: a[idx], name: a[0], display_type: a[1] === 157 ? "multi" : "radio", create_variant: a[1] === 145 ? "always" : "no_variant" }));
    const values = inv.values.filter(v => visualAttrs.has(v[3])).map(v => ({ id: v[idx], name: v[0], ...(v[3] === 814 ? { html_color: trimColor } : v[3] === 798 ? { html_color: "#ffee77" } : {}) }));
    const ptavs = rows.map(r => ({ id: r[idx], name: inv.values.find(v => v[1] === r[6])?.[0] ?? r[0], attribute_id: [production ? r[5] : r[4], inv.attributes.find(a => a[1] === r[4])?.[0] ?? "Unknown"], product_attribute_value_id: [production ? r[7] : r[6], r[0]], product_tmpl_id: [template, templateName], excluded_value_ids: production ? r[9] : r[8] }));
    const selected = rows.filter(r => r[4] === 145 ? r[6] === neck : r[4] === 142 ? r[6] === gender : r[4] === 157 ? r[6] === 1978 : rows.find(x => x[4] === r[4]) === r).map(r => r[idx]);
    return { attributes, values, ptavs, selected, templateName, attributeLines: attributes.map((a, i) => ({ id: i + 1, attribute_id: [a.id, a.name], product_tmpl_id: [template, templateName], sequence: i })) };
}
async function load(production: boolean, template: number, neck: number, gender: number, trimColor: string, dynamic = false) {
    const db = database(production, template, neck, gender, trimColor);
    mocks.read.mockImplementation(async (_env: OdooEnv, model: string) => {
        if (model === "sale.order.line")
            return [{ id: 4, order_id: [5, "S00005"], product_id: [2283, db.templateName], product_template_attribute_value_ids: [], product_no_variant_attribute_value_ids: db.selected }];
        if (model === "sale.order")
            return [{ id: 5, name: "S00005", state: "draft" }];
        if (model === "product.product")
            return [{ id: 2283, product_tmpl_id: [template, db.templateName], product_template_attribute_value_ids: [] }];
        if (model === "product.attribute")
            return db.attributes;
        if (model === "product.attribute.value")
            return db.values;
        return [];
    });
    mocks.search.mockImplementation(async (_env: OdooEnv, model: string) => model === "product.template.attribute.value" ? db.ptavs : model === "product.template.attribute.line" ? db.attributeLines : []);
    const definition: ActiveVisualDefinition = { id: "fixture-neck", seriesId: "fixture-series", version: 1, displayName: "Verified geometry", slot: "neck", layer: "component", binding: { productTemplateIds: [5, 7], attributeId: 145, attributeName: "Modelo de cuello", valueId: inv.ptavs.find(r => r[3] === template && r[6] === neck)?.[1] ?? 1, sourceValueId: neck, valueName: inv.values.find(v => v[1] === neck)?.[0] ?? "Neck" }, activationConditions: [{ attributeId: 157, attributeName: "Sección de vivo", sourceValueIds: [1978], valueNames: ["Cuello completo"] }], selectedElementIds: [], elementPaints: {}, placement: { targetWidth: 1080, targetHeight: 1350, x: 12, y: 27, scaleX: 1.1, scaleY: 0.9, rotation: 3 }, runtimeSvg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350"><path d="M400 100 L500 300" stroke="__VC_TRIM_STROKE_1978__" fill="none"/></svg>' };
    mocks.definitions.mockResolvedValue(dynamic ? [definition] : []);
    const session = await getConfiguratorSession(production ? { ODOO_ID_PROFILE: "laroca-production" } : { ODOO_ID_PROFILE: "training" }, 4);
    return { session, db, definition };
}
function canonicalScene(value: unknown): unknown {
    if (Array.isArray(value))
        return value.map(canonicalScene);
    if (value && typeof value === "object")
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, k === "valueId" && typeof v === "number" ? PRODUCTION_PTAV_TO_TRAINING[v] ?? v : canonicalScene(v)]));
    return value;
}
describe("training/production visual equivalence from verified inventory", () => {
    const necks = inv.values.filter(v => v[3] === 145 && inv.ptavs.some(r => r[3] === 7 && r[6] === v[1]));
    for (const [name, neck] of necks) {
        it.each([5, 7])("preserves static " + name + " on template %s", async (template) => {
            for (const gender of [531, 532]) {
                const a = await load(false, template, neck, gender, "#ffffff");
                const b = await load(true, template, neck, gender, "#ffffff");
                expect(canonicalScene(deriveAutomationRenderScene(b.session, b.session.selectedValueIds))).toEqual(deriveAutomationRenderScene(a.session, a.session.selectedValueIds));
                expect(canonicalScene(deriveConfiguratorUi(b.session, b.session.selectedValueIds).previewScene)).toEqual(deriveConfiguratorUi(a.session, a.session.selectedValueIds).previewScene);
                expect(b.session.attributes.find(x => x.id === 809)?.odooAttributeId).toBe(819);
                expect(b.session.attributes.find(x => x.id === 814)?.odooAttributeId).toBe(809);
                expect(Object.values(b.session.selectedValueIds).flat().every(id => b.db.ptavs.some(p => p.id === id))).toBe(true);
                expect(b.session.exclusions.every(e => b.db.ptavs.some(p => p.id === e.sourceValueId && p.excluded_value_ids.includes(e.excludedValueId)))).toBe(true);
            }
        });
    }
    it.each(["#ffffff", "#af1326"])("preserves dynamic binding, trim and placement with %s", async (color) => {
        const a = await load(false, 7, 1987, 532, color, true);
        const b = await load(true, 7, 1987, 532, color, true);
        const left = deriveAutomationRenderScene(a.session, a.session.selectedValueIds), right = deriveAutomationRenderScene(b.session, b.session.selectedValueIds);
        expect(canonicalScene(right)).toEqual(left);
        expect(canonicalScene(deriveConfiguratorUi(b.session, b.session.selectedValueIds).previewScene)).toEqual(deriveConfiguratorUi(a.session, a.session.selectedValueIds).previewScene);
        expect(getSelectedVisualDefinitions(b.session, b.session.selectedValueIds, "uniforme").map(d => d.id)).toEqual(["fixture-neck"]);
        const materialized = materializeSelectedVisualDefinitions(b.session, b.session.selectedValueIds, "uniforme", "#ffee77", [{ valueId: 1, sourceValueId: 1978, colorHex: color }]);
        expect(materialized[0]?.placement).toEqual(b.definition.placement);
        expect(decodeURIComponent(materialized[0]?.svgDataUri ?? "")).toContain(color);
        const products = mapVisualCatalogProducts({ templates: [{ id: 7, name: "Uniforme" }], ptavs: b.db.ptavs as never, attributes: b.db.attributes as never, sourceValues: b.db.values, attributeLines: b.db.attributeLines as never, identityProfile: "laroca-production" });
        const issues = getVisualDefinitionOdooIssues({ ...b.definition, binding: { ...b.definition.binding, productTemplateIds: [7] } }, products);
        expect(issues.filter(i => i.includes("ya no contiene") || i.includes("condicion"))).toEqual([]);
        const male = await load(true, 7, 1987, 531, color, true);
        const maleScene = deriveAutomationRenderScene(male.session, male.session.selectedValueIds);
        expect(maleScene.uniformParts?.blouse.garmentDetailAssetPath).toContain("data:image/svg+xml");
        expect(maleScene.uniformParts?.blouse.neckAssetPath).toBeUndefined();
    });
});
