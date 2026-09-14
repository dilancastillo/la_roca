import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { deriveAutomationRenderScene } from "./derive-render-scene.js";
import { renderDesignImage } from "./render-design-image.js";

const runtimeSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350">
    <path fill="__VC_BASE_COLOR__" d="M400 120 L680 120 L540 330 Z" />
  </svg>
`;

const session: ConfiguratorSession = {
  saleOrderLineId: 500,
  saleOrderId: 50,
  orderName: "S00500",
  productId: 600,
  productTemplateId: 6,
  productName: "Blusa",
  graphicManifestKey: "blusa-antifluido-t180",
  attributes: [
    {
      id: 10,
      name: "Color",
      displayType: "color",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 101,
          sourceValueId: 1001,
          name: "Verde",
          attributeId: 10,
          attributeName: "Color",
          colorHex: "#7aa37a",
        },
      ],
    },
    {
      id: 63,
      name: "Modelo de cuello",
      displayType: "radio",
      selectionMode: "single",
      variantMode: "no_variant",
      values: [
        {
          id: 334,
          sourceValueId: 562,
          name: "V - DIVIDIDO",
          attributeId: 63,
          attributeName: "Modelo de cuello",
        },
      ],
    },
  ],
  selectedValueIds: {
    "10": [101],
    "63": [334],
  },
  customValuesByValueId: {},
  exclusions: [],
  visualDefinitions: [
    {
      id: "d930cfb3-acd9-45d1-8599-0bfbfc367f7e",
      seriesId: "3949bcd7-c35c-47af-ae00-4d698217de07",
      version: 1,
      displayName: "V - DIVIDIDO",
      slot: "neck",
      layer: "component",
      binding: {
        productTemplateIds: [6],
        attributeId: 63,
        valueId: 334,
        sourceValueId: 562,
        attributeName: "Modelo de cuello",
        valueName: "V - DIVIDIDO",
      },
      activationConditions: [],
      selectedElementIds: [],
      elementPaints: {},
      runtimeSvg,
    },
  ],
  status: {
    orderState: "draft",
    canEdit: true,
    isLocked: false,
    version: 0,
    generatedAt: null,
  },
  existingDesignBase64: null,
  warnings: [],
};

describe("catalogo visual en la escena de automatizacion", () => {
  it("reemplaza el cuello legado y materializa el color de la prenda", () => {
    const scene = deriveAutomationRenderScene(
      session,
      session.selectedValueIds,
    );
    const dynamicAsset = scene.garmentDetailAssetPaths?.find((assetPath) =>
      assetPath.startsWith("data:image/svg+xml"),
    );

    expect(scene.neckAssetPath).toBeUndefined();
    expect(scene.garmentAssetPath).toContain(
      "blouse-base-closed-no-collar.svg",
    );
    expect(dynamicAsset).toBeDefined();
    expect(decodeURIComponent(dynamicAsset ?? "")).toContain("#7aa37a");
  });

  it("mantiene el render legado cuando la sesion no tiene definiciones", () => {
    const scene = deriveAutomationRenderScene(
      { ...session, visualDefinitions: [] },
      session.selectedValueIds,
    );

    expect(
      scene.garmentDetailAssetPaths?.some((assetPath) =>
        assetPath.startsWith("data:image/svg+xml"),
      ),
    ).not.toBe(true);
  });

  it("usa como base una definicion que contiene una silueta seleccionada", () => {
    const markedRuntimeSvg = runtimeSvg.replace(
      "<path ",
      '<path data-vc-replaces-base-silhouette="true" ',
    );
    const scene = deriveAutomationRenderScene(
      {
        ...session,
        visualDefinitions: session.visualDefinitions?.map((definition) => ({
          ...definition,
          runtimeSvg: markedRuntimeSvg,
        })),
      },
      session.selectedValueIds,
    );

    expect(scene.garmentAssetPath).toMatch(/^data:image\/svg\+xml/);
    expect(scene.suppressGarmentBaseOutline).toBe(true);
    expect(
      scene.garmentDetailAssetPaths?.some((assetPath) =>
        assetPath.startsWith("data:image/svg+xml"),
      ),
    ).toBe(true);
  });

  it("rasteriza el SVG dinamico en la imagen que se guarda en Odoo", async () => {
    const scene = deriveAutomationRenderScene(
      session,
      session.selectedValueIds,
    );
    const image = await renderDesignImage(scene);

    expect(Array.from(image.subarray(1, 4))).toEqual([80, 78, 71]);
    expect(image.byteLength).toBeGreaterThan(10_000);
  }, 30_000);

  it("conserva elementos dinamicos que sobresalen del limite de tinta de la prenda", async () => {
    const overflowRuntimeSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350" width="1080" height="1350">
        <rect x="500" y="80" width="80" height="40" fill="#ff00ff" />
      </svg>
    `;
    const overflowSession: ConfiguratorSession = {
      ...session,
      visualDefinitions: session.visualDefinitions?.map((definition) => ({
        ...definition,
        runtimeSvg: overflowRuntimeSvg,
      })),
    };
    const scene = deriveAutomationRenderScene(
      overflowSession,
      overflowSession.selectedValueIds,
    );
    const image = await renderDesignImage(scene);
    const { data } = await sharp(image)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    let accentPixels = 0;

    for (let offset = 0; offset < data.length; offset += 4) {
      if (
        (data[offset] ?? 0) > 240 &&
        (data[offset + 1] ?? 255) < 30 &&
        (data[offset + 2] ?? 0) > 240 &&
        (data[offset + 3] ?? 0) > 200
      ) {
        accentPixels += 1;
      }
    }

    expect(accentPixels).toBeGreaterThan(100);
  }, 30_000);
});
