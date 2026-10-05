import type { OdooEnv } from "../lib/app-env.js";
import { deriveAutomationRenderScene } from "../render/derive-render-scene.js";
import { renderDesignImage } from "../render/render-design-image.js";
import { buildConfiguratorStateDescription } from "./configurator-state-metadata.js";
import { getConfiguratorSession } from "./get-configurator-session.js";
import { storeDesignImage } from "./store-design-image.js";
import { getVisualRelease } from "./visual-release-repository.js";

/**
 * Applies one already-published visual snapshot to one editable Odoo line.
 *
 * Publishing deliberately does not rewrite existing orders. This operation is
 * the explicit, auditable opt-in for a line that must receive the new visual.
 */
export async function syncVisualReleaseToOdoo(
  env: OdooEnv,
  releaseId: string,
  saleOrderLineId: number,
) {
  const release = await getVisualRelease(env, releaseId);

  if (release.status !== "active") {
    throw new Error("Solo se puede sincronizar en Odoo la release que esta activa en produccion.");
  }

  const session = await getConfiguratorSession(env, saleOrderLineId, {
    visualDefinitionIdsOverride: release.definitionIds,
    visualReleaseId: release.id,
    pinActiveVisualRelease: false,
  });

  if (!session.status.canEdit) {
    throw new Error("La linea ya no es una cotizacion editable y no se puede sobrescribir su imagen.");
  }

  const scene = deriveAutomationRenderScene(session, session.selectedValueIds);
  const imageBuffer = await renderDesignImage(scene);
  const result = await storeDesignImage(env, {
    saleOrderLineId,
    filename: `sale-line-${saleOrderLineId}-release-r${release.number}.png`,
    imageBase64: imageBuffer.toString("base64"),
    currentVersion: session.status.version,
    attachmentDescription: buildConfiguratorStateDescription({
      selectedValueIds: session.selectedValueIds,
      customValuesByValueId: session.customValuesByValueId ?? {},
      visualDefinitionVersionIds: (session.visualDefinitions ?? []).map(
        (definition) => definition.id,
      ),
    }),
  });

  return {
    ...result,
    saleOrderLineId,
    releaseId: release.id,
    releaseNumber: release.number,
    imageSizeBytes: imageBuffer.byteLength,
  };
}
