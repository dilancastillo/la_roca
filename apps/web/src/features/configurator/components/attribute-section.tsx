import { useEffect, useMemo, useRef, useState } from "react";
import type { UiAttributeGroup } from "../lib/derive-configurator-ui";

type Props = {
  group: UiAttributeGroup;
  selectedValueIds: number[];
  customValuesByValueId: Record<string, string>;
  disabledValueIds: Set<number>;
  invalidCustomValueIds?: Set<number>;
  onSelect: (valueId: number) => void;
  onToggle: (valueId: number) => void;
  onCustomValueChange: (valueId: number, value: string) => void;
  expanded: boolean;
  selectionLabel: string;
  onExpandToggle: () => void;
  disabled?: boolean;
  isActive?: boolean;
};

export function AttributeSection({
  group,
  selectedValueIds,
  customValuesByValueId,
  disabledValueIds,
  invalidCustomValueIds = new Set<number>(),
  onSelect,
  onToggle,
  onCustomValueChange,
  expanded,
  selectionLabel,
  onExpandToggle,
  disabled = false,
  isActive = false,
}: Props) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [optionSearchOpen, setOptionSearchOpen] = useState(false);
  const [optionQuery, setOptionQuery] = useState("");
  const isColorGroup = group.controlType === "color";
  const isImageGroup = group.controlType === "image";
  const isSearchableGroup = isColorGroup || isImageGroup;
  const normalizedOptionQuery = normalizeSearchTerm(optionQuery);
  const compactOptionQuery = compactSearchTerm(normalizedOptionQuery);
  const searchInputLabel = isColorGroup
    ? `Buscar codigo o color en ${group.label}`
    : `Buscar modelo en ${group.label}`;
  const searchPlaceholder = isColorGroup
    ? "Buscar codigo o color..."
    : "Buscar modelo...";
  const clearSearchLabel = isColorGroup
    ? "Limpiar busqueda de color"
    : "Limpiar busqueda de modelo";
  const emptySearchMessage = isColorGroup
    ? "No encontramos ese codigo o color."
    : "No encontramos esa opcion.";
  const selectedValueIdSet = useMemo(
    () => new Set(selectedValueIds),
    [selectedValueIds],
  );
  const selectedCustomOptions = useMemo(
    () =>
      group.options.filter(
        (option) =>
          option.allowsCustomValue && selectedValueIdSet.has(option.id),
      ),
    [group.options, selectedValueIdSet],
  );
  const availableOptions = useMemo(
    () =>
      group.options.filter(
        (option) =>
          selectedValueIdSet.has(option.id) || !disabledValueIds.has(option.id),
      ),
    [disabledValueIds, group.options, selectedValueIdSet],
  );
  const visibleOptions = useMemo(() => {
    if (!isSearchableGroup || !normalizedOptionQuery) {
      return availableOptions;
    }

    return availableOptions.filter((option) => {
      const normalizedName = normalizeSearchTerm(option.name);
      const compactName = compactSearchTerm(normalizedName);

      return (
        normalizedName.includes(normalizedOptionQuery) ||
        (Boolean(compactOptionQuery) && compactName.includes(compactOptionQuery))
      );
    });
  }, [
    availableOptions,
    compactOptionQuery,
    isSearchableGroup,
    normalizedOptionQuery,
  ]);

  useEffect(() => {
    if (expanded && optionSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [optionSearchOpen, expanded]);

  useEffect(() => {
    if (!expanded) {
      setOptionSearchOpen(false);
      setOptionQuery("");
    }
  }, [expanded]);

  function handleOptionSearchToggle() {
    if (!expanded) {
      onExpandToggle();
      setOptionSearchOpen(true);
      return;
    }

    setOptionSearchOpen((current) => {
      if (current) {
        setOptionQuery("");
      }

      return !current;
    });
  }

  return (
    <section
      className={[
        "config-section",
        expanded ? "config-section--expanded" : "",
        isActive ? "config-section--active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-current={isActive ? "step" : undefined}
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
            <span className="config-section__title-row">
              <span className="config-section__legend">{group.label}</span>
              {isActive ? (
                <span className="config-section__active-chip">
                  {expanded ? "Editando" : "Paso actual"}
                </span>
              ) : null}
            </span>
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

        {isSearchableGroup ? (
          <button
            type="button"
            className={[
              "config-section__search-toggle",
              optionSearchOpen ? "config-section__search-toggle--active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={`Buscar en ${group.label}`}
            aria-pressed={optionSearchOpen}
            onClick={handleOptionSearchToggle}
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

          {isSearchableGroup && optionSearchOpen ? (
            <div className="color-search" role="search">
              <span className="color-search__icon" aria-hidden="true">
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                type="search"
                value={optionQuery}
                placeholder={searchPlaceholder}
                aria-label={searchInputLabel}
                onChange={(event) => setOptionQuery(event.target.value)}
              />
              {optionQuery ? (
                <button
                  type="button"
                  className="color-search__clear"
                  aria-label={clearSearchLabel}
                  onClick={() => setOptionQuery("")}
                >
                  x
                </button>
              ) : null}
              <span className="color-search__count" aria-live="polite">
                {visibleOptions.length}/{availableOptions.length}
              </span>
            </div>
          ) : null}

          {group.controlType === "image" ? (
            visibleOptions.length > 0 ? (
              <div className="image-option-grid" role="list">
                {visibleOptions.map((option) => {
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
                {availableOptions.length > 0
                  ? emptySearchMessage
                  : "No hay opciones disponibles con la combinacion actual."}
              </div>
            )
          ) : group.controlType === "color" ? (
            visibleOptions.length > 0 ? (
              <div className="swatch-grid" role="list">
                {visibleOptions.map((option) => {
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
                {emptySearchMessage}
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

          {selectedCustomOptions.length > 0 ? (
            <div className="custom-value-fields">
              {selectedCustomOptions.map((option) => {
                const isInvalid = invalidCustomValueIds.has(option.id);
                const errorId = `custom-value-error-${option.id}`;

                return (
                  <label
                    key={option.id}
                    className={[
                      "custom-value-field",
                      isInvalid ? "custom-value-field--invalid" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span>Valor personalizado para {option.name}</span>
                    <input
                      type="text"
                      value={customValuesByValueId[String(option.id)] ?? ""}
                      placeholder="Escribe el texto exactamente como debe quedar"
                      disabled={disabled}
                      maxLength={120}
                      aria-invalid={isInvalid}
                      aria-describedby={isInvalid ? errorId : undefined}
                      onChange={(event) =>
                        onCustomValueChange(option.id, event.target.value)
                      }
                    />
                    {isInvalid ? (
                      <span id={errorId} className="custom-value-field__error">
                        Este texto es obligatorio para guardar.
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </div>
          ) : null}
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
