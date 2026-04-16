import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { verifySessionToken } from "../lib/auth";
import {
  type AppEnv,
  type AppVariables,
  getAppEnv,
} from "../lib/app-env";

function getCookieName(env: Partial<AppEnv>) {
  return env.APP_COOKIE_NAME ?? "la_roca_session";
}

export function requireAppSession() {
  return createMiddleware<{ Bindings: Partial<AppEnv>; Variables: AppVariables }>(
    async (c, next) => {
      const appEnv = getAppEnv(c);

      if (appEnv.ALLOW_DEV_BYPASS_ACCESS === "true") {
        c.set("user", {
          email: appEnv.DEV_SESSION_USER_EMAIL ?? "demo@la-roca.local",
          name: appEnv.DEV_SESSION_USER_NAME ?? "Demo La Roca",
        });
        await next();
        return;
      }

      const token = getCookie(c, getCookieName(appEnv));

      if (!token) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      try {
        const user = await verifySessionToken(appEnv, token);
        c.set("user", user);
        await next();
      } catch {
        return c.json({ error: "Unauthorized" }, 401);
      }
    },
  );
}
