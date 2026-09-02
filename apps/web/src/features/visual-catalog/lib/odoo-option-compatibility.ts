import { getTrimSectionKeyBySourceValueId } from "@repo/shared/configurator-id-rules";
import type {
  VisualCatalogOdooAttribute,
  VisualCatalogOdooValue,
  VisualCatalogProduct,
  VisualSlot,
} from "@repo/shared/schemas/visual-catalog";

export type VisualCatalogSourceBinding = {
  attributeId: number;
  sourceValueId: number;
};

const BINDING_ATTRIBUTE_IDS: Record<VisualSlot, readonly number[]> = {
  neck: [63, 145],
  lower_pocket: [70, 154],
  boot: [84, 160],
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function findProductValue(
  product: VisualCatalogProduct,
  binding: VisualCatalogSourceBinding,
) {
  return product.attributes
    .find((attribute) => attribute.id === binding.attributeId)
    ?.values.find(
      (value) => value.sourceValueId === binding.sourceValueId,
    );
}

export function isBindingAttributeInVisualSlot(
  slot: VisualSlot,
  attribute: VisualCatalogOdooAttribute,
) {
  if (BINDING_ATTRIBUTE_IDS[slot].includes(attribute.id)) {
    return true;
  }

  const name = normalize(attribute.name);

  if (slot === "neck") {
    return name.includes("cuello") && name.includes("modelo");
  }

  if (slot === "lower_pocket") {
    return (
      name.includes("bolsillo inferior") &&
      (name.includes("modelo") || name.includes("otro nombre"))
    );
  }

  return (
    name.includes("bota") &&
    (name.includes("tipo") || name.includes("modelo"))
  );
}

/**
 * Las exclusiones de Odoo describen una incompatibilidad entre dos PTAV. La
 * relación puede estar guardada en cualquiera de los dos valores, por lo que
 * siempre debe evaluarse en ambos sentidos.
 */
export function areVisualCatalogValuesCompatible(
  products: VisualCatalogProduct[],
  left: VisualCatalogSourceBinding,
  right: VisualCatalogSourceBinding,
) {
  return products.every((product) => {
    const leftValue = findProductValue(product, left);
    const rightValue = findProductValue(product, right);

    if (!leftValue || !rightValue) {
      return true;
    }

    return !(
      leftValue.excludedValueIds.includes(rightValue.id) ||
      rightValue.excludedValueIds.includes(leftValue.id)
    );
  });
}

export function getCompatibleVisualCatalogAttributes(
  products: VisualCatalogProduct[],
  attributes: VisualCatalogOdooAttribute[],
  binding: VisualCatalogSourceBinding | null,
) {
  if (!binding) {
    return attributes;
  }

  return attributes
    .map((attribute) => ({
      ...attribute,
      values: attribute.values.filter((value) =>
        attribute.id === binding.attributeId
          ? value.sourceValueId === binding.sourceValueId
          : areVisualCatalogValuesCompatible(products, binding, {
              attributeId: attribute.id,
              sourceValueId: value.sourceValueId,
            }),
      ),
    }))
    .filter((attribute) => attribute.values.length > 0);
}

function getTrimSemanticName(value: VisualCatalogOdooValue) {
  return normalize(
    getTrimSectionKeyBySourceValueId(value.sourceValueId) ?? value.name,
  );
}

/**
 * El atributo "Sección de vivo" es compartido por toda la prenda. El slot del
 * editor acota la parte que se está modelando antes de aplicar las exclusiones
 * concretas de Odoo.
 */
export function isTrimValueInVisualSlot(
  slot: VisualSlot,
  value: VisualCatalogOdooValue,
) {
  const name = getTrimSemanticName(value);

  if (name.includes("sin vivo")) {
    return false;
  }

  if (slot === "neck") {
    return (
      name.includes("cuello") ||
      name.includes("cogotera") ||
      (name.includes("aleta") && !name.includes("bolsillo")) ||
      name.includes("presilla")
    );
  }

  if (slot === "lower_pocket") {
    return (
      name.includes("bolsillo inferior") ||
      name.includes("bolsillos inferiores") ||
      name.includes("bolsillo auxiliar") ||
      name.includes("aro inferior") ||
      name.includes("bolsillo de chef") ||
      name === "aros" ||
      name === "costura" ||
      name === "cremallera"
    );
  }

  return (
    name.includes("pantalon") ||
    name.includes("bota") ||
    name.includes("rodilla") ||
    name.includes("parche") ||
    name.includes("trasero") ||
    name.includes("pretina") ||
    name.includes("cinturilla")
  );
}
