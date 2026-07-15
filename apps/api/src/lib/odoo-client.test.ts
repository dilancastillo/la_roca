import { afterEach, describe, expect, it, vi } from "vitest";
import { odooRead } from "./odoo-client.js";

const env = {
  ODOO_BASE_URL: "https://odoo.example.test",
  ODOO_DB: "la-roca",
  ODOO_API_KEY: "secret",
};

function response(body: string, init: ResponseInit) {
  return new Response(body, init);
}

describe("odoo-client", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("reintenta automaticamente cuando Odoo responde 429", async () => {
    vi.useFakeTimers();
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        response("<html><title>Rate limit exceeded</title></html>", {
          status: 429,
          headers: { "content-type": "text/html" },
        }),
      )
      .mockResolvedValueOnce(
        response(JSON.stringify([{ id: 10, name: "Azul" }]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = odooRead(env, "product.attribute.value", [10], [
      "id",
      "name",
    ]);

    await vi.advanceTimersByTimeAsync(750);

    await expect(result).resolves.toEqual([{ id: 10, name: "Azul" }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("devuelve un mensaje limpio si Odoo mantiene el rate limit", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      response(
        "<html><head><title>Rate limit exceeded</title></head><body>Keep calm and breathe deeply</body></html>",
        {
          status: 429,
          headers: { "content-type": "text/html" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = odooRead(env, "product.attribute.value", [10], [
      "id",
      "name",
    ]).catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(750);
    await vi.advanceTimersByTimeAsync(1_500);
    await vi.advanceTimersByTimeAsync(3_000);

    const error = await result;

    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(
      "Odoo product.attribute.value.read respondio 429: Odoo limito temporalmente las solicitudes por exceso de carga.",
    );
    expect((error as Error).message).not.toContain("<html>");
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
