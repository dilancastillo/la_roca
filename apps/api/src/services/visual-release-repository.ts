import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  visualReleaseAuditEventSchema,
  visualReleaseChecklistMutationSchema,
  visualReleaseCreateSchema,
  visualReleaseScenarioMutationSchema,
  visualReleaseScenarioSchema,
  visualReleaseSchema,
  type VisualDefinitionSummary,
  type VisualRelease,
  type VisualReleaseAuditEvent,
  type VisualReleaseScenario,
} from "@repo/shared/schemas/visual-catalog";
import {
  resolveVisualCatalogBackend,
  type AppEnv,
} from "../lib/app-env.js";
import { normalizePostgresDatetime } from "../lib/postgres-datetime.js";
import { listVisualDefinitions } from "./visual-catalog-repository.js";

const lineReleasePinSchema = z.object({
  saleOrderLineId: z.number().int().positive(),
  releaseId: z.string().uuid(),
  createdAt: z.string().datetime({ offset: true }),
});

type LineReleasePin = z.infer<typeof lineReleasePinSchema>;

interface VisualReleaseStore {
  listReleases(): Promise<VisualRelease[]>;
  reserveReleaseNumber(): Promise<number>;
  upsertRelease(release: VisualRelease): Promise<void>;
  getActiveReleaseId(): Promise<string | null>;
  setActiveReleaseId(releaseId: string | null): Promise<void>;
  listScenarios(releaseId?: string): Promise<VisualReleaseScenario[]>;
  upsertScenario(scenario: VisualReleaseScenario): Promise<void>;
  listAuditEvents(): Promise<VisualReleaseAuditEvent[]>;
  appendAuditEvent(event: VisualReleaseAuditEvent): Promise<void>;
  getLinePin(saleOrderLineId: number): Promise<LineReleasePin | null>;
  upsertLinePin(pin: LineReleasePin): Promise<void>;
  activateRelease(
    releaseId: string,
    actorEmail: string,
    action: "published" | "restored",
  ): Promise<VisualRelease>;
}

function safeJsonParse(value: string, fallback: unknown) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return fallback;
  }
}

async function readJsonFile<T>(
  filePath: string,
  schema: z.ZodType<T>,
  fallback: T,
) {
  try {
    return schema.parse(safeJsonParse(await readFile(filePath, "utf8"), fallback));
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return fallback;
    }
    throw error;
  }
}

class FileVisualReleaseStore implements VisualReleaseStore {
  private readonly baseDirectory: string;
  private readonly releasesPath: string;
  private readonly statePath: string;
  private readonly scenariosPath: string;
  private readonly auditPath: string;
  private readonly pinsPath: string;

  constructor(env: Partial<AppEnv>) {
    this.baseDirectory = path.resolve(
      process.cwd(),
      env.VISUAL_CATALOG_DATA_DIR ?? ".visual-catalog",
    );
    this.releasesPath = path.join(this.baseDirectory, "releases.json");
    this.statePath = path.join(this.baseDirectory, "release-state.json");
    this.scenariosPath = path.join(this.baseDirectory, "release-scenarios.json");
    this.auditPath = path.join(this.baseDirectory, "release-audit.json");
    this.pinsPath = path.join(this.baseDirectory, "line-release-pins.json");
  }

  private async write(filePath: string, value: unknown) {
    await mkdir(this.baseDirectory, { recursive: true });
    await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
  }

  async listReleases() {
    const releases = await readJsonFile(
      this.releasesPath,
      z.array(visualReleaseSchema),
      [],
    );
    return releases.sort((left, right) => right.number - left.number);
  }

  async reserveReleaseNumber() {
    const releases = await this.listReleases();
    return Math.max(0, ...releases.map((release) => release.number)) + 1;
  }

  async upsertRelease(release: VisualRelease) {
    const releases = await this.listReleases();
    const next = releases.some((candidate) => candidate.id === release.id)
      ? releases.map((candidate) => candidate.id === release.id ? release : candidate)
      : [release, ...releases];
    await this.write(this.releasesPath, next.sort((left, right) => right.number - left.number));
  }

  async getActiveReleaseId() {
    const state = await readJsonFile(
      this.statePath,
      z.object({ activeReleaseId: z.string().uuid().nullable() }),
      { activeReleaseId: null },
    );
    return state.activeReleaseId;
  }

  async setActiveReleaseId(releaseId: string | null) {
    await this.write(this.statePath, { activeReleaseId: releaseId });
  }

  async listScenarios(releaseId?: string) {
    const scenarios = await readJsonFile(
      this.scenariosPath,
      z.array(visualReleaseScenarioSchema),
      [],
    );
    return scenarios
      .filter((scenario) => !releaseId || scenario.releaseId === releaseId)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }

  async upsertScenario(scenario: VisualReleaseScenario) {
    const scenarios = await this.listScenarios();
    const next = scenarios.some((candidate) => candidate.id === scenario.id)
      ? scenarios.map((candidate) => candidate.id === scenario.id ? scenario : candidate)
      : [scenario, ...scenarios];
    await this.write(this.scenariosPath, next);
  }

  async listAuditEvents() {
    return await readJsonFile(
      this.auditPath,
      z.array(visualReleaseAuditEventSchema),
      [],
    );
  }

  async appendAuditEvent(event: VisualReleaseAuditEvent) {
    await this.write(this.auditPath, [event, ...(await this.listAuditEvents())]);
  }

  async getLinePin(saleOrderLineId: number) {
    const pins = await readJsonFile(
      this.pinsPath,
      z.array(lineReleasePinSchema),
      [],
    );
    return pins.find((pin) => pin.saleOrderLineId === saleOrderLineId) ?? null;
  }

  async upsertLinePin(pin: LineReleasePin) {
    const pins = await readJsonFile(
      this.pinsPath,
      z.array(lineReleasePinSchema),
      [],
    );
    const next = pins.some((candidate) => candidate.saleOrderLineId === pin.saleOrderLineId)
      ? pins.map((candidate) => candidate.saleOrderLineId === pin.saleOrderLineId ? pin : candidate)
      : [pin, ...pins];
    await this.write(this.pinsPath, next);
  }

  async activateRelease(
    releaseId: string,
    actorEmail: string,
    action: "published" | "restored",
  ) {
    const releases = await this.listReleases();
    const current = releases.find((release) => release.id === releaseId);

    if (!current) {
      throw new Error("La release visual no existe.");
    }

    if (action === "published" && current.status !== "approved") {
      throw new Error("La release debe estar aprobada antes de publicarse.");
    }

    if (action === "restored" && current.status !== "retired") {
      throw new Error("Solo una release retirada se puede restaurar.");
    }

    const now = new Date().toISOString();
    const activeId = await this.getActiveReleaseId();
    const previous = releases.find((release) => release.id === activeId);

    if (previous && previous.id !== current.id) {
      await this.upsertRelease(
        visualReleaseSchema.parse({
          ...previous,
          status: "retired",
          updatedAt: now,
        }),
      );
    }

    const next = visualReleaseSchema.parse({
      ...current,
      status: "active",
      publishedBy: actorEmail,
      publishedAt: current.publishedAt ?? now,
      updatedAt: now,
    });
    await this.upsertRelease(next);
    await this.setActiveReleaseId(next.id);
    await this.appendAuditEvent(
      visualReleaseAuditEventSchema.parse({
        id: randomUUID(),
        releaseId: next.id,
        action,
        actorEmail,
        createdAt: now,
        details: { previousReleaseId: previous?.id ?? null },
      }),
    );

    return next;
  }
}

class SupabaseVisualReleaseStore implements VisualReleaseStore {
  private readonly baseUrl: string;
  private readonly serviceRoleKey: string;

  constructor(env: Partial<AppEnv>) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Faltan las variables de Supabase para releases visuales.");
    }
    this.baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    this.serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  }

  private async request(pathname: string, init?: RequestInit) {
    const response = await fetch(`${this.baseUrl}/rest/v1/${pathname}`, {
      ...init,
      headers: {
        apikey: this.serviceRoleKey,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation,resolution=merge-duplicates",
        ...init?.headers,
      },
    });
    if (!response.ok) {
      throw new Error(`Supabase releases respondio ${response.status}: ${await response.text()}`);
    }
    return response;
  }

  private releaseToRow(release: VisualRelease) {
    return {
      id: release.id,
      number: release.number,
      display_name: release.displayName,
      notes: release.notes,
      status: release.status,
      definition_ids: release.definitionIds,
      changed_definition_ids: release.changedDefinitionIds,
      baseline_definition_ids: release.baselineDefinitionIds,
      base_release_id: release.baseReleaseId,
      checklist: release.checklist,
      created_by: release.createdBy,
      approved_by: release.approvedBy,
      published_by: release.publishedBy,
      created_at: release.createdAt,
      updated_at: release.updatedAt,
      submitted_at: release.submittedAt,
      approved_at: release.approvedAt,
      published_at: release.publishedAt,
    };
  }

  private rowToRelease(row: Record<string, unknown>) {
    return visualReleaseSchema.parse({
      id: row.id,
      number: row.number,
      displayName: row.display_name,
      notes: row.notes,
      status: row.status,
      definitionIds: row.definition_ids,
      changedDefinitionIds: row.changed_definition_ids,
      baselineDefinitionIds: row.baseline_definition_ids,
      baseReleaseId: row.base_release_id,
      checklist: row.checklist,
      createdBy: row.created_by,
      approvedBy: row.approved_by,
      publishedBy: row.published_by,
      createdAt: normalizePostgresDatetime(row.created_at),
      updatedAt: normalizePostgresDatetime(row.updated_at),
      submittedAt: normalizePostgresDatetime(row.submitted_at),
      approvedAt: normalizePostgresDatetime(row.approved_at),
      publishedAt: normalizePostgresDatetime(row.published_at),
    });
  }

  async listReleases() {
    const response = await this.request("visual_catalog_releases?select=*&order=number.desc");
    return ((await response.json()) as Record<string, unknown>[]).map((row) => this.rowToRelease(row));
  }

  async reserveReleaseNumber() {
    const response = await this.request(
      "rpc/visual_catalog_next_release_number",
      {
        method: "POST",
        body: "{}",
      },
    );
    const value = Number(await response.json());

    if (!Number.isInteger(value) || value <= 0) {
      throw new Error("Supabase no pudo reservar el numero de release.");
    }

    return value;
  }

  async upsertRelease(release: VisualRelease) {
    await this.request("visual_catalog_releases?on_conflict=id", {
      method: "POST",
      body: JSON.stringify(this.releaseToRow(release)),
    });
  }

  async getActiveReleaseId() {
    const response = await this.request("visual_catalog_release_state?id=eq.production&select=active_release_id");
    const [row] = (await response.json()) as Array<{ active_release_id?: string | null }>;
    return row?.active_release_id ?? null;
  }

  async setActiveReleaseId(releaseId: string | null) {
    await this.request("visual_catalog_release_state?on_conflict=id", {
      method: "POST",
      body: JSON.stringify({ id: "production", active_release_id: releaseId, updated_at: new Date().toISOString() }),
    });
  }

  async listScenarios(releaseId?: string) {
    const filter = releaseId ? `&release_id=eq.${encodeURIComponent(releaseId)}` : "";
    const response = await this.request(`visual_catalog_release_scenarios?select=*&order=updated_at.desc${filter}`);
    return ((await response.json()) as Record<string, unknown>[]).map((row) =>
      visualReleaseScenarioSchema.parse({
        id: row.id,
        releaseId: row.release_id,
        saleOrderLineId: row.sale_order_line_id,
        displayName: row.display_name,
        selectedValueIds: row.selected_value_ids,
        customValuesByValueId: row.custom_values_by_value_id,
        createdBy: row.created_by,
        createdAt: normalizePostgresDatetime(row.created_at),
        updatedAt: normalizePostgresDatetime(row.updated_at),
      }),
    );
  }

  async upsertScenario(scenario: VisualReleaseScenario) {
    await this.request("visual_catalog_release_scenarios?on_conflict=id", {
      method: "POST",
      body: JSON.stringify({
        id: scenario.id,
        release_id: scenario.releaseId,
        sale_order_line_id: scenario.saleOrderLineId,
        display_name: scenario.displayName,
        selected_value_ids: scenario.selectedValueIds,
        custom_values_by_value_id: scenario.customValuesByValueId,
        created_by: scenario.createdBy,
        created_at: scenario.createdAt,
        updated_at: scenario.updatedAt,
      }),
    });
  }

  async listAuditEvents() {
    const response = await this.request("visual_catalog_release_audit?select=*&order=created_at.desc");
    return ((await response.json()) as Record<string, unknown>[]).map((row) =>
      visualReleaseAuditEventSchema.parse({
        id: row.id,
        releaseId: row.release_id,
        action: row.action,
        actorEmail: row.actor_email,
        createdAt: normalizePostgresDatetime(row.created_at),
        details: row.details,
      }),
    );
  }

  async appendAuditEvent(event: VisualReleaseAuditEvent) {
    await this.request("visual_catalog_release_audit", {
      method: "POST",
      body: JSON.stringify({
        id: event.id,
        release_id: event.releaseId,
        action: event.action,
        actor_email: event.actorEmail,
        created_at: event.createdAt,
        details: event.details,
      }),
    });
  }

  async getLinePin(saleOrderLineId: number) {
    const response = await this.request(`visual_catalog_line_release_pins?sale_order_line_id=eq.${saleOrderLineId}&select=*`);
    const [row] = (await response.json()) as Record<string, unknown>[];
    return row
      ? lineReleasePinSchema.parse({
          saleOrderLineId: row.sale_order_line_id,
          releaseId: row.release_id,
          createdAt: normalizePostgresDatetime(row.created_at),
        })
      : null;
  }

  async upsertLinePin(pin: LineReleasePin) {
    await this.request("visual_catalog_line_release_pins?on_conflict=sale_order_line_id", {
      method: "POST",
      body: JSON.stringify({ sale_order_line_id: pin.saleOrderLineId, release_id: pin.releaseId, created_at: pin.createdAt }),
    });
  }

  async activateRelease(
    releaseId: string,
    actorEmail: string,
    action: "published" | "restored",
  ) {
    const response = await this.request(
      "rpc/visual_catalog_activate_release",
      {
        method: "POST",
        body: JSON.stringify({
          p_release_id: releaseId,
          p_actor_email: actorEmail,
          p_action: action,
        }),
      },
    );
    const rows = (await response.json()) as Record<string, unknown>[];
    const [row] = rows;

    if (!row) {
      throw new Error("Supabase no devolvio la release activada.");
    }

    return this.rowToRelease(row);
  }
}

function getStore(env: Partial<AppEnv>): VisualReleaseStore {
  return resolveVisualCatalogBackend(env) === "supabase"
    ? new SupabaseVisualReleaseStore(env)
    : new FileVisualReleaseStore(env);
}

function normalizeConditions(definition: VisualDefinitionSummary) {
  return JSON.stringify(definition.activationConditions.map((condition) => ({
    attributeId: condition.attributeId,
    sourceValueIds: [...condition.sourceValueIds].sort((a, b) => a - b),
  })).sort((a, b) =>
    a.attributeId - b.attributeId ||
    JSON.stringify(a.sourceValueIds).localeCompare(JSON.stringify(b.sourceValueIds)),
  ));
}

function hasSameVisualIdentity(
  left: VisualDefinitionSummary,
  right: VisualDefinitionSummary,
) {
  return left.slot === right.slot &&
    left.layer === right.layer &&
    left.binding.attributeId === right.binding.attributeId &&
    (left.binding.sourceValueId ?? left.binding.valueId) === (right.binding.sourceValueId ?? right.binding.valueId) &&
    normalizeConditions(left) === normalizeConditions(right);
}

function hasSameTarget(left: VisualDefinitionSummary, right: VisualDefinitionSummary) {
  const leftProducts = [...left.binding.productTemplateIds].sort((a, b) => a - b);
  const rightProducts = [...right.binding.productTemplateIds].sort((a, b) => a - b);
  return hasSameVisualIdentity(left, right) &&
    JSON.stringify(leftProducts) === JSON.stringify(rightProducts);
}

function findSupersededReleaseDefinitions(
  release: VisualRelease,
  definitions: VisualDefinitionSummary[],
) {
  const byId = new Map(definitions.map((definition) => [definition.id, definition]));

  return release.definitionIds.flatMap((definitionId) => {
    const current = byId.get(definitionId);
    if (!current) {
      return [];
    }

    const newer = definitions.find(
      (candidate) =>
        candidate.id !== current.id &&
        candidate.version > current.version &&
        (candidate.status === "approved" || candidate.status === "published") &&
        hasSameTarget(candidate, current),
    );

    return newer ? [{ current, newer }] : [];
  });
}

function hasOverlappingProductScope(
  left: VisualDefinitionSummary,
  right: VisualDefinitionSummary,
) {
  return left.binding.productTemplateIds.some((id) =>
    right.binding.productTemplateIds.includes(id),
  );
}

function emptyChecklist() {
  return {
    odooReferences: false,
    combinations: false,
    colorsAndTrims: false,
    placement: false,
    productFamilies: false,
    browserRender: false,
    savedRender: false,
    comparison: false,
    noDuplicates: false,
  };
}

function isChecklistComplete(release: VisualRelease) {
  return Object.values(release.checklist).every(Boolean);
}

async function appendAudit(
  store: VisualReleaseStore,
  releaseId: string,
  action: VisualReleaseAuditEvent["action"],
  actorEmail: string,
  details: Record<string, unknown> = {},
) {
  await store.appendAuditEvent(visualReleaseAuditEventSchema.parse({
    id: randomUUID(), releaseId, action, actorEmail,
    createdAt: new Date().toISOString(), details,
  }));
}

export async function listVisualReleases(env: Partial<AppEnv>) {
  const store = getStore(env);
  return { releases: await store.listReleases(), activeReleaseId: await store.getActiveReleaseId() };
}

export async function getVisualRelease(env: Partial<AppEnv>, releaseId: string) {
  const release = (await getStore(env).listReleases()).find((candidate) => candidate.id === releaseId);
  if (!release) throw new Error("La release visual no existe.");
  return release;
}

export async function createVisualReleaseCandidate(
  env: Partial<AppEnv>,
  rawInput: unknown,
  definitions: VisualDefinitionSummary[],
  actorEmail: string,
) {
  const input = visualReleaseCreateSchema.parse(rawInput);
  const changedDefinitions = input.changedDefinitionIds.map((id) => definitions.find((definition) => definition.id === id));
  if (changedDefinitions.some((definition) => !definition)) throw new Error("Una definicion seleccionada no existe.");
  if (changedDefinitions.some((definition) => definition?.status !== "approved" && definition?.status !== "published")) {
    throw new Error("Solo se pueden incluir componentes aprobados en una release candidata.");
  }
  const store = getStore(env);
  const releases = await store.listReleases();
  const activeReleaseId = await store.getActiveReleaseId();
  const activeRelease = releases.find((release) => release.id === activeReleaseId);
  const baselineDefinitionIds = activeRelease?.definitionIds ?? definitions.filter((definition) => definition.status === "published").map((definition) => definition.id);
  const baselineDefinitions = baselineDefinitionIds.map((id) => definitions.find((definition) => definition.id === id)).filter((definition): definition is VisualDefinitionSummary => Boolean(definition));
  const selected = changedDefinitions.filter((definition): definition is VisualDefinitionSummary => Boolean(definition));
  const duplicatedTarget = selected.find((definition, index) =>
    selected.some(
      (candidate, candidateIndex) =>
        candidateIndex !== index && hasSameTarget(definition, candidate),
    ),
  );
  if (duplicatedTarget) {
    throw new Error(
      `La release contiene mas de una version para ${duplicatedTarget.displayName}. Selecciona solo una.`,
    );
  }
  const unsafeScopeChange = selected.find((definition) =>
    baselineDefinitions.some(
      (baseline) =>
        hasSameVisualIdentity(baseline, definition) &&
        hasOverlappingProductScope(baseline, definition) &&
        !hasSameTarget(baseline, definition),
    ),
  );
  if (unsafeScopeChange) {
    throw new Error(
      `La version ${unsafeScopeChange.displayName} cambia parcialmente las plantillas del componente anterior. Conserva exactamente el mismo alcance o crea versiones separadas antes de publicar.`,
    );
  }
  const retained = baselineDefinitions.filter(
    (baseline) => !selected.some((candidate) => hasSameTarget(baseline, candidate)),
  );
  const now = new Date().toISOString();
  const release = visualReleaseSchema.parse({
    id: randomUUID(),
    number: await store.reserveReleaseNumber(),
    displayName: input.displayName,
    notes: input.notes,
    status: "candidate",
    definitionIds: Array.from(new Set([...retained.map((definition) => definition.id), ...selected.map((definition) => definition.id)])),
    changedDefinitionIds: input.changedDefinitionIds,
    baselineDefinitionIds,
    baseReleaseId: activeRelease?.id ?? null,
    checklist: emptyChecklist(),
    createdBy: actorEmail,
    approvedBy: null,
    publishedBy: null,
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
    approvedAt: null,
    publishedAt: null,
  });
  await store.upsertRelease(release);
  await appendAudit(store, release.id, "created", actorEmail, { changedDefinitionIds: input.changedDefinitionIds });
  return release;
}

export async function updateVisualReleaseChecklist(env: Partial<AppEnv>, releaseId: string, rawInput: unknown, actorEmail: string) {
  const store = getStore(env);
  const current = await getVisualRelease(env, releaseId);
  if (current.status !== "candidate") throw new Error("La lista solo se puede editar mientras la release es candidata.");
  const input = visualReleaseChecklistMutationSchema.parse(rawInput);
  const next = visualReleaseSchema.parse({ ...current, checklist: input.checklist, updatedAt: new Date().toISOString() });
  await store.upsertRelease(next);
  await appendAudit(store, releaseId, "checklist_updated", actorEmail);
  return next;
}

export async function submitVisualRelease(env: Partial<AppEnv>, releaseId: string, actorEmail: string) {
  const store = getStore(env);
  const current = await getVisualRelease(env, releaseId);
  if (current.status !== "candidate") throw new Error("Solo una release candidata se puede enviar a revision.");
  if (!isChecklistComplete(current)) throw new Error("Completa toda la lista de comprobacion antes de enviar la release.");
  if ((await store.listScenarios(releaseId)).length === 0) {
    throw new Error("Guarda al menos un escenario desde el laboratorio antes de enviar la release.");
  }
  const now = new Date().toISOString();
  const next = visualReleaseSchema.parse({ ...current, status: "review", submittedAt: now, updatedAt: now });
  await store.upsertRelease(next);
  await appendAudit(store, releaseId, "submitted", actorEmail);
  return next;
}

export async function approveVisualRelease(env: Partial<AppEnv>, releaseId: string, actorEmail: string) {
  const store = getStore(env);
  const current = await getVisualRelease(env, releaseId);
  if (current.status !== "review") throw new Error("La release debe estar en revision antes de aprobarse.");
  const now = new Date().toISOString();
  const next = visualReleaseSchema.parse({ ...current, status: "approved", approvedBy: actorEmail, approvedAt: now, updatedAt: now });
  await store.upsertRelease(next);
  await appendAudit(store, releaseId, "approved", actorEmail);
  return next;
}

async function activateRelease(env: Partial<AppEnv>, releaseId: string, actorEmail: string, action: "published" | "restored") {
  return await getStore(env).activateRelease(releaseId, actorEmail, action);
}

export async function publishVisualRelease(env: Partial<AppEnv>, releaseId: string, actorEmail: string) {
  const release = await getVisualRelease(env, releaseId);
  const superseded = findSupersededReleaseDefinitions(
    release,
    await listVisualDefinitions(env),
  );

  if (superseded.length > 0) {
    const summary = superseded
      .slice(0, 4)
      .map(({ current, newer }) => `${current.displayName} v${current.version} (existe v${newer.version})`)
      .join(", ");
    throw new Error(
      `La release contiene componentes superados: ${summary}. Crea una candidata nueva con las versiones aprobadas mas recientes.`,
    );
  }

  return await activateRelease(env, releaseId, actorEmail, "published");
}

export async function restoreVisualRelease(env: Partial<AppEnv>, releaseId: string, actorEmail: string) {
  return await activateRelease(env, releaseId, actorEmail, "restored");
}

export async function getActiveVisualRelease(env: Partial<AppEnv>) {
  const store = getStore(env);
  const activeId = await store.getActiveReleaseId();
  return activeId ? (await store.listReleases()).find((release) => release.id === activeId) ?? null : null;
}

export async function getOrCreateLineVisualRelease(env: Partial<AppEnv>, saleOrderLineId: number) {
  const store = getStore(env);
  const active = await getActiveVisualRelease(env);
  if (!active) return null;

  const existing = await store.getLinePin(saleOrderLineId);
  if (existing?.releaseId !== active.id) {
    await store.upsertLinePin(lineReleasePinSchema.parse({
      saleOrderLineId,
      releaseId: active.id,
      createdAt: new Date().toISOString(),
    }));
  }

  return active;
}

export async function saveVisualReleaseScenario(env: Partial<AppEnv>, releaseId: string, rawInput: unknown, actorEmail: string) {
  await getVisualRelease(env, releaseId);
  const input = visualReleaseScenarioMutationSchema.parse(rawInput);
  const store = getStore(env);
  const now = new Date().toISOString();
  const existing = (await store.listScenarios(releaseId)).find((scenario) => scenario.saleOrderLineId === input.saleOrderLineId && scenario.displayName === input.displayName);
  const scenario = visualReleaseScenarioSchema.parse({
    id: existing?.id ?? randomUUID(), releaseId, saleOrderLineId: input.saleOrderLineId,
    displayName: input.displayName, selectedValueIds: input.selectedValueIds,
    customValuesByValueId: input.customValuesByValueId, createdBy: existing?.createdBy ?? actorEmail,
    createdAt: existing?.createdAt ?? now, updatedAt: now,
  });
  await store.upsertScenario(scenario);
  await appendAudit(store, releaseId, "scenario_saved", actorEmail, { scenarioId: scenario.id, saleOrderLineId: scenario.saleOrderLineId });
  return scenario;
}

export async function listVisualReleaseScenarios(env: Partial<AppEnv>, releaseId: string) {
  return await getStore(env).listScenarios(releaseId);
}

export async function listVisualReleaseAuditEvents(env: Partial<AppEnv>) {
  return await getStore(env).listAuditEvents();
}
