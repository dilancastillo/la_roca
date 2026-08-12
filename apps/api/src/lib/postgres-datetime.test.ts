import { describe, expect, it } from "vitest";
import { normalizePostgresDatetime } from "./postgres-datetime.js";

describe("normalizePostgresDatetime", () => {
  it("convierte timestamps timestamptz de Supabase a UTC ISO", () => {
    expect(
      normalizePostgresDatetime("2026-08-11T19:55:00.123456+00:00"),
    ).toBe("2026-08-11T19:55:00.123Z");
  });

  it("conserva nulos y deja que el esquema reporte valores invalidos", () => {
    expect(normalizePostgresDatetime(null)).toBeNull();
    expect(normalizePostgresDatetime("fecha-invalida")).toBe("fecha-invalida");
  });
});
