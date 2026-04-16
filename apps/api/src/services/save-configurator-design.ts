import type {
  ConfiguratorSession,
  SaveDesignRequest,
} from "@repo/shared/schemas/configurator";
import { odooCreate, odooSearchRead, odooWrite } from "../lib/odoo-client";
import { toOdooDatetimeString } from "../lib/odoo-datetime";
import { getConfiguratorSession } from "./get-configurator-session";

type Env = {
  ODOO_BASE_URL?: string;
  ODOO_DB?: string;
  ODOO_API_KEY?: string;
};

type ProductVariantRecord = {
  id: number;
  display_name: string;
  product_template_attribute_value_ids?: number[];
};

function normalizeManyIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is number => typeof item === "number");
}

function parseSelectedValueIds(selectedValueIds: SaveDesignRequest["selectedValueIds"]) {
  return Object.fromEntries(
    Object.entries(selectedValueIds).map(([key, values]) => [
      Number(key),
      values.filter((value) => Number.isFinite(value)),
    ]),
  );
}

function setsMatch(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

function validateSelections(
  session: ConfiguratorSession,
  selectedValueIds: Record<number, number[]>,
) {
  const errors: string[] = [];

  for (const attribute of session.attributes) {
    const selected = selectedValueIds[attribute.id] ?? [];
    const selectedSet = new Set(selected);

    if (selected.length !== selectedSet.size) {
      errors.push(`El atributo "${attribute.name}" tiene valores repetidos.`);
    }

    if (attribute.selectionMode === "single" && selected.length > 1) {
      errors.push(`El atributo "${attribute.name}" solo acepta una opcion.`);
    }

    for (const valueId of selected) {
      if (!attribute.values.some((value) => value.id === valueId)) {
        errors.push(
          `El valor ${valueId} no pertenece al atributo "${attribute.name}".`,
        );
      }
    }
  }

  const allSelectedIds = new Set<number>(
    Object.values(selectedValueIds).flatMap((valueIds) => valueIds),
  );

  for (const rule of session.exclusions) {
    if (allSelectedIds.has(rule.sourceValueId) && allSelectedIds.has(rule.excludedValueId)) {
      errors.push("La combinacion seleccionada viola una exclusion configurada en Odoo.");
      break;
    }
  }

  return errors;
}

async function findExactVariant(
  env: Env,
  session: ConfiguratorSession,
  variantValueIds: number[],
) {
  const variants = await odooSearchRead<ProductVariantRecord>(
    env,
    "product.product",
    [["product_tmpl_id", "=", session.productTemplateId]],
    ["id", "display_name", "product_template_attribute_value_ids"],
  );

  return variants.find((variant) =>
    setsMatch(
      normalizeManyIds(variant.product_template_attribute_value_ids).sort((a, b) => a - b),
      [...variantValueIds].sort((a, b) => a - b),
    ),
  );
}

export async function saveConfiguratorDesign(
  env: Env,
  payload: SaveDesignRequest,
) {
  const session = await getConfiguratorSession(env, payload.saleOrderLineId);

  if (!session.status.canEdit || session.status.isLocked) {
    throw new Error("La linea no esta habilitada para edicion.");
  }

  const selectedValueIds = parseSelectedValueIds(payload.selectedValueIds);
  const validationErrors = validateSelections(session, selectedValueIds);

  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  const variantValueIds = session.attributes
    .filter((attribute) => attribute.variantMode === "variant")
    .flatMap((attribute) => selectedValueIds[attribute.id] ?? []);

  const noVariantValueIds = session.attributes
    .filter((attribute) => attribute.variantMode !== "variant")
    .flatMap((attribute) => selectedValueIds[attribute.id] ?? []);

  const matchingVariant = await findExactVariant(env, session, variantValueIds);

  if (!matchingVariant) {
    throw new Error(
      "No existe una variante exacta para la combinacion seleccionada. Ajusta color, genero o talla y vuelve a intentar.",
    );
  }

  const nextVersion = session.status.version + 1;
  const generatedAt = new Date();
  const generatedAtIso = generatedAt.toISOString();
  const generatedAtOdoo = toOdooDatetimeString(generatedAt);

  await odooWrite(env, "sale.order.line", [payload.saleOrderLineId], {
    product_id: matchingVariant.id,
    product_no_variant_attribute_value_ids: [[6, 0, noVariantValueIds]],
    product_custom_attribute_value_ids: [[5, 0, 0]],
    x_product_design_image: payload.imageBase64,
    x_product_design_generated_at: generatedAtOdoo,
    x_product_design_version: nextVersion,
  });

  const attachmentId = await odooCreate<number>(env, "ir.attachment", [
    {
      name: `design-v${nextVersion}-${payload.filename}`,
      datas: payload.imageBase64,
      res_model: "sale.order.line",
      res_id: payload.saleOrderLineId,
      mimetype: "image/png",
    },
  ]);

  return {
    ok: true,
    attachmentId,
    productId: matchingVariant.id,
    version: nextVersion,
    generatedAt: generatedAtIso,
  };
}
