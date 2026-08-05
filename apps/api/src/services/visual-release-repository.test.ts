import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import type { VisualDefinitionMutation } from "@repo/shared/schemas/visual-catalog";
import {
  approveVisualDefinition,
  cloneVisualDefinition,
  createVisualDefinition,
  listVisualDefinitions,
  submitVisualDefinition,
  updateVisualDefinition,
} from "./visual-catalog-repository.js";
import {
  approveVisualRelease,
  createVisualReleaseCandidate,
  getOrCreateLineVisualRelease,
  listVisualReleaseScenarios,
  listVisualReleases,
  publishVisualRelease,
  restoreVisualRelease,
  saveVisualReleaseScenario,
  submitVisualRelease,
  updateVisualReleaseChecklist,
} from "./visual-release-repository.js";

const dataDirectory = path.join(
  process.cwd(),
  ".visual-catalog-tests",
  randomUUID(),
);
const env = {
  VISUAL_CATALOG_BACKEND: "file",
  VISUAL_CATALOG_DATA_DIR: dataDirectory,
};
const actorEmail = "admin@la-roca.local";
const mutation: VisualDefinitionMutation = {
  displayName: "Cuello inicial",
  slot: "neck",
  layer: "component",
  binding: {
    productTemplateIds: [5, 7],
    attributeId: 63,
    valueId: 334,
    sourceValueId: 562,
    attributeName: "Modelo de cuello",
    valueName: "V - DIVIDIDO",
  },
  activationConditions: [],
  selectedElementIds: ["neck"],
  elementPaints: {
    neck: { mode: "base_fill", visibilityConditions: [] },
  },
  placement: {
    targetWidth: 1080,
    targetHeight: 1350,
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
  },
  referenceAssetSrc:
    "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg",
  originalSvg: '<svg xmlns="http://www.w3.org/2000/svg"><path id="neck"/></svg>',
  normalizedSvg:
    '<svg xmlns="http://www.w3.org/2000/svg"><path data-vc-id="neck"/></svg>',
  runtimeSvg:
    '<svg xmlns="http://www.w3.org/2000/svg"><path fill="__VC_BASE_COLOR__"/></svg>',
};

const completeChecklist = {
  odooReferences: true,
  combinations: true,
  colorsAndTrims: true,
  placement: true,
  productFamilies: true,
  browserRender: true,
  savedRender: true,
  comparison: true,
  noDuplicates: true,
};

async function approveDefinition(input: VisualDefinitionMutation) {
  const draft = await createVisualDefinition(env, input, actorEmail);
  await submitVisualDefinition(env, draft.id, actorEmail);
  return await approveVisualDefinition(env, draft.id, actorEmail);
}

async function makeActiveRelease(
  displayName: string,
  changedDefinitionIds: string[],
) {
  const candidate = await createVisualReleaseCandidate(
    env,
    { displayName, notes: "Prueba", changedDefinitionIds },
    await listVisualDefinitions(env),
    actorEmail,
  );
  await updateVisualReleaseChecklist(
    env,
    candidate.id,
    { checklist: completeChecklist },
    actorEmail,
  );
  await saveVisualReleaseScenario(
    env,
    candidate.id,
    {
      displayName: `Escenario ${displayName}`,
      saleOrderLineId: 900 + candidate.number,
      selectedValueIds: {},
      customValuesByValueId: {},
    },
    actorEmail,
  );
  await submitVisualRelease(env, candidate.id, actorEmail);
  await approveVisualRelease(env, candidate.id, actorEmail);
  return await publishVisualRelease(env, candidate.id, actorEmail);
}

afterAll(async () => {
  await rm(dataDirectory, { recursive: true, force: true });
});

describe("visual release repository", () => {
  it("publica fotografias completas, fija lineas y permite restaurar", async () => {
    const firstDefinition = await approveDefinition(mutation);
    const firstRelease = await makeActiveRelease("Primera", [firstDefinition.id]);

    expect(firstRelease.status).toBe("active");
    expect(firstRelease.definitionIds).toEqual([firstDefinition.id]);
    expect((await getOrCreateLineVisualRelease(env, 101))?.id).toBe(firstRelease.id);

    const clone = await cloneVisualDefinition(env, firstDefinition.id, actorEmail);
    const updated = await updateVisualDefinition(
      env,
      clone.id,
      { ...mutation, displayName: "Cuello inicial corregido" },
      actorEmail,
    );
    await submitVisualDefinition(env, updated.id, actorEmail);
    const secondDefinition = await approveVisualDefinition(
      env,
      updated.id,
      actorEmail,
    );
    const secondRelease = await makeActiveRelease("Segunda", [secondDefinition.id]);

    expect(secondRelease.baselineDefinitionIds).toEqual([firstDefinition.id]);
    expect(secondRelease.definitionIds).toEqual([secondDefinition.id]);
    expect((await getOrCreateLineVisualRelease(env, 101))?.id).toBe(firstRelease.id);
    expect((await getOrCreateLineVisualRelease(env, 102))?.id).toBe(secondRelease.id);

    const restored = await restoreVisualRelease(env, firstRelease.id, actorEmail);
    const releaseState = await listVisualReleases(env);
    expect(restored.status).toBe("active");
    expect(releaseState.activeReleaseId).toBe(firstRelease.id);
    expect(
      releaseState.releases.find((release) => release.id === secondRelease.id)?.status,
    ).toBe("retired");
  });

  it("guarda escenarios de laboratorio sin modificar la release", async () => {
    const definition = await approveDefinition({
      ...mutation,
      displayName: "Cuello para escenario",
      binding: {
        ...mutation.binding,
        sourceValueId: 563,
        valueId: 335,
        valueName: "PUNTAS",
      },
    });
    const release = await createVisualReleaseCandidate(
      env,
      {
        displayName: "Escenarios",
        notes: "",
        changedDefinitionIds: [definition.id],
      },
      await listVisualDefinitions(env),
      actorEmail,
    );

    const scenario = await saveVisualReleaseScenario(
      env,
      release.id,
      {
        displayName: "Color azul con vivo",
        saleOrderLineId: 232,
        selectedValueIds: { "63": [335] },
        customValuesByValueId: {},
      },
      actorEmail,
    );

    expect(scenario.releaseId).toBe(release.id);
    expect(await listVisualReleaseScenarios(env, release.id)).toHaveLength(1);
    expect((await listVisualReleases(env)).releases.find(
      (candidate) => candidate.id === release.id,
    )?.status).toBe("candidate");
  });
});
