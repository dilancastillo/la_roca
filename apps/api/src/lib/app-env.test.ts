import { describe, expect, it } from "vitest";
import {
  getDeploymentConfigurationErrors,
  isDeployedRuntime,
  resolveVisualCatalogBackend,
  type AppEnv,
} from "./app-env.js";

const productionEnv: AppEnv = {
  VERCEL_ENV: "production",
  ODOO_BASE_URL: "https://odoo.example.com",
  ODOO_DB: "production",
  ODOO_API_KEY: "odoo-api-key",
  APP_JWT_SECRET: "a-production-secret-with-32-characters",
  APP_USERS_JSON: JSON.stringify([
    {
      email: "admin@example.com",
      name: "Administrador",
      salt: "c2FsdA==",
      passwordHash: "aGFzaA==",
      iterations: 210_000,
    },
  ]),
  APP_COOKIE_NAME: "la_roca_session",
  APP_COOKIE_SECURE: "true",
  APP_AUTOMATION_TOKEN: "automation-token",
  APP_ADMIN_EMAILS: "admin@example.com",
  APP_VISUAL_CATALOG_PUBLISHER_EMAILS: "admin@example.com",
  ALLOW_DEV_BYPASS_ACCESS: "false",
  VISUAL_CATALOG_BACKEND: "supabase",
  SUPABASE_URL: "https://project.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  SUPABASE_VISUAL_CATALOG_BUCKET: "visual-catalog",
};

describe("configuracion de despliegue", () => {
  it("permite archivos locales solamente durante desarrollo local", () => {
    expect(isDeployedRuntime({})).toBe(false);
    expect(resolveVisualCatalogBackend({})).toBe("file");
  });

  it("reconoce Preview y Production de Vercel como despliegues remotos", () => {
    expect(isDeployedRuntime({ VERCEL_ENV: "preview" })).toBe(true);
    expect(isDeployedRuntime({ VERCEL_ENV: "production" })).toBe(true);
  });

  it("rechaza el backend de archivos en un despliegue remoto", () => {
    expect(() =>
      resolveVisualCatalogBackend({
        VERCEL_ENV: "production",
        VISUAL_CATALOG_BACKEND: "file",
      }),
    ).toThrow(/no puede usar archivos locales/i);
  });

  it("acepta una configuracion productiva completa", () => {
    expect(getDeploymentConfigurationErrors(productionEnv)).toEqual([]);
    expect(resolveVisualCatalogBackend(productionEnv)).toBe("supabase");
  });

  it("rechaza credenciales demo, cookies inseguras y publicadores no administradores", () => {
    const invalidEnv: AppEnv = {
      ...productionEnv,
      APP_COOKIE_SECURE: "false",
      APP_VISUAL_CATALOG_PUBLISHER_EMAILS: "publisher@example.com",
      ALLOW_DEV_BYPASS_ACCESS: "true",
      VISUAL_CATALOG_BACKEND: "file",
    };
    delete invalidEnv.APP_USERS_JSON;
    const errors = getDeploymentConfigurationErrors(invalidEnv);

    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/APP_USERS_JSON/),
        expect.stringMatching(/APP_COOKIE_SECURE/),
        expect.stringMatching(/ALLOW_DEV_BYPASS_ACCESS/),
        expect.stringMatching(/VISUAL_CATALOG_BACKEND/),
        expect.stringMatching(/publicador/i),
      ]),
    );
  });
});
