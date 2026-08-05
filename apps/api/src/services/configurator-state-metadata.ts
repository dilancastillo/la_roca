export type PersistedConfiguratorState = {
  selectedValueIds: Record<string, number[]>;
  customValuesByValueId: Record<string, string>;
  visualDefinitionVersionIds?: string[];
};

const CONFIGURATOR_STATE_DESCRIPTION_PREFIX = "la-roca-configurator-state:";

function normalizeManyIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is number => typeof item === "number")
        .filter((item) => Number.isFinite(item))
        .map((item) => Math.trunc(item)),
    ),
  );
}

function normalizeSelectedValueIds(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, rawValue]) => {
      const attributeId = Number(key);

      if (!Number.isFinite(attributeId)) {
        return [];
      }

      return [[String(Math.trunc(attributeId)), normalizeManyIds(rawValue)]];
    }),
  );
}

function normalizeCustomValuesByValueId(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, rawValue]) => {
      const valueId = Number(key);

      if (!Number.isFinite(valueId)) {
        return [];
      }

      return [[String(Math.trunc(valueId)), String(rawValue ?? "")]];
    }),
  );
}

function normalizeVisualDefinitionVersionIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function parseDescriptionPayload(
  description: string | false | undefined,
): Record<string, unknown> | undefined {
  if (typeof description !== "string") {
    return undefined;
  }

  const prefixIndex = description.indexOf(CONFIGURATOR_STATE_DESCRIPTION_PREFIX);

  if (prefixIndex < 0) {
    return undefined;
  }

  try {
    const value = JSON.parse(
      description
        .slice(prefixIndex + CONFIGURATOR_STATE_DESCRIPTION_PREFIX.length)
        .trim(),
    ) as unknown;

    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  } catch {
    return undefined;
  }
}

function normalizePersistedConfiguratorState(
  value: unknown,
): PersistedConfiguratorState | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const selectedValueIds = normalizeSelectedValueIds(
    (value as { selectedValueIds?: unknown }).selectedValueIds,
  );

  if (Object.keys(selectedValueIds).length === 0) {
    return undefined;
  }

  const visualDefinitionVersionIds = normalizeVisualDefinitionVersionIds(
    (value as { visualDefinitionVersionIds?: unknown })
      .visualDefinitionVersionIds,
  );

  return {
    selectedValueIds,
    customValuesByValueId: normalizeCustomValuesByValueId(
      (value as { customValuesByValueId?: unknown }).customValuesByValueId,
    ),
    ...(visualDefinitionVersionIds.length > 0
      ? { visualDefinitionVersionIds }
      : {}),
  };
}

export function buildConfiguratorStateDescription(
  state: PersistedConfiguratorState,
) {
  return `${CONFIGURATOR_STATE_DESCRIPTION_PREFIX}${JSON.stringify({
    version: 2,
    selectedValueIds: normalizeSelectedValueIds(state.selectedValueIds),
    customValuesByValueId: normalizeCustomValuesByValueId(
      state.customValuesByValueId,
    ),
    visualDefinitionVersionIds: normalizeVisualDefinitionVersionIds(
      state.visualDefinitionVersionIds,
    ),
  })}`;
}

export function parseConfiguratorStateDescription(
  description: string | false | undefined,
) {
  return normalizePersistedConfiguratorState(
    parseDescriptionPayload(description),
  );
}

export function parseVisualDefinitionVersionIds(
  description: string | false | undefined,
) {
  const payload = parseDescriptionPayload(description);

  if (
    !payload ||
    !Object.prototype.hasOwnProperty.call(
      payload,
      "visualDefinitionVersionIds",
    )
  ) {
    return undefined;
  }

  return normalizeVisualDefinitionVersionIds(
    payload.visualDefinitionVersionIds,
  );
}
