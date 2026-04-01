import { odooCall } from "../lib/odoo-client";

export async function saveLineDesignImage(
  env: any,
  payload: {
    saleOrderLineId: number;
    filename: string;
    imageBase64: string;
  }
) {
  await odooCall(env, "sale.order.line", "write", {
    ids: [payload.saleOrderLineId],
    vals: {
      x_product_design_image: payload.imageBase64,
      x_product_design_locked: true
    }
  });

  const attachmentId = await odooCall<number>(env, "ir.attachment", "create", {
    vals: {
      name: payload.filename,
      datas: payload.imageBase64,
      res_model: "sale.order.line",
      res_id: payload.saleOrderLineId,
      mimetype: "image/png"
    }
  });

  return {
    ok: true,
    attachmentId
  };
}