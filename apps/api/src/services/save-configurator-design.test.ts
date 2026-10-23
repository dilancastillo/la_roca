import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import type { OdooEnv } from "../lib/app-env.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseConfiguratorStateDescription } from "./configurator-state-metadata.js";
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
        x_studio_imagen_adjunta: false,
        x_studio_detalles_adicionales: false,
        x_studio_logo_2: false,
        x_studio_detalles_logo_2: false,
        x_studio_logo_3: false,
        x_studio_detalles_logo_3: false,
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
    const attachmentCreateCall = mocks.odooCreate.mock.calls.find(
      ([, model]) => model === "ir.attachment",
    );
    const attachmentValues = attachmentCreateCall?.[2]?.[0] as
      | { description?: string }
      | undefined;

    expect(parseConfiguratorStateDescription(attachmentValues?.description)).toEqual({
      selectedValueIds: editableSession.selectedValueIds,
      customValuesByValueId: {},
    });
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

  it("guarda una imagen adjunta por cada ubicación de logo", async () => {
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
      logoAttachments: [{
        placementValueId: 572,
        placementLabel: "Bolsillo de pecho izquierdo",
        filename: "logo cliente.png",
        mimeType: "image/png",
        dataBase64: "data:image/png;base64,logo-base64",
      }],
    });

    expect(mocks.odooWrite).toHaveBeenCalledWith(
      env,
      "sale.order.line",
      [290],
      expect.objectContaining({
        x_product_design_image: "png-base64",
        x_studio_imagen_adjunta: "logo-base64",
        x_studio_detalles_adicionales: "Bolsillo de pecho izquierdo",
      }),
    );
    expect(mocks.odooCreate).toHaveBeenCalledTimes(2);
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
    expect(mocks.odooCreate).toHaveBeenCalledWith(
      env,
      "ir.attachment",
      [
        expect.objectContaining({
          name: "logo-572-logo cliente.png",
          datas: "logo-base64",
          description: "Logo: Bolsillo de pecho izquierdo",
        }),
      ],
    );
    expect(result.logoImageUpdated).toBe(true);
  });

  it("distribuye hasta tres logos en los campos de la línea de Odoo", async () => {
    mocks.odooSearchRead.mockResolvedValue([
      {
        id: 777,
        display_name: "Blusa / Verde Olivo Claro",
        product_template_attribute_value_ids: [9001],
      },
    ]);
    mocks.odooWrite.mockResolvedValue(true);

    await saveConfiguratorDesign(env, {
      saleOrderLineId: 290,
      filename: "sale-line-290-design.png",
      imageBase64: "png-base64",
      selectedValueIds: editableSession.selectedValueIds,
      logoAttachments: [
        {
          placementValueId: 572,
          placementLabel: "Bolsillo de pecho izquierdo",
          filename: "logo-1.png",
          mimeType: "image/png",
          dataBase64: "data:image/png;base64,logo-1-base64",
        },
        {
          placementValueId: 2122,
          placementLabel: "Manga derecha",
          filename: "logo-2.png",
          mimeType: "image/png",
          dataBase64: "data:image/png;base64,logo-2-base64",
        },
        {
          placementValueId: 2123,
          placementLabel: "Manga izquierda",
          filename: "logo-3.png",
          mimeType: "image/png",
          dataBase64: "data:image/png;base64,logo-3-base64",
        },
      ],
    });

    expect(mocks.odooWrite).toHaveBeenCalledWith(
      env,
      "sale.order.line",
      [290],
      expect.objectContaining({
        x_studio_imagen_adjunta: "logo-1-base64",
        x_studio_detalles_adicionales: "Bolsillo de pecho izquierdo",
        x_studio_logo_2: "logo-2-base64",
        x_studio_detalles_logo_2: "Manga derecha",
        x_studio_logo_3: "logo-3-base64",
        x_studio_detalles_logo_3: "Manga izquierda",
      }),
    );
  });

  it("limpia los campos de logo heredados que ya no se seleccionan en la copia", async () => {
    mocks.odooSearchRead.mockResolvedValue([
      {
        id: 777,
        display_name: "Blusa / Verde Olivo Claro",
        product_template_attribute_value_ids: [9001],
      },
    ]);
    mocks.odooWrite.mockResolvedValue(true);

    await saveConfiguratorDesign(env, {
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
        x_studio_imagen_adjunta: false,
        x_studio_detalles_adicionales: false,
        x_studio_logo_2: false,
        x_studio_detalles_logo_2: false,
        x_studio_logo_3: false,
        x_studio_detalles_logo_3: false,
      }),
    );
  });

  it("guarda metadata de seleccion tambien en imagenes adicionales de Uniforme", async () => {
    const uniformSession: ConfiguratorSession = {
      ...editableSession,
      productTemplateId: 7,
      productName: "Uniforme",
      graphicManifestKey: "uniforme",
    };
    mocks.getConfiguratorSession.mockResolvedValue(uniformSession);
    mocks.odooSearchRead.mockResolvedValue([
      {
        id: uniformSession.productId,
        display_name: "Uniforme / Verde Olivo Claro",
        product_template_attribute_value_ids: [9001],
      },
    ]);
    mocks.odooWrite.mockResolvedValue(true);

    await saveConfiguratorDesign(env, {
      saleOrderLineId: 290,
      filename: "sale-line-290-design.png",
      imageBase64: "png-base64",
      additionalImages: [
        {
          filename: "sale-line-290-design-blusa.png",
          imageBase64: "blusa-base64",
        },
        {
          filename: "sale-line-290-design-pantalon.png",
          imageBase64: "pantalon-base64",
        },
      ],
      selectedValueIds: uniformSession.selectedValueIds,
    });

    const attachmentValues = mocks.odooCreate.mock.calls
      .filter(([, model]) => model === "ir.attachment")
      .map(([, , values]) => values[0] as { description?: string });

    expect(attachmentValues).toHaveLength(3);
    expect(
      attachmentValues.map((values) =>
        parseConfiguratorStateDescription(values.description),
      ),
    ).toEqual([
      {
        selectedValueIds: uniformSession.selectedValueIds,
        customValuesByValueId: {},
      },
      {
        selectedValueIds: uniformSession.selectedValueIds,
        customValuesByValueId: {},
      },
      {
        selectedValueIds: uniformSession.selectedValueIds,
        customValuesByValueId: {},
      },
    ]);
  });

  it("resuelve la variante exacta de Uniforme para que Odoo pueda reabrir valores personalizados", async () => {
    const uniformSession: ConfiguratorSession = {
      ...editableSession,
      productId: 2333,
      productTemplateId: 7,
      productName: "Uniforme",
      graphicManifestKey: "uniforme",
      attributes: [
        ...editableSession.attributes,
        {
          id: 143,
          name: "Talla de blusa",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "variant",
          values: [
            {
              id: 984,
              name: "S",
              attributeId: 143,
              attributeName: "Talla de blusa",
              allowsCustomValue: true,
            },
          ],
        },
        {
          id: 163,
          name: "Talla pantalon",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "variant",
          values: [
            {
              id: 1236,
              name: "30",
              attributeId: 163,
              attributeName: "Talla pantalon",
              allowsCustomValue: true,
            },
          ],
        },
      ],
      selectedValueIds: {
        ...editableSession.selectedValueIds,
        "143": [984],
        "163": [1236],
      },
      customValuesByValueId: {
        "984": "S especial",
        "1236": "30 especial",
      },
    };
    mocks.getConfiguratorSession.mockResolvedValue(uniformSession);
    mocks.odooSearchRead.mockResolvedValue([]);
    mocks.odooWrite.mockResolvedValue(true);

    const result = await saveConfiguratorDesign(env, {
      saleOrderLineId: 290,
      filename: "sale-line-290-design.png",
      imageBase64: "png-base64",
      selectedValueIds: uniformSession.selectedValueIds,
      customValuesByValueId: uniformSession.customValuesByValueId,
    });

    expect(mocks.odooSearchRead).toHaveBeenCalledWith(
      env,
      "product.product",
      [["product_tmpl_id", "=", 7]],
      ["id", "display_name", "product_template_attribute_value_ids"],
      undefined,
      { limit: 5_000 },
    );
    expect(mocks.odooCreate).toHaveBeenNthCalledWith(
      1,
      env,
      "product.product",
      [
        {
          product_tmpl_id: 7,
          product_template_attribute_value_ids: [[6, 0, [9001, 984, 1236]]],
          product_template_variant_value_ids: [[6, 0, [9001, 984, 1236]]],
        },
      ],
    );
    expect(mocks.odooWrite).toHaveBeenCalledWith(
      env,
      "sale.order.line",
      [290],
      expect.objectContaining({
        product_id: 778,
        product_template_attribute_value_ids: [[6, 0, [9001, 984, 1236]]],
        product_no_variant_attribute_value_ids: [[6, 0, [9101]]],
        product_custom_attribute_value_ids: [
          [5, 0, 0],
          [
            0,
            0,
            {
              custom_product_template_attribute_value_id: 984,
              custom_value: "S especial",
            },
          ],
          [
            0,
            0,
            {
              custom_product_template_attribute_value_id: 1236,
              custom_value: "30 especial",
            },
          ],
        ],
      }),
    );
    expect(result).toMatchObject({
      productId: 778,
      variantResolution: "created_product_variant",
    });
  });

  it("permite guardar ubicaciones de logo seleccionadas sin obligar una imagen en cada una", async () => {
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
    mocks.odooSearchRead.mockResolvedValue([]);
    mocks.odooWrite.mockResolvedValue(true);

    await expect(
      saveConfiguratorDesign(env, {
        saleOrderLineId: 290,
        filename: "sale-line-290-design.png",
        imageBase64: "png-base64",
        selectedValueIds: sessionWithLogo.selectedValueIds,
      }),
    ).resolves.toMatchObject({ productId: 778 });

    expect(mocks.odooWrite).toHaveBeenCalledWith(
      env,
      "sale.order.line",
      [290],
      expect.objectContaining({
        product_no_variant_attribute_value_ids: [[6, 0, [9101, 9301]]],
      }),
    );
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

  it("rechaza guardar si falta una seleccion unica aunque no cree variante", async () => {
    await expect(
      saveConfiguratorDesign(env, {
        saleOrderLineId: 290,
        filename: "sale-line-290-design.png",
        imageBase64: "png-base64",
        selectedValueIds: {
          "90": [9001],
        },
      }),
    ).rejects.toThrow(/falta seleccionar "color de vivo"/i);

    expect(mocks.odooWrite).not.toHaveBeenCalled();
    expect(mocks.odooCreate).not.toHaveBeenCalled();
  });

  it("permite Logo y Seccion de vivos sin seleccion", async () => {
    const sessionWithOptionalMultipleSelections: ConfiguratorSession = {
      ...editableSession,
      attributes: [
        ...editableSession.attributes,
        {
          id: 92,
          name: "Logo",
          displayType: "multi",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9201,
              name: "Pecho derecho",
              attributeId: 92,
              attributeName: "Logo",
            },
          ],
        },
        {
          id: 93,
          name: "Seccion de vivos",
          displayType: "multi",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 9301,
              name: "Cuello",
              attributeId: 93,
              attributeName: "Seccion de vivos",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...editableSession.selectedValueIds,
        "92": [],
        "93": [],
      },
    };
    mocks.getConfiguratorSession.mockResolvedValue(
      sessionWithOptionalMultipleSelections,
    );
    mocks.odooSearchRead.mockResolvedValue([]);
    mocks.odooWrite.mockResolvedValue(true);

    await expect(
      saveConfiguratorDesign(env, {
        saleOrderLineId: 290,
        filename: "sale-line-290-design.png",
        imageBase64: "png-base64",
        selectedValueIds: sessionWithOptionalMultipleSelections.selectedValueIds,
      }),
    ).resolves.toEqual(expect.objectContaining({ productId: 778 }));
  });

  it("permite guardar sin opciones de cremallera cuando los bolsillos no la llevan", async () => {
    const zipperToggleId = 94;
    const zipperOptionsId = 95;
    const sessionWithoutLowerPocketZipper: ConfiguratorSession = {
      ...editableSession,
      attributes: [
        ...editableSession.attributes,
        {
          id: zipperToggleId,
          name: "¿Bolsillos inferiores con cremallera?",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9401,
              name: "No",
              attributeId: zipperToggleId,
              attributeName: "¿Bolsillos inferiores con cremallera?",
            },
            {
              id: 9402,
              name: "Sí",
              attributeId: zipperToggleId,
              attributeName: "¿Bolsillos inferiores con cremallera?",
            },
          ],
        },
        {
          id: zipperOptionsId,
          name: "Opciones de cremallera",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9501,
              name: "Cremallera visible",
              attributeId: zipperOptionsId,
              attributeName: "Opciones de cremallera",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...editableSession.selectedValueIds,
        [String(zipperToggleId)]: [9401],
        [String(zipperOptionsId)]: [],
      },
    };
    mocks.getConfiguratorSession.mockResolvedValue(sessionWithoutLowerPocketZipper);
    mocks.odooSearchRead.mockResolvedValue([]);
    mocks.odooWrite.mockResolvedValue(true);

    await expect(
      saveConfiguratorDesign(env, {
        saleOrderLineId: 290,
        filename: "sale-line-290-design.png",
        imageBase64: "png-base64",
        selectedValueIds: sessionWithoutLowerPocketZipper.selectedValueIds,
      }),
    ).resolves.toEqual(expect.objectContaining({ productId: 778 }));
  });

  it("exige opciones de cremallera cuando los bolsillos inferiores la llevan", async () => {
    const zipperToggleId = 94;
    const zipperOptionsId = 95;
    const sessionWithLowerPocketZipper: ConfiguratorSession = {
      ...editableSession,
      attributes: [
        ...editableSession.attributes,
        {
          id: zipperToggleId,
          name: "¿Bolsillos inferiores con cremallera?",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9401,
              name: "No",
              attributeId: zipperToggleId,
              attributeName: "¿Bolsillos inferiores con cremallera?",
            },
            {
              id: 9402,
              name: "Sí",
              attributeId: zipperToggleId,
              attributeName: "¿Bolsillos inferiores con cremallera?",
            },
          ],
        },
        {
          id: zipperOptionsId,
          name: "Opciones de cremallera",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 9501,
              name: "Cremallera visible",
              attributeId: zipperOptionsId,
              attributeName: "Opciones de cremallera",
            },
          ],
        },
      ],
      selectedValueIds: {
        ...editableSession.selectedValueIds,
        [String(zipperToggleId)]: [9402],
        [String(zipperOptionsId)]: [],
      },
    };
    mocks.getConfiguratorSession.mockResolvedValue(sessionWithLowerPocketZipper);

    await expect(
      saveConfiguratorDesign(env, {
        saleOrderLineId: 290,
        filename: "sale-line-290-design.png",
        imageBase64: "png-base64",
        selectedValueIds: sessionWithLowerPocketZipper.selectedValueIds,
      }),
    ).rejects.toThrow(/falta seleccionar "opciones de cremallera"/i);
  });

  it("no exige Largo ni Ancho bota cuando Tipo bota es Original", async () => {
    const bootTypeAttributeId = 84;
    const bootLengthAttributeId = 85;
    const bootWidthAttributeId = 86;
    const sessionWithOriginalBoot: ConfiguratorSession = {
      ...editableSession,
      attributes: [
        ...editableSession.attributes,
        {
          id: bootTypeAttributeId,
          name: "Tipo bota",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 8401,
              name: "Original",
              attributeId: bootTypeAttributeId,
              attributeName: "Tipo bota",
            },
          ],
        },
        {
          id: bootLengthAttributeId,
          name: "Largo bota",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 8501,
              name: "Largo bota",
              attributeId: bootLengthAttributeId,
              attributeName: "Largo bota",
              allowsCustomValue: true,
            },
          ],
        },
        {
          id: bootWidthAttributeId,
          name: "Ancho bota",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: 8601,
              name: "Ancho bota",
              attributeId: bootWidthAttributeId,
              attributeName: "Ancho bota",
              allowsCustomValue: true,
            },
          ],
        },
      ],
      selectedValueIds: {
        ...editableSession.selectedValueIds,
        [String(bootTypeAttributeId)]: [8401],
        [String(bootLengthAttributeId)]: [],
        [String(bootWidthAttributeId)]: [],
      },
    };
    mocks.getConfiguratorSession.mockResolvedValue(sessionWithOriginalBoot);
    mocks.odooSearchRead.mockResolvedValue([]);
    mocks.odooWrite.mockResolvedValue(true);

    await expect(
      saveConfiguratorDesign(env, {
        saleOrderLineId: 290,
        filename: "sale-line-290-design.png",
        imageBase64: "png-base64",
        selectedValueIds: sessionWithOriginalBoot.selectedValueIds,
      }),
    ).resolves.toEqual(expect.objectContaining({ productId: 778 }));
  });

  it("rechaza texto y valores fuera de rango en Largo", async () => {
    const lengthAttributeId = 851;
    const lengthValueId = 8511;
    const sessionWithLength: ConfiguratorSession = {
      ...editableSession,
      attributes: [
        ...editableSession.attributes,
        {
          id: lengthAttributeId,
          name: "Largo bota",
          displayType: "radio",
          selectionMode: "single",
          variantMode: "no_variant",
          values: [
            {
              id: lengthValueId,
              name: "Largo bota",
              attributeId: lengthAttributeId,
              attributeName: "Largo bota",
              allowsCustomValue: true,
            },
          ],
        },
      ],
      selectedValueIds: {
        ...editableSession.selectedValueIds,
        [String(lengthAttributeId)]: [lengthValueId],
      },
    };
    mocks.getConfiguratorSession.mockResolvedValue(sessionWithLength);

    await expect(
      saveConfiguratorDesign(env, {
        saleOrderLineId: 290,
        filename: "sale-line-290-design.png",
        imageBase64: "png-base64",
        selectedValueIds: sessionWithLength.selectedValueIds,
        customValuesByValueId: { [String(lengthValueId)]: "4 de cadera" },
      }),
    ).rejects.toThrow(/largo solo admite números/i);

    await expect(
      saveConfiguratorDesign(env, {
        saleOrderLineId: 290,
        filename: "sale-line-290-design.png",
        imageBase64: "png-base64",
        selectedValueIds: sessionWithLength.selectedValueIds,
        customValuesByValueId: { [String(lengthValueId)]: "1000" },
      }),
    ).rejects.toThrow(/entre 1 y 999/i);

    expect(mocks.odooWrite).not.toHaveBeenCalled();
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
