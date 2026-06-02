import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { matchesVisualAssetAttributeId } from "@repo/shared/visual-assets";
import {
  getLowerPocketLayout,
  type LowerPocketLayout,
} from "@repo/shared/lower-pocket-rules";
import {
  getServerDefaultAssetPath,
  getServerDefaultChestPocketAssetPath,
  getServerAssetPathForValue,
  getServerBootAssetPathForValue,
  getServerGarmentDetailAssetPathForValue,
  getServerProductAssetCatalog,
} from "./server-asset-catalog.js";

export type AutomationRenderScene = {
  productName: string;
  baseColorHex: string;
  garmentAssetPath?: string;
  garmentDetailAssetPath?: string;
  bootAssetPath?: string;
  neckAssetPath?: string;
  lowerPocketAssetPath?: string;
  lowerPocketLayout: LowerPocketLayout;
  auxiliaryPocketAssetPath?: string;
  chestPocketType?: string;
  chestPocketAssetPath?: string;
  logoMarker?: {
    placement: string;
  };
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

function matchesCatalogAttribute(
  catalog: ReturnType<typeof getServerProductAssetCatalog>,
  key: Parameters<typeof matchesVisualAssetAttributeId>[1],
  attribute: ConfiguratorSession["attributes"][number],
) {
  return catalog
    ? matchesVisualAssetAttributeId(catalog, key, attribute.id)
    : false;
}

function getAssetPath(
  session: ConfiguratorSession,
  attribute: ConfiguratorSession["attributes"][number],
  value: ConfiguratorSession["attributes"][number]["values"][number],
) {
  return getServerAssetPathForValue(
    session.graphicManifestKey,
    attribute.id,
    value.id,
    attribute.name,
    value.name,
  );
}

function isVisibleChestPocketModel(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return !isNoChestPocket(normalized);
}

function isNoChestPocket(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return (
    normalized.includes("ninguno") ||
    normalized.includes("sin bolsillo") ||
    normalized === "no"
  );
}

function isNoLogo(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return (
    normalized.includes("sin logo") ||
    normalized.includes("sin seleccion") ||
    normalized === "no"
  );
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
      (attribute) =>
        matchesCatalogAttribute(catalog, "trimSections", attribute),
    ) ??
    findAttributeByName(session, (name) => name.includes("seccion de vivo"));

  const colorAttributes = session.attributes.filter(
    (attribute) =>
      matchesCatalogAttribute(catalog, "trimColor", attribute) ||
      normalize(attribute.name).includes("color de vivo"),
  );
  const globalColor = findSelectedValue(colorAttributes[0], selectedValueIds);

  const enabledSections = sectionAttribute
    ? getSelectedOptions(sectionAttribute, selectedValueIds)
    : [];
  const roleEntries = Object.entries(catalog?.trimSectionValueIds ?? {});

  function resolveTrimRole(section: ConfiguratorSession["attributes"][number]["values"][number]) {
    const configuredRole = roleEntries.find(([, valueId]) => valueId === section.id)?.[0] as
      | AutomationRenderScene["trimSections"][number]["role"]
      | undefined;

    if (configuredRole) {
      return configuredRole;
    }

    const normalizedSection = normalize(section.name);

    if (normalizedSection === "cogotera") {
      return "backNeck";
    }

    if (
      normalizedSection === "cuello" ||
      normalizedSection.includes("cuello alto") ||
      normalizedSection.includes("cuello completo") ||
      normalizedSection.includes("cuello borde dividido superior")
    ) {
      return "upperNeck";
    }

    if (
      normalizedSection.includes("cuello bajo") ||
      normalizedSection.includes("cuello inferior") ||
      normalizedSection.includes("cuello borde dividido inferior")
    ) {
      return "lowerNeck";
    }

    if (normalizedSection.includes("bolsillo pecho")) {
      return "chestPocket";
    }

    if (normalizedSection.includes("bolsillos inferiores parte superior")) {
      return "lowerPockets";
    }

    if (normalizedSection.includes("bolsillo auxiliar")) {
      return "auxiliaryPocket";
    }

    if (normalizedSection.includes("sin vivos")) {
      return "none";
    }

    return undefined;
  }

  const hasNoTrimSelection = enabledSections.some((section) => {
    const role = resolveTrimRole(section);
    const normalizedSection = normalize(section.name);

    return (
      role === "none" ||
      normalizedSection === "sin vivos" ||
      normalizedSection === "sin cuello" ||
      normalizedSection === "sin cuellos"
    );
  });

  if (hasNoTrimSelection) {
    return [];
  }

  const selectedSections =
    !sectionAttribute || enabledSections.length === 0
      ? []
      : enabledSections.map((section) => {
          const matchingColorAttribute = colorAttributes.find((attribute) =>
            normalize(attribute.name).includes(normalize(section.name)),
          );
          const sectionColor =
            findSelectedValue(matchingColorAttribute, selectedValueIds) ??
            globalColor;
          const role = resolveTrimRole(section);

          return {
            valueId: section.id,
            ...(role ? { role } : {}),
            key: normalize(section.name).replace(/[^a-z0-9]+/g, "-"),
            label: section.name,
            colorHex: sectionColor?.colorHex ?? "#1d4ed8",
          };
        });

  return selectedSections;
}

export function deriveAutomationRenderScene(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
): AutomationRenderScene {
  const catalog = getServerProductAssetCatalog(session.graphicManifestKey);
  const colorAttribute =
    session.attributes.find(
      (attribute) => matchesCatalogAttribute(catalog, "baseColor", attribute),
    ) ??
    findAttributeByName(session, (name) =>
      name === "color" ||
      (name.includes("color") && !name.includes("vivo")) ||
      name.includes("color de tela base") ||
      name.includes("tela base"),
    );
  const neckAttribute =
    session.attributes.find(
      (attribute) => matchesCatalogAttribute(catalog, "neckModel", attribute),
    ) ??
    findAttributeByName(session, (name) => name.includes("modelo de cuello"));
  const garmentAttribute =
    session.attributes.find(
      (attribute) => matchesCatalogAttribute(catalog, "garmentModel", attribute),
    ) ??
    findAttributeByName(session, (name) =>
      name.includes("modelo de blusa") ||
      name.includes("modelo de pantalon") ||
      name.includes("modelo pantalon"),
    );
  const bootModelAttribute =
    session.attributes.find(
      (attribute) => matchesCatalogAttribute(catalog, "bootModel", attribute),
    ) ??
    findAttributeByName(
      session,
      (name) =>
        name.includes("tipo bota") ||
        name.includes("tipo de bota") ||
        name.includes("modelo bota") ||
        name.includes("modelo de bota"),
    );
  const lowerPocketModelAttribute =
    session.attributes.find(
      (attribute) =>
        matchesCatalogAttribute(catalog, "lowerPocketModel", attribute),
    ) ??
    findAttributeByName(session, (name) =>
      name.includes("modelo bolsillo inferior") ||
      (name.includes("bolsillo inferior") && !name.includes("tipo")),
    );
  const auxiliaryPocketModelAttribute =
    session.attributes.find(
      (attribute) =>
        matchesCatalogAttribute(catalog, "auxiliaryPocketModel", attribute),
    ) ??
    findAttributeByName(session, (name) =>
      name.includes("modelo bolsillo auxiliar"),
    );
  const chestPocketTypeAttribute = findAttributeByName(
    session,
    (name) => name.includes("bolsillo de pecho") && !name.includes("bordado"),
  );
  const chestPocketModelAttribute =
    session.attributes.find(
      (attribute) =>
        matchesCatalogAttribute(catalog, "chestPocketModel", attribute),
    ) ??
    findAttributeByName(
      session,
      (name) =>
        name.includes("modelo") &&
        name.includes("bolsillo") &&
        name.includes("pecho"),
    );
  const logoAttribute = findAttributeByName(
    session,
    (name) => name === "logo" || name.includes("logo"),
  );

  const selectedColor = findSelectedValue(colorAttribute, selectedValueIds);
  const selectedGarment = findSelectedValue(garmentAttribute, selectedValueIds);
  const selectedBootModel = findSelectedValue(
    bootModelAttribute,
    selectedValueIds,
  );
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
  const selectedChestPocketModel = findSelectedValue(
    chestPocketModelAttribute,
    selectedValueIds,
  );
  const activeLogoOptions = getSelectedOptions(
    logoAttribute,
    selectedValueIds,
  ).filter((option) => !isNoLogo(option.name));
  const lowerPocketLayout = getLowerPocketLayout(session, selectedValueIds);
  const garmentAssetPath = selectedGarment
    ? getAssetPath(session, garmentAttribute!, selectedGarment) ??
      getServerDefaultAssetPath(session.graphicManifestKey)
    : getServerDefaultAssetPath(session.graphicManifestKey);
  const garmentDetailAssetPath = selectedGarment
    ? getServerGarmentDetailAssetPathForValue(
        session.graphicManifestKey,
        garmentAttribute!.id,
        selectedGarment.id,
        garmentAttribute!.name,
        selectedGarment.name,
      )
    : undefined;
  const bootAssetPath = selectedBootModel
    ? getServerBootAssetPathForValue(
        session.graphicManifestKey,
        bootModelAttribute!.id,
        selectedBootModel.id,
        bootModelAttribute!.name,
        selectedBootModel.name,
      )
    : undefined;
  const neckAssetPath = selectedNeck
    ? getAssetPath(session, neckAttribute!, selectedNeck)
    : undefined;
  const lowerPocketAssetPath = selectedLowerPocketModel
    ? getAssetPath(session, lowerPocketModelAttribute!, selectedLowerPocketModel)
    : undefined;
  const auxiliaryPocketAssetPath = selectedAuxiliaryPocketModel
    ? getAssetPath(session, auxiliaryPocketModelAttribute!, selectedAuxiliaryPocketModel)
    : undefined;
  const chestPocketAssetPath =
    selectedChestPocketModel &&
    !isNoChestPocket(selectedChestPocketModel.name) &&
    isVisibleChestPocketModel(selectedChestPocketModel.name)
      ? getAssetPath(session, chestPocketModelAttribute!, selectedChestPocketModel) ??
        getServerDefaultChestPocketAssetPath(session.graphicManifestKey)
      : undefined;

  return {
    productName: session.productName,
    baseColorHex: selectedColor?.colorHex ?? "#d8dee9",
    ...(garmentAssetPath ? { garmentAssetPath } : {}),
    ...(garmentDetailAssetPath ? { garmentDetailAssetPath } : {}),
    ...(bootAssetPath ? { bootAssetPath } : {}),
    ...(neckAssetPath ? { neckAssetPath } : {}),
    ...(lowerPocketLayout !== "none" && lowerPocketAssetPath
      ? { lowerPocketAssetPath }
      : {}),
    lowerPocketLayout,
    ...(auxiliaryPocketAssetPath ? { auxiliaryPocketAssetPath } : {}),
    ...(selectedChestPocketType?.name
      ? { chestPocketType: selectedChestPocketType.name }
      : {}),
    ...(chestPocketAssetPath ? { chestPocketAssetPath } : {}),
    ...(activeLogoOptions.length > 0
      ? {
          logoMarker: {
            placement: activeLogoOptions.map((option) => option.name).join(", "),
          },
        }
      : {}),
    trimSections: getSelectedTrimSections(session, selectedValueIds),
  };
}
