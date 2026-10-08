import { createMiddleware } from "hono/factory";
import type { AppEnv, AppVariables } from "../lib/app-env.js";

export function requireFullAppAccess() {
  return createMiddleware<{
    Bindings: Partial<AppEnv>;
    Variables: AppVariables;
  }>(async (c, next) => {
    if (c.get("user")?.isVisualCatalogEditorOnly) {
      return c.json(
        { error: "Tu cuenta solo tiene acceso al editor del catalogo visual." },
        403,
      );
    }

    await next();
  });
}
