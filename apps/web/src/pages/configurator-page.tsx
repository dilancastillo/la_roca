import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type {
  ConfiguratorSession,
  UploadedAttachment,
} from "@repo/shared/schemas/configurator";
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
import {
  applyRenderedPreviewUpdate,
  createPreviewSceneKey,
  type RenderedPreview,
} from "../features/preview/rendered-preview";
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

  return group.selectionMode === "multiple";
}

type MissingCustomValue = {
  attributeId: number;
  attributeLabel: string;
  optionName: string;
  valueId: number;
};

function getMissingCustomValues(
  groups: UiAttributeGroup[],
  selectedValueIds: Record<string, number[]>,
  customValuesByValueId: Record<string, string>,
) {
  const missing: MissingCustomValue[] = [];

  for (const group of groups) {
    const selectedIds = new Set(selectedValueIds[String(group.attributeId)] ?? []);

    for (const option of group.options) {
      if (!option.allowsCustomValue || !selectedIds.has(option.id)) {
        continue;
      }

      const customValue = customValuesByValueId[String(option.id)] ?? "";

      if (customValue.trim().length === 0) {
        missing.push({
          attributeId: group.attributeId,
          attributeLabel: group.label,
          optionName: option.name,
          valueId: option.id,
        });
      }
    }
  }

  return missing;
}

const LOGO_ATTACHMENT_MAX_BYTES = 2 * 1024 * 1024;
const LOGO_ATTACHMENT_ACCEPT = "image/png,image/jpeg,image/webp,image/svg+xml";

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("No se pudo leer la imagen del logo."));
        return;
      }

      resolve(result.includes(",") ? result.split(",").pop() ?? "" : result);
    });
    reader.addEventListener("error", () => {
      reject(new Error("No se pudo leer la imagen del logo."));
    });
    reader.readAsDataURL(file);
  });
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
  const [currentPreview, setCurrentPreview] = useState<RenderedPreview | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [logoAttachment, setLogoAttachment] =
    useState<UploadedAttachment | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [expandedAttributeId, setExpandedAttributeId] = useState<number | null>(null);
  const [invalidCustomValueIds, setInvalidCustomValueIds] = useState<Set<number>>(
    () => new Set<number>(),
  );
  const [areNoticesExpanded, setAreNoticesExpanded] = useState(false);
  const attributeSectionRefs = useRef(new Map<number, HTMLDivElement>());
  const hasInitializedExpandedAttributeRef = useRef(false);
  const initializedLineIdRef = useRef<number | null>(null);
  const latestPreviewSceneKeyRef = useRef("");
  const previousLineIdRef = useRef<number | null>(null);

  const nextUrl = `/login?next=${encodeURIComponent(location.pathname)}`;
  const sessionQuery = useConfiguratorSession(lineId, Boolean(authQuery.data));

  useEffect(() => {
    if (!sessionQuery.data) {
      return;
    }

    if (initializedLineIdRef.current === lineId) {
      return;
    }

    initializedLineIdRef.current = lineId;
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
    setInvalidCustomValueIds(new Set());
  }, [lineId, sessionQuery.data]);

  const uiModel = useMemo(() => {
    if (!sessionQuery.data) {
      return null;
    }

    return deriveConfiguratorUi(sessionQuery.data, state.selectedValueIds);
  }, [sessionQuery.data, state.selectedValueIds]);

  useEffect(() => {
    if (uiModel?.logoSelection) {
      return;
    }

    setLogoAttachment(null);
    setLogoUploadError(null);
  }, [uiModel?.logoSelection]);

  const previewSceneKey = useMemo(
    () => (uiModel ? createPreviewSceneKey(uiModel.previewScene) : ""),
    [uiModel],
  );

  useEffect(() => {
    latestPreviewSceneKeyRef.current = previewSceneKey;
  }, [previewSceneKey]);

  useEffect(() => {
    if (previousLineIdRef.current === lineId) {
      return;
    }

    previousLineIdRef.current = lineId;
    hasInitializedExpandedAttributeRef.current = false;
    setExpandedAttributeId(null);
    setInvalidCustomValueIds(new Set());
    setCurrentPreview(null);
  }, [lineId]);

  const handleBlobReady = useCallback((renderKey: string, blob: Blob | null) => {
    setCurrentPreview((current) =>
      applyRenderedPreviewUpdate(
        current,
        latestPreviewSceneKeyRef.current,
        renderKey,
        blob,
      ),
    );
  }, []);

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

  function handleCustomValueChange(valueId: number, value: string) {
    dispatch({ type: "SET_CUSTOM_VALUE", valueId, value });
    setInvalidCustomValueIds((current) => {
      if (!current.has(valueId)) {
        return current;
      }

      const next = new Set(current);

      if (value.trim().length > 0) {
        next.delete(valueId);
      }

      return next;
    });
  }

  async function handleLogoFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const [file] = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    setLogoUploadError(null);
    setSaveError(null);

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setLogoUploadError("Carga un archivo de imagen valido para el logo.");
      return;
    }

    if (file.size > LOGO_ATTACHMENT_MAX_BYTES) {
      setLogoUploadError("La imagen del logo debe pesar maximo 2 MB.");
      return;
    }

    try {
      const dataBase64 = await readFileAsBase64(file);
      setLogoAttachment({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        dataBase64,
      });
    } catch (error) {
      setLogoUploadError(
        error instanceof Error
          ? error.message
          : "No se pudo leer la imagen del logo.",
      );
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveMessage(null);
    setSaveError(null);

    if (isReadOnly) {
      setSaveError("La linea esta en modo lectura y no acepta nuevos cambios.");
      return;
    }

    const missingCustomValues = getMissingCustomValues(
      ui.groups,
      state.selectedValueIds,
      state.customValuesByValueId,
    );

    if (missingCustomValues.length > 0) {
      const [firstMissing] = missingCustomValues;

      if (!firstMissing) {
        return;
      }

      setInvalidCustomValueIds(
        new Set(missingCustomValues.map((item) => item.valueId)),
      );
      setExpandedAttributeId(firstMissing.attributeId);
      window.setTimeout(() => {
        attributeSectionRefs.current
          .get(firstMissing.attributeId)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
      setSaveError(
        missingCustomValues.length === 1
          ? `Falta llenar el texto personalizado de "${firstMissing.attributeLabel}".`
          : `Faltan ${missingCustomValues.length} textos personalizados obligatorios por llenar.`,
      );
      return;
    }

    setInvalidCustomValueIds(new Set());

    if (ui.logoSelection && !logoAttachment) {
      setLogoUploadError(
        `Carga la imagen del logo para "${ui.logoSelection.label}" antes de guardar.`,
      );
      setSaveError("Falta cargar la imagen obligatoria del logo.");
      return;
    }

    const previewBlob =
      currentPreview?.renderKey === previewSceneKey ? currentPreview.blob : null;

    if (!previewBlob) {
      setSaveError(
        "La imagen aun se esta actualizando. Espera a que el preview quede en Listo y vuelve a guardar.",
      );
      return;
    }

    try {
      setIsSaving(true);
      const result = await saveDesign(
        lineId,
        previewBlob,
        state.selectedValueIds,
        state.customValuesByValueId,
        ui.logoSelection ? logoAttachment : null,
      );
      queryClient.setQueryData<ConfiguratorSession>(
        ["configurator-session", lineId],
        (current) =>
          current
            ? {
                ...current,
                productId: result.productId ?? current.productId,
                selectedValueIds: state.selectedValueIds,
                customValuesByValueId: state.customValuesByValueId,
                status: {
                  ...current.status,
                  version: result.version ?? current.status.version,
                  generatedAt: result.generatedAt ?? current.status.generatedAt,
                },
              }
            : current,
      );
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
                      onCustomValueChange={handleCustomValueChange}
                      invalidCustomValueIds={invalidCustomValueIds}
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

                {ui.logoSelection ? (
                  <div className="logo-upload-panel">
                    <div className="logo-upload-panel__header">
                      <div>
                        <strong>Imagen de logo</strong>
                        <span>{ui.logoSelection.label}</span>
                      </div>
                      {!isReadOnly ? (
                        <label className="logo-upload-panel__action">
                          <input
                            type="file"
                            accept={LOGO_ATTACHMENT_ACCEPT}
                            disabled={isSaving}
                            onChange={handleLogoFileChange}
                          />
                          {logoAttachment ? "Cambiar" : "Cargar"}
                        </label>
                      ) : null}
                    </div>

                    {logoAttachment ? (
                      <div className="logo-upload-panel__file">
                        <span>{logoAttachment.filename}</span>
                        {!isReadOnly ? (
                          <button
                            type="button"
                            className="logo-upload-panel__remove"
                            onClick={() => setLogoAttachment(null)}
                            disabled={isSaving}
                          >
                            Quitar
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      <p className="logo-upload-panel__hint">
                        Obligatorio: adjunta la imagen real del logo para poder guardar.
                      </p>
                    )}

                    {logoUploadError ? (
                      <p className="error-banner" role="alert">
                        {logoUploadError}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <button
                  type="submit"
                  className="primary-button"
                  disabled={
                    isSaving ||
                    isReadOnly ||
                    currentPreview?.renderKey !== previewSceneKey
                  }
                >
                  {isSaving
                    ? "Guardando..."
                    : isReadOnly
                      ? "Solo lectura"
                      : currentPreview?.renderKey === previewSceneKey
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
            renderKey={previewSceneKey}
            readOnly={isReadOnly}
            onBlobReady={handleBlobReady}
          />
        </section>
      </div>
    </main>
  );
}
