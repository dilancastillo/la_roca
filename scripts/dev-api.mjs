import { createServer } from "node:http";
import app from "../tmp/api-dist/apps/api/src/index.js";

if (
  process.env.ALLOW_DEV_BYPASS_ACCESS === "true" &&
  !process.env.APP_ADMIN_EMAILS
) {
  process.env.APP_ADMIN_EMAILS =
    process.env.DEV_SESSION_USER_EMAIL ?? "demo@la-roca.local";
}

const host = process.env.API_HOST ?? "127.0.0.1";
const port = Number(process.env.API_PORT ?? 8787);

const server = createServer(async (incoming, outgoing) => {
  try {
    const chunks = [];

    for await (const chunk of incoming) {
      chunks.push(Buffer.from(chunk));
    }

    const method = incoming.method ?? "GET";
    const body = chunks.length > 0 ? Buffer.concat(chunks) : undefined;
    const request = new Request(
      `http://${incoming.headers.host ?? `${host}:${port}`}${incoming.url ?? "/"}`,
      {
        method,
        headers: incoming.headers,
        ...(method !== "GET" && method !== "HEAD" && body
          ? { body, duplex: "half" }
          : {}),
      },
    );
    const response = await app.fetch(request, process.env);
    const responseBody = Buffer.from(await response.arrayBuffer());

    outgoing.writeHead(
      response.status,
      Object.fromEntries(response.headers.entries()),
    );
    outgoing.end(responseBody);
  } catch (error) {
    outgoing.writeHead(500, { "Content-Type": "application/json" });
    outgoing.end(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "No se pudo procesar la solicitud local.",
      }),
    );
  }
});

server.listen(port, host, () => {
  process.stdout.write(`API local disponible en http://${host}:${port}\n`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
