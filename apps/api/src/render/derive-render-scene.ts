import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import {
  getPantsKneePatchModelBySourceValueId,
  getPantsKneePatchTypeBySourceValueId,
  getPantsKneeTrimSectionBySourceValueId,
  PANTS_KNEE_PATCH_ATTRIBUTE_IDS,
  type PantsKneePatchModel,
  type PantsKneePatchType,
} from "@repo/shared/pants-knee-patch-rules";
import {
  CONFIGURATOR_ATTRIBUTE_IDS,
  CONFIGURATOR_VALUE_IDS,
  getTrimSectionKeyBySourceValueId,
  hasSourceValueId,
  isManConfiguratorValue,
} from "@repo/shared/configurator-id-rules";
import { matchesVisualAssetAttributeId } from "@repo/shared/visual-assets";
import { materializeSelectedVisualDefinitions } from "@repo/shared/visual-catalog-runtime";
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
  preserveGarmentSilhouette?: boolean;
  hasDynamicNeck?: boolean;
  garmentAssetPath?: string;
  garmentDetailAssetPath?: string;
  garmentDetailAssetPaths?: string[];
  bootAssetPath?: string;
  waistbandAssetPath?: string;
  pantsSidePocketType?: "doubleZipper" | "asorsalud";
  pantsKneePatchRightModel?: PantsKneePatchModel;
  pantsKneePatchRightType?: PantsKneePatchType;
  pantsKneePatchLeftModel?: PantsKneePatchModel;
  pantsKneePatchLeftType?: PantsKneePatchType;
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
    sourceValueIds?: number[];
  };
  trimSections: Array<{
    valueId: number;
    sourceValueId?: number;
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

function findAttributeByIdOrName(
  session: ConfiguratorSession,
  attributeId: number,
  matcher: (normalizedName: string) => boolean,
) {
  return (
    session.attributes.find((attribute) => attribute.id === attributeId) ??
    findAttributeByName(session, matcher)
  );
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

const LOWER_POCKET_AUXILIARY_ADDON_FILE_NAMES = [
  "blouse-model-14.svg",
  "blouse-model-15.svg",
  "blouse-model-19-ribete-lower-pocket.svg",
] as const;

function supportsLowerPocketAuxiliaryAddon(assetPath: string | undefined) {
  return (
    assetPath !== undefined &&
    LOWER_POCKET_AUXILIARY_ADDON_FILE_NAMES.some((fileName) =>
      assetPath.endsWith(fileName),
    )
  );
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
  if (getPantsKneeTrimSectionBySourceValueId(section.sourceValueId)) {
    return true;
  }

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

function isSharedUniformTrimSection(section: AutomationTrimSection) {
  return getUniformTrimSectionText(section).includes("pespunte");
}

function getUniformBlouseTrimSections(sections: AutomationTrimSection[]) {
  return sections.filter(
    (section) =>
      isBlouseUniformTrimSection(section) &&
      (!isPantsUniformTrimSection(section) || isSharedUniformTrimSection(section)),
  );
}

function getUniformPantsTrimSections(sections: AutomationTrimSection[]) {
  return sections.filter(
    (section) =>
      isPantsUniformTrimSection(section) || isSharedUniformTrimSection(section),
  );
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

function isPantsSidePocketUniformTrimSection(section: AutomationTrimSection) {
  const normalized = getUniformTrimSectionText(section);

  return (
    normalized.includes("bolsillo lateral de pantalon") ||
    (normalized.includes("bolsillo lateral") && normalized.includes("pantalon"))
  );
}

function ensureUniformPantsSidePocketForTrim(
  scene: AutomationRenderScene,
): AutomationRenderScene {
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
    value.sourceValueId,
  );
}

function isVisibleChestPocketModel(valueName: string | undefined) {
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return !isNoChestPocket(normalized);
}

type SourceBackedOption = ConfiguratorSession["attributes"][number]["values"][number];

function getOptionName(value: SourceBackedOption | string | undefined) {
  return typeof value === "string" ? value : value?.name;
}

function isNoChestPocket(value: SourceBackedOption | string | undefined) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.noChestPocket)) {
    return true;
  }

  const valueName = getOptionName(value);
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

function isNoLogo(value: SourceBackedOption | string | undefined) {
  const valueName = getOptionName(value);
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
    const configuredRole = roleEntries.find(([, valueIds]) =>
      valueIds.includes(section.sourceValueId ?? section.id),
    )?.[0] as
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
      : enabledSections.flatMap((section) => {
          const matchingColorAttribute = colorAttributes.find((attribute) =>
            normalize(attribute.name).includes(normalize(section.name)),
          );
          const sectionColor =
            findSelectedValue(matchingColorAttribute, selectedValueIds) ??
            globalColor;

          if (!sectionColor?.colorHex) {
            return [];
          }

          const role = resolveTrimRole(section);

          return [
            {
              valueId: section.id,
              ...(section.sourceValueId !== undefined
                ? { sourceValueId: section.sourceValueId }
                : {}),
              ...(role ? { role } : {}),
              key:
                getTrimSectionKeyBySourceValueId(section.sourceValueId) ??
                normalize(section.name).replace(/[^a-z0-9]+/g, "-"),
              label: section.name,
              colorHex: sectionColor.colorHex,
            },
          ];
        });

  return selectedSections;
}

function isPantsSidePocketAttributeName(normalizedName: string) {
  return (
    normalizedName === "lateral" ||
    normalizedName === "internos" ||
    (normalizedName.includes("bolsillo") &&
      (normalizedName.includes("lateral") || normalizedName.includes("pretina")))
  );
}

function isDoubleZipperSidePocket(value: SourceBackedOption | string | undefined) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.pantsSidePocket.doubleZipper)) return true;
  const valueName = getOptionName(value);
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return normalized.includes("doble") && normalized.includes("cremallera");
}

function isExternalSidePocket(value: SourceBackedOption | string | undefined) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.pantsSidePocket.external)) return true;
  const valueName = getOptionName(value);
  return valueName ? normalize(valueName) === "externo" : false;
}

function isOriginalSidePocket(value: SourceBackedOption | string | undefined) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.pantsSidePocket.original)) return true;
  const valueName = getOptionName(value);
  return valueName ? normalize(valueName) === "original" : false;
}

function isAsorsaludSidePocket(value: SourceBackedOption | string | undefined) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.pantsSidePocket.asorsalud)) return true;
  const valueName = getOptionName(value);
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

type KneePatchOption = ConfiguratorSession["attributes"][number]["values"][number];

function resolveKneePatchModel(option: KneePatchOption): PantsKneePatchModel | undefined {
  const model = getPantsKneePatchModelBySourceValueId(option.sourceValueId);

  if (model) {
    return model;
  }

  if (isCamouflageKneePatch(option.name)) {
    return "camouflage";
  }
  if (isPointKneePatch(option.name)) {
    return "point";
  }
  if (isInternalKneePatch(option.name)) {
    return "internal";
  }
  if (isRibeteKneePatch(option.name)) {
    return "ribete";
  }
  if (isTriangularFlapKneePatch(option.name)) {
    return "triangularFlap";
  }

  return isSquareKneePatch(option.name) ? "square" : undefined;
}

function resolveKneePatchType(option: KneePatchOption): PantsKneePatchType | undefined {
  const type = getPantsKneePatchTypeBySourceValueId(option.sourceValueId);

  if (type) {
    return type;
  }

  if (isSnapKneePatch(option.name)) return "snap";
  if (isOverlaidKneePatch(option.name)) return "overlaid";
  if (isDoubleButtonKneePatch(option.name)) return "doubleButton";
  if (isButtonKneePatch(option.name)) return "button";
  if (isVelcroKneePatch(option.name)) return "velcro";
  if (isBuckleKneePatch(option.name)) return "buckle";
  if (isPenSeamKneePatch(option.name)) return "penSeam";
  if (isGenericZipperKneePatch(option.name)) return "zipper";
  if (isHorizontalZipperKneePatch(option.name)) return "horizontalZipper";
  if (isVerticalZipperKneePatch(option.name)) return "verticalZipper";

  return isPlainKneePatch(option.name) ? "plain" : undefined;
}

function isPespunteGarment(value: SourceBackedOption | string | undefined) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.pespunte)) return true;
  const valueName = getOptionName(value);
  return valueName ? normalize(valueName).includes("pespunte") : false;
}

const BLUSA_PESPUNTE_STITCHING_DETAIL_ASSET_PATH =
  "assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg";
const BLUSA_PESPUNTE_MODEL_ASSET_PATH =
  "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-45-pespunte.svg";
// Base temporal para Blusa y Uniforme mientras no exista un modelo de cuello seleccionado.
const BLUSA_CLOSED_NO_COLLAR_ASSET_PATH =
  "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg";
const BLUSA_MAN_BASE_ASSET_PATH =
  "assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-man.svg";
const PANTALON_PESPUNTE_STITCHING_DETAIL_ASSET_PATH =
  "assets/catalog/pantalon/detail-overlays/pants-pespunte-stitching.svg";

function isYesOption(value: SourceBackedOption | string | undefined) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.yes)) return true;
  const valueName = getOptionName(value);
  return valueName ? normalize(valueName) === "si" : false;
}

function hasUniformPespunteSelection(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const pespunteAttributes = session.attributes.filter(
    (attribute) =>
      attribute.id === CONFIGURATOR_ATTRIBUTE_IDS.blousePespunte ||
      (normalize(attribute.name).includes("lleva") &&
        normalize(attribute.name).includes("pespunte")),
  );

  return pespunteAttributes.some((attribute) =>
    getSelectedOptions(attribute, selectedValueIds).some(
      (option) => isYesOption(option) || isPespunteGarment(option),
    ),
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
  const genderAttribute = findAttributeByIdOrName(
    session,
    CONFIGURATOR_ATTRIBUTE_IDS.gender,
    (name) => name === "genero",
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
  const sleeveModelAttribute = findAttributeByIdOrName(
    session,
    CONFIGURATOR_ATTRIBUTE_IDS.sleeveModel,
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
  const auxiliaryPocketTypeAttribute = findAttributeByIdOrName(
    session,
    CONFIGURATOR_ATTRIBUTE_IDS.auxiliaryPocketType,
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
  const chestPocketTypeAttribute = findAttributeByIdOrName(
    session,
    CONFIGURATOR_ATTRIBUTE_IDS.chestPocketModel,
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
  const logoAttribute = findAttributeByIdOrName(
    session,
    CONFIGURATOR_ATTRIBUTE_IDS.logo,
    (name) => name === "logo" || name.includes("logo"),
  );
  const pantsSidePocketAttribute = findAttributeByIdOrName(
    session,
    CONFIGURATOR_ATTRIBUTE_IDS.pantsSidePocket,
    isPantsSidePocketAttributeName,
  );
  const rightKneePatchModelAttribute =
    session.attributes.find(
      (attribute) => attribute.id === PANTS_KNEE_PATCH_ATTRIBUTE_IDS.rightModel,
    ) ??
    findAttributeByName(session, (name) =>
      isKneePatchModelAttributeName(name, "derecha"),
    );
  const leftKneePatchModelAttribute =
    session.attributes.find(
      (attribute) => attribute.id === PANTS_KNEE_PATCH_ATTRIBUTE_IDS.leftModel,
    ) ??
    findAttributeByName(session, (name) =>
      isKneePatchModelAttributeName(name, "izquierda"),
    );
  const rightKneePatchTypeAttribute =
    session.attributes.find(
      (attribute) => attribute.id === PANTS_KNEE_PATCH_ATTRIBUTE_IDS.rightType,
    ) ??
    findAttributeByName(session, (name) =>
      isKneePatchTypeAttributeName(name, "derecha"),
    );
  const leftKneePatchTypeAttribute =
    session.attributes.find(
      (attribute) => attribute.id === PANTS_KNEE_PATCH_ATTRIBUTE_IDS.leftType,
    ) ??
    findAttributeByName(session, (name) =>
      isKneePatchTypeAttributeName(name, "izquierda"),
    );

  const selectedColor = findSelectedValue(colorAttribute, selectedValueIds);
  const selectedGender = findSelectedValue(genderAttribute, selectedValueIds);
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
  ).filter((option) => !isNoLogo(option));
  const selectedPantsSidePocketOptions = getSelectedOptions(
    pantsSidePocketAttribute,
    selectedValueIds,
  );
  const rightKneePatchModel = getSelectedOptions(
    rightKneePatchModelAttribute,
    selectedValueIds,
  ).find(resolveKneePatchModel);
  const leftKneePatchModel = getSelectedOptions(
    leftKneePatchModelAttribute,
    selectedValueIds,
  ).find(resolveKneePatchModel);
  const rightKneePatchModelValue = rightKneePatchModel
    ? resolveKneePatchModel(rightKneePatchModel)
    : undefined;
  const leftKneePatchModelValue = leftKneePatchModel
    ? resolveKneePatchModel(leftKneePatchModel)
    : undefined;
  const rightKneePatchType =
    rightKneePatchModelValue &&
    getSelectedOptions(rightKneePatchTypeAttribute, selectedValueIds).find(
      resolveKneePatchType,
    );
  const leftKneePatchType =
    leftKneePatchModelValue &&
    getSelectedOptions(leftKneePatchTypeAttribute, selectedValueIds).find(
      resolveKneePatchType,
    );
  const rightKneePatchTypeValue = rightKneePatchType
    ? resolveKneePatchType(rightKneePatchType)
    : undefined;
  const leftKneePatchTypeValue = leftKneePatchType
    ? resolveKneePatchType(leftKneePatchType)
    : undefined;
  const pantsSidePocketType = selectedPantsSidePocketOptions.some((option) =>
    isAsorsaludSidePocket(option),
  )
    ? "asorsalud"
    : selectedPantsSidePocketOptions.some((option) =>
          isDoubleZipperSidePocket(option) ||
          isExternalSidePocket(option) ||
          isOriginalSidePocket(option),
        )
      ? "doubleZipper"
      : undefined;
  const lowerPocketLayout = getLowerPocketLayout(session, selectedValueIds);
  const partColorHex = session.graphicManifestKey.includes("blusa")
    ? getPartColorHex(session, selectedValueIds, "blouse")
    : session.graphicManifestKey.includes("pantalon")
      ? getPartColorHex(session, selectedValueIds, "pants")
      : undefined;
  const baseColorHex =
    partColorHex ?? selectedColor?.colorHex ?? "#d8dee9";
  const trimSections = getSelectedTrimSections(session, selectedValueIds);
  const dynamicVisualDefinitions = materializeSelectedVisualDefinitions(
    session,
    selectedValueIds,
    session.graphicManifestKey,
    baseColorHex,
    trimSections,
  );
  const dynamicVisualSlots = new Set(
    dynamicVisualDefinitions.map((definition) => definition.slot),
  );
  const hasDynamicNeck = dynamicVisualSlots.has("neck");
  const hasDynamicLowerPocket = dynamicVisualSlots.has("lower_pocket");
  const hasDynamicBoot = dynamicVisualSlots.has("boot");
  const neckAssetPath = !hasDynamicNeck && selectedNeck
    ? getAssetPath(session, neckAttribute!, selectedNeck)
    : undefined;
  const shouldUseClosedBlouseWithoutNeck =
    session.graphicManifestKey.includes("blusa") &&
    (hasDynamicNeck || !neckAssetPath);
  const selectedGarmentIsPespunte = isPespunteGarment(selectedGarment);
  const shouldUseManBase =
    session.graphicManifestKey.includes("blusa") &&
    isManConfiguratorValue(selectedGender);
  const garmentAssetPath = shouldUseManBase
    ? BLUSA_MAN_BASE_ASSET_PATH
    : shouldUseClosedBlouseWithoutNeck
    ? BLUSA_CLOSED_NO_COLLAR_ASSET_PATH
    : selectedGarment
    ? getAssetPath(session, garmentAttribute!, selectedGarment) ??
      getServerDefaultAssetPath(session.graphicManifestKey)
    : getServerDefaultAssetPath(session.graphicManifestKey);
  const selectedGarmentDetailAssetPath = selectedGarment
    ? getServerGarmentDetailAssetPathForValue(
        session.graphicManifestKey,
        garmentAttribute!.id,
        selectedGarment.id,
        garmentAttribute!.name,
        selectedGarment.name,
        selectedGarment.sourceValueId,
      )
    : undefined;
  const garmentModelDetailAssetPath = selectedGarment
    ? garmentAssetPath === BLUSA_PESPUNTE_MODEL_ASSET_PATH
      ? undefined
      : shouldUseClosedBlouseWithoutNeck && selectedGarmentIsPespunte
        ? BLUSA_PESPUNTE_STITCHING_DETAIL_ASSET_PATH
        : selectedGarmentDetailAssetPath
    : undefined;
  const sleeveDetailAssetPath = selectedSleeveModel
    ? getServerGarmentDetailAssetPathForValue(
        session.graphicManifestKey,
        sleeveModelAttribute!.id,
        selectedSleeveModel.id,
        sleeveModelAttribute!.name,
        selectedSleeveModel.name,
        selectedSleeveModel.sourceValueId,
      )
    : undefined;
  const garmentDetailAssetPaths = compactUnique([
    garmentModelDetailAssetPath,
    sleeveDetailAssetPath,
    ...dynamicVisualDefinitions.map(
      (definition) => definition.svgDataUri,
    ),
  ]);
  const garmentDetailAssetPath = garmentDetailAssetPaths[0];
  const bootAssetPath = !hasDynamicBoot && selectedBootModel
    ? getServerBootAssetPathForValue(
        session.graphicManifestKey,
        bootModelAttribute!.id,
        selectedBootModel.id,
        bootModelAttribute!.name,
        selectedBootModel.name,
        selectedBootModel.sourceValueId,
      )
    : undefined;
  const waistbandAssetPath = selectedWaistbandModel
    ? getServerWaistbandAssetPathForValue(
        session.graphicManifestKey,
        waistbandModelAttribute!.id,
        selectedWaistbandModel.id,
        waistbandModelAttribute!.name,
        selectedWaistbandModel.name,
        selectedWaistbandModel.sourceValueId,
      )
    : undefined;
  const resolvedLowerPocketLayout = hasDynamicLowerPocket
    ? "none"
    : lowerPocketLayout;
  const lowerPocketAssetPath = !hasDynamicLowerPocket && selectedLowerPocketModel
    ? getAssetPath(session, lowerPocketModelAttribute!, selectedLowerPocketModel)
    : undefined;
  const lowerPocketAuxiliaryAddon =
    resolvedLowerPocketLayout !== "none" &&
    supportsLowerPocketAuxiliaryAddon(lowerPocketAssetPath)
      ? getLowerPocketAuxiliaryAddon(
          selectedAuxiliaryPocketType ?? selectedLowerPocketType,
        )
      : undefined;
  const auxiliaryPocketAssetPath = selectedAuxiliaryPocketModel
    ? getAssetPath(session, auxiliaryPocketModelAttribute!, selectedAuxiliaryPocketModel)
    : undefined;
  const chestPocketAssetPath =
    selectedChestPocketModel &&
    !isNoChestPocket(selectedChestPocketModel) &&
    isVisibleChestPocketModel(selectedChestPocketModel.name)
      ? getAssetPath(session, chestPocketModelAttribute!, selectedChestPocketModel) ??
        getServerDefaultChestPocketAssetPath(session.graphicManifestKey)
      : undefined;

  return {
    productName: session.productName,
    baseColorHex,
    ...(shouldUseManBase ? { preserveGarmentSilhouette: true } : {}),
    ...(hasDynamicNeck ? { hasDynamicNeck: true } : {}),
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
    ...(resolvedLowerPocketLayout !== "none" && lowerPocketAssetPath
      ? { lowerPocketAssetPath }
      : {}),
    lowerPocketLayout: resolvedLowerPocketLayout,
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
            ...(() => {
              const sourceValueIds = activeLogoOptions.flatMap((option) =>
                option.sourceValueId === undefined ? [] : [option.sourceValueId],
              );

              return sourceValueIds.length > 0 ? { sourceValueIds } : {};
            })(),
          },
        }
      : {}),
    trimSections,
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
  const uniformPantsScene = ensureUniformPantsSidePocketForTrim(
    keepOnlyPantsTrimSectionsForUniformScene(pantsScene),
  );

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
