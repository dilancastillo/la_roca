import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";

function cloneSelectedValueIds(selectedValueIds: Record<string, number[]>) {
  return Object.fromEntries(
    Object.entries(selectedValueIds).map(([attributeId, valueIds]) => [
      attributeId,
      [...valueIds],
    ]),
  );
}

function buildValueAttributeMap(session: ConfiguratorSession) {
  const valueAttributeMap = new Map<number, number>();

  for (const attribute of session.attributes) {
    for (const value of attribute.values) {
      valueAttributeMap.set(value.id, attribute.id);
    }
  }

  return valueAttributeMap;
}

function selectedSet(selectedValueIds: Record<string, number[]>) {
  return new Set(Object.values(selectedValueIds).flatMap((valueIds) => valueIds));
}

function removeSelectedValue(
  selectedValueIds: Record<string, number[]>,
  valueId: number,
  valueAttributeMap: Map<number, number>,
) {
  const attributeId = valueAttributeMap.get(valueId);

  if (attributeId !== undefined) {
    const key = String(attributeId);
    selectedValueIds[key] = (selectedValueIds[key] ?? []).filter(
      (selectedValueId) => selectedValueId !== valueId,
    );
    return;
  }

  for (const key of Object.keys(selectedValueIds)) {
    selectedValueIds[key] = (selectedValueIds[key] ?? []).filter(
      (selectedValueId) => selectedValueId !== valueId,
    );
  }
}

export function sanitizeSelectedValueIdsForExclusions(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
  preferredValueId?: number,
) {
  const nextSelectedValueIds = cloneSelectedValueIds(selectedValueIds);
  const valueAttributeMap = buildValueAttributeMap(session);

  if (preferredValueId !== undefined) {
    const selected = selectedSet(nextSelectedValueIds);

    for (const rule of session.exclusions) {
      if (
        rule.excludedValueId === preferredValueId &&
        selected.has(rule.sourceValueId) &&
        rule.sourceValueId !== preferredValueId
      ) {
        removeSelectedValue(
          nextSelectedValueIds,
          rule.sourceValueId,
          valueAttributeMap,
        );
      }
    }
  }

  let changed = true;
  while (changed) {
    changed = false;
    const selected = selectedSet(nextSelectedValueIds);

    for (const rule of session.exclusions) {
      if (
        selected.has(rule.sourceValueId) &&
        selected.has(rule.excludedValueId) &&
        rule.excludedValueId !== preferredValueId
      ) {
        removeSelectedValue(
          nextSelectedValueIds,
          rule.excludedValueId,
          valueAttributeMap,
        );
        changed = true;
      }
    }
  }

  return nextSelectedValueIds;
}
