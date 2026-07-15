import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import { matchesVisualAssetAttributeId } from "@repo/shared/visual-assets";
import {
  getLowerPocketAuxiliaryAddon,
  getLowerPocketLayout,
  getLowerPocketTypeAttribute,
  type LowerPocketAuxiliaryAddonKind,
  type LowerPocketAuxiliaryAddonSide,
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
  category?: string | undefined;
  helpText?: string | undefined;
  controlType: "color" | "image" | "chips";
  selectionMode: "single" | "multiple";
  options: UiOption[];
};

export type PreviewScene = {
  productName: string;
  baseColorHex: string;
  uniformParts?: {
    blouse: PreviewScene;
    pants: PreviewScene;
  };
  garmentImageSrc?: string | undefined;
  garmentDetailImageSrc?: string | undefined;
  garmentDetailImageSrcs?: string[] | undefined;
  bootImageSrc?: string | undefined;
  waistbandImageSrc?: string | undefined;
  pantsSidePocketType?: "doubleZipper" | "asorsalud" | undefined;
  pantsKneePatchRightModel?:
    | "square"
    | "camouflage"
    | "point"
    | "internal"
    | "ribete"
    | "triangularFlap"
    | undefined;
  pantsKneePatchRightType?:
    | "snap"
    | "overlaid"
    | "button"
    | "doubleButton"
    | "velcro"
    | "buckle"
    | "penSeam"
    | "plain"
    | "zipper"
    | "horizontalZipper"
    | "verticalZipper"
    | undefined;
  pantsKneePatchLeftModel?:
    | "square"
    | "camouflage"
    | "point"
    | "internal"
    | "ribete"
    | "triangularFlap"
    | undefined;
  pantsKneePatchLeftType?:
    | "snap"
    | "overlaid"
    | "button"
    | "doubleButton"
    | "velcro"
    | "buckle"
    | "penSeam"
    | "plain"
    | "zipper"
    | "horizontalZipper"
    | "verticalZipper"
    | undefined;
  neckImageSrc?: string | undefined;
  lowerPocketImageSrc?: string | undefined;
  lowerPocketLayout: LowerPocketLayout;
  lowerPocketAuxiliaryAddonKind?: LowerPocketAuxiliaryAddonKind | undefined;
  lowerPocketAuxiliaryAddonSide?: LowerPocketAuxiliaryAddonSide | undefined;
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

const UNIFORME_PRODUCT_TEMPLATE_ID = 7;

function isUniformeSession(session: ConfiguratorSession) {
  return (
    session.productTemplateId === UNIFORME_PRODUCT_TEMPLATE_ID ||
    normalize(session.graphicManifestKey) === "uniforme"
  );
}

function getUniformAttributeCategory(attributeName: string) {
  const normalized = normalize(attributeName);

  if (
    normalized === "material" ||
    normalized === "color" ||
    normalized === "genero" ||
    normalized.includes("observaciones") ||
    normalized.includes("logo")
  ) {
    return "Base";
  }

  if (
    normalized.includes("pantalon") ||
    normalized.includes("bota") ||
    normalized.includes("cinturilla") ||
    normalized.includes("pretina") ||
    normalized.includes("rodilla") ||
    normalized.includes("trasero") ||
    normalized.includes("forrado") ||
    normalized.includes("forro")
  ) {
    return "Pantalon";
  }

  if (normalized.includes("seccion de vivo") || normalized.includes("vivo")) {
    return "Vivos";
  }

  return "Blusa";
}

function getPartColorHex(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
  part: "blouse" | "pants",
) {
  const partColorAttribute = findAttributeByName(session, (name) =>
    part === "blouse"
      ? name.includes("color blusa") || name.includes("color de blusa")
      : name.includes("color pantalon") || name.includes("color de pantalon"),
  );
  const selectedPartColor = findSelectedValue(partColorAttribute, selectedValueIds);

  return selectedPartColor?.colorHex;
}

type PreviewTrimSection = PreviewScene["trimSections"][number];

function getUniformTrimSectionText(section: PreviewTrimSection) {
  return normalize(`${section.key} ${section.label}`);
}

function isPantsUniformTrimSection(section: PreviewTrimSection) {
  const normalized = getUniformTrimSectionText(section);

  return (
    normalized.includes("pantalon") ||
    normalized.includes("bota") ||
    normalized.includes("pretina") ||
    normalized.includes("cinturilla") ||
    normalized.includes("rodilla") ||
    normalized.includes("trasero") ||
    normalized.includes("forrado") ||
    normalized.includes("forro") ||
    normalized.includes("bolsillo lateral")
  );
}

function isBlouseUniformTrimSection(section: PreviewTrimSection) {
  const normalized = getUniformTrimSectionText(section);

  return (
    section.role === "backNeck" ||
    section.role === "upperNeck" ||
    section.role === "lowerNeck" ||
    section.role === "chestPocket" ||
    section.role === "lowerPockets" ||
    section.role === "auxiliaryPocket" ||
    normalized.includes("cogotera") ||
    normalized.includes("cuello") ||
    normalized.includes("manga") ||
    normalized.includes("presilla") ||
    normalized.includes("pespunte") ||
    normalized.includes("bolsillo pecho") ||
    normalized.includes("bolsillo de pecho") ||
    normalized.includes("bolsillos inferiores") ||
    normalized.includes("bolsillo inferior") ||
    normalized.includes("bolsillo auxiliar") ||
    normalized.includes("cremallera") ||
    normalized.includes("aletas")
  );
}

function getUniformBlouseTrimSections(sections: PreviewTrimSection[]) {
  return sections.filter(
    (section) =>
      isBlouseUniformTrimSection(section) && !isPantsUniformTrimSection(section),
  );
}

function getUniformPantsTrimSections(sections: PreviewTrimSection[]) {
  return sections.filter(isPantsUniformTrimSection);
}

function removePantsKneePatchFromUniformBlouseScene(scene: PreviewScene) {
  const blouseScene: PreviewScene = {
    ...scene,
    trimSections: getUniformBlouseTrimSections(scene.trimSections),
  };

  delete blouseScene.pantsKneePatchRightModel;
  delete blouseScene.pantsKneePatchRightType;
  delete blouseScene.pantsKneePatchLeftModel;
  delete blouseScene.pantsKneePatchLeftType;

  return blouseScene;
}

function keepOnlyPantsTrimSectionsForUniformScene(scene: PreviewScene) {
  return {
    ...scene,
    trimSections: getUniformPantsTrimSections(scene.trimSections),
  };
}

function isPantsSidePocketUniformTrimSection(section: PreviewTrimSection) {
  const normalized = getUniformTrimSectionText(section);

  return (
    normalized.includes("bolsillo lateral de pantalon") ||
    (normalized.includes("bolsillo lateral") && normalized.includes("pantalon"))
  );
}

function ensureUniformPantsSidePocketForTrim(scene: PreviewScene): PreviewScene {
  if (
    scene.pantsSidePocketType ||
    !scene.trimSections.some(isPantsSidePocketUniformTrimSection)
  ) {
    return scene;
  }

  return {
    ...scene,
    pantsSidePocketType: "doubleZipper",
  };
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
    getImageSource(graphicManifestKey, attribute, value) ??
    getGarmentDetailImageSourceForValue(
      graphicManifestKey,
      attribute.id,
      value.id,
      attribute.name,
      value.name,
    )
  );
}

function getControlType(
  attribute: ConfiguratorSession["attributes"][number],
): UiAttributeGroup["controlType"] {
  if (attribute.displayType === "color") {
    return "color";
  }

  if (attribute.displayType === "image") {
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

function isSleeveModelAttributeName(normalizedName: string) {
  return (
    normalizedName.includes("modelo de mangas") ||
    normalizedName.includes("modelo mangas") ||
    normalizedName.includes("modelo de manga") ||
    normalizedName.includes("modelo manga")
  );
}

function isAuxiliaryPocketTypeAttributeName(normalizedName: string) {
  return (
    normalizedName.includes("tipo") &&
    normalizedName.includes("bolsillo") &&
    normalizedName.includes("auxiliar")
  );
}

function isRectangularLowerPocketImage(src: string | undefined) {
  return src?.endsWith("blouse-model-14.svg") ?? false;
}

function compactUnique(values: Array<string | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  );
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

    if (
      normalizedSection.includes("bolsillo pecho") ||
      normalizedSection.includes("bolsillo de pecho")
    ) {
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

function isExternalSidePocket(valueName: string | undefined) {
  return valueName ? normalize(valueName) === "externo" : false;
}

function isOriginalSidePocket(valueName: string | undefined) {
  return valueName ? normalize(valueName) === "original" : false;
}

function isAsorsaludSidePocket(valueName: string | undefined) {
  return valueName ? normalize(valueName) === "asorsalud" : false;
}

function isKneePatchModelAttributeName(
  normalizedName: string,
  side: "derecha" | "izquierda",
) {
  return (
    normalizedName.includes("modelo") &&
    normalizedName.includes("bolsillo") &&
    normalizedName.includes("parche") &&
    normalizedName.includes("rodilla") &&
    normalizedName.includes(side)
  );
}

function isKneePatchTypeAttributeName(
  normalizedName: string,
  side: "derecha" | "izquierda",
) {
  return (
    normalizedName.includes("tipo") &&
    normalizedName.includes("bolsillo") &&
    normalizedName.includes("parche") &&
    normalizedName.includes("rodilla") &&
    normalizedName.includes(side)
  );
}

function isSquareKneePatch(valueName: string | undefined) {
  return valueName ? normalize(valueName).includes("cuadrado") : false;
}

function isCamouflageKneePatch(valueName: string | undefined) {
  return valueName ? normalize(valueName).includes("camuflado") : false;
}

function isPointKneePatch(valueName: string | undefined) {
  return valueName ? normalize(valueName).includes("punta") : false;
}

function isInternalKneePatch(valueName: string | undefined) {
  return valueName ? normalize(valueName).includes("interno") : false;
}

function isTriangularFlapKneePatch(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return normalized.includes("pestana") && normalized.includes("triangular");
}

function isRibeteKneePatch(valueName: string | undefined) {
  return valueName ? normalize(valueName).includes("ribete") : false;
}

function isHorizontalZipperKneePatch(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return normalized.includes("cremallera") && normalized.includes("horizontal");
}

function isVerticalZipperKneePatch(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return normalized.includes("cremallera") && normalized.includes("vertical");
}

function isGenericZipperKneePatch(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return (
    normalized.includes("cremallera") &&
    !normalized.includes("horizontal") &&
    !normalized.includes("vertical")
  );
}

function isButtonKneePatch(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return normalized.includes("boton");
}

function isDoubleButtonKneePatch(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return normalized.includes("doble") && normalized.includes("boton");
}

function isVelcroKneePatch(valueName: string | undefined) {
  return valueName ? normalize(valueName).includes("velcro") : false;
}

function isSnapKneePatch(valueName: string | undefined) {
  return valueName ? normalize(valueName).includes("broche") : false;
}

function isOverlaidKneePatch(valueName: string | undefined) {
  return valueName ? normalize(valueName).includes("sobrepuesto") : false;
}

function isBuckleKneePatch(valueName: string | undefined) {
  return valueName ? normalize(valueName).includes("hebilla") : false;
}

function isPenSeamKneePatch(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return normalized.includes("costura") && normalized.includes("esfero");
}

function isPlainKneePatch(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return normalized.includes("lizo") || normalized.includes("liso");
}

function isPespunteGarment(valueName: string | undefined) {
  return valueName ? normalize(valueName).includes("pespunte") : false;
}

const BLUSA_PESPUNTE_STITCHING_DETAIL_IMAGE_SRC =
  "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg";
const PANTALON_PESPUNTE_STITCHING_DETAIL_IMAGE_SRC =
  "/assets/catalog/pantalon/detail-overlays/pants-pespunte-stitching.svg";

function isYesOption(valueName: string | undefined) {
  return valueName ? normalize(valueName) === "si" : false;
}

function hasUniformPespunteSelection(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const pespunteAttribute = findAttributeByName(
    session,
    (name) => name.includes("lleva") && name.includes("pespunte"),
  );

  return getSelectedOptions(pespunteAttribute, selectedValueIds).some((option) =>
    isYesOption(option.name),
  );
}

function withGarmentDetailImageSrc(
  scene: PreviewScene,
  detailImageSrc: string,
) {
  const garmentDetailImageSrcs = compactUnique([
    ...(scene.garmentDetailImageSrcs ??
      (scene.garmentDetailImageSrc ? [scene.garmentDetailImageSrc] : [])),
    detailImageSrc,
  ]);
  const garmentDetailImageSrc = garmentDetailImageSrcs[0] ?? detailImageSrc;

  return {
    ...scene,
    garmentDetailImageSrc,
    garmentDetailImageSrcs,
  };
}

function withUniformBlousePespunte(scene: PreviewScene) {
  return withGarmentDetailImageSrc(
    scene,
    BLUSA_PESPUNTE_STITCHING_DETAIL_IMAGE_SRC,
  );
}

function withUniformPantsPespunte(scene: PreviewScene) {
  return withGarmentDetailImageSrc(
    scene,
    PANTALON_PESPUNTE_STITCHING_DETAIL_IMAGE_SRC,
  );
}

type TextStyleAttributeDependency = {
  toggleTerms: string[];
  styleTerms: string[];
};

const textStyleAttributeDependencies: TextStyleAttributeDependency[] = [
  {
    toggleTerms: ["texto", "pecho", "derecho"],
    styleTerms: ["color", "fuente", "texto", "pecho", "derecho"],
  },
  {
    toggleTerms: ["texto", "pecho", "encima", "bolsillo"],
    styleTerms: ["color", "fuente", "texto", "pecho", "encima", "bolsillo"],
  },
  {
    toggleTerms: ["texto", "bolsillo", "superior", "pecho"],
    styleTerms: ["color", "fuente", "texto", "bolsillo", "superior", "pecho"],
  },
  {
    toggleTerms: ["texto", "bolsillo", "inferior", "pecho"],
    styleTerms: ["color", "fuente", "texto", "bolsillo", "inferior", "pecho"],
  },
  {
    toggleTerms: ["texto", "manga", "derecha"],
    styleTerms: ["color", "fuente", "texto", "manga", "derecha"],
  },
  {
    toggleTerms: ["texto", "manga", "izquierda"],
    styleTerms: ["color", "fuente", "texto", "manga", "izquierda"],
  },
  {
    toggleTerms: ["texto", "espalda"],
    styleTerms: ["color", "fuente", "texto", "espalda"],
  },
];

function normalizedIncludesAll(normalizedValue: string, terms: string[]) {
  return terms.every((term) => normalizedValue.includes(term));
}

function isYesTextToggleValue(valueName: string) {
  const normalized = normalize(valueName);

  return normalized === "si" || normalized === "con texto";
}

function findTextToggleAttribute(
  session: ConfiguratorSession,
  dependency: TextStyleAttributeDependency,
) {
  return findAttributeByName(session, (name) =>
    normalizedIncludesAll(name, dependency.toggleTerms) &&
    !name.includes("color") &&
    !name.includes("fuente"),
  );
}

function getTextStyleDependencyForAttribute(
  attribute: ConfiguratorSession["attributes"][number],
) {
  const normalizedName = normalize(attribute.name);

  if (
    !normalizedName.includes("color") ||
    !normalizedName.includes("fuente")
  ) {
    return undefined;
  }

  return textStyleAttributeDependencies.find((dependency) =>
    normalizedIncludesAll(normalizedName, dependency.styleTerms),
  );
}

function findTextStyleAttributes(
  session: ConfiguratorSession,
  toggleAttributeId: number,
  dependency: TextStyleAttributeDependency,
) {
  return session.attributes.filter(
    (attribute) =>
      attribute.id !== toggleAttributeId &&
      normalizedIncludesAll(normalize(attribute.name), dependency.styleTerms),
  );
}

function isTextToggleAttributeForAdditionalEmbroidery(
  attribute: ConfiguratorSession["attributes"][number],
) {
  const normalizedName = normalize(attribute.name);

  if (
    normalizedName.includes("color") ||
    normalizedName.includes("fuente")
  ) {
    return false;
  }

  return textStyleAttributeDependencies.some((dependency) =>
    normalizedIncludesAll(normalizedName, dependency.toggleTerms),
  );
}

function isBootTypeAttributeName(normalizedName: string) {
  return (
    normalizedName === "tipo bota" ||
    normalizedName === "tipo de bota" ||
    normalizedName === "modelo bota" ||
    normalizedName === "modelo de bota"
  );
}

function isBootMeasurementAttributeName(normalizedName: string) {
  return (
    normalizedName.includes("bota") &&
    (normalizedName.includes("largo") || normalizedName.includes("ancho"))
  );
}

function isOriginalBootValueName(valueName: string) {
  return normalize(valueName) === "original";
}

function getDefaultBootMeasurementValue(
  attribute: ConfiguratorSession["attributes"][number],
) {
  return (
    attribute.values.find((value) => value.allowsCustomValue) ??
    attribute.values[0]
  );
}

export function applyBootMeasurementSelections(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const bootTypeAttribute = findAttributeByName(session, isBootTypeAttributeName);

  if (!bootTypeAttribute) {
    return selectedValueIds;
  }

  const selectedBootType = findSelectedValue(
    bootTypeAttribute,
    selectedValueIds,
  );

  if (!selectedBootType) {
    return selectedValueIds;
  }

  const measurementAttributes = session.attributes.filter(
    (attribute) =>
      attribute.id !== bootTypeAttribute.id &&
      isBootMeasurementAttributeName(normalize(attribute.name)),
  );

  if (measurementAttributes.length === 0) {
    return selectedValueIds;
  }

  let nextSelectedValueIds = selectedValueIds;
  let hasChanges = false;

  const ensureWritableSelections = () => {
    if (hasChanges) {
      return;
    }

    nextSelectedValueIds = Object.fromEntries(
      Object.entries(selectedValueIds).map(([attributeId, valueIds]) => [
        attributeId,
        [...valueIds],
      ]),
    );
    hasChanges = true;
  };

  if (isOriginalBootValueName(selectedBootType.name)) {
    for (const attribute of measurementAttributes) {
      const key = String(attribute.id);

      if ((nextSelectedValueIds[key] ?? []).length === 0) {
        continue;
      }

      ensureWritableSelections();
      nextSelectedValueIds[key] = [];
    }

    return nextSelectedValueIds;
  }

  for (const attribute of measurementAttributes) {
    const key = String(attribute.id);

    if ((nextSelectedValueIds[key] ?? []).length > 0) {
      continue;
    }

    const defaultValue = getDefaultBootMeasurementValue(attribute);

    if (!defaultValue) {
      continue;
    }

    ensureWritableSelections();
    nextSelectedValueIds[key] = [defaultValue.id];
  }

  return nextSelectedValueIds;
}

export function applyDefaultTextStyleSelections(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  let nextSelectedValueIds = selectedValueIds;
  let hasChanges = false;

  for (const dependency of textStyleAttributeDependencies) {
    const toggleAttribute = findTextToggleAttribute(session, dependency);

    if (!toggleAttribute) {
      continue;
    }

    const isTextEnabled = getSelectedOptions(
      toggleAttribute,
      selectedValueIds,
    ).some((value) => isYesTextToggleValue(value.name));

    if (!isTextEnabled) {
      continue;
    }

    for (const styleAttribute of findTextStyleAttributes(
      session,
      toggleAttribute.id,
      dependency,
    )) {
      if (
        (nextSelectedValueIds[String(styleAttribute.id)] ?? []).length > 0
      ) {
        continue;
      }

      const defaultValue =
        styleAttribute.values.find(
          (value) => normalize(value.name) === "color y fuente",
        ) ??
        styleAttribute.values.find((value) =>
          normalizedIncludesAll(normalize(value.name), ["color", "fuente"]),
        );

      if (!defaultValue) {
        continue;
      }

      if (!hasChanges) {
        nextSelectedValueIds = Object.fromEntries(
          Object.entries(selectedValueIds).map(([attributeId, valueIds]) => [
            attributeId,
            [...valueIds],
          ]),
        );
        hasChanges = true;
      }

      nextSelectedValueIds[String(styleAttribute.id)] = [defaultValue.id];
    }
  }

  return nextSelectedValueIds;
}

export function getHiddenTextStyleAttributeIds(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const hiddenAttributeIds = new Set<number>();

  for (const attribute of session.attributes) {
    const dependency = getTextStyleDependencyForAttribute(attribute);

    if (!dependency) {
      continue;
    }

    const toggleAttribute = findTextToggleAttribute(session, dependency);
    const isTextEnabled =
      toggleAttribute !== undefined &&
      getSelectedOptions(toggleAttribute, selectedValueIds).some((value) =>
        isYesTextToggleValue(value.name),
      );

    if (!isTextEnabled) {
      hiddenAttributeIds.add(attribute.id);
    }
  }

  return hiddenAttributeIds;
}

function getHiddenLowerPocketZipperOptionAttributeIds(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const hiddenAttributeIds = new Set<number>();
  const toggleAttribute = findAttributeByName(
    session,
    (name) =>
      normalizedIncludesAll(name, [
        "bolsillos",
        "inferiores",
        "cremallera",
      ]) && !name.includes("opciones"),
  );

  if (!toggleAttribute) {
    return hiddenAttributeIds;
  }

  const isEnabled = getSelectedOptions(
    toggleAttribute,
    selectedValueIds,
  ).some((value) => isYesTextToggleValue(value.name));

  if (isEnabled) {
    return hiddenAttributeIds;
  }

  for (const attribute of session.attributes) {
    if (normalize(attribute.name) === "opciones de cremallera") {
      hiddenAttributeIds.add(attribute.id);
    }
  }

  return hiddenAttributeIds;
}

function getHiddenAdditionalEmbroideryAttributeIds(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const hiddenAttributeIds = new Set<number>();

  if (!isUniformeSession(session)) {
    return hiddenAttributeIds;
  }

  const additionalEmbroideryAttribute = findAttributeByName(
    session,
    (name) => name.includes("bordados") && name.includes("adicionales"),
  );

  if (!additionalEmbroideryAttribute) {
    return hiddenAttributeIds;
  }

  const hasAdditionalEmbroidery = getSelectedOptions(
    additionalEmbroideryAttribute,
    selectedValueIds,
  ).some((value) => isYesTextToggleValue(value.name));

  if (hasAdditionalEmbroidery) {
    return hiddenAttributeIds;
  }

  for (const attribute of session.attributes) {
    if (!isTextToggleAttributeForAdditionalEmbroidery(attribute)) {
      continue;
    }

    hiddenAttributeIds.add(attribute.id);

    const dependency = textStyleAttributeDependencies.find((item) =>
      normalizedIncludesAll(normalize(attribute.name), item.toggleTerms),
    );

    if (!dependency) {
      continue;
    }

    for (const styleAttribute of findTextStyleAttributes(
      session,
      attribute.id,
      dependency,
    )) {
      hiddenAttributeIds.add(styleAttribute.id);
    }
  }

  return hiddenAttributeIds;
}

function getHiddenConditionalAttributeIds(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  return new Set([
    ...getHiddenTextStyleAttributeIds(session, selectedValueIds),
    ...getHiddenLowerPocketZipperOptionAttributeIds(
      session,
      selectedValueIds,
    ),
    ...getHiddenAdditionalEmbroideryAttributeIds(session, selectedValueIds),
  ]);
}

function getHiddenGenderAttributeIds(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const hiddenAttributeIds = new Set<number>();
  const genderAttribute = findAttributeByName(
    session,
    (name) => name === "genero",
  );

  if (!genderAttribute) {
    return hiddenAttributeIds;
  }

  const isWoman = getSelectedOptions(genderAttribute, selectedValueIds).some(
    (value) => normalize(value.name) === "mujer",
  );

  if (isWoman) {
    return hiddenAttributeIds;
  }

  for (const attribute of session.attributes) {
    const normalizedName = normalize(attribute.name);
    const normalizedNameWithoutQuestionMarks = normalizedName.replace(
      /[¿?]/g,
      "",
    );

    if (
      attribute.id === 811 ||
      normalizedName === "modelo de blusa" ||
      attribute.id === 144 ||
      normalizedNameWithoutQuestionMarks === "pinzas"
    ) {
      hiddenAttributeIds.add(attribute.id);
    }
  }

  return hiddenAttributeIds;
}

export function sanitizeSelectedValueIdsForHiddenTextAttributes(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const hiddenAttributeIds = getHiddenConditionalAttributeIds(
    session,
    selectedValueIds,
  );

  if (hiddenAttributeIds.size === 0) {
    return selectedValueIds;
  }

  return Object.fromEntries(
    Object.entries(selectedValueIds).map(([attributeId, valueIds]) => [
      attributeId,
      hiddenAttributeIds.has(Number(attributeId)) ? [] : [...valueIds],
    ]),
  );
}

function deriveSingleConfiguratorUi(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
): ConfiguratorUiModel {
  const catalog = getProductAssetCatalog(session.graphicManifestKey);
  const hiddenConditionalAttributeIds = getHiddenConditionalAttributeIds(
    session,
    selectedValueIds,
  );
  const hiddenGenderAttributeIds = getHiddenGenderAttributeIds(
    session,
    selectedValueIds,
  );
  const visibleAttributes = session.attributes.filter(
    (attribute) =>
      !hiddenConditionalAttributeIds.has(attribute.id) &&
      !hiddenGenderAttributeIds.has(attribute.id),
  );
  const groups = visibleAttributes.map((attribute) => {
    const controlType = getControlType(attribute);

    return {
      attributeId: attribute.id,
      label: attribute.name,
      ...(isUniformeSession(session)
        ? { category: getUniformAttributeCategory(attribute.name) }
        : {}),
      helpText: getHelpText(attribute.name),
      controlType,
      selectionMode: attribute.selectionMode,
      options: attribute.values.map((value) => {
        const imageSrc =
          controlType === "image"
            ? getOptionImageSource(
                session.graphicManifestKey,
                attribute,
                value,
              )
            : undefined;

        return {
          id: value.id,
          name: value.name,
          allowsCustomValue: Boolean(value.allowsCustomValue),
          ...(value.colorHex ? { colorHex: value.colorHex } : {}),
          ...(imageSrc ? { imageSrc } : {}),
        };
      }),
    };
  });

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
  const sleeveModelAttribute = findAttributeByName(
    session,
    isSleeveModelAttributeName,
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
  const lowerPocketTypeAttribute = getLowerPocketTypeAttribute(session);
  const auxiliaryPocketTypeAttribute = findAttributeByName(
    session,
    isAuxiliaryPocketTypeAttributeName,
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
  const rightKneePatchModelAttribute = findAttributeByName(session, (name) =>
    isKneePatchModelAttributeName(name, "derecha"),
  );
  const leftKneePatchModelAttribute = findAttributeByName(session, (name) =>
    isKneePatchModelAttributeName(name, "izquierda"),
  );
  const rightKneePatchTypeAttribute = findAttributeByName(session, (name) =>
    isKneePatchTypeAttributeName(name, "derecha"),
  );
  const leftKneePatchTypeAttribute = findAttributeByName(session, (name) =>
    isKneePatchTypeAttributeName(name, "izquierda"),
  );

  const selectedColor = findSelectedValue(colorAttribute, selectedValueIds);
  const selectedGarment = findSelectedValue(garmentAttribute, selectedValueIds);
  const selectedSleeveModel = findSelectedValue(
    sleeveModelAttribute,
    selectedValueIds,
  );
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
  const selectedLowerPocketType = findSelectedValue(
    lowerPocketTypeAttribute,
    selectedValueIds,
  );
  const selectedAuxiliaryPocketType = findSelectedValue(
    auxiliaryPocketTypeAttribute,
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
  const rightKneePatchModel = getSelectedOptions(
    rightKneePatchModelAttribute,
    selectedValueIds,
  ).find(
    (option) =>
      isSquareKneePatch(option.name) ||
      isCamouflageKneePatch(option.name) ||
      isPointKneePatch(option.name) ||
      isInternalKneePatch(option.name) ||
      isRibeteKneePatch(option.name) ||
      isTriangularFlapKneePatch(option.name),
  );
  const leftKneePatchModel = getSelectedOptions(
    leftKneePatchModelAttribute,
    selectedValueIds,
  ).find(
    (option) =>
      isSquareKneePatch(option.name) ||
      isCamouflageKneePatch(option.name) ||
      isPointKneePatch(option.name) ||
      isInternalKneePatch(option.name) ||
      isRibeteKneePatch(option.name) ||
      isTriangularFlapKneePatch(option.name),
  );
  const rightKneePatchModelValue = rightKneePatchModel
    ? isCamouflageKneePatch(rightKneePatchModel.name)
      ? "camouflage"
      : isPointKneePatch(rightKneePatchModel.name)
        ? "point"
        : isInternalKneePatch(rightKneePatchModel.name)
          ? "internal"
        : isRibeteKneePatch(rightKneePatchModel.name)
          ? "ribete"
        : isTriangularFlapKneePatch(rightKneePatchModel.name)
          ? "triangularFlap"
          : "square"
    : undefined;
  const leftKneePatchModelValue = leftKneePatchModel
    ? isCamouflageKneePatch(leftKneePatchModel.name)
      ? "camouflage"
      : isPointKneePatch(leftKneePatchModel.name)
        ? "point"
        : isInternalKneePatch(leftKneePatchModel.name)
          ? "internal"
        : isRibeteKneePatch(leftKneePatchModel.name)
          ? "ribete"
        : isTriangularFlapKneePatch(leftKneePatchModel.name)
          ? "triangularFlap"
          : "square"
    : undefined;
  const rightKneePatchType =
    rightKneePatchModelValue &&
    getSelectedOptions(rightKneePatchTypeAttribute, selectedValueIds).find(
      (option) =>
        isDoubleButtonKneePatch(option.name) ||
        isButtonKneePatch(option.name) ||
        isVelcroKneePatch(option.name) ||
        isSnapKneePatch(option.name) ||
        isOverlaidKneePatch(option.name) ||
        isBuckleKneePatch(option.name) ||
        isPenSeamKneePatch(option.name) ||
        isGenericZipperKneePatch(option.name) ||
        isHorizontalZipperKneePatch(option.name) ||
        isVerticalZipperKneePatch(option.name) ||
        isPlainKneePatch(option.name),
    );
  const leftKneePatchType =
    leftKneePatchModelValue &&
    getSelectedOptions(leftKneePatchTypeAttribute, selectedValueIds).find(
      (option) =>
        isDoubleButtonKneePatch(option.name) ||
        isButtonKneePatch(option.name) ||
        isVelcroKneePatch(option.name) ||
        isSnapKneePatch(option.name) ||
        isOverlaidKneePatch(option.name) ||
        isBuckleKneePatch(option.name) ||
        isPenSeamKneePatch(option.name) ||
        isGenericZipperKneePatch(option.name) ||
        isHorizontalZipperKneePatch(option.name) ||
        isVerticalZipperKneePatch(option.name) ||
        isPlainKneePatch(option.name),
    );
  const rightKneePatchTypeValue = rightKneePatchType
    ? isSnapKneePatch(rightKneePatchType.name)
      ? "snap"
      : isOverlaidKneePatch(rightKneePatchType.name)
        ? "overlaid"
      : isDoubleButtonKneePatch(rightKneePatchType.name)
        ? "doubleButton"
      : isButtonKneePatch(rightKneePatchType.name)
      ? "button"
      : isVelcroKneePatch(rightKneePatchType.name)
        ? "velcro"
      : isBuckleKneePatch(rightKneePatchType.name)
        ? "buckle"
      : isPenSeamKneePatch(rightKneePatchType.name)
        ? "penSeam"
      : isGenericZipperKneePatch(rightKneePatchType.name)
        ? "zipper"
      : isHorizontalZipperKneePatch(rightKneePatchType.name)
      ? "horizontalZipper"
      : isVerticalZipperKneePatch(rightKneePatchType.name)
        ? "verticalZipper"
        : "plain"
    : undefined;
  const leftKneePatchTypeValue = leftKneePatchType
    ? isSnapKneePatch(leftKneePatchType.name)
      ? "snap"
      : isOverlaidKneePatch(leftKneePatchType.name)
        ? "overlaid"
      : isDoubleButtonKneePatch(leftKneePatchType.name)
        ? "doubleButton"
      : isButtonKneePatch(leftKneePatchType.name)
      ? "button"
      : isVelcroKneePatch(leftKneePatchType.name)
        ? "velcro"
      : isBuckleKneePatch(leftKneePatchType.name)
        ? "buckle"
      : isPenSeamKneePatch(leftKneePatchType.name)
        ? "penSeam"
      : isGenericZipperKneePatch(leftKneePatchType.name)
        ? "zipper"
      : isHorizontalZipperKneePatch(leftKneePatchType.name)
      ? "horizontalZipper"
      : isVerticalZipperKneePatch(leftKneePatchType.name)
        ? "verticalZipper"
        : "plain"
    : undefined;
  const pantsSidePocketType = selectedPantsSidePocketOptions.some((option) =>
    isAsorsaludSidePocket(option.name),
  )
    ? "asorsalud"
    : selectedPantsSidePocketOptions.some((option) =>
          isDoubleZipperSidePocket(option.name) ||
          isExternalSidePocket(option.name) ||
          isOriginalSidePocket(option.name),
        )
      ? "doubleZipper"
      : undefined;
  const hasLogoSelection = activeLogoOptions.length > 0;
  const lowerPocketLayout = getLowerPocketLayout(session, selectedValueIds);
  const neckImageSrc = selectedNeck
    ? getImageSource(session.graphicManifestKey, neckAttribute!, selectedNeck)
    : undefined;
  const shouldUseDefaultGarmentUntilNeck =
    session.graphicManifestKey.includes("blusa") &&
    isPespunteGarment(selectedGarment?.name) &&
    !neckImageSrc;
  const garmentImageSrc = shouldUseDefaultGarmentUntilNeck
    ? getDefaultImageSource(session.graphicManifestKey)
    : selectedGarment
    ? getImageSource(session.graphicManifestKey, garmentAttribute!, selectedGarment) ??
      getDefaultImageSource(session.graphicManifestKey)
    : getDefaultImageSource(session.graphicManifestKey);
  const garmentModelDetailImageSrc = selectedGarment
    ? shouldUseDefaultGarmentUntilNeck
      ? BLUSA_PESPUNTE_STITCHING_DETAIL_IMAGE_SRC
      : getGarmentDetailImageSourceForValue(
        session.graphicManifestKey,
        garmentAttribute!.id,
        selectedGarment.id,
        garmentAttribute!.name,
        selectedGarment.name,
      )
    : undefined;
  const sleeveDetailImageSrc = selectedSleeveModel
    ? getGarmentDetailImageSourceForValue(
        session.graphicManifestKey,
        sleeveModelAttribute!.id,
        selectedSleeveModel.id,
        sleeveModelAttribute!.name,
        selectedSleeveModel.name,
      )
    : undefined;
  const garmentDetailImageSrcs = compactUnique([
    garmentModelDetailImageSrc,
    sleeveDetailImageSrc,
  ]);
  const garmentDetailImageSrc = garmentDetailImageSrcs[0];
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
  const lowerPocketImageSrc =
    lowerPocketLayout !== "none" && selectedLowerPocketModel
      ? getImageSource(
          session.graphicManifestKey,
          lowerPocketModelAttribute!,
          selectedLowerPocketModel,
        )
      : undefined;
  const lowerPocketAuxiliaryAddon =
    lowerPocketLayout !== "none" &&
    isRectangularLowerPocketImage(lowerPocketImageSrc)
      ? getLowerPocketAuxiliaryAddon(
          selectedAuxiliaryPocketType?.name ?? selectedLowerPocketType?.name,
        )
      : undefined;

  const summary = visibleAttributes.flatMap((attribute) => {
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
      ...(garmentDetailImageSrcs.length > 0 ? { garmentDetailImageSrcs } : {}),
      ...(bootImageSrc ? { bootImageSrc } : {}),
      ...(waistbandImageSrc ? { waistbandImageSrc } : {}),
      ...(pantsSidePocketType ? { pantsSidePocketType } : {}),
      ...(rightKneePatchModelValue
        ? { pantsKneePatchRightModel: rightKneePatchModelValue }
        : {}),
      ...(rightKneePatchTypeValue
        ? { pantsKneePatchRightType: rightKneePatchTypeValue }
        : {}),
      ...(leftKneePatchModelValue
        ? { pantsKneePatchLeftModel: leftKneePatchModelValue }
        : {}),
      ...(leftKneePatchTypeValue
        ? { pantsKneePatchLeftType: leftKneePatchTypeValue }
        : {}),
      neckImageSrc,
      lowerPocketImageSrc,
      lowerPocketLayout,
      ...(lowerPocketAuxiliaryAddon
        ? {
            lowerPocketAuxiliaryAddonKind: lowerPocketAuxiliaryAddon.kind,
            lowerPocketAuxiliaryAddonSide: lowerPocketAuxiliaryAddon.side,
          }
        : {}),
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

export function deriveConfiguratorUi(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
): ConfiguratorUiModel {
  if (!isUniformeSession(session)) {
    return deriveSingleConfiguratorUi(session, selectedValueIds);
  }

  const baseUi = deriveSingleConfiguratorUi(session, selectedValueIds);
  const blouseUi = deriveSingleConfiguratorUi(
    {
      ...session,
      productName: "Blusa",
      graphicManifestKey: "blusa-antifluido-t180",
    },
    selectedValueIds,
  );
  const pantsUi = deriveSingleConfiguratorUi(
    {
      ...session,
      productName: "Pantalon",
      graphicManifestKey: "pantalon",
    },
    selectedValueIds,
  );
  const shouldApplyUniformPespunte = hasUniformPespunteSelection(
    session,
    selectedValueIds,
  );
  const uniformBlouseScene = removePantsKneePatchFromUniformBlouseScene(
    blouseUi.previewScene,
  );
  const uniformPantsScene = ensureUniformPantsSidePocketForTrim(
    keepOnlyPantsTrimSectionsForUniformScene(pantsUi.previewScene),
  );

  return {
    ...baseUi,
    previewScene: {
      productName: session.productName,
      baseColorHex: baseUi.previewScene.baseColorHex,
      lowerPocketLayout: "none",
      trimSections: [],
      uniformParts: {
        blouse: {
          ...(shouldApplyUniformPespunte
            ? withUniformBlousePespunte(uniformBlouseScene)
            : uniformBlouseScene),
          baseColorHex:
            getPartColorHex(session, selectedValueIds, "blouse") ??
            blouseUi.previewScene.baseColorHex,
        },
        pants: {
          ...(shouldApplyUniformPespunte
            ? withUniformPantsPespunte(uniformPantsScene)
            : uniformPantsScene),
          baseColorHex:
            getPartColorHex(session, selectedValueIds, "pants") ??
            pantsUi.previewScene.baseColorHex,
        },
      },
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
