import { useEffect, useRef, useState } from "react";
import type { PreviewScene } from "../../configurator/lib/derive-configurator-ui";
import { composeDesign } from "../canvas-renderer";

type Props = {
  scene: PreviewScene;
  renderKey: string;
  readOnly: boolean;
  onBlobReady: (renderKey: string, blob: Blob | null) => void;
};

function createRenderCanvas(target: HTMLCanvasElement) {
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;

  return canvas;
}

function copyRenderedCanvas(
  target: HTMLCanvasElement,
  rendered: HTMLCanvasElement,
) {
  const context = target.getContext("2d");

  if (!context) {
    throw new Error("Canvas 2D no disponible");
  }

  context.clearRect(0, 0, target.width, target.height);
  context.drawImage(rendered, 0, 0);
}

export function DesignPreviewCanvas({
  scene,
  renderKey,
  onBlobReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [uniformViewMode, setUniformViewMode] = useState<
    "set" | "blouse" | "pants"
  >("set");
  const [status, setStatus] = useState<"idle" | "rendering" | "ready" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasUniformParts = Boolean(scene.uniformParts);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!canvasRef.current) {
        return;
      }

      setStatus("rendering");
      setErrorMessage(null);
      onBlobReady(renderKey, null);

      try {
        const targetCanvas = canvasRef.current;
        const renderCanvas = createRenderCanvas(targetCanvas);
        const visibleScene =
          scene.uniformParts && uniformViewMode === "blouse"
            ? scene.uniformParts.blouse
            : scene.uniformParts && uniformViewMode === "pants"
              ? scene.uniformParts.pants
              : scene;
        const blob =
          visibleScene === scene
            ? await composeDesign(renderCanvas, scene)
            : await composeDesign(createRenderCanvas(targetCanvas), scene);

        if (visibleScene !== scene) {
          await composeDesign(renderCanvas, visibleScene);
        }

        if (cancelled) {
          return;
        }

        if (!canvasRef.current) {
          return;
        }

        copyRenderedCanvas(canvasRef.current, renderCanvas);
        onBlobReady(renderKey, blob);
        setStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }

        onBlobReady(renderKey, null);
        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo generar la previsualizacion.",
        );
      }
    }

    void render();

    return () => {
      cancelled = true;
    };
  }, [scene, renderKey, onBlobReady, uniformViewMode]);

  return (
    <section className="preview-card" aria-label="Preview de diseno">
      <div className="preview-card__status-strip" aria-live="polite">
        <p className="eyebrow">Preview</p>
        {hasUniformParts ? (
          <div className="preview-card__view-toggle" aria-label="Vista del uniforme">
            <button
              type="button"
              className={uniformViewMode === "set" ? "is-active" : ""}
              onClick={() => setUniformViewMode("set")}
            >
              Conjunto
            </button>
            <button
              type="button"
              className={uniformViewMode === "blouse" ? "is-active" : ""}
              onClick={() => setUniformViewMode("blouse")}
            >
              Blusa
            </button>
            <button
              type="button"
              className={uniformViewMode === "pants" ? "is-active" : ""}
              onClick={() => setUniformViewMode("pants")}
            >
              Pantalon
            </button>
          </div>
        ) : null}
        <span
          className={[
            "status-pill",
            status === "ready" ? "status-pill--success" : "",
            status === "rendering" ? "status-pill--warning" : "",
            status === "error" ? "status-pill--danger" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {status === "idle" ? "Inicializando" : null}
          {status === "rendering" ? "Renderizando" : null}
          {status === "ready" ? "Listo" : null}
          {status === "error" ? "Error" : null}
        </span>
      </div>

      <div className="preview-card__canvas-wrap">
        <canvas
          ref={canvasRef}
          width={900}
          height={1200}
          className="preview-canvas"
        />
      </div>

      {errorMessage ? (
        <p className="error-banner" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
