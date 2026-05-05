export type ConfiguratorState = {
  selectedValueIds: Record<string, number[]>;
  customValuesByValueId: Record<string, string>;
};

type Action =
  | { type: "INITIALIZE"; value: ConfiguratorState }
  | { type: "SET_SELECTIONS"; value: Record<string, number[]> }
  | { type: "SET_SINGLE"; attributeId: number; valueId: number }
  | { type: "TOGGLE_MULTI"; attributeId: number; valueId: number }
  | { type: "SET_CUSTOM_VALUE"; valueId: number; value: string };

export function configuratorReducer(
  state: ConfiguratorState,
  action: Action,
): ConfiguratorState {
  switch (action.type) {
    case "INITIALIZE":
      return action.value;

    case "SET_SELECTIONS":
      return {
        ...state,
        selectedValueIds: action.value,
      };

    case "SET_SINGLE":
      return {
        ...state,
        selectedValueIds: {
          ...state.selectedValueIds,
          [String(action.attributeId)]: [action.valueId],
        },
      };

    case "TOGGLE_MULTI": {
      const key = String(action.attributeId);
      const current = new Set(state.selectedValueIds[key] ?? []);

      if (current.has(action.valueId)) {
        current.delete(action.valueId);
      } else {
        current.add(action.valueId);
      }

      return {
        ...state,
        selectedValueIds: {
          ...state.selectedValueIds,
          [key]: Array.from(current),
        },
      };
    }

    case "SET_CUSTOM_VALUE":
      return {
        ...state,
        customValuesByValueId: {
          ...state.customValuesByValueId,
          [String(action.valueId)]: action.value,
        },
      };

    default:
      return state;
  }
}
