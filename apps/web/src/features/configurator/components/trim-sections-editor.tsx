import type {
  ConfiguratorOption,
  TrimSectionDefinition,
} from "../lib/derive-configurator-ui";
import type { TrimSectionState } from "../reducers/configurator-reducer";

type Props = {
  sections: TrimSectionDefinition[];
  trimStates: Record<string, TrimSectionState>;
  colorOptions: ConfiguratorOption[];
  onToggle: (sectionKey: string, enabled: boolean) => void;
  onChangeColor: (sectionKey: string, color: string) => void;
};

export function TrimSectionsEditor({
  sections,
  trimStates,
  colorOptions,
  onToggle,
  onChangeColor,
}: Props) {
  return (
    <fieldset className="config-section">
      <legend className="config-section__legend">Vivos por sección</legend>
      <p className="config-section__help">
        Activa o desactiva vivos por sección y asigna el color deseado.
      </p>

      <ul className="trim-list" role="list">
        {sections.map((section) => {
          const trimState = trimStates[section.key] ?? { enabled: false };

          return (
            <li key={section.key} className="trim-card">
              <div className="trim-card__header">
                <label className="trim-toggle">
                  <input
                    type="checkbox"
                    checked={trimState.enabled}
                    onChange={(event) =>
                      onToggle(section.key, event.target.checked)
                    }
                  />
                  <span>{section.label}</span>
                </label>
              </div>

              <p className="trim-card__help">{section.helpText}</p>

              <label className="trim-card__select-label">
                <span>Color del vivo</span>
                <select
                  value={trimState.color ?? ""}
                  disabled={!trimState.enabled}
                  onChange={(event) =>
                    onChangeColor(section.key, event.target.value)
                  }
                >
                  {colorOptions.map((option) => (
                    <option key={option.id} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}