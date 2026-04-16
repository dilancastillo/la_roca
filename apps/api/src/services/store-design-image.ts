import type { OdooEnv } from "../lib/app-env.js";
import { odooCreate, odooWrite } from "../lib/odoo-client.js";
import { toOdooDatetimeString } from "../lib/odoo-datetime.js";

type StoreDesignImageInput = {
  saleOrderLineId: number;
  filename: string;
  imageBase64: string;
  currentVersion: number;
};

export async function storeDesignImage(
  env: OdooEnv,
  input: StoreDesignImageInput,
) {
  const nextVersion = input.currentVersion + 1;
  const generatedAt = new Date();
  const generatedAtIso = generatedAt.toISOString();
  const generatedAtOdoo = toOdooDatetimeString(generatedAt);

  await odooWrite(env, "sale.order.line", [input.saleOrderLineId], {
    x_product_design_image: input.imageBase64,
    x_product_design_generated_at: generatedAtOdoo,
    x_product_design_version: nextVersion,
  });

  const attachmentId = await odooCreate<number>(env, "ir.attachment", [
    {
      name: `design-v${nextVersion}-${input.filename}`,
      datas: input.imageBase64,
      res_model: "sale.order.line",
      res_id: input.saleOrderLineId,
      mimetype: "image/png",
    },
  ]);

  return {
    ok: true,
    attachmentId,
    version: nextVersion,
    generatedAt: generatedAtIso,
  };
}
