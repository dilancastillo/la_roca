import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import {
  authSessionSchema,
  configuratorSessionSchema,
  loginRequestSchema,
  saveDesignRequestSchema,
} from "@repo/shared/schemas/configurator";
import { authenticateUser, createSessionToken } from "./lib/auth";
import { requireAppSession } from "./middleware/require-app-session";
import { getConfiguratorSession } from "./services/get-configurator-session";
import { saveConfiguratorDesign } from "./services/save-configurator-design";

type Env = {
  ODOO_BASE_URL?: string;
  ODOO_DB?: string;
  ODOO_API_KEY?: string;
  APP_JWT_SECRET?: string;
  APP_USERS_JSON?: string;
  APP_COOKIE_NAME?: string;
  APP_COOKIE_SECURE?: string;
  ALLOW_DEV_BYPASS_ACCESS?: string;
  DEV_SESSION_USER_EMAIL?: string;
  DEV_SESSION_USER_NAME?: string;
};

type Variables = {
  user: {
    email: string;
    name: string;
  };
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

function getCookieName(env: Env) {
  return env.APP_COOKIE_NAME ?? "la_roca_session";
}

function shouldUseSecureCookie(env: Env) {
  return env.APP_COOKIE_SECURE === "true";
}

app.get("/api/health", (c) => {
  return c.json({
    ok: true,
    service: "configurador-dotaciones-api",
  });
});

app.post("/api/auth/login", zValidator("json", loginRequestSchema), async (c) => {
  const credentials = c.req.valid("json");
  const user = await authenticateUser(c.env, credentials.email, credentials.password);

  if (!user) {
    return c.json({ error: "Credenciales invalidas" }, 401);
  }

  const token = await createSessionToken(c.env, user);

  setCookie(c, getCookieName(c.env), token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: shouldUseSecureCookie(c.env),
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return c.json(authSessionSchema.parse({ user }));
});

app.post("/api/auth/logout", (c) => {
  deleteCookie(c, getCookieName(c.env), {
    path: "/",
  });

  return c.json({ ok: true });
});

app.use("/api/auth/me", requireAppSession());
app.use("/api/session/*", requireAppSession());
app.use("/api/design/*", requireAppSession());

app.get("/api/auth/me", (c) => {
  return c.json(authSessionSchema.parse({ user: c.get("user") }));
});

app.get("/api/session/:saleOrderLineId", async (c) => {
  const saleOrderLineId = Number(c.req.param("saleOrderLineId"));

  if (!Number.isFinite(saleOrderLineId) || saleOrderLineId <= 0) {
    return c.json({ error: "saleOrderLineId invalido" }, 400);
  }

  try {
    const session = await getConfiguratorSession(c.env, saleOrderLineId);
    return c.json(configuratorSessionSchema.parse(session), 200, {
      "Cache-Control": "private, no-store",
    });
  } catch (error) {
    return c.json(
      {
        error:
          error instanceof Error ? error.message : "No se pudo cargar la sesion.",
      },
      400,
    );
  }
});

app.post(
  "/api/design/save",
  zValidator("json", saveDesignRequestSchema),
  async (c) => {
    const payload = c.req.valid("json");

    try {
      const result = await saveConfiguratorDesign(c.env, payload);
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
