import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { logout } from "../features/auth/api";
import { useAuthSession } from "../features/auth/hooks/use-auth-session";
import { AttributeSection } from "../features/configurator/components/attribute-section";
import { useConfiguratorSession } from "../features/configurator/hooks/use-configurator-session";
import {
  computeDisabledValueIds,
  deriveConfiguratorUi,
  type UiAttributeGroup,
} from "../features/configurator/lib/derive-configurator-ui";
import { sanitizeSelectedValueIdsForExclusions } from "../features/configurator/lib/selection-exclusions";
import { configuratorReducer } from "../features/configurator/reducers/configurator-reducer";
import { DesignPreviewCanvas } from "../features/preview/components/design-preview-canvas";
import { saveDesign } from "../features/save-design/save-design";

function formatDateTime(value: string | null) {
  if (!value) {
    return "Aun no generado";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function isNoTrimValueName(value: string) {
  return normalizeText(value) === "sin vivos";
}

function shouldKeepSectionOpenAfterSelection(
  group: UiAttributeGroup,
  selectedValueId?: number,
) {
  if (
    selectedValueId !== undefined &&
    group.options.some(
      (option) => option.id === selectedValueId && option.allowsCustomValue,
    )
  ) {
    return true;
  }

  if (group.controlType === "color" || group.controlType === "image") {
    return true;
  }

  const label = normalizeText(group.label);
  const isModelSection = label.includes("modelo");

  return (
    isModelSection &&
    (label.includes("bolsillo") ||
      label.includes("cuello") ||
      label.includes("pantalon"))
  );
}

export function ConfiguratorPage() {
  const { saleOrderLineId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const authQuery = useAuthSession();
  const lineId = Number(saleOrderLineId);

  const [state, dispatch] = useReducer(configuratorReducer, {
    selectedValueIds: {},
    customValuesByValueId: {},
  });
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedAttributeId, setExpandedAttributeId] = useState<number | null>(null);
  const [areNoticesExpanded, setAreNoticesExpanded] = useState(false);
  const attributeSectionRefs = useRef(new Map<number, HTMLDivElement>());
  const hasInitializedExpandedAttributeRef = useRef(false);

  const nextUrl = `/login?next=${encodeURIComponent(location.pathname)}`;
  const sessionQuery = useConfiguratorSession(lineId, Boolean(authQuery.data));

  useEffect(() => {
    if (!sessionQuery.data) {
      return;
    }

    dispatch({
      type: "INITIALIZE",
      value: {
        selectedValueIds: sanitizeSelectedValueIdsForExclusions(
          sessionQuery.data,
          sessionQuery.data.selectedValueIds,
        ),
        customValuesByValueId: sessionQuery.data.customValuesByValueId ?? {},
      },
    });
  }, [sessionQuery.data]);

  const uiModel = useMemo(() => {
    if (!sessionQuery.data) {
      return null;
    }

    return deriveConfiguratorUi(sessionQuery.data, state.selectedValueIds);
  }, [sessionQuery.data, state.selectedValueIds]);

  const disabledValueIds = useMemo(() => {
    if (!sessionQuery.data) {
      return new Set<number>();
    }

    return computeDisabledValueIds(sessionQuery.data, state.selectedValueIds);
  }, [sessionQuery.data, state.selectedValueIds]);

  useEffect(() => {
    if (!uiModel || uiModel.groups.length === 0) {
      return;
    }

    const firstIncompleteGroup =
      uiModel.groups.find(
        (group) =>
          (state.selectedValueIds[String(group.attributeId)] ?? []).length === 0,
      ) ?? uiModel.groups[0];

    const expandedStillExists = uiModel.groups.some(
      (group) => group.attributeId === expandedAttributeId,
    );

    if (!hasInitializedExpandedAttributeRef.current) {
      hasInitializedExpandedAttributeRef.current = true;
      setExpandedAttributeId(firstIncompleteGroup?.attributeId ?? null);
      return;
    }

    if (expandedAttributeId !== null && !expandedStillExists) {
      setExpandedAttributeId(null);
    }
  }, [expandedAttributeId, state.selectedValueIds, uiModel]);

  if (!Number.isFinite(lineId) || lineId <= 0) {
    return (
      <main className="page-state">
        <h1>Linea invalida</h1>
        <p>Verifica el enlace de la linea y vuelve a abrir el configurador.</p>
      </main>
    );
  }

  if (authQuery.isLoading) {
    return (
      <main className="page-state">
        <h1>Preparando acceso</h1>
        <p>Estamos validando tu sesion.</p>
      </main>
    );
  }

  if (authQuery.isError || !authQuery.data) {
    return <Navigate to={nextUrl} replace />;
  }

  if (sessionQuery.isLoading || !uiModel || !sessionQuery.data) {
    return (
      <main className="page-state">
        <h1>Cargando configurador</h1>
        <p>Estamos reconstruyendo los atributos y el diseno de la linea.</p>
      </main>
    );
  }

  if (sessionQuery.isError) {
    return (
      <main className="page-state">
        <h1>No se pudo cargar la linea</h1>
        <p>Revisa la conexion con Odoo o valida que la linea siga disponible.</p>
      </main>
    );
  }

  const session = sessionQuery.data;
  const ui = uiModel;
  const isReadOnly = !session.status.canEdit || session.status.isLocked;
  const completedGroups = ui.groups.filter(
    (group) => (state.selectedValueIds[String(group.attributeId)] ?? []).length > 0,
  ).length;
  const hasNotices = session.warnings.length > 0 || isReadOnly;
  const noticeHeadline = isReadOnly
    ? "Modo lectura activo"
    : session.warnings[0] ?? "Advertencias de sincronizacion";

  function getSelectionLabel(attributeId: number) {
    const group = ui.groups.find((item) => item.attributeId === attributeId);
    if (!group) {
      return "Sin seleccion";
    }

    const selectedIds = state.selectedValueIds[String(attributeId)] ?? [];

    if (selectedIds.length === 0) {
      return "Sin seleccion";
    }

    const selectedOptions = group.options.filter((option) =>
      selectedIds.includes(option.id),
    );

    if (selectedOptions.length <= 2) {
      return selectedOptions.map((option) => option.name).join(" · ");
    }

    const [first, second] = selectedOptions;
    return `${first?.name ?? "Seleccionado"} · ${second?.name ?? ""} +${
      selectedOptions.length - 2
    }`.trim();
  }

  function collapseAfterSelection(attributeId: number, selectedValueId?: number) {
    const group = ui.groups.find((item) => item.attributeId === attributeId);

    if (!group || shouldKeepSectionOpenAfterSelection(group, selectedValueId)) {
      return;
    }

    setExpandedAttributeId(null);
  }

  function handleSingleSelect(attributeId: number, valueId: number) {
    const nextSelectedValueIds = {
      ...state.selectedValueIds,
      [String(attributeId)]: [valueId],
    };
    const sanitizedSelectedValueIds = sanitizeSelectedValueIdsForExclusions(
      session,
      nextSelectedValueIds,
      valueId,
    );

    dispatch({
      type: "SET_SELECTIONS",
      value: sanitizedSelectedValueIds,
    });
    collapseAfterSelection(attributeId, valueId);
  }

  function handleMultiToggle(attributeId: number, valueId: number) {
    const key = String(attributeId);
    const group = ui.groups.find((item) => item.attributeId === attributeId);
    const toggledOption = group?.options.find((option) => option.id === valueId);
    const noTrimOption = group?.options.find((option) =>
      isNoTrimValueName(option.name),
    );
    const current = new Set(state.selectedValueIds[key] ?? []);
    const isSelecting = !current.has(valueId);

    if (isSelecting) {
      current.add(valueId);
    } else {
      current.delete(valueId);
    }

    if (isSelecting && toggledOption && isNoTrimValueName(toggledOption.name)) {
      current.clear();
      current.add(valueId);
    } else if (isSelecting && noTrimOption) {
      current.delete(noTrimOption.id);
    }

    const nextSelectedValueIds = {
      ...state.selectedValueIds,
      [key]: Array.from(current),
    };

    dispatch({
      type: "SET_SELECTIONS",
      value: sanitizeSelectedValueIdsForExclusions(
        session,
        nextSelectedValueIds,
        isSelecting ? valueId : undefined,
      ),
    });
    collapseAfterSelection(attributeId, isSelecting ? valueId : undefined);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage(null);
    setSaveError(null);

    if (isReadOnly) {
      setSaveError("La linea esta en modo lectura y no acepta nuevos cambios.");
      return;
    }

    if (!currentBlob) {
      setSaveError("Aun no existe una imagen lista para guardar.");
      return;
    }

    try {
      setIsSaving(true);
      const result = await saveDesign(
        lineId,
        currentBlob,
        state.selectedValueIds,
        state.customValuesByValueId,
      );
      await sessionQuery.refetch();
      setSaveMessage(
        `Diseno guardado correctamente. Version ${result.version} lista para Odoo.`,
      );
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "No se pudo guardar el diseno.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    navigate(nextUrl, { replace: true });
  }

  return (
    <main className="configurator-page">
      <header className="app-header">
        <div className="app-header__title">
          <p className="eyebrow">Configurador visual externo</p>
          <h1>{session.productName}</h1>
          <div className="app-header__subline">
            <p className="page-subtitle">
              Orden {session.orderName} · Linea #{session.saleOrderLineId}
            </p>
            <div className="header-chips" aria-label="Resumen rapido">
              <span className="header-chip">V{session.status.version}</span>
              <span className="header-chip">{formatDateTime(session.status.generatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="app-header__meta">
          <div className="meta-pill meta-pill--compact">
            <span>Usuario</span>
            <strong>{authQuery.data.user.name}</strong>
          </div>
          <div className="meta-pill meta-pill--compact">
            <span>Estado Odoo</span>
            <strong>{session.status.orderState}</strong>
          </div>
          <button
            type="button"
            className="secondary-button secondary-button--compact"
            onClick={handleLogout}
          >
            Cerrar sesion
          </button>
        </div>
      </header>

      {hasNotices ? (
        <section className="notice-tray" aria-live="polite">
          <div className="notice-tray__summary">
            <span
              className={[
                "notice-tray__badge",
                isReadOnly ? "notice-tray__badge--info" : "notice-tray__badge--warning",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {isReadOnly
                ? "Solo lectura"
                : `${session.warnings.length} alerta${
                    session.warnings.length > 1 ? "s" : ""
                  }`}
            </span>

            <p className="notice-tray__headline">{noticeHeadline}</p>

            <button
              type="button"
              className="notice-tray__toggle"
              onClick={() => setAreNoticesExpanded((current) => !current)}
            >
              {areNoticesExpanded ? "Ocultar" : "Ver"}
            </button>
          </div>

          {areNoticesExpanded ? (
            <div className="notice-tray__details">
              {isReadOnly ? (
                <p className="info-banner">
                  La linea esta en modo lectura. Puedes revisar el diseno, pero no
                  guardar cambios.
                </p>
              ) : null}

              {session.warnings.map((warning) => (
                <p key={warning} className="warning-banner">
                  {warning}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="configurator-layout">
        <aside className="configurator-panel" aria-label="Panel de configuracion">
          <div className="configurator-shell">
            <form className="configurator-form" onSubmit={handleSave}>
              <div className="configurator-form__scroll">
                {ui.groups.map((group) => (
                  <div
                    key={group.attributeId}
                    ref={(node) => {
                      if (node) {
                        attributeSectionRefs.current.set(group.attributeId, node);
                      } else {
                        attributeSectionRefs.current.delete(group.attributeId);
                      }
                    }}
                  >
                    <AttributeSection
                      group={group}
                      selectedValueIds={state.selectedValueIds[String(group.attributeId)] ?? []}
                      disabledValueIds={disabledValueIds}
                      disabled={isReadOnly}
                      expanded={expandedAttributeId === group.attributeId}
                      selectionLabel={getSelectionLabel(group.attributeId)}
                      customValuesByValueId={state.customValuesByValueId}
                      onExpandToggle={() =>
                        setExpandedAttributeId((current) =>
                          current === group.attributeId ? null : group.attributeId,
                        )
                      }
                      onSelect={(valueId) =>
                        handleSingleSelect(group.attributeId, valueId)
                      }
                      onToggle={(valueId) =>
                        handleMultiToggle(group.attributeId, valueId)
                      }
                      onCustomValueChange={(valueId, value) =>
                        dispatch({ type: "SET_CUSTOM_VALUE", valueId, value })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="save-panel save-panel--sticky">
                <div className="save-panel__topline">
                  <div className="save-panel__summary">
                    <strong>
                      {completedGroups}/{ui.groups.length} listos
                    </strong>
                    <span>Canvas visible mientras editas</span>
                  </div>
                  <span className="save-panel__version">V{session.status.version}</span>
                </div>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={isSaving || isReadOnly || !currentBlob}
                >
                  {isSaving
                    ? "Guardando..."
                    : isReadOnly
                      ? "Solo lectura"
                      : currentBlob
                        ? "Guardar diseno"
                        : "Preparando imagen..."}
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
          </div>
        </aside>

        <section className="preview-panel" aria-label="Panel de previsualizacion">
          <DesignPreviewCanvas
            scene={ui.previewScene}
            readOnly={isReadOnly}
            onBlobReady={setCurrentBlob}
          />
        </section>
      </div>
    </main>
  );
}
