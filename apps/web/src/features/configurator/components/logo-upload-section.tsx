import type { ChangeEvent } from "react";

type Props = {
  placements: Array<{
    valueId: number;
    label: string;
    attachmentFilename?: string | undefined;
  }>;
  error?: string | null | undefined;
  accept: string;
  disabled?: boolean;
  expanded: boolean;
  isActive?: boolean;
  onExpandToggle: () => void;
  onFileChange: (placementValueId: number, event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: (placementValueId: number) => void;
};

export function LogoUploadSection({
  placements,
  error,
  accept,
  disabled = false,
  expanded,
  isActive = false,
  onExpandToggle,
  onFileChange,
  onRemove,
}: Props) {
  const uploadedCount = placements.filter((placement) => placement.attachmentFilename).length;
  const selectionLabel = `${uploadedCount}/3 imágenes cargadas`;

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
              <span className="config-section__legend">Imágenes de logo</span>
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
            Puedes seleccionar todas las ubicaciones. Carga hasta tres imágenes en las
            ubicaciones que necesites.
          </p>

          {placements.map((placement) => {
            const canUpload = Boolean(placement.attachmentFilename) || uploadedCount < 3;

            return (
              <div className="logo-upload-field" key={placement.valueId}>
                <strong>{placement.label}</strong>
                <label className="logo-upload-panel__action">
                  <input
                    type="file"
                    accept={accept}
                    disabled={disabled || !canUpload}
                    onChange={(event) => onFileChange(placement.valueId, event)}
                  />
                  {placement.attachmentFilename ? "Cambiar imagen" : "Cargar imagen"}
                </label>

                {placement.attachmentFilename ? (
                  <div className="logo-upload-panel__file">
                    <span>{placement.attachmentFilename}</span>
                    <button
                      type="button"
                      className="logo-upload-panel__remove"
                      onClick={() => onRemove(placement.valueId)}
                      disabled={disabled}
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <p className="logo-upload-panel__hint">
                    {canUpload
                      ? "Opcional. Puedes cargar una imagen en esta ubicación."
                      : "Ya cargaste el máximo de tres imágenes."}
                  </p>
                )}
              </div>
            );
          })}

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
