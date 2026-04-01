type OdooEnv = {
  ODOO_BASE_URL: string;
  ODOO_DB: string;
  ODOO_API_KEY: string;
};

export async function odooCall<T>(
  env: OdooEnv,
  model: string,
  method: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${env.ODOO_BASE_URL}/json/2/${model}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `bearer ${env.ODOO_API_KEY}`,
      "X-Odoo-Database": env.ODOO_DB,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Odoo error: ${res.status} ${text}`);
  }

  return (await res.json()) as T;
}