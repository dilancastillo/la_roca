import { createMiddleware } from "hono/factory";
import type { AppEnv, AppVariables } from "../lib/app-env.js";

export function requireAppAdmin() {
  return createMiddleware<{
    Bindings: Partial<AppEnv>;
    Variables: AppVariables;
  }>(async (c, next) => {
    if (!c.get("user")?.isAdmin) {
      return c.json(
        { error: "Esta seccion esta reservada para administradores." },
        403,
      );
    }

    await next();
  });
}
