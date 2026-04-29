import { useEffect, useMemo, useRef, useState } from "react";
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [colorSearchOpen, setColorSearchOpen] = useState(false);
  const [colorQuery, setColorQuery] = useState("");
  const isColorGroup = group.controlType === "color";
  const normalizedColorQuery = normalizeSearchTerm(colorQuery);
  const compactColorQuery = compactSearchTerm(normalizedColorQuery);
  const selectedValueIdSet = useMemo(
    () => new Set(selectedValueIds),
    [selectedValueIds],
  );
  const availableOptions = useMemo(
    () =>
      group.options.filter(
        (option) =>
          selectedValueIdSet.has(option.id) || !disabledValueIds.has(option.id),
      ),
    [disabledValueIds, group.options, selectedValueIdSet],
  );
  const visibleColorOptions = useMemo(() => {
    if (!isColorGroup || !normalizedColorQuery) {
      return availableOptions;
    }

    return availableOptions.filter((option) => {
      const normalizedName = normalizeSearchTerm(option.name);
      const compactName = compactSearchTerm(normalizedName);

      return (
        normalizedName.includes(normalizedColorQuery) ||
        Boolean(compactColorQuery) && compactName.includes(compactColorQuery)
      );
    });
  }, [
    availableOptions,
    compactColorQuery,
    isColorGroup,
    normalizedColorQuery,
  ]);

  useEffect(() => {
    if (expanded && colorSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [colorSearchOpen, expanded]);

  useEffect(() => {
    if (!expanded) {
      setColorSearchOpen(false);
      setColorQuery("");
    }
  }, [expanded]);

  function handleColorSearchToggle() {
    if (!expanded) {
      onExpandToggle();
      setColorSearchOpen(true);
      return;
    }

    setColorSearchOpen((current) => {
      if (current) {
        setColorQuery("");
      }

      return !current;
    });
  }

  return (
    <section
      className={[
        "config-section",
        expanded ? "config-section--expanded" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="config-section__header">
        <button
          type="button"
          className="config-section__header-button"
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

        {isColorGroup ? (
          <button
            type="button"
            className={[
              "config-section__search-toggle",
              colorSearchOpen ? "config-section__search-toggle--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={`Buscar en ${group.label}`}
            aria-pressed={colorSearchOpen}
            onClick={handleColorSearchToggle}
          >
            <SearchIcon />
          </button>
        ) : null}
      </div>

      {expanded ? (
        <div
          id={`attribute-section-${group.attributeId}`}
          className="config-section__body"
        >
          {group.helpText ? (
            <p className="config-section__help">{group.helpText}</p>
          ) : null}

          {isColorGroup && colorSearchOpen ? (
            <div className="color-search" role="search">
              <span className="color-search__icon" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                type="search"
                value={colorQuery}
                placeholder="Buscar codigo o color..."
                aria-label={`Buscar codigo o color en ${group.label}`}
                onChange={(event) => setColorQuery(event.target.value)}
              />
              {colorQuery ? (
                <button
                  type="button"
                  className="color-search__clear"
                  aria-label="Limpiar busqueda de color"
                  onClick={() => setColorQuery("")}
                >
                  x
                </button>
              ) : null}
              <span className="color-search__count" aria-live="polite">
                {visibleColorOptions.length}/{availableOptions.length}
              </span>
            </div>
          ) : null}

          {group.controlType === "image" ? (
            availableOptions.length > 0 ? (
              <div className="image-option-grid" role="list">
                {availableOptions.map((option) => {
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
            ) : (
              <div className="color-search__empty" role="status">
                No hay opciones disponibles con la combinacion actual.
              </div>
            )
          ) : group.controlType === "color" ? (
            visibleColorOptions.length > 0 ? (
              <div className="swatch-grid" role="list">
                {visibleColorOptions.map((option) => {
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
              <div className="color-search__empty" role="status">
                No encontramos ese codigo o color.
              </div>
            )
          ) : availableOptions.length > 0 ? (
            <div className="chip-grid" role="list">
              {availableOptions.map((option) => {
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
          ) : (
            <div className="color-search__empty" role="status">
              No hay opciones disponibles con la combinacion actual.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function normalizeSearchTerm(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function compactSearchTerm(value: string) {
  return value.replace(/[^a-z0-9]+/g, "");
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      focusable="false"
      className="search-icon"
    >
      <path
        d="M10.5 5.5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm-7 5a7 7 0 1 1 12.48 4.35l3.59 3.58-1.42 1.42-3.58-3.59A7 7 0 0 1 3.5 10.5Z"
        fill="currentColor"
      />
    </svg>
  );
}
