import { describe, expect, it } from "vitest";
import { authenticateUser } from "./auth.js";

describe("authenticateUser", () => {
  it("acepta las credenciales locales de desarrollo", async () => {
    const user = await authenticateUser({}, "demo@la-roca.local", "Demo1234!");

    expect(user).not.toBeNull();
    expect(user?.email).toBe("demo@la-roca.local");
  });

  it("rechaza una contraseña incorrecta", async () => {
    const user = await authenticateUser({}, "demo@la-roca.local", "otra-clave");

    expect(user).toBeNull();
  });

  it("combina cuentas adicionales sin reemplazar las cuentas existentes", async () => {
    const password = "otra-clave-segura";
    const salt = "c2FsdA==";
    const passwordHash = await (async () => {
      const saltBytes = Uint8Array.from(atob(salt), (char) => char.charCodeAt(0));
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"],
      );
      const bits = await crypto.subtle.deriveBits(
        { name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations: 1 },
        key,
        256,
      );
      return btoa(String.fromCharCode(...new Uint8Array(bits)));
    })();
    const env = {
      APP_USERS_JSON: JSON.stringify([
        {
          email: "existente@example.com",
          name: "Existente",
          salt,
          passwordHash,
          iterations: 1,
        },
      ]),
      APP_ADDITIONAL_USERS_JSON: JSON.stringify([
        {
          email: "nuevo@example.com",
          name: "Nuevo",
          salt,
          passwordHash,
          iterations: 1,
        },
      ]),
    };

    expect(await authenticateUser(env, "existente@example.com", password)).not.toBeNull();
    expect(await authenticateUser(env, "nuevo@example.com", password)).not.toBeNull();
  });
});
