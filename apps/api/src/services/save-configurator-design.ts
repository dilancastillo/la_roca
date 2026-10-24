import type {
  ConfiguratorSession,
  SaveDesignRequest,
} from "@repo/shared/schemas/configurator";
import { normalizeLowerPocketSelectionsForSave } from "@repo/shared/lower-pocket-rules";
import {
  getMeasurementValueError,
  isNumericLengthAttributeName,
} from "@repo/shared/measurement-rules";
import type { OdooEnv } from "../lib/app-env.js";
import { odooCreate, odooSearchRead, odooWrite } from "../lib/odoo-client.js";
import { buildConfiguratorStateDescription } from "./configurator-state-metadata.js";
import { getConfiguratorSession } from "./get-configurator-session.js";
import {
  LOGO_LINE_FIELDS,
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

function validateCustomMeasurements(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
  customValuesByValueId: Record<string, string>,
) {
  for (const attribute of session.attributes) {
    if (!isNumericLengthAttributeName(attribute.name)) {
      continue;
    }

    const selected = new Set(selectedValueIds[String(attribute.id)] ?? []);
    for (const value of attribute.values) {
      if (!value.allowsCustomValue || !selected.has(value.id)) {
        continue;
      }

      const customValue = customValuesByValueId[String(value.id)] ?? "";
      if (customValue.trim().length === 0) {
        return `El largo de "${attribute.name}" es obligatorio.`;
      }

      const error = getMeasurementValueError(attribute.name, customValue);
      if (error) {
        return error;
      }
    }
  }

  return undefined;
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

function isYesValueName(name: string) {
  const normalized = normalizeText(name);
  return normalized === "si" || normalized === "yes";
}

function isLowerPocketZipperOptionsAttribute(
  attribute: ConfiguratorSession["attributes"][number],
) {
  return normalizeText(attribute.name) === "opciones de cremallera";
}

function isBootTypeAttribute(
  attribute: ConfiguratorSession["attributes"][number],
) {
  const name = normalizeText(attribute.name);
  return (
    name === "tipo bota" ||
    name === "tipo de bota" ||
    name === "modelo bota" ||
    name === "modelo de bota"
  );
}

function isBootMeasurementAttribute(
  attribute: ConfiguratorSession["attributes"][number],
) {
  const name = normalizeText(attribute.name);
  return name.includes("bota") && (name.includes("largo") || name.includes("ancho"));
}

function hasOriginalBootSelection(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const bootTypeAttribute = session.attributes.find(isBootTypeAttribute);

  if (!bootTypeAttribute) {
    return false;
  }

  const selected = new Set(selectedValueIds[String(bootTypeAttribute.id)] ?? []);
  return bootTypeAttribute.values.some(
    (value) => selected.has(value.id) && normalizeText(value.name) === "original",
  );
}

function hasLowerPocketZipperEnabled(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const zipperToggle = session.attributes.find((attribute) => {
    const name = normalizeText(attribute.name);
    return (
      name.includes("bolsillos") &&
      name.includes("inferiores") &&
      name.includes("cremallera") &&
      !name.includes("opciones")
    );
  });

  if (!zipperToggle) {
    return true;
  }

  const selected = new Set(selectedValueIds[String(zipperToggle.id)] ?? []);
  return zipperToggle.values.some(
    (value) => selected.has(value.id) && isYesValueName(value.name),
  );
}

function isOptionalUnselectedAttribute(
  attribute: ConfiguratorSession["attributes"][number],
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  if (
    isBootMeasurementAttribute(attribute) &&
    hasOriginalBootSelection(session, selectedValueIds)
  ) {
    return true;
  }

  if (
    isLowerPocketZipperOptionsAttribute(attribute) &&
    !hasLowerPocketZipperEnabled(session, selectedValueIds)
  ) {
    return true;
  }

  if (attribute.selectionMode !== "multiple") {
    return false;
  }

  const normalized = normalizeText(attribute.name);

  return (
    normalized.includes("logo") ||
    (normalized.includes("seccion") && normalized.includes("vivo"))
  );
}

function getSelectedLogoValueIds(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  return session.attributes
    .filter((attribute) => isLogoAttributeName(attribute.name))
    .flatMap((attribute) => {
      const selected = new Set(selectedValueIds[String(attribute.id)] ?? []);
      return attribute.values
        .filter((value) => selected.has(value.id) && !isNoLogoValueName(value.name))
        .map((value) => value.id);
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

    if (
      !isOptionalUnselectedAttribute(attribute, session, selectedValueIds) &&
      selected.length === 0
    ) {
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
  const measurementError = validateCustomMeasurements(
    session,
    selectedValueIds,
    customValuesByValueId,
  );
  if (measurementError) {
    throw new Error(measurementError);
  }
  const validationErrors = validateSelections(session, selectedValueIds);

  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  if (getSelectedLogoValueIds(session, selectedValueIds).length > 3) {
    throw new Error("Solo se permiten hasta tres ubicaciones de logo.");
  }
  if ((payload.logoAttachments?.length ?? 0) > 3) {
    throw new Error("Solo se permiten hasta tres imágenes de logo.");
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
      visualDefinitionVersionIds: (session.visualDefinitions ?? []).map(
        (definition) => definition.id,
      ),
    }),
  };
  const designImageStorage = buildDesignImageStoragePayload(designImageInput);
  const logoLineValues = {
    // An inherited image must not survive after the advisor removes its logo
    // location in the duplicate. Explicitly clear all slots first, then fill
    // the slots selected in this save.
    ...Object.fromEntries(
      LOGO_LINE_FIELDS.flatMap((fields) => [
        [fields.image, false],
        [fields.details, false],
      ]),
    ),
    ...Object.fromEntries(
      (payload.logoAttachments ?? []).flatMap((attachment, index) => {
      const fields = LOGO_LINE_FIELDS[index];

      return fields
        ? [
            [fields.image, stripDataUrlPrefix(attachment.dataBase64)],
            [fields.details, attachment.placementLabel],
          ]
        : [];
      }),
    ),
  };
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

  const logoAttachmentIds = await Promise.all(
    (payload.logoAttachments ?? []).map((attachment) =>
      odooCreate<number>(env, "ir.attachment", [
        {
          name: `logo-${attachment.placementValueId}-${attachment.filename}`,
          datas: stripDataUrlPrefix(attachment.dataBase64),
          res_model: "sale.order.line",
          res_id: payload.saleOrderLineId,
          mimetype: attachment.mimeType,
          description: `Logo: ${attachment.placementLabel}`,
        },
      ]),
    ),
  );

  await odooWrite(env, "sale.order.line", [payload.saleOrderLineId], {
    product_id: productId,
    product_template_attribute_value_ids: [[6, 0, variantValueIds]],
    product_no_variant_attribute_value_ids: [[6, 0, noVariantValueIds]],
    product_custom_attribute_value_ids: customValueCommands,
    ...designImageStorage.lineValues,
    ...logoLineValues,
  });

  return {
    ok: true,
    attachmentId,
    ...(additionalAttachmentIds.length > 0
      ? { additionalAttachmentIds }
      : {}),
    ...(logoAttachmentIds.length > 0 ? { logoImageUpdated: true, logoAttachmentIds } : {}),
    version: designImageStorage.version,
    generatedAt: designImageStorage.generatedAtIso,
    productId,
    variantResolution: variantResolution.resolution,
  };
}
