import type { ChangeEvent } from "react";

type Props = {
  placementLabel: string;
  attachmentFilename?: string | undefined;
  error?: string | null | undefined;
  accept: string;
  disabled?: boolean;
  expanded: boolean;
  isActive?: boolean;
  onExpandToggle: () => void;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
};

export function LogoUploadSection({
  placementLabel,
  attachmentFilename,
  error,
  accept,
  disabled = false,
  expanded,
  isActive = false,
  onExpandToggle,
  onFileChange,
  onRemove,
}: Props) {
  const selectionLabel = attachmentFilename ?? "Pendiente de cargar";

  return (
    <section
      className={[
        "config-section",
        "logo-upload-section",
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
          aria-controls="logo-upload-section"
          onClick={onExpandToggle}
        >
          <span className="config-section__header-main">
            <span className="config-section__title-row">
              <span className="config-section__legend">Imagen de logo</span>
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
      </div>

      {expanded ? (
        <div id="logo-upload-section" className="config-section__body">
          <p className="config-section__help">
            Adjunta la imagen que se usara en: {placementLabel}.
          </p>

          <div className="logo-upload-field">
            <label className="logo-upload-panel__action">
              <input
                type="file"
                accept={accept}
                disabled={disabled}
                onChange={onFileChange}
              />
              {attachmentFilename ? "Cambiar imagen" : "Cargar imagen"}
            </label>

            {attachmentFilename ? (
              <div className="logo-upload-panel__file">
                <span>{attachmentFilename}</span>
                <button
                  type="button"
                  className="logo-upload-panel__remove"
                  onClick={onRemove}
                  disabled={disabled}
                >
                  Quitar
                </button>
              </div>
            ) : (
              <p className="logo-upload-panel__hint">
                Obligatorio para poder guardar el diseno.
              </p>
            )}
          </div>

          {error ? (
            <p className="error-banner" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
