import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { matchesVisualAssetAttributeId } from "@repo/shared/visual-assets";
import {
  getLowerPocketLayout,
  type LowerPocketLayout,
} from "@repo/shared/lower-pocket-rules";
import {
  getDefaultChestPocketImageSource,
  getDefaultImageSource,
  getBootImageSourceForValue,
  getGarmentDetailImageSourceForValue,
  getImageSourceForValue,
  getProductAssetCatalog,
  getWaistbandImageSourceForValue,
} from "./asset-catalog";

export type UiOption = {
  id: number;
  name: string;
  colorHex?: string | undefined;
  imageSrc?: string | undefined;
  allowsCustomValue?: boolean | undefined;
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
  garmentImageSrc?: string | undefined;
  garmentDetailImageSrc?: string | undefined;
  bootImageSrc?: string | undefined;
  waistbandImageSrc?: string | undefined;
  pantsSidePocketType?: "doubleZipper" | undefined;
  neckImageSrc?: string | undefined;
  lowerPocketImageSrc?: string | undefined;
  lowerPocketLayout: LowerPocketLayout;
  auxiliaryPocketImageSrc?: string | undefined;
  chestPocketType?: string | undefined;
  chestPocketImageSrc?: string | undefined;
  logoMarker?: {
    placement: string;
  } | undefined;
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

export type ConfiguratorUiModel = {
  groups: UiAttributeGroup[];
  summary: Array<{ label: string; value: string }>;
  previewScene: PreviewScene;
  logoSelection?: {
    attributeId: number;
    valueIds: number[];
    label: string;
  } | undefined;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function getSelectedOptions(
  attribute: ConfiguratorSession["attributes"][number] | undefined,
  selectedValueIds: Record<string, number[]>,
) {
  if (!attribute) {
    return [];
  }

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
  attribute: ConfiguratorSession["attributes"][number],
  value: ConfiguratorSession["attributes"][number]["values"][number],
) {
  return getImageSourceForValue(
    graphicManifestKey,
    attribute.id,
    value.id,
    attribute.name,
    value.name,
  );
}

function getOptionImageSource(
  graphicManifestKey: string,
  attribute: ConfiguratorSession["attributes"][number],
  value: ConfiguratorSession["attributes"][number]["values"][number],
) {
  return (
    value.optionImageSrc ??
    getImageSource(graphicManifestKey, attribute, value)
  );
}

function getControlType(
  attribute: ConfiguratorSession["attributes"][number],
  session: ConfiguratorSession,
): UiAttributeGroup["controlType"] {
  if (attribute.values.some((value) => value.colorHex)) {
    return "color";
  }

  if (
    attribute.displayType === "image" ||
    attribute.values.some((value) =>
      Boolean(getOptionImageSource(session.graphicManifestKey, attribute, value)),
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

function matchesCatalogAttribute(
  catalog: ReturnType<typeof getProductAssetCatalog>,
  key: Parameters<typeof matchesVisualAssetAttributeId>[1],
  attribute: ConfiguratorSession["attributes"][number],
) {
  return catalog
    ? matchesVisualAssetAttributeId(catalog, key, attribute.id)
    : false;
}

function getSelectedTrimSections(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const catalog = getProductAssetCatalog(session.graphicManifestKey);
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
      | PreviewScene["trimSections"][number]["role"]
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

function isPantsSidePocketAttributeName(normalizedName: string) {
  return (
    normalizedName === "lateral" ||
    normalizedName === "internos" ||
    (normalizedName.includes("bolsillo") && normalizedName.includes("lateral"))
  );
}

function isDoubleZipperSidePocket(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return normalized.includes("doble") && normalized.includes("cremallera");
}

export function deriveConfiguratorUi(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
): ConfiguratorUiModel {
  const catalog = getProductAssetCatalog(session.graphicManifestKey);
  const groups = session.attributes.map((attribute) => ({
    attributeId: attribute.id,
    label: attribute.name,
    helpText: getHelpText(attribute.name),
    controlType: getControlType(attribute, session),
    selectionMode: attribute.selectionMode,
    options: attribute.values.map((value) => {
      const imageSrc = getOptionImageSource(
        session.graphicManifestKey,
        attribute,
        value,
      );

      return {
        id: value.id,
        name: value.name,
        allowsCustomValue: Boolean(value.allowsCustomValue),
        ...(value.colorHex ? { colorHex: value.colorHex } : {}),
        ...(imageSrc ? { imageSrc } : {}),
      };
    }),
  }));

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
  const waistbandModelAttribute =
    session.attributes.find(
      (attribute) => matchesCatalogAttribute(catalog, "waistbandModel", attribute),
    ) ??
    findAttributeByName(
      session,
      (name) =>
        name.includes("cinturilla") ||
        name.includes("pretina") ||
        name.includes("modelo de cintura") ||
        name.includes("modelo cintura"),
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
  const pantsSidePocketAttribute = findAttributeByName(
    session,
    isPantsSidePocketAttributeName,
  );

  const selectedColor = findSelectedValue(colorAttribute, selectedValueIds);
  const selectedGarment = findSelectedValue(garmentAttribute, selectedValueIds);
  const selectedBootModel = findSelectedValue(
    bootModelAttribute,
    selectedValueIds,
  );
  const selectedWaistbandModel = findSelectedValue(
    waistbandModelAttribute,
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
  const selectedLogoOptions = getSelectedOptions(logoAttribute, selectedValueIds);
  const activeLogoOptions = selectedLogoOptions.filter(
    (option) => !isNoLogo(option.name),
  );
  const selectedPantsSidePocketOptions = getSelectedOptions(
    pantsSidePocketAttribute,
    selectedValueIds,
  );
  const pantsSidePocketType = selectedPantsSidePocketOptions.some((option) =>
    isDoubleZipperSidePocket(option.name),
  )
    ? "doubleZipper"
    : undefined;
  const hasLogoSelection = activeLogoOptions.length > 0;
  const lowerPocketLayout = getLowerPocketLayout(session, selectedValueIds);
  const garmentImageSrc = selectedGarment
    ? getImageSource(session.graphicManifestKey, garmentAttribute!, selectedGarment) ??
      getDefaultImageSource(session.graphicManifestKey)
    : getDefaultImageSource(session.graphicManifestKey);
  const garmentDetailImageSrc = selectedGarment
    ? getGarmentDetailImageSourceForValue(
        session.graphicManifestKey,
        garmentAttribute!.id,
        selectedGarment.id,
        garmentAttribute!.name,
        selectedGarment.name,
      )
    : undefined;
  const bootImageSrc = selectedBootModel
    ? getBootImageSourceForValue(
        session.graphicManifestKey,
        bootModelAttribute!.id,
        selectedBootModel.id,
        bootModelAttribute!.name,
        selectedBootModel.name,
      )
    : undefined;
  const waistbandImageSrc = selectedWaistbandModel
    ? getWaistbandImageSourceForValue(
        session.graphicManifestKey,
        waistbandModelAttribute!.id,
        selectedWaistbandModel.id,
        waistbandModelAttribute!.name,
        selectedWaistbandModel.name,
      )
    : undefined;
  const neckImageSrc = selectedNeck
    ? getImageSource(session.graphicManifestKey, neckAttribute!, selectedNeck)
    : undefined;
  const lowerPocketImageSrc =
    lowerPocketLayout !== "none" && selectedLowerPocketModel
      ? getImageSource(
          session.graphicManifestKey,
          lowerPocketModelAttribute!,
          selectedLowerPocketModel,
        )
      : undefined;

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
      garmentImageSrc,
      ...(garmentDetailImageSrc ? { garmentDetailImageSrc } : {}),
      ...(bootImageSrc ? { bootImageSrc } : {}),
      ...(waistbandImageSrc ? { waistbandImageSrc } : {}),
      ...(pantsSidePocketType ? { pantsSidePocketType } : {}),
      neckImageSrc,
      lowerPocketImageSrc,
      lowerPocketLayout,
      auxiliaryPocketImageSrc: selectedAuxiliaryPocketModel
        ? getImageSource(
            session.graphicManifestKey,
            auxiliaryPocketModelAttribute!,
            selectedAuxiliaryPocketModel,
          )
        : undefined,
      chestPocketType: selectedChestPocketType?.name,
      chestPocketImageSrc:
        selectedChestPocketModel &&
        !isNoChestPocket(selectedChestPocketModel.name) &&
        isVisibleChestPocketModel(selectedChestPocketModel.name)
          ? getImageSource(
              session.graphicManifestKey,
              chestPocketModelAttribute!,
              selectedChestPocketModel,
            ) ?? getDefaultChestPocketImageSource(session.graphicManifestKey)
          : undefined,
      logoMarker: hasLogoSelection
        ? { placement: activeLogoOptions.map((option) => option.name).join(", ") }
        : undefined,
      trimSections: getSelectedTrimSections(session, selectedValueIds),
    },
    logoSelection:
      logoAttribute && hasLogoSelection
        ? {
            attributeId: logoAttribute.id,
            valueIds: activeLogoOptions.map((option) => option.id),
            label: activeLogoOptions.map((option) => option.name).join(", "),
          }
        : undefined,
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
