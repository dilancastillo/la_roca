import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import {
  getLowerPocketLayout,
  type LowerPocketLayout,
} from "@repo/shared/lower-pocket-rules";
import { getImageSourceByIds, getProductAssetCatalog } from "./asset-catalog";

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
  lowerPocketLayout: LowerPocketLayout;
  auxiliaryPocketImageSrc?: string | undefined;
  chestPocketType?: string | undefined;
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
  attributeId: number,
  valueId: number,
) {
  return getImageSourceByIds(graphicManifestKey, attributeId, valueId);
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
      Boolean(getImageSource(session.graphicManifestKey, attribute.id, value.id)),
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
  const catalog = getProductAssetCatalog(session.graphicManifestKey);
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

  if (enabledSections.length === 0) {
    return [];
  }

  const globalColor = findSelectedValue(colorAttributes[0], selectedValueIds);
  const roleEntries = Object.entries(catalog?.trimSectionValueIds ?? {});

  return enabledSections.map((section) => {
    const matchingColorAttribute = colorAttributes.find((attribute) =>
      normalize(attribute.name).includes(normalize(section.name)),
    );
    const sectionColor =
      findSelectedValue(matchingColorAttribute, selectedValueIds) ?? globalColor;
    const role = roleEntries.find(([, valueId]) => valueId === section.id)?.[0] as
      | PreviewScene["trimSections"][number]["role"]
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
    options: attribute.values.map((value) => ({
      id: value.id,
      name: value.name,
      ...(value.colorHex ? { colorHex: value.colorHex } : {}),
      ...(getImageSource(session.graphicManifestKey, attribute.id, value.id)
        ? {
            imageSrc: getImageSource(
              session.graphicManifestKey,
              attribute.id,
              value.id,
            ),
          }
        : {}),
    })),
  }));

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
        ? getImageSource(
            session.graphicManifestKey,
            neckAttribute?.id ?? 0,
            selectedNeck.id,
          )
        : undefined,
      lowerPocketImageSrc: lowerPocketLayout !== "none" && selectedLowerPocketModel
        ? getImageSource(
            session.graphicManifestKey,
            lowerPocketModelAttribute?.id ?? 0,
            selectedLowerPocketModel.id,
          )
        : undefined,
      lowerPocketLayout,
      auxiliaryPocketImageSrc: selectedAuxiliaryPocketModel
        ? getImageSource(
            session.graphicManifestKey,
            auxiliaryPocketModelAttribute?.id ?? 0,
            selectedAuxiliaryPocketModel.id,
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
