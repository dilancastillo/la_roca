import type { OdooEnv } from "./app-env.js";

const RATE_LIMIT_MAX_ATTEMPTS = 4;
const RATE_LIMIT_BASE_DELAY_MS = 750;

export class OdooHttpError extends Error {
  status: number;
  model: string;
  method: string;

  constructor(model: string, method: string, status: number, message: string) {
    super(`Odoo ${model}.${method} respondio ${status}: ${message}`);
    this.name = "OdooHttpError";
    this.status = status;
    this.model = model;
    this.method = method;
  }
}

function ensureOdooEnv(env: OdooEnv) {
  if (!env.ODOO_BASE_URL || !env.ODOO_DB || !env.ODOO_API_KEY) {
    throw new Error(
      "Faltan ODOO_BASE_URL, ODOO_DB u ODOO_API_KEY en el entorno",
    );
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(value: string) {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getRetryAfterDelayMs(value: string | null) {
  if (!value) {
    return undefined;
  }

  const seconds = Number(value);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(seconds * 1_000, 10_000);
  }

  const retryDate = new Date(value).getTime();
  const delay = retryDate - Date.now();

  return Number.isFinite(delay) && delay > 0 ? Math.min(delay, 10_000) : undefined;
}

function getRateLimitDelayMs(response: Response, attempt: number) {
  return (
    getRetryAfterDelayMs(response.headers.get("retry-after")) ??
    RATE_LIMIT_BASE_DELAY_MS * 2 ** (attempt - 1)
  );
}

function getFriendlyOdooErrorMessage(status: number, text: string) {
  if (status === 429) {
    return "Odoo limito temporalmente las solicitudes por exceso de carga. Espera unos segundos y vuelve a abrir la linea.";
  }

  return stripHtml(text).slice(0, 800) || "La solicitud a Odoo no se pudo completar.";
}

export async function odooCall<T>(
  env: OdooEnv,
  model: string,
  method: string,
  body: unknown,
): Promise<T> {
  ensureOdooEnv(env);

  const baseUrl = env.ODOO_BASE_URL as string;
  const db = env.ODOO_DB as string;
  const apiKey = env.ODOO_API_KEY as string;

  for (let attempt = 1; attempt <= RATE_LIMIT_MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);

    try {
      const headers = new Headers();
      headers.set("Authorization", `bearer ${apiKey}`);
      headers.set("X-Odoo-Database", db);
      headers.set("Content-Type", "application/json");

      const response = await fetch(`${baseUrl}/json/2/${model}/${method}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (response.status === 429 && attempt < RATE_LIMIT_MAX_ATTEMPTS) {
        clearTimeout(timeout);
        await sleep(getRateLimitDelayMs(response, attempt));
        continue;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new OdooHttpError(
          model,
          method,
          response.status,
          getFriendlyOdooErrorMessage(response.status, text),
        );
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new OdooHttpError(
    model,
    method,
    429,
    getFriendlyOdooErrorMessage(429, ""),
  );
}

export async function odooRead<T>(
  env: OdooEnv,
  model: string,
  ids: number[],
  fields: string[],
): Promise<T[]> {
  return await odooCall<T[]>(env, model, "read", { ids, fields });
}

export async function odooSearchRead<T>(
  env: OdooEnv,
  model: string,
  domain: unknown[],
  fields: string[],
  order?: string,
  options: { limit?: number; offset?: number } = {},
): Promise<T[]> {
  return await odooCall<T[]>(env, model, "search_read", {
    domain,
    fields,
    ...(order ? { order } : {}),
    ...(options.limit !== undefined ? { limit: options.limit } : {}),
    ...(options.offset !== undefined ? { offset: options.offset } : {}),
  });
}

export async function odooWrite(
  env: OdooEnv,
  model: string,
  ids: number[],
  vals: Record<string, unknown>,
): Promise<boolean> {
  return await odooCall<boolean>(env, model, "write", { ids, vals });
}

export async function odooCreate<T>(
  env: OdooEnv,
  model: string,
  valsList: Record<string, unknown>[],
): Promise<T> {
  return await odooCall<T>(env, model, "create", { vals_list: valsList });
}
