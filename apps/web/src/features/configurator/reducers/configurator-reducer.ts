export type TrimSectionState = {
  enabled: boolean;
  color?: string;
};

export type ConfiguratorState = {
  baseColor?: string;
  neckModel?: string;
  chestPocketModel?: string;
  lowerPocketModel?: string;
  trimSections: Record<string, TrimSectionState>;
};

type Action =
  | { type: "INITIALIZE"; value: ConfiguratorState }
  | { type: "SET_BASE_COLOR"; value: string }
  | { type: "SET_NECK_MODEL"; value: string }
  | { type: "SET_CHEST_POCKET_MODEL"; value: string }
  | { type: "SET_LOWER_POCKET_MODEL"; value: string }
  | { type: "TOGGLE_TRIM"; key: string; enabled: boolean }
  | { type: "SET_TRIM_COLOR"; key: string; color: string };

function getTrimSection(
  trimSections: Record<string, TrimSectionState>,
  key: string,
): TrimSectionState {
  return trimSections[key] ?? { enabled: false };
}

export function configuratorReducer(
  state: ConfiguratorState,
  action: Action,
): ConfiguratorState {
  switch (action.type) {
    case "INITIALIZE":
      return action.value;

    case "SET_BASE_COLOR":
      return { ...state, baseColor: action.value };

    case "SET_NECK_MODEL":
      return { ...state, neckModel: action.value };

    case "SET_CHEST_POCKET_MODEL":
      return { ...state, chestPocketModel: action.value };

    case "SET_LOWER_POCKET_MODEL":
      return { ...state, lowerPocketModel: action.value };

    case "TOGGLE_TRIM": {
      const current = getTrimSection(state.trimSections, action.key);

      return {
        ...state,
        trimSections: {
          ...state.trimSections,
          [action.key]: {
            ...current,
            enabled: action.enabled,
          },
        },
      };
    }

    case "SET_TRIM_COLOR": {
      const current = getTrimSection(state.trimSections, action.key);

      return {
        ...state,
        trimSections: {
          ...state.trimSections,
          [action.key]: {
            ...current,
            color: action.color,
          },
        },
      };
    }

    default:
      return state;
  }
}