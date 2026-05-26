import { describe, expect, it } from "vitest";
import {
  resolveOdooOptionImageSrc,
  resolveSelectedIdsForAttributeValues,
  toOdooImageDataUri,
} from "./get-configurator-session.js";

describe("resolveSelectedIdsForAttributeValues", () => {
  const colorValues = [
    { id: 100, name: "110601 - Blanco" },
    { id: 200, name: "150341 - Verde Olivo Claro" },
  ];

  it("prioriza el valor guardado explicitamente en la linea sobre el valor del producto", () => {
    expect(
      resolveSelectedIdsForAttributeValues(
        colorValues,
        new Set([200]),
        new Set([100]),
      ),
    ).toEqual([200]);
  });

  it("usa el valor del producto cuando la linea no tiene seleccion explicita", () => {
    expect(
      resolveSelectedIdsForAttributeValues(
        colorValues,
        new Set(),
        new Set([100]),
      ),
    ).toEqual([100]);
  });
});

describe("toOdooImageDataUri", () => {
  it("convierte imagenes binarias de Odoo en data URIs renderizables por el navegador", () => {
    expect(toOdooImageDataUri("iVBORw0KGgoAAAANSUhEUg")).toBe(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUg",
    );
    expect(toOdooImageDataUri("/9j/4AAQSkZJRg")).toBe(
      "data:image/jpeg;base64,/9j/4AAQSkZJRg",
    );
  });
});

describe("resolveOdooOptionImageSrc", () => {
  it("usa la imagen de Odoo solo cuando el atributo o valor es tipo imagen", () => {
    expect(
      resolveOdooOptionImageSrc({
        attributeDisplayType: "image",
        ptavImage: "iVBORw0KGgoAAAANSUhEUg",
      }),
    ).toBe("data:image/png;base64,iVBORw0KGgoAAAANSUhEUg");

    expect(
      resolveOdooOptionImageSrc({
        attributeDisplayType: "radio",
        ptavImage: "iVBORw0KGgoAAAANSUhEUg",
      }),
    ).toBeUndefined();
  });

  it("prefiere la imagen del PTAV y cae a la imagen del valor si hace falta", () => {
    expect(
      resolveOdooOptionImageSrc({
        ptavDisplayType: "image",
        ptavImage: "/9j/ptav",
        valueImage: "iVBORw0KGvalue",
      }),
    ).toBe("data:image/jpeg;base64,/9j/ptav");

    expect(
      resolveOdooOptionImageSrc({
        valueDisplayType: "image",
        ptavImage: false,
        valueImage: "iVBORw0KGvalue",
      }),
    ).toBe("data:image/png;base64,iVBORw0KGvalue");
  });
});
