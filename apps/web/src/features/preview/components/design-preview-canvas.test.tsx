// @vitest-environment jsdom

import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PreviewScene } from "../../configurator/lib/derive-configurator-ui";
import { composeDesign } from "../canvas-renderer";
import { DesignPreviewCanvas } from "./design-preview-canvas";

vi.mock("../canvas-renderer", () => ({
  composeDesign: vi.fn(),
}));

const composeDesignMock = vi.mocked(composeDesign);

type PendingRender = {
  canvas: HTMLCanvasElement;
  resolve: (blob: Blob) => void;
};

let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;

function createScene(renderId: string): PreviewScene {
  return {
    productName: "Blusa",
    baseColorHex: renderId,
    garmentImageSrc: "/assets/base.svg",
    lowerPocketLayout: "double",
    trimSections: [],
  };
}

beforeEach(() => {
  originalGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = (function (this: HTMLCanvasElement) {
    return {
      clearRect: vi.fn(),
      drawImage: vi.fn((source: HTMLCanvasElement) => {
        this.dataset.drawnRenderId = source.dataset.renderId;
      }),
    } as unknown as CanvasRenderingContext2D;
  } as unknown) as typeof HTMLCanvasElement.prototype.getContext;
});

afterEach(() => {
  HTMLCanvasElement.prototype.getContext = originalGetContext;
  composeDesignMock.mockReset();
  cleanup();
});

describe("DesignPreviewCanvas", () => {
  it("no deja que un render anterior pinte encima del render vigente", async () => {
    const pendingRenders: PendingRender[] = [];

    composeDesignMock.mockImplementation((canvas, scene) => {
      canvas.dataset.renderId = scene.baseColorHex;

      return new Promise<Blob>((resolve) => {
        pendingRenders.push({ canvas, resolve });
      });
    });

    const onBlobReady = vi.fn();
    const { container, rerender } = render(
      <DesignPreviewCanvas
        scene={createScene("old")}
        renderKey="old"
        readOnly={false}
        onBlobReady={onBlobReady}
      />,
    );
    const visibleCanvas = container.querySelector("canvas");

    await waitFor(() => expect(pendingRenders).toHaveLength(1));

    rerender(
      <DesignPreviewCanvas
        scene={createScene("current")}
        renderKey="current"
        readOnly={false}
        onBlobReady={onBlobReady}
      />,
    );

    await waitFor(() => expect(pendingRenders).toHaveLength(2));

    pendingRenders[1]?.resolve(new Blob(["current"]));

    await waitFor(() =>
      expect(visibleCanvas?.dataset.drawnRenderId).toBe("current"),
    );

    pendingRenders[0]?.resolve(new Blob(["old"]));
    await new Promise((resolve) => window.setTimeout(resolve, 0));

    expect(visibleCanvas?.dataset.drawnRenderId).toBe("current");
    expect(onBlobReady).toHaveBeenCalledWith("current", expect.any(Blob));
    expect(onBlobReady).not.toHaveBeenCalledWith("old", expect.any(Blob));
  });
});
