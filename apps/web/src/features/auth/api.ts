import type {
  LoginRequest,
  AppUser,
} from "@repo/shared/schemas/configurator";
import { authSessionSchema } from "@repo/shared/schemas/configurator";
import { requestJson } from "../../lib/api-client";

export async function fetchAuthSession() {
  const data = await requestJson("/api/auth/me");
  return authSessionSchema.parse(data);
}

export async function login(credentials: LoginRequest) {
  const data = await requestJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
  return authSessionSchema.parse(data);
}

export async function logout() {
  await requestJson("/api/auth/logout", {
    method: "POST",
  });
}

export type AuthenticatedUser = AppUser;
