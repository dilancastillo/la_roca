type OdooEnv = {
  ODOO_BASE_URL?: string;
  ODOO_DB?: string;
  ODOO_API_KEY?: string;
};

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

  try {
    const response = await fetch(
      `${env.ODOO_BASE_URL}/json/2/${model}/${method}`,
      {
        method: "POST",
        headers: {
          Authorization: `bearer ${env.ODOO_API_KEY}`,
          "X-Odoo-Database": env.ODOO_DB,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Odoo ${model}.${method} respondió ${response.status}: ${text}`,
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