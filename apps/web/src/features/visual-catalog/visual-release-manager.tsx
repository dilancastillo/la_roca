import { useEffect, useMemo, useState } from "react";
import type {
  VisualDefinitionSummary,
  VisualRelease,
  VisualReleaseChecklist,
  VisualReleaseScenario,
} from "@repo/shared/schemas/visual-catalog";
import {
  approveVisualRelease,
  createVisualRelease,
  fetchVisualReleaseScenarios,
  publishVisualRelease,
  restoreVisualRelease,
  submitVisualRelease,
  updateVisualReleaseChecklist,
} from "./api";

const CHECKLIST_ITEMS: Array<{
  key: keyof VisualReleaseChecklist;
  label: string;
  detail: string;
}> = [
  {
    key: "odooReferences",
    label: "Referencias Odoo",
    detail: "Los IDs de producto, atributo y valor siguen vigentes.",
  },
  {
    key: "combinations",
    label: "Combinaciones",
    detail: "Se probaron las opciones que muestran u ocultan el componente.",
  },
  {
    key: "colorsAndTrims",
    label: "Colores y vivos",
    detail: "Rellenos, lineales y ausencia de color se comportan correctamente.",
  },
  {
    key: "placement",
    label: "Posicion y escala",
    detail: "El componente queda alineado y sin recortes.",
  },
  {
    key: "productFamilies",
    label: "Productos objetivo",
    detail: "Se revisaron Blusa, Pantalon o Uniforme segun corresponda.",
  },
  {
    key: "browserRender",
    label: "Vista del asesor",
    detail: "La candidata se probo en el configurador real de laboratorio.",
  },
  {
    key: "savedRender",
    label: "Escenario guardado",
    detail: "Existe al menos un escenario reproducible de prueba.",
  },
  {
    key: "comparison",
    label: "Comparacion",
    detail: "Se comparo la candidata con la version actualmente publicada.",
  },
  {
    key: "noDuplicates",
    label: "Sin duplicados",
    detail: "No aparecen componentes, contornos ni pespuntes repetidos.",
  },
];

function getReleaseStatusLabel(status: VisualRelease["status"]) {
  if (status === "candidate") return "Candidata";
  if (status === "review") return "En revision";
  if (status === "approved") return "Aprobada";
  if (status === "active") return "En produccion";
  return "Retirada";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function getDefinitionDisplayLabel(definition: VisualDefinitionSummary) {
  const genderCondition = definition.activationConditions.find(
    (condition) => normalize(condition.attributeName) === "genero",
  );
  const genderValue = genderCondition?.valueNames.find((valueName) => {
    const normalizedValue = normalize(valueName);
    return normalizedValue === "hombre" || normalizedValue === "mujer";
  });

  return `${definition.displayName}${genderValue ? ` · ${genderValue.trim()}` : ""}`;
}

type VisualReleaseManagerProps = {
  definitions: VisualDefinitionSummary[];
  releases: VisualRelease[];
  activeReleaseId: string | null;
  canPublish: boolean;
  onRefresh: () => Promise<void>;
  onMessage: (message: string) => void;
  onError: (message: string) => void;
  onOpenLaboratory: (
    releaseId: string,
    saleOrderLineId: number,
    scenarioId?: string,
  ) => void;
};

export function VisualReleaseManager({
  definitions,
  releases,
  activeReleaseId,
  canPublish,
  onRefresh,
  onMessage,
  onError,
  onOpenLaboratory,
}: VisualReleaseManagerProps) {
  const [displayName, setDisplayName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedDefinitionIds, setSelectedDefinitionIds] = useState<string[]>([]);
  const [lineIdsByRelease, setLineIdsByRelease] = useState<Record<string, string>>({});
  const [scenariosByRelease, setScenariosByRelease] = useState<
    Record<string, VisualReleaseScenario[]>
  >({});
  const [isBusy, setIsBusy] = useState(false);

  const approvedDefinitions = useMemo(
    () => definitions.filter((definition) => definition.status === "approved"),
    [definitions],
  );
  const definitionsById = useMemo(
    () => new Map(definitions.map((definition) => [definition.id, definition])),
    [definitions],
  );

  useEffect(() => {
    let isCurrent = true;

    void Promise.all(
      releases.map(async (release) => [
        release.id,
        await fetchVisualReleaseScenarios(release.id),
      ] as const),
    )
      .then((entries) => {
        if (isCurrent) {
          setScenariosByRelease(Object.fromEntries(entries));
        }
      })
      .catch(() => {
        if (isCurrent) {
          setScenariosByRelease({});
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [releases]);

  async function runAction(action: () => Promise<unknown>, success: string) {
    setIsBusy(true);
    onError("");
    onMessage("");

    try {
      await action();
      await onRefresh();
      onMessage(success);
    } catch (error) {
      // The database is authoritative for release state. Refresh even after a
      // failed transition so a stale card cannot invite a second restore.
      try {
        await onRefresh();
      } catch {
        // Preserve the original action error for the user.
      }
      onError(
        error instanceof Error
          ? error.message
          : "No se pudo completar la operacion de la release.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCreateRelease() {
    if (!displayName.trim() || selectedDefinitionIds.length === 0) {
      onError("Escribe un nombre y selecciona al menos un componente aprobado.");
      return;
    }

    await runAction(
      async () => {
        await createVisualRelease({
          displayName: displayName.trim(),
          notes: notes.trim(),
          changedDefinitionIds: selectedDefinitionIds,
        });
        setDisplayName("");
        setNotes("");
        setSelectedDefinitionIds([]);
      },
      "Release candidata creada. Ya puedes probarla sin afectar a los asesores.",
    );
  }

  async function handleChecklistChange(
    release: VisualRelease,
    key: keyof VisualReleaseChecklist,
    checked: boolean,
  ) {
    await runAction(
      () =>
        updateVisualReleaseChecklist(release.id, {
          ...release.checklist,
          [key]: checked,
        }),
      "Lista de comprobacion actualizada.",
    );
  }

  function openLaboratory(release: VisualRelease) {
    const rawLineId = lineIdsByRelease[release.id] ?? "";
    const saleOrderLineId = Number(rawLineId);

    if (!Number.isInteger(saleOrderLineId) || saleOrderLineId <= 0) {
      onError("Escribe un ID valido de linea de venta para abrir el laboratorio.");
      return;
    }

    onOpenLaboratory(release.id, saleOrderLineId);
  }

  return (
    <section className="visual-release-workspace">
      <header className="visual-release-intro">
        <div>
          <p className="eyebrow">Publicacion controlada</p>
          <h2>Releases visuales</h2>
          <p>
            Una release agrupa componentes aprobados, conserva la version actual y
            solo llega al configurador del asesor cuando se publica.
          </p>
        </div>
        <div className="visual-release-current">
          <span>Produccion</span>
          <strong>
            {releases.find((release) => release.id === activeReleaseId)?.displayName ??
              "Catalogo heredado"}
          </strong>
        </div>
      </header>

      <div className="visual-release-create">
        <div className="visual-release-create__fields">
          <label>
            Nombre de la release
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Ej. Cuellos agosto 2026"
            />
          </label>
          <label>
            Notas para revision
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Que cambia y que combinaciones deben revisarse"
            />
          </label>
        </div>

        <fieldset className="visual-release-definition-picker">
          <legend>Componentes aprobados que cambian</legend>
          {approvedDefinitions.length === 0 ? (
            <p className="catalog-empty">
              Primero aprueba una version desde la pestaña Versiones.
            </p>
          ) : (
            approvedDefinitions.map((definition) => (
              <label key={definition.id}>
                <input
                  type="checkbox"
                  checked={selectedDefinitionIds.includes(definition.id)}
                  onChange={(event) =>
                    setSelectedDefinitionIds((current) =>
                      event.target.checked
                        ? [...current, definition.id]
                        : current.filter((id) => id !== definition.id),
                    )
                  }
                />
                <span>
                  <strong>{getDefinitionDisplayLabel(definition)}</strong>
                  <small>
                    {definition.binding.attributeName}: {definition.binding.valueName} ·
                    version {definition.version}
                  </small>
                </span>
              </label>
            ))
          )}
        </fieldset>

        <button
          type="button"
          className="primary-button"
          onClick={() => void handleCreateRelease()}
          disabled={isBusy || approvedDefinitions.length === 0}
        >
          Crear candidata
        </button>
      </div>

      <div className="visual-release-list">
        {releases.length === 0 ? (
          <p className="catalog-empty">
            Aun no hay releases. La produccion sigue usando el catalogo publicado
            anterior.
          </p>
        ) : (
          releases.map((release) => {
            const completedChecks = Object.values(release.checklist).filter(Boolean).length;
            const scenarios = scenariosByRelease[release.id] ?? [];
            return (
              <article className="visual-release-card" key={release.id}>
                <header className="visual-release-card__header">
                  <div>
                    <span
                      className={`visual-status visual-status--release-${release.status}`}
                    >
                      {getReleaseStatusLabel(release.status)}
                    </span>
                    <h3>R{release.number} · {release.displayName}</h3>
                    <p>{release.notes || "Sin notas."}</p>
                    <small>
                      Creada {formatDate(release.createdAt)} · {release.definitionIds.length}
                      {" "}componentes en la fotografia completa
                    </small>
                  </div>
                  <div className="visual-release-card__progress">
                    <strong>{completedChecks}/{CHECKLIST_ITEMS.length}</strong>
                    <span>comprobaciones</span>
                  </div>
                </header>

                <div className="visual-release-changes">
                  <strong>Cambios incluidos</strong>
                  <div>
                    {release.changedDefinitionIds.map((definitionId) => (
                      <span key={definitionId}>
                        {(() => {
                          const definition = definitionsById.get(definitionId);
                          return definition
                            ? `${getDefinitionDisplayLabel(definition)} · v${definition.version}`
                            : definitionId.slice(0, 8);
                        })()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="visual-release-changes">
                  <strong>Fotografia que probara el laboratorio</strong>
                  <div>
                    {release.definitionIds.map((definitionId) => {
                      const definition = definitionsById.get(definitionId);
                      return (
                        <span key={definitionId}>
                          {definition
                            ? `${getDefinitionDisplayLabel(definition)} · v${definition.version}`
                            : definitionId.slice(0, 8)}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="visual-release-lab-row">
                  <label>
                    Linea real de Odoo para probar
                    <input
                      type="number"
                      min={1}
                      value={lineIdsByRelease[release.id] ?? ""}
                      onChange={(event) =>
                        setLineIdsByRelease((current) => ({
                          ...current,
                          [release.id]: event.target.value,
                        }))
                      }
                      placeholder="Ej. 232"
                    />
                  </label>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => openLaboratory(release)}
                  >
                    Abrir laboratorio
                  </button>
                </div>

                {scenarios.length > 0 ? (
                  <div className="visual-release-scenarios">
                    <strong>Escenarios guardados</strong>
                    {scenarios.slice(0, 4).map((scenario) => (
                      <button
                        type="button"
                        key={scenario.id}
                        onClick={() => {
                          setLineIdsByRelease((current) => ({
                            ...current,
                            [release.id]: String(scenario.saleOrderLineId),
                          }));
                          onOpenLaboratory(
                            release.id,
                            scenario.saleOrderLineId,
                            scenario.id,
                          );
                        }}
                      >
                        <span>{scenario.displayName}</span>
                        <small>Linea {scenario.saleOrderLineId} · {formatDate(scenario.updatedAt)}</small>
                      </button>
                    ))}
                  </div>
                ) : null}

                <fieldset className="visual-release-checklist">
                  <legend>Lista obligatoria antes de revision</legend>
                  {CHECKLIST_ITEMS.map((item) => (
                    <label key={item.key}>
                      <input
                        type="checkbox"
                        checked={release.checklist[item.key]}
                        disabled={release.status !== "candidate" || isBusy}
                        onChange={(event) =>
                          void handleChecklistChange(
                            release,
                            item.key,
                            event.target.checked,
                          )
                        }
                      />
                      <span>
                        <strong>{item.label}</strong>
                        <small>{item.detail}</small>
                      </span>
                    </label>
                  ))}
                </fieldset>

                <footer className="visual-release-card__actions">
                  {release.status === "candidate" ? (
                    <button
                      type="button"
                      className="primary-button"
                      disabled={isBusy || completedChecks !== CHECKLIST_ITEMS.length}
                      onClick={() =>
                        void runAction(
                          () => submitVisualRelease(release.id),
                          `R${release.number} enviada a revision.`,
                        )
                      }
                    >
                      Enviar a revision
                    </button>
                  ) : null}
                  {release.status === "review" ? (
                    <button
                      type="button"
                      className="primary-button"
                      disabled={isBusy}
                      onClick={() =>
                        void runAction(
                          () => approveVisualRelease(release.id),
                          `R${release.number} aprobada. Aun no esta en produccion.`,
                        )
                      }
                    >
                      Aprobar release
                    </button>
                  ) : null}
                  {release.status === "approved" ? (
                    <button
                      type="button"
                      className="primary-button"
                      disabled={isBusy || !canPublish}
                      title={
                        !canPublish
                          ? "Tu usuario no tiene permiso de publicacion."
                          : undefined
                      }
                      onClick={() => {
                        if (
                          window.confirm(
                            `Publicar R${release.number} aplicara unicamente sus cambios incluidos a produccion. Los demas modelos publicados se conservan. ¿Continuar?`,
                          )
                        ) {
                          void runAction(
                            () => publishVisualRelease(release.id),
                            `R${release.number} publicada en produccion.`,
                          );
                        }
                      }}
                    >
                      Publicar en produccion
                    </button>
                  ) : null}
                  {release.status === "retired" ? (
                    <button
                      type="button"
                      className="secondary-button"
                      disabled={isBusy || !canPublish}
                      title={canPublish ? undefined : "Tu usuario no tiene permiso de publicacion."}
                      onClick={() => {
                        if (
                          window.confirm(
                            `Restaurar R${release.number} la convertira nuevamente en la version activa. ¿Continuar?`,
                          )
                        ) {
                          void runAction(
                            () => restoreVisualRelease(release.id),
                            `R${release.number} restaurada como version activa.`,
                          );
                        }
                      }}
                    >
                      Restaurar esta version
                    </button>
                  ) : null}
                  {release.id === activeReleaseId ? (
                    <span className="visual-release-active-label">Version activa</span>
                  ) : null}
                </footer>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
