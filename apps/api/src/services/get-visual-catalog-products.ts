import {
  visualCatalogProductListSchema,
  type VisualActivationCondition,
  type VisualCatalogProduct,
  type VisualCatalogProductFamily,
  type VisualDefinitionMutation,
  type VisualDefinitionSummary,
} from "@repo/shared/schemas/visual-catalog";
import type { OdooEnv } from "../lib/app-env.js";
import { odooRead, odooSearchRead } from "../lib/odoo-client.js";

type Many2one = [number, string] | false;

type ProductTemplateRecord = {
  id: number;
  name: string;
};

type ProductTemplateAttributeValueRecord = {
  id: number;
  name: string;
  sequence?: number;
  attribute_id: Many2one;
  product_attribute_value_id: Many2one;
  product_tmpl_id: Many2one;
  excluded_value_ids?: number[];
};

type ProductAttributeRecord = {
  id: number;
  name: string;
};

type ProductAttributeValueRecord = {
  id: number;
  name: string;
  sequence?: number;
};

type ProductTemplateAttributeLineRecord = {
  id: number;
  product_tmpl_id: Many2one;
  attribute_id: Many2one;
  sequence?: number;
};

type VisualDefinitionOdooTarget = Pick<
  VisualDefinitionMutation | VisualDefinitionSummary,
  "slot" | "binding" | "activationConditions" | "elementPaints"
>;

const PRODUCT_CACHE_TTL_MS = 60_000;
const productCache = new Map<
  string,
  {
    expiresAt: number;
    promise: Promise<ReturnType<typeof visualCatalogProductListSchema.parse>>;
  }
>();

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function toMany2oneId(value: Many2one) {
  return Array.isArray(value) && typeof value[0] === "number"
    ? value[0]
    : undefined;
}

function normalizeManyIds(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is number => typeof item === "number")
    : [];
}

function getProductFamily(name: string): VisualCatalogProductFamily | null {
  const normalized = normalize(name);

  if (normalized === "uniforme") {
    return "uniform";
  }

  if (normalized === "pantalon") {
    return "pants";
  }

  if (normalized === "blusa") {
    return "blouse";
  }

  return null;
}

function getCacheKey(env: OdooEnv) {
  return `${env.ODOO_BASE_URL ?? ""}|${env.ODOO_DB ?? ""}`;
}

async function loadPtavs(
  env: OdooEnv,
  productTemplateIds: number[],
) {
  const warnings: string[] = [];
  const baseFields = [
    "id",
    "name",
    "attribute_id",
    "product_attribute_value_id",
    "product_tmpl_id",
  ];
  let optionalFields = ["sequence", "excluded_value_ids"];

  while (true) {
    try {
      return {
        ptavs: await odooSearchRead<ProductTemplateAttributeValueRecord>(
          env,
          "product.template.attribute.value",
          [
            ["product_tmpl_id", "in", productTemplateIds],
            ["ptav_active", "=", true],
          ],
          [...baseFields, ...optionalFields],
          optionalFields.includes("sequence")
            ? "product_tmpl_id, attribute_id, sequence, id"
            : "product_tmpl_id, attribute_id, id",
        ),
        warnings,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const missingField = optionalFields.find((field) =>
        message.includes(field),
      );

      if (!missingField) {
        throw error;
      }

      optionalFields = optionalFields.filter(
        (field) => field !== missingField,
      );

      if (missingField === "excluded_value_ids") {
        warnings.push(
          "Odoo no devolvio excluded_value_ids; el catalogo no puede mostrar exclusiones.",
        );
      }

      if (missingField === "sequence") {
        warnings.push(
          "Odoo no devolvio la secuencia PTAV; se uso el orden del valor fuente.",
        );
      }
    }
  }
}

export function mapVisualCatalogProducts({
  templates,
  ptavs,
  attributes,
  sourceValues,
  attributeLines,
  sharedWarnings = [],
}: {
  templates: ProductTemplateRecord[];
  ptavs: ProductTemplateAttributeValueRecord[];
  attributes: ProductAttributeRecord[];
  sourceValues: ProductAttributeValueRecord[];
  attributeLines: ProductTemplateAttributeLineRecord[];
  sharedWarnings?: string[];
}): VisualCatalogProduct[] {
  const attributeMap = new Map(
    attributes.map((attribute) => [attribute.id, attribute]),
  );
  const sourceValueMap = new Map(
    sourceValues.map((value) => [value.id, value]),
  );
  const linesByTemplate = new Map<
    number,
    Map<number, { sequence: number; index: number }>
  >();

  attributeLines.forEach((line, index) => {
    const productTemplateId = toMany2oneId(line.product_tmpl_id);
    const attributeId = toMany2oneId(line.attribute_id);

    if (!productTemplateId || !attributeId) {
      return;
    }

    const templateLines =
      linesByTemplate.get(productTemplateId) ??
      new Map<number, { sequence: number; index: number }>();
    templateLines.set(attributeId, {
      sequence:
        typeof line.sequence === "number" ? line.sequence : Number.MAX_SAFE_INTEGER,
      index,
    });
    linesByTemplate.set(productTemplateId, templateLines);
  });

  const familyOrder: Record<VisualCatalogProductFamily, number> = {
    blouse: 0,
    pants: 1,
    uniform: 2,
  };

  return templates
    .map((template) => {
      const family = getProductFamily(template.name);

      if (!family) {
        return null;
      }

      const templatePtavs = ptavs.filter(
        (ptav) => toMany2oneId(ptav.product_tmpl_id) === template.id,
      );
      const grouped = new Map<
        number,
        VisualCatalogProduct["attributes"][number]
      >();
      const optionOrders = new Map<
        number,
        { sequence: number; index: number }
      >();

      templatePtavs.forEach((ptav, index) => {
        const attributeId = toMany2oneId(ptav.attribute_id);
        const sourceValueId = toMany2oneId(ptav.product_attribute_value_id);

        if (!attributeId || !sourceValueId) {
          return;
        }

        const attribute = attributeMap.get(attributeId);
        const sourceValue = sourceValueMap.get(sourceValueId);
        const lineOrder = linesByTemplate.get(template.id)?.get(attributeId);
        const group =
          grouped.get(attributeId) ??
          {
            id: attributeId,
            name:
              attribute?.name ??
              (Array.isArray(ptav.attribute_id)
                ? ptav.attribute_id[1]
                : `Atributo ${attributeId}`),
            sequence:
              lineOrder?.sequence ??
              Number.MAX_SAFE_INTEGER,
            values: [],
          };

        group.values.push({
          id: ptav.id,
          sourceValueId,
          name: sourceValue?.name ?? ptav.name,
          sequence:
            typeof ptav.sequence === "number"
              ? ptav.sequence
              : typeof sourceValue?.sequence === "number"
                ? sourceValue.sequence
                : Number.MAX_SAFE_INTEGER,
          excludedValueIds: normalizeManyIds(ptav.excluded_value_ids),
        });
        optionOrders.set(ptav.id, {
          sequence:
            typeof ptav.sequence === "number"
              ? ptav.sequence
              : typeof sourceValue?.sequence === "number"
                ? sourceValue.sequence
                : Number.MAX_SAFE_INTEGER,
          index,
        });
        grouped.set(attributeId, group);
      });

      const productAttributes = [...grouped.values()]
        .map((attribute) => ({
          ...attribute,
          values: [...attribute.values].sort((left, right) => {
            const leftOrder = optionOrders.get(left.id);
            const rightOrder = optionOrders.get(right.id);
            return (
              (leftOrder?.sequence ?? Number.MAX_SAFE_INTEGER) -
                (rightOrder?.sequence ?? Number.MAX_SAFE_INTEGER) ||
              (leftOrder?.index ?? 0) - (rightOrder?.index ?? 0) ||
              left.id - right.id
            );
          }),
        }))
        .sort((left, right) => {
          const leftOrder = linesByTemplate.get(template.id)?.get(left.id);
          const rightOrder = linesByTemplate.get(template.id)?.get(right.id);
          return (
            (leftOrder?.sequence ?? Number.MAX_SAFE_INTEGER) -
              (rightOrder?.sequence ?? Number.MAX_SAFE_INTEGER) ||
            (leftOrder?.index ?? 0) - (rightOrder?.index ?? 0) ||
            left.id - right.id
          );
        });

      return {
        id: template.id,
        name: template.name,
        family,
        attributes: productAttributes,
        warnings: [
          ...sharedWarnings,
          ...(productAttributes.length === 0
            ? ["La plantilla no tiene valores de atributo activos en Odoo."]
            : []),
        ],
      };
    })
    .filter((product): product is VisualCatalogProduct => product !== null)
    .sort(
      (left, right) =>
        familyOrder[left.family] - familyOrder[right.family] ||
        left.name.localeCompare(right.name, "es") ||
        left.id - right.id,
    );
}

async function loadVisualCatalogProducts(env: OdooEnv) {
  const templates = (
    await odooSearchRead<ProductTemplateRecord>(
      env,
      "product.template",
      [
        ["active", "=", true],
        ["sale_ok", "=", true],
      ],
      ["id", "name"],
      "name, id",
      { limit: 1_000 },
    )
  ).filter((template) => getProductFamily(template.name) !== null);

  if (templates.length === 0) {
    return visualCatalogProductListSchema.parse({
      products: [],
      refreshedAt: new Date().toISOString(),
    });
  }

  const productTemplateIds = templates.map((template) => template.id);
  const { ptavs, warnings } = await loadPtavs(env, productTemplateIds);
  const attributeIds = Array.from(
    new Set(
      ptavs
        .map((ptav) => toMany2oneId(ptav.attribute_id))
        .filter((id): id is number => id !== undefined),
    ),
  );
  const sourceValueIds = Array.from(
    new Set(
      ptavs
        .map((ptav) => toMany2oneId(ptav.product_attribute_value_id))
        .filter((id): id is number => id !== undefined),
    ),
  );

  const [attributes, sourceValues, attributeLines] = await Promise.all([
    attributeIds.length > 0
      ? odooRead<ProductAttributeRecord>(
          env,
          "product.attribute",
          attributeIds,
          ["id", "name"],
        )
      : Promise.resolve([]),
    sourceValueIds.length > 0
      ? odooRead<ProductAttributeValueRecord>(
          env,
          "product.attribute.value",
          sourceValueIds,
          ["id", "name", "sequence"],
        )
      : Promise.resolve([]),
    odooSearchRead<ProductTemplateAttributeLineRecord>(
      env,
      "product.template.attribute.line",
      [["product_tmpl_id", "in", productTemplateIds]],
      ["id", "product_tmpl_id", "attribute_id", "sequence"],
      "product_tmpl_id, sequence, id",
    ),
  ]);

  return visualCatalogProductListSchema.parse({
    products: mapVisualCatalogProducts({
      templates,
      ptavs,
      attributes,
      sourceValues,
      attributeLines,
      sharedWarnings: warnings,
    }),
    refreshedAt: new Date().toISOString(),
  });
}

export async function getVisualCatalogProducts(
  env: OdooEnv,
  options: { forceRefresh?: boolean } = {},
) {
  const key = getCacheKey(env);
  const cached = productCache.get(key);

  if (
    !options.forceRefresh &&
    cached &&
    cached.expiresAt > Date.now()
  ) {
    return await cached.promise;
  }

  const promise = loadVisualCatalogProducts(env).catch((error) => {
    productCache.delete(key);
    throw error;
  });
  productCache.set(key, {
    expiresAt: Date.now() + PRODUCT_CACHE_TTL_MS,
    promise,
  });

  return await promise;
}

function hasConditionValue(
  product: VisualCatalogProduct,
  condition: VisualActivationCondition,
) {
  const attribute = product.attributes.find(
    (candidate) => candidate.id === condition.attributeId,
  );

  return (
    attribute &&
    condition.sourceValueIds.every((sourceValueId) =>
      attribute.values.some(
        (candidate) => candidate.sourceValueId === sourceValueId,
      ),
    )
  );
}

function getSlotFamilies(slot: VisualDefinitionOdooTarget["slot"]) {
  return slot === "boot"
    ? new Set<VisualCatalogProductFamily>(["pants", "uniform"])
    : new Set<VisualCatalogProductFamily>(["blouse", "uniform"]);
}

function findProductValueBySourceId(
  product: VisualCatalogProduct,
  sourceValueId: number,
) {
  return product.attributes
    .flatMap((attribute) => attribute.values)
    .find((value) => value.sourceValueId === sourceValueId);
}

function areSourceValuesExcluded(
  product: VisualCatalogProduct,
  leftSourceValueId: number,
  rightSourceValueId: number,
) {
  const left = findProductValueBySourceId(product, leftSourceValueId);
  const right = findProductValueBySourceId(product, rightSourceValueId);

  if (!left || !right) {
    return false;
  }

  return (
    left.excludedValueIds.includes(right.id) ||
    right.excludedValueIds.includes(left.id)
  );
}

function hasPossibleOdooCombination(
  product: VisualCatalogProduct,
  sourceValueGroups: number[][],
) {
  const selected: number[] = [];

  function visit(groupIndex: number): boolean {
    if (groupIndex >= sourceValueGroups.length) {
      return true;
    }

    const group = sourceValueGroups[groupIndex] ?? [];

    return group.some((sourceValueId) => {
      if (
        selected.some((selectedSourceValueId) =>
          areSourceValuesExcluded(
            product,
            selectedSourceValueId,
            sourceValueId,
          ),
        )
      ) {
        return false;
      }

      selected.push(sourceValueId);
      const isPossible = visit(groupIndex + 1);
      selected.pop();
      return isPossible;
    });
  }

  return visit(0);
}

export function getVisualDefinitionOdooIssues(
  definition: VisualDefinitionOdooTarget,
  products: VisualCatalogProduct[],
) {
  const issues: string[] = [];
  const productsById = new Map(products.map((product) => [product.id, product]));
  const allowedFamilies = getSlotFamilies(definition.slot);
  const trimSourceValueIds = Array.from(
    new Set(
      Object.values(definition.elementPaints)
        .map((paint) => paint.trimSourceValueId)
        .filter((value): value is number => value !== undefined),
    ),
  );
  const elementConditions = Object.values(definition.elementPaints).flatMap(
    (paint) => paint.visibilityConditions,
  );

  for (const productTemplateId of definition.binding.productTemplateIds) {
    const product = productsById.get(productTemplateId);

    if (!product) {
      issues.push(
        `La plantilla ${productTemplateId} ya no esta activa o no pertenece al catalogo visual.`,
      );
      continue;
    }

    if (!allowedFamilies.has(product.family)) {
      issues.push(
        `${product.name} no admite componentes del tipo ${definition.slot}.`,
      );
    }

    const bindingAttribute = product.attributes.find(
      (attribute) => attribute.id === definition.binding.attributeId,
    );
    const hasBindingValue = definition.binding.sourceValueId
      ? bindingAttribute?.values.some(
          (value) =>
            value.sourceValueId === definition.binding.sourceValueId,
        )
      : bindingAttribute?.values.some(
          (value) => value.id === definition.binding.valueId,
        );

    if (!bindingAttribute || !hasBindingValue) {
      issues.push(
        `${product.name} ya no contiene ${definition.binding.attributeName}: ${definition.binding.valueName}.`,
      );
    }

    const bindingSourceValueId =
      definition.binding.sourceValueId ??
      bindingAttribute?.values.find(
        (value) => value.id === definition.binding.valueId,
      )?.sourceValueId;

    for (const condition of [
      ...definition.activationConditions,
      ...elementConditions,
    ]) {
      if (!hasConditionValue(product, condition)) {
        issues.push(
          `${product.name} no contiene todos los valores de la condicion ${condition.attributeName}.`,
        );
      }
    }

    if (bindingSourceValueId) {
      const baseGroups = [
        [bindingSourceValueId],
        ...definition.activationConditions.map(
          (condition) => condition.sourceValueIds,
        ),
      ];

      if (!hasPossibleOdooCombination(product, baseGroups)) {
        issues.push(
          `${product.name} excluye todas las combinaciones posibles de las reglas generales.`,
        );
      }

      for (const [elementId, paint] of Object.entries(
        definition.elementPaints,
      )) {
        if (
          paint.visibilityConditions.length > 0 &&
          !hasPossibleOdooCombination(product, [
            ...baseGroups,
            ...paint.visibilityConditions.map(
              (condition) => condition.sourceValueIds,
            ),
          ])
        ) {
          issues.push(
            `${product.name} excluye todas las combinaciones de visibilidad del elemento ${elementId}.`,
          );
        }
      }
    }

    for (const trimSourceValueId of trimSourceValueIds) {
      const hasTrimValue = product.attributes.some((attribute) =>
        attribute.values.some(
          (value) => value.sourceValueId === trimSourceValueId,
        ),
      );

      if (!hasTrimValue) {
        issues.push(
          `${product.name} no contiene el vivo con ID fuente ${trimSourceValueId}.`,
        );
      }
    }
  }

  return Array.from(new Set(issues));
}

export async function assertVisualDefinitionMatchesOdoo(
  env: OdooEnv,
  definition: VisualDefinitionOdooTarget,
) {
  const { products } = await getVisualCatalogProducts(env);
  const issues = getVisualDefinitionOdooIssues(definition, products);

  if (issues.length > 0) {
    throw new Error(
      `La vinculacion con Odoo no es valida: ${issues.join(" ")}`,
    );
  }
}
