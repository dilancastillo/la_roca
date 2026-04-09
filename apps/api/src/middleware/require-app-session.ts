import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { verifySessionToken } from "../lib/auth";

type Bindings = {
  APP_JWT_SECRET?: string;
  APP_COOKIE_NAME?: string;
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

function getCookieName(env: Bindings) {
  return env.APP_COOKIE_NAME ?? "la_roca_session";
}

export function requireAppSession() {
  return createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
    async (c, next) => {
      if (c.env.ALLOW_DEV_BYPASS_ACCESS === "true") {
        c.set("user", {
          email: c.env.DEV_SESSION_USER_EMAIL ?? "demo@la-roca.local",
          name: c.env.DEV_SESSION_USER_NAME ?? "Demo La Roca",
        });
        await next();
        return;
      }

      const token = getCookie(c, getCookieName(c.env));

      if (!token) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const user = await verifySessionToken(c.env, token);
        c.set("user", user);
        await next();
      } catch {
        return c.json({ error: "Unauthorized" }, 401);
      }
    },
  );
}
