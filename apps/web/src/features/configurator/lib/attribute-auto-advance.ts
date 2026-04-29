import type { UiAttributeGroup } from "./derive-configurator-ui";

type AutoAdvanceParams = {
  groups: UiAttributeGroup[];
  currentAttributeId: number;
  selectedValueIds: Record<string, number[]>;
  disabledValueIds?: ReadonlySet<number>;
};

function hasVisibleOption(
  group: UiAttributeGroup,
  selectedValueIds: Record<string, number[]>,
  disabledValueIds: ReadonlySet<number>,
) {
  const selectedOptionIds = new Set(
    selectedValueIds[String(group.attributeId)] ?? [],
  );

  return group.options.some(
    (option) =>
      selectedOptionIds.has(option.id) || !disabledValueIds.has(option.id),
  );
}

export function getNextAutoExpandedAttributeId({
  groups,
  currentAttributeId,
  selectedValueIds,
  disabledValueIds = new Set<number>(),
}: AutoAdvanceParams) {
  const currentIndex = groups.findIndex(
    (group) => group.attributeId === currentAttributeId,
  );

  if (currentIndex < 0) {
    return null;
  }

  const groupsAfterCurrent = groups.slice(currentIndex + 1);
  const nextVisibleGroup = groupsAfterCurrent.find((group) =>
    hasVisibleOption(group, selectedValueIds, disabledValueIds),
  );

  return nextVisibleGroup?.attributeId ?? null;
}
