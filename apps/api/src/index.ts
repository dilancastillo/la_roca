import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import {
  authSessionSchema,
  configuratorSessionSchema,
  loginRequestSchema,
  saveDesignRequestSchema,
} from "@repo/shared/schemas/configurator";
import { authenticateUser, createSessionToken } from "./lib/auth.js";
import {
  type AppEnv,
  type AppVariables,
  getAppEnv,
} from "./lib/app-env.js";
import { requireAppSession } from "./middleware/require-app-session.js";
import { getConfiguratorSession } from "./services/get-configurator-session.js";
import { saveConfiguratorDesign } from "./services/save-configurator-design.js";
import {
  extractSaleOrderLineIdFromWebhookPayload,
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

  const token = await createSessionToken(appEnv, user);

  setCookie(c, getCookieName(appEnv), token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: shouldUseSecureCookie(appEnv),
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return c.json(authSessionSchema.parse({ user }));
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
    const result = await renderAutomationLine(appEnv, saleOrderLineId, { dryRun });

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

export default app;
