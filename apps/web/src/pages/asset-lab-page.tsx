import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthSession } from "../features/auth/hooks/use-auth-session";
import {
  getProductAssetCatalog,
  productAssetCatalogs,
} from "../features/configurator/lib/asset-catalog";
import {
  type AssetFamily,
  buildPreparedOverlayFilename,
  getAssetEntries,
  getDefaultPresetForFamily,
  type OverlayPresetKey,
} from "../features/preview/asset-prep";
import {
  createDetailOverlayCanvas,
  createRasterCanvas,
  createTintedBaseCanvas,
  getOverlayRegionPreset,
  previewCanvasSize,
} from "../features/preview/canvas-renderer";

function drawPreviewCanvas(
  target: HTMLCanvasElement | null,
  source: HTMLCanvasElement,
) {
  if (!target) {
    return;
  }

  const context = target.getContext("2d");
  if (!context) {
    return;
  }

  context.clearRect(0, 0, target.width, target.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, target.width, target.height);
  context.drawImage(source, 0, 0);
}

async function canvasToObjectUrl(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((currentBlob) => resolve(currentBlob), "image/png"),
  );

  if (!blob) {
    throw new Error("No se pudo preparar el PNG del overlay.");
  }

  return URL.createObjectURL(blob);
}

export function AssetLabPage() {
  const location = useLocation();
  const authQuery = useAuthSession();
  const productKeys = Object.keys(productAssetCatalogs);
  const [productKey, setProductKey] = useState(productKeys[0] ?? "");
  const [sourceFamily, setSourceFamily] =
    useState<AssetFamily>("lowerPocketModels");
  const [presetKey, setPresetKey] =
    useState<OverlayPresetKey>("lowerPocketPair");
  const [baseLabel, setBaseLabel] = useState("");
  const [sourceLabel, setSourceLabel] = useState("");
  const [fillColor, setFillColor] = useState("#cadbdd");
  const [inkRadius, setInkRadius] = useState(4);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);

  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const nextUrl = `/login?next=${encodeURIComponent(location.pathname)}`;
  const catalog = getProductAssetCatalog(productKey);
  const baseOptions = useMemo(
    () => (catalog ? getAssetEntries(catalog, "necks") : []),
    [catalog],
  );
  const sourceOptions = useMemo(
    () => (catalog ? getAssetEntries(catalog, sourceFamily) : []),
    [catalog, sourceFamily],
  );

  useEffect(() => {
    if (!baseOptions.some((option) => option.label === baseLabel)) {
      setBaseLabel(baseOptions[0]?.label ?? "");
    }
  }, [baseLabel, baseOptions]);

  useEffect(() => {
    if (!sourceOptions.some((option) => option.label === sourceLabel)) {
      setSourceLabel(sourceOptions[0]?.label ?? "");
    }
  }, [sourceLabel, sourceOptions]);

  useEffect(() => {
    setPresetKey(getDefaultPresetForFamily(sourceFamily));
  }, [sourceFamily]);

  useEffect(() => {
    let cancelled = false;

    async function renderLab() {
      if (!catalog || !baseLabel || !sourceLabel) {
        return;
      }

      const baseSrc = baseOptions.find((option) => option.label === baseLabel)?.src;
      const sourceSrc = sourceOptions.find(
        (option) => option.label === sourceLabel,
      )?.src;

      if (!baseSrc || !sourceSrc) {
        return;
      }

      setIsRendering(true);
      setRenderError(null);

      try {
        const [baseCanvas, sourceCanvas, overlayCanvas] = await Promise.all([
          createTintedBaseCanvas(baseSrc, fillColor),
          createRasterCanvas(sourceSrc),
          createDetailOverlayCanvas(
            sourceSrc,
            baseSrc,
            getOverlayRegionPreset(presetKey),
            inkRadius,
          ),
        ]);

        if (cancelled) {
          return;
        }

        drawPreviewCanvas(baseCanvasRef.current, baseCanvas);
        drawPreviewCanvas(sourceCanvasRef.current, sourceCanvas);
        drawPreviewCanvas(overlayCanvasRef.current, overlayCanvas);

        if (compositeCanvasRef.current) {
          const compositeContext = compositeCanvasRef.current.getContext("2d");
          if (compositeContext) {
            compositeContext.clearRect(
              0,
              0,
              compositeCanvasRef.current.width,
              compositeCanvasRef.current.height,
            );
            compositeContext.fillStyle = "#ffffff";
            compositeContext.fillRect(
              0,
              0,
              compositeCanvasRef.current.width,
              compositeCanvasRef.current.height,
            );
            compositeContext.drawImage(baseCanvas, 0, 0);
            compositeContext.drawImage(overlayCanvas, 0, 0);
          }
        }

        const nextDownloadUrl = await canvasToObjectUrl(overlayCanvas);
        if (cancelled) {
          URL.revokeObjectURL(nextDownloadUrl);
          return;
        }

        setDownloadUrl((current) => {
          if (current) {
            URL.revokeObjectURL(current);
          }
          return nextDownloadUrl;
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        setRenderError(
          error instanceof Error
            ? error.message
            : "No se pudo preparar el overlay.",
        );
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    }

    void renderLab();

    return () => {
      cancelled = true;
    };
  }, [
    baseLabel,
    baseOptions,
    catalog,
    fillColor,
    inkRadius,
    presetKey,
    sourceFamily,
    sourceLabel,
    sourceOptions,
  ]);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  if (authQuery.isLoading) {
    return (
      <main className="page-state">
        <h1>Preparando laboratorio</h1>
        <p>Estamos validando tu sesion interna.</p>
      </main>
    );
  }

  if (authQuery.isError || !authQuery.data) {
    return <Navigate to={nextUrl} replace />;
  }

  if (!catalog) {
    return (
      <main className="page-state">
        <h1>Sin catalogo grafico</h1>
        <p>No se encontro un set de assets interno para preparar overlays.</p>
      </main>
    );
  }

  const suggestedFilename =
    sourceLabel && productKey
      ? buildPreparedOverlayFilename(productKey, sourceFamily, sourceLabel)
      : "";

  return (
    <main className="asset-lab-page">
      <header className="asset-lab-header">
        <div>
          <p className="eyebrow">Laboratorio interno</p>
          <h1>Preparacion de assets graficos</h1>
          <p className="page-subtitle">
            Extrae overlays limpios desde tus PNG actuales con el mismo motor del preview.
          </p>
        </div>
      </header>

      <section className="asset-lab-controls">
        <label className="form-field">
          <span>Producto</span>
          <select
            value={productKey}
            onChange={(event) => setProductKey(event.target.value)}
          >
            {productKeys.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Base frontal</span>
          <select
            value={baseLabel}
            onChange={(event) => setBaseLabel(event.target.value)}
          >
            {baseOptions.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Familia fuente</span>
          <select
            value={sourceFamily}
            onChange={(event) =>
              setSourceFamily(event.target.value as AssetFamily)
            }
          >
            <option value="lowerPocketModels">Bolsillo inferior</option>
            <option value="auxiliaryPocketModels">Bolsillo auxiliar</option>
          </select>
        </label>

        <label className="form-field">
          <span>Asset fuente</span>
          <select
            value={sourceLabel}
            onChange={(event) => setSourceLabel(event.target.value)}
          >
            {sourceOptions.map((option) => (
              <option key={option.label} value={option.label}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Preset de zonas</span>
          <select
            value={presetKey}
            onChange={(event) =>
              setPresetKey(event.target.value as OverlayPresetKey)
            }
          >
            <option value="lowerPocketPair">Pareja inferior</option>
            <option value="auxiliaryPocketPair">Pareja auxiliar</option>
          </select>
        </label>

        <label className="form-field">
          <span>Color base</span>
          <input
            type="color"
            value={fillColor}
            onChange={(event) => setFillColor(event.target.value)}
          />
        </label>

        <label className="form-field asset-lab-controls__slider">
          <span>Radio de limpieza: {inkRadius}px</span>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={inkRadius}
            onChange={(event) => setInkRadius(Number(event.target.value))}
          />
        </label>
      </section>

      <section className="asset-lab-summary">
        <div>
          <span>Nombre sugerido</span>
          <strong>{suggestedFilename || "Pendiente"}</strong>
        </div>
        <div>
          <span>Estado</span>
          <strong>{isRendering ? "Renderizando" : "Listo para revisar"}</strong>
        </div>
        {downloadUrl ? (
          <a
            className="primary-button asset-lab-summary__download"
            href={downloadUrl}
            download={suggestedFilename}
          >
            Descargar overlay PNG
          </a>
        ) : null}
      </section>

      {renderError ? (
        <p className="error-banner" role="alert">
          {renderError}
        </p>
      ) : null}

      <section className="asset-lab-grid">
        <article className="asset-lab-card">
          <h2>Base coloreada</h2>
          <canvas
            ref={baseCanvasRef}
            width={previewCanvasSize.width}
            height={previewCanvasSize.height}
            className="asset-lab-canvas"
          />
        </article>

        <article className="asset-lab-card">
          <h2>Asset fuente</h2>
          <canvas
            ref={sourceCanvasRef}
            width={previewCanvasSize.width}
            height={previewCanvasSize.height}
            className="asset-lab-canvas"
          />
        </article>

        <article className="asset-lab-card">
          <h2>Overlay extraido</h2>
          <canvas
            ref={overlayCanvasRef}
            width={previewCanvasSize.width}
            height={previewCanvasSize.height}
            className="asset-lab-canvas"
          />
        </article>

        <article className="asset-lab-card">
          <h2>Composicion final</h2>
          <canvas
            ref={compositeCanvasRef}
            width={previewCanvasSize.width}
            height={previewCanvasSize.height}
            className="asset-lab-canvas"
          />
        </article>
      </section>
    </main>
  );
}
