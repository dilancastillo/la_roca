export function normalizePostgresDatetime(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
}
