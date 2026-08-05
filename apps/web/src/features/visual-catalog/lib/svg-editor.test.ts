// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import {
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
});
