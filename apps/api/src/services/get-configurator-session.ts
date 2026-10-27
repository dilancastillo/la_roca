import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import {
  getPantsKneePatchModelBySourceValueId,
  getPantsKneePatchTypeBySourceValueId,
  isPantsKneePatchTypeAllowedForModel,
  PANTS_KNEE_PATCH_ATTRIBUTE_IDS,
} from "@repo/shared/pants-knee-patch-rules";
import type { AppEnv, OdooEnv } from "../lib/app-env.js";
import { odooRead, odooSearchRead } from "../lib/odoo-client.js";
import { parseVisualDefinitionVersionIds } from "./configurator-state-metadata.js";
import { LOGO_LINE_FIELDS } from "./store-design-image.js";
import { loadActiveVisualDefinitions } from "./visual-catalog-repository.js";
import {
  getOrCreateLineVisualRelease,
  getVisualRelease,
} from "./visual-release-repository.js";

type Many2one = [number, string] | false;

type SaleOrderLineRecord = {
  id: number;
  order_id: Many2one;
  product_id: Many2one;
  product_template_attribute_value_ids?: number[];
  product_no_variant_attribute_value_ids?: number[];
  product_custom_attribute_value_ids?: number[];
  x_product_design_image?: string | false;
  x_studio_imagen_adjunta?: string | false;
  x_studio_detalles_adicionales?: string | false;
  x_studio_logo_2?: string | false;
  x_studio_detalles_logo_2?: string | false;
  x_studio_logo_3?: string | false;
  x_studio_detalles_logo_3?: string | false;
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
  sequence?: number;
  attribute_id: Many2one;
  product_attribute_value_id: Many2one;
  product_tmpl_id: Many2one;
  display_type?: string | false;
  ptav_active?: boolean;
  is_custom?: boolean;
  image?: string | false;
  excluded_value_ids?: number[];
};

type ProductAttributeRecord = {
  id: number;
  name: string;
  display_type?: string | false;
  create_variant?: string | false;
};

function hasSelectionConflict(
  valueId: number,
  selectedValueIds: Record<string, number[]>,
  exclusions: Array<{ sourceValueId: number; excludedValueId: number }>,
) {
  const selected = new Set(Object.values(selectedValueIds).flat());

  return exclusions.some(
    (rule) =>
      (rule.sourceValueId === valueId && selected.has(rule.excludedValueId)) ||
      (rule.excludedValueId === valueId && selected.has(rule.sourceValueId)),
  );
}

function getKneePatchModelForTypeAttribute(
  attributes: ConfiguratorSession["attributes"],
  attributeId: number,
  selectedValueIds: Record<string, number[]>,
) {
  const modelAttributeId = attributeId === PANTS_KNEE_PATCH_ATTRIBUTE_IDS.rightType
    ? PANTS_KNEE_PATCH_ATTRIBUTE_IDS.rightModel
    : attributeId === PANTS_KNEE_PATCH_ATTRIBUTE_IDS.leftType
      ? PANTS_KNEE_PATCH_ATTRIBUTE_IDS.leftModel
      : undefined;
  const modelAttribute = attributes.find(
    (attribute) => attribute.id === modelAttributeId,
  );
  const selectedModelIds = modelAttribute
    ? selectedValueIds[String(modelAttribute.id)] ?? []
    : [];

  return getPantsKneePatchModelBySourceValueId(
    modelAttribute?.values.find((value) => selectedModelIds.includes(value.id))
      ?.sourceValueId,
  );
}

function isKneePatchTypeAttribute(attributeId: number) {
  return (
    attributeId === PANTS_KNEE_PATCH_ATTRIBUTE_IDS.rightType ||
    attributeId === PANTS_KNEE_PATCH_ATTRIBUTE_IDS.leftType
  );
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isLowerPocketModelAttribute(
  attribute: ConfiguratorSession["attributes"][number],
) {
  const name = normalizeText(attribute.name);
  return name.includes("modelo") && name.includes("bolsillo") && name.includes("inferior");
}

function isLowerPocketUnselectedOption(optionName: string) {
  return normalizeText(optionName) === "sin seleccion";
}

function isExplicitNoneOption(optionName: string) {
  const name = normalizeText(optionName);
  return name === "ninguno" || name === "ninguna" || name.includes("no aplica");
}

function applyFirstOptionDefaults(
  attributes: ConfiguratorSession["attributes"],
  selectedValueIds: Record<string, number[]>,
  exclusions: Array<{ sourceValueId: number; excludedValueId: number }>,
) {
  const next = Object.fromEntries(
    Object.entries(selectedValueIds).map(([attributeId, valueIds]) => [
      attributeId,
      [...valueIds],
    ]),
  ) as Record<string, number[]>;

  for (const attribute of attributes) {
    const key = String(attribute.id);

    const selectedValues = attribute.values.filter((value) =>
      (next[key] ?? []).includes(value.id),
    );
    const hasOnlyLowerPocketNoneSelection =
      isLowerPocketModelAttribute(attribute) &&
      selectedValues.length > 0 &&
      selectedValues.every((value) => isExplicitNoneOption(value.name));

    if (
      attribute.selectionMode === "multiple" ||
      ((next[key]?.length ?? 0) > 0 && !hasOnlyLowerPocketNoneSelection)
    ) {
      continue;
    }

    const kneePatchModel = getKneePatchModelForTypeAttribute(
      attributes,
      attribute.id,
      next,
    );
    const compatibleValues = kneePatchModel
      ? attribute.values.filter((value) =>
          isPantsKneePatchTypeAllowedForModel(
            kneePatchModel,
            getPantsKneePatchTypeBySourceValueId(value.sourceValueId),
          ),
        )
      : attribute.values;
    const defaultValues = isKneePatchTypeAttribute(attribute.id)
      ? [
          ...compatibleValues.filter(
            (value) =>
              getPantsKneePatchTypeBySourceValueId(value.sourceValueId) ===
              "plain",
          ),
          ...compatibleValues.filter(
            (value) =>
              getPantsKneePatchTypeBySourceValueId(value.sourceValueId) !==
              "plain",
          ),
        ]
      : isLowerPocketModelAttribute(attribute)
        ? [
            ...compatibleValues.filter((value) =>
              isLowerPocketUnselectedOption(value.name),
            ),
            ...compatibleValues.filter(
              (value) => !isLowerPocketUnselectedOption(value.name),
            ),
          ]
        : compatibleValues;
    const firstCompatibleOption = defaultValues.find(
      (value) => !hasSelectionConflict(value.id, next, exclusions),
    );

    if (firstCompatibleOption) {
      next[key] = [firstCompatibleOption.id];
    }
  }

  return next;
}

type ProductTemplateAttributeLineRecord = {
  id: number;
  attribute_id: Many2one;
  sequence?: number;
};

type ProductAttributeValueRecord = {
  id: number;
  name: string;
  sequence?: number;
  html_color?: string | false;
  display_type?: string | false;
  is_custom?: boolean;
  image?: string | false;
};

type ProductAttributeCustomValueRecord = {
  id: number;
  custom_product_template_attribute_value_id: Many2one;
  custom_value?: string | false;
};

type DesignAttachmentRecord = {
  id: number;
  name: string;
  create_date?: string | false;
  description?: string | false;
};

type GetConfiguratorSessionOptions = {
  loadCustomValues?: boolean;
  visualDefinitionIdsOverride?: string[];
  visualReleaseId?: string;
  pinActiveVisualRelease?: boolean;
};

export function resolveSelectedIdsForAttributeValues(
  values: Array<{ id: number; sourceValueId?: number | undefined }>,
  lineValueIds: Set<number>,
  productValueIds: Set<number>,
) {
  const resolveIds = (selectedIds: Set<number>) => {
    const ptavIds = values
      .map((value) => value.id)
      .filter((valueId) => selectedIds.has(valueId));

    if (ptavIds.length > 0) {
      return ptavIds;
    }

    return values
      .filter(
        (value) =>
          typeof value.sourceValueId === "number" &&
          selectedIds.has(value.sourceValueId),
      )
      .map((value) => value.id);
  };

  const lineSelectedIds = resolveIds(lineValueIds);

  if (lineSelectedIds.length > 0) {
    return lineSelectedIds;
  }

  return resolveIds(productValueIds);
}

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

function normalizeComparableText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function isNoLogoOptionName(value: string) {
  const normalized = normalizeComparableText(value);
  return normalized === "no" || normalized.includes("sin logo") || normalized.includes("sin seleccion");
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

function findMissingOptionalField(message: string, fields: string[]) {
  return fields.find((field) => message.includes(field));
}

function inferOdooImageMimeType(dataBase64: string) {
  if (dataBase64.startsWith("/9j/")) {
    return "image/jpeg";
  }

  if (dataBase64.startsWith("iVBORw0KGgo")) {
    return "image/png";
  }

  if (dataBase64.startsWith("R0lGOD")) {
    return "image/gif";
  }

  if (dataBase64.startsWith("UklGR")) {
    return "image/webp";
  }

  if (dataBase64.startsWith("PHN2Zy") || dataBase64.startsWith("PD94bW")) {
    return "image/svg+xml";
  }

  return "image/png";
}

export function toOdooImageDataUri(value: string | false | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    return undefined;
  }

  if (normalized.startsWith("data:image/")) {
    return normalized;
  }

  const dataBase64 = normalized.replace(/\s/g, "");

  return `data:${inferOdooImageMimeType(dataBase64)};base64,${dataBase64}`;
}

function buildExistingLogoAttachments(
  line: SaleOrderLineRecord,
  attributes: ConfiguratorSession["attributes"],
  selectedValueIds: Record<string, number[]>,
) {
  const placements = attributes
    .filter((attribute) => normalizeComparableText(attribute.name).includes("logo"))
    .flatMap((attribute) => {
      const selected = new Set(selectedValueIds[String(attribute.id)] ?? []);
      return attribute.values.filter(
        (value) => selected.has(value.id) && !isNoLogoOptionName(value.name),
      );
    });
  const usedPlacementIds = new Set<number>();
  const attachments: Array<{
    placementValueId: number;
    placementLabel: string;
    filename: string;
    mimeType: string;
    dataBase64: string;
  }> = [];

  for (const fields of LOGO_LINE_FIELDS) {
    const binary = line[fields.image];
    if (typeof binary !== "string" || binary.trim().length === 0) {
      continue;
    }

    const details = line[fields.details];
    const normalizedDetails =
      typeof details === "string" ? normalizeComparableText(details) : "";
    const matchedPlacement = placements.find(
      (placement) =>
        !usedPlacementIds.has(placement.id) &&
        normalizedDetails.length > 0 &&
        normalizeComparableText(placement.name) === normalizedDetails,
    );
    // Historic saves wrote images in the selected-location order without a
    // location label. Preserve those too so duplicating a line never forces a
    // second upload merely because it was saved by an older app version.
    const placement = matchedPlacement ?? placements.find(
      (option) => !usedPlacementIds.has(option.id),
    );
    const dataBase64 = toOdooImageDataUri(binary);
    if (!placement || !dataBase64) {
      continue;
    }

    usedPlacementIds.add(placement.id);
    attachments.push({
      placementValueId: placement.id,
      placementLabel: placement.name,
      filename: `logo-heredado-${placement.id}.png`,
      mimeType: inferOdooImageMimeType(binary),
      dataBase64,
    });
  }

  return attachments;
}

export function resolveOdooOptionImageSrc({
  attributeDisplayType,
  ptavDisplayType,
  valueDisplayType,
  ptavImage,
  valueImage,
}: {
  attributeDisplayType?: string | false | undefined;
  ptavDisplayType?: string | false | undefined;
  valueDisplayType?: string | false | undefined;
  ptavImage?: string | false | undefined;
  valueImage?: string | false | undefined;
}) {
  const isImageOption =
    normalizeDisplayType(attributeDisplayType) === "image" ||
    normalizeDisplayType(ptavDisplayType) === "image" ||
    normalizeDisplayType(valueDisplayType) === "image";

  if (!isImageOption) {
    return undefined;
  }

  return toOdooImageDataUri(ptavImage) ?? toOdooImageDataUri(valueImage);
}

const productTemplateAttributeValueBaseFields = [
  "id",
  "name",
  "attribute_id",
  "product_attribute_value_id",
  "product_tmpl_id",
  "ptav_active",
  "is_custom",
];

const productTemplateAttributeValueOptionalFields = [
  "sequence",
  "display_type",
  "image",
  "excluded_value_ids",
];

async function loadProductTemplateAttributeValues(
  env: OdooEnv,
  productTemplateId: number,
) {
  const warnings: string[] = [];
  let optionalFields = [...productTemplateAttributeValueOptionalFields];

  while (true) {
    try {
      return {
        ptavs: await odooSearchRead<ProductTemplateAttributeValueRecord>(
          env,
          "product.template.attribute.value",
          [
            ["product_tmpl_id", "=", productTemplateId],
            ["ptav_active", "=", true],
          ],
          [...productTemplateAttributeValueBaseFields, ...optionalFields],
          "attribute_id, id",
        ),
        warnings,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const missingField = findMissingOptionalField(message, optionalFields);

      if (!missingField) {
        throw error;
      }

      optionalFields = optionalFields.filter((field) => field !== missingField);

      if (missingField === "excluded_value_ids") {
        warnings.push(
          "Odoo no devolvio el campo excluded_value_ids; las exclusiones no se aplicaron.",
        );
      }

      if (missingField === "image") {
        warnings.push(
          "Odoo no devolvio imagenes de valores; la barra lateral usara los assets locales disponibles.",
        );
      }
    }
  }
}

async function loadProductAttributeValues(
  env: OdooEnv,
  productAttributeValueIds: number[],
) {
  if (productAttributeValueIds.length === 0) {
    return {
      attributeValues: [] as ProductAttributeValueRecord[],
      warnings: [] as string[],
    };
  }

  const baseFields = ["id", "name", "html_color", "is_custom"];
  const warnings: string[] = [];
  let optionalFields = ["sequence", "display_type", "image"];

  while (true) {
    try {
      return {
        attributeValues: await odooRead<ProductAttributeValueRecord>(
          env,
          "product.attribute.value",
          productAttributeValueIds,
          [...baseFields, ...optionalFields],
        ),
        warnings,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const missingField = findMissingOptionalField(message, optionalFields);

      if (!missingField) {
        throw error;
      }

      optionalFields = optionalFields.filter((field) => field !== missingField);

      if (missingField === "image") {
        warnings.push(
          "Odoo no devolvio imagenes de valores; la barra lateral usara los assets locales disponibles.",
        );
      }
    }
  }
}

function parseDesignAttachmentVersion(name: string) {
  const match = /^design-v(\d+)-/.exec(name);
  const version = match ? Number(match[1]) : 0;

  return Number.isInteger(version) && version > 0 ? version : 0;
}

function parseOdooDatetime(value: string | false | undefined) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const date = new Date(`${value.replace(" ", "T")}Z`);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

async function loadLatestDesignAttachment(env: OdooEnv, saleOrderLineId: number) {
  const domain = [
    ["res_model", "=", "sale.order.line"],
    ["res_id", "=", saleOrderLineId],
    ["name", "ilike", "design-v"],
  ];
  const attachments = await odooSearchRead<DesignAttachmentRecord>(
    env,
    "ir.attachment",
    domain,
    ["id", "name", "create_date", "description"],
    "create_date desc, id desc",
    { limit: 20 },
  ).catch(() => []);

  const [attachment] = attachments;
  const visualDefinitionVersionIds = attachment
    ? parseVisualDefinitionVersionIds(attachment.description)
    : undefined;

  return attachment
    ? {
        hasAttachment: true,
        version: parseDesignAttachmentVersion(attachment.name),
        generatedAt: parseOdooDatetime(attachment.create_date),
        visualDefinitionVersionIds,
      }
    : {
        hasAttachment: false,
        version: 0,
        generatedAt: null,
        visualDefinitionVersionIds: undefined,
      };
}

export function resolvePinnedVisualDefinitionIds({
  hasAttachment,
  canEdit,
  visualDefinitionVersionIds,
}: {
  hasAttachment: boolean;
  canEdit: boolean;
  visualDefinitionVersionIds: string[] | undefined;
}) {
  // An editable quotation must adopt the release currently in production.
  // The attachment is an historical record, not a permanent override while
  // the advisor can still change the commercial configuration.
  if (!canEdit && visualDefinitionVersionIds !== undefined) {
    return visualDefinitionVersionIds;
  }

  // Locked historical lines without catalog metadata must keep their saved
  // image instead of composing a newer catalog on top of it.
  return hasAttachment && !canEdit ? [] : undefined;
}

export async function getConfiguratorSession(
  env: AppEnv,
  saleOrderLineId: number,
  options: GetConfiguratorSessionOptions = {},
): Promise<ConfiguratorSession> {
  const shouldLoadCustomValues = options.loadCustomValues ?? true;
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
      "product_custom_attribute_value_ids",
      "x_product_design_image",
      ...LOGO_LINE_FIELDS.flatMap((fields) => [fields.image, fields.details]),
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

  const { ptavs, warnings: ptavWarnings } =
    await loadProductTemplateAttributeValues(env, productTemplateId);

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

  const customAttributeValueIds = normalizeManyIds(
    line.product_custom_attribute_value_ids,
  );

  const [
    attributes,
    attributeLines,
    attributeValuesResult,
    customAttributeValues,
  ] =
    await Promise.all([
      attributeIds.length > 0
        ? odooRead<ProductAttributeRecord>(
            env,
            "product.attribute",
            attributeIds,
            ["id", "name", "display_type", "create_variant"],
          )
        : Promise.resolve([]),
      odooSearchRead<ProductTemplateAttributeLineRecord>(
        env,
        "product.template.attribute.line",
        [["product_tmpl_id", "=", productTemplateId]],
        ["id", "attribute_id", "sequence"],
        "sequence, id",
      ).catch(() => []),
      loadProductAttributeValues(env, productAttributeValueIds),
      shouldLoadCustomValues && customAttributeValueIds.length > 0
        ? odooRead<ProductAttributeCustomValueRecord>(
            env,
            "product.attribute.custom.value",
            customAttributeValueIds,
            ["id", "custom_product_template_attribute_value_id", "custom_value"],
          )
        : Promise.resolve([]),
    ]);
  const { attributeValues, warnings: attributeValueWarnings } =
    attributeValuesResult;

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
  const attributeLineOrder = new Map<number, { sequence: number; index: number }>();
  const customValuesByValueId: Record<string, string> = {};
  const customValuePtavIds = new Set<number>();

  for (const customAttributeValue of customAttributeValues) {
    const ptavId = Array.isArray(
      customAttributeValue.custom_product_template_attribute_value_id,
    )
      ? customAttributeValue.custom_product_template_attribute_value_id[0]
      : null;

    if (typeof ptavId !== "number") {
      continue;
    }

    customValuePtavIds.add(ptavId);
    customValuesByValueId[String(ptavId)] =
      typeof customAttributeValue.custom_value === "string"
        ? customAttributeValue.custom_value
        : "";
  }

  attributeLines.forEach((line, index) => {
    const attributeId = Array.isArray(line.attribute_id)
      ? line.attribute_id[0]
      : null;

    if (typeof attributeId !== "number") {
      return;
    }

    attributeLineOrder.set(attributeId, {
      sequence: typeof line.sequence === "number" ? line.sequence : index,
      index,
    });
  });

  const lineValueIds = new Set<number>([
    ...normalizeManyIds(line.product_template_attribute_value_ids),
    ...normalizeManyIds(line.product_no_variant_attribute_value_ids),
    ...customValuePtavIds,
  ]);
  const productValueIds = new Set<number>([
    ...normalizeManyIds(product.product_template_attribute_value_ids),
  ]);

  const groupedAttributes = new Map<
    number,
    NonNullable<ConfiguratorSession["attributes"]>[number]
  >();
  const optionOrderByPtavId = new Map<
    number,
    { sequence: number | undefined; index: number }
  >();

  for (const [index, ptav] of ptavs.entries()) {
    const attributeId = toMany2oneId(ptav.attribute_id, "attribute_id");
    const attribute = attributeMap.get(attributeId);
    const productAttributeValueId = toMany2oneId(
      ptav.product_attribute_value_id,
      "product_attribute_value_id",
    );
    const attributeValue = attributeValueMap.get(productAttributeValueId);
    const optionImageSrc = resolveOdooOptionImageSrc({
      attributeDisplayType: attribute?.display_type,
      ptavDisplayType: ptav.display_type,
      valueDisplayType: attributeValue?.display_type,
      ptavImage: ptav.image,
      valueImage: attributeValue?.image,
    });

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
      sourceValueId: productAttributeValueId,
      name: ptav.name,
      attributeId,
      attributeName: group.name,
      ...(attributeValue?.html_color
        ? { colorHex: attributeValue.html_color }
        : {}),
      ...(optionImageSrc ? { optionImageSrc } : {}),
      allowsCustomValue: Boolean(ptav.is_custom || attributeValue?.is_custom),
    });
    optionOrderByPtavId.set(ptav.id, {
      sequence:
        typeof ptav.sequence === "number"
          ? ptav.sequence
          : typeof attributeValue?.sequence === "number"
            ? attributeValue.sequence
            : undefined,
      index,
    });

    groupedAttributes.set(attributeId, group);
  }

  for (const attribute of groupedAttributes.values()) {
    attribute.values.sort((left, right) => {
        const leftOrder = optionOrderByPtavId.get(left.id);
        const rightOrder = optionOrderByPtavId.get(right.id);
        const leftSequence = leftOrder?.sequence;
        const rightSequence = rightOrder?.sequence;

        if (leftSequence !== undefined && rightSequence !== undefined) {
          return (
            leftSequence - rightSequence ||
            (leftOrder?.index ?? 0) - (rightOrder?.index ?? 0) ||
            left.id - right.id
          );
        }

        if (leftSequence !== undefined) {
          return -1;
        }

        if (rightSequence !== undefined) {
          return 1;
        }

        return (
          (leftOrder?.index ?? 0) - (rightOrder?.index ?? 0) ||
          left.id - right.id
        );
    });
  }

  const sortedAttributes = Array.from(groupedAttributes.values()).sort(
    (left, right) => {
      const leftOrder = attributeLineOrder.get(left.id);
      const rightOrder = attributeLineOrder.get(right.id);

      if (leftOrder && rightOrder) {
        return (
          leftOrder.sequence - rightOrder.sequence ||
          leftOrder.index - rightOrder.index ||
          left.id - right.id
        );
      }

      if (leftOrder) {
        return -1;
      }

      if (rightOrder) {
        return 1;
      }

      return attributeIds.indexOf(left.id) - attributeIds.indexOf(right.id);
    },
  );

  const selectedValueIds: Record<string, number[]> = {};

  for (const attribute of sortedAttributes) {
    selectedValueIds[String(attribute.id)] =
      resolveSelectedIdsForAttributeValues(
        attribute.values,
        lineValueIds,
        productValueIds,
      );
  }

  const exclusions = ptavs.flatMap((ptav) => {
    const excludedIds = normalizeManyIds(ptav.excluded_value_ids);

    if (excludedIds.length === 0) {
      return [];
    }

    return excludedIds.map((excludedValueId) => ({
      sourceValueId: ptav.id,
      excludedValueId,
    }));
  });
  const selectedValueIdsWithDefaults = applyFirstOptionDefaults(
    sortedAttributes,
    selectedValueIds,
    exclusions,
  );
  const existingLogoAttachments = buildExistingLogoAttachments(
    line,
    sortedAttributes,
    selectedValueIdsWithDefaults,
  );

  const latestDesignAttachment = await loadLatestDesignAttachment(
    env,
    saleOrderLineId,
  );
  const canEdit = order.state === "draft" || order.state === "sent";
  const pinnedVisualDefinitionIds = options.visualDefinitionIdsOverride
    ? undefined
    : resolvePinnedVisualDefinitionIds({
        hasAttachment: latestDesignAttachment.hasAttachment,
        canEdit,
        visualDefinitionVersionIds:
          latestDesignAttachment.visualDefinitionVersionIds,
      });
  const visualRelease =
    pinnedVisualDefinitionIds === undefined
      ? options.visualReleaseId
        ? await getVisualRelease(env, options.visualReleaseId)
        : options.pinActiveVisualRelease === false
          ? null
          : await getOrCreateLineVisualRelease(env, saleOrderLineId)
      : null;
  const releaseDefinitionIds =
    options.visualDefinitionIdsOverride ?? visualRelease?.definitionIds;
  const requiresPinnedVisualCatalog =
    (pinnedVisualDefinitionIds?.length ?? 0) > 0 ||
    (releaseDefinitionIds?.length ?? 0) > 0;
  const visualCatalogWarnings: string[] = [];
  const visualDefinitions = await loadActiveVisualDefinitions(
    env,
    productTemplateId,
    pinnedVisualDefinitionIds,
    releaseDefinitionIds,
  ).catch((error) => {
    if (requiresPinnedVisualCatalog) {
      throw new Error(
        error instanceof Error
          ? `No se pudo cargar la version visual fijada: ${error.message}`
          : "No se pudo cargar la version visual fijada.",
      );
    }

    visualCatalogWarnings.push(
      error instanceof Error
        ? `No se pudo cargar el catalogo visual: ${error.message}`
        : "No se pudo cargar el catalogo visual.",
    );
    return [];
  });

  return {
    saleOrderLineId,
    saleOrderId: order.id,
    orderName: order.name,
    productId: product.id,
    productTemplateId,
    productName,
    graphicManifestKey: normalizeGraphicManifestKey(productName),
    attributes: sortedAttributes,
    selectedValueIds: selectedValueIdsWithDefaults,
    customValuesByValueId,
    exclusions,
    visualDefinitions,
    visualReleaseId: visualRelease?.id ?? options.visualReleaseId ?? null,
    visualReleaseNumber: visualRelease?.number ?? null,
    status: {
      orderState: order.state,
      canEdit,
      isLocked: false,
      version: latestDesignAttachment.version,
      generatedAt: latestDesignAttachment.generatedAt,
    },
    existingDesignBase64:
      typeof line.x_product_design_image === "string"
        ? line.x_product_design_image
        : null,
    existingLogoAttachments,
    warnings: [
      ...ptavWarnings,
      ...attributeValueWarnings,
      ...visualCatalogWarnings,
    ],
  };
}
