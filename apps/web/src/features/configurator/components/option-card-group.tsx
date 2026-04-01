import type { ConfiguratorOption } from "../lib/derive-configurator-ui";

type Props = {
  legend: string;
  name: string;
  options: ConfiguratorOption[];
  value: string | undefined;
  disabledValueIds: Set<number>;
  onChange: (value: string) => void;
  helpText?: string;
  emptyText?: string;
};

export function OptionCardGroup({
  legend,
  name,
  options,
  value,
  disabledValueIds,
  onChange,
  helpText,
  emptyText = "Aún no hay opciones configuradas para este grupo.",
}: Props) {
  return (
    <fieldset className="config-section">
      <legend className="config-section__legend">{legend}</legend>

      {helpText ? <p className="config-section__help">{helpText}</p> : null}

      {options.length === 0 ? (
        <p className="empty-message">{emptyText}</p>
      ) : (
        <ul className="option-grid" role="list">
          {options.map((option) => {
            const checked = value === option.name;
            const disabled = disabledValueIds.has(option.id) && !checked;
            const inputId = `${name}-${option.id}`;

            return (
              <li key={option.id}>
                <input
                  className="visually-hidden"
                  id={inputId}
                  type="radio"
                  name={name}
                  value={option.name}
                  checked={checked}
                  disabled={disabled}
                  onChange={(event) => onChange(event.target.value)}
                />
                <label
                  htmlFor={inputId}
                  className={[
                    "option-card",
                    checked ? "option-card--selected" : "",
                    disabled ? "option-card--disabled" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="option-card__title">{option.name}</span>
                  <span className="option-card__meta">{option.attributeName}</span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </fieldset>
  );
}