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
  getServerDefaultAssetPath,
  getServerDefaultChestPocketAssetPath,
  getServerAssetPathForValue,
  getServerBootAssetPathForValue,
  getServerGarmentDetailAssetPathForValue,
  getServerProductAssetCatalog,
  getServerWaistbandAssetPathForValue,
} from "./server-asset-catalog.js";

export type AutomationRenderScene = {
  productName: string;
  baseColorHex: string;
  uniformParts?: {
    blouse: AutomationRenderScene;
    pants: AutomationRenderScene;
  };
  garmentAssetPath?: string;
  garmentDetailAssetPath?: string;
  garmentDetailAssetPaths?: string[];
  bootAssetPath?: string;
  waistbandAssetPath?: string;
  pantsSidePocketType?: "doubleZipper" | "asorsalud";
  pantsKneePatchRightModel?:
    | "square"
    | "camouflage"
    | "point"
    | "internal"
    | "ribete"
    | "triangularFlap";
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
    | "verticalZipper";
  pantsKneePatchLeftModel?:
    | "square"
    | "camouflage"
    | "point"
    | "internal"
    | "ribete"
    | "triangularFlap";
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
    | "verticalZipper";
  neckAssetPath?: string;
  lowerPocketAssetPath?: string;
  lowerPocketLayout: LowerPocketLayout;
  lowerPocketAuxiliaryAddonKind?: LowerPocketAuxiliaryAddonKind;
  lowerPocketAuxiliaryAddonSide?: LowerPocketAuxiliaryAddonSide;
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

function isRectangularLowerPocketAsset(assetPath: string | undefined) {
  return assetPath?.endsWith("blouse-model-14.svg") ?? false;
}

function compactUnique(values: Array<string | undefined>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  );
}

const UNIFORME_PRODUCT_TEMPLATE_ID = 7;

function isUniformeSession(session: ConfiguratorSession) {
  return (
    session.productTemplateId === UNIFORME_PRODUCT_TEMPLATE_ID ||
    normalize(session.graphicManifestKey) === "uniforme"
  );
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

type AutomationTrimSection = AutomationRenderScene["trimSections"][number];

function getUniformTrimSectionText(section: AutomationTrimSection) {
  return normalize(`${section.key} ${section.label}`);
}

function isPantsUniformTrimSection(section: AutomationTrimSection) {
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

function isBlouseUniformTrimSection(section: AutomationTrimSection) {
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

function getUniformBlouseTrimSections(sections: AutomationTrimSection[]) {
  return sections.filter(
    (section) =>
      isBlouseUniformTrimSection(section) && !isPantsUniformTrimSection(section),
  );
}

function getUniformPantsTrimSections(sections: AutomationTrimSection[]) {
  return sections.filter(isPantsUniformTrimSection);
}

function removePantsKneePatchFromUniformBlouseScene(
  scene: AutomationRenderScene,
) {
  const blouseScene: AutomationRenderScene = {
    ...scene,
    trimSections: getUniformBlouseTrimSections(scene.trimSections),
  };

  delete blouseScene.pantsKneePatchRightModel;
  delete blouseScene.pantsKneePatchRightType;
  delete blouseScene.pantsKneePatchLeftModel;
  delete blouseScene.pantsKneePatchLeftType;

  return blouseScene;
}

function keepOnlyPantsTrimSectionsForUniformScene(
  scene: AutomationRenderScene,
) {
  return {
    ...scene,
    trimSections: getUniformPantsTrimSections(scene.trimSections),
  };
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

const BLUSA_PESPUNTE_STITCHING_DETAIL_ASSET_PATH =
  "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg";
const PANTALON_PESPUNTE_STITCHING_DETAIL_ASSET_PATH =
  "assets/catalog/pantalon/detail-overlays/pants-pespunte-stitching.svg";

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

function withGarmentDetailAssetPath(
  scene: AutomationRenderScene,
  detailAssetPath: string,
) {
  const garmentDetailAssetPaths = compactUnique([
    ...(scene.garmentDetailAssetPaths ??
      (scene.garmentDetailAssetPath ? [scene.garmentDetailAssetPath] : [])),
    detailAssetPath,
  ]);
  const garmentDetailAssetPath = garmentDetailAssetPaths[0] ?? detailAssetPath;

  return {
    ...scene,
    garmentDetailAssetPath,
    garmentDetailAssetPaths,
  };
}

function withUniformBlousePespunte(scene: AutomationRenderScene) {
  return withGarmentDetailAssetPath(
    scene,
    BLUSA_PESPUNTE_STITCHING_DETAIL_ASSET_PATH,
  );
}

function withUniformPantsPespunte(scene: AutomationRenderScene) {
  return withGarmentDetailAssetPath(
    scene,
    PANTALON_PESPUNTE_STITCHING_DETAIL_ASSET_PATH,
  );
}

function deriveSingleAutomationRenderScene(
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
  const activeLogoOptions = getSelectedOptions(
    logoAttribute,
    selectedValueIds,
  ).filter((option) => !isNoLogo(option.name));
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
  const lowerPocketLayout = getLowerPocketLayout(session, selectedValueIds);
  const neckAssetPath = selectedNeck
    ? getAssetPath(session, neckAttribute!, selectedNeck)
    : undefined;
  const shouldUseDefaultGarmentUntilNeck =
    session.graphicManifestKey.includes("blusa") &&
    isPespunteGarment(selectedGarment?.name) &&
    !neckAssetPath;
  const garmentAssetPath = shouldUseDefaultGarmentUntilNeck
    ? getServerDefaultAssetPath(session.graphicManifestKey)
    : selectedGarment
    ? getAssetPath(session, garmentAttribute!, selectedGarment) ??
      getServerDefaultAssetPath(session.graphicManifestKey)
    : getServerDefaultAssetPath(session.graphicManifestKey);
  const garmentModelDetailAssetPath = selectedGarment
    ? shouldUseDefaultGarmentUntilNeck
      ? BLUSA_PESPUNTE_STITCHING_DETAIL_ASSET_PATH
      : getServerGarmentDetailAssetPathForValue(
        session.graphicManifestKey,
        garmentAttribute!.id,
        selectedGarment.id,
        garmentAttribute!.name,
        selectedGarment.name,
      )
    : undefined;
  const sleeveDetailAssetPath = selectedSleeveModel
    ? getServerGarmentDetailAssetPathForValue(
        session.graphicManifestKey,
        sleeveModelAttribute!.id,
        selectedSleeveModel.id,
        sleeveModelAttribute!.name,
        selectedSleeveModel.name,
      )
    : undefined;
  const garmentDetailAssetPaths = compactUnique([
    garmentModelDetailAssetPath,
    sleeveDetailAssetPath,
  ]);
  const garmentDetailAssetPath = garmentDetailAssetPaths[0];
  const bootAssetPath = selectedBootModel
    ? getServerBootAssetPathForValue(
        session.graphicManifestKey,
        bootModelAttribute!.id,
        selectedBootModel.id,
        bootModelAttribute!.name,
        selectedBootModel.name,
      )
    : undefined;
  const waistbandAssetPath = selectedWaistbandModel
    ? getServerWaistbandAssetPathForValue(
        session.graphicManifestKey,
        waistbandModelAttribute!.id,
        selectedWaistbandModel.id,
        waistbandModelAttribute!.name,
        selectedWaistbandModel.name,
      )
    : undefined;
  const lowerPocketAssetPath = selectedLowerPocketModel
    ? getAssetPath(session, lowerPocketModelAttribute!, selectedLowerPocketModel)
    : undefined;
  const lowerPocketAuxiliaryAddon =
    lowerPocketLayout !== "none" &&
    isRectangularLowerPocketAsset(lowerPocketAssetPath)
      ? getLowerPocketAuxiliaryAddon(
          selectedAuxiliaryPocketType?.name ?? selectedLowerPocketType?.name,
        )
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
    ...(garmentDetailAssetPaths.length > 0 ? { garmentDetailAssetPaths } : {}),
    ...(bootAssetPath ? { bootAssetPath } : {}),
    ...(waistbandAssetPath ? { waistbandAssetPath } : {}),
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
    ...(neckAssetPath ? { neckAssetPath } : {}),
    ...(lowerPocketLayout !== "none" && lowerPocketAssetPath
      ? { lowerPocketAssetPath }
      : {}),
    lowerPocketLayout,
    ...(lowerPocketAuxiliaryAddon
      ? {
          lowerPocketAuxiliaryAddonKind: lowerPocketAuxiliaryAddon.kind,
          lowerPocketAuxiliaryAddonSide: lowerPocketAuxiliaryAddon.side,
        }
      : {}),
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

export function deriveAutomationRenderScene(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
): AutomationRenderScene {
  if (!isUniformeSession(session)) {
    return deriveSingleAutomationRenderScene(session, selectedValueIds);
  }

  const baseScene = deriveSingleAutomationRenderScene(session, selectedValueIds);
  const blouseScene = deriveSingleAutomationRenderScene(
    {
      ...session,
      productName: "Blusa",
      graphicManifestKey: "blusa-antifluido-t180",
    },
    selectedValueIds,
  );
  const pantsScene = deriveSingleAutomationRenderScene(
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
  const uniformBlouseScene =
    removePantsKneePatchFromUniformBlouseScene(blouseScene);
  const uniformPantsScene = keepOnlyPantsTrimSectionsForUniformScene(pantsScene);

  return {
    productName: session.productName,
    baseColorHex: baseScene.baseColorHex,
    lowerPocketLayout: "none",
    trimSections: [],
    uniformParts: {
      blouse: {
        ...(shouldApplyUniformPespunte
          ? withUniformBlousePespunte(uniformBlouseScene)
          : uniformBlouseScene),
        baseColorHex:
          getPartColorHex(session, selectedValueIds, "blouse") ??
          blouseScene.baseColorHex,
      },
      pants: {
        ...(shouldApplyUniformPespunte
          ? withUniformPantsPespunte(uniformPantsScene)
          : uniformPantsScene),
        baseColorHex:
          getPartColorHex(session, selectedValueIds, "pants") ??
          pantsScene.baseColorHex,
      },
    },
  };
}
