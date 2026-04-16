export function isValidAutomationToken(
  configuredToken: string | undefined,
  providedToken: string | null,
) {
  if (!configuredToken) {
    return false;
  }

  return configuredToken === providedToken;
}

export function extractSaleOrderLineIdFromWebhookPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  const candidates = [
    record.id,
    record.saleOrderLineId,
    typeof record.data === "object" && record.data ? (record.data as Record<string, unknown>).id : undefined,
    typeof record.record === "object" && record.record
      ? (record.record as Record<string, unknown>).id
      : undefined,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate) && candidate > 0) {
      return candidate;
    }

    if (typeof candidate === "string") {
      const parsed = Number(candidate);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }

  return null;
}
