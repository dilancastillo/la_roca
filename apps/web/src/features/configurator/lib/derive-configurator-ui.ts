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
} from "@repo/shared/configurator-id-rules";
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
  pantsKneePatchRightModel?: PantsKneePatchModel | undefined;
  pantsKneePatchRightType?: PantsKneePatchType | undefined;
  pantsKneePatchLeftModel?: PantsKneePatchModel | undefined;
  pantsKneePatchLeftType?: PantsKneePatchType | undefined;
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
    sourceValueIds?: number[] | undefined;
  } | undefined;
  trimSections: Array<{
    valueId: number;
    sourceValueId?: number | undefined;
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

function isSharedUniformTrimSection(section: PreviewTrimSection) {
  return getUniformTrimSectionText(section).includes("pespunte");
}

function getUniformBlouseTrimSections(sections: PreviewTrimSection[]) {
  return sections.filter(
    (section) =>
      isBlouseUniformTrimSection(section) &&
      (!isPantsUniformTrimSection(section) || isSharedUniformTrimSection(section)),
  );
}

function getUniformPantsTrimSections(sections: PreviewTrimSection[]) {
  return sections.filter(
    (section) =>
      isPantsUniformTrimSection(section) || isSharedUniformTrimSection(section),
  );
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
    value.sourceValueId,
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
      value.sourceValueId,
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
    const configuredRole = roleEntries.find(([, valueIds]) =>
      valueIds.includes(section.sourceValueId ?? section.id),
    )?.[0] as
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
            ...(section.sourceValueId !== undefined
              ? { sourceValueId: section.sourceValueId }
              : {}),
            ...(role ? { role } : {}),
            key:
              getTrimSectionKeyBySourceValueId(section.sourceValueId) ??
              normalize(section.name).replace(/[^a-z0-9]+/g, "-"),
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

function getOptionName(
  value: Pick<KneePatchOption, "name"> | string | undefined,
) {
  return typeof value === "string" ? value : value?.name;
}

function isNoChestPocket(value: KneePatchOption | string | undefined) {
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

function isNoLogo(value: KneePatchOption | string | undefined) {
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

function isPantsSidePocketAttributeName(normalizedName: string) {
  return (
    normalizedName === "lateral" ||
    normalizedName === "internos" ||
    (normalizedName.includes("bolsillo") &&
      (normalizedName.includes("lateral") || normalizedName.includes("pretina")))
  );
}

function isDoubleZipperSidePocket(value: KneePatchOption | string | undefined) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.pantsSidePocket.doubleZipper)) return true;
  const valueName = getOptionName(value);
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return normalized.includes("doble") && normalized.includes("cremallera");
}

function isExternalSidePocket(value: KneePatchOption | string | undefined) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.pantsSidePocket.external)) return true;
  const valueName = getOptionName(value);
  return valueName ? normalize(valueName) === "externo" : false;
}

function isOriginalSidePocket(value: KneePatchOption | string | undefined) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.pantsSidePocket.original)) return true;
  const valueName = getOptionName(value);
  return valueName ? normalize(valueName) === "original" : false;
}

function isAsorsaludSidePocket(value: KneePatchOption | string | undefined) {
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

function isPespunteGarment(value: KneePatchOption | string | undefined) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.pespunte)) return true;
  const valueName = getOptionName(value);
  return valueName ? normalize(valueName).includes("pespunte") : false;
}

const BLUSA_PESPUNTE_STITCHING_DETAIL_IMAGE_SRC =
  "/assets/catalog/blusa-antifluido-t180/detail-overlays/blouse-model-45-pespunte-stitching.svg";
const BLUSA_PESPUNTE_MODEL_IMAGE_SRC =
  "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-45-pespunte.svg";
const BLUSA_CLOSED_NO_COLLAR_IMAGE_SRC =
  "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg";
const PANTALON_PESPUNTE_STITCHING_DETAIL_IMAGE_SRC =
  "/assets/catalog/pantalon/detail-overlays/pants-pespunte-stitching.svg";

function isYesOption(value: KneePatchOption | string | undefined) {
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
  toggleAttributeId: number;
  styleAttributeId: number;
  toggleTerms: string[];
  styleTerms: string[];
};

const textStyleAttributeDependencies: TextStyleAttributeDependency[] = [
  {
    toggleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textRightChest,
    styleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textRightChestStyle,
    toggleTerms: ["texto", "pecho", "derecho"],
    styleTerms: ["color", "fuente", "texto", "pecho", "derecho"],
  },
  {
    toggleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textAboveChestPocket,
    styleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textAboveChestPocketStyle,
    toggleTerms: ["texto", "pecho", "encima", "bolsillo"],
    styleTerms: ["color", "fuente", "texto", "pecho", "encima", "bolsillo"],
  },
  {
    toggleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textUpperChestPocket,
    styleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textUpperChestPocketStyle,
    toggleTerms: ["texto", "bolsillo", "superior", "pecho"],
    styleTerms: ["color", "fuente", "texto", "bolsillo", "superior", "pecho"],
  },
  {
    toggleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textLowerChestPocket,
    styleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textLowerChestPocketStyle,
    toggleTerms: ["texto", "bolsillo", "inferior", "pecho"],
    styleTerms: ["color", "fuente", "texto", "bolsillo", "inferior", "pecho"],
  },
  {
    toggleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textRightSleeve,
    styleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textRightSleeveStyle,
    toggleTerms: ["texto", "manga", "derecha"],
    styleTerms: ["color", "fuente", "texto", "manga", "derecha"],
  },
  {
    toggleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textLeftSleeve,
    styleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textLeftSleeveStyle,
    toggleTerms: ["texto", "manga", "izquierda"],
    styleTerms: ["color", "fuente", "texto", "manga", "izquierda"],
  },
  {
    toggleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textBack,
    styleAttributeId: CONFIGURATOR_ATTRIBUTE_IDS.textBackStyle,
    toggleTerms: ["texto", "espalda"],
    styleTerms: ["color", "fuente", "texto", "espalda"],
  },
];

function normalizedIncludesAll(normalizedValue: string, terms: string[]) {
  return terms.every((term) => normalizedValue.includes(term));
}

function isYesTextToggleValue(value: KneePatchOption | string) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.yes)) {
    return true;
  }

  const valueName = getOptionName(value);
  if (!valueName) {
    return false;
  }

  const normalized = normalize(valueName);

  return normalized === "si" || normalized === "con texto";
}

function findTextToggleAttribute(
  session: ConfiguratorSession,
  dependency: TextStyleAttributeDependency,
) {
  return findAttributeByIdOrName(session, dependency.toggleAttributeId, (name) =>
    normalizedIncludesAll(name, dependency.toggleTerms) &&
    !name.includes("color") &&
    !name.includes("fuente"),
  );
}

function getTextStyleDependencyForAttribute(
  attribute: ConfiguratorSession["attributes"][number],
) {
  const dependencyById = textStyleAttributeDependencies.find(
    (dependency) => dependency.styleAttributeId === attribute.id,
  );

  if (dependencyById) {
    return dependencyById;
  }

  const normalizedName = normalize(attribute.name);
  return normalizedName.includes("color") && normalizedName.includes("fuente")
    ? textStyleAttributeDependencies.find((dependency) =>
        normalizedIncludesAll(normalizedName, dependency.styleTerms),
      )
    : undefined;
}

function findTextStyleAttributes(
  session: ConfiguratorSession,
  toggleAttributeId: number,
  dependency: TextStyleAttributeDependency,
) {
  return session.attributes.filter(
    (attribute) =>
      attribute.id !== toggleAttributeId &&
      (attribute.id === dependency.styleAttributeId ||
        normalizedIncludesAll(normalize(attribute.name), dependency.styleTerms)),
  );
}

function isTextToggleAttributeForAdditionalEmbroidery(
  attribute: ConfiguratorSession["attributes"][number],
) {
  if (
    textStyleAttributeDependencies.some(
      (dependency) => dependency.toggleAttributeId === attribute.id,
    )
  ) {
    return true;
  }

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

function isOriginalBootValue(value: KneePatchOption | string) {
  if (hasSourceValueId(typeof value === "string" ? undefined : value, CONFIGURATOR_VALUE_IDS.originalBoot)) {
    return true;
  }

  const valueName = getOptionName(value);
  if (!valueName) {
    return false;
  }

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
  const bootTypeAttribute = findAttributeByIdOrName(
    session,
    CONFIGURATOR_ATTRIBUTE_IDS.bootType,
    isBootTypeAttributeName,
  );

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
      attribute.id === CONFIGURATOR_ATTRIBUTE_IDS.bootLength ||
      attribute.id === CONFIGURATOR_ATTRIBUTE_IDS.bootWidth ||
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

  if (isOriginalBootValue(selectedBootType)) {
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
    ).some((value) => isYesTextToggleValue(value));

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
        styleAttribute.values.find((value) =>
          hasSourceValueId(value, CONFIGURATOR_VALUE_IDS.textStyle),
        ) ??
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
        isYesTextToggleValue(value),
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
  const toggleAttribute = findAttributeByIdOrName(
    session,
    CONFIGURATOR_ATTRIBUTE_IDS.lowerPocketZipper,
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
  ).some((value) => isYesTextToggleValue(value));

  if (isEnabled) {
    return hiddenAttributeIds;
  }

  for (const attribute of session.attributes) {
    if (
      attribute.id === CONFIGURATOR_ATTRIBUTE_IDS.lowerPocketType ||
      normalize(attribute.name) === "opciones de cremallera"
    ) {
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

  const additionalEmbroideryAttribute = findAttributeByIdOrName(
    session,
    CONFIGURATOR_ATTRIBUTE_IDS.additionalEmbroidery,
    (name) => name.includes("bordados") && name.includes("adicionales"),
  );

  if (!additionalEmbroideryAttribute) {
    return hiddenAttributeIds;
  }

  const hasAdditionalEmbroidery = getSelectedOptions(
    additionalEmbroideryAttribute,
    selectedValueIds,
  ).some((value) => isYesTextToggleValue(value));

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

function getHiddenAdditionalPantsPocketAttributeIds(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const hiddenAttributeIds = new Set<number>();
  const isPantsConfiguration =
    isUniformeSession(session) || normalize(session.graphicManifestKey) === "pantalon";

  if (!isPantsConfiguration) {
    return hiddenAttributeIds;
  }

  const additionalPocketsAttribute = findAttributeByIdOrName(
    session,
    CONFIGURATOR_ATTRIBUTE_IDS.additionalPantsPockets,
    (name) => name.includes("bolsillos adicionales") && name.includes("pantalon"),
  );

  if (!additionalPocketsAttribute) {
    return hiddenAttributeIds;
  }

  const hasAdditionalPockets = getSelectedOptions(
    additionalPocketsAttribute,
    selectedValueIds,
  ).some((value) => isYesTextToggleValue(value));

  if (hasAdditionalPockets) {
    return hiddenAttributeIds;
  }

  const dependentAttributeIds = new Set<number>([
    CONFIGURATOR_ATTRIBUTE_IDS.backPocketModel,
    CONFIGURATOR_ATTRIBUTE_IDS.backPocketType,
    CONFIGURATOR_ATTRIBUTE_IDS.rightKneePatchModel,
    CONFIGURATOR_ATTRIBUTE_IDS.rightKneePatchType,
    CONFIGURATOR_ATTRIBUTE_IDS.leftKneePatchModel,
    CONFIGURATOR_ATTRIBUTE_IDS.leftKneePatchType,
  ]);
  const dependentAttributeNames = new Set([
    "modelo bolsillo trasero",
    "tipo de bolsillo trasero",
    "modelo bolsillo de parche rodilla derecha",
    "tipo de bolsillo de parche rodilla derecha",
    "modelo bolsillo de parche rodilla izquierda",
    "tipo de bolsillo de parche rodilla izquierda",
  ]);

  for (const attribute of session.attributes) {
    if (
      dependentAttributeIds.has(attribute.id) ||
      dependentAttributeNames.has(normalize(attribute.name))
    ) {
      hiddenAttributeIds.add(attribute.id);
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
    ...getHiddenAdditionalPantsPocketAttributeIds(
      session,
      selectedValueIds,
    ),
  ]);
}

function getHiddenGenderAttributeIds(
  session: ConfiguratorSession,
  selectedValueIds: Record<string, number[]>,
) {
  const hiddenAttributeIds = new Set<number>();
  const genderAttribute = findAttributeByIdOrName(
    session,
    CONFIGURATOR_ATTRIBUTE_IDS.gender,
    (name) => name === "genero",
  );

  if (!genderAttribute) {
    return hiddenAttributeIds;
  }

  const isWoman = getSelectedOptions(genderAttribute, selectedValueIds).some(
    (value) =>
      hasSourceValueId(value, CONFIGURATOR_VALUE_IDS.woman) ||
      normalize(value.name) === "mujer",
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
    (option) => !isNoLogo(option),
  );
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
  const hasLogoSelection = activeLogoOptions.length > 0;
  const lowerPocketLayout = getLowerPocketLayout(session, selectedValueIds);
  const neckImageSrc = selectedNeck
    ? getImageSource(session.graphicManifestKey, neckAttribute!, selectedNeck)
    : undefined;
  const shouldUseClosedBlouseWithoutNeck =
    session.graphicManifestKey.includes("blusa") && !neckImageSrc;
  const selectedGarmentIsPespunte = isPespunteGarment(selectedGarment);
  const garmentImageSrc = shouldUseClosedBlouseWithoutNeck
    ? BLUSA_CLOSED_NO_COLLAR_IMAGE_SRC
    : selectedGarment
    ? getImageSource(session.graphicManifestKey, garmentAttribute!, selectedGarment) ??
      getDefaultImageSource(session.graphicManifestKey)
    : getDefaultImageSource(session.graphicManifestKey);
  const selectedGarmentDetailImageSrc = selectedGarment
    ? getGarmentDetailImageSourceForValue(
        session.graphicManifestKey,
        garmentAttribute!.id,
        selectedGarment.id,
        garmentAttribute!.name,
        selectedGarment.name,
        selectedGarment.sourceValueId,
      )
    : undefined;
  const garmentModelDetailImageSrc = selectedGarment
    ? garmentImageSrc === BLUSA_PESPUNTE_MODEL_IMAGE_SRC
      ? undefined
      : shouldUseClosedBlouseWithoutNeck && selectedGarmentIsPespunte
        ? BLUSA_PESPUNTE_STITCHING_DETAIL_IMAGE_SRC
        : selectedGarmentDetailImageSrc
    : undefined;
  const sleeveDetailImageSrc = selectedSleeveModel
    ? getGarmentDetailImageSourceForValue(
        session.graphicManifestKey,
        sleeveModelAttribute!.id,
        selectedSleeveModel.id,
        sleeveModelAttribute!.name,
        selectedSleeveModel.name,
        selectedSleeveModel.sourceValueId,
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
        selectedBootModel.sourceValueId,
      )
    : undefined;
  const waistbandImageSrc = selectedWaistbandModel
    ? getWaistbandImageSourceForValue(
        session.graphicManifestKey,
        waistbandModelAttribute!.id,
        selectedWaistbandModel.id,
        waistbandModelAttribute!.name,
        selectedWaistbandModel.name,
        selectedWaistbandModel.sourceValueId,
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
          selectedAuxiliaryPocketType ?? selectedLowerPocketType,
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
        !isNoChestPocket(selectedChestPocketModel) &&
        isVisibleChestPocketModel(selectedChestPocketModel.name)
          ? getImageSource(
              session.graphicManifestKey,
              chestPocketModelAttribute!,
              selectedChestPocketModel,
            ) ?? getDefaultChestPocketImageSource(session.graphicManifestKey)
          : undefined,
      logoMarker: hasLogoSelection
        ? {
            placement: activeLogoOptions.map((option) => option.name).join(", "),
            ...(() => {
              const sourceValueIds = activeLogoOptions.flatMap((option) =>
                option.sourceValueId === undefined ? [] : [option.sourceValueId],
              );

              return sourceValueIds.length > 0 ? { sourceValueIds } : {};
            })(),
          }
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
