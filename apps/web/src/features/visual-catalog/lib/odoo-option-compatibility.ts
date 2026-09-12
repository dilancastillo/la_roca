import type {
  VisualCatalogOdooAttribute,
  VisualCatalogProduct,
  VisualSlot,
} from "@repo/shared/schemas/visual-catalog";

export type VisualCatalogSourceBinding = {
  attributeId: number;
  sourceValueId: number;
};

export type VisualCatalogSourceSelection = {
  attributeId: number;
  sourceValueIds: number[];
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

function hasCompatibleSelection(
  product: VisualCatalogProduct,
  selections: VisualCatalogSourceSelection[],
) {
  const valueGroups = selections.map((selection) => {
    const attribute = product.attributes.find(
      (candidate) => candidate.id === selection.attributeId,
    );

    return selection.sourceValueIds
      .map((sourceValueId) =>
        attribute?.values.find(
          (candidate) => candidate.sourceValueId === sourceValueId,
        ),
      )
      .filter((value) => value !== undefined);
  });

  if (valueGroups.some((group) => group.length === 0)) {
    return false;
  }

  const selectedValues: Array<(typeof valueGroups)[number][number]> = [];

  function visit(groupIndex: number): boolean {
    if (groupIndex >= valueGroups.length) {
      return true;
    }

    return (valueGroups[groupIndex] ?? []).some((value) => {
      const isExcluded = selectedValues.some(
        (selectedValue) =>
          selectedValue.excludedValueIds.includes(value.id) ||
          value.excludedValueIds.includes(selectedValue.id),
      );

      if (isExcluded) {
        return false;
      }

      selectedValues.push(value);
      const compatible = visit(groupIndex + 1);
      selectedValues.pop();
      return compatible;
    });
  }

  return visit(0);
}

function addCandidateToSelections(
  selections: VisualCatalogSourceSelection[],
  candidate: VisualCatalogSourceBinding,
) {
  const selectionsForOtherAttributes = selections.filter(
    (selection) => selection.attributeId !== candidate.attributeId,
  );
  const selectionsForCandidateAttribute = selections.filter(
    (selection) => selection.attributeId === candidate.attributeId,
  );

  if (
    selectionsForCandidateAttribute.some(
      (selection) =>
        !selection.sourceValueIds.includes(candidate.sourceValueId),
    )
  ) {
    return null;
  }

  return [
    ...selectionsForOtherAttributes,
    {
      attributeId: candidate.attributeId,
      sourceValueIds: [candidate.sourceValueId],
    },
  ];
}

export function getCompatibleVisualCatalogAttributes(
  products: VisualCatalogProduct[],
  attributes: VisualCatalogOdooAttribute[],
  selections: VisualCatalogSourceSelection[],
) {
  if (selections.length === 0) {
    return attributes;
  }

  return attributes
    .map((attribute) => ({
      ...attribute,
      values: attribute.values.filter((value) => {
        const selectionsWithCandidate = addCandidateToSelections(selections, {
          attributeId: attribute.id,
          sourceValueId: value.sourceValueId,
        });

        return (
          selectionsWithCandidate !== null &&
          (() => {
            const applicableProducts = products.filter((product) =>
              selectionsWithCandidate.every((selection) => {
                const productAttribute = product.attributes.find(
                  (candidate) => candidate.id === selection.attributeId,
                );

                return selection.sourceValueIds.some((sourceValueId) =>
                  productAttribute?.values.some(
                    (candidate) =>
                      candidate.sourceValueId === sourceValueId,
                  ),
                );
              }),
            );

            return (
              applicableProducts.length > 0 &&
              applicableProducts.every((product) =>
                hasCompatibleSelection(product, selectionsWithCandidate),
              )
            );
          })()
        );
      }),
    }))
    .filter((attribute) => attribute.values.length > 0);
}
