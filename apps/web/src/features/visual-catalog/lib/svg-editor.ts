import type {
  VisualElementPaint,
  VisualPlacement,
} from "@repo/shared/schemas/visual-catalog";
import { getVisualElementVisibilityToken } from "@repo/shared/visual-catalog-runtime";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const DRAWABLE_SELECTOR =
  "path,rect,circle,ellipse,line,polyline,polygon,use,text";
const BLOCKED_SELECTOR =
  "script,foreignObject,iframe,object,embed,image,audio,video";

export type SelectableSvgElement = {
  id: string;
  label: string;
  tagName: string;
};

export type IndexedVisualSvg = {
  normalizedSvg: string;
  elements: SelectableSvgElement[];
  viewBox: {
    minX: number;
    minY: number;
    width: number;
    height: number;
  };
};

type RuntimeSvgInput = {
  normalizedSvg: string;
  selectedElementIds: string[];
  elementPaints: Record<string, VisualElementPaint>;
  placement: VisualPlacement;
};

function parseSvg(svgText: string) {
  const document = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const parserError = document.querySelector("parsererror");
  const root = document.documentElement;

  if (
    parserError ||
    root.localName.toLowerCase() !== "svg" ||
    root.namespaceURI !== SVG_NAMESPACE
  ) {
    throw new Error("El archivo no contiene un SVG valido.");
  }

  return document;
}

function sanitizeSvgDocument(document: Document) {
  document.querySelectorAll(BLOCKED_SELECTOR).forEach((element) => {
    element.remove();
  });

  document.querySelectorAll("*").forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const attributeName = attribute.name.toLowerCase();
      const attributeValue = attribute.value.trim();

      if (
        attributeName.startsWith("on") ||
        attributeValue.toLowerCase().includes("javascript:")
      ) {
        element.removeAttribute(attribute.name);
        continue;
      }

      if (
        (attributeName === "href" ||
          attributeName === "xlink:href" ||
          attributeName === "src") &&
        attributeValue.length > 0 &&
        !attributeValue.startsWith("#")
      ) {
        element.removeAttribute(attribute.name);
      }

      if (
        attributeName === "style" &&
        (attributeValue.includes("@import") ||
          /url\s*\(/i.test(attributeValue))
      ) {
        element.removeAttribute(attribute.name);
      }
    }
  });

  document.querySelectorAll("style").forEach((styleElement) => {
    const css = styleElement.textContent ?? "";

    if (css.includes("@import") || /url\s*\(/i.test(css)) {
      styleElement.remove();
    }
  });
}

function readViewBox(root: SVGElement) {
  const rawViewBox = root.getAttribute("viewBox");

  if (rawViewBox) {
    const values = rawViewBox
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    if (
      values.length === 4 &&
      values.every(Number.isFinite) &&
      (values[2] ?? 0) > 0 &&
      (values[3] ?? 0) > 0
    ) {
      return {
        minX: values[0] ?? 0,
        minY: values[1] ?? 0,
        width: values[2] ?? 1080,
        height: values[3] ?? 1350,
      };
    }
  }

  const width = Number.parseFloat(root.getAttribute("width") ?? "");
  const height = Number.parseFloat(root.getAttribute("height") ?? "");

  return {
    minX: 0,
    minY: 0,
    width: Number.isFinite(width) && width > 0 ? width : 1080,
    height: Number.isFinite(height) && height > 0 ? height : 1350,
  };
}

function serialize(document: Document) {
  return new XMLSerializer().serializeToString(document.documentElement);
}

function isInsideDefinition(element: Element) {
  return Boolean(
    element.closest("defs,clipPath,mask,marker,pattern,symbol"),
  );
}

export function indexVisualSvg(svgText: string): IndexedVisualSvg {
  const document = parseSvg(svgText);
  sanitizeSvgDocument(document);
  const root = document.documentElement as unknown as SVGElement;
  const elements = Array.from(
    document.querySelectorAll<SVGElement>(DRAWABLE_SELECTOR),
  ).filter((element) => !isInsideDefinition(element));
  const usedIds = new Set<string>();
  const indexedElements = elements.map((element, index) => {
    const originalId = element.getAttribute("id")?.trim();
    let candidateId =
      originalId && !usedIds.has(originalId)
        ? originalId
        : "";
    let generatedIndex = index + 1;

    while (!candidateId || usedIds.has(candidateId)) {
      candidateId = `vc-element-${generatedIndex}`;
      generatedIndex += 1;
    }

    usedIds.add(candidateId);
    element.setAttribute("data-vc-id", candidateId);

    return {
      id: candidateId,
      tagName: element.localName,
      label: originalId
        ? `${element.localName} #${originalId}`
        : `${element.localName} ${index + 1}`,
    };
  });

  if (indexedElements.length === 0) {
    throw new Error(
      "El SVG no contiene trazos, rectangulos o figuras seleccionables.",
    );
  }

  root.setAttribute("xmlns", SVG_NAMESPACE);

  return {
    normalizedSvg: serialize(document),
    elements: indexedElements,
    viewBox: readViewBox(root),
  };
}

export function buildSelectableSvgMarkup(
  normalizedSvg: string,
  selectedElementIds: string[],
) {
  const document = parseSvg(normalizedSvg);
  const selectedIds = new Set(selectedElementIds);

  document.querySelectorAll<SVGElement>("[data-vc-id]").forEach((element) => {
    if (selectedIds.has(element.dataset.vcId ?? "")) {
      element.setAttribute("data-vc-selected", "true");
    } else {
      element.removeAttribute("data-vc-selected");
    }
  });

  return serialize(document);
}

function appendImportantStyle(element: Element, declaration: string) {
  const currentStyle = element.getAttribute("style")?.trim() ?? "";
  const separator =
    currentStyle.length > 0 && !currentStyle.endsWith(";") ? ";" : "";
  element.setAttribute(
    "style",
    `${currentStyle}${separator}${declaration}`,
  );
}

function applyElementPaint(
  element: Element,
  paint: VisualElementPaint | undefined,
  visibilityToken: string,
) {
  if (paint?.visibilityConditions.length) {
    appendImportantStyle(
      element,
      `display:${visibilityToken}!important;`,
    );
  }

  if (!paint || paint.mode === "preserve") {
    return;
  }

  if (paint.mode === "base_fill") {
    appendImportantStyle(element, "fill:__VC_BASE_COLOR__!important;");
    return;
  }

  if (paint.mode === "base_stroke") {
    appendImportantStyle(element, "stroke:__VC_BASE_COLOR__!important;");
    return;
  }

  if (paint.mode === "outline") {
    appendImportantStyle(
      element,
      "fill:none!important;stroke:__VC_OUTLINE_COLOR__!important;",
    );
    return;
  }

  if (paint.trimSourceValueId === undefined) {
    throw new Error(
      "Cada elemento de vivo debe vincularse con una opcion de Seccion de vivo.",
    );
  }

  const token =
    paint.mode === "trim_fill"
      ? `__VC_TRIM_FILL_${paint.trimSourceValueId}__`
      : `__VC_TRIM_STROKE_${paint.trimSourceValueId}__`;
  const property = paint.mode === "trim_fill" ? "fill" : "stroke";
  appendImportantStyle(element, `${property}:${token}!important;`);
}

export function buildRuntimeVisualSvg({
  normalizedSvg,
  selectedElementIds,
  elementPaints,
  placement,
}: RuntimeSvgInput) {
  if (selectedElementIds.length === 0) {
    throw new Error("Selecciona al menos un elemento del SVG.");
  }

  const document = parseSvg(normalizedSvg);
  const sourceRoot = document.documentElement as unknown as SVGElement;
  const sourceViewBox = readViewBox(sourceRoot);
  const selectedIds = new Set(selectedElementIds);

  document.querySelectorAll<SVGElement>(DRAWABLE_SELECTOR).forEach((element) => {
    if (isInsideDefinition(element)) {
      return;
    }

    const elementId = element.dataset.vcId;

    if (!elementId || !selectedIds.has(elementId)) {
      element.remove();
      return;
    }

    applyElementPaint(
      element,
      elementPaints[elementId],
      getVisualElementVisibilityToken(selectedElementIds.indexOf(elementId)),
    );
    element.removeAttribute("data-vc-id");
    element.removeAttribute("data-vc-selected");
  });

  const runtimeDocument = document.implementation.createDocument(
    SVG_NAMESPACE,
    "svg",
    null,
  );
  const runtimeRoot = runtimeDocument.documentElement;
  runtimeRoot.setAttribute("xmlns", SVG_NAMESPACE);
  runtimeRoot.setAttribute(
    "viewBox",
    `0 0 ${placement.targetWidth} ${placement.targetHeight}`,
  );
  runtimeRoot.setAttribute("width", String(placement.targetWidth));
  runtimeRoot.setAttribute("height", String(placement.targetHeight));

  const rotationGroup = runtimeDocument.createElementNS(SVG_NAMESPACE, "g");
  const centerX = placement.targetWidth / 2;
  const centerY = placement.targetHeight / 2;
  rotationGroup.setAttribute(
    "transform",
    `translate(${centerX} ${centerY}) rotate(${placement.rotation}) translate(${-centerX} ${-centerY})`,
  );

  const placementGroup = runtimeDocument.createElementNS(SVG_NAMESPACE, "g");
  const scaleX =
    (placement.targetWidth / sourceViewBox.width) * placement.scaleX;
  const scaleY =
    (placement.targetHeight / sourceViewBox.height) * placement.scaleY;
  placementGroup.setAttribute(
    "transform",
    `translate(${placement.x} ${placement.y}) scale(${scaleX} ${scaleY}) translate(${-sourceViewBox.minX} ${-sourceViewBox.minY})`,
  );

  for (const child of Array.from(sourceRoot.children)) {
    const importedChild = runtimeDocument.importNode(child, true);

    if (child.localName === "defs" || child.localName === "style") {
      runtimeRoot.append(importedChild);
    } else {
      placementGroup.append(importedChild);
    }
  }

  rotationGroup.append(placementGroup);
  runtimeRoot.append(rotationGroup);

  return new XMLSerializer().serializeToString(runtimeRoot);
}

export function buildRuntimePreviewDataUri(runtimeSvg: string) {
  const previewSvg = runtimeSvg
    .replaceAll("__VC_BASE_COLOR__", "#cbd5e1")
    .replaceAll("__VC_OUTLINE_COLOR__", "#111827")
    .replace(/__VC_VISIBILITY_\d+__/g, "inline")
    .replace(/__VC_TRIM_(?:FILL|STROKE)_\d+__/g, "#007d8a");

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(previewSvg)}`;
}
