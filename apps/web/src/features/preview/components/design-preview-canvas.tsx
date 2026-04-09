import { useEffect, useMemo, useRef, useState } from "react";
import type { PreviewScene } from "../../configurator/lib/derive-configurator-ui";
import { composeDesign } from "../canvas-renderer";

type Props = {
  scene: PreviewScene;
  readOnly: boolean;
  onBlobReady: (blob: Blob | null) => void;
};

export function DesignPreviewCanvas({ scene, readOnly, onBlobReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<"idle" | "rendering" | "ready" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const summary = useMemo(
    () =>
      readOnly
        ? "Puedes revisar el diseno, pero no editarlo."
        : "Vista frontal sincronizada en tiempo real con Odoo.",
    [readOnly],
  );

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!canvasRef.current) {
        return;
      }

      setStatus("rendering");
      setErrorMessage(null);

      try {
        const blob = await composeDesign(canvasRef.current, scene);

        if (cancelled) {
          return;
        }

        onBlobReady(blob);
        setStatus("ready");
      } catch (error) {
        if (cancelled) {
          return;
        }

        onBlobReady(null);
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
  }, [scene, onBlobReady]);

  return (
    <section className="preview-card" aria-labelledby="preview-title">
      <div className="preview-card__header">
        <div className="preview-card__headline">
          <p className="eyebrow">Preview</p>
          <div className="preview-card__title-row">
            <h2 id="preview-title">Vista frontal</h2>
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
          <p className="preview-card__subtitle">{summary}</p>
        </div>
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
      ) : (
        <p className="preview-card__footnote">
          El PNG final se genera desde este canvas y vuelve a la linea de venta.
        </p>
      )}
    </section>
  );
}
