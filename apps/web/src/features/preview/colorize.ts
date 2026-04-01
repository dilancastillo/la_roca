const COLOR_MAP: Record<string, string> = {
  blanco: "#ffffff",
  negro: "#111827",
  gris: "#9ca3af",
  "gris perla": "#d1d5db",
  azul: "#2563eb",
  "azul rey": "#1d4ed8",
  marino: "#1e3a8a",
  rojo: "#dc2626",
  vino: "#881337",
  verde: "#16a34a",
  "verde quirófano": "#2f9e8f",
  amarillo: "#f59e0b",
  beige: "#d6c1a3",
  cafe: "#8b5e3c",
  café: "#8b5e3c",
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function resolveColorFromName(value?: string): string {
  if (!value) return "#d1d5db";

  const trimmed = value.trim();

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    return trimmed;
  }

  const normalized = normalize(trimmed);

  for (const [label, color] of Object.entries(COLOR_MAP)) {
    if (normalized.includes(normalize(label))) {
      return color;
    }
  }

  return "#d1d5db";
}

export function hashText(input: string): number {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}