import type { UiAttributeGroup } from "../lib/derive-configurator-ui";

type Props = {
  group: UiAttributeGroup;
  selectedValueIds: number[];
  disabledValueIds: Set<number>;
  onSelect: (valueId: number) => void;
  onToggle: (valueId: number) => void;
  expanded: boolean;
  selectionLabel: string;
  onExpandToggle: () => void;
  disabled?: boolean;
};

export function AttributeSection({
  group,
  selectedValueIds,
  disabledValueIds,
  onSelect,
  onToggle,
  expanded,
  selectionLabel,
  onExpandToggle,
  disabled = false,
}: Props) {
  return (
    <section
      className={[
        "config-section",
        expanded ? "config-section--expanded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        className="config-section__header"
        aria-expanded={expanded}
        aria-controls={`attribute-section-${group.attributeId}`}
        onClick={onExpandToggle}
      >
        <span className="config-section__header-main">
          <span className="config-section__legend">{group.label}</span>
          <span className="config-section__selection">{selectionLabel}</span>
        </span>
        <span
          className={[
            "config-section__caret",
            expanded ? "config-section__caret--expanded" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        >
          ^
        </span>
      </button>

      {expanded ? (
        <div
          id={`attribute-section-${group.attributeId}`}
          className="config-section__body"
        >
          {group.helpText ? (
            <p className="config-section__help">{group.helpText}</p>
          ) : null}

          {group.controlType === "image" ? (
            <div className="image-option-grid" role="list">
              {group.options.map((option) => {
                const selected = selectedValueIds.includes(option.id);
                const optionDisabled =
                  disabled || (disabledValueIds.has(option.id) && !selected);

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={[
                      "image-option-card",
                      selected ? "image-option-card--selected" : "",
                      optionDisabled ? "image-option-card--disabled" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed={selected}
                    disabled={optionDisabled}
                    onClick={() =>
                      group.selectionMode === "multiple"
                        ? onToggle(option.id)
                        : onSelect(option.id)
                    }
                  >
                    {option.imageSrc ? (
                      <img src={option.imageSrc} alt={option.name} />
                    ) : (
                      <div className="image-option-card__placeholder">Sin imagen</div>
                    )}
                    <span>{option.name}</span>
                  </button>
                );
              })}
            </div>
          ) : group.controlType === "color" ? (
            <div className="swatch-grid" role="list">
              {group.options.map((option) => {
                const selected = selectedValueIds.includes(option.id);
                const optionDisabled =
                  disabled || (disabledValueIds.has(option.id) && !selected);

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={[
                      "swatch-button",
                      selected ? "swatch-button--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed={selected}
                    aria-label={option.name}
                    title={option.name}
                    disabled={optionDisabled}
                    onClick={() =>
                      group.selectionMode === "multiple"
                        ? onToggle(option.id)
                        : onSelect(option.id)
                    }
                  >
                    <span
                      className="swatch-button__dot"
                      style={{ backgroundColor: option.colorHex ?? "#d1d5db" }}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="chip-grid" role="list">
              {group.options.map((option) => {
                const selected = selectedValueIds.includes(option.id);
                const optionDisabled =
                  disabled || (disabledValueIds.has(option.id) && !selected);

                return (
                  <button
                    key={option.id}
                    type="button"
                    className={[
                      "option-chip",
                      selected ? "option-chip--selected" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-pressed={selected}
                    disabled={optionDisabled}
                    onClick={() =>
                      group.selectionMode === "multiple"
                        ? onToggle(option.id)
                        : onSelect(option.id)
                    }
                  >
                    {option.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
