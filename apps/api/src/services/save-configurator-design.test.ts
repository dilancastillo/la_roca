import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import type { OdooEnv } from "../lib/app-env.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saveConfiguratorDesign } from "./save-configurator-design.js";

const mocks = vi.hoisted(() => ({
  getConfiguratorSession: vi.fn(),
  odooCreate: vi.fn(),
  odooSearchRead: vi.fn(),
  odooWrite: vi.fn(),
}));

vi.mock("./get-configurator-session.js", () => ({
  getConfiguratorSession: mocks.getConfiguratorSession,
}));

vi.mock("../lib/odoo-client.js", () => ({
  odooCreate: mocks.odooCreate,
  odooSearchRead: mocks.odooSearchRead,
  odooWrite: mocks.odooWrite,
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
    mocks.odooCreate.mockResolvedValue(778);
  });

  it("crea y usa una variante cuando Odoo no tiene una variante fisica exacta", async () => {
    mocks.odooSearchRead.mockResolvedValue([]);
    mocks.odooWrite.mockResolvedValue(true);

    const result = await saveConfiguratorDesign(env, {
      saleOrderLineId: 290,
      filename: "sale-line-290-design.png",
      imageBase64: "png-base64",
      selectedValueIds: editableSession.selectedValueIds,
    });

    expect(mocks.getConfiguratorSession).toHaveBeenCalledWith(env, 290, {
      loadCustomValues: false,
    });
    expect(mocks.odooWrite).toHaveBeenCalledWith(
      env,
      "sale.order.line",
      [290],
      {
        product_id: 778,
        product_template_attribute_value_ids: [[6, 0, [9001]]],
        product_no_variant_attribute_value_ids: [[6, 0, [9101]]],
        product_custom_attribute_value_ids: [[5, 0, 0]],
        x_product_design_image: "png-base64",
        x_product_design_generated_at: expect.any(String),
        x_product_design_version: 2,
      },
    );
    expect(mocks.odooCreate).toHaveBeenNthCalledWith(
      1,
      env,
      "product.product",
      [
        {
          product_tmpl_id: 678,
          product_template_attribute_value_ids: [[6, 0, [9001]]],
          product_template_variant_value_ids: [[6, 0, [9001]]],
        },
      ],
    );
    expect(mocks.odooCreate).toHaveBeenNthCalledWith(
      2,
      env,
      "ir.attachment",
      [
        expect.objectContaining({
          name: "design-v2-sale-line-290-design.png",
          datas: "png-base64",
          res_model: "sale.order.line",
          res_id: 290,
          mimetype: "image/png",
        }),
      ],
    );
    expect(result).toMatchObject({
      productId: 778,
      variantResolution: "created_product_variant",
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
    expect(mocks.odooCreate).not.toHaveBeenCalledWith(
      env,
      "product.product",
      expect.any(Array),
    );
    expect(mocks.odooCreate).toHaveBeenCalledWith(
      env,
      "ir.attachment",
      expect.any(Array),
    );
  });

  it("guarda la imagen del logo en el campo Studio de la linea cuando llega desde la app", async () => {
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
      logoAttachment: {
        filename: "logo cliente.png",
        mimeType: "image/png",
        dataBase64: "data:image/png;base64,logo-base64",
      },
    });

    expect(mocks.odooWrite).toHaveBeenCalledWith(
      env,
      "sale.order.line",
      [290],
      expect.objectContaining({
        x_studio_imagen_adjunta: "logo-base64",
      }),
    );
    expect(mocks.odooCreate).toHaveBeenCalledTimes(1);
    expect(mocks.odooCreate).toHaveBeenCalledWith(
      env,
      "ir.attachment",
      [
        expect.objectContaining({
          name: "design-v2-sale-line-290-design.png",
          datas: "png-base64",
          res_model: "sale.order.line",
          res_id: 290,
          mimetype: "image/png",
        }),
      ],
    );
    expect(result.logoImageUpdated).toBe(true);
  });

  it("rechaza guardar cuando hay logo seleccionado pero no llega imagen del logo", async () => {
    const sessionWithLogo: ConfiguratorSession = {
      ...editableSession,
      attributes: [
        ...editableSession.attributes,
        {
          id: 93,
          name: "Logo",
          displayType: "multi",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9301,
              name: "Pecho derecho",
              attributeId: 93,
              attributeName: "Logo",
            },
            {
              id: 9302,
              name: "Sin logo",
              attributeId: 93,
              attributeName: "Logo",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...editableSession.selectedValueIds,
        "93": [9301],
      },
    };
    mocks.getConfiguratorSession.mockResolvedValue(sessionWithLogo);

    await expect(
      saveConfiguratorDesign(env, {
        saleOrderLineId: 290,
        filename: "sale-line-290-design.png",
        imageBase64: "png-base64",
        selectedValueIds: sessionWithLogo.selectedValueIds,
      }),
    ).rejects.toThrow(/carga la imagen del logo/i);

    expect(mocks.odooSearchRead).not.toHaveBeenCalled();
    expect(mocks.odooWrite).not.toHaveBeenCalled();
    expect(mocks.odooCreate).not.toHaveBeenCalled();
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

  it("rechaza una seleccion vacia para no limpiar atributos en Odoo", async () => {
    await expect(
      saveConfiguratorDesign(env, {
        saleOrderLineId: 290,
        filename: "sale-line-290-design.png",
        imageBase64: "png-base64",
        selectedValueIds: {},
      }),
    ).rejects.toThrow(/seleccion llego vacia/i);

    expect(mocks.odooWrite).not.toHaveBeenCalled();
    expect(mocks.odooCreate).not.toHaveBeenCalled();
  });

  it("rechaza guardar si falta un atributo de variante requerido", async () => {
    await expect(
      saveConfiguratorDesign(env, {
        saleOrderLineId: 290,
        filename: "sale-line-290-design.png",
        imageBase64: "png-base64",
        selectedValueIds: {
          "91": [9101],
        },
      }),
    ).rejects.toThrow(/falta seleccionar "color"/i);

    expect(mocks.odooWrite).not.toHaveBeenCalled();
    expect(mocks.odooCreate).not.toHaveBeenCalled();
  });

  it("rechaza guardar si Odoo no puede crear una variante faltante", async () => {
    mocks.odooSearchRead.mockResolvedValue([]);
    mocks.odooCreate.mockRejectedValue(
      new Error("Odoo product.product.create respondio 400: combinacion invalida"),
    );

    await expect(
      saveConfiguratorDesign(env, {
        saleOrderLineId: 290,
        filename: "sale-line-290-design.png",
        imageBase64: "png-base64",
        selectedValueIds: editableSession.selectedValueIds,
      }),
    ).rejects.toThrow(/no se pudo crear la variante exacta/i);

    expect(mocks.odooWrite).not.toHaveBeenCalled();
  });
});
