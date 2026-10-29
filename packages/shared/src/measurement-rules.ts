/**
 * Reglas comunes de las medidas personalizadas aprobadas para pantalón y bota.
 */
export const MEASUREMENT_MIN = 1;
export const LENGTH_MEASUREMENT_MAX = 90;
export const WIDTH_MEASUREMENT_MAX = 35;
export const PANTS_LENGTH_MEASUREMENT_MIN = 70;
export const PANTS_LENGTH_MEASUREMENT_MAX = 120;
export const BOOT_LENGTH_MEASUREMENT_MIN = 20;
export const BOOT_LENGTH_MEASUREMENT_MAX = 45;
export const BOOT_WIDTH_MEASUREMENT_MIN = 12;
export const BOOT_WIDTH_MEASUREMENT_MAX = 25;

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

function isPantsMeasurementAttributeName(attributeName: string) {
  return normalize(attributeName).includes("pantalon");
}

function isBootMeasurementAttributeName(attributeName: string) {
  return normalize(attributeName).includes("bota");
}

export function getMeasurementRange(attributeName: string) {
  if (
    isNumericLengthAttributeName(attributeName) &&
    isPantsMeasurementAttributeName(attributeName)
  ) {
    return {
      label: "largo de pantalón",
      minimum: PANTS_LENGTH_MEASUREMENT_MIN,
      maximum: PANTS_LENGTH_MEASUREMENT_MAX,
    };
  }

  if (
    isNumericLengthAttributeName(attributeName) &&
    isBootMeasurementAttributeName(attributeName)
  ) {
    return {
      label: "largo de bota",
      minimum: BOOT_LENGTH_MEASUREMENT_MIN,
      maximum: BOOT_LENGTH_MEASUREMENT_MAX,
    };
  }

  if (
    isNumericWidthAttributeName(attributeName) &&
    isBootMeasurementAttributeName(attributeName)
  ) {
    return {
      label: "ancho de bota",
      minimum: BOOT_WIDTH_MEASUREMENT_MIN,
      maximum: BOOT_WIDTH_MEASUREMENT_MAX,
    };
  }

  const isLength = isNumericLengthAttributeName(attributeName);
  return {
    label: isLength ? "largo" : "ancho",
    minimum: MEASUREMENT_MIN,
    maximum: isLength ? LENGTH_MEASUREMENT_MAX : WIDTH_MEASUREMENT_MAX,
  };
}

export function getMeasurementValueError(
  attributeName: string,
  value: string,
) {
  if (!isNumericMeasurementAttributeName(attributeName) || value.trim().length === 0) {
    return undefined;
  }

  // Las medidas numéricas se acotan para evitar valores físicamente
  // imposibles. Un texto es una indicación comercial válida de Odoo (por
  // ejemplo, una referencia de patrón) y no debe bloquear el guardado.
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(value.trim())) {
    return undefined;
  }

  const numericValue = Number(value.replace(",", "."));
  const { label, minimum, maximum } = getMeasurementRange(attributeName);
  if (
    !Number.isFinite(numericValue) ||
    numericValue < minimum ||
    numericValue > maximum
  ) {
    return `El ${label} debe estar entre ${minimum} y ${maximum}.`;
  }

  return undefined;
}
