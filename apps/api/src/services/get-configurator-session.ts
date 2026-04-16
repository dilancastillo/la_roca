import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import type { OdooEnv } from "../lib/app-env.js";
import { odooRead, odooSearchRead } from "../lib/odoo-client.js";

type Many2one = [number, string] | false;

type SaleOrderLineRecord = {
  id: number;
  order_id: Many2one;
  product_id: Many2one;
  product_template_attribute_value_ids?: number[];
  product_no_variant_attribute_value_ids?: number[];
  x_product_design_generated_at?: string | false;
  x_product_design_image?: string | false;
  x_product_design_locked?: boolean;
  x_product_design_version?: number;
};

type SaleOrderRecord = {
  id: number;
  name: string;
  state: string;
};

type ProductProductRecord = {
  id: number;
  display_name: string;
  product_tmpl_id: Many2one;
  product_template_attribute_value_ids?: number[];
};

type ProductTemplateAttributeValueRecord = {
  id: number;
  name: string;
  attribute_id: Many2one;
  product_attribute_value_id: Many2one;
  product_tmpl_id: Many2one;
  ptav_active?: boolean;
};

type ProductAttributeRecord = {
  id: number;
  name: string;
  display_type?: string | false;
  create_variant?: string | false;
};

type ProductAttributeValueRecord = {
  id: number;
  name: string;
  html_color?: string | false;
};

type ProductTemplateAttributeExclusionRecord = {
  id: number;
  product_template_attribute_value_id?: Many2one;
  value_ids?: number[];
};

function toMany2oneId(value: Many2one, fieldName: string): number {
  if (!Array.isArray(value) || typeof value[0] !== "number") {
    throw new Error(`El campo ${fieldName} no tiene un Many2one valido`);
  }
  return value[0];
}

function toMany2oneName(value: Many2one): string | undefined {
  if (!Array.isArray(value) || typeof value[1] !== "string") {
    return undefined;
  }
  return value[1];
}

function normalizeGraphicManifestKey(productName: string): string {
  return productName
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeManyIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is number => typeof item === "number");
}

function normalizeDisplayType(value: string | false | undefined) {
  const normalized = String(value ?? "").trim().toLowerCase();

  switch (normalized) {
    case "color":
      return "color";
    case "image":
      return "image";
    case "option":
    case "pill":
    case "pills":
      return "option";
    case "select":
      return "select";
    case "multi":
    case "multicolor":
    case "checkbox":
      return "multi";
    case "radio":
      return "radio";
    default:
      return "unknown";
  }
}

function normalizeVariantMode(value: string | false | undefined) {
  const normalized = String(value ?? "").trim().toLowerCase();

  switch (normalized) {
    case "always":
    case "dynamic":
      return "variant";
    case "no_variant":
    case "never":
      return "no_variant";
    default:
      return "unknown";
  }
}

export async function getConfiguratorSession(
  env: OdooEnv,
  saleOrderLineId: number,
): Promise<ConfiguratorSession> {
  const lines = await odooRead<SaleOrderLineRecord>(
    env,
    "sale.order.line",
    [saleOrderLineId],
    [
      "id",
      "order_id",
      "product_id",
      "product_template_attribute_value_ids",
      "product_no_variant_attribute_value_ids",
      "x_product_design_generated_at",
      "x_product_design_image",
      "x_product_design_locked",
      "x_product_design_version",
    ],
  );

  const line = lines[0];

  if (!line) {
    throw new Error(`No existe la linea de venta ${saleOrderLineId}`);
  }

  const orderId = toMany2oneId(line.order_id, "order_id");
  const productId = toMany2oneId(line.product_id, "product_id");

  const [orders, products] = await Promise.all([
    odooRead<SaleOrderRecord>(env, "sale.order", [orderId], ["id", "name", "state"]),
    odooRead<ProductProductRecord>(
      env,
      "product.product",
      [productId],
      ["id", "display_name", "product_tmpl_id", "product_template_attribute_value_ids"],
    ),
  ]);

  const order = orders[0];
  const product = products[0];

  if (!order) {
    throw new Error(`No existe la orden ${orderId}`);
  }

  if (!product) {
    throw new Error(`No existe el producto ${productId}`);
  }

  const productTemplateId = toMany2oneId(product.product_tmpl_id, "product_tmpl_id");
  const productName =
    toMany2oneName(product.product_tmpl_id) ??
    product.display_name ??
    `Producto ${productTemplateId}`;

  const ptavs = await odooSearchRead<ProductTemplateAttributeValueRecord>(
    env,
    "product.template.attribute.value",
    [
      ["product_tmpl_id", "=", productTemplateId],
      ["ptav_active", "=", true],
    ],
    [
      "id",
      "name",
      "attribute_id",
      "product_attribute_value_id",
      "product_tmpl_id",
      "ptav_active",
    ],
    "attribute_id, id",
  );

  if (ptavs.length === 0) {
    throw new Error(
      `El producto template ${productTemplateId} no tiene PTAVs activos`,
    );
  }

  const attributeIds = Array.from(
    new Set(
      ptavs
        .map((ptav) => toMany2oneId(ptav.attribute_id, "attribute_id"))
        .filter((value) => Number.isFinite(value)),
    ),
  );

  const productAttributeValueIds = Array.from(
    new Set(
      ptavs
        .map((ptav) =>
          Array.isArray(ptav.product_attribute_value_id)
            ? ptav.product_attribute_value_id[0]
            : null,
        )
        .filter((value): value is number => typeof value === "number"),
    ),
  );

  const [attributes, attributeValues, exclusionRecords] = await Promise.all([
    attributeIds.length > 0
      ? odooRead<ProductAttributeRecord>(
          env,
          "product.attribute",
          attributeIds,
          ["id", "name", "display_type", "create_variant"],
        )
      : Promise.resolve([]),
    productAttributeValueIds.length > 0
      ? odooRead<ProductAttributeValueRecord>(
          env,
          "product.attribute.value",
          productAttributeValueIds,
          ["id", "name", "html_color"],
        )
      : Promise.resolve([]),
    odooSearchRead<ProductTemplateAttributeExclusionRecord>(
      env,
      "product.template.attribute.exclusion",
      [["product_tmpl_id", "=", productTemplateId]],
      ["id", "product_template_attribute_value_id", "value_ids"],
    ).catch(() => []),
  ]);

  const attributeMap = new Map<number, ProductAttributeRecord>(
    attributes.map(
      (attribute): [number, ProductAttributeRecord] => [attribute.id, attribute],
    ),
  );
  const attributeValueMap = new Map(
    attributeValues.map(
      (attributeValue): [number, ProductAttributeValueRecord] => [
        attributeValue.id,
        attributeValue,
      ],
    ),
  );

  const currentValueIds = new Set<number>([
    ...normalizeManyIds(line.product_template_attribute_value_ids),
    ...normalizeManyIds(line.product_no_variant_attribute_value_ids),
    ...normalizeManyIds(product.product_template_attribute_value_ids),
  ]);

  const groupedAttributes = new Map<
    number,
    NonNullable<ConfiguratorSession["attributes"]>[number]
  >();

  for (const ptav of ptavs) {
    const attributeId = toMany2oneId(ptav.attribute_id, "attribute_id");
    const attribute = attributeMap.get(attributeId);
    const productAttributeValueId = toMany2oneId(
      ptav.product_attribute_value_id,
      "product_attribute_value_id",
    );
    const attributeValue = attributeValueMap.get(productAttributeValueId);

    const group =
      groupedAttributes.get(attributeId) ??
      {
        id: attributeId,
        name: attribute?.name ?? toMany2oneName(ptav.attribute_id) ?? `Atributo ${attributeId}`,
        displayType: normalizeDisplayType(attribute?.display_type),
        selectionMode:
          normalizeDisplayType(attribute?.display_type) === "multi"
            ? "multiple"
            : "single",
        variantMode: normalizeVariantMode(attribute?.create_variant),
        values: [],
      };

    group.values.push({
      id: ptav.id,
      name: ptav.name,
      attributeId,
      attributeName: group.name,
      ...(attributeValue?.html_color
        ? { colorHex: attributeValue.html_color }
        : {}),
    });

    groupedAttributes.set(attributeId, group);
  }

  const sortedAttributes = Array.from(groupedAttributes.values()).sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  const selectedValueIds: Record<string, number[]> = {};

  for (const attribute of sortedAttributes) {
    const selectedIds = attribute.values
      .map((value) => value.id)
      .filter((valueId) => currentValueIds.has(valueId));
    selectedValueIds[String(attribute.id)] = selectedIds;
  }

  const exclusions = exclusionRecords.flatMap((record) => {
    const sourceValueId = Array.isArray(record.product_template_attribute_value_id)
      ? record.product_template_attribute_value_id[0]
      : null;
    const excludedIds = normalizeManyIds(record.value_ids);

    if (typeof sourceValueId !== "number" || excludedIds.length === 0) {
      return [];
    }

    return excludedIds.map((excludedValueId) => ({
      sourceValueId,
      excludedValueId,
    }));
  });

  const canEdit = order.state === "draft" || order.state === "sent";

  return {
    saleOrderLineId,
    saleOrderId: order.id,
    orderName: order.name,
    productId: product.id,
    productTemplateId,
    productName,
    graphicManifestKey: normalizeGraphicManifestKey(productName),
    attributes: sortedAttributes,
    selectedValueIds,
    exclusions,
    status: {
      orderState: order.state,
      canEdit,
      isLocked: Boolean(line.x_product_design_locked),
      version: line.x_product_design_version ?? 0,
      generatedAt:
        typeof line.x_product_design_generated_at === "string"
          ? new Date(line.x_product_design_generated_at).toISOString()
          : null,
    },
    existingDesignBase64:
      typeof line.x_product_design_image === "string"
        ? line.x_product_design_image
        : null,
    warnings: exclusionRecords.length === 0 ? ["No se pudieron cargar exclusiones desde Odoo."] : [],
  };
}
