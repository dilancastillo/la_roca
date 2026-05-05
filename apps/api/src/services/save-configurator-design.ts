import type {
  ConfiguratorSession,
  SaveDesignRequest,
} from "@repo/shared/schemas/configurator";
import { normalizeLowerPocketSelectionsForSave } from "@repo/shared/lower-pocket-rules";
import type { OdooEnv } from "../lib/app-env.js";
import { odooSearchRead, odooWrite } from "../lib/odoo-client.js";
import { getConfiguratorSession } from "./get-configurator-session.js";
import { storeDesignImage } from "./store-design-image.js";

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

function parseSelectedValueIds(
  selectedValueIds: SaveDesignRequest["selectedValueIds"],
): Record<string, number[]> {
  return Object.fromEntries(
    Object.entries(selectedValueIds).map(([key, values]) => [
      String(Number(key)),
      normalizeManyIds(values).filter((value) => Number.isFinite(value)),
    ]),
  ) as Record<string, number[]>;
}

function parseCustomValuesByValueId(
  customValuesByValueId: SaveDesignRequest["customValuesByValueId"],
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(customValuesByValueId ?? {}).flatMap(([key, value]) => {
      const valueId = Number(key);

      if (!Number.isFinite(valueId)) {
        return [];
      }

      return [
        [
          String(valueId),
          typeof value === "string" ? value : "",
        ],
      ];
    }),
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
  selectedValueIds: Record<string, number[]>,
) {
  const errors: string[] = [];

  for (const attribute of session.attributes) {
    const selected = selectedValueIds[String(attribute.id)] ?? [];
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
  env: OdooEnv,
  session: ConfiguratorSession,
  variantValueIds: number[],
) {
  if (variantValueIds.length === 0) {
    return undefined;
  }

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
  env: OdooEnv,
  payload: SaveDesignRequest,
) {
  const session = await getConfiguratorSession(env, payload.saleOrderLineId);

  if (!session.status.canEdit || session.status.isLocked) {
    throw new Error("La linea no esta habilitada para edicion.");
  }

  const selectedValueIds = normalizeLowerPocketSelectionsForSave(
    session,
    parseSelectedValueIds(payload.selectedValueIds),
  );
  const customValuesByValueId = parseCustomValuesByValueId(
    payload.customValuesByValueId,
  );
  const validationErrors = validateSelections(session, selectedValueIds);

  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  const variantValueIds = session.attributes
    .filter((attribute) => attribute.variantMode === "variant")
    .flatMap((attribute) => selectedValueIds[String(attribute.id)] ?? []);

  const noVariantValueIds = session.attributes
    .filter((attribute) => attribute.variantMode !== "variant")
    .flatMap((attribute) => selectedValueIds[String(attribute.id)] ?? []);

  const matchingVariant = await findExactVariant(env, session, variantValueIds);
  const productId = matchingVariant?.id ?? session.productId;
  const selectedCustomValueIds = new Set(
    Object.values(selectedValueIds).flatMap((valueIds) => valueIds),
  );
  const customValueCommands: unknown[] = [[5, 0, 0]];

  for (const attribute of session.attributes) {
    for (const value of attribute.values) {
      if (!value.allowsCustomValue || !selectedCustomValueIds.has(value.id)) {
        continue;
      }

      customValueCommands.push([
        0,
        0,
        {
          custom_product_template_attribute_value_id: value.id,
          custom_value: customValuesByValueId[String(value.id)] ?? "",
        },
      ]);
    }
  }

  await odooWrite(env, "sale.order.line", [payload.saleOrderLineId], {
    product_id: productId,
    product_template_attribute_value_ids: [[6, 0, variantValueIds]],
    product_no_variant_attribute_value_ids: [[6, 0, noVariantValueIds]],
    product_custom_attribute_value_ids: customValueCommands,
  });

  return {
    ...(await storeDesignImage(env, {
      saleOrderLineId: payload.saleOrderLineId,
      filename: payload.filename,
      imageBase64: payload.imageBase64,
      currentVersion: session.status.version,
    })),
    productId,
    variantResolution: matchingVariant ? "product_variant" : "line_attribute_values",
  };
}
