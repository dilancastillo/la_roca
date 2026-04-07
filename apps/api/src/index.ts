import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  configuratorSessionSchema,
  saveDesignRequestSchema,
} from "@repo/shared/schemas/configurator";
import { requireAccessJwt } from "./middleware/require-access-jwt";
import { getConfiguratorSession } from "./services/get-configurator-session";
import { saveLineDesignImage } from "./services/save-line-design-image";

type Env = {
  ODOO_BASE_URL?: string;
  ODOO_DB?: string;
  ODOO_API_KEY?: string;
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  ALLOW_DEV_BYPASS_ACCESS?: string;
  DEV_SESSION_USER_EMAIL?: string;
  CONFIG_SOURCE?: string;
};

type Variables = {
  user: {
    email: string;
    sub: string;
    authMode: "access" | "dev-bypass";
  };
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.get("/api/health", (c) => {
  return c.json({
    ok: true,
    service: "configurador-dotaciones-api",
    configSource: c.env.CONFIG_SOURCE ?? "mock",
  });
});

app.use("/api/*", requireAccessJwt());

app.get("/api/session/:saleOrderLineId", async (c) => {
  const saleOrderLineId = Number(c.req.param("saleOrderLineId"));

  if (!Number.isFinite(saleOrderLineId) || saleOrderLineId <= 0) {
    return c.json({ error: "saleOrderLineId inválido" }, 400);
  }

  const session = await getConfiguratorSession(c.env, saleOrderLineId);

  const parsed = configuratorSessionSchema.parse(session);

  return c.json(parsed, 200, {
    "Cache-Control": "private, no-store",
  });
});

app.post(
  "/api/design/save",
  zValidator("json", saveDesignRequestSchema),
  async (c) => {
    const payload = c.req.valid("json");
    const result = await saveLineDesignImage(c.env, payload);

    return c.json(result, 200, {
      "Cache-Control": "no-store",
    });
  },
);

export default app;