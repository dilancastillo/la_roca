function ensureOdooEnv(env) {
    if (!env.ODOO_BASE_URL || !env.ODOO_DB || !env.ODOO_API_KEY) {
        throw new Error("Faltan ODOO_BASE_URL, ODOO_DB u ODOO_API_KEY en el entorno");
    }
}
export async function odooCall(env, model, method, body) {
    ensureOdooEnv(env);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    const baseUrl = env.ODOO_BASE_URL;
    const db = env.ODOO_DB;
    const apiKey = env.ODOO_API_KEY;
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
            throw new Error(`Odoo ${model}.${method} respondio ${response.status}: ${text}`);
        }
        return (await response.json());
    }
    finally {
        clearTimeout(timeout);
    }
}
export async function odooRead(env, model, ids, fields) {
    return await odooCall(env, model, "read", { ids, fields });
}
export async function odooSearchRead(env, model, domain, fields, order) {
    return await odooCall(env, model, "search_read", {
        domain,
        fields,
        ...(order ? { order } : {}),
    });
}
export async function odooWrite(env, model, ids, vals) {
    return await odooCall(env, model, "write", { ids, vals });
}
export async function odooCreate(env, model, valsList) {
    return await odooCall(env, model, "create", { vals_list: valsList });
}
