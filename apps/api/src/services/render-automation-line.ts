import type { OdooEnv } from "../lib/app-env.js";
import { deriveAutomationRenderScene } from "../render/derive-render-scene.js";
import { renderDesignImage } from "../render/render-design-image.js";
import { getConfiguratorSession } from "./get-configurator-session.js";
import { storeDesignImage } from "./store-design-image.js";

export async function renderAutomationLine(
  env: OdooEnv,
  saleOrderLineId: number,
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

  return await storeDesignImage(env, {
    saleOrderLineId,
    filename: `sale-line-${saleOrderLineId}-autogen.png`,
    imageBase64: imageBuffer.toString("base64"),
    currentVersion: session.status.version,
  });
}
