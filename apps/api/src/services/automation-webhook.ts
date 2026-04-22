export function isValidAutomationToken(
  configuredToken: string | undefined,
  providedToken: string | null,
) {
  if (!configuredToken) {
    return false;
  }

  return configuredToken === providedToken;
}

function parsePositiveId(candidate: unknown) {
  if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
    return Math.trunc(candidate);
  }

  if (typeof candidate === "string") {
    const parsed = Number(candidate);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.trunc(parsed);
    }
  }

  return null;
}

function readObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function extractSaleOrderLineIdFromWebhookPayload(payload: unknown) {
  const record = readObject(payload);

  if (!record) {
    return null;
  }

  const candidates = [
    record.id,
    record.lineId,
    record.line_id,
    record.saleOrderLineId,
    record.sale_order_line_id,
    readObject(record.data)?.id,
    readObject(record.data)?.lineId,
    readObject(record.data)?.line_id,
    readObject(record.data)?.saleOrderLineId,
    readObject(record.data)?.sale_order_line_id,
    readObject(record.record)?.id,
    readObject(record.record)?.lineId,
    readObject(record.record)?.line_id,
    readObject(record.record)?.saleOrderLineId,
    readObject(record.record)?.sale_order_line_id,
    Array.isArray(record.ids) ? record.ids[0] : undefined,
    Array.isArray(record.records) ? readObject(record.records[0])?.id : undefined,
  ];

  for (const candidate of candidates) {
    const parsed = parsePositiveId(candidate);
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

export function shouldDryRunAutomation(payload: unknown, dryRunParam: string | null) {
  const normalizedParam = String(dryRunParam ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["1", "true", "yes", "si"].includes(normalizedParam)) {
    return true;
  }

  const record = readObject(payload);
  const dryRunValue = record?.dryRun ?? record?.dry_run;

  return dryRunValue === true || dryRunValue === "true" || dryRunValue === "1";
}
