import { describe, expect, it } from "vitest";
import { toOdooDatetimeString } from "./odoo-datetime.js";

describe("toOdooDatetimeString", () => {
  it("convierte una fecha ISO al formato datetime que espera Odoo", () => {
    const date = new Date("2026-04-09T23:10:32.307Z");

    expect(toOdooDatetimeString(date)).toBe("2026-04-09 23:10:32");
  });

  it("usa UTC y elimina milisegundos", () => {
    const date = new Date("2026-01-02T03:04:05.999Z");

    expect(toOdooDatetimeString(date)).toBe("2026-01-02 03:04:05");
  });
});
