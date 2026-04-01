export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

export async function saveDesign(lineId: number, blob: Blob) {
  const imageBase64 = await blobToBase64(blob);

  const res = await fetch("/api/design/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    credentials: "same-origin",
    body: JSON.stringify({
      saleOrderLineId: lineId,
      filename: `sale-line-${lineId}-design.png`,
      imageBase64
    })
  });

  if (!res.ok) {
    throw new Error("No se pudo guardar el diseño.");
  }

  return await res.json();
}