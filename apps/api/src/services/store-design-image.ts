import type { OdooEnv } from "../lib/app-env.js";
import { odooCreate, odooWrite } from "../lib/odoo-client.js";
import { toOdooDatetimeString } from "../lib/odoo-datetime.js";

type StoreDesignImageInput = {
  saleOrderLineId: number;
  filename: string;
  imageBase64: string;
  currentVersion: number;
};

type DesignImageStoragePayload = {
  attachmentName: string;
  generatedAtIso: string;
  lineValues: {
    x_product_design_image: string;
    x_product_design_generated_at: string;
    x_product_design_version: number;
  };
  version: number;
};

export function buildDesignImageStoragePayload(
  input: StoreDesignImageInput,
  generatedAt = new Date(),
): DesignImageStoragePayload {
  const nextVersion = input.currentVersion + 1;
  const generatedAtIso = generatedAt.toISOString();
  const generatedAtOdoo = toOdooDatetimeString(generatedAt);

  return {
    attachmentName: `design-v${nextVersion}-${input.filename}`,
    generatedAtIso,
    lineValues: {
      x_product_design_image: input.imageBase64,
      x_product_design_generated_at: generatedAtOdoo,
      x_product_design_version: nextVersion,
    },
    version: nextVersion,
  };
}

export async function createDesignImageAttachment(
  env: OdooEnv,
  input: StoreDesignImageInput,
  storage: DesignImageStoragePayload,
) {
  return await odooCreate<number>(env, "ir.attachment", [
    {
      name: storage.attachmentName,
      datas: input.imageBase64,
      res_model: "sale.order.line",
      res_id: input.saleOrderLineId,
      mimetype: "image/png",
    },
  ]);
}

export async function storeDesignImage(
  env: OdooEnv,
  input: StoreDesignImageInput,
) {
  const storage = buildDesignImageStoragePayload(input);

  await odooWrite(env, "sale.order.line", [input.saleOrderLineId], storage.lineValues);

  const attachmentId = await createDesignImageAttachment(env, input, storage);

  return {
    ok: true,
    attachmentId,
    version: storage.version,
    generatedAt: storage.generatedAtIso,
  };
}
