import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import {
  authSessionSchema,
  configuratorSessionSchema,
  loginRequestSchema,
  saveDesignRequestSchema,
} from "@repo/shared/schemas/configurator";
import {
  visualCatalogAuditListSchema,
  visualCatalogProductListSchema,
  visualDefinitionListSchema,
  visualDefinitionMutationSchema,
  visualDefinitionTransitionResultSchema,
  visualReleaseAuditListSchema,
  visualReleaseChecklistMutationSchema,
  visualReleaseCreateSchema,
  visualReleaseListSchema,
  visualReleaseScenarioListSchema,
  visualReleaseScenarioMutationSchema,
  visualReleaseScenarioSchema,
  visualReleaseTransitionResultSchema,
} from "@repo/shared/schemas/visual-catalog";
import {
  authenticateUser,
  createSessionToken,
  withAdminFlag,
} from "./lib/auth.js";
import {
  type AppEnv,
  type AppVariables,
  getDeploymentConfigurationErrors,
  getAppEnv,
  resolveVisualCatalogBackend,
} from "./lib/app-env.js";
import { requireAppSession } from "./middleware/require-app-session.js";
import { requireAppAdmin } from "./middleware/require-app-admin.js";
import { getConfiguratorSession } from "./services/get-configurator-session.js";
import { saveConfiguratorDesign } from "./services/save-configurator-design.js";
import {
  assertVisualDefinitionMatchesOdoo,
  getVisualCatalogProducts,
} from "./services/get-visual-catalog-products.js";
import {
  approveVisualDefinition,
  assertVisualCatalogRepositoryReady,
  cloneVisualDefinition,
  createVisualDefinition,
  getVisualDefinition,
  listVisualCatalogAuditEvents,
  listVisualDefinitions,
  submitVisualDefinition,
  updateVisualDefinition,
} from "./services/visual-catalog-repository.js";
import {
  approveVisualRelease,
  createVisualReleaseCandidate,
  getVisualReleaseCandidatePreviewDefinitionIds,
  getVisualRelease,
  listVisualReleaseAuditEvents,
  listVisualReleaseScenarios,
  listVisualReleases,
  publishVisualRelease,
  restoreVisualRelease,
  saveVisualReleaseScenario,
  submitVisualRelease,
  updateVisualReleaseChecklist,
} from "./services/visual-release-repository.js";
import {
  extractSaleOrderLineIdFromWebhookPayload,
  extractWebhookWriteDate,
  isValidAutomationToken,
  shouldDryRunAutomation,
} from "./services/automation-webhook.js";
const app = new Hono<{ Bindings: Partial<AppEnv>; Variables: AppVariables }>().basePath(
  "/api",
);

function getCookieName(env: Partial<AppEnv>) {
  return env.APP_COOKIE_NAME ?? "la_roca_session";
}

function shouldUseSecureCookie(env: Partial<AppEnv>) {
  return env.APP_COOKIE_SECURE === "true";
}

function assertVisualCatalogPublisher(c: {
  get(name: "user"): AppVariables["user"];
}) {
  if (!c.get("user").canPublishVisualCatalog) {
    throw new Error("Tu usuario puede probar releases, pero no publicarlas ni restaurarlas.");
  }
}

app.use("*", async (c, next) => {
  const configurationErrors = getDeploymentConfigurationErrors(getAppEnv(c));

  if (configurationErrors.length > 0) {
    console.error(
      `[configuration] Despliegue rechazado: ${configurationErrors.join(" ")}`,
    );
    return c.json(
      {
        ok: false,
        error: "La configuracion segura del despliegue esta incompleta.",
        configurationErrors,
      },
      503,
    );
  }

  await next();
});

app.get("/health", (c) => {
  return c.json({
    ok: true,
    service: "configurador-dotaciones-api",
  });
});

app.post("/auth/login", zValidator("json", loginRequestSchema), async (c) => {
  const appEnv = getAppEnv(c);
  const credentials = c.req.valid("json");
  const user = await authenticateUser(appEnv, credentials.email, credentials.password);

  if (!user) {
    return c.json({ error: "Credenciales invalidas" }, 401);
  }

  const authenticatedUser = withAdminFlag(appEnv, user);
  const token = await createSessionToken(appEnv, authenticatedUser);

  setCookie(c, getCookieName(appEnv), token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: shouldUseSecureCookie(appEnv),
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return c.json(authSessionSchema.parse({ user: authenticatedUser }));
});

app.post("/auth/logout", (c) => {
  const appEnv = getAppEnv(c);

  deleteCookie(c, getCookieName(appEnv), {
    path: "/",
  });

  return c.json({ ok: true });
});

app.post("/automation/render-line", async (c) => {
  const appEnv = getAppEnv(c);
  const token = c.req.query("token") ?? c.req.header("x-automation-token") ?? null;

  if (!isValidAutomationToken(appEnv.APP_AUTOMATION_TOKEN, token)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const payload = await c.req.json().catch(() => null);
  const queryPayload = {
    lineId: c.req.query("lineId"),
    saleOrderLineId: c.req.query("saleOrderLineId"),
    sale_order_line_id: c.req.query("sale_order_line_id"),
  };
  const saleOrderLineId =
    extractSaleOrderLineIdFromWebhookPayload(payload) ??
    extractSaleOrderLineIdFromWebhookPayload(queryPayload);
  const dryRun = shouldDryRunAutomation(payload, c.req.query("dryRun") ?? null);
  const triggerWriteDate =
    extractWebhookWriteDate(payload) ?? c.req.query("write_date") ?? undefined;

  if (!saleOrderLineId) {
    return c.json(
      { error: "No se encontro un sale.order.line.id valido en el webhook." },
      400,
    );
  }

  try {
    const { renderAutomationLine } = await import(
      "./services/render-automation-line.js"
    );
    const result = await renderAutomationLine(
      appEnv,
      saleOrderLineId,
      triggerWriteDate ? { dryRun, triggerWriteDate } : { dryRun },
    );

    return c.json(result, 200, {
      "Cache-Control": "no-store",
    });
  } catch (error) {
    return c.json(
      {
        phase: "render_automation_line",
        error:
          error instanceof Error
            ? error.message
            : "No se pudo renderizar automaticamente la linea.",
      },
      500,
    );
  }
});

app.use("/auth/me", requireAppSession());
app.use("/session/*", requireAppSession());
app.use("/design/*", requireAppSession());
app.use("/admin/*", requireAppSession());
app.use("/admin/*", requireAppAdmin());

app.get("/auth/me", (c) => {
  return c.json(authSessionSchema.parse({ user: c.get("user") }));
});

app.get("/session/:saleOrderLineId", async (c) => {
  const appEnv = getAppEnv(c);
  const saleOrderLineId = Number(c.req.param("saleOrderLineId"));

  if (!Number.isFinite(saleOrderLineId) || saleOrderLineId <= 0) {
    return c.json({ error: "saleOrderLineId invalido" }, 400);
  }

  try {
    const session = await getConfiguratorSession(appEnv, saleOrderLineId);
    return c.json(configuratorSessionSchema.parse(session), 200, {
      "Cache-Control": "private, no-store",
    });
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "No se pudo cargar la sesión.",
      },
      400,
    );
  }
});

app.post(
  "/design/save",
  zValidator("json", saveDesignRequestSchema),
  async (c) => {
    const appEnv = getAppEnv(c);
    const payload = c.req.valid("json");

    try {
      const result = await saveConfiguratorDesign(appEnv, payload);
      return c.json(result, 200, {
        "Cache-Control": "no-store",
      });
    } catch (error) {
      return c.json(
        {
          error:
            error instanceof Error ? error.message : "No se pudo guardar el diseno.",
        },
        400,
      );
    }
  },
);

app.get("/admin/visual-catalog/readiness", async (c) => {
  try {
    const appEnv = getAppEnv(c);
    const [{ definitions }, releases] = await Promise.all([
      (async () => {
        await assertVisualCatalogRepositoryReady(appEnv);
        return { definitions: await listVisualDefinitions(appEnv) };
      })(),
      listVisualReleases(appEnv),
    ]);

    return c.json(
      {
        ok: true,
        backend: resolveVisualCatalogBackend(appEnv),
        supportedSlots: ["neck", "lower_pocket", "boot"],
        definitionCount: definitions.length,
        releaseCount: releases.releases.length,
        activeReleaseId: releases.activeReleaseId,
        startsEmpty:
          definitions.length === 0 &&
          releases.releases.length === 0 &&
          releases.activeReleaseId === null,
      },
      200,
      { "Cache-Control": "private, no-store" },
    );
  } catch (error) {
    return c.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo verificar el catalogo visual.",
      },
      503,
    );
  }
});

app.get("/admin/visual-catalog/definitions", async (c) => {
  try {
    const definitions = await listVisualDefinitions(getAppEnv(c));
    return c.json(visualDefinitionListSchema.parse({ definitions }), 200, {
      "Cache-Control": "private, no-store",
    });
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo consultar el catalogo visual.",
      },
      400,
    );
  }
});

app.get("/admin/visual-catalog/products", async (c) => {
  try {
    const products = await getVisualCatalogProducts(getAppEnv(c), {
      forceRefresh: c.req.query("refresh") === "1",
    });
    return c.json(visualCatalogProductListSchema.parse(products), 200, {
      "Cache-Control": "private, no-store",
    });
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron consultar los productos de Odoo.",
      },
      400,
    );
  }
});

app.get("/admin/visual-catalog/audit", async (c) => {
  try {
    const events = await listVisualCatalogAuditEvents(getAppEnv(c));
    return c.json(visualCatalogAuditListSchema.parse({ events }), 200, {
      "Cache-Control": "private, no-store",
    });
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo consultar la auditoria visual.",
      },
      400,
    );
  }
});

app.get("/admin/visual-catalog/definitions/:definitionId", async (c) => {
  try {
    const definition = await getVisualDefinition(
      getAppEnv(c),
      c.req.param("definitionId"),
    );
    return c.json(
      visualDefinitionTransitionResultSchema.parse({ definition }),
      200,
      {
        "Cache-Control": "private, no-store",
      },
    );
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo consultar la definicion visual.",
      },
      404,
    );
  }
});

app.post(
  "/admin/visual-catalog/definitions",
  zValidator("json", visualDefinitionMutationSchema),
  async (c) => {
    try {
      const appEnv = getAppEnv(c);
      const mutation = c.req.valid("json");
      await assertVisualDefinitionMatchesOdoo(appEnv, mutation);
      const definition = await createVisualDefinition(
        appEnv,
        mutation,
        c.get("user").email,
      );
      return c.json(
        visualDefinitionTransitionResultSchema.parse({ definition }),
        201,
      );
    } catch (error) {
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "No se pudo crear la definicion visual.",
        },
        400,
      );
    }
  },
);

app.put(
  "/admin/visual-catalog/definitions/:definitionId",
  zValidator("json", visualDefinitionMutationSchema),
  async (c) => {
    try {
      const appEnv = getAppEnv(c);
      const mutation = c.req.valid("json");
      await assertVisualDefinitionMatchesOdoo(appEnv, mutation);
      const definition = await updateVisualDefinition(
        appEnv,
        c.req.param("definitionId"),
        mutation,
        c.get("user").email,
      );
      return c.json(
        visualDefinitionTransitionResultSchema.parse({ definition }),
      );
    } catch (error) {
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "No se pudo actualizar la definicion visual.",
        },
        400,
      );
    }
  },
);

app.post(
  "/admin/visual-catalog/definitions/:definitionId/submit",
  async (c) => {
    try {
      const definition = await submitVisualDefinition(
        getAppEnv(c),
        c.req.param("definitionId"),
        c.get("user").email,
      );
      return c.json(
        visualDefinitionTransitionResultSchema.parse({ definition }),
      );
    } catch (error) {
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "No se pudo enviar la definicion a revision.",
        },
        400,
      );
    }
  },
);

app.post(
  "/admin/visual-catalog/definitions/:definitionId/approve",
  async (c) => {
    try {
      const appEnv = getAppEnv(c);
      const current = await getVisualDefinition(
        appEnv,
        c.req.param("definitionId"),
      );
      await assertVisualDefinitionMatchesOdoo(appEnv, current);
      const definition = await approveVisualDefinition(
        appEnv,
        c.req.param("definitionId"),
        c.get("user").email,
      );
      return c.json(
        visualDefinitionTransitionResultSchema.parse({ definition }),
      );
    } catch (error) {
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "No se pudo publicar la definicion visual.",
        },
        400,
      );
    }
  },
);

app.post(
  "/admin/visual-catalog/definitions/:definitionId/clone",
  async (c) => {
    try {
      const definition = await cloneVisualDefinition(
        getAppEnv(c),
        c.req.param("definitionId"),
        c.get("user").email,
      );
      return c.json(
        visualDefinitionTransitionResultSchema.parse({ definition }),
        201,
      );
    } catch (error) {
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "No se pudo clonar la definicion visual.",
        },
        400,
      );
    }
  },
);

app.get("/admin/visual-catalog/releases", async (c) => {
  try {
    return c.json(
      visualReleaseListSchema.parse(await listVisualReleases(getAppEnv(c))),
      200,
      { "Cache-Control": "private, no-store" },
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "No se pudieron consultar las releases." }, 400);
  }
});

app.get("/admin/visual-catalog/releases/audit", async (c) => {
  try {
    return c.json(
      visualReleaseAuditListSchema.parse({ events: await listVisualReleaseAuditEvents(getAppEnv(c)) }),
      200,
      { "Cache-Control": "private, no-store" },
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "No se pudo consultar la auditoria de releases." }, 400);
  }
});

app.post(
  "/admin/visual-catalog/releases",
  zValidator("json", visualReleaseCreateSchema),
  async (c) => {
    try {
      const env = getAppEnv(c);
      const definitions = await listVisualDefinitions(env);
      const changedDefinitionIds = new Set(
        c.req.valid("json").changedDefinitionIds,
      );
      await Promise.all(
        definitions
          .filter((definition) => changedDefinitionIds.has(definition.id))
          .map((definition) =>
            assertVisualDefinitionMatchesOdoo(env, definition),
          ),
      );
      const release = await createVisualReleaseCandidate(
        env,
        c.req.valid("json"),
        definitions,
        c.get("user").email,
      );
      return c.json(visualReleaseTransitionResultSchema.parse({ release }), 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "No se pudo crear la release candidata." }, 400);
    }
  },
);

app.put(
  "/admin/visual-catalog/releases/:releaseId/checklist",
  zValidator("json", visualReleaseChecklistMutationSchema),
  async (c) => {
    try {
      const release = await updateVisualReleaseChecklist(
        getAppEnv(c),
        c.req.param("releaseId"),
        c.req.valid("json"),
        c.get("user").email,
      );
      return c.json(visualReleaseTransitionResultSchema.parse({ release }));
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "No se pudo actualizar la lista de comprobacion." }, 400);
    }
  },
);

app.post("/admin/visual-catalog/releases/:releaseId/submit", async (c) => {
  try {
    const release = await submitVisualRelease(getAppEnv(c), c.req.param("releaseId"), c.get("user").email);
    return c.json(visualReleaseTransitionResultSchema.parse({ release }));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "No se pudo enviar la release a revision." }, 400);
  }
});

app.post("/admin/visual-catalog/releases/:releaseId/approve", async (c) => {
  try {
    const release = await approveVisualRelease(getAppEnv(c), c.req.param("releaseId"), c.get("user").email);
    return c.json(visualReleaseTransitionResultSchema.parse({ release }));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "No se pudo aprobar la release." }, 400);
  }
});

app.post("/admin/visual-catalog/releases/:releaseId/publish", async (c) => {
  try {
    assertVisualCatalogPublisher(c);
    const release = await publishVisualRelease(getAppEnv(c), c.req.param("releaseId"), c.get("user").email);
    return c.json(visualReleaseTransitionResultSchema.parse({ release }));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "No se pudo publicar la release." }, 400);
  }
});

app.post("/admin/visual-catalog/releases/:releaseId/restore", async (c) => {
  try {
    assertVisualCatalogPublisher(c);
    const release = await restoreVisualRelease(getAppEnv(c), c.req.param("releaseId"), c.get("user").email);
    return c.json(visualReleaseTransitionResultSchema.parse({ release }));
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "No se pudo restaurar la release." }, 400);
  }
});

app.get("/admin/visual-catalog/releases/:releaseId/scenarios", async (c) => {
  try {
    return c.json(
      visualReleaseScenarioListSchema.parse({ scenarios: await listVisualReleaseScenarios(getAppEnv(c), c.req.param("releaseId")) }),
      200,
      { "Cache-Control": "private, no-store" },
    );
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "No se pudieron consultar los escenarios." }, 400);
  }
});

app.post(
  "/admin/visual-catalog/releases/:releaseId/scenarios",
  zValidator("json", visualReleaseScenarioMutationSchema),
  async (c) => {
    try {
      const scenario = await saveVisualReleaseScenario(
        getAppEnv(c), c.req.param("releaseId"), c.req.valid("json"), c.get("user").email,
      );
      return c.json({ scenario: visualReleaseScenarioSchema.parse(scenario) }, 201);
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "No se pudo guardar el escenario de prueba." }, 400);
    }
  },
);

app.get(
  "/admin/visual-catalog/releases/:releaseId/preview-session/:saleOrderLineId",
  async (c) => {
    try {
      const release = await getVisualRelease(getAppEnv(c), c.req.param("releaseId"));
      const saleOrderLineId = Number(c.req.param("saleOrderLineId"));
      if (!Number.isFinite(saleOrderLineId) || saleOrderLineId <= 0) {
        return c.json({ error: "saleOrderLineId invalido" }, 400);
      }
      const definitionIds = c.req.query("view") === "baseline"
        ? release.baselineDefinitionIds
        : await getVisualReleaseCandidatePreviewDefinitionIds(
            getAppEnv(c),
            release.id,
          );
      const session = await getConfiguratorSession(getAppEnv(c), saleOrderLineId, {
        visualDefinitionIdsOverride: definitionIds,
        visualReleaseId: release.id,
        pinActiveVisualRelease: false,
      });
      const scenarioId = c.req.query("scenarioId");
      const scenario = scenarioId
        ? (await listVisualReleaseScenarios(getAppEnv(c), release.id)).find(
            (candidate) =>
              candidate.id === scenarioId &&
              candidate.saleOrderLineId === saleOrderLineId,
          )
        : null;
      return c.json(configuratorSessionSchema.parse({
        ...session,
        ...(scenario
          ? {
              selectedValueIds: scenario.selectedValueIds,
              customValuesByValueId: scenario.customValuesByValueId,
            }
          : {}),
      }), 200, {
        "Cache-Control": "private, no-store",
      });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "No se pudo cargar el laboratorio." }, 400);
    }
  },
);

export default app;
