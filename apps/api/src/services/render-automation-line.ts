import type { OdooEnv } from "../lib/app-env.js";
import { deriveAutomationRenderScene } from "../render/derive-render-scene.js";
import { renderDesignImage } from "../render/render-design-image.js";
import { getConfiguratorSession } from "./get-configurator-session.js";
import { storeDesignImage } from "./store-design-image.js";

type RenderAutomationLineOptions = {
  dryRun?: boolean;
};

export async function renderAutomationLine(
  env: OdooEnv,
  saleOrderLineId: number,
  options: RenderAutomationLineOptions = {},
) {
  const session = await getConfiguratorSession(env, saleOrderLineId);

  if (session.status.orderState !== "draft" && session.status.orderState !== "sent") {
    return {
      ok: true,
      skipped: true,
      reason: `La linea ${saleOrderLineId} no esta en cotizacion editable.`,
    };
  }

  const scene = deriveAutomationRenderScene(session, session.selectedValueIds);
  const imageBuffer = await renderDesignImage(scene);
  const imageBase64 = imageBuffer.toString("base64");
  const nextVersion = session.status.version + 1;

  if (options.dryRun) {
    return {
      ok: true,
      dryRun: true,
      saleOrderLineId,
      orderName: session.orderName,
      productId: session.productId,
      productName: session.productName,
      currentVersion: session.status.version,
      nextVersion,
      imageSizeBytes: imageBuffer.byteLength,
      wouldWrite: {
        model: "sale.order.line",
        id: saleOrderLineId,
        fields: [
          "x_product_design_image",
          "x_product_design_generated_at",
          "x_product_design_version",
        ],
      },
    };
  }

  const result = await storeDesignImage(env, {
    saleOrderLineId,
    filename: `sale-line-${saleOrderLineId}-autogen.png`,
    imageBase64,
    currentVersion: session.status.version,
  });

  return {
    ...result,
    dryRun: false,
    saleOrderLineId,
    orderName: session.orderName,
    productId: session.productId,
    productName: session.productName,
    imageSizeBytes: imageBuffer.byteLength,
  };
}
