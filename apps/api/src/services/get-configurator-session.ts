import { odooRead, odooSearchRead } from "../lib/odoo-client";

type Env = {
  CONFIG_SOURCE?: string;
  ODOO_BASE_URL?: string;
  ODOO_DB?: string;
  ODOO_API_KEY?: string;
};

type Many2one = [number, string] | false;

type SaleOrderLineRecord = {
  id: number;
  name: string;
  product_id: Many2one;
};

type ProductProductRecord = {
  id: number;
  display_name: string;
  product_tmpl_id: Many2one;
};

type ProductTemplateAttributeValueRecord = {
  id: number;
  name: string;
  attribute_id: Many2one;
  attribute_line_id: Many2one;
  product_tmpl_id: Many2one;
  product_attribute_value_id: Many2one;
  ptav_active?: boolean;
};

type ConfiguratorSession = {
  saleOrderLineId: number;
  productTemplateId: number;
  productName: string;
  attributes: Array<{
    id: number;
    name: string;
    values: Array<{
      id: number;
      name: string;
      attributeName: string;
    }>;
  }>;
  exclusions: Array<{
    sourceValueId: number;
    excludedValueId: number;
  }>;
  graphicManifestKey: string;
  existingDesignUrl?: string;
};

function toMany2oneId(value: Many2one, fieldName: string): number {
  if (!Array.isArray(value) || typeof value[0] !== "number") {
    throw new Error(`El campo ${fieldName} no tiene un Many2one válido`);
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

function groupPtavsByAttribute(
  ptavs: ProductTemplateAttributeValueRecord[],
): ConfiguratorSession["attributes"] {
  const map = new Map<
    number,
    {
      id: number;
      name: string;
      values: Array<{
        id: number;
        name: string;
        attributeName: string;
      }>;
    }
  >();

  for (const ptav of ptavs) {
    const attributeId = toMany2oneId(ptav.attribute_id, "attribute_id");
    const attributeName =
      toMany2oneName(ptav.attribute_id) ?? `Atributo ${attributeId}`;

    const bucket =
      map.get(attributeId) ??
      {
        id: attributeId,
        name: attributeName,
        values: [],
      };

    bucket.values.push({
      id: ptav.id,
      name: ptav.name,
      attributeName,
    });

    map.set(attributeId, bucket);
  }

  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getConfiguratorSession(
  env: Env,
  saleOrderLineId: number,
): Promise<ConfiguratorSession> {
  const source = env.CONFIG_SOURCE ?? "mock";

  if (source !== "odoo") {
    throw new Error(
      `Esta prioridad requiere CONFIG_SOURCE=odoo. Valor actual: ${source}`,
    );
  }

  const lines = await odooRead<SaleOrderLineRecord>(
    env,
    "sale.order.line",
    [saleOrderLineId],
    ["id", "name", "product_id"],
  );

  if (lines.length === 0) {
    throw new Error(`No existe la línea de venta ${saleOrderLineId}`);
  }

  const line = lines[0];
  const productId = toMany2oneId(line.product_id, "product_id");

  const products = await odooRead<ProductProductRecord>(
    env,
    "product.product",
    [productId],
    ["id", "display_name", "product_tmpl_id"],
  );

  if (products.length === 0) {
    throw new Error(`No existe el producto ${productId}`);
  }

  const product = products[0];
  const productTemplateId = toMany2oneId(
    product.product_tmpl_id,
    "product_tmpl_id",
  );

  const productName =
    toMany2oneName(product.product_tmpl_id) ??
    product.display_name ??
    line.name ??
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
      "attribute_line_id",
      "product_tmpl_id",
      "product_attribute_value_id",
      "ptav_active",
    ],
    "attribute_id, id",
  );

  if (ptavs.length === 0) {
    throw new Error(
      `El producto template ${productTemplateId} no tiene PTAVs activos. Revisa el producto en Odoo.`,
    );
  }

  const attributes = groupPtavsByAttribute(ptavs);

  const exclusions: ConfiguratorSession["exclusions"] = [];

  return {
    saleOrderLineId,
    productTemplateId,
    productName,
    attributes,
    exclusions,
    graphicManifestKey: normalizeGraphicManifestKey(productName),
  };
}