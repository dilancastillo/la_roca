import type { OdooEnv } from "../lib/app-env.js";
import { deriveAutomationRenderScene } from "../render/derive-render-scene.js";
import { renderDesignImage } from "../render/render-design-image.js";
import { getConfiguratorSession } from "./get-configurator-session.js";
import { DESIGN_IMAGE_FIELD, storeDesignImage } from "./store-design-image.js";

type RenderAutomationLineOptions = {
  dryRun?: boolean;
  triggerWriteDate?: string | null;
};

const RECENT_GENERATED_IMAGE_GRACE_MS = 120_000;

function parseAutomationDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return null;
  }

  const valueWithMilliseconds = normalizedValue.replace(
    /(\.\d{3})\d+/,
    "$1",
  );
  const isoLikeValue = valueWithMilliseconds.includes("T")
    ? valueWithMilliseconds
    : `${valueWithMilliseconds.replace(" ", "T")}Z`;
  const date = new Date(isoLikeValue);

  return Number.isNaN(date.getTime()) ? null : date;
}

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

  const triggerWriteDate = parseAutomationDate(options.triggerWriteDate);
  const generatedAt = parseAutomationDate(session.status.generatedAt);
  const generatedAtTime = generatedAt?.getTime() ?? null;
  const triggerWriteTime = triggerWriteDate?.getTime() ?? null;

  if (
    triggerWriteTime !== null &&
    generatedAtTime !== null &&
    generatedAtTime >= triggerWriteTime
  ) {
    return {
      ok: true,
      skipped: true,
      reason:
        "La imagen vigente es igual o posterior al evento del webhook; se evita sobrescribir un guardado mas reciente.",
      saleOrderLineId,
      orderName: session.orderName,
      productId: session.productId,
      productName: session.productName,
      currentVersion: session.status.version,
      generatedAt: session.status.generatedAt,
      triggerWriteDate: options.triggerWriteDate,
    };
  }

  if (
    triggerWriteTime !== null &&
    generatedAtTime !== null &&
    triggerWriteTime >= generatedAtTime &&
    triggerWriteTime - generatedAtTime <= RECENT_GENERATED_IMAGE_GRACE_MS
  ) {
    return {
      ok: true,
      skipped: true,
      reason:
        "La imagen vigente fue generada justo antes del evento del webhook; se evita que la automatizacion pise el canvas guardado desde la app.",
      saleOrderLineId,
      orderName: session.orderName,
      productId: session.productId,
      productName: session.productName,
      currentVersion: session.status.version,
      generatedAt: session.status.generatedAt,
      triggerWriteDate: options.triggerWriteDate,
    };
  }

  if (
    generatedAtTime !== null &&
    generatedAtTime >= Date.now() - RECENT_GENERATED_IMAGE_GRACE_MS
  ) {
    return {
      ok: true,
      skipped: true,
      reason:
        "La linea ya tiene una imagen generada muy reciente; se evita sobrescribir un guardado manual sin write_date del webhook.",
      saleOrderLineId,
      orderName: session.orderName,
      productId: session.productId,
      productName: session.productName,
      currentVersion: session.status.version,
      generatedAt: session.status.generatedAt,
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
        fields: [DESIGN_IMAGE_FIELD],
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
