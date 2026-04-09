export type ConfiguratorState = {
  selectedValueIds: Record<string, number[]>;
};

type Action =
  | { type: "INITIALIZE"; value: Record<string, number[]> }
  | { type: "SET_SINGLE"; attributeId: number; valueId: number }
  | { type: "TOGGLE_MULTI"; attributeId: number; valueId: number };

export function configuratorReducer(
  state: ConfiguratorState,
  action: Action,
): ConfiguratorState {
  switch (action.type) {
    case "INITIALIZE":
      return {
        selectedValueIds: action.value,
      };

    case "SET_SINGLE":
      return {
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
        selectedValueIds: {
          ...state.selectedValueIds,
          [key]: Array.from(current),
        },
      };
    }

    default:
      return state;
  }
}
