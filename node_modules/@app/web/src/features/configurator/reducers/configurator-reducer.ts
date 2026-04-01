export type ConfiguratorState = {
  baseColor?: string;
  neckModel?: string;
  chestPocketModel?: string;
  lowerPocketModel?: string;
  trimSections: Record<string, { enabled: boolean; color?: string }>;
};

type Action =
  | { type: "SET_BASE_COLOR"; value: string }
  | { type: "SET_NECK_MODEL"; value: string }
  | { type: "SET_CHEST_POCKET_MODEL"; value: string }
  | { type: "SET_LOWER_POCKET_MODEL"; value: string }
  | { type: "TOGGLE_TRIM"; key: string; enabled: boolean }
  | { type: "SET_TRIM_COLOR"; key: string; color: string };

export function configuratorReducer(
  state: ConfiguratorState,
  action: Action
): ConfiguratorState {
  switch (action.type) {
    case "SET_BASE_COLOR":
      return { ...state, baseColor: action.value };
    case "SET_NECK_MODEL":
      return { ...state, neckModel: action.value };
    case "SET_CHEST_POCKET_MODEL":
      return { ...state, chestPocketModel: action.value };
    case "SET_LOWER_POCKET_MODEL":
      return { ...state, lowerPocketModel: action.value };
    case "TOGGLE_TRIM":
      return {
        ...state,
        trimSections: {
          ...state.trimSections,
          [action.key]: {
            ...state.trimSections[action.key],
            enabled: action.enabled
          }
        }
      };
    case "SET_TRIM_COLOR":
      return {
        ...state,
        trimSections: {
          ...state.trimSections,
          [action.key]: {
            ...state.trimSections[action.key],
            color: action.color
          }
        }
      };
    default:
      return state;
  }
}