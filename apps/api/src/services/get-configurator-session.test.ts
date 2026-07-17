import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildConfiguratorStateDescription } from "./configurator-state-metadata.js";
import {
  getConfiguratorSession,
  resolveOdooOptionImageSrc,
  resolveSelectedIdsForAttributeValues,
  toOdooImageDataUri,
} from "./get-configurator-session.js";

const mocks = vi.hoisted(() => ({
  odooRead: vi.fn(),
  odooSearchRead: vi.fn(),
}));

vi.mock("../lib/odoo-client.js", () => ({
  odooRead: mocks.odooRead,
  odooSearchRead: mocks.odooSearchRead,
}));

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

describe("toOdooImageDataUri", () => {
  it("convierte imagenes binarias de Odoo en data URIs renderizables por el navegador", () => {
    expect(toOdooImageDataUri("iVBORw0KGgoAAAANSUhEUg")).toBe(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg",
    );
    expect(toOdooImageDataUri("/9j/4AAQSkZJRg")).toBe(
      "data:image/jpeg;base64,/9j/4AAQSkZJRg",
    );
  });
});

describe("resolveOdooOptionImageSrc", () => {
  it("usa la imagen de Odoo solo cuando el atributo o valor es tipo imagen", () => {
    expect(
      resolveOdooOptionImageSrc({
        attributeDisplayType: "image",
        ptavImage: "iVBORw0KGgoAAAANSUhEUg",
      }),
    ).toBe("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg");

    expect(
      resolveOdooOptionImageSrc({
        attributeDisplayType: "radio",
        ptavImage: "iVBORw0KGgoAAAANSUhEUg",
      }),
    ).toBeUndefined();
  });

  it("prefiere la imagen del PTAV y cae a la imagen del valor si hace falta", () => {
    expect(
      resolveOdooOptionImageSrc({
        ptavDisplayType: "image",
        ptavImage: "/9j/ptav",
        valueImage: "iVBORw0KGvalue",
      }),
    ).toBe("data:image/jpeg;base64,/9j/ptav");

    expect(
      resolveOdooOptionImageSrc({
        valueDisplayType: "image",
        ptavImage: false,
        valueImage: "iVBORw0KGvalue",
      }),
    ).toBe("data:image/png;base64,iVBORw0KGvalue");
  });
});

describe("getConfiguratorSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("restaura selecciones de Uniforme desde la metadata del ultimo diseno", async () => {
    mocks.odooRead.mockImplementation(async (_env, model: string) => {
      if (model === "sale.order.line") {
        return [
          {
            id: 170,
            order_id: [68, "S00068"],
            product_id: [700, "Uniforme"],
            product_template_attribute_value_ids: [],
            product_no_variant_attribute_value_ids: [],
            product_custom_attribute_value_ids: [],
            x_product_design_image: "png-base64",
          },
        ];
      }

      if (model === "sale.order") {
        return [{ id: 68, name: "S00068", state: "draft" }];
      }

      if (model === "product.product") {
        return [
          {
            id: 700,
            display_name: "Uniforme",
            product_tmpl_id: [7, "Uniforme"],
            product_template_attribute_value_ids: [],
          },
        ];
      }

      if (model === "product.attribute") {
        return [
          { id: 90, name: "Color", display_type: "color", create_variant: "always" },
          {
            id: 91,
            name: "Color de vivo",
            display_type: "color",
            create_variant: "no_variant",
          },
          {
            id: 92,
            name: "Seccion de vivo",
            display_type: "multi",
            create_variant: "no_variant",
          },
          {
            id: 93,
            name: "Texto en pecho derecho",
            display_type: "radio",
            create_variant: "no_variant",
          },
        ];
      }

      if (model === "product.attribute.value") {
        return [
          { id: 19001, name: "Verde", html_color: "#96a36f" },
          { id: 19101, name: "Rosa", html_color: "#f4c7cc" },
          { id: 19201, name: "Cogotera" },
          { id: 19301, name: "Si", is_custom: true },
        ];
      }

      return [];
    });
    mocks.odooSearchRead.mockImplementation(async (_env, model: string) => {
      if (model === "product.template.attribute.value") {
        return [
          {
            id: 9001,
            name: "Verde",
            attribute_id: [90, "Color"],
            product_attribute_value_id: [19001, "Verde"],
            product_tmpl_id: [7, "Uniforme"],
            ptav_active: true,
          },
          {
            id: 9101,
            name: "Rosa",
            sequence: 30,
            attribute_id: [91, "Color de vivo"],
            product_attribute_value_id: [19101, "Rosa"],
            product_tmpl_id: [7, "Uniforme"],
            ptav_active: true,
          },
          {
            id: 9102,
            name: "Amarillo",
            sequence: 20,
            attribute_id: [91, "Color de vivo"],
            product_attribute_value_id: [19102, "Amarillo"],
            product_tmpl_id: [7, "Uniforme"],
            ptav_active: true,
          },
          {
            id: 9103,
            name: "Azul",
            sequence: 10,
            attribute_id: [91, "Color de vivo"],
            product_attribute_value_id: [19103, "Azul"],
            product_tmpl_id: [7, "Uniforme"],
            ptav_active: true,
          },
          {
            id: 9201,
            name: "Cogotera",
            attribute_id: [92, "Seccion de vivo"],
            product_attribute_value_id: [19201, "Cogotera"],
            product_tmpl_id: [7, "Uniforme"],
            ptav_active: true,
          },
          {
            id: 9301,
            name: "Si",
            attribute_id: [93, "Texto en pecho derecho"],
            product_attribute_value_id: [19301, "Si"],
            product_tmpl_id: [7, "Uniforme"],
            ptav_active: true,
            is_custom: true,
          },
        ];
      }

      if (model === "product.template.attribute.line") {
        return [
          { id: 1, attribute_id: [90, "Color"], sequence: 1 },
          { id: 2, attribute_id: [91, "Color de vivo"], sequence: 2 },
          { id: 3, attribute_id: [92, "Seccion de vivo"], sequence: 3 },
          { id: 4, attribute_id: [93, "Texto en pecho derecho"], sequence: 4 },
        ];
      }

      if (model === "ir.attachment") {
        return [
          {
            id: 55,
            name: "design-v4-sale-line-170-design-pantalon.png",
            create_date: "2026-07-07 10:00:01",
          },
          {
            id: 54,
            name: "design-v4-sale-line-170-design.png",
            create_date: "2026-07-07 10:00:00",
            description: buildConfiguratorStateDescription({
              selectedValueIds: {
                "90": [9001],
                "91": [9101],
                "92": [9201],
                "93": [9301],
              },
              customValuesByValueId: {
                "9301": "LA ROCA",
              },
            }),
          },
        ];
      }

      return [];
    });

    const session = await getConfiguratorSession({} as never, 170);

    expect(session.productTemplateId).toBe(7);
    expect(session.selectedValueIds).toMatchObject({
      "90": [9001],
      "91": [9101],
      "92": [9201],
      "93": [9301],
    });
    expect(session.customValuesByValueId).toEqual({
      "9301": "LA ROCA",
    });
    expect(
      session.attributes
        .find((attribute) => attribute.id === 91)
        ?.values.map((value) => value.id),
    ).toEqual([9103, 9102, 9101]);
    expect(
      session.attributes
        .find((attribute) => attribute.id === 91)
        ?.values.map((value) => value.sourceValueId),
    ).toEqual([19103, 19102, 19101]);
    expect(session.status.version).toBe(4);
  });
});
