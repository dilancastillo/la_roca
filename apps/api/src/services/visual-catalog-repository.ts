import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import {
  activeVisualDefinitionSchema,
  visualCatalogAuditEventSchema,
  visualDefinitionMutationSchema,
  visualDefinitionSchema,
  visualDefinitionSummarySchema,
  type ActiveVisualDefinition,
  type VisualCatalogAuditEvent,
  type VisualDefinition,
  type VisualDefinitionMutation,
  type VisualDefinitionSummary,
} from "@repo/shared/schemas/visual-catalog";
import {
  resolveVisualCatalogBackend,
  type AppEnv,
} from "../lib/app-env.js";

const storedVisualDefinitionSchema = visualDefinitionSummarySchema.extend({
  originalAssetKey: z.string().min(1),
  normalizedAssetKey: z.string().min(1),
  runtimeAssetKey: z.string().min(1),
});

type StoredVisualDefinition = z.infer<typeof storedVisualDefinitionSchema>;

interface VisualCatalogStore {
  assertReady(): Promise<void>;
  listMetadata(): Promise<StoredVisualDefinition[]>;
  upsertMetadata(definition: StoredVisualDefinition): Promise<void>;
  putAsset(assetKey: string, svg: string): Promise<void>;
  getAsset(assetKey: string): Promise<string>;
  listAuditEvents(): Promise<VisualCatalogAuditEvent[]>;
  appendAuditEvent(event: VisualCatalogAuditEvent): Promise<void>;
}

function sortNewestFirst<T extends { updatedAt: string }>(items: T[]) {
  return [...items].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

function safeJsonParse(value: string, fallback: unknown) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return fallback;
  }
}

class FileVisualCatalogStore implements VisualCatalogStore {
  private readonly baseDirectory: string;
  private readonly metadataPath: string;
  private readonly auditPath: string;
  private readonly assetDirectory: string;

  constructor(env: Partial<AppEnv>) {
    this.baseDirectory = path.resolve(
      process.cwd(),
      env.VISUAL_CATALOG_DATA_DIR ?? ".visual-catalog",
    );
    this.metadataPath = path.join(this.baseDirectory, "definitions.json");
    this.auditPath = path.join(this.baseDirectory, "audit.json");
    this.assetDirectory = path.join(this.baseDirectory, "assets");
  }

  private async ensureDirectories() {
    await mkdir(this.assetDirectory, { recursive: true });
  }

  async assertReady() {
    await this.ensureDirectories();
    await this.listMetadata();
  }

  private resolveAssetPath(assetKey: string) {
    const resolved = path.resolve(this.assetDirectory, assetKey);
    const expectedPrefix = `${this.assetDirectory}${path.sep}`;

    if (!resolved.startsWith(expectedPrefix)) {
      throw new Error("La ruta del SVG no es valida.");
    }

    return resolved;
  }

  async listMetadata() {
    try {
      const content = await readFile(this.metadataPath, "utf8");
      return z
        .array(storedVisualDefinitionSchema)
        .parse(safeJsonParse(content, []));
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return [];
      }

      throw error;
    }
  }

  async upsertMetadata(definition: StoredVisualDefinition) {
    await this.ensureDirectories();
    const definitions = await this.listMetadata();
    const nextDefinitions = definitions.some(
      (candidate) => candidate.id === definition.id,
    )
      ? definitions.map((candidate) =>
          candidate.id === definition.id ? definition : candidate,
        )
      : [...definitions, definition];

    await writeFile(
      this.metadataPath,
      JSON.stringify(sortNewestFirst(nextDefinitions), null, 2),
      "utf8",
    );
  }

  async putAsset(assetKey: string, svg: string) {
    const assetPath = this.resolveAssetPath(assetKey);
    await mkdir(path.dirname(assetPath), { recursive: true });
    await writeFile(assetPath, svg, "utf8");
  }

  async getAsset(assetKey: string) {
    return await readFile(this.resolveAssetPath(assetKey), "utf8");
  }

  async listAuditEvents() {
    try {
      const content = await readFile(this.auditPath, "utf8");
      return z
        .array(visualCatalogAuditEventSchema)
        .parse(safeJsonParse(content, []));
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return [];
      }

      throw error;
    }
  }

  async appendAuditEvent(event: VisualCatalogAuditEvent) {
    await this.ensureDirectories();
    const events = await this.listAuditEvents();
    await writeFile(
      this.auditPath,
      JSON.stringify([event, ...events], null, 2),
      "utf8",
    );
  }
}

type SupabaseVisualDefinitionRow = {
  id: string;
  series_id: string;
  version: number;
  display_name: string;
  slot: string;
  layer?: string;
  status: string;
  binding: unknown;
  activation_conditions?: unknown;
  selected_element_ids: unknown;
  element_paints: unknown;
  placement: unknown;
  reference_asset_src: string;
  original_asset_key: string;
  normalized_asset_key: string;
  runtime_asset_key: string;
  created_by: string;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  published_at: string | null;
};

type SupabaseAuditRow = {
  id: string;
  definition_id: string;
  action: string;
  actor_email: string;
  created_at: string;
  details: unknown;
};

class SupabaseVisualCatalogStore implements VisualCatalogStore {
  private readonly baseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly bucket: string;

  constructor(env: Partial<AppEnv>) {
    if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error(
        "Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para el catalogo visual.",
      );
    }

    this.baseUrl = env.SUPABASE_URL.replace(/\/+$/, "");
    this.serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
    this.bucket = env.SUPABASE_VISUAL_CATALOG_BUCKET ?? "visual-catalog";
  }

  private getHeaders(extra: Record<string, string> = {}) {
    return {
      apikey: this.serviceRoleKey,
      Authorization: `Bearer ${this.serviceRoleKey}`,
      ...extra,
    };
  }

  private async request(input: string, init?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${input}`, {
      ...init,
      headers: {
        ...this.getHeaders(),
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      const message = (await response.text()).slice(0, 800);
      throw new Error(
        `Supabase respondio ${response.status}: ${message || "sin detalle"}`,
      );
    }

    return response;
  }

  async assertReady() {
    await Promise.all([
      this.listMetadata(),
      this.request(
        `/storage/v1/bucket/${encodeURIComponent(this.bucket)}`,
      ),
    ]);
  }

  private toRow(definition: StoredVisualDefinition) {
    return {
      id: definition.id,
      series_id: definition.seriesId,
      version: definition.version,
      display_name: definition.displayName,
      slot: definition.slot,
      layer: definition.layer,
      status: definition.status,
      binding: definition.binding,
      activation_conditions: definition.activationConditions,
      selected_element_ids: definition.selectedElementIds,
      element_paints: definition.elementPaints,
      placement: definition.placement,
      reference_asset_src: definition.referenceAssetSrc,
      original_asset_key: definition.originalAssetKey,
      normalized_asset_key: definition.normalizedAssetKey,
      runtime_asset_key: definition.runtimeAssetKey,
      created_by: definition.createdBy,
      approved_by: definition.approvedBy,
      created_at: definition.createdAt,
      updated_at: definition.updatedAt,
      submitted_at: definition.submittedAt,
      published_at: definition.publishedAt,
    };
  }

  private fromRow(row: SupabaseVisualDefinitionRow) {
    return storedVisualDefinitionSchema.parse({
      id: row.id,
      seriesId: row.series_id,
      version: row.version,
      displayName: row.display_name,
      slot: row.slot,
      layer: row.layer ?? "component",
      status: row.status,
      binding: row.binding,
      activationConditions: row.activation_conditions ?? [],
      selectedElementIds: row.selected_element_ids,
      elementPaints: row.element_paints,
      placement: row.placement,
      referenceAssetSrc: row.reference_asset_src,
      originalAssetKey: row.original_asset_key,
      normalizedAssetKey: row.normalized_asset_key,
      runtimeAssetKey: row.runtime_asset_key,
      createdBy: row.created_by,
      approvedBy: row.approved_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      submittedAt: row.submitted_at,
      publishedAt: row.published_at,
    });
  }

  async listMetadata() {
    const response = await this.request(
      "/rest/v1/visual_definition_versions?select=*&order=updated_at.desc",
    );
    const rows = (await response.json()) as SupabaseVisualDefinitionRow[];
    return rows.map((row) => this.fromRow(row));
  }

  async upsertMetadata(definition: StoredVisualDefinition) {
    await this.request(
      "/rest/v1/visual_definition_versions?on_conflict=id",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(this.toRow(definition)),
      },
    );
  }

  private getStoragePath(assetKey: string) {
    return `${encodeURIComponent(this.bucket)}/${assetKey
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`;
  }

  async putAsset(assetKey: string, svg: string) {
    await this.request(`/storage/v1/object/${this.getStoragePath(assetKey)}`, {
      method: "POST",
      headers: {
        "Content-Type": "image/svg+xml",
        "x-upsert": "true",
      },
      body: svg,
    });
  }

  async getAsset(assetKey: string) {
    const response = await this.request(
      `/storage/v1/object/${this.getStoragePath(assetKey)}`,
    );
    return await response.text();
  }

  async listAuditEvents() {
    const response = await this.request(
      "/rest/v1/visual_catalog_audit_events?select=*&order=created_at.desc",
    );
    const rows = (await response.json()) as SupabaseAuditRow[];

    return rows.map((row) =>
      visualCatalogAuditEventSchema.parse({
        id: row.id,
        definitionId: row.definition_id,
        action: row.action,
        actorEmail: row.actor_email,
        createdAt: row.created_at,
        details: row.details,
      }),
    );
  }

  async appendAuditEvent(event: VisualCatalogAuditEvent) {
    await this.request("/rest/v1/visual_catalog_audit_events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        id: event.id,
        definition_id: event.definitionId,
        action: event.action,
        actor_email: event.actorEmail,
        created_at: event.createdAt,
        details: event.details,
      }),
    });
  }
}

function getStore(env: Partial<AppEnv>): VisualCatalogStore {
  if (resolveVisualCatalogBackend(env) === "supabase") {
    return new SupabaseVisualCatalogStore(env);
  }

  return new FileVisualCatalogStore(env);
}

export async function assertVisualCatalogRepositoryReady(
  env: Partial<AppEnv>,
) {
  const store = getStore(env);
  await store.assertReady();

  return {
    backend: resolveVisualCatalogBackend(env),
  };
}

function getAssetKeys(seriesId: string, definitionId: string) {
  const prefix = `${seriesId}/${definitionId}`;

  return {
    originalAssetKey: `${prefix}/original.svg`,
    normalizedAssetKey: `${prefix}/normalized.svg`,
    runtimeAssetKey: `${prefix}/runtime.svg`,
  };
}

async function loadDefinition(
  store: VisualCatalogStore,
  metadata: StoredVisualDefinition,
) {
  const [originalSvg, normalizedSvg, runtimeSvg] = await Promise.all([
    store.getAsset(metadata.originalAssetKey),
    store.getAsset(metadata.normalizedAssetKey),
    store.getAsset(metadata.runtimeAssetKey),
  ]);

  return visualDefinitionSchema.parse({
    ...metadata,
    originalSvg,
    normalizedSvg,
    runtimeSvg,
  });
}

async function putDefinitionAssets(
  store: VisualCatalogStore,
  metadata: StoredVisualDefinition,
  input: VisualDefinitionMutation,
) {
  await Promise.all([
    store.putAsset(metadata.originalAssetKey, input.originalSvg),
    store.putAsset(metadata.normalizedAssetKey, input.normalizedSvg),
    store.putAsset(metadata.runtimeAssetKey, input.runtimeSvg),
  ]);
}

async function appendAudit(
  store: VisualCatalogStore,
  definitionId: string,
  action: VisualCatalogAuditEvent["action"],
  actorEmail: string,
  details: Record<string, unknown> = {},
) {
  await store.appendAuditEvent(
    visualCatalogAuditEventSchema.parse({
      id: randomUUID(),
      definitionId,
      action,
      actorEmail,
      createdAt: new Date().toISOString(),
      details,
    }),
  );
}

function hasOverlappingProductTemplateIds(left: number[], right: number[]) {
  const rightIds = new Set(right);
  return left.some((id) => rightIds.has(id));
}

function hasSameTarget(
  left: StoredVisualDefinition,
  right: StoredVisualDefinition,
) {
  const leftValueId = left.binding.sourceValueId ?? left.binding.valueId;
  const rightValueId = right.binding.sourceValueId ?? right.binding.valueId;
  const normalizeConditions = (
    conditions: StoredVisualDefinition["activationConditions"],
  ) =>
    JSON.stringify(
      conditions
        .map((condition) => ({
          attributeId: condition.attributeId,
          sourceValueIds: [...condition.sourceValueIds].sort(
            (leftId, rightId) => leftId - rightId,
          ),
        }))
        .sort(
          (leftCondition, rightCondition) =>
            leftCondition.attributeId - rightCondition.attributeId ||
            leftCondition.sourceValueIds.join(",").localeCompare(
              rightCondition.sourceValueIds.join(","),
            ),
        ),
    );

  return (
    left.slot === right.slot &&
    left.layer === right.layer &&
    left.binding.attributeId === right.binding.attributeId &&
    leftValueId === rightValueId &&
    normalizeConditions(left.activationConditions) ===
      normalizeConditions(right.activationConditions) &&
    hasOverlappingProductTemplateIds(
      left.binding.productTemplateIds,
      right.binding.productTemplateIds,
    )
  );
}

function assertSafeSvg(svg: string, label: string) {
  if (!/<svg\b/i.test(svg) || !/<\/svg>/i.test(svg)) {
    throw new Error(`El SVG ${label} no tiene una raiz valida.`);
  }

  const blockedPatterns = [
    /<\s*script\b/i,
    /<\s*foreignObject\b/i,
    /<\s*(?:iframe|object|embed|image|audio|video)\b/i,
    /\son[a-z]+\s*=/i,
    /javascript\s*:/i,
    /@import\b/i,
    /url\s*\(\s*["']?\s*(?:https?:|data:|\/\/)/i,
    /(?:href|src)\s*=\s*["']\s*(?:https?:|data:|\/\/)/i,
  ];

  if (blockedPatterns.some((pattern) => pattern.test(svg))) {
    throw new Error(
      `El SVG ${label} contiene scripts o recursos externos no permitidos.`,
    );
  }
}

function assertSafeMutationAssets(input: VisualDefinitionMutation) {
  assertSafeSvg(input.normalizedSvg, "normalizado");
  assertSafeSvg(input.runtimeSvg, "de ejecucion");
}

export async function listVisualDefinitions(env: Partial<AppEnv>) {
  const store = getStore(env);
  return sortNewestFirst(await store.listMetadata()).map((definition) =>
    visualDefinitionSummarySchema.parse(definition),
  );
}

export async function getVisualDefinition(
  env: Partial<AppEnv>,
  definitionId: string,
) {
  const store = getStore(env);
  const metadata = (await store.listMetadata()).find(
    (definition) => definition.id === definitionId,
  );

  if (!metadata) {
    throw new Error("La definicion visual no existe.");
  }

  return await loadDefinition(store, metadata);
}

export async function createVisualDefinition(
  env: Partial<AppEnv>,
  rawInput: VisualDefinitionMutation,
  actorEmail: string,
) {
  const store = getStore(env);
  const input = visualDefinitionMutationSchema.parse(rawInput);
  assertSafeMutationAssets(input);
  const now = new Date().toISOString();
  const id = randomUUID();
  const seriesId = randomUUID();
  const metadata = storedVisualDefinitionSchema.parse({
    id,
    seriesId,
    version: 0,
    displayName: input.displayName,
    slot: input.slot,
    layer: input.layer,
    status: "draft",
    binding: input.binding,
    activationConditions: input.activationConditions,
    selectedElementIds: input.selectedElementIds,
    elementPaints: input.elementPaints,
    placement: input.placement,
    referenceAssetSrc: input.referenceAssetSrc,
    ...getAssetKeys(seriesId, id),
    createdBy: actorEmail,
    approvedBy: null,
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
    publishedAt: null,
  });

  await putDefinitionAssets(store, metadata, input);
  await store.upsertMetadata(metadata);
  await appendAudit(store, id, "created", actorEmail, {
    slot: input.slot,
    sourceValueId: input.binding.sourceValueId,
    valueId: input.binding.valueId,
  });

  return await loadDefinition(store, metadata);
}

export async function updateVisualDefinition(
  env: Partial<AppEnv>,
  definitionId: string,
  rawInput: VisualDefinitionMutation,
  actorEmail: string,
) {
  const store = getStore(env);
  const input = visualDefinitionMutationSchema.parse(rawInput);
  assertSafeMutationAssets(input);
  const definitions = await store.listMetadata();
  const current = definitions.find(
    (definition) => definition.id === definitionId,
  );

  if (!current) {
    throw new Error("La definicion visual no existe.");
  }

  if (current.status !== "draft") {
    throw new Error("Solo se pueden editar definiciones en borrador.");
  }

  const next = storedVisualDefinitionSchema.parse({
    ...current,
    displayName: input.displayName,
    slot: input.slot,
    layer: input.layer,
    binding: input.binding,
    activationConditions: input.activationConditions,
    selectedElementIds: input.selectedElementIds,
    elementPaints: input.elementPaints,
    placement: input.placement,
    referenceAssetSrc: input.referenceAssetSrc,
    updatedAt: new Date().toISOString(),
  });

  await putDefinitionAssets(store, next, input);
  await store.upsertMetadata(next);
  await appendAudit(store, definitionId, "updated", actorEmail);

  return await loadDefinition(store, next);
}

export async function submitVisualDefinition(
  env: Partial<AppEnv>,
  definitionId: string,
  actorEmail: string,
) {
  const store = getStore(env);
  const definitions = await store.listMetadata();
  const current = definitions.find(
    (definition) => definition.id === definitionId,
  );

  if (!current) {
    throw new Error("La definicion visual no existe.");
  }

  if (current.status !== "draft") {
    throw new Error("Solo los borradores se pueden enviar a aprobacion.");
  }

  const now = new Date().toISOString();
  const next = storedVisualDefinitionSchema.parse({
    ...current,
    status: "review",
    submittedAt: now,
    updatedAt: now,
  });
  await store.upsertMetadata(next);
  await appendAudit(store, definitionId, "submitted", actorEmail);

  return await loadDefinition(store, next);
}

export async function approveVisualDefinition(
  env: Partial<AppEnv>,
  definitionId: string,
  actorEmail: string,
) {
  const store = getStore(env);
  const definitions = await store.listMetadata();
  const current = definitions.find(
    (definition) => definition.id === definitionId,
  );

  if (!current) {
    throw new Error("La definicion visual no existe.");
  }

  if (current.status !== "review") {
    throw new Error("La definicion debe estar en revision antes de publicarse.");
  }

  const relatedVersions = definitions.filter(
    (definition) =>
      definition.seriesId === current.seriesId || hasSameTarget(definition, current),
  );
  const nextVersion =
    Math.max(0, ...relatedVersions.map((definition) => definition.version)) + 1;
  const now = new Date().toISOString();

  const next = storedVisualDefinitionSchema.parse({
    ...current,
    version: nextVersion,
    status: "approved",
    approvedBy: actorEmail,
    publishedAt: null,
    updatedAt: now,
  });
  await store.upsertMetadata(next);
  await appendAudit(store, definitionId, "approved", actorEmail, {
    version: nextVersion,
  });

  return await loadDefinition(store, next);
}

export async function cloneVisualDefinition(
  env: Partial<AppEnv>,
  definitionId: string,
  actorEmail: string,
) {
  const store = getStore(env);
  const current = await getVisualDefinition(env, definitionId);
  const now = new Date().toISOString();
  const id = randomUUID();
  const assetKeys = getAssetKeys(current.seriesId, id);
  const metadata = storedVisualDefinitionSchema.parse({
    ...current,
    id,
    version: current.version,
    status: "draft",
    ...assetKeys,
    createdBy: actorEmail,
    approvedBy: null,
    createdAt: now,
    updatedAt: now,
    submittedAt: null,
    publishedAt: null,
  });

  await Promise.all([
    store.putAsset(assetKeys.originalAssetKey, current.originalSvg),
    store.putAsset(assetKeys.normalizedAssetKey, current.normalizedSvg),
    store.putAsset(assetKeys.runtimeAssetKey, current.runtimeSvg),
  ]);
  await store.upsertMetadata(metadata);
  await appendAudit(store, id, "cloned", actorEmail, {
    clonedFrom: definitionId,
  });

  return await loadDefinition(store, metadata);
}

export async function listVisualCatalogAuditEvents(env: Partial<AppEnv>) {
  return await getStore(env).listAuditEvents();
}

export async function loadActiveVisualDefinitions(
  env: Partial<AppEnv>,
  productTemplateId: number,
  pinnedDefinitionIds?: string[],
  releaseDefinitionIds?: string[],
): Promise<ActiveVisualDefinition[]> {
  if (pinnedDefinitionIds?.length === 0) {
    return [];
  }

  const store = getStore(env);
  const definitions = await store.listMetadata();
  const pinnedIds = pinnedDefinitionIds
    ? new Set(pinnedDefinitionIds)
    : undefined;
  const releaseIds = releaseDefinitionIds
    ? new Set(releaseDefinitionIds)
    : undefined;
  const requestedIds = pinnedIds ?? releaseIds;

  if (requestedIds) {
    const availableIds = new Set(definitions.map((definition) => definition.id));
    const missingIds = [...requestedIds].filter((id) => !availableIds.has(id));

    if (missingIds.length > 0) {
      throw new Error(
        `Faltan ${missingIds.length} definiciones de la version visual fijada.`,
      );
    }
  }

  const activeMetadata = definitions.filter((definition) => {
    if (pinnedIds) {
      return pinnedIds.has(definition.id);
    }

    if (releaseIds) {
      return releaseIds.has(definition.id);
    }

    return (
      definition.status === "published" &&
      definition.binding.productTemplateIds.includes(productTemplateId)
    );
  });

  return await Promise.all(
    activeMetadata.map(async (definition) =>
      activeVisualDefinitionSchema.parse({
        id: definition.id,
        seriesId: definition.seriesId,
        version: definition.version,
        displayName: definition.displayName,
        slot: definition.slot,
        layer: definition.layer,
        binding: definition.binding,
        activationConditions: definition.activationConditions,
        selectedElementIds: definition.selectedElementIds,
        elementPaints: definition.elementPaints,
        runtimeSvg: await store.getAsset(definition.runtimeAssetKey),
      }),
    ),
  );
}
