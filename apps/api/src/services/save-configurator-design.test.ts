import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import type { OdooEnv } from "../lib/app-env.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveConfiguratorDesign } from "./save-configurator-design.js";

const mocks = vi.hoisted(() => ({
  getConfiguratorSession: vi.fn(),
  odooSearchRead: vi.fn(),
  odooWrite: vi.fn(),
  storeDesignImage: vi.fn(),
}));

vi.mock("./get-configurator-session.js", () => ({
  getConfiguratorSession: mocks.getConfiguratorSession,
}));

vi.mock("../lib/odoo-client.js", () => ({
  odooSearchRead: mocks.odooSearchRead,
  odooWrite: mocks.odooWrite,
}));

vi.mock("./store-design-image.js", () => ({
  storeDesignImage: mocks.storeDesignImage,
}));

const editableSession: ConfiguratorSession = {
  saleOrderLineId: 290,
  saleOrderId: 119,
  orderName: "S00119",
  productId: 12345,
  productTemplateId: 678,
  productName: "Blusa",
  graphicManifestKey: "blusa-antifluido-t180",
  attributes: [
    {
      id: 90,
      name: "Color",
      displayType: "color",
      selectionMode: "single",
      variantMode: "variant",
      values: [
        {
          id: 9001,
          name: "150341 - Verde Olivo Claro",
          attributeId: 90,
          attributeName: "Color",
          colorHex: "#96a36f",
        },
      ],
    },
    {
      id: 91,
      name: "Color de vivo",
      displayType: "color",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 9101,
          name: "131906 - Rosa Pastel",
          attributeId: 91,
          attributeName: "Color de vivo",
          colorHex: "#f4c7cc",
        },
      ],
    },
  ],
  selectedValueIds: {
    "90": [9001],
    "91": [9101],
  },
  exclusions: [],
  status: {
    orderState: "draft",
    canEdit: true,
    isLocked: false,
    version: 1,
    generatedAt: null,
  },
  existingDesignBase64: null,
  warnings: [],
};

const env = {} as OdooEnv;

describe("saveConfiguratorDesign", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getConfiguratorSession.mockResolvedValue(editableSession);
    mocks.storeDesignImage.mockResolvedValue({
      version: 2,
      generatedAt: "2026-05-04T21:00:00.000Z",
    });
  });

  it("mantiene el producto actual y guarda PTAVs cuando Odoo no tiene una variante fisica exacta", async () => {
    mocks.odooSearchRead.mockResolvedValue([]);
    mocks.odooWrite.mockResolvedValue(true);

    const result = await saveConfiguratorDesign(env, {
      saleOrderLineId: 290,
      filename: "sale-line-290-design.png",
      imageBase64: "png-base64",
      selectedValueIds: editableSession.selectedValueIds,
    });

    expect(mocks.odooWrite).toHaveBeenCalledWith(
      env,
      "sale.order.line",
      [290],
      {
        product_id: 12345,
        product_template_attribute_value_ids: [[6, 0, [9001]]],
        product_no_variant_attribute_value_ids: [[6, 0, [9101]]],
        product_custom_attribute_value_ids: [[5, 0, 0]],
      },
    );
    expect(result).toMatchObject({
      productId: 12345,
      variantResolution: "line_attribute_values",
      version: 2,
    });
  });

  it("reemplaza product_id cuando existe una variante exacta", async () => {
    mocks.odooSearchRead.mockResolvedValue([
      {
        id: 777,
        display_name: "Blusa / Verde Olivo Claro",
        product_template_attribute_value_ids: [9001],
      },
    ]);
    mocks.odooWrite.mockResolvedValue(true);

    const result = await saveConfiguratorDesign(env, {
      saleOrderLineId: 290,
      filename: "sale-line-290-design.png",
      imageBase64: "png-base64",
      selectedValueIds: editableSession.selectedValueIds,
    });

    expect(mocks.odooWrite).toHaveBeenCalledWith(
      env,
      "sale.order.line",
      [290],
      expect.objectContaining({
        product_id: 777,
        product_template_attribute_value_ids: [[6, 0, [9001]]],
      }),
    );
    expect(result).toMatchObject({
      productId: 777,
      variantResolution: "product_variant",
    });
  });

  it("guarda los valores personalizados seleccionados sin depender del nombre del atributo", async () => {
    const sessionWithCustomValue: ConfiguratorSession = {
      ...editableSession,
      attributes: [
        ...editableSession.attributes,
        {
          id: 92,
          name: "¿Texto en manga derecha?",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9200,
              name: "No",
              attributeId: 92,
              attributeName: "¿Texto en manga derecha?",
            },
            {
              id: 9201,
              name: "Si",
              attributeId: 92,
              attributeName: "¿Texto en manga derecha?",
              allowsCustomValue: true,
            },
          ],
        },
      ],
      selectedValueIds: {
        ...editableSession.selectedValueIds,
        "92": [9201],
      },
      customValuesByValueId: {
        "9201": "LA ROCA",
      },
    };
    mocks.getConfiguratorSession.mockResolvedValue(sessionWithCustomValue);
    mocks.odooSearchRead.mockResolvedValue([]);
    mocks.odooWrite.mockResolvedValue(true);

    await saveConfiguratorDesign(env, {
      saleOrderLineId: 290,
      filename: "sale-line-290-design.png",
      imageBase64: "png-base64",
      selectedValueIds: sessionWithCustomValue.selectedValueIds,
      customValuesByValueId: {
        "9201": "LA ROCA",
      },
    });

    expect(mocks.odooWrite).toHaveBeenCalledWith(
      env,
      "sale.order.line",
      [290],
      expect.objectContaining({
        product_no_variant_attribute_value_ids: [[6, 0, [9101, 9201]]],
        product_custom_attribute_value_ids: [
          [5, 0, 0],
          [
            0,
            0,
            {
              custom_product_template_attribute_value_id: 9201,
              custom_value: "LA ROCA",
            },
          ],
        ],
      }),
    );
  });
});
