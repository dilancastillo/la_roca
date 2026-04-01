import { useEffect, useMemo, useReducer, useState } from "react";
import { useParams } from "react-router-dom";
import { OptionCardGroup } from "../features/configurator/components/option-card-group";
import { TrimSectionsEditor } from "../features/configurator/components/trim-sections-editor";
import { useConfiguratorSession } from "../features/configurator/hooks/use-configurator-session";
import {
  computeDisabledValueIds,
  createInitialConfiguratorState,
  deriveConfiguratorUi,
  getSelectedValueIds,
} from "../features/configurator/lib/derive-configurator-ui";
import { configuratorReducer } from "../features/configurator/reducers/configurator-reducer";
import { DesignPreviewCanvas } from "../features/preview/components/design-preview-canvas";
import { saveDesign } from "../features/save-design/save-design";

export function ConfiguratorPage() {
  const { saleOrderLineId } = useParams();

  const lineId = Number(saleOrderLineId);

  if (!Number.isFinite(lineId) || lineId <= 0) {
    return (
      <main className="page-state">
        <h1>Línea de venta inválida</h1>
        <p>No se pudo abrir el configurador porque el identificador no es válido.</p>
      </main>
    );
  }

  const sessionQuery = useConfiguratorSession(lineId);
  const [state, dispatch] = useReducer(configuratorReducer, { trimSections: {} });
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const uiModel = useMemo(() => {
    if (!sessionQuery.data) return null;
    return deriveConfiguratorUi(sessionQuery.data);
  }, [sessionQuery.data]);

  useEffect(() => {
    if (!uiModel) return;

    dispatch({
      type: "INITIALIZE",
      value: createInitialConfiguratorState(uiModel),
    });
  }, [uiModel]);

  const selectedValueIds = useMemo(() => {
    if (!uiModel) return new Set<number>();
    return getSelectedValueIds(uiModel, state);
  }, [uiModel, state]);

  const disabledValueIds = useMemo(() => {
    if (!sessionQuery.data) return new Set<number>();
    return computeDisabledValueIds(sessionQuery.data, selectedValueIds);
  }, [sessionQuery.data, selectedValueIds]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaveMessage(null);
    setSaveError(null);

    if (!currentBlob) {
      setSaveError("Aún no existe una previsualización lista para guardar.");
      return;
    }

    try {
      setIsSaving(true);
      await saveDesign(lineId, currentBlob);
      setSaveMessage("Diseño guardado correctamente en la línea de venta.");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el diseño.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleTrimToggle(sectionKey: string, enabled: boolean) {
    dispatch({ type: "TOGGLE_TRIM", key: sectionKey, enabled });

    if (enabled && !state.trimSections[sectionKey]?.color && uiModel?.baseColors[0]) {
      dispatch({
        type: "SET_TRIM_COLOR",
        key: sectionKey,
        color: uiModel.baseColors[0].name,
      });
    }
  }

  if (sessionQuery.isLoading) {
    return (
      <main className="page-state">
        <h1>Cargando configurador</h1>
        <p>Estamos preparando la sesión de diseño.</p>
      </main>
    );
  }

  if (sessionQuery.isError || !sessionQuery.data || !uiModel) {
    return (
      <main className="page-state">
        <h1>No se pudo cargar el configurador</h1>
        <p>
          Verifica la línea de venta, la sesión de Odoo o la conectividad con la API.
        </p>
      </main>
    );
  }

  return (
    <main className="configurator-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Configurador técnico visual</p>
          <h1>{uiModel.productName}</h1>
          <p className="page-subtitle">
            Línea de venta #{lineId}. Configura atributos técnicos y genera la
            previsualización frontal.
          </p>
        </div>
      </header>

      <div className="configurator-layout">
        <aside className="configurator-panel" aria-label="Panel de configuración">
          <form className="configurator-form" onSubmit={handleSave}>
            <OptionCardGroup
              legend="Color de tela base"
              name="baseColor"
              options={uiModel.baseColors}
              value={state.baseColor}
              disabledValueIds={disabledValueIds}
              onChange={(value) => dispatch({ type: "SET_BASE_COLOR", value })}
              helpText="Selecciona la tela o color principal de la prenda."
            />

            <OptionCardGroup
              legend="Modelo de cuello"
              name="neckModel"
              options={uiModel.necks}
              value={state.neckModel}
              disabledValueIds={disabledValueIds}
              onChange={(value) => dispatch({ type: "SET_NECK_MODEL", value })}
              helpText="Este valor alimenta la ficha técnica visual."
            />

            <OptionCardGroup
              legend="Bolsillo de pecho"
              name="chestPocketModel"
              options={uiModel.chestPockets}
              value={state.chestPocketModel}
              disabledValueIds={disabledValueIds}
              onChange={(value) =>
                dispatch({ type: "SET_CHEST_POCKET_MODEL", value })
              }
              helpText="Selecciona el modelo o ausencia de bolsillo de pecho."
            />

            <OptionCardGroup
              legend="Bolsillos inferiores / auxiliares"
              name="lowerPocketModel"
              options={uiModel.lowerPockets}
              value={state.lowerPocketModel}
              disabledValueIds={disabledValueIds}
              onChange={(value) =>
                dispatch({ type: "SET_LOWER_POCKET_MODEL", value })
              }
              helpText="Selecciona el modelo general de bolsillo inferior."
            />

            <TrimSectionsEditor
              sections={uiModel.trimSections}
              trimStates={state.trimSections}
              colorOptions={uiModel.baseColors}
              onToggle={handleTrimToggle}
              onChangeColor={(sectionKey, color) =>
                dispatch({ type: "SET_TRIM_COLOR", key: sectionKey, color })
              }
            />

            <div className="save-panel">
              <p className="save-panel__help">
                Al guardar, el diseño actual reemplazará la imagen anterior de esta línea.
              </p>

              <button
                type="submit"
                className="primary-button"
                disabled={isSaving}
              >
                {isSaving ? "Guardando..." : "Guardar diseño"}
              </button>

              {saveMessage ? (
                <p className="success-banner" role="status">
                  {saveMessage}
                </p>
              ) : null}

              {saveError ? (
                <p className="error-banner" role="alert">
                  {saveError}
                </p>
              ) : null}
            </div>
          </form>
        </aside>

        <section className="preview-panel" aria-label="Panel de previsualización">
          <DesignPreviewCanvas
            productName={uiModel.productName}
            state={state}
            onBlobReady={setCurrentBlob}
          />
        </section>
      </div>
    </main>
  );
}