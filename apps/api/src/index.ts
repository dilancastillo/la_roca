import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  configuratorSessionSchema,
  saveDesignRequestSchema
} from "@repo/shared/schemas/configurator";
import { requireAccessJwt } from "./middleware/require-access-jwt";
import { getConfiguratorSession } from "./services/get-configurator-session";
import { saveLineDesignImage } from "./services/save-line-design-image";

type Env = {
  ODOO_BASE_URL: string;
  ODOO_DB: string;
  ODOO_API_KEY: string;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("/api/*", requireAccessJwt());

app.get("/api/session/:saleOrderLineId", async (c) => {
  const lineId = Number(c.req.param("saleOrderLineId"));
  const session = await getConfiguratorSession(c.env, lineId);
  const validated = configuratorSessionSchema.parse(session);
  return c.json(validated, 200, {
    "Cache-Control": "private, no-store"
  });
});

app.post("/api/design/save", zValidator("json", saveDesignRequestSchema), async (c) => {
  const payload = c.req.valid("json");
  const result = await saveLineDesignImage(c.env, payload);
  return c.json(result, 200, {
    "Cache-Control": "no-store"
  });
});

export default app;