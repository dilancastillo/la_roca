import type {
  ConfiguratorSession,
  SaveDesignRequest,
} from "@repo/shared/schemas/configurator";
import { normalizeLowerPocketSelectionsForSave } from "@repo/shared/lower-pocket-rules";
import type { OdooEnv } from "../lib/app-env.js";
import { odooCreate, odooSearchRead, odooWrite } from "../lib/odoo-client.js";
import { buildConfiguratorStateDescription } from "./configurator-state-metadata.js";
import { getConfiguratorSession } from "./get-configurator-session.js";
import {
  LOGO_IMAGE_FIELD,
  buildDesignImageStoragePayload,
  createDesignImageAttachment,
} from "./store-design-image.js";

type ProductVariantRecord = {
  id: number;
  display_name: string;
  product_template_attribute_value_ids?: number[];
};

type VariantResolution =
  | { productId: number; resolution: "product_variant" | "created_product_variant" }
  | { productId: number; resolution: "line_attribute_values" };

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
    Object.entries(selectedValueIds).flatMap(([key, values]) => {
      const attributeId = Number(key);

      if (!Number.isFinite(attributeId)) {
        return [];
      }

      return [
        [
          String(attributeId),
          normalizeManyIds(values).filter((value) => Number.isFinite(value)),
        ],
      ];
    }),
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

function stripDataUrlPrefix(dataBase64: string) {
  const [, payload] = dataBase64.split(",", 2);
  return payload || dataBase64;
}

function setsMatch(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  const rightSet = new Set(right);
  return left.every((value) => rightSet.has(value));
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function isLogoAttributeName(name: string) {
  const normalized = normalizeText(name);
  return normalized === "logo" || normalized.includes("logo");
}

function isNoLogoValueName(name: string) {
  const normalized = normalizeText(name);
  return (
    normalized === "no" ||
    normalized.includes("sin logo") ||
    normalized.includes("sin seleccion")
  );
}

function hasSelectedLogo(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const logoAttributes = session.attributes.filter((attribute) =>
    isLogoAttributeName(attribute.name),
  );

  return logoAttributes.some((attribute) => {
    const selected = new Set(selectedValueIds[String(attribute.id)] ?? []);

    return attribute.values.some(
      (value) => selected.has(value.id) && !isNoLogoValueName(value.name),
    );
  });
}

function validateSelections(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const errors: string[] = [];
  const selectedCount = Object.values(selectedValueIds).reduce(
    (count, valueIds) => count + valueIds.length,
    0,
  );

  if (selectedCount === 0) {
    errors.push(
      "La seleccion llego vacia al servidor. No se guardo para evitar limpiar la linea en Odoo.",
    );
  }

  for (const attribute of session.attributes) {
    const selected = selectedValueIds[String(attribute.id)] ?? [];
    const selectedSet = new Set(selected);

    if (attribute.variantMode === "variant" && selected.length === 0) {
      errors.push(
        `Falta seleccionar "${attribute.name}". No se guardo para evitar una variante incompleta.`,
      );
    }

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
    undefined,
    { limit: 5_000 },
  );

  return variants.find((variant) =>
    setsMatch(
      normalizeManyIds(variant.product_template_attribute_value_ids).sort((a, b) => a - b),
      [...variantValueIds].sort((a, b) => a - b),
    ),
  );
}

function parseCreatedProductId(created: unknown) {
  if (typeof created === "number" && Number.isFinite(created) && created > 0) {
    return Math.trunc(created);
  }

  if (Array.isArray(created)) {
    const [first] = created;

    if (typeof first === "number" && Number.isFinite(first) && first > 0) {
      return Math.trunc(first);
    }
  }

  return null;
}

async function resolveVariantProduct(
  env: OdooEnv,
  session: ConfiguratorSession,
  variantValueIds: number[],
): Promise<VariantResolution> {
  const matchingVariant = await findExactVariant(env, session, variantValueIds);

  if (matchingVariant) {
    return {
      productId: matchingVariant.id,
      resolution: "product_variant",
    };
  }

  if (variantValueIds.length === 0) {
    return {
      productId: session.productId,
      resolution: "line_attribute_values",
    };
  }

  try {
    const created = await odooCreate<unknown>(env, "product.product", [
      {
        product_tmpl_id: session.productTemplateId,
        product_template_attribute_value_ids: [[6, 0, variantValueIds]],
        product_template_variant_value_ids: [[6, 0, variantValueIds]],
      },
    ]);
    const createdProductId = parseCreatedProductId(created);

    if (createdProductId) {
      return {
        productId: createdProductId,
        resolution: "created_product_variant",
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    throw new Error(
      `No se pudo crear la variante exacta para la combinacion seleccionada. Odoo respondio: ${message}`,
    );
  }

  throw new Error(
    "Odoo no devolvio un product_id valido al crear la variante exacta seleccionada.",
  );
}

export async function saveConfiguratorDesign(
  env: OdooEnv,
  payload: SaveDesignRequest,
) {
  const session = await getConfiguratorSession(env, payload.saleOrderLineId, {
    loadCustomValues: false,
  });

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

  if (hasSelectedLogo(session, selectedValueIds) && !payload.logoAttachment) {
    throw new Error(
      "La prenda tiene logo seleccionado. Carga la imagen del logo antes de guardar.",
    );
  }

  const variantValueIds = session.attributes
    .filter((attribute) => attribute.variantMode === "variant")
    .flatMap((attribute) => selectedValueIds[String(attribute.id)] ?? []);

  const noVariantValueIds = session.attributes
    .filter((attribute) => attribute.variantMode !== "variant")
    .flatMap((attribute) => selectedValueIds[String(attribute.id)] ?? []);

  const variantResolution = await resolveVariantProduct(
    env,
    session,
    variantValueIds,
  );
  const productId = variantResolution.productId;
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

  const designImageInput = {
    saleOrderLineId: payload.saleOrderLineId,
    filename: payload.filename,
    imageBase64: payload.imageBase64,
    currentVersion: session.status.version,
    attachmentDescription: buildConfiguratorStateDescription({
      selectedValueIds,
      customValuesByValueId,
    }),
  };
  const designImageStorage = buildDesignImageStoragePayload(designImageInput);
  const logoImageLineValues = payload.logoAttachment
    ? {
        [LOGO_IMAGE_FIELD]: stripDataUrlPrefix(payload.logoAttachment.dataBase64),
      }
    : {};

  const attachmentId = await createDesignImageAttachment(
    env,
    designImageInput,
    designImageStorage,
  );

  const additionalAttachmentIds = await Promise.all(
    (payload.additionalImages ?? []).map((image) =>
      createDesignImageAttachment(
        env,
        {
          saleOrderLineId: payload.saleOrderLineId,
          filename: image.filename,
          imageBase64: image.imageBase64,
          currentVersion: session.status.version,
          attachmentDescription: designImageInput.attachmentDescription,
        },
        {
          ...designImageStorage,
          attachmentName: `design-v${designImageStorage.version}-${image.filename}`,
          lineValues: designImageStorage.lineValues,
        },
      ),
    ),
  );

  await odooWrite(env, "sale.order.line", [payload.saleOrderLineId], {
    product_id: productId,
    product_template_attribute_value_ids: [[6, 0, variantValueIds]],
    product_no_variant_attribute_value_ids: [[6, 0, noVariantValueIds]],
    product_custom_attribute_value_ids: customValueCommands,
    ...designImageStorage.lineValues,
    ...logoImageLineValues,
  });

  return {
    ok: true,
    attachmentId,
    ...(additionalAttachmentIds.length > 0
      ? { additionalAttachmentIds }
      : {}),
    ...(payload.logoAttachment ? { logoImageUpdated: true } : {}),
    version: designImageStorage.version,
    generatedAt: designImageStorage.generatedAtIso,
    productId,
    variantResolution: variantResolution.resolution,
  };
}
