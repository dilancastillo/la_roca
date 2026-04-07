import { odooCall } from "../lib/odoo-client";

type Env = {
  ODOO_BASE_URL?: string;
  ODOO_DB?: string;
  ODOO_API_KEY?: string;
};

type SavePayload = {
  saleOrderLineId: number;
  filename: string;
  imageBase64: string;
};

export async function saveLineDesignImage(
  env: Env,
  payload: SavePayload,
) {
  // 1) Guardar imagen en el campo de la línea
  await odooCall(env, "sale.order.line", "write", {
    ids: [payload.saleOrderLineId],
    vals: {
      x_product_design_image: payload.imageBase64,
      x_product_design_locked: true,
    },
  });

  // 2) Crear adjunto correctamente con vals_list
  const attachmentId = await odooCall<number>(
    env,
    "ir.attachment",
    "create",
    {
      vals_list: [
        {
          name: payload.filename,
          datas: payload.imageBase64,
          res_model: "sale.order.line",
          res_id: payload.saleOrderLineId,
          mimetype: "image/png",
        },
      ],
    },
  );

  return {
    ok: true,
    attachmentId,
    imageFieldUpdated: true,
  };
}