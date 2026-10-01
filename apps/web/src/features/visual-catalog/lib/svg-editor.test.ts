// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import type { ActiveVisualDefinition } from "@repo/shared/schemas/visual-catalog";
import { materializeVisualDefinitionSvg } from "@repo/shared/visual-catalog-runtime";
import {
  buildRuntimeHighlightPreviewDataUri,
  buildRuntimePreviewDataUri,
  buildRuntimeVisualSvg,
  buildSelectableSvgMarkup,
  indexVisualSvg,
} from "./svg-editor";

const SOURCE_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200">
    <script>alert("no")</script>
    <image href="https://example.com/external.png" />
    <rect id="body" x="10" y="20" width="80" height="160" fill="#fff" onclick="alert(1)" />
    <path id="trim" d="M20 60 L80 60" stroke="#f00" />
    <circle cx="50" cy="100" r="8" />
  </svg>
`;

describe("svg-editor", () => {
  it("sanea el SVG y asigna IDs estables a los elementos seleccionables", () => {
    const indexed = indexVisualSvg(SOURCE_SVG);

    expect(indexed.elements).toEqual([
      { id: "body", label: "rect #body", tagName: "rect" },
      { id: "trim", label: "path #trim", tagName: "path" },
      { id: "vc-element-3", label: "circle 3", tagName: "circle" },
    ]);
    expect(indexed.normalizedSvg).not.toContain("<script");
    expect(indexed.normalizedSvg).not.toContain("<image");
    expect(indexed.normalizedSvg).not.toContain("onclick");
  });

  it("evita colisiones entre IDs originales y generados", () => {
    const indexed = indexVisualSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path id="vc-element-2" d="M0 0 L10 10" />
        <circle cx="20" cy="20" r="5" />
      </svg>
    `);

    expect(indexed.elements.map((element) => element.id)).toEqual([
      "vc-element-2",
      "vc-element-3",
    ]);
  });

  it("marca visualmente solo los elementos seleccionados", () => {
    const indexed = indexVisualSvg(SOURCE_SVG);
    const markup = buildSelectableSvgMarkup(indexed.normalizedSvg, ["trim"]);
    const document = new DOMParser().parseFromString(markup, "image/svg+xml");

    expect(
      document.querySelector('[data-vc-id="trim"]')?.getAttribute(
        "data-vc-selected",
      ),
    ).toBe("true");
    expect(
      document.querySelector('[data-vc-id="body"]')?.hasAttribute(
        "data-vc-selected",
      ),
    ).toBe(false);
  });

  it("extrae solo la seleccion, aplica tokens y crea el lienzo canonico", () => {
    const indexed = indexVisualSvg(SOURCE_SVG);
    const runtimeSvg = buildRuntimeVisualSvg({
      normalizedSvg: indexed.normalizedSvg,
      selectedElementIds: ["body", "trim"],
      elementPaints: {
        body: { mode: "base_fill", visibilityConditions: [] },
        trim: {
          mode: "trim_stroke",
          trimSourceValueId: 9001,
          visibilityConditions: [
            {
              attributeId: 90,
              attributeName: "Seccion de vivo",
              sourceValueIds: [9001],
              valueNames: ["Cuello"],
            },
          ],
        },
      },
      placement: {
        targetWidth: 1080,
        targetHeight: 1350,
        x: 12,
        y: -8,
        scaleX: 1,
        scaleY: 1,
        rotation: 2,
      },
    });

    expect(runtimeSvg).toContain('viewBox="0 0 1080 1350"');
    expect(runtimeSvg).toContain("__VC_BASE_COLOR__");
    expect(runtimeSvg).toContain("__VC_TRIM_STROKE_9001__");
    expect(runtimeSvg).toContain("__VC_VISIBILITY_1__");
    expect(runtimeSvg).not.toContain("vc-element-3");
    expect(runtimeSvg).toContain("rotate(2)");
    expect(runtimeSvg).toContain("translate(12 -8)");
    expect(
      decodeURIComponent(
        buildRuntimePreviewDataUri(runtimeSvg).split(",")[1] ?? "",
      ),
    ).toContain("display:inline");
  });

  it("separa piezas cerradas de un path antes de aplicar vivo relleno", () => {
    const indexed = indexVisualSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path id="cuello" d="M10 10 L30 10 L30 30 Z m40 0 L20 0 L20 20 Z" />
      </svg>
    `);

    const runtimeSvg = buildRuntimeVisualSvg({
      normalizedSvg: indexed.normalizedSvg,
      selectedElementIds: ["cuello"],
      elementPaints: {
        cuello: {
          mode: "trim_fill",
          trimSourceValueId: 635,
          visibilityConditions: [],
        },
      },
      placement: {
        targetWidth: 100,
        targetHeight: 100,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    });

    expect((runtimeSvg.match(/<path\b/g) ?? [])).toHaveLength(2);
    expect(runtimeSvg).toContain('data-vc-safe-trim-fill="true"');
    expect((runtimeSvg.match(/__VC_TRIM_FILL_635__/g) ?? [])).toHaveLength(2);
  });

  it("mantiene la vista previa visible mientras falta elegir la seccion del vivo", () => {
    const indexed = indexVisualSvg(SOURCE_SVG);
    const runtimeSvg = buildRuntimeVisualSvg({
      normalizedSvg: indexed.normalizedSvg,
      selectedElementIds: ["body", "trim"],
      elementPaints: {
        body: { mode: "preserve", visibilityConditions: [] },
        trim: { mode: "trim_stroke", visibilityConditions: [] },
      },
      placement: {
        targetWidth: 1080,
        targetHeight: 1350,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      allowIncompletePaints: true,
    });

    expect(runtimeSvg).toContain('id="body"');
    expect(runtimeSvg).toContain('id="trim"');
    expect(runtimeSvg).not.toContain("__VC_TRIM_STROKE_");
  });

  it("crea un resaltado neon aislado para la vista previa", () => {
    const indexed = indexVisualSvg(SOURCE_SVG);
    const runtimeSvg = buildRuntimeVisualSvg({
      normalizedSvg: indexed.normalizedSvg,
      selectedElementIds: ["trim"],
      elementPaints: {
        trim: { mode: "preserve", visibilityConditions: [] },
      },
      placement: {
        targetWidth: 1080,
        targetHeight: 1350,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    });
    const highlightDataUri = buildRuntimeHighlightPreviewDataUri(
      runtimeSvg,
      "fill",
    );
    const highlightedSvg = decodeURIComponent(
      highlightDataUri.split(",")[1] ?? "",
    );

    expect(highlightedSvg).toContain("#39ff14");
    expect(highlightedSvg).toContain("vc-preview-neon-highlight");
    expect(highlightedSvg).toContain(
      'filter="url(#vc-preview-neon-highlight)"',
    );
    expect(highlightedSvg).toContain(
      "fill:#39ff14!important;stroke:none!important;",
    );
    expect(runtimeSvg).not.toContain("vc-preview-neon-highlight");
    expect(runtimeSvg).not.toContain("stroke:none!important");
  });

  it("materializa vivos y condiciones aunque el runtime no conserve los IDs del editor", () => {
    const indexed = indexVisualSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect id="body" x="5" y="5" width="90" height="90" />
        <path id="trim-line" d="M10 20 L90 20" />
        <rect id="trim-fill" x="10" y="30" width="80" height="10" />
        <circle id="unused-circle" cx="20" cy="60" r="5" />
        <line id="unused-line" x1="30" y1="60" x2="70" y2="60" />
        <polygon id="unused-polygon" points="10,80 20,70 30,80" />
        <ellipse id="unused-ellipse" cx="70" cy="80" rx="10" ry="5" />
      </svg>
    `);
    const selectedElementIds = ["body", "trim-line", "trim-fill"];
    const elementPaints: ActiveVisualDefinition["elementPaints"] = {
      body: { mode: "base_fill", visibilityConditions: [] },
      "trim-line": {
        mode: "trim_stroke",
        trimSourceValueId: 9001,
        visibilityConditions: [
          {
            attributeId: 90,
            attributeName: "Seccion de vivo",
            sourceValueIds: [9001],
            valueNames: ["Cuello"],
          },
        ],
      },
      "trim-fill": {
        mode: "trim_fill",
        trimSourceValueId: 9002,
        visibilityConditions: [
          {
            attributeId: 90,
            attributeName: "Seccion de vivo",
            sourceValueIds: [9002],
            valueNames: ["Bolsillo"],
          },
        ],
      },
    };
    const runtimeSvg = buildRuntimeVisualSvg({
      normalizedSvg: indexed.normalizedSvg,
      selectedElementIds,
      elementPaints,
      placement: {
        targetWidth: 1080,
        targetHeight: 1350,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    });
    const definition: ActiveVisualDefinition = {
      id: "878f0d1a-6b95-44c9-b42f-b0b90b9c8466",
      seriesId: "2387ea71-e800-40ca-82e0-b343a7740141",
      version: 1,
      displayName: "Regresion H-005",
      slot: "lower_pocket",
      layer: "component",
      binding: {
        productTemplateIds: [7],
        attributeId: 63,
        valueId: 334,
        sourceValueId: 562,
        attributeName: "Modelo",
        valueName: "COSTURA",
      },
      activationConditions: [],
      selectedElementIds,
      elementPaints,
      runtimeSvg,
    };
    const session = {
      saleOrderLineId: 1,
      saleOrderId: 2,
      orderName: "S00001",
      productId: 3,
      productTemplateId: 7,
      productName: "Uniforme",
      graphicManifestKey: "uniforme",
      attributes: [
        {
          id: 90,
          name: "Seccion de vivo",
          displayType: "multi",
          selectionMode: "multiple",
          variantMode: "no_variant",
          values: [
            {
              id: 501,
              sourceValueId: 9001,
              name: "Cuello",
              attributeId: 90,
              attributeName: "Seccion de vivo",
            },
          ],
        },
      ],
      selectedValueIds: { "90": [501] },
      customValuesByValueId: {},
      exclusions: [],
      visualDefinitions: [definition],
      status: {
        orderState: "draft",
        canEdit: true,
        isLocked: false,
        version: 0,
        generatedAt: null,
      },
      existingDesignBase64: null,
      warnings: [],
    } satisfies ConfiguratorSession;
    const materializedSvg = decodeURIComponent(
      materializeVisualDefinitionSvg(
        definition,
        "#aabbcc",
        [
          { valueId: 501, sourceValueId: 9001, colorHex: "#123456" },
          { valueId: 502, sourceValueId: 9002, colorHex: "#654321" },
        ],
        { session, selectedValueIds: session.selectedValueIds },
      ).split(",")[1] ?? "",
    );
    expect(indexed.normalizedSvg.match(/data-vc-id=/g)).toHaveLength(7);
    expect(runtimeSvg).not.toContain("data-vc-id");
    expect(
      runtimeSvg.match(/<(?:rect|path|circle|line|polygon|ellipse)\b/g),
    ).toHaveLength(3);
    expect(runtimeSvg).toContain("__VC_BASE_COLOR__");
    expect(runtimeSvg).toContain("__VC_TRIM_STROKE_9001__");
    expect(runtimeSvg).toContain("__VC_TRIM_FILL_9002__");
    expect(materializedSvg).toContain("fill:#aabbcc!important");
    expect(materializedSvg).toContain("stroke:#0e2943!important");
    expect(materializedSvg).toContain('data-vc-linear-trim-texture="cord"');
    expect(materializedSvg).toContain("fill:#654321!important");
    expect(materializedSvg).toContain("display:inline!important");
    expect(materializedSvg).toContain("display:none!important");
    expect(materializedSvg).not.toMatch(/__VC_[A-Z0-9_]+__/);
  });

  it("rechaza selecciones que ya no existen en el SVG normalizado", () => {
    const indexed = indexVisualSvg(SOURCE_SVG);

    expect(() =>
      buildRuntimeVisualSvg({
        normalizedSvg: indexed.normalizedSvg,
        selectedElementIds: ["body", "elemento-desactualizado"],
        elementPaints: {
          body: { mode: "base_fill", visibilityConditions: [] },
          "elemento-desactualizado": {
            mode: "trim_stroke",
            trimSourceValueId: 9001,
            visibilityConditions: [],
          },
        },
        placement: {
          targetWidth: 1080,
          targetHeight: 1350,
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        },
      }),
    ).toThrow(/elemento-desactualizado/);
  });

  it("rechaza IDs seleccionados duplicados para conservar el orden de condiciones", () => {
    const indexed = indexVisualSvg(SOURCE_SVG);

    expect(() =>
      buildRuntimeVisualSvg({
        normalizedSvg: indexed.normalizedSvg,
        selectedElementIds: ["body", "body"],
        elementPaints: {
          body: { mode: "base_fill", visibilityConditions: [] },
        },
        placement: {
          targetWidth: 1080,
          targetHeight: 1350,
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        },
      }),
    ).toThrow(/duplicados/i);
  });

  it("rechaza Vivo relleno sobre lineas que solo pueden pintarse por trazo", () => {
    const indexed = indexVisualSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <line id="auxiliary" x1="10" y1="20" x2="90" y2="20" stroke="#000" />
      </svg>
    `);

    expect(() =>
      buildRuntimeVisualSvg({
        normalizedSvg: indexed.normalizedSvg,
        selectedElementIds: ["auxiliary"],
        elementPaints: {
          auxiliary: {
            mode: "trim_fill",
            trimSourceValueId: 634,
            visibilityConditions: [],
          },
        },
        placement: {
          targetWidth: 1080,
          targetHeight: 1350,
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        },
      }),
    ).toThrow(/Vivo, linea/i);
  });

  it("pinta como relleno los vivos lineales exportados como poligonos delgados", () => {
    const indexed = indexVisualSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <polygon id="thin-trim" points="10,10 90,90 88,92 8,12" fill="#000" />
        <polygon id="regular-shape" points="10,80 50,20 90,80" fill="#000" />
        <polyline id="real-line" points="10,50 50,55 90,50" stroke="#000" fill="none" />
      </svg>
    `);
    const runtimeSvg = buildRuntimeVisualSvg({
      normalizedSvg: indexed.normalizedSvg,
      selectedElementIds: ["thin-trim", "regular-shape", "real-line"],
      elementPaints: {
        "thin-trim": {
          mode: "trim_stroke",
          trimSourceValueId: 1967,
          visibilityConditions: [],
        },
        "regular-shape": {
          mode: "trim_stroke",
          trimSourceValueId: 630,
          visibilityConditions: [],
        },
        "real-line": {
          mode: "trim_stroke",
          trimSourceValueId: 633,
          visibilityConditions: [],
        },
      },
      placement: {
        targetWidth: 1080,
        targetHeight: 1350,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    });

    expect(runtimeSvg).toContain("fill:__VC_TRIM_STROKE_1967__!important");
    expect(runtimeSvg).toContain("stroke:__VC_TRIM_STROKE_630__!important");
    expect(runtimeSvg).toContain("stroke:__VC_TRIM_STROKE_633__!important");
  });

  it("guarda el reemplazo de base solo cuando el editor lo solicita explícitamente", () => {
    const indexed = indexVisualSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <path d="M10 10 H90 V90 H10 Z" />
        <path d="M40 10 L50 30 L60 10" />
      </svg>
    `);
    const runtimeSvg = buildRuntimeVisualSvg({
      normalizedSvg: indexed.normalizedSvg,
      selectedElementIds: ["vc-element-1", "vc-element-2"],
      elementPaints: {
        "vc-element-1": { mode: "preserve", visibilityConditions: [] },
        "vc-element-2": { mode: "preserve", visibilityConditions: [] },
      },
      renderMode: "replace_base",
      placement: {
        targetWidth: 1080,
        targetHeight: 1350,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    });

    expect(runtimeSvg).toContain('data-vc-render-mode="replace-base"');
    expect(runtimeSvg).not.toContain("data-vc-replaces-base-silhouette");
  });

  it("usa overlay por defecto aunque un rectángulo sea el elemento más grande", () => {
    const indexed = indexVisualSvg(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect id="fondo" x="0" y="0" width="100" height="100" />
        <path id="cuello" d="M40 10 L50 30 L60 10" />
      </svg>
    `);
    const runtimeSvg = buildRuntimeVisualSvg({
      normalizedSvg: indexed.normalizedSvg,
      selectedElementIds: ["fondo", "cuello"],
      elementPaints: {
        fondo: { mode: "preserve", visibilityConditions: [] },
        cuello: { mode: "preserve", visibilityConditions: [] },
      },
      placement: {
        targetWidth: 1080,
        targetHeight: 1350,
        x: 0,
        y: 0,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    });

    expect(runtimeSvg).toContain('data-vc-render-mode="overlay"');
    expect(runtimeSvg).not.toContain("data-vc-replaces-base-silhouette");
  });

  it("corrige al materializar runtimes historicos con vivos lineales en poligonos", () => {
    const definition = {
      id: "878f0d1a-6b95-44c9-b42f-b0b90b9c8466",
      seriesId: "2387ea71-e800-40ca-82e0-b343a7740141",
      version: 1,
      displayName: "Cuello historico",
      slot: "neck",
      layer: "component",
      binding: {
        productTemplateIds: [7],
        attributeId: 145,
        valueId: 334,
        sourceValueId: 554,
        attributeName: "Modelo de cuello",
        valueName: "CUELLO V",
      },
      activationConditions: [],
      selectedElementIds: ["thin-trim"],
      elementPaints: {
        "thin-trim": {
          mode: "trim_stroke",
          trimSourceValueId: 1967,
          visibilityConditions: [],
        },
      },
      runtimeSvg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <polygon points="10,10 90,90 88,92 8,12" fill="#000"
            style="stroke:__VC_TRIM_STROKE_1967__!important;" />
        </svg>
      `,
    } satisfies ActiveVisualDefinition;
    const materializedSvg = decodeURIComponent(
      materializeVisualDefinitionSvg(definition, "#ffffff", [
        { valueId: 501, sourceValueId: 1967, colorHex: "#00a6d6" },
      ]).split(",")[1] ?? "",
    );

    expect(materializedSvg).toContain("fill:#0081a7!important");
    expect(materializedSvg).toContain("stroke:#003f59!important");
    expect(materializedSvg).toContain('data-vc-linear-trim-texture="woven"');
    expect(materializedSvg).not.toContain("__VC_TRIM_STROKE_1967__");
  });
});
