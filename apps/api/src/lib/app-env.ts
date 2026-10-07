import type { Context } from "hono";
import { env as readRuntimeEnv } from "hono/adapter";

export type AppEnv = {
  APP_ENV?: string;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  ODOO_BASE_URL?: string;
  ODOO_DB?: string;
  ODOO_API_KEY?: string;
  APP_JWT_SECRET?: string;
  APP_USERS_JSON?: string;
  APP_ADDITIONAL_USERS_JSON?: string;
  APP_COOKIE_NAME?: string;
  APP_COOKIE_SECURE?: string;
  APP_AUTOMATION_TOKEN?: string;
  APP_ADMIN_EMAILS?: string;
  APP_ADDITIONAL_ADMIN_EMAILS?: string;
  APP_VISUAL_CATALOG_PUBLISHER_EMAILS?: string;
  APP_ADDITIONAL_VISUAL_CATALOG_PUBLISHER_EMAILS?: string;
  ALLOW_DEV_BYPASS_ACCESS?: string;
  DEV_SESSION_USER_EMAIL?: string;
  DEV_SESSION_USER_NAME?: string;
  VISUAL_CATALOG_BACKEND?: string;
  VISUAL_CATALOG_DATA_DIR?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_VISUAL_CATALOG_BUCKET?: string;
};

export type OdooEnv = Pick<
  AppEnv,
  "ODOO_BASE_URL" | "ODOO_DB" | "ODOO_API_KEY"
>;

export type AuthEnv = Pick<
  AppEnv,
  | "APP_JWT_SECRET"
  | "APP_USERS_JSON"
  | "APP_ADDITIONAL_USERS_JSON"
  | "APP_ADMIN_EMAILS"
  | "APP_ADDITIONAL_ADMIN_EMAILS"
  | "APP_VISUAL_CATALOG_PUBLISHER_EMAILS"
  | "APP_ADDITIONAL_VISUAL_CATALOG_PUBLISHER_EMAILS"
>;

export type AppVariables = {
  user: {
    email: string;
    name: string;
    isAdmin?: boolean | undefined;
    canPublishVisualCatalog?: boolean | undefined;
  };
};

export type AppContext = Context<{
  Bindings: Partial<AppEnv>;
  Variables: AppVariables;
}>;

export function getAppEnv(c: AppContext): AppEnv {
  return readRuntimeEnv<AppEnv>(c);
}

export type VisualCatalogBackend = "file" | "supabase";

function normalizeEnvironmentValue(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function splitEmails(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function hasValidUsersJson(value: string | undefined) {
  if (!value) {
    return false;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    return (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every(
        (user) =>
          typeof user === "object" &&
          user !== null &&
          typeof (user as Record<string, unknown>).email === "string" &&
          typeof (user as Record<string, unknown>).name === "string" &&
          typeof (user as Record<string, unknown>).salt === "string" &&
          typeof (user as Record<string, unknown>).passwordHash === "string",
      )
    );
  } catch {
    return false;
  }
}

export function isDeployedRuntime(env: Partial<AppEnv>) {
  const vercelEnvironment = normalizeEnvironmentValue(env.VERCEL_ENV);
  const appEnvironment = normalizeEnvironmentValue(env.APP_ENV);
  const nodeEnvironment = normalizeEnvironmentValue(env.NODE_ENV);

  return (
    vercelEnvironment === "preview" ||
    vercelEnvironment === "production" ||
    appEnvironment === "production" ||
    (nodeEnvironment === "production" && vercelEnvironment !== "development")
  );
}

export function resolveVisualCatalogBackend(
  env: Partial<AppEnv>,
): VisualCatalogBackend {
  const configuredBackend = normalizeEnvironmentValue(
    env.VISUAL_CATALOG_BACKEND,
  );

  if (
    configuredBackend &&
    configuredBackend !== "file" &&
    configuredBackend !== "supabase"
  ) {
    throw new Error(
      "VISUAL_CATALOG_BACKEND debe ser 'file' o 'supabase'.",
    );
  }

  const backend = (configuredBackend ||
    (env.SUPABASE_URL ? "supabase" : "file")) as VisualCatalogBackend;

  if (isDeployedRuntime(env) && backend !== "supabase") {
    throw new Error(
      "Un despliegue remoto no puede usar archivos locales para el catalogo visual.",
    );
  }

  return backend;
}

export function getDeploymentConfigurationErrors(env: Partial<AppEnv>) {
  if (!isDeployedRuntime(env)) {
    return [];
  }

  const errors: string[] = [];
  const requiredValues: Array<[keyof AppEnv, string | undefined]> = [
    ["ODOO_BASE_URL", env.ODOO_BASE_URL],
    ["ODOO_DB", env.ODOO_DB],
    ["ODOO_API_KEY", env.ODOO_API_KEY],
    ["APP_COOKIE_NAME", env.APP_COOKIE_NAME],
    ["APP_AUTOMATION_TOKEN", env.APP_AUTOMATION_TOKEN],
    ["APP_ADMIN_EMAILS", env.APP_ADMIN_EMAILS],
    [
      "APP_VISUAL_CATALOG_PUBLISHER_EMAILS",
      env.APP_VISUAL_CATALOG_PUBLISHER_EMAILS,
    ],
    ["SUPABASE_URL", env.SUPABASE_URL],
    ["SUPABASE_SERVICE_ROLE_KEY", env.SUPABASE_SERVICE_ROLE_KEY],
    [
      "SUPABASE_VISUAL_CATALOG_BUCKET",
      env.SUPABASE_VISUAL_CATALOG_BUCKET,
    ],
  ];

  for (const [name, value] of requiredValues) {
    if (!value?.trim()) {
      errors.push(`Falta ${name}.`);
    }
  }

  if ((env.APP_JWT_SECRET?.trim().length ?? 0) < 32) {
    errors.push("APP_JWT_SECRET debe tener al menos 32 caracteres.");
  }

  if (!hasValidUsersJson(env.APP_USERS_JSON)) {
    errors.push(
      "APP_USERS_JSON debe contener al menos un usuario productivo valido.",
    );
  }

  if (env.APP_COOKIE_SECURE !== "true") {
    errors.push("APP_COOKIE_SECURE debe ser 'true'.");
  }

  if (env.ALLOW_DEV_BYPASS_ACCESS === "true") {
    errors.push("ALLOW_DEV_BYPASS_ACCESS no puede estar activo.");
  }

  if (normalizeEnvironmentValue(env.VISUAL_CATALOG_BACKEND) !== "supabase") {
    errors.push("VISUAL_CATALOG_BACKEND debe ser 'supabase'.");
  }

  const adminEmails = new Set(splitEmails(env.APP_ADMIN_EMAILS));
  const publisherEmails = splitEmails(
    env.APP_VISUAL_CATALOG_PUBLISHER_EMAILS,
  );

  if (adminEmails.size === 0) {
    errors.push("APP_ADMIN_EMAILS debe incluir al menos un correo.");
  }

  if (publisherEmails.length === 0) {
    errors.push(
      "APP_VISUAL_CATALOG_PUBLISHER_EMAILS debe incluir al menos un correo.",
    );
  } else if (publisherEmails.some((email) => !adminEmails.has(email))) {
    errors.push(
      "Todo publicador del catalogo visual debe estar incluido en APP_ADMIN_EMAILS.",
    );
  }

  if (
    env.ODOO_BASE_URL &&
    !/^https:\/\//i.test(env.ODOO_BASE_URL.trim())
  ) {
    errors.push("ODOO_BASE_URL debe usar HTTPS.");
  }

  if (
    env.SUPABASE_URL &&
    !/^https:\/\//i.test(env.SUPABASE_URL.trim())
  ) {
    errors.push("SUPABASE_URL debe usar HTTPS.");
  }

  return errors;
}
