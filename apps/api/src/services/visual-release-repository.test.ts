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
  getVisualReleaseCandidatePreviewDefinitionIds,
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

async function makeApprovedCandidate(
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
      saleOrderLineId: 1_900 + candidate.number,
      selectedValueIds: {},
      customValuesByValueId: {},
    },
    actorEmail,
  );
  await submitVisualRelease(env, candidate.id, actorEmail);
  return await approveVisualRelease(env, candidate.id, actorEmail);
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
    expect((await getOrCreateLineVisualRelease(env, 101))?.id).toBe(secondRelease.id);
    expect((await getOrCreateLineVisualRelease(env, 102))?.id).toBe(secondRelease.id);

    const restored = await restoreVisualRelease(env, firstRelease.id, actorEmail);
    const releaseState = await listVisualReleases(env);
    expect(restored.status).toBe("active");
    expect(releaseState.activeReleaseId).toBe(firstRelease.id);
    expect(
      releaseState.releases.find((release) => release.id === secondRelease.id)?.status,
    ).toBe("retired");

    // Do not leave a deliberately stale release active for the independent
    // scenarios that follow in this shared file-backed test catalog.
    await restoreVisualRelease(env, secondRelease.id, actorEmail);
  });

  it("publica solo el objetivo editado aunque la candidata sea anterior", async () => {
    const neck = await approveDefinition({
      ...mutation,
      displayName: "Cuello concurrente",
      binding: { ...mutation.binding, sourceValueId: 8_101, valueId: 8_101 },
    });
    const pocket = await approveDefinition({
      ...mutation,
      displayName: "Bolsillo concurrente",
      slot: "lower_pocket",
      binding: {
        ...mutation.binding,
        attributeId: 154,
        sourceValueId: 8_102,
        valueId: 8_102,
        attributeName: "Modelo bolsillo inferior",
      },
    });
    await makeActiveRelease("Base concurrente", [neck.id, pocket.id]);

    const neckDraft = await cloneVisualDefinition(env, neck.id, actorEmail);
    const neckEdited = await updateVisualDefinition(
      env,
      neckDraft.id,
      { ...mutation, displayName: "Cuello concurrente v2", binding: neck.binding },
      actorEmail,
    );
    await submitVisualDefinition(env, neckEdited.id, actorEmail);
    const neckV2 = await approveVisualDefinition(env, neckEdited.id, actorEmail);
    const delayedNeck = await makeApprovedCandidate("Cuello pendiente", [neckV2.id]);

    const neckV3Draft = await cloneVisualDefinition(env, neckV2.id, actorEmail);
    const neckV3Edited = await updateVisualDefinition(
      env,
      neckV3Draft.id,
      { ...mutation, displayName: "Cuello concurrente v3", binding: neckV2.binding },
      actorEmail,
    );
    await submitVisualDefinition(env, neckV3Edited.id, actorEmail);
    await approveVisualDefinition(env, neckV3Edited.id, actorEmail);

    const pocketDraft = await cloneVisualDefinition(env, pocket.id, actorEmail);
    const pocketEdited = await updateVisualDefinition(
      env,
      pocketDraft.id,
      { ...mutation, displayName: "Bolsillo concurrente v2", slot: "lower_pocket", binding: pocket.binding },
      actorEmail,
    );
    await submitVisualDefinition(env, pocketEdited.id, actorEmail);
    const pocketV2 = await approveVisualDefinition(env, pocketEdited.id, actorEmail);
    await makeActiveRelease("Bolsillo publicado", [pocketV2.id]);

    const laboratoryPreview = await getVisualReleaseCandidatePreviewDefinitionIds(
      env,
      delayedNeck.id,
    );
    expect(laboratoryPreview).toContain(neckV2.id);
    expect(laboratoryPreview).toContain(pocketV2.id);
    expect(laboratoryPreview).not.toContain(pocket.id);

    const published = await publishVisualRelease(env, delayedNeck.id, actorEmail);
    expect(published.definitionIds).toContain(neckV2.id);
    expect(published.definitionIds).not.toContain(neckV3Edited.id);
    expect(published.definitionIds).toContain(pocketV2.id);
    expect(published.definitionIds).not.toContain(pocket.id);
  });

  it("conserva el cuello heredado junto a versiones por genero", async () => {
    const legacy = await approveDefinition({
      ...mutation,
      displayName: "Cuello compartido heredado",
      binding: {
        ...mutation.binding,
        sourceValueId: 9551,
        valueId: 9551,
        valueName: "CUELLO PRUEBA GENERO",
      },
    });
    await makeActiveRelease("Base cuello heredado", [legacy.id]);

    const woman = await approveDefinition({
      ...mutation,
      displayName: "Cuello prueba Mujer",
      binding: legacy.binding,
      activationConditions: [
        {
          attributeId: 142,
          attributeName: "Genero",
          sourceValueIds: [530],
          valueNames: ["Mujer"],
        },
      ],
    });
    const man = await approveDefinition({
      ...mutation,
      displayName: "Cuello prueba Hombre",
      binding: legacy.binding,
      activationConditions: [
        {
          attributeId: 142,
          attributeName: "Genero",
          sourceValueIds: [531],
          valueNames: ["Hombre"],
        },
      ],
    });

    const candidate = await createVisualReleaseCandidate(
      env,
      {
        displayName: "Cuellos separados por genero",
        notes: "",
        changedDefinitionIds: [woman.id, man.id],
      },
      await listVisualDefinitions(env),
      actorEmail,
    );

    expect(candidate.definitionIds).toContain(woman.id);
    expect(candidate.definitionIds).toContain(man.id);
    // El motor de render elige el reemplazo de género que aplica. Mantener la
    // versión histórica evita que Mujer pierda los modelos ya publicados.
    expect(candidate.definitionIds).toContain(legacy.id);
  });

  it("permite publicar un cambio puntual sin forzar modelos aprobados ajenos", async () => {
    const initial = await approveDefinition({
      ...mutation,
      displayName: "Cuello que sera actualizado",
      binding: {
        ...mutation.binding,
        sourceValueId: 9771,
        valueId: 9771,
        valueName: "CUELLO SUPERADO",
      },
    });
    const active = await makeActiveRelease("Base a actualizar", [initial.id]);
    const revision = await cloneVisualDefinition(env, initial.id, actorEmail);
    const changed = await updateVisualDefinition(
      env,
      revision.id,
      { ...mutation, displayName: "Cuello actualizado", binding: initial.binding },
      actorEmail,
    );
    await submitVisualDefinition(env, changed.id, actorEmail);
    await approveVisualDefinition(env, changed.id, actorEmail);

    // Hay una revision aprobada del cuello, pero esta release solo cambia un
    // bolsillo. Publicarla no puede cambiar el cuello por implicacion.
    const unrelated = await approveDefinition({
      ...mutation,
      displayName: "Bolsillo independiente",
      slot: "lower_pocket",
      binding: {
        ...mutation.binding,
        attributeId: 154,
        sourceValueId: 9772,
        valueId: 9772,
        attributeName: "Modelo bolsillo inferior",
        valueName: "BOLSILLO INDEPENDIENTE",
      },
    });
    const candidate = await createVisualReleaseCandidate(
      env,
      {
        displayName: "No publicar snapshot viejo",
        notes: "",
        changedDefinitionIds: [unrelated.id],
      },
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
        displayName: "Escenario para bloqueo de snapshot",
        saleOrderLineId: 1999,
        selectedValueIds: {},
        customValuesByValueId: {},
      },
      actorEmail,
    );
    await submitVisualRelease(env, candidate.id, actorEmail);
    await approveVisualRelease(env, candidate.id, actorEmail);

    expect(active.status).toBe("active");
    const published = await publishVisualRelease(env, candidate.id, actorEmail);
    expect(published.definitionIds).toContain(initial.id);
    expect(published.definitionIds).toContain(unrelated.id);
    expect(published.definitionIds).not.toContain(changed.id);
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

  it("rechaza definiciones en borrador al crear un release candidato", async () => {
    const draft = await createVisualDefinition(
      env,
      {
        ...mutation,
        displayName: "Bolsillo inferior borrador",
        slot: "lower_pocket",
        binding: {
          ...mutation.binding,
          attributeId: 154,
          valueId: 382,
          sourceValueId: 596,
          attributeName: "Modelo bolsillo inferior",
          valueName: "COSTURA",
        },
        selectedElementIds: ["bolsillo"],
        elementPaints: {
          bolsillo: {
            mode: "trim_stroke",
            trimSourceValueId: 9001,
            visibilityConditions: [],
          },
        },
        normalizedSvg:
          '<svg xmlns="http://www.w3.org/2000/svg"><path data-vc-id="bolsillo" d="M0 0L20 20"/></svg>',
        runtimeSvg:
          '<svg xmlns="http://www.w3.org/2000/svg"><path stroke="__VC_TRIM_STROKE_9001__" d="M0 0L20 20"/></svg>',
      },
      actorEmail,
    );

    // Un borrador NO puede entrar a un release — ese es el comportamiento que
    // explica por qué la candidata no muestra definiciones del editor
    await expect(
      createVisualReleaseCandidate(
        env,
        {
          displayName: "Release con borrador",
          notes: "",
          changedDefinitionIds: [draft.id],
        },
        await listVisualDefinitions(env),
        actorEmail,
      ),
    ).rejects.toThrow(/aprobados/i);

    expect(draft.status).toBe("draft");
  });

  it("la candidata del laboratorio muestra definiciones aprobadas incluidas en el release", async () => {
    // Flujo correcto: draft → submit → approve → release → laboratorio
    const neckDraft = await createVisualDefinition(
      env,
      {
        ...mutation,
        displayName: "Cuello laboratorio",
        binding: {
          ...mutation.binding,
          sourceValueId: 564,
          valueId: 336,
          valueName: "PRESILLAS",
        },
        selectedElementIds: ["neck"],
        elementPaints: {
          neck: { mode: "base_fill", visibilityConditions: [] },
        },
        normalizedSvg:
          '<svg xmlns="http://www.w3.org/2000/svg"><path data-vc-id="neck" d="M0 0L20 20"/></svg>',
        runtimeSvg:
          '<svg xmlns="http://www.w3.org/2000/svg"><path fill="__VC_BASE_COLOR__" d="M0 0L20 20"/></svg>',
      },
      actorEmail,
    );
    const pocketDraft = await createVisualDefinition(
      env,
      {
        ...mutation,
        displayName: "Bolsillo laboratorio",
        slot: "lower_pocket",
        binding: {
          ...mutation.binding,
          attributeId: 154,
          valueId: 383,
          sourceValueId: 597,
          attributeName: "Modelo bolsillo inferior",
          valueName: "RIBETE",
        },
        selectedElementIds: ["bolsillo"],
        elementPaints: {
          bolsillo: {
            mode: "trim_stroke",
            trimSourceValueId: 9002,
            visibilityConditions: [],
          },
        },
        normalizedSvg:
          '<svg xmlns="http://www.w3.org/2000/svg"><path data-vc-id="bolsillo" d="M0 0L20 20"/></svg>',
        runtimeSvg:
          '<svg xmlns="http://www.w3.org/2000/svg"><path stroke="__VC_TRIM_STROKE_9002__" d="M0 0L20 20"/></svg>',
      },
      actorEmail,
    );

    // Ambos deben aprobarse antes de poder entrar al release
    await submitVisualDefinition(env, neckDraft.id, actorEmail);
    const neckApproved = await approveVisualDefinition(env, neckDraft.id, actorEmail);

    await submitVisualDefinition(env, pocketDraft.id, actorEmail);
    const pocketApproved = await approveVisualDefinition(env, pocketDraft.id, actorEmail);

    expect(neckApproved.status).toBe("approved");
    expect(pocketApproved.status).toBe("approved");

    // Crear el release candidato con ambas definiciones aprobadas
    const candidate = await createVisualReleaseCandidate(
      env,
      {
        displayName: "Release laboratorio",
        notes: "",
        changedDefinitionIds: [neckApproved.id, pocketApproved.id],
      },
      await listVisualDefinitions(env),
      actorEmail,
    );

    expect(candidate.status).toBe("candidate");
    // El release candidato incluye ambas definiciones — las que el
    // laboratorio cargará via visualDefinitionIdsOverride
    expect(candidate.definitionIds).toContain(neckApproved.id);
    expect(candidate.definitionIds).toContain(pocketApproved.id);

    // Un draft creado después NO aparece en el release ya existente
    const lateDraft = await createVisualDefinition(
      env,
      {
        ...mutation,
        displayName: "Bolsillo tarde — borrador",
        slot: "lower_pocket",
        binding: {
          ...mutation.binding,
          attributeId: 154,
          valueId: 384,
          sourceValueId: 598,
          attributeName: "Modelo bolsillo inferior",
          valueName: "COSTURA TARDE",
        },
        selectedElementIds: ["bolsillo"],
        elementPaints: {
          bolsillo: { mode: "preserve", visibilityConditions: [] },
        },
        normalizedSvg:
          '<svg xmlns="http://www.w3.org/2000/svg"><path data-vc-id="bolsillo" d="M0 0L20 20"/></svg>',
        runtimeSvg:
          '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0L20 20"/></svg>',
      },
      actorEmail,
    );

    // Este draft NO está en el release — por eso no aparece en el laboratorio
    expect(candidate.definitionIds).not.toContain(lateDraft.id);
  });
});
