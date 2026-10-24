/**
 * Reglas comunes de las medidas personalizadas aprobadas para pantalón y bota.
 */
export const MEASUREMENT_MIN = 1;
export const LENGTH_MEASUREMENT_MAX = 90;
export const WIDTH_MEASUREMENT_MAX = 35;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

export function isMeasurementAttributeName(attributeName: string) {
  const name = normalize(attributeName);
  return name.includes("largo") || name.includes("ancho");
}

export function isNumericLengthAttributeName(attributeName: string) {
  return normalize(attributeName).includes("largo");
}

export function isNumericWidthAttributeName(attributeName: string) {
  return normalize(attributeName).includes("ancho");
}

export function isNumericMeasurementAttributeName(attributeName: string) {
  return (
    isNumericLengthAttributeName(attributeName) ||
    isNumericWidthAttributeName(attributeName)
  );
}

export function getMeasurementValueError(
  attributeName: string,
  value: string,
) {
  if (!isNumericMeasurementAttributeName(attributeName) || value.trim().length === 0) {
    return undefined;
  }

  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) {
    return isNumericLengthAttributeName(attributeName)
      ? "El largo solo admite números."
      : "El ancho solo admite números.";
  }

  const numericValue = Number(value.replace(",", "."));
  const maximum = isNumericLengthAttributeName(attributeName)
    ? LENGTH_MEASUREMENT_MAX
    : WIDTH_MEASUREMENT_MAX;
  const label = isNumericLengthAttributeName(attributeName) ? "largo" : "ancho";
  if (
    !Number.isFinite(numericValue) ||
    numericValue < MEASUREMENT_MIN ||
    numericValue > maximum
  ) {
    return `El ${label} debe estar entre ${MEASUREMENT_MIN} y ${maximum}.`;
  }

  return undefined;
}
