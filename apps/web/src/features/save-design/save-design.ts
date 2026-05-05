export async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export async function saveDesign(
  lineId: number,
  blob: Blob,
  selectedValueIds: Record<string, number[]>,
  customValuesByValueId: Record<string, string>,
) {
  const imageBase64 = await blobToBase64(blob);

  const response = await fetch("/api/design/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    credentials: "same-origin",
    body: JSON.stringify({
      saleOrderLineId: lineId,
      filename: `sale-line-${lineId}-design.png`,
      imageBase64,
      selectedValueIds,
      customValuesByValueId,
    }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload && typeof payload.error === "string"
        ? payload.error
        : "No se pudo guardar el diseno.",
    );
  }

  return payload;
}
