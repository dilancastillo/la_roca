import { describe, expect, it } from "vitest";
import { applyRenderedPreviewUpdate, createPreviewSceneKey } from "./rendered-preview";

describe("rendered preview state", () => {
  it("genera una llave estable para detectar si el PNG corresponde a la escena actual", () => {
    expect(
      createPreviewSceneKey({
        baseColorHex: "#ffffff",
        neckImageSrc: "/assets/model.svg",
      }),
    ).toBe('{"baseColorHex":"#ffffff","neckImageSrc":"/assets/model.svg"}');
  });

  it("ignora blobs que pertenecen a una escena anterior", () => {
    const current = { renderKey: "current", blob: new Blob(["actual"]) };
    const staleBlob = new Blob(["stale"]);

    expect(
      applyRenderedPreviewUpdate(current, "current", "old", staleBlob),
    ).toBe(current);
  });

  it("solo limpia el blob cuando la escena activa esta renderizando", () => {
    const current = { renderKey: "current", blob: new Blob(["actual"]) };

    expect(applyRenderedPreviewUpdate(current, "current", "current", null)).toBeNull();
    expect(applyRenderedPreviewUpdate(current, "current", "old", null)).toBe(current);
  });

  it("acepta el blob cuando corresponde a la escena activa", () => {
    const blob = new Blob(["ready"]);

    expect(applyRenderedPreviewUpdate(null, "current", "current", blob)).toEqual({
      renderKey: "current",
      blob,
    });
  });
});
