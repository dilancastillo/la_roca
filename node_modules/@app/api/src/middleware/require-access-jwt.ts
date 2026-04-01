import { createRemoteJWKSet, jwtVerify } from "jose";
import { createMiddleware } from "hono/factory";

export function requireAccessJwt() {
  return createMiddleware(async (c, next) => {
    const token = c.req.header("Cf-Access-Jwt-Assertion");
    if (!token) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const teamDomain = c.env.ACCESS_TEAM_DOMAIN;
    const aud = c.env.ACCESS_AUD;

    const jwks = createRemoteJWKSet(
      new URL(`${teamDomain}/cdn-cgi/access/certs`)
    );

    await jwtVerify(token, jwks, {
      issuer: teamDomain,
      audience: aud
    });

    await next();
  });
}