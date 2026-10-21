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

function conflictsWithCurrentSelection(
  valueId: number,
  selected: Set<number>,
  exclusions: ConfiguratorSession["exclusions"],
) {
  return exclusions.some(
    (rule) =>
      (rule.sourceValueId === valueId && selected.has(rule.excludedValueId)) ||
      (rule.excludedValueId === valueId && selected.has(rule.sourceValueId)),
  );
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function isNeckModelAttribute(attributeName: string) {
  return normalizeText(attributeName).includes("modelo de cuello");
}

function isEmptyNeckOption(optionName: string) {
  return ["sin seleccion", "ninguno"].includes(normalizeText(optionName));
}

/**
 * Odoo puede entregar atributos simples sin valor cuando la línea todavía no
 * ha materializado una variante. Para que el configurador nunca quede
 * bloqueado, se elige la primera opción compatible en el orden recibido de
 * Odoo. Los campos múltiples siguen vacíos: logos y secciones de vivo son
 * decisiones opcionales, no valores por defecto.
 */
export function applyFirstOptionDefaults(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const nextSelectedValueIds = cloneSelectedValueIds(selectedValueIds);

  for (const attribute of session.attributes) {
    const key = String(attribute.id);

    if (
      attribute.selectionMode === "multiple" ||
      (nextSelectedValueIds[key]?.length ?? 0) > 0
    ) {
      continue;
    }

    const selected = selectedSet(nextSelectedValueIds);
    const candidateValues = isNeckModelAttribute(attribute.name)
      ? attribute.values.filter((value) => !isEmptyNeckOption(value.name))
      : attribute.values;
    const firstCompatibleOption = candidateValues.find(
      (value) =>
        !conflictsWithCurrentSelection(value.id, selected, session.exclusions),
    );

    if (firstCompatibleOption) {
      nextSelectedValueIds[key] = [firstCompatibleOption.id];
    }
  }

  return nextSelectedValueIds;
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
