import type { OdooEnv } from "../lib/app-env.js";
import { odooCreate, odooWrite } from "../lib/odoo-client.js";

export const DESIGN_IMAGE_FIELD = "x_product_design_image" as const;
export const LOGO_IMAGE_FIELD = "x_studio_imagen_adjunta" as const;

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
    [DESIGN_IMAGE_FIELD]: string;
  };
  version: number;
};

export function buildDesignImageStoragePayload(
  input: StoreDesignImageInput,
  generatedAt = new Date(),
): DesignImageStoragePayload {
  const nextVersion = input.currentVersion + 1;
  const generatedAtIso = generatedAt.toISOString();

  return {
    attachmentName: `design-v${nextVersion}-${input.filename}`,
    generatedAtIso,
    lineValues: {
      [DESIGN_IMAGE_FIELD]: input.imageBase64,
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
