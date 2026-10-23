/**
 * Reglas comunes de las medidas personalizadas. El rango amplio evita textos
 * o valores imposibles sin asumir una talla comercial específica.
 */
export const MEASUREMENT_MIN = 1;
export const MEASUREMENT_MAX = 999;

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

export function getMeasurementValueError(
  attributeName: string,
  value: string,
) {
  if (!isNumericLengthAttributeName(attributeName) || value.trim().length === 0) {
    return undefined;
  }

  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) {
    return "El largo solo admite números.";
  }

  const numericValue = Number(value.replace(",", "."));
  if (
    !Number.isFinite(numericValue) ||
    numericValue < MEASUREMENT_MIN ||
    numericValue > MEASUREMENT_MAX
  ) {
    return `El largo debe estar entre ${MEASUREMENT_MIN} y ${MEASUREMENT_MAX}.`;
  }

  return undefined;
}
