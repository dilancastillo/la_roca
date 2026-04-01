import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import type { ConfiguratorState } from "../reducers/configurator-reducer";

export type ConfiguratorOption = {
  id: number;
  name: string;
  attributeName: string;
};

export type TrimSectionDefinition = {
  key: string;
  label: string;
  helpText: string;
};

export type ConfiguratorUiModel = {
  productName: string;
  baseColors: ConfiguratorOption[];
  necks: ConfiguratorOption[];
  chestPockets: ConfiguratorOption[];
  lowerPockets: ConfiguratorOption[];
  trimSections: TrimSectionDefinition[];
};

function normalizeLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function containsAny(value: string, candidates: string[]): boolean {
  const normalized = normalizeLabel(value);
  return candidates.some((candidate) => normalized.includes(normalizeLabel(candidate)));
}

function findAttribute(
  session: ConfiguratorSession,
  candidates: string[],
) {
  return session.attributes.find((attribute) =>
    containsAny(attribute.name, candidates),
  );
}

function mapAttributeOptions(
  attribute:
    | ConfiguratorSession["attributes"][number]
    | undefined,
  fallbackAttributeName: string,
  fallbackValues: { id: number; name: string }[],
): ConfiguratorOption[] {
  if (attribute && attribute.values.length > 0) {
    return attribute.values.map((value) => ({
      id: value.id,
      name: value.name,
      attributeName: attribute.name,
    }));
  }

  return fallbackValues.map((value) => ({
    id: value.id,
    name: value.name,
    attributeName: fallbackAttributeName,
  }));
}

function findOptionIdByName(
  options: ConfiguratorOption[],
  selectedName?: string,
): number | undefined {
  return options.find((option) => option.name === selectedName)?.id;
}

export function deriveConfiguratorUi(
  session: ConfiguratorSession,
): ConfiguratorUiModel {
  const baseColorAttr = findAttribute(session, [
    "color tela base",
    "tela base",
    "material y color de tela base",
    "color base",
    "color",
  ]);

  const neckAttr = findAttribute(session, ["cuello"]);
  const chestPocketAttr = findAttribute(session, [
    "bolsillo de pecho",
    "bolsillo pecho",
  ]);

  const lowerPocketAttr = findAttribute(session, [
    "bolsillos inferiores",
    "bolsillo inferior",
    "auxiliares",
    "auxiliar",
  ]);

  const baseColors = mapAttributeOptions(baseColorAttr, "Color base", [
    { id: 10001, name: "Blanco" },
    { id: 10002, name: "Azul rey" },
    { id: 10003, name: "Gris perla" },
    { id: 10004, name: "Verde quirófano" },
  ]);

  const necks = mapAttributeOptions(neckAttr, "Modelo de cuello", [
    { id: 11001, name: "Cuello 1" },
    { id: 11002, name: "Cuello 2" },
    { id: 11003, name: "Cuello 3" },
    { id: 11004, name: "Cuello 4" },
  ]);

  const chestPockets = mapAttributeOptions(chestPocketAttr, "Bolsillo de pecho", [
    { id: 12001, name: "Sin bolsillo" },
    { id: 12002, name: "Bolsillo A" },
    { id: 12003, name: "Bolsillo B" },
  ]);

  const lowerPockets = mapAttributeOptions(lowerPocketAttr, "Bolsillos inferiores", [
    { id: 13001, name: "Sin bolsillo inferior" },
    { id: 13002, name: "Modelo 1" },
    { id: 13003, name: "Modelo 2" },
    { id: 13004, name: "Modelo 3" },
  ]);

  const trimSections: TrimSectionDefinition[] = [
    {
      key: "collar",
      label: "Vivo en cuello",
      helpText: "Aplica vivo sobre el contorno del cuello.",
    },
    {
      key: "frontPlacket",
      label: "Vivo frente central",
      helpText: "Aplica vivo sobre la línea frontal.",
    },
    {
      key: "chestPocket",
      label: "Vivo bolsillo pecho",
      helpText: "Aplica vivo alrededor del bolsillo de pecho.",
    },
    {
      key: "lowerPockets",
      label: "Vivos bolsillos inferiores",
      helpText: "Aplica vivo en bolsillos inferiores o auxiliares.",
    },
  ];

  return {
    productName: session.productName,
    baseColors,
    necks,
    chestPockets,
    lowerPockets,
    trimSections,
  };
}

export function createInitialConfiguratorState(
  ui: ConfiguratorUiModel,
): ConfiguratorState {
  const defaultColor = ui.baseColors[0]?.name;
  const defaultNeck = ui.necks[0]?.name;
  const defaultChestPocket = ui.chestPockets[0]?.name;
  const defaultLowerPocket = ui.lowerPockets[0]?.name;

  const state: ConfiguratorState = {
    trimSections: Object.fromEntries(
      ui.trimSections.map((section) => {
        const trimState =
          defaultColor !== undefined
            ? {
                enabled: false,
                color: defaultColor,
              }
            : {
                enabled: false,
              };

        return [section.key, trimState];
      }),
    ) as Record<string, { enabled: boolean; color?: string }>,
  };

  if (defaultColor !== undefined) {
    state.baseColor = defaultColor;
  }

  if (defaultNeck !== undefined) {
    state.neckModel = defaultNeck;
  }

  if (defaultChestPocket !== undefined) {
    state.chestPocketModel = defaultChestPocket;
  }

  if (defaultLowerPocket !== undefined) {
    state.lowerPocketModel = defaultLowerPocket;
  }

  return state;
}

export function getSelectedValueIds(
  ui: ConfiguratorUiModel,
  state: ConfiguratorState,
): Set<number> {
  const ids = [
    findOptionIdByName(ui.baseColors, state.baseColor),
    findOptionIdByName(ui.necks, state.neckModel),
    findOptionIdByName(ui.chestPockets, state.chestPocketModel),
    findOptionIdByName(ui.lowerPockets, state.lowerPocketModel),
  ].filter((value): value is number => typeof value === "number");

  return new Set(ids);
}

export function computeDisabledValueIds(
  session: ConfiguratorSession,
  selectedValueIds: Set<number>,
): Set<number> {
  const disabled = new Set<number>();

  for (const selectedId of selectedValueIds) {
    for (const rule of session.exclusions) {
      if (rule.sourceValueId === selectedId) {
        disabled.add(rule.excludedValueId);
      }
    }
  }

  return disabled;
}