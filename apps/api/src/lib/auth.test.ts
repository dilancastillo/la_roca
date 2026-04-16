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
});
