import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { getServerProductAssetCatalog } from "./server-asset-catalog.js";

export type AutomationRenderScene = {
  productName: string;
  baseColorHex: string;
  neckAssetPath?: string;
  lowerPocketAssetPath?: string;
  auxiliaryPocketAssetPath?: string;
  chestPocketType?: string;
  trimSections: Array<{
    key: string;
    label: string;
    colorHex: string;
  }>;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
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

function getSelectedOptions(
  attribute: ConfiguratorSession["attributes"][number] | undefined,
  selectedValueIds: Record<string, number[]>,
) {
  if (!attribute) {
    return [];
  }

  const selectedIds = new Set(selectedValueIds[String(attribute.id)] ?? []);
  return attribute.values.filter((value) => selectedIds.has(value.id));
}

function getAssetPath(
  graphicManifestKey: string,
  attributeName: string,
  valueName: string,
) {
  const catalog = getServerProductAssetCatalog(graphicManifestKey);

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

export function deriveAutomationRenderScene(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
): AutomationRenderScene {
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
  const neckAssetPath = selectedNeck
    ? getAssetPath(session.graphicManifestKey, neckAttribute?.name ?? "", selectedNeck.name)
    : undefined;
  const lowerPocketAssetPath = selectedLowerPocketModel
    ? getAssetPath(
        session.graphicManifestKey,
        lowerPocketModelAttribute?.name ?? "",
        selectedLowerPocketModel.name,
      )
    : undefined;
  const auxiliaryPocketAssetPath = selectedAuxiliaryPocketModel
    ? getAssetPath(
        session.graphicManifestKey,
        auxiliaryPocketModelAttribute?.name ?? "",
        selectedAuxiliaryPocketModel.name,
      )
    : undefined;

  return {
    productName: session.productName,
    baseColorHex: selectedColor?.colorHex ?? "#d8dee9",
    ...(neckAssetPath ? { neckAssetPath } : {}),
    ...(lowerPocketAssetPath ? { lowerPocketAssetPath } : {}),
    ...(auxiliaryPocketAssetPath ? { auxiliaryPocketAssetPath } : {}),
    ...(selectedChestPocketType?.name
      ? { chestPocketType: selectedChestPocketType.name }
      : {}),
    trimSections: getSelectedTrimSections(session, selectedValueIds),
  };
}
