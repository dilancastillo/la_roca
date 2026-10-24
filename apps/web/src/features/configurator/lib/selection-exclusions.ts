import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import {
  getPantsKneePatchModelBySourceValueId,
  getPantsKneePatchTypeBySourceValueId,
  isPantsKneePatchTypeAllowedForModel,
  PANTS_KNEE_PATCH_ATTRIBUTE_IDS,
} from "@repo/shared/pants-knee-patch-rules";

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

function isPantsSizeAttribute(attribute: ConfiguratorSession["attributes"][number]) {
  const name = normalizeText(attribute.name);
  return name.includes("talla") && name.includes("pantalon");
}

function isNeckModelAttribute(attribute: ConfiguratorSession["attributes"][number]) {
  const name = normalizeText(attribute.name);
  return name.includes("modelo") && name.includes("cuello");
}

function isExplicitNoneOption(optionName: string) {
  const name = normalizeText(optionName);
  return name === "ninguno" || name === "ninguna" || name.includes("no aplica");
}

function isPlaceholderOption(
  attribute: ConfiguratorSession["attributes"][number],
  optionName: string,
) {
  // Para Talla pantalón, Odoo usa literalmente "Sin selección" como una
  // variante comercial válida. No es el placeholder genérico que se debe
  // sustituir en otros atributos simples.
  if (isPantsSizeAttribute(attribute) && normalizeText(optionName) === "sin seleccion") {
    return false;
  }

  return ["sin seleccion", "seleccione"].includes(normalizeText(optionName));
}

function getKneePatchModelForTypeAttribute(
  session: ConfiguratorSession,
  attributeId: number,
  selectedValueIds: Record<string, number[]>,
) {
  const modelAttributeId = attributeId === PANTS_KNEE_PATCH_ATTRIBUTE_IDS.rightType
    ? PANTS_KNEE_PATCH_ATTRIBUTE_IDS.rightModel
    : attributeId === PANTS_KNEE_PATCH_ATTRIBUTE_IDS.leftType
      ? PANTS_KNEE_PATCH_ATTRIBUTE_IDS.leftModel
      : undefined;
  const modelAttribute = session.attributes.find(
    (attribute) => attribute.id === modelAttributeId,
  );
  const selectedModelIds = modelAttribute
    ? selectedValueIds[String(modelAttribute.id)] ?? []
    : [];

  return modelAttribute?.values
    .find((value) => selectedModelIds.includes(value.id))
    ?.sourceValueId;
}

/** Removes a knee-pocket finish that does not belong to its selected model. */
export function sanitizePantsKneePatchTypeSelections(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const nextSelectedValueIds = cloneSelectedValueIds(selectedValueIds);

  for (const typeAttributeId of [
    PANTS_KNEE_PATCH_ATTRIBUTE_IDS.rightType,
    PANTS_KNEE_PATCH_ATTRIBUTE_IDS.leftType,
  ]) {
    const typeAttribute = session.attributes.find(
      (attribute) => attribute.id === typeAttributeId,
    );
    const model = getPantsKneePatchModelBySourceValueId(
      getKneePatchModelForTypeAttribute(session, typeAttributeId, nextSelectedValueIds),
    );

    if (!typeAttribute || !model) {
      continue;
    }

    const key = String(typeAttribute.id);
    nextSelectedValueIds[key] = (nextSelectedValueIds[key] ?? []).filter((valueId) => {
      const type = getPantsKneePatchTypeBySourceValueId(
        typeAttribute.values.find((value) => value.id === valueId)?.sourceValueId,
      );
      return isPantsKneePatchTypeAllowedForModel(model, type);
    });
  }

  return nextSelectedValueIds;
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

    if (attribute.selectionMode === "multiple") {
      continue;
    }

    const selectedValueIds = nextSelectedValueIds[key] ?? [];
    const selectedValues = attribute.values.filter((value) =>
      selectedValueIds.includes(value.id),
    );
    const hasOnlyPlaceholderSelection =
      selectedValues.length > 0 &&
      selectedValues.every((value) => isPlaceholderOption(attribute, value.name));

    if (selectedValueIds.length > 0 && !hasOnlyPlaceholderSelection) {
      continue;
    }

    const selected = selectedSet(nextSelectedValueIds);
    const meaningfulValues = attribute.values.filter(
      (value) => !isPlaceholderOption(attribute, value.name),
    );
    // "Ninguno" es una selección explícita y válida. En cambio, "Sin
    // selección" es el placeholder que Odoo puede devolver después de una
    // exclusión por género y nunca debe bloquear el avance de un campo simple.
    const candidateValues = meaningfulValues.length > 0
      ? meaningfulValues
      : attribute.values;
    const kneePatchModel = getPantsKneePatchModelBySourceValueId(
      getKneePatchModelForTypeAttribute(session, attribute.id, nextSelectedValueIds),
    );
    const compatibleCandidateValues = kneePatchModel
      ? candidateValues.filter((value) =>
          isPantsKneePatchTypeAllowedForModel(
            kneePatchModel,
            getPantsKneePatchTypeBySourceValueId(value.sourceValueId),
          ),
        )
      : candidateValues;
    // Al cambiar Mujer → Hombre Odoo puede excluir el cuello femenino y
    // dejar el atributo vacío. Para cuello, "Ninguno" es la alternativa
    // segura y explícita: evita que el render reutilice un detalle residual
    // mientras el usuario decide un cuello compatible con Hombre.
    const defaultCandidateValues = isNeckModelAttribute(attribute)
      ? [
          ...compatibleCandidateValues.filter((value) => isExplicitNoneOption(value.name)),
          ...compatibleCandidateValues.filter((value) => !isExplicitNoneOption(value.name)),
        ]
      : compatibleCandidateValues;
    const selectedWithoutPlaceholders = new Set(
      Array.from(selected).filter(
        (valueId) => !selectedValueIds.includes(valueId),
      ),
    );
    const firstCompatibleOption = defaultCandidateValues.find(
      (value) =>
        !conflictsWithCurrentSelection(
          value.id,
          selectedWithoutPlaceholders,
          session.exclusions,
        ),
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
