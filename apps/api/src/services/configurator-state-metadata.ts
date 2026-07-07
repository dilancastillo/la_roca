export type PersistedConfiguratorState = {
  selectedValueIds: Record<string, number[]>;
  customValuesByValueId: Record<string, string>;
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

  return {
    selectedValueIds,
    customValuesByValueId: normalizeCustomValuesByValueId(
      (value as { customValuesByValueId?: unknown }).customValuesByValueId,
    ),
  };
}

export function buildConfiguratorStateDescription(
  state: PersistedConfiguratorState,
) {
  return `${CONFIGURATOR_STATE_DESCRIPTION_PREFIX}${JSON.stringify({
    version: 1,
    selectedValueIds: normalizeSelectedValueIds(state.selectedValueIds),
    customValuesByValueId: normalizeCustomValuesByValueId(
      state.customValuesByValueId,
    ),
  })}`;
}

export function parseConfiguratorStateDescription(
  description: string | false | undefined,
) {
  if (typeof description !== "string") {
    return undefined;
  }

  const prefixIndex = description.indexOf(CONFIGURATOR_STATE_DESCRIPTION_PREFIX);

  if (prefixIndex < 0) {
    return undefined;
  }

  try {
    return normalizePersistedConfiguratorState(
      JSON.parse(
        description
          .slice(prefixIndex + CONFIGURATOR_STATE_DESCRIPTION_PREFIX.length)
          .trim(),
      ),
    );
  } catch {
    return undefined;
  }
}
