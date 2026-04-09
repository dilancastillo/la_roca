import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { appUserSchema } from "@repo/shared/schemas/configurator";
import { fallbackDevUsers } from "../config/dev-users";

const appUserRecordSchema = appUserSchema.extend({
  salt: z.string().min(1),
  passwordHash: z.string().min(1),
  iterations: z.number().int().positive().default(210_000),
});

type AppUserRecord = z.infer<typeof appUserRecordSchema>;

type AuthEnv = {
  APP_JWT_SECRET?: string;
  APP_USERS_JSON?: string;
};

function getJwtSecret(env: AuthEnv): Uint8Array {
  const secret = env.APP_JWT_SECRET ?? "dev-la-roca-session-secret";
  return new TextEncoder().encode(secret);
}

function getConfiguredUsers(env: AuthEnv): AppUserRecord[] {
  if (!env.APP_USERS_JSON) {
    return fallbackDevUsers.map((user) => appUserRecordSchema.parse(user));
  }

  const parsed = z.array(appUserRecordSchema).safeParse(JSON.parse(env.APP_USERS_JSON));

  if (!parsed.success) {
    throw new Error("APP_USERS_JSON no tiene un formato valido");
  }

  return parsed.data;
}

async function derivePasswordHash(
  password: string,
  saltBase64: string,
  iterations: number,
): Promise<string> {
  const passwordBytes = new TextEncoder().encode(password);
  const salt = Uint8Array.from(atob(saltBase64), (char) => char.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "raw",
    passwordBytes,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt,
      iterations,
    },
    key,
    256,
  );

  const bytes = new Uint8Array(derived);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export async function authenticateUser(
  env: AuthEnv,
  email: string,
  password: string,
) {
  const users = getConfiguredUsers(env);
  const user = users.find(
    (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
  );

  if (!user) {
    return null;
  }

  const passwordHash = await derivePasswordHash(
    password,
    user.salt,
    user.iterations,
  );

  if (!constantTimeEqual(passwordHash, user.passwordHash)) {
    return null;
  }

  return appUserSchema.parse({
    email: user.email,
    name: user.name,
  });
}

export async function createSessionToken(env: AuthEnv, user: z.infer<typeof appUserSchema>) {
  return await new SignJWT({
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.email)
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(getJwtSecret(env));
}

export async function verifySessionToken(env: AuthEnv, token: string) {
  const { payload } = await jwtVerify(token, getJwtSecret(env));

  return appUserSchema.parse({
    email: String(payload.sub ?? ""),
    name: String(payload.name ?? payload.sub ?? ""),
  });
}
