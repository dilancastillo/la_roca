import { createMiddleware } from "hono/factory";
import type { AppEnv, AppVariables } from "../lib/app-env.js";

export function requireVisualCatalogEditor() {
  return createMiddleware<{
    Bindings: Partial<AppEnv>;
    Variables: AppVariables;
  }>(async (c, next) => {
    if (!c.get("user")?.canEditVisualCatalog) {
      return c.json(
        { error: "Esta seccion esta reservada para editores del catalogo visual." },
        403,
      );
    }

    await next();
  });
}
