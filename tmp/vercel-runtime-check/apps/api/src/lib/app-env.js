import { env as readRuntimeEnv } from "hono/adapter";
export function getAppEnv(c) {
    return readRuntimeEnv(c, "node");
}
