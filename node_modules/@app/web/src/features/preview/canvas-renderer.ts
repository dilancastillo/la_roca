async function loadImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function composeDesign(
  canvas: HTMLCanvasElement,
  layers: { src: string }[]
): Promise<Blob> {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D no disponible");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const layer of layers) {
    const img = await loadImage(layer.src);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("No se pudo generar PNG"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}