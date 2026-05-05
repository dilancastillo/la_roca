import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import {
  getLowerPocketLayout,
  type LowerPocketLayout,
} from "@repo/shared/lower-pocket-rules";
import {
  getServerDefaultAssetPath,
  getServerAssetPathByIds,
  getServerProductAssetCatalog,
} from "./server-asset-catalog.js";

export type AutomationRenderScene = {
  productName: string;
  baseColorHex: string;
  garmentAssetPath?: string;
  neckAssetPath?: string;
  lowerPocketAssetPath?: string;
  lowerPocketLayout: LowerPocketLayout;
  auxiliaryPocketAssetPath?: string;
  chestPocketType?: string;
  trimSections: Array<{
    valueId: number;
    role?:
      | "backNeck"
      | "upperNeck"
      | "lowerNeck"
      | "chestPocket"
      | "lowerPockets"
      | "auxiliaryPocket"
      | "none";
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

function getSelectedTrimSections(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const catalog = getServerProductAssetCatalog(session.graphicManifestKey);
  const sectionAttribute =
    session.attributes.find(
      (attribute) => attribute.id === catalog?.attributeIds.trimSections,
    ) ??
    findAttributeByName(session, (name) => name.includes("seccion de vivo"));

  const colorAttributes = session.attributes.filter(
    (attribute) =>
      attribute.id === catalog?.attributeIds.trimColor ||
      normalize(attribute.name).includes("color de vivo"),
  );

  if (!sectionAttribute) {
    return [];
  }

  const enabledSections = getSelectedOptions(sectionAttribute, selectedValueIds);
  const roleEntries = Object.entries(catalog?.trimSectionValueIds ?? {});

  if (enabledSections.length === 0) {
    return [];
  }

  const hasNoTrimSelection = enabledSections.some((section) => {
    const role = roleEntries.find(([, valueId]) => valueId === section.id)?.[0];

    return role === "none" || normalize(section.name) === "sin vivos";
  });

  if (hasNoTrimSelection) {
    return [];
  }

  const globalColor = findSelectedValue(colorAttributes[0], selectedValueIds);

  return enabledSections.map((section) => {
    const matchingColorAttribute = colorAttributes.find((attribute) =>
      normalize(attribute.name).includes(normalize(section.name)),
    );
    const sectionColor =
      findSelectedValue(matchingColorAttribute, selectedValueIds) ?? globalColor;
    const role = roleEntries.find(([, valueId]) => valueId === section.id)?.[0] as
      | AutomationRenderScene["trimSections"][number]["role"]
      | undefined;

    return {
      valueId: section.id,
      ...(role ? { role } : {}),
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
  const catalog = getServerProductAssetCatalog(session.graphicManifestKey);
  const colorAttribute =
    session.attributes.find(
      (attribute) => attribute.id === catalog?.attributeIds.baseColor,
    ) ??
    findAttributeByName(session, (name) =>
      name === "color" ||
      name.includes("color de tela base") ||
      name.includes("tela base"),
    );
  const neckAttribute =
    session.attributes.find(
      (attribute) => attribute.id === catalog?.attributeIds.neckModel,
    ) ??
    findAttributeByName(session, (name) => name.includes("modelo de cuello"));
  const garmentAttribute =
    session.attributes.find(
      (attribute) => attribute.id === catalog?.attributeIds.garmentModel,
    ) ??
    findAttributeByName(session, (name) =>
      name.includes("modelo de pantalon") ||
      name.includes("modelo pantalon"),
    );
  const lowerPocketModelAttribute =
    session.attributes.find(
      (attribute) => attribute.id === catalog?.attributeIds.lowerPocketModel,
    ) ??
    findAttributeByName(session, (name) =>
      name.includes("modelo bolsillo inferior"),
    );
  const auxiliaryPocketModelAttribute =
    session.attributes.find(
      (attribute) => attribute.id === catalog?.attributeIds.auxiliaryPocketModel,
    ) ??
    findAttributeByName(session, (name) =>
      name.includes("modelo bolsillo auxiliar"),
    );
  const chestPocketTypeAttribute = findAttributeByName(
    session,
    (name) => name.includes("bolsillo de pecho") && !name.includes("bordado"),
  );

  const selectedColor = findSelectedValue(colorAttribute, selectedValueIds);
  const selectedGarment = findSelectedValue(garmentAttribute, selectedValueIds);
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
  const lowerPocketLayout = getLowerPocketLayout(session, selectedValueIds);
  const garmentAssetPath = selectedGarment
    ? getServerAssetPathByIds(
        session.graphicManifestKey,
        garmentAttribute?.id ?? 0,
        selectedGarment.id,
      ) ?? getServerDefaultAssetPath(session.graphicManifestKey)
    : getServerDefaultAssetPath(session.graphicManifestKey);
  const neckAssetPath = selectedNeck
    ? getServerAssetPathByIds(
        session.graphicManifestKey,
        neckAttribute?.id ?? 0,
        selectedNeck.id,
      )
    : undefined;
  const lowerPocketAssetPath = selectedLowerPocketModel
    ? getServerAssetPathByIds(
        session.graphicManifestKey,
        lowerPocketModelAttribute?.id ?? 0,
        selectedLowerPocketModel.id,
      )
    : undefined;
  const auxiliaryPocketAssetPath = selectedAuxiliaryPocketModel
    ? getServerAssetPathByIds(
        session.graphicManifestKey,
        auxiliaryPocketModelAttribute?.id ?? 0,
        selectedAuxiliaryPocketModel.id,
      )
    : undefined;

  return {
    productName: session.productName,
    baseColorHex: selectedColor?.colorHex ?? "#d8dee9",
    ...(garmentAssetPath ? { garmentAssetPath } : {}),
    ...(neckAssetPath ? { neckAssetPath } : {}),
    ...(lowerPocketLayout !== "none" && lowerPocketAssetPath
      ? { lowerPocketAssetPath }
      : {}),
    lowerPocketLayout,
    ...(auxiliaryPocketAssetPath ? { auxiliaryPocketAssetPath } : {}),
    ...(selectedChestPocketType?.name
      ? { chestPocketType: selectedChestPocketType.name }
      : {}),
    trimSections: getSelectedTrimSections(session, selectedValueIds),
  };
}
