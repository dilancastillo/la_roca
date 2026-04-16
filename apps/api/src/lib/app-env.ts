import type { Context } from "hono";
import { env as readRuntimeEnv } from "hono/adapter";

export type AppEnv = {
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

export type OdooEnv = Pick<
  AppEnv,
  "ODOO_BASE_URL" | "ODOO_DB" | "ODOO_API_KEY"
>;

export type AuthEnv = Pick<AppEnv, "APP_JWT_SECRET" | "APP_USERS_JSON">;

export type AppVariables = {
  user: {
    email: string;
    name: string;
  };
};

export type AppContext = Context<{
  Bindings: Partial<AppEnv>;
  Variables: AppVariables;
}>;

export function getAppEnv(c: AppContext): AppEnv {
  return readRuntimeEnv<AppEnv>(c, "node");
}
