import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { getProductAssetCatalog } from "./asset-catalog";

export type UiOption = {
  id: number;
  name: string;
  colorHex?: string | undefined;
  imageSrc?: string | undefined;
};

export type UiAttributeGroup = {
  attributeId: number;
  label: string;
  helpText?: string | undefined;
  controlType: "color" | "image" | "chips";
  selectionMode: "single" | "multiple";
  options: UiOption[];
};

export type PreviewScene = {
  productName: string;
  baseColorHex: string;
  neckImageSrc?: string | undefined;
  lowerPocketImageSrc?: string | undefined;
  auxiliaryPocketImageSrc?: string | undefined;
  chestPocketType?: string | undefined;
  trimSections: Array<{
    key: string;
    label: string;
    colorHex: string;
  }>;
};

export type ConfiguratorUiModel = {
  groups: UiAttributeGroup[];
  summary: Array<{ label: string; value: string }>;
  previewScene: PreviewScene;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function getSelectedOptions(
  attribute: ConfiguratorSession["attributes"][number],
  selectedValueIds: Record<string, number[]>,
) {
  const ids = new Set(selectedValueIds[String(attribute.id)] ?? []);
  return attribute.values.filter((value) => ids.has(value.id));
}

function getHelpText(attributeName: string) {
  const normalized = normalize(attributeName);

  if (normalized.includes("cuello")) {
    return "Selecciona el cuello que mejor representa la prenda.";
  }
  if (normalized.includes("bolsillo")) {
    return "Ajusta la configuracion visual segun la necesidad del cliente.";
  }
  if (normalized.includes("color")) {
    return "Usa los colores exactos configurados en Odoo para el prototipo.";
  }
  if (normalized.includes("vivo")) {
    return "Estas selecciones controlan bordes y vivos visibles en la ilustracion.";
  }
  return undefined;
}

function getImageSource(
  graphicManifestKey: string,
  attributeName: string,
  valueName: string,
) {
  const catalog = getProductAssetCatalog(graphicManifestKey);

  if (!catalog) {
    return undefined;
  }

  const normalizedAttribute = normalize(attributeName);

  if (normalizedAttribute.includes("modelo de cuello")) {
    return catalog.necks[valueName];
  }

  if (normalizedAttribute.includes("modelo bolsillo inferior")) {
    return catalog.lowerPocketModels[valueName];
  }

  if (normalizedAttribute.includes("modelo bolsillo auxiliar")) {
    return catalog.auxiliaryPocketModels[valueName];
  }

  return undefined;
}

function getControlType(
  attribute: ConfiguratorSession["attributes"][number],
  session: ConfiguratorSession,
): UiAttributeGroup["controlType"] {
  if (attribute.values.some((value) => value.colorHex)) {
    return "color";
  }

  if (
    attribute.values.some((value) =>
      Boolean(getImageSource(session.graphicManifestKey, attribute.name, value.name)),
    )
  ) {
    return "image";
  }

  return "chips";
}

function findAttributeByName(
  session: ConfiguratorSession,
  matcher: (normalizedName: string) => boolean,
) {
  return session.attributes.find((attribute) => matcher(normalize(attribute.name)));
}

function findSelectedValue(
  attribute: ConfiguratorSession["attributes"][number] | undefined,
  selectedValueIds: Record<string, number[]>,
) {
  if (!attribute) {
    return undefined;
  }

  const selectedIds = new Set(selectedValueIds[String(attribute.id)] ?? []);
  return attribute.values.find((value) => selectedIds.has(value.id));
}

function getSelectedTrimSections(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const sectionAttribute = findAttributeByName(session, (name) =>
    name.includes("seccion de vivo"),
  );

  const colorAttributes = session.attributes.filter((attribute) =>
    normalize(attribute.name).includes("color de vivo"),
  );

  if (!sectionAttribute) {
    return [];
  }

  const enabledSections = getSelectedOptions(sectionAttribute, selectedValueIds);

  if (enabledSections.length === 0) {
    return [];
  }

  const globalColor = findSelectedValue(colorAttributes[0], selectedValueIds);

  return enabledSections.map((section) => {
    const matchingColorAttribute = colorAttributes.find((attribute) =>
      normalize(attribute.name).includes(normalize(section.name)),
    );
    const sectionColor =
      findSelectedValue(matchingColorAttribute, selectedValueIds) ?? globalColor;

    return {
      key: normalize(section.name).replace(/[^a-z0-9]+/g, "-"),
      label: section.name,
      colorHex: sectionColor?.colorHex ?? "#1d4ed8",
    };
  });
}

export function deriveConfiguratorUi(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
): ConfiguratorUiModel {
  const groups = session.attributes.map((attribute) => ({
    attributeId: attribute.id,
    label: attribute.name,
    helpText: getHelpText(attribute.name),
    controlType: getControlType(attribute, session),
    selectionMode: attribute.selectionMode,
      options: attribute.values.map((value) => ({
        id: value.id,
        name: value.name,
        ...(value.colorHex ? { colorHex: value.colorHex } : {}),
        ...(getImageSource(session.graphicManifestKey, attribute.name, value.name)
          ? {
              imageSrc: getImageSource(
                session.graphicManifestKey,
                attribute.name,
                value.name,
              ),
            }
          : {}),
      })),
    }));

  const colorAttribute = findAttributeByName(session, (name) =>
    name === "color" || name.includes("color de tela base") || name.includes("tela base"),
  );
  const neckAttribute = findAttributeByName(session, (name) =>
    name.includes("modelo de cuello"),
  );
  const lowerPocketModelAttribute = findAttributeByName(session, (name) =>
    name.includes("modelo bolsillo inferior"),
  );
  const auxiliaryPocketModelAttribute = findAttributeByName(session, (name) =>
    name.includes("modelo bolsillo auxiliar"),
  );
  const chestPocketTypeAttribute = findAttributeByName(
    session,
    (name) => name.includes("bolsillo de pecho") && !name.includes("bordado"),
  );

  const selectedColor = findSelectedValue(colorAttribute, selectedValueIds);
  const selectedNeck = findSelectedValue(neckAttribute, selectedValueIds);
  const selectedLowerPocketModel = findSelectedValue(
    lowerPocketModelAttribute,
    selectedValueIds,
  );
  const selectedAuxiliaryPocketModel = findSelectedValue(
    auxiliaryPocketModelAttribute,
    selectedValueIds,
  );
  const selectedChestPocketType = findSelectedValue(
    chestPocketTypeAttribute,
    selectedValueIds,
  );

  const summary = session.attributes.flatMap((attribute) => {
    const selected = getSelectedOptions(attribute, selectedValueIds);

    if (selected.length === 0) {
      return [];
    }

    return [
      {
        label: attribute.name,
        value: selected.map((value) => value.name).join(", "),
      },
    ];
  });

  return {
    groups,
    summary,
    previewScene: {
      productName: session.productName,
      baseColorHex: selectedColor?.colorHex ?? "#d8dee9",
      neckImageSrc: selectedNeck
        ? getImageSource(session.graphicManifestKey, neckAttribute?.name ?? "", selectedNeck.name)
        : undefined,
      lowerPocketImageSrc: selectedLowerPocketModel
        ? getImageSource(
            session.graphicManifestKey,
            lowerPocketModelAttribute?.name ?? "",
            selectedLowerPocketModel.name,
          )
        : undefined,
      auxiliaryPocketImageSrc: selectedAuxiliaryPocketModel
        ? getImageSource(
            session.graphicManifestKey,
            auxiliaryPocketModelAttribute?.name ?? "",
            selectedAuxiliaryPocketModel.name,
          )
        : undefined,
      chestPocketType: selectedChestPocketType?.name,
      trimSections: getSelectedTrimSections(session, selectedValueIds),
    },
  };
}

export function computeDisabledValueIds(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const selected = new Set<number>(
    Object.values(selectedValueIds).flatMap((valueIds) => valueIds),
  );
  const disabled = new Set<number>();

  for (const rule of session.exclusions) {
    if (selected.has(rule.sourceValueId) && !selected.has(rule.excludedValueId)) {
      disabled.add(rule.excludedValueId);
    }
  }

  return disabled;
}
