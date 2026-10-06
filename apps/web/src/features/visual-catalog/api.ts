import {
  visualCatalogAuditListSchema,
  visualCatalogProductListSchema,
  visualDefinitionListSchema,
  visualDefinitionMutationSchema,
  visualDefinitionTransitionResultSchema,
  visualReleaseChecklistMutationSchema,
  visualReleaseCreateSchema,
  visualReleaseAuditListSchema,
  visualReleaseListSchema,
  visualReleaseScenarioListSchema,
  visualReleaseScenarioMutationSchema,
  visualReleaseScenarioSchema,
  visualReleaseTransitionResultSchema,
  type VisualDefinitionMutation,
  type VisualReleaseChecklist,
  type VisualReleaseCreate,
} from "@repo/shared/schemas/visual-catalog";
import { requestJson } from "../../lib/api-client";

const ADMIN_BASE_PATH = "/api/admin/visual-catalog";

export async function fetchVisualDefinitions() {
  const data = await requestJson(`${ADMIN_BASE_PATH}/definitions`);
  return visualDefinitionListSchema.parse(data).definitions;
}

export async function fetchVisualDefinition(definitionId: string) {
  const data = await requestJson(
    `${ADMIN_BASE_PATH}/definitions/${definitionId}`,
  );
  return visualDefinitionTransitionResultSchema.parse(data).definition;
}

export async function fetchVisualCatalogAudit() {
  const data = await requestJson(`${ADMIN_BASE_PATH}/audit`);
  return visualCatalogAuditListSchema.parse(data).events;
}

export async function fetchVisualCatalogProducts(forceRefresh = false) {
  const suffix = forceRefresh ? "?refresh=1" : "";
  const data = await requestJson(`${ADMIN_BASE_PATH}/products${suffix}`);
  return visualCatalogProductListSchema.parse(data);
}

export async function createVisualDefinition(
  mutation: VisualDefinitionMutation,
) {
  const data = await requestJson(`${ADMIN_BASE_PATH}/definitions`, {
    method: "POST",
    body: JSON.stringify(visualDefinitionMutationSchema.parse(mutation)),
  });
  return visualDefinitionTransitionResultSchema.parse(data).definition;
}

export async function updateVisualDefinition(
  definitionId: string,
  mutation: VisualDefinitionMutation,
) {
  const data = await requestJson(
    `${ADMIN_BASE_PATH}/definitions/${definitionId}`,
    {
      method: "PUT",
      body: JSON.stringify(visualDefinitionMutationSchema.parse(mutation)),
    },
  );
  return visualDefinitionTransitionResultSchema.parse(data).definition;
}

async function transitionVisualDefinition(
  definitionId: string,
  action: "submit" | "approve" | "clone",
) {
  const data = await requestJson(
    `${ADMIN_BASE_PATH}/definitions/${definitionId}/${action}`,
    {
      method: "POST",
    },
  );
  return visualDefinitionTransitionResultSchema.parse(data).definition;
}

export async function submitVisualDefinition(definitionId: string) {
  return await transitionVisualDefinition(definitionId, "submit");
}

export async function approveVisualDefinition(definitionId: string) {
  return await transitionVisualDefinition(definitionId, "approve");
}

export async function cloneVisualDefinition(definitionId: string) {
  return await transitionVisualDefinition(definitionId, "clone");
}

export async function fetchVisualReleases() {
  const data = await requestJson(`${ADMIN_BASE_PATH}/releases`);
  return visualReleaseListSchema.parse(data);
}

export async function fetchVisualReleaseAudit() {
  const data = await requestJson(`${ADMIN_BASE_PATH}/releases/audit`);
  return visualReleaseAuditListSchema.parse(data).events;
}

export async function createVisualRelease(input: VisualReleaseCreate) {
  const data = await requestJson(`${ADMIN_BASE_PATH}/releases`, {
    method: "POST",
    body: JSON.stringify(visualReleaseCreateSchema.parse(input)),
  });
  return visualReleaseTransitionResultSchema.parse(data).release;
}

export async function updateVisualReleaseChecklist(
  releaseId: string,
  checklist: VisualReleaseChecklist,
) {
  const data = await requestJson(
    `${ADMIN_BASE_PATH}/releases/${releaseId}/checklist`,
    {
      method: "PUT",
      body: JSON.stringify(
        visualReleaseChecklistMutationSchema.parse({ checklist }),
      ),
    },
  );
  return visualReleaseTransitionResultSchema.parse(data).release;
}

async function transitionVisualRelease(
  releaseId: string,
  action: "submit" | "approve" | "publish" | "restore",
) {
  const data = await requestJson(
    `${ADMIN_BASE_PATH}/releases/${releaseId}/${action}`,
    { method: "POST" },
  );
  return visualReleaseTransitionResultSchema.parse(data).release;
}

export async function submitVisualRelease(releaseId: string) {
  return await transitionVisualRelease(releaseId, "submit");
}

export async function approveVisualRelease(releaseId: string) {
  return await transitionVisualRelease(releaseId, "approve");
}

export async function publishVisualRelease(releaseId: string) {
  return await transitionVisualRelease(releaseId, "publish");
}

export async function restoreVisualRelease(releaseId: string) {
  return await transitionVisualRelease(releaseId, "restore");
}

export async function fetchVisualReleaseScenarios(releaseId: string) {
  const data = await requestJson(
    `${ADMIN_BASE_PATH}/releases/${releaseId}/scenarios`,
  );
  return visualReleaseScenarioListSchema.parse(data).scenarios;
}

export async function saveVisualReleaseScenario(
  releaseId: string,
  input: {
    displayName: string;
    saleOrderLineId: number;
    selectedValueIds: Record<string, number[]>;
    customValuesByValueId: Record<string, string>;
  },
) {
  const data = await requestJson(
    `${ADMIN_BASE_PATH}/releases/${releaseId}/scenarios`,
    {
      method: "POST",
      body: JSON.stringify(visualReleaseScenarioMutationSchema.parse(input)),
    },
  );
  return visualReleaseScenarioSchema.parse(
    (data as { scenario?: unknown }).scenario,
  );
}
