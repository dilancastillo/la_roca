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
  loadActiveVisualDefinitions,
  submitVisualDefinition,
  updateVisualDefinition,
} from "./visual-catalog-repository.js";

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
  displayName: "V - DIVIDIDO",
  slot: "neck",
  layer: "component",
  binding: {
    productTemplateIds: [6, 7],
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
  originalSvg:
    '<svg xmlns="http://www.w3.org/2000/svg"><path id="neck" d="M0 0L20 20"/></svg>',
  normalizedSvg:
    '<svg xmlns="http://www.w3.org/2000/svg"><path data-vc-id="neck" d="M0 0L20 20"/></svg>',
  runtimeSvg:
    '<svg xmlns="http://www.w3.org/2000/svg"><path fill="__VC_BASE_COLOR__" d="M0 0L20 20"/></svg>',
};

afterAll(async () => {
  await rm(dataDirectory, { recursive: true, force: true });
});

describe("visual catalog repository", () => {
  it("aprueba versiones inmutables y permite resolverlas por release o por pedido", async () => {
    const created = await createVisualDefinition(env, mutation, actorEmail);
    expect(created.status).toBe("draft");
    expect(created.version).toBe(0);

    const submitted = await submitVisualDefinition(
      env,
      created.id,
      actorEmail,
    );
    expect(submitted.status).toBe("review");

    const firstApproved = await approveVisualDefinition(
      env,
      created.id,
      actorEmail,
    );
    expect(firstApproved.status).toBe("approved");
    expect(firstApproved.version).toBe(1);

    const activeForUniform = await loadActiveVisualDefinitions(env, 7);
    expect(activeForUniform).toEqual([]);

    const cloned = await cloneVisualDefinition(
      env,
      firstApproved.id,
      actorEmail,
    );
    expect(cloned.version).toBe(0);

    const updatedClone = await updateVisualDefinition(
      env,
      cloned.id,
      {
        ...mutation,
        displayName: "V - DIVIDIDO ajustado",
        binding: {
          ...mutation.binding,
          productTemplateIds: [7],
        },
      },
      actorEmail,
    );
    await submitVisualDefinition(env, updatedClone.id, actorEmail);
    const secondApproved = await approveVisualDefinition(
      env,
      updatedClone.id,
      actorEmail,
    );

    expect(secondApproved.version).toBe(2);
    expect(
      (await listVisualDefinitions(env)).find(
        (definition) => definition.id === firstApproved.id,
      )?.status,
    ).toBe("approved");
    expect(
      (await loadActiveVisualDefinitions(env, 7, undefined, [secondApproved.id])).map(
        (definition) => definition.id,
      ),
    ).toEqual([secondApproved.id]);
    expect(
      (
        await loadActiveVisualDefinitions(env, 7, [firstApproved.id])
      ).map((definition) => definition.id),
    ).toEqual([firstApproved.id]);
  });

  it("mantiene activas las definiciones del mismo valor cuando cambia la capa o la regla", async () => {
    const coexistenceDirectory = path.join(
      process.cwd(),
      ".visual-catalog-tests",
      randomUUID(),
    );
    const coexistenceEnv = {
      VISUAL_CATALOG_BACKEND: "file",
      VISUAL_CATALOG_DATA_DIR: coexistenceDirectory,
    };

    try {
      const baseDefinition = await createVisualDefinition(
        coexistenceEnv,
        {
          ...mutation,
          binding: {
            ...mutation.binding,
            productTemplateIds: [7],
          },
        },
        actorEmail,
      );
      await submitVisualDefinition(
        coexistenceEnv,
        baseDefinition.id,
        actorEmail,
      );
      const approvedBase = await approveVisualDefinition(
        coexistenceEnv,
        baseDefinition.id,
        actorEmail,
      );

      const conditionedDefinition = await createVisualDefinition(
        coexistenceEnv,
        {
          ...mutation,
          displayName: "V - DIVIDIDO condicionado",
          binding: {
            ...mutation.binding,
            productTemplateIds: [7],
          },
          activationConditions: [
            {
              attributeId: 157,
              attributeName: "Seccion de vivo",
              sourceValueIds: [1979],
              valueNames: ["Cuello"],
            },
          ],
        },
        actorEmail,
      );
      await submitVisualDefinition(
        coexistenceEnv,
        conditionedDefinition.id,
        actorEmail,
      );
      const approvedConditioned = await approveVisualDefinition(
        coexistenceEnv,
        conditionedDefinition.id,
        actorEmail,
      );

      const accentDefinition = await createVisualDefinition(
        coexistenceEnv,
        {
          ...mutation,
          displayName: "V - DIVIDIDO acento",
          layer: "accent",
          binding: {
            ...mutation.binding,
            productTemplateIds: [7],
          },
        },
        actorEmail,
      );
      await submitVisualDefinition(
        coexistenceEnv,
        accentDefinition.id,
        actorEmail,
      );
      const approvedAccent = await approveVisualDefinition(
        coexistenceEnv,
        accentDefinition.id,
        actorEmail,
      );

      expect(
        new Set(
          (await loadActiveVisualDefinitions(
            coexistenceEnv,
            7,
            undefined,
            [approvedBase.id, approvedConditioned.id, approvedAccent.id],
          )).map(
            (definition) => definition.id,
          ),
        ),
      ).toEqual(
        new Set([
          approvedBase.id,
          approvedConditioned.id,
          approvedAccent.id,
        ]),
      );
    } finally {
      await rm(coexistenceDirectory, { recursive: true, force: true });
    }
  });
});
