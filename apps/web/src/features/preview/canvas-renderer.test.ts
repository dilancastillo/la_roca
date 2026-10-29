import { describe, expect, it } from "vitest";
import {
  getStableFemaleNeckDetailRegions,
  getSleeveAnchorSrc,
  getChestPocketSectionTrimOverlays,
  getOriginalSleeveTrimShapes,
  getSvgViewBoxForSource,
  shouldCloseBlouseNeckMask,
} from "./canvas-renderer";

describe("vivos de bolsillo de pecho", () => {
  it("aplica las capas superior e inferior al modelo rectangular v2", () => {
    expect(
      getChestPocketSectionTrimOverlays(
        "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-v2.svg",
      ),
    ).toEqual({
      upper:
        "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-upper-trim.svg",
      lower:
        "/assets/catalog/blusa-antifluido-t180/detail-overlays/chest-pocket-rectangular-lower-trim.svg",
    });
  });
});

describe("vivos de mangas originales", () => {
  it("conserva el ancla de cuello femenino al componer sobre la base estable", () => {
    const cuelloV =
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg";

    expect(
      getSleeveAnchorSrc(
        {
          useStableFemaleBlouseSilhouette: true,
          sleeveAnchorSrc: cuelloV,
        },
        "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg",
      ),
    ).toBe(cuelloV);
  });

  it("recorta los tres cuellos dinámicos femeninos sin alcanzar sus puños", () => {
    // Los extremos interiores de los puños llegan aproximadamente a x=265 y
    // x=635 en el lienzo. La región exclusiva de cuello deja margen a ambos
    // lados y evita que el SVG completo vuelva a sobrepintarlos.
    expect(getStableFemaleNeckDetailRegions()).toEqual([
      { x: 300, y: 55, width: 300, height: 410 },
    ]);
  });

  it.each([
    "blouse-model-01.svg",
    "blouse-model-04.svg",
    "blouse-model-40-mariposa.svg",
    "blouse-model-39-el-hato.svg",
  ])("deja ambos vivos de %s sobre el extremo exterior de cada puño", (fileName) => {
    const [left, right] = getOriginalSleeveTrimShapes(
      `/assets/catalog/blusa-antifluido-t180/svg-clean/${fileName}`,
    );

    expect(left).toBeDefined();
    expect(right).toBeDefined();

    // El borde lower es el que se pinta en el extremo del puño. En la manga
    // izquierda debe quedar hacia fuera (menor X); en la derecha, hacia fuera
    // (mayor X). En ambas baja respecto a la arista interior del cuerpo.
    expect(left!.lower[0][0]).toBeLessThan(left!.upper[0][0]);
    expect(left!.lower[1][0]).toBeLessThan(left!.upper[1][0]);
    expect(right!.lower[0][0]).toBeGreaterThan(right!.upper[0][0]);
    expect(right!.lower[1][0]).toBeGreaterThan(right!.upper[1][0]);
    expect(left!.lower[0][1]).toBeGreaterThan(left!.upper[0][1]);
    expect(left!.lower[1][1]).toBeGreaterThan(left!.upper[1][1]);
    expect(right!.lower[0][1]).toBeGreaterThan(right!.upper[0][1]);
    expect(right!.lower[1][1]).toBeGreaterThan(right!.upper[1][1]);
  });

  it("ancla Cuello V al borde exterior del puño y no a la sisa", () => {
    const [left, right] = getOriginalSleeveTrimShapes(
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );

    expect(left?.lower).toEqual([
      [110.72, 533.35],
      [264.49, 670.72],
    ]);
    expect(right?.lower).toEqual([
      [970.21, 515.32],
      [834.2, 642.19],
    ]);
  });

  it("conserva el ancla de Cuello V cuando el laboratorio materializa el SVG", () => {
    const [left, right] = getOriginalSleeveTrimShapes(
      "data:image/svg+xml;charset=utf-8,%3Csvg%2F%3E",
      "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
    );

    expect(left?.lower).toEqual([
      [110.72, 533.35],
      [264.49, 670.72],
    ]);
    expect(right?.lower).toEqual([
      [970.21, 515.32],
      [834.2, 642.19],
    ]);
  });

  it.each([
    ["El Hato", "blouse-model-39-el-hato.svg"],
    ["Cuello Alto", "blouse-model-08.svg"],
    ["Cirugía", "blouse-model-37-cirugia.svg"],
  ])(
    "usa para %s el perfil de puño ya corregido de Cuello V",
    (_model, fileName) => {
      const [left, right] = getOriginalSleeveTrimShapes(
        "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg",
        `/assets/catalog/blusa-antifluido-t180/svg-clean/${fileName}`,
      );

      expect(left?.lower).toEqual([
        [110.72, 533.35],
        [264.49, 670.72],
      ]);
      expect(right?.lower).toEqual([
        [970.21, 515.32],
        [834.2, 642.19],
      ]);
    },
  );

  it.each([
    [
      "Mariposa cruzado",
      "blouse-model-40-mariposa.svg",
      [[109.82, 535.05], [263.59, 672.42]],
      [[965.25, 531.05], [833.9, 636.48]],
    ],
    [
      "El Hato",
      "blouse-model-39-el-hato.svg",
      [[0, 463.86], [168.42, 614.36]],
      [[941.85, 462.31], [792.42, 582.99]],
    ],
  ])("preserva el borde de puño real en %s", (_model, fileName, leftLower, rightLower) => {
    const [left, right] = getOriginalSleeveTrimShapes(
      `/assets/catalog/blusa-antifluido-t180/svg-clean/${fileName}`,
    );

    expect(left?.lower).toEqual(leftLower);
    expect(right?.lower).toEqual(rightLower);
  });
});

describe("SVG dinámicos del configurador", () => {
  it("lee el viewBox de un SVG materializado como data URI", async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1350"></svg>';
    const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    await expect(getSvgViewBoxForSource(source)).resolves.toEqual({
      x: 0,
      y: 0,
      width: 1080,
      height: 1350,
    });
  });
});

describe("máscara de color de blusa", () => {
  it("cierra el cuello para toda blusa, aun sin una definición dinámica", () => {
    expect(
      shouldCloseBlouseNeckMask(
        { productName: "Blusa" },
        "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
      ),
    ).toBe(true);
  });

  it("conserva el pantalón fuera de la regla de cierre", () => {
    expect(
      shouldCloseBlouseNeckMask(
        { productName: "Pantalón" },
        "/assets/catalog/pantalon/svg-clean/pants-base.svg",
      ),
    ).toBe(false);
  });
});
