import { createRemoteJWKSet, jwtVerify } from "jose";
import { createMiddleware } from "hono/factory";

type Bindings = {
  ACCESS_TEAM_DOMAIN?: string;
  ACCESS_AUD?: string;
  ALLOW_DEV_BYPASS_ACCESS?: string;
  DEV_SESSION_USER_EMAIL?: string;
};

type Variables = {
  user: {
    email: string;
    sub: string;
    authMode: "access" | "dev-bypass";
  };
};

function isDevBypassEnabled(env: Bindings): boolean {
  return env.ALLOW_DEV_BYPASS_ACCESS === "true";
}

export function requireAccessJwt() {
  return createMiddleware<{ Bindings: Bindings; Variables: Variables }>(
    async (c, next) => {
      const token = c.req.header("Cf-Access-Jwt-Assertion");

      if (!token && isDevBypassEnabled(c.env)) {
        c.set("user", {
          email: c.env.DEV_SESSION_USER_EMAIL ?? "dev-local@comfer.local",
          sub: "dev-local-user",
          authMode: "dev-bypass",
        });

        await next();
        return;
      }

      if (!token) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const teamDomain = c.env.ACCESS_TEAM_DOMAIN;
      const aud = c.env.ACCESS_AUD;

      if (!teamDomain || !aud) {
        return c.json(
          { error: "Access configuration is missing in environment" },
          500,
        );
      }

      const jwks = createRemoteJWKSet(
        new URL(`${teamDomain}/cdn-cgi/access/certs`),
      );

      const { payload } = await jwtVerify(token, jwks, {
        issuer: teamDomain,
        audience: aud,
      });

      c.set("user", {
        email: String(payload.email ?? ""),
        sub: String(payload.sub ?? ""),
        authMode: "access",
      });

      await next();
    },
  );
}