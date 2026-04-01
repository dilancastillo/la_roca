import { useEffect, useMemo, useRef, useState } from "react";
import type { ConfiguratorState } from "../../configurator/reducers/configurator-reducer";
import { buildPreviewLayers } from "../asset-loader";
import { composeDesign } from "../canvas-renderer";

type Props = {
  productName: string;
  state: ConfiguratorState;
  onBlobReady: (blob: Blob) => void;
};

export function DesignPreviewCanvas({
  productName,
  state,
  onBlobReady,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<"idle" | "rendering" | "ready" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const layers = useMemo(
    () => buildPreviewLayers(productName, state),
    [productName, state],
  );

  useEffect(() => {
    let cancelled = false;

    async function renderPreview() {
      if (!canvasRef.current) return;

      setStatus("rendering");
      setErrorMessage(null);

      try {
        const blob = await composeDesign(canvasRef.current, layers);

        if (cancelled) return;

        onBlobReady(blob);
        setStatus("ready");
      } catch (error) {
        if (cancelled) return;

        setStatus("error");
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "No se pudo renderizar la previsualización.",
        );
      }
    }

    void renderPreview();

    return () => {
      cancelled = true;
    };
  }, [layers, onBlobReady]);

  return (
    <section className="preview-card" aria-labelledby="preview-title">
      <div className="preview-card__header">
        <div>
          <h2 id="preview-title">Previsualización</h2>
          <p className="preview-card__subtitle">
            Vista frontal generada en tiempo real.
          </p>
        </div>

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
      ) : (
        <p className="preview-card__footnote">
          El PNG final se genera a partir de esta composición.
        </p>
      )}
    </section>
  );
}