import type { OdooEnv } from "./app-env.js";

function ensureOdooEnv(env: OdooEnv) {
  if (!env.ODOO_BASE_URL || !env.ODOO_DB || !env.ODOO_API_KEY) {
    throw new Error(
      "Faltan ODOO_BASE_URL, ODOO_DB u ODOO_API_KEY en el entorno",
    );
  }
}

export async function odooCall<T>(
  env: OdooEnv,
  model: string,
  method: string,
  body: unknown,
): Promise<T> {
  ensureOdooEnv(env);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  const baseUrl = env.ODOO_BASE_URL as string;
  const db = env.ODOO_DB as string;
  const apiKey = env.ODOO_API_KEY as string;

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

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Odoo ${model}.${method} respondio ${response.status}: ${text}`,
      );
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
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
): Promise<T[]> {
  return await odooCall<T[]>(env, model, "search_read", {
    domain,
    fields,
    ...(order ? { order } : {}),
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
