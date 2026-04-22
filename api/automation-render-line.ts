import type { AppEnv } from "../apps/api/src/lib/app-env.js";
import {
  extractSaleOrderLineIdFromWebhookPayload,
  isValidAutomationToken,
  shouldDryRunAutomation,
} from "../apps/api/src/services/automation-webhook.js";

export const runtime = "nodejs";

function getAutomationEnv(): Partial<AppEnv> {
  return {
    ...(process.env.ODOO_BASE_URL
      ? { ODOO_BASE_URL: process.env.ODOO_BASE_URL }
      : {}),
    ...(process.env.ODOO_DB ? { ODOO_DB: process.env.ODOO_DB } : {}),
    ...(process.env.ODOO_API_KEY
      ? { ODOO_API_KEY: process.env.ODOO_API_KEY }
      : {}),
    ...(process.env.APP_AUTOMATION_TOKEN
      ? { APP_AUTOMATION_TOKEN: process.env.APP_AUTOMATION_TOKEN }
      : {}),
  };
}

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method Not Allowed" }, { status: 405 });
  }

  const env = getAutomationEnv();
  const url = new URL(request.url);
  const token =
    url.searchParams.get("token") ?? request.headers.get("x-automation-token");

  if (!isValidAutomationToken(env.APP_AUTOMATION_TOKEN, token)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const queryPayload = {
    lineId: url.searchParams.get("lineId"),
    saleOrderLineId: url.searchParams.get("saleOrderLineId"),
    sale_order_line_id: url.searchParams.get("sale_order_line_id"),
  };
  const saleOrderLineId =
    extractSaleOrderLineIdFromWebhookPayload(payload) ??
    extractSaleOrderLineIdFromWebhookPayload(queryPayload);
  const dryRun = shouldDryRunAutomation(payload, url.searchParams.get("dryRun"));

  if (!saleOrderLineId) {
    return Response.json(
      { error: "No se encontro un sale.order.line.id valido en el webhook." },
      { status: 400 },
    );
  }

  try {
    const { renderAutomationLine } = await import(
      "../apps/api/src/services/render-automation-line.js"
    );
    const result = await renderAutomationLine(env, saleOrderLineId, { dryRun });
    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      {
        phase: "render_automation_line",
        error:
          error instanceof Error
            ? error.message
            : "No se pudo renderizar automaticamente la linea.",
      },
      { status: 500 },
    );
  }
}
