export type RenderedPreview = {
  renderKey: string;
  blob: Blob;
};

export function createPreviewSceneKey(scene: unknown) {
  return JSON.stringify(scene);
}

export function applyRenderedPreviewUpdate(
  current: RenderedPreview | null,
  latestRenderKey: string,
  renderKey: string,
  blob: Blob | null,
): RenderedPreview | null {
  if (renderKey !== latestRenderKey) {
    return current;
  }

  return blob ? { renderKey, blob } : null;
}
