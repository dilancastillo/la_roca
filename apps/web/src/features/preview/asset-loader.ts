import type { ConfiguratorState } from "../configurator/reducers/configurator-reducer";
import { hashText, resolveColorFromName, svgToDataUri } from "./colorize";

export type PreviewLayer = {
  src: string;
};

function buildBaseGarmentSvg(productName: string, fillColor: string): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      <rect width="900" height="1200" fill="#f8fafc"/>
      <text x="450" y="64" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#0f172a">
        ${escapeXml(productName)}
      </text>

      <g transform="translate(0,40)">
        <path
          d="M250 180
             L180 290
             L235 355
             L270 330
             L300 980
             L600 980
             L630 330
             L665 355
             L720 290
             L650 180
             L560 140
             L340 140
             Z"
          fill="${fillColor}"
          stroke="#334155"
          stroke-width="10"
          stroke-linejoin="round"
        />

        <path
          d="M405 140 C420 210 480 210 495 140"
          fill="none"
          stroke="#334155"
          stroke-width="10"
          stroke-linecap="round"
        />

        <line x1="450" y1="205" x2="450" y2="978" stroke="#94a3b8" stroke-width="4" stroke-dasharray="18 12"/>
      </g>
    </svg>
  `;
}

function buildNeckSvg(label?: string): string {
  if (!label) return emptySvg();

  const variant = hashText(label) % 4;

  const paths = [
    `<path d="M390 180 C415 245 485 245 510 180" fill="none" stroke="#0f172a" stroke-width="10" stroke-linecap="round"/>`,
    `<path d="M395 180 L450 255 L505 180" fill="none" stroke="#0f172a" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`,
    `<path d="M388 182 C405 220 495 220 512 182" fill="none" stroke="#0f172a" stroke-width="16" stroke-linecap="round"/>`,
    `<path d="M398 182 C418 220 482 220 502 182" fill="none" stroke="#0f172a" stroke-width="10" stroke-linecap="round"/>
     <path d="M430 182 L450 228 L470 182" fill="none" stroke="#0f172a" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`,
  ];

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      ${paths[variant]}
    </svg>
  `;
}

function buildChestPocketSvg(label?: string): string {
  if (!label || normalizeChoice(label).includes("sin bolsillo")) {
    return emptySvg();
  }

  const variant = hashText(label) % 3;

  const shapes = [
    `<rect x="520" y="360" width="120" height="140" rx="12" fill="none" stroke="#334155" stroke-width="8"/>`,
    `<path d="M520 360 H640 V485 H520 Z" fill="none" stroke="#334155" stroke-width="8"/>
     <path d="M520 392 H640" fill="none" stroke="#334155" stroke-width="8"/>`,
    `<path d="M520 360 H640 V495 H520 Z" fill="none" stroke="#334155" stroke-width="8"/>
     <path d="M520 360 L580 320 H640" fill="none" stroke="#334155" stroke-width="8"/>`,
  ];

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      ${shapes[variant]}
    </svg>
  `;
}

function buildLowerPocketSvg(label?: string): string {
  if (!label || normalizeChoice(label).includes("sin bolsillo")) {
    return emptySvg();
  }

  const variant = hashText(label) % 3;

  const shapes = [
    `
    <rect x="260" y="640" width="130" height="150" rx="12" fill="none" stroke="#334155" stroke-width="8"/>
    <rect x="510" y="640" width="130" height="150" rx="12" fill="none" stroke="#334155" stroke-width="8"/>
    `,
    `
    <path d="M255 640 H395 V790 H255 Z" fill="none" stroke="#334155" stroke-width="8"/>
    <path d="M505 640 H645 V790 H505 Z" fill="none" stroke="#334155" stroke-width="8"/>
    <path d="M255 680 H395" fill="none" stroke="#334155" stroke-width="8"/>
    <path d="M505 680 H645" fill="none" stroke="#334155" stroke-width="8"/>
    `,
    `
    <path d="M255 645 H395 L375 795 H275 Z" fill="none" stroke="#334155" stroke-width="8"/>
    <path d="M505 645 H645 L625 795 H525 Z" fill="none" stroke="#334155" stroke-width="8"/>
    `,
  ];

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      ${shapes[variant]}
    </svg>
  `;
}

function buildTrimSvg(
  trimSections: ConfiguratorState["trimSections"],
): string {
  const strokes: string[] = [];

  if (trimSections.collar?.enabled && trimSections.collar.color) {
    strokes.push(`
      <path
        d="M390 180 C415 245 485 245 510 180"
        fill="none"
        stroke="${resolveColorFromName(trimSections.collar.color)}"
        stroke-width="14"
        stroke-linecap="round"
      />
    `);
  }

  if (trimSections.frontPlacket?.enabled && trimSections.frontPlacket.color) {
    strokes.push(`
      <line
        x1="450" y1="205" x2="450" y2="978"
        stroke="${resolveColorFromName(trimSections.frontPlacket.color)}"
        stroke-width="10"
        stroke-linecap="round"
      />
    `);
  }

  if (trimSections.chestPocket?.enabled && trimSections.chestPocket.color) {
    strokes.push(`
      <rect
        x="516" y="356" width="128" height="148" rx="14"
        fill="none"
        stroke="${resolveColorFromName(trimSections.chestPocket.color)}"
        stroke-width="8"
      />
    `);
  }

  if (trimSections.lowerPockets?.enabled && trimSections.lowerPockets.color) {
    strokes.push(`
      <rect
        x="252" y="636" width="142" height="158" rx="14"
        fill="none"
        stroke="${resolveColorFromName(trimSections.lowerPockets.color)}"
        stroke-width="8"
      />
      <rect
        x="502" y="636" width="142" height="158" rx="14"
        fill="none"
        stroke="${resolveColorFromName(trimSections.lowerPockets.color)}"
        stroke-width="8"
      />
    `);
  }

  if (strokes.length === 0) {
    return emptySvg();
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200">
      ${strokes.join("\n")}
    </svg>
  `;
}

function emptySvg(): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200"></svg>
  `;
}

function normalizeChoice(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildPreviewLayers(
  productName: string,
  state: ConfiguratorState,
): PreviewLayer[] {
  const fillColor = resolveColorFromName(state.baseColor);

  return [
    { src: svgToDataUri(buildBaseGarmentSvg(productName, fillColor)) },
    { src: svgToDataUri(buildNeckSvg(state.neckModel)) },
    { src: svgToDataUri(buildChestPocketSvg(state.chestPocketModel)) },
    { src: svgToDataUri(buildLowerPocketSvg(state.lowerPocketModel)) },
    { src: svgToDataUri(buildTrimSvg(state.trimSections)) },
  ];
}