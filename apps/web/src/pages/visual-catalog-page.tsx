import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  VISUAL_CATALOG_SVG_MAX_BYTES,
  type VisualActivationCondition,
  type VisualCatalogOdooAttribute,
  type VisualCatalogProduct,
  type VisualDefinition,
  type VisualDefinitionSummary,
  type VisualElementPaint,
  type VisualLayer,
  type VisualPlacement,
  type VisualRenderMode,
  type VisualRelease,
  type VisualSlot,
} from "@repo/shared/schemas/visual-catalog";
import { logout } from "../features/auth/api";
import { useAuthSession } from "../features/auth/hooks/use-auth-session";
import {
  approveVisualDefinition,
  cloneVisualDefinition,
  createVisualDefinition,
  fetchVisualCatalogAudit,
  fetchVisualCatalogProducts,
  fetchVisualDefinition,
  fetchVisualDefinitions,
  fetchVisualReleaseAudit,
  fetchVisualReleases,
  submitVisualDefinition,
  updateVisualDefinition,
} from "../features/visual-catalog/api";
import { VisualReleaseManager } from "../features/visual-catalog/visual-release-manager";
import {
  buildRuntimeHighlightPreviewDataUri,
  buildRuntimePreviewDataUri,
  buildRuntimeVisualSvg,
  buildSelectableSvgMarkup,
  indexVisualSvg,
  type IndexedVisualSvg,
} from "../features/visual-catalog/lib/svg-editor";
import {
  getCompatibleVisualCatalogAttributes,
  isBindingAttributeInVisualSlot,
  isTrimValueInVisualSlot,
} from "../features/visual-catalog/lib/odoo-option-compatibility";
import { ApiError } from "../lib/api-client";

const SLOT_OPTIONS: Array<{
  value: VisualSlot;
  label: string;
}> = [
  { value: "neck", label: "Cuello" },
  { value: "lower_pocket", label: "Bolsillo inferior" },
  { value: "boot", label: "Bota" },
];

const LAYER_OPTIONS: Array<{ value: VisualLayer; label: string }> = [
  { value: "structure", label: "1. Estructura" },
  { value: "component", label: "2. Componente" },
  { value: "detail", label: "3. Detalle" },
  { value: "accent", label: "4. Vivo o acento" },
];

const DEFAULT_PLACEMENT: VisualPlacement = {
  targetWidth: 1080,
  targetHeight: 1350,
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
};

const REFERENCE_ASSET_BY_SLOT: Record<VisualSlot, string> = {
  neck:
    "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar.svg",
  lower_pocket:
    "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-model-01.svg",
  boot: "/assets/catalog/pantalon/svg-clean/pants-model-01.svg",
};

const MEN_CLOSED_NO_COLLAR_REFERENCE_ASSET =
  "/assets/catalog/blusa-antifluido-t180/svg-clean/blouse-base-closed-no-collar-men.svg";

type EditorReferenceSilhouette = "woman" | "man";

const PAINT_OPTIONS: Array<{
  value: VisualElementPaint["mode"];
  label: string;
}> = [
  { value: "preserve", label: "Conservar original" },
  { value: "base_fill", label: "Prenda, relleno" },
  { value: "base_stroke", label: "Prenda, linea" },
  { value: "trim_fill", label: "Vivo, relleno" },
  { value: "trim_stroke", label: "Vivo, linea" },
  { value: "outline", label: "Contorno" },
];

type CommonAttribute = VisualCatalogOdooAttribute;

function getGenderActivationCondition(
  attributes: CommonAttribute[],
  silhouette: EditorReferenceSilhouette,
): VisualActivationCondition | null {
  const genderAttribute = attributes.find(
    (attribute) => normalize(attribute.name) === "genero",
  );
  const expectedValueName = silhouette === "man" ? "hombre" : "mujer";
  const genderValue = genderAttribute?.values.find(
    (value) => normalize(value.name) === expectedValueName,
  );

  if (!genderAttribute || !genderValue) {
    return null;
  }

  return {
    attributeId: genderAttribute.id,
    attributeName: genderAttribute.name,
    sourceValueIds: [genderValue.sourceValueId],
    valueNames: [genderValue.name],
  };
}

function withGenderActivationCondition(
  conditions: VisualActivationCondition[],
  genderCondition: VisualActivationCondition,
) {
  return [
    ...conditions.filter(
      (condition) => condition.attributeId !== genderCondition.attributeId,
    ),
    genderCondition,
  ];
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .toLowerCase();
}

function supportsSlot(product: VisualCatalogProduct, slot: VisualSlot) {
  return slot === "boot"
    ? product.family === "pants" || product.family === "uniform"
    : product.family === "blouse" || product.family === "uniform";
}

function getFamilyLabel(product: VisualCatalogProduct) {
  if (product.family === "blouse") return "Blusa";
  if (product.family === "pants") return "Pantalon";
  return "Uniforme";
}

function hasSameProductScope(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  const rightIds = new Set(right);
  return left.every((id) => rightIds.has(id));
}

function getCommonAttributes(products: VisualCatalogProduct[]) {
  const [firstProduct, ...remainingProducts] = products;

  if (!firstProduct) {
    return [] as CommonAttribute[];
  }

  return firstProduct.attributes
    .filter((attribute) =>
      remainingProducts.every((product) =>
        product.attributes.some((candidate) => candidate.id === attribute.id),
      ),
    )
    .map((attribute) => ({
      ...attribute,
      values: attribute.values.filter((value) =>
        remainingProducts.every((product) =>
          product.attributes
            .find((candidate) => candidate.id === attribute.id)
            ?.values.some(
              (candidate) =>
                candidate.sourceValueId === value.sourceValueId,
            ),
        ),
      ),
    }))
    .filter((attribute) => attribute.values.length > 0);
}

function getSortedBindingAttributes(
  attributes: CommonAttribute[],
  slot: VisualSlot,
) {
  return attributes.filter((attribute) =>
    isBindingAttributeInVisualSlot(slot, attribute),
  );
}

function getTrimOptions(attributes: CommonAttribute[], slot: VisualSlot) {
  return attributes
    .filter((attribute) => {
      const name = normalize(attribute.name);
      return (
        name.includes("seccion de vivo") ||
        (name.includes("vivo") && !name.includes("color"))
      );
    })
    .flatMap((attribute) =>
      attribute.values
        .filter((value) => isTrimValueInVisualSlot(slot, value))
        .map((value) => ({
          id: value.sourceValueId,
          label: `${attribute.name}: ${value.name}`,
        })),
    );
}

function getDefinitionStatusLabel(
  status: VisualDefinitionSummary["status"],
) {
  if (status === "draft") return "Borrador";
  if (status === "review") return "En revision";
  if (status === "approved") return "Aprobado";
  if (status === "published") return "Publicado";
  return "Archivado";
}

function getReferenceAsset(slot: VisualSlot) {
  return REFERENCE_ASSET_BY_SLOT[slot];
}

function getPreviewReferenceAsset(
  slot: VisualSlot,
  silhouette: EditorReferenceSilhouette,
) {
  // El selector del editor es solo una herramienta de revisión. La referencia
  // guardada continúa siendo la base canónica del slot para no versionar la
  // misma definición una vez por cada silueta.
  return silhouette === "man" && slot !== "boot"
    ? MEN_CLOSED_NO_COLLAR_REFERENCE_ASSET
    : getReferenceAsset(slot);
}

function findSourceValueId(
  definition: VisualDefinition,
  products: VisualCatalogProduct[],
) {
  if (definition.binding.sourceValueId) {
    return definition.binding.sourceValueId;
  }

  for (const productTemplateId of definition.binding.productTemplateIds) {
    const product = products.find(
      (candidate) => candidate.id === productTemplateId,
    );
    const attribute = product?.attributes.find(
      (candidate) => candidate.id === definition.binding.attributeId,
    );
    const value = attribute?.values.find(
      (candidate) => candidate.id === definition.binding.valueId,
    );

    if (value) {
      return value.sourceValueId;
    }
  }

  return null;
}

function getDefinitionOdooIssues(
  definition: VisualDefinitionSummary,
  products: VisualCatalogProduct[],
) {
  const issues: string[] = [];
  const productMap = new Map(products.map((product) => [product.id, product]));
  const elementConditions = Object.values(definition.elementPaints).flatMap(
    (paint) => paint.visibilityConditions,
  );
  const trimIds = Array.from(
    new Set(
      Object.values(definition.elementPaints)
        .map((paint) => paint.trimSourceValueId)
        .filter((value): value is number => value !== undefined),
    ),
  );

  for (const productTemplateId of definition.binding.productTemplateIds) {
    const product = productMap.get(productTemplateId);

    if (!product) {
      issues.push(`Plantilla ${productTemplateId} no disponible.`);
      continue;
    }

    const attribute = product.attributes.find(
      (candidate) => candidate.id === definition.binding.attributeId,
    );
    const hasBinding = definition.binding.sourceValueId
      ? attribute?.values.some(
          (value) =>
            value.sourceValueId === definition.binding.sourceValueId,
        )
      : attribute?.values.some(
          (value) => value.id === definition.binding.valueId,
        );

    if (!hasBinding) {
      issues.push(
        `${product.name} ya no contiene ${definition.binding.valueName}.`,
      );
    }

    for (const condition of [
      ...definition.activationConditions,
      ...elementConditions,
    ]) {
      const conditionAttribute = product.attributes.find(
        (candidate) => candidate.id === condition.attributeId,
      );
      const hasAllValues = condition.sourceValueIds.every((sourceValueId) =>
        conditionAttribute?.values.some(
          (value) => value.sourceValueId === sourceValueId,
        ),
      );

      if (!conditionAttribute || !hasAllValues) {
        issues.push(
          `${product.name} no contiene la condicion ${condition.attributeName}.`,
        );
      }
    }

    for (const trimId of trimIds) {
      if (
        !product.attributes.some((candidate) =>
          candidate.values.some(
            (value) => value.sourceValueId === trimId,
          ),
        )
      ) {
        issues.push(`${product.name} no contiene el vivo ID ${trimId}.`);
      }
    }
  }

  return Array.from(new Set(issues));
}

function ConditionsEditor({
  title,
  attributes,
  conditions,
  onChange,
  compact = false,
}: {
  title: string;
  attributes: CommonAttribute[];
  conditions: VisualActivationCondition[];
  onChange: (conditions: VisualActivationCondition[]) => void;
  compact?: boolean;
}) {
  function addCondition() {
    const attribute = attributes[0];
    const value = attribute?.values[0];

    if (!attribute || !value) {
      return;
    }

    onChange([
      ...conditions,
      {
        attributeId: attribute.id,
        attributeName: attribute.name,
        sourceValueIds: [value.sourceValueId],
        valueNames: [value.name],
      },
    ]);
  }

  function updateAttribute(index: number, attributeId: number) {
    const attribute = attributes.find(
      (candidate) => candidate.id === attributeId,
    );
    const value = attribute?.values[0];

    if (!attribute || !value) {
      return;
    }

    onChange(
      conditions.map((condition, conditionIndex) =>
        conditionIndex === index
          ? {
              attributeId: attribute.id,
              attributeName: attribute.name,
              sourceValueIds: [value.sourceValueId],
              valueNames: [value.name],
            }
          : condition,
      ),
    );
  }

  function updateValues(index: number, sourceValueIds: number[]) {
    const condition = conditions[index];
    const attribute = attributes.find(
      (candidate) => candidate.id === condition?.attributeId,
    );

    if (!condition || !attribute) {
      return;
    }

    onChange(
      conditions.map((candidate, conditionIndex) =>
        conditionIndex === index
          ? {
              ...candidate,
              sourceValueIds,
              valueNames: attribute.values
                .filter((value) =>
                  sourceValueIds.includes(value.sourceValueId),
                )
                .map((value) => value.name),
            }
          : candidate,
      ),
    );
  }

  return (
    <div
      className={`catalog-condition-editor${compact ? " catalog-condition-editor--compact" : ""}`}
    >
      <div className="catalog-condition-editor__heading">
        <strong>{title}</strong>
        <button
          type="button"
          onClick={addCondition}
          disabled={attributes.length === 0}
        >
          Agregar condicion
        </button>
      </div>
      {conditions.length === 0 ? (
        <p className="catalog-empty">
          Sin condiciones adicionales.
        </p>
      ) : (
        conditions.map((condition, index) => {
          const attribute = attributes.find(
            (candidate) => candidate.id === condition.attributeId,
          );

          return (
            <div
              className="catalog-condition-row"
              key={`${condition.attributeId}-${index}`}
            >
              <label>
                Atributo
                <select
                  value={condition.attributeId}
                  onChange={(event) =>
                    updateAttribute(index, Number(event.target.value))
                  }
                >
                  {!attribute ? (
                    <option value={condition.attributeId}>
                      {condition.attributeName} (no disponible)
                    </option>
                  ) : null}
                  {attributes.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Valores alternativos (OR)
                <select
                  multiple
                  size={Math.min(4, Math.max(2, attribute?.values.length ?? 2))}
                  value={condition.sourceValueIds.map(String)}
                  onChange={(event) =>
                    updateValues(
                      index,
                      Array.from(event.target.selectedOptions).map((option) =>
                        Number(option.value),
                      ),
                    )
                  }
                >
                  {attribute?.values.map((value) => (
                    <option
                      key={value.sourceValueId}
                      value={value.sourceValueId}
                    >
                      {value.name} (ID {value.sourceValueId})
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="catalog-condition-row__remove"
                onClick={() =>
                  onChange(
                    conditions.filter(
                      (_candidate, conditionIndex) =>
                        conditionIndex !== index,
                    ),
                  )
                }
              >
                Quitar
              </button>
            </div>
          );
        })
      )}
      {!compact ? (
        <small>
          Todas las filas deben cumplirse (AND). Dentro de una fila puede
          cumplirse cualquiera de los valores seleccionados (OR).
        </small>
      ) : null}
    </div>
  );
}

export function VisualCatalogPage() {
  const sourceCanvasRef = useRef<HTMLDivElement>(null);
  const authQuery = useAuthSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState<
    "editor" | "catalog" | "releases" | "audit"
  >(() =>
    new URLSearchParams(location.search).get("tab") === "releases"
      ? "releases"
      : "editor",
  );
  const [definitions, setDefinitions] = useState<VisualDefinitionSummary[]>([]);
  const [releases, setReleases] = useState<VisualRelease[]>([]);
  const [activeReleaseId, setActiveReleaseId] = useState<string | null>(null);
  const [auditEvents, setAuditEvents] = useState<
    Awaited<ReturnType<typeof fetchVisualCatalogAudit>>
  >([]);
  const [releaseAuditEvents, setReleaseAuditEvents] = useState<
    Awaited<ReturnType<typeof fetchVisualReleaseAudit>>
  >([]);
  const [products, setProducts] = useState<VisualCatalogProduct[]>([]);
  const [productsRefreshedAt, setProductsRefreshedAt] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [slot, setSlot] = useState<VisualSlot>("neck");
  const [layer, setLayer] = useState<VisualLayer>("component");
  const [attributeId, setAttributeId] = useState<number | null>(null);
  const [valueSourceId, setValueSourceId] = useState<number | null>(null);
  const [activationConditions, setActivationConditions] = useState<
    VisualActivationCondition[]
  >([]);
  const [displayName, setDisplayName] = useState("");
  const [originalSvg, setOriginalSvg] = useState("");
  const [sourceFileName, setSourceFileName] = useState("");
  const [indexedSvg, setIndexedSvg] = useState<IndexedVisualSvg | null>(null);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [highlightedElementId, setHighlightedElementId] = useState<
    string | null
  >(null);
  const [elementPaints, setElementPaints] = useState<
    Record<string, VisualElementPaint>
  >({});
  const [placement, setPlacement] =
    useState<VisualPlacement>(DEFAULT_PLACEMENT);
  // Overlay es el valor seguro: un SVG solo reemplaza la base por decisión
  // explícita del editor, nunca porque un vector sea el más grande.
  const [renderMode, setRenderMode] = useState<VisualRenderMode>("overlay");
  const [referenceSilhouette, setReferenceSilhouette] =
    useState<EditorReferenceSilhouette>("woman");
  const [editingDefinitionId, setEditingDefinitionId] = useState<string | null>(
    null,
  );
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const compatibleProducts = useMemo(
    () => products.filter((product) => supportsSlot(product, slot)),
    [products, slot],
  );
  const selectedProducts = useMemo(
    () =>
      compatibleProducts.filter((product) =>
        selectedProductIds.includes(product.id),
      ),
    [compatibleProducts, selectedProductIds],
  );
  const commonAttributes = useMemo(
    () => getCommonAttributes(selectedProducts),
    [selectedProducts],
  );
  const bindingAttributes = useMemo(
    () => getSortedBindingAttributes(commonAttributes, slot),
    [commonAttributes, slot],
  );
  const selectedAttribute =
    bindingAttributes.find((attribute) => attribute.id === attributeId) ??
    null;
  const selectedValue =
    selectedAttribute?.values.find(
      (value) => value.sourceValueId === valueSourceId,
    ) ?? null;
  const compatibleAttributes = useMemo(
    () =>
      getCompatibleVisualCatalogAttributes(
        selectedProducts,
        commonAttributes,
        selectedAttribute && selectedValue
          ? {
              attributeId: selectedAttribute.id,
              sourceValueId: selectedValue.sourceValueId,
            }
          : null,
      ),
    [commonAttributes, selectedAttribute, selectedProducts, selectedValue],
  );
  const reusableSelectionCandidates = useMemo(() => {
    if (!indexedSvg || !selectedAttribute || !selectedValue) {
      return [];
    }

    const activeDefinitionIds = new Set(
      releases.find((release) => release.id === activeReleaseId)
        ?.definitionIds ?? [],
    );
    const selectedScope = selectedProducts.map((product) => product.id);

    return definitions
      .filter((definition) => {
        const definitionSourceValueId =
          definition.binding.sourceValueId ?? definition.binding.valueId;

        return (
          definition.id !== editingDefinitionId &&
          definition.slot === slot &&
          definition.layer === layer &&
          definition.binding.attributeId === selectedAttribute.id &&
          definitionSourceValueId === selectedValue.sourceValueId &&
          hasSameProductScope(
            definition.binding.productTemplateIds,
            selectedScope,
          ) &&
          definition.selectedElementIds.length > 0 &&
          (activeDefinitionIds.has(definition.id) ||
            definition.status === "published" ||
            definition.status === "approved")
        );
      })
      .sort((left, right) => {
        const priority = (definition: VisualDefinitionSummary) => {
          if (activeDefinitionIds.has(definition.id)) return 3;
          if (definition.status === "published") return 2;
          return 1;
        };
        return priority(right) - priority(left) || right.version - left.version;
      });
  }, [
    activeReleaseId,
    definitions,
    editingDefinitionId,
    indexedSvg,
    layer,
    releases,
    selectedAttribute,
    selectedProducts,
    selectedValue,
    slot,
  ]);
  const trimOptions = useMemo(
    () => getTrimOptions(commonAttributes, slot),
    [commonAttributes, slot],
  );
  const referenceAssetSrc = getReferenceAsset(slot);
  const previewReferenceAssetSrc = getPreviewReferenceAsset(
    slot,
    referenceSilhouette,
  );
  const canReplaceBase = slot === "neck";
  // La composición completa es una decisión explícita. El mismo SVG Hombre
  // puede aportar solo cuello, vivos o piezas seleccionadas sobre la base.
  const effectiveRenderMode: VisualRenderMode =
    canReplaceBase ? renderMode : "overlay";
  const uploadedSilhouetteIsActive = effectiveRenderMode === "replace_base";
  const selectableMarkup = useMemo(
    () =>
      indexedSvg
        ? buildSelectableSvgMarkup(
            indexedSvg.normalizedSvg,
            selectedElementIds,
          )
        : "",
    [indexedSvg, selectedElementIds],
  );
  const runtimePreviewSrc = useMemo(() => {
    if (!indexedSvg || selectedElementIds.length === 0) {
      return "";
    }

    try {
      return buildRuntimePreviewDataUri(
        buildRuntimeVisualSvg({
          normalizedSvg: indexedSvg.normalizedSvg,
          selectedElementIds,
          elementPaints,
          placement,
          allowIncompletePaints: true,
          renderMode: effectiveRenderMode,
        }),
      );
    } catch {
      return "";
    }
  }, [effectiveRenderMode, elementPaints, indexedSvg, placement, selectedElementIds]);
  // Un SVG Hombre completo se previsualiza tal cual fue cargado. No se recorta ni
  // se combina con una silueta Mujer: esa composición fue la causa de sisas
  // deformadas y ya no representa el render real del laboratorio.
  const displayedRuntimePreviewSrc = runtimePreviewSrc;
  const runtimeHighlightSrc = useMemo(() => {
    if (
      !indexedSvg ||
      !highlightedElementId ||
      !selectedElementIds.includes(highlightedElementId)
    ) {
      return "";
    }

    try {
      const activePaint = elementPaints[highlightedElementId] ?? {
        mode: "preserve" as const,
        visibilityConditions: [],
      };
      const highlightSvg = buildRuntimeVisualSvg({
        normalizedSvg: indexedSvg.normalizedSvg,
        selectedElementIds: [highlightedElementId],
        elementPaints: {
          [highlightedElementId]: {
            ...activePaint,
            visibilityConditions: [],
          },
        },
        placement,
      });
      const highlightChannel =
        activePaint.mode === "base_fill" || activePaint.mode === "trim_fill"
          ? "fill"
          : activePaint.mode === "base_stroke" ||
              activePaint.mode === "outline"
            ? "stroke"
            : activePaint.mode === "trim_stroke"
              ? highlightSvg.includes("fill:__VC_TRIM_STROKE_")
                ? "fill"
                : "stroke"
              : "both";
      return buildRuntimeHighlightPreviewDataUri(
        highlightSvg,
        highlightChannel,
      );
    } catch {
      return "";
    }
  }, [
    elementPaints,
    highlightedElementId,
    indexedSvg,
    placement,
    selectedElementIds,
  ]);
  // La capa de selección usa la misma geometría íntegra que el SVG cargado.
  const displayedRuntimeHighlightSrc = runtimeHighlightSrc;

  async function refreshVersions() {
    const [nextDefinitions, nextAudit, nextReleases, nextReleaseAudit] = await Promise.all([
      fetchVisualDefinitions(),
      fetchVisualCatalogAudit(),
      fetchVisualReleases(),
      fetchVisualReleaseAudit(),
    ]);
    setDefinitions(nextDefinitions);
    setAuditEvents(nextAudit);
    setReleases(nextReleases.releases);
    setActiveReleaseId(nextReleases.activeReleaseId);
    setReleaseAuditEvents(nextReleaseAudit);
  }

  async function refreshProducts(forceRefresh = false) {
    setIsLoadingProducts(true);
    try {
      let result = await fetchVisualCatalogProducts(forceRefresh);
      if (!forceRefresh && result.products.length === 0) {
        result = await fetchVisualCatalogProducts(true);
      }
      setProducts(result.products);
      setProductsRefreshedAt(result.refreshedAt);
    } finally {
      setIsLoadingProducts(false);
    }
  }

  async function refreshCatalog(forceOdooRefresh = false) {
    await Promise.all([
      refreshVersions(),
      refreshProducts(forceOdooRefresh),
    ]);
  }

  useEffect(() => {
    if (!authQuery.data?.user.isAdmin) {
      return;
    }

    void refreshCatalog().catch((refreshError) => {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "No se pudo cargar el catalogo visual.",
      );
    });
  }, [authQuery.data?.user.isAdmin]);

  useEffect(() => {
    if (
      attributeId !== null &&
      !bindingAttributes.some((attribute) => attribute.id === attributeId)
    ) {
      setAttributeId(null);
      setValueSourceId(null);
    }
  }, [attributeId, bindingAttributes]);

  useEffect(() => {
    if (
      valueSourceId !== null &&
      !selectedAttribute?.values.some(
        (value) => value.sourceValueId === valueSourceId,
      )
    ) {
      setValueSourceId(null);
    }
  }, [selectedAttribute, valueSourceId]);

  useEffect(() => {
    if (!editingDefinitionId && selectedValue) {
      setDisplayName(selectedValue.name);
    }
  }, [editingDefinitionId, selectedValue]);

  if (authQuery.isLoading) {
    return <main className="state-page">Validando sesion...</main>;
  }

  if (
    authQuery.error instanceof ApiError &&
    authQuery.error.status === 401
  ) {
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (!authQuery.data?.user.isAdmin) {
    return (
      <main className="state-page">
        <h1>Acceso restringido</h1>
        <button
          type="button"
          className="secondary-button"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </main>
    );
  }

  function clearNotices() {
    setError("");
    setMessage("");
  }

  async function handleRefreshOdoo() {
    clearNotices();
    setIsBusy(true);

    try {
      await refreshProducts(true);
      setMessage(
        "Productos, atributos, valores y exclusiones actualizados desde Odoo.",
      );
    } catch (refreshError) {
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "No se pudo actualizar desde Odoo.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSvgFile(file: File | undefined) {
    clearNotices();

    if (!file) {
      return;
    }

    if (
      !file.name.toLowerCase().endsWith(".svg") &&
      file.type !== "image/svg+xml"
    ) {
      setError("El catalogo visual admite solamente archivos SVG.");
      return;
    }

    if (file.size > VISUAL_CATALOG_SVG_MAX_BYTES) {
      setError("El SVG supera el limite de 800 KB.");
      return;
    }

    try {
      const svgText = await file.text();
      const indexed = indexVisualSvg(svgText);
      setOriginalSvg(svgText);
      setSourceFileName(file.name);
      setIndexedSvg(indexed);
      setSelectedElementIds([]);
      setHighlightedElementId(null);
      setElementPaints({});
      setRenderMode("overlay");
      setMessage(`${indexed.elements.length} elementos disponibles.`);
    } catch (fileError) {
      setError(
        fileError instanceof Error
          ? fileError.message
          : "No se pudo procesar el SVG.",
      );
    }
  }

  function handleSvgElementClick(event: ReactMouseEvent<HTMLDivElement>) {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const selectableElement = target.closest<SVGElement>("[data-vc-id]");
    const elementId = selectableElement?.dataset.vcId;

    if (!elementId) {
      return;
    }

    const isDeselecting = selectedElementIds.includes(elementId);

    setSelectedElementIds((current) =>
      isDeselecting
        ? current.filter((id) => id !== elementId)
        : [...current, elementId],
    );
    setElementPaints((current) => {
      if (isDeselecting) {
        const next = { ...current };
        delete next[elementId];
        return next;
      }

      return current[elementId]
        ? current
        : {
            ...current,
            [elementId]: {
              mode: "preserve",
              visibilityConditions: [],
            },
          };
    });
  }

  async function handleReusePublishedSelection() {
    clearNotices();

    if (!indexedSvg || reusableSelectionCandidates.length === 0) {
      setError("No existe una version publicada compatible para recuperar.");
      return;
    }

    setIsBusy(true);
    try {
      const availableElementIds = new Set(
        indexedSvg.elements.map((element) => element.id),
      );

      for (const summary of reusableSelectionCandidates) {
        const definition = await fetchVisualDefinition(summary.id);
        const hasExactSvg =
          definition.normalizedSvg === indexedSvg.normalizedSvg;
        const hasAllElements = definition.selectedElementIds.every((id) =>
          availableElementIds.has(id),
        );

        if (!hasExactSvg || !hasAllElements) {
          continue;
        }

        setSelectedElementIds(definition.selectedElementIds);
        setHighlightedElementId(null);
        setElementPaints(
          Object.fromEntries(
            definition.selectedElementIds.map((id) => [
              id,
              definition.elementPaints[id] ?? {
                mode: "preserve",
                visibilityConditions: [],
              },
            ]),
          ),
        );
        setPlacement({ ...definition.placement });
        setMessage(
          `Se recuperaron ${definition.selectedElementIds.length} elementos y su colocacion desde ${definition.displayName} v${definition.version}.`,
        );
        return;
      }

      setError(
        "Las versiones publicadas del mismo valor usan otro SVG. Selecciona manualmente los elementos de este archivo.",
      );
    } catch (reuseError) {
      setError(
        reuseError instanceof Error
          ? reuseError.message
          : "No se pudo recuperar la seleccion publicada.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  function updatePaintMode(
    elementId: string,
    mode: VisualElementPaint["mode"],
  ) {
    setElementPaints((current) => {
      const currentPaint = current[elementId] ?? {
        mode: "preserve",
        visibilityConditions: [],
      };
      const needsTrim = mode === "trim_fill" || mode === "trim_stroke";
      const defaultTrimSourceValueId =
        currentPaint.trimSourceValueId ?? trimOptions[0]?.id;

      return {
        ...current,
        [elementId]: {
          mode,
          visibilityConditions: currentPaint.visibilityConditions,
          ...(needsTrim && defaultTrimSourceValueId
            ? { trimSourceValueId: defaultTrimSourceValueId }
            : {}),
        },
      };
    });
  }

  function updateTrimBinding(elementId: string, trimSourceValueId: number) {
    setElementPaints((current) => ({
      ...current,
      [elementId]: {
        ...(current[elementId] ?? {
          mode: "trim_fill",
          visibilityConditions: [],
        }),
        trimSourceValueId,
      },
    }));
  }

  function updateElementConditions(
    elementId: string,
    conditions: VisualActivationCondition[],
  ) {
    setElementPaints((current) => ({
      ...current,
      [elementId]: {
        ...(current[elementId] ?? {
          mode: "preserve",
          visibilityConditions: [],
        }),
        visibilityConditions: conditions,
      },
    }));
  }

  function resetEditor() {
    setEditingDefinitionId(null);
    setAttributeId(null);
    setValueSourceId(null);
    setActivationConditions([]);
    setOriginalSvg("");
    setSourceFileName("");
    setIndexedSvg(null);
    setSelectedElementIds([]);
    setHighlightedElementId(null);
    setElementPaints({});
    setPlacement(DEFAULT_PLACEMENT);
    setRenderMode("overlay");
    setDisplayName("");
    clearNotices();
  }

  async function handleSaveDraft() {
    clearNotices();

    if (
      selectedProducts.length === 0 ||
      !selectedAttribute ||
      !selectedValue ||
      !indexedSvg
    ) {
      setError(
        "Selecciona productos, atributo, valor activador y un archivo SVG.",
      );
      return;
    }

    if (
      activationConditions.some(
        (condition) => condition.sourceValueIds.length === 0,
      ) ||
      Object.values(elementPaints).some((paint) =>
        paint.visibilityConditions.some(
          (condition) => condition.sourceValueIds.length === 0,
        ),
      )
    ) {
      setError("Cada condicion debe tener al menos un valor seleccionado.");
      return;
    }

    const availableTrimSourceValueIds = new Set(
      trimOptions.map((option) => option.id),
    );
    const hasIncompatibleTrim = Object.values(elementPaints).some(
      (paint) =>
        (paint.mode === "trim_fill" || paint.mode === "trim_stroke") &&
        (paint.trimSourceValueId === undefined ||
          !availableTrimSourceValueIds.has(paint.trimSourceValueId)),
    );

    if (hasIncompatibleTrim) {
      setError(
        "Hay elementos vinculados a una sección de vivo que no corresponde al componente y valor activador seleccionados.",
      );
      return;
    }

    const representativeValue = selectedProducts[0]?.attributes
      .find((attribute) => attribute.id === selectedAttribute.id)
      ?.values.find(
        (value) => value.sourceValueId === selectedValue.sourceValueId,
      );

    if (!representativeValue) {
      setError("No se pudo resolver el PTAV representativo en Odoo.");
      return;
    }

    const genderCondition =
      slot === "neck"
        ? getGenderActivationCondition(commonAttributes, referenceSilhouette)
        : null;

    if (slot === "neck" && !genderCondition) {
      setError(
        "Un modelo de cuello debe tener Género Hombre o Mujer disponible en todas las plantillas seleccionadas.",
      );
      return;
    }

    const effectiveActivationConditions = genderCondition
      ? withGenderActivationCondition(activationConditions, genderCondition)
      : activationConditions;

    setIsBusy(true);
    try {
      const runtimeSvg = buildRuntimeVisualSvg({
        normalizedSvg: indexedSvg.normalizedSvg,
        selectedElementIds,
        elementPaints,
        placement,
        renderMode: effectiveRenderMode,
      });
      const mutation = {
        displayName: displayName.trim() || selectedValue.name,
        slot,
        layer,
        binding: {
          productTemplateIds: selectedProducts.map((product) => product.id),
          attributeId: selectedAttribute.id,
          valueId: representativeValue.id,
          sourceValueId: selectedValue.sourceValueId,
          attributeName: selectedAttribute.name,
          valueName: selectedValue.name,
        },
        activationConditions: effectiveActivationConditions,
        selectedElementIds,
        elementPaints,
        placement,
        // Esta referencia es parte de la definición: guarda la silueta con
        // la que se revisó el SVG para que al reabrirlo no vuelva a Mujer.
        referenceAssetSrc: previewReferenceAssetSrc,
        originalSvg,
        normalizedSvg: indexedSvg.normalizedSvg,
        runtimeSvg,
      };
      const definition = editingDefinitionId
        ? await updateVisualDefinition(editingDefinitionId, mutation)
        : await createVisualDefinition(mutation);
      setEditingDefinitionId(definition.id);
      await refreshVersions();
      setMessage(
        `Borrador guardado: ${definition.displayName} v${definition.version}. ` +
          "Las releases ya creadas conservan su fotografia; aprueba esta version y crea una candidata nueva para probarla en el laboratorio.",
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar el borrador.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function loadDefinitionIntoEditor(definition: VisualDefinition) {
    const indexed = indexVisualSvg(definition.normalizedSvg);
    setEditingDefinitionId(definition.id);
    setSlot(definition.slot);
    setLayer(definition.layer);
    setSelectedProductIds(definition.binding.productTemplateIds);
    setAttributeId(definition.binding.attributeId);
    setValueSourceId(findSourceValueId(definition, products));
    setActivationConditions(definition.activationConditions);
    setDisplayName(definition.displayName);
    setOriginalSvg(definition.originalSvg);
    setSourceFileName(`${definition.displayName}.svg`);
    setIndexedSvg(indexed);
    setSelectedElementIds(definition.selectedElementIds);
    setHighlightedElementId(null);
    setElementPaints(definition.elementPaints);
    setPlacement(definition.placement);
    // Una definición de cuello para Hombre debe abrirse contra la misma
    // silueta de referencia que utilizará el laboratorio. Antes, el editor
    // conservaba "Mujer" de la sesión anterior y mostraba una base distinta.
    const definitionUsesMenSilhouette =
      definition.referenceAssetSrc === MEN_CLOSED_NO_COLLAR_REFERENCE_ASSET;
    setReferenceSilhouette(
      definitionUsesMenSilhouette ? "man" : "woman",
    );
    // Las versiones históricas con el marcador anterior se abren conservando
    // su resultado; todas las demás se editan de forma segura como overlay.
    setRenderMode(
      definition.slot === "neck" &&
        (/<svg\b[^>]*\bdata-vc-render-mode=(?:"replace-base"|'replace-base')/i.test(
          definition.runtimeSvg,
        ) ||
          definition.runtimeSvg.includes("data-vc-replaces-base-silhouette"))
        ? "replace_base"
        : "overlay",
    );
    setView("editor");
    setMessage(`Editando ${definition.displayName}.`);
    setError("");
  }

  async function handleDefinitionAction(
    definition: VisualDefinitionSummary,
    action: "edit" | "submit" | "approve" | "clone",
  ) {
    clearNotices();
    setIsBusy(true);

    try {
      if (action === "edit") {
        await loadDefinitionIntoEditor(
          await fetchVisualDefinition(definition.id),
        );
      } else if (action === "submit") {
        await submitVisualDefinition(definition.id);
        await refreshVersions();
        setMessage(`${definition.displayName} esta en revision.`);
      } else if (action === "approve") {
        const approved = await approveVisualDefinition(definition.id);
        await refreshVersions();
        setMessage(
          `${approved.displayName} version ${approved.version} aprobada para una release.`,
        );
      } else {
        const cloned = await cloneVisualDefinition(definition.id);
        await refreshVersions();
        await loadDefinitionIntoEditor(cloned);
      }
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "No se pudo completar la accion.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function handleLogout() {
    await logout();
    await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    navigate("/login", { replace: true });
  }

  return (
    <main className="visual-catalog-page">
      <header className="visual-catalog-header">
        <div>
          <p className="eyebrow">Administracion visual general</p>
          <h1>Catalogo de componentes</h1>
        </div>
        <nav className="visual-catalog-header__actions">
          <span>{authQuery.data.user.name}</span>
          <button
            type="button"
            className="secondary-button secondary-button--compact"
            onClick={() => navigate(-1)}
          >
            Volver
          </button>
          <button
            type="button"
            className="secondary-button secondary-button--compact"
            onClick={handleLogout}
          >
            Cerrar sesion
          </button>
        </nav>
      </header>

      <div className="visual-catalog-tabs" role="tablist">
        <button
          type="button"
          className={view === "editor" ? "is-active" : ""}
          onClick={() => setView("editor")}
        >
          Editor
        </button>
        <button
          type="button"
          className={view === "catalog" ? "is-active" : ""}
          onClick={() => setView("catalog")}
        >
          Versiones
        </button>
        <button
          type="button"
          className={view === "releases" ? "is-active" : ""}
          onClick={() => setView("releases")}
        >
          Releases
        </button>
        <button
          type="button"
          className={view === "audit" ? "is-active" : ""}
          onClick={() => setView("audit")}
        >
          Auditoria
        </button>
      </div>

      {error ? (
        <div className="catalog-notice catalog-notice--error">{error}</div>
      ) : null}
      {message ? <div className="catalog-notice">{message}</div> : null}

      {view === "editor" ? (
        <section className="visual-editor">
          <aside className="visual-editor__settings">
            <div className="visual-editor__section">
              <div className="catalog-section-heading">
                <h2>Alcance en Odoo</h2>
                <button
                  type="button"
                  onClick={() => void handleRefreshOdoo()}
                  disabled={isBusy}
                >
                  Actualizar desde Odoo
                </button>
              </div>
              {productsRefreshedAt ? (
                <small>
                  Ultima lectura:{" "}
                  {new Date(productsRefreshedAt).toLocaleString("es-CO")}
                </small>
              ) : null}
              <label>
                Componente
                <select
                  value={slot}
                  onChange={(event) => {
                    const nextSlot = event.target.value as VisualSlot;
                    setSlot(nextSlot);
                    if (nextSlot !== "neck") {
                      // Un componente parcial nunca puede sustituir la prenda.
                      setRenderMode("overlay");
                    }
                    setSelectedProductIds((current) =>
                      current.filter((id) => {
                        const product = products.find(
                          (candidate) => candidate.id === id,
                        );
                        return product ? supportsSlot(product, nextSlot) : false;
                      }),
                    );
                    setAttributeId(null);
                    setValueSourceId(null);
                  }}
                >
                  {SLOT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Capa
                <select
                  value={layer}
                  onChange={(event) =>
                    setLayer(event.target.value as VisualLayer)
                  }
                >
                  {LAYER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="catalog-product-picker">
                <legend>Plantillas donde aplica</legend>
                {compatibleProducts.map((product) => (
                  <label key={product.id}>
                    <input
                      type="checkbox"
                      checked={selectedProductIds.includes(product.id)}
                      onChange={(event) =>
                        setSelectedProductIds((current) =>
                          event.target.checked
                            ? [...current, product.id]
                            : current.filter((id) => id !== product.id),
                        )
                      }
                    />
                    <span>
                      <strong>{product.name}</strong>
                      <small>
                        {getFamilyLabel(product)} · plantilla {product.id}
                      </small>
                    </span>
                  </label>
                ))}
                {compatibleProducts.length === 0 ? (
                  <p className="catalog-empty">
                    {isLoadingProducts
                      ? "Cargando productos y atributos desde Odoo..."
                      : "No hay productos compatibles cargados desde Odoo."}
                  </p>
                ) : null}
              </fieldset>
              {selectedProducts.some(
                (product) => product.warnings.length > 0,
              ) ? (
                <div className="catalog-inline-warning">
                  {selectedProducts.flatMap((product) =>
                    product.warnings.map((warning) => (
                      <p key={`${product.id}-${warning}`}>
                        {product.name}: {warning}
                      </p>
                    )),
                  )}
                </div>
              ) : null}
              <label>
                Atributo activador
                <select
                  value={attributeId ?? ""}
                  onChange={(event) => {
                    setAttributeId(
                      event.target.value
                        ? Number(event.target.value)
                        : null,
                    );
                    setValueSourceId(null);
                  }}
                  disabled={selectedProducts.length === 0}
                >
                  <option value="">Seleccionar atributo</option>
                  {bindingAttributes.map((attribute) => (
                    <option key={attribute.id} value={attribute.id}>
                      {attribute.name} (ID {attribute.id})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Valor activador
                <select
                  value={valueSourceId ?? ""}
                  onChange={(event) =>
                    setValueSourceId(
                      event.target.value
                        ? Number(event.target.value)
                        : null,
                    )
                  }
                  disabled={!selectedAttribute}
                >
                  <option value="">Seleccionar valor</option>
                  {selectedAttribute?.values.map((value) => (
                    <option
                      key={value.sourceValueId}
                      value={value.sourceValueId}
                    >
                      {value.name} (ID fuente {value.sourceValueId})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nombre interno
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                />
              </label>
            </div>

            <div className="visual-editor__section">
              <ConditionsEditor
                title="Reglas adicionales"
                attributes={compatibleAttributes}
                conditions={activationConditions}
                onChange={setActivationConditions}
              />
            </div>

            <div className="visual-editor__section">
              <h2>Archivo SVG</h2>
              <label className="catalog-file-input">
                <span>{sourceFileName || "Seleccionar SVG"}</span>
                <input
                  type="file"
                  accept=".svg,image/svg+xml"
                  onChange={(event) =>
                    void handleSvgFile(event.target.files?.[0])
                  }
                />
              </label>
              <div className="catalog-reference-base">
                <strong>Base automatica</strong>
                <span>{referenceAssetSrc}</span>
              </div>
              <label>
                Vista de silueta
                <select
                  value={referenceSilhouette}
                  disabled={slot === "boot"}
                  onChange={(event) =>
                    setReferenceSilhouette(
                      event.target.value as EditorReferenceSilhouette,
                    )
                  }
                >
                  <option value="woman">Mujer</option>
                  <option value="man">Hombre</option>
                </select>
                <small>
                  Solo cambia la base de esta vista; el SVG y la definición
                  guardada no se modifican.
                </small>
              </label>
              {slot === "neck" ? (
                <p className="catalog-empty">
                  Al guardar, este cuello quedará disponible solo para{" "}
                  <strong>
                    {referenceSilhouette === "man" ? "Hombre" : "Mujer"}
                  </strong>
                  . La regla de género se aplica automáticamente.
                </p>
              ) : null}
              {/* El modo de silueta pertenece al SVG que se está cargando. */}
              <label className="catalog-render-mode">
                <input
                  type="checkbox"
                  checked={effectiveRenderMode === "replace_base"}
                  disabled={!canReplaceBase}
                  onChange={(event) =>
                    setRenderMode(
                      event.target.checked ? "replace_base" : "overlay",
                    )
                  }
                />
                <span>
                  <strong>El SVG contiene la silueta completa de la blusa</strong>
                  <small>
                    Solo para cuellos que sustituyen toda la prenda. Para piezas,
                    fondos, vivos y bolsillos, déjalo desactivado.
                  </small>
                </span>
              </label>
            </div>

            <div className="visual-editor__section">
              <h2>Colocacion</h2>
              <div className="catalog-number-grid">
                {(
                  [
                    ["x", "X"],
                    ["y", "Y"],
                    ["scaleX", "Escala X"],
                    ["scaleY", "Escala Y"],
                    ["rotation", "Rotacion"],
                  ] as const
                ).map(([field, label]) => (
                  <label key={field}>
                    {label}
                    <input
                      type="number"
                      step={field.startsWith("scale") ? "0.01" : "1"}
                      value={placement[field]}
                      onChange={(event) =>
                        setPlacement((current) => ({
                          ...current,
                          [field]: Number(event.target.value),
                        }))
                      }
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="visual-editor__footer">
              <button
                type="button"
                className="secondary-button"
                onClick={resetEditor}
                disabled={isBusy}
              >
                Nuevo
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={() => void handleSaveDraft()}
                disabled={isBusy}
              >
                {editingDefinitionId
                  ? "Actualizar borrador"
                  : "Guardar borrador"}
              </button>
            </div>
          </aside>

          <div className="visual-editor__workspace">
            <div className="visual-source-toolbar">
              <strong>
                Elementos {selectedElementIds.length}/
                {indexedSvg?.elements.length ?? 0}
              </strong>
              <button
                type="button"
                onClick={() => {
                  const allIds =
                    indexedSvg?.elements.map((element) => element.id) ?? [];
                  setSelectedElementIds(allIds);
                  setHighlightedElementId(null);
                  setElementPaints((current) =>
                    Object.fromEntries(
                      allIds.map((id) => [
                        id,
                        current[id] ?? {
                          mode: "preserve",
                          visibilityConditions: [],
                        },
                      ]),
                    ),
                  );
                }}
                disabled={!indexedSvg}
              >
                Seleccionar todo
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedElementIds([]);
                  setHighlightedElementId(null);
                  setElementPaints({});
                }}
                disabled={!indexedSvg}
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => void handleReusePublishedSelection()}
                disabled={isBusy || reusableSelectionCandidates.length === 0}
                title="Recupera elementos y colocacion solo si el SVG coincide exactamente"
              >
                Recuperar publicada
              </button>
            </div>

            <div
              ref={sourceCanvasRef}
              className="visual-source-canvas"
              onClick={handleSvgElementClick}
              dangerouslySetInnerHTML={{
                __html:
                  selectableMarkup ||
                  '<svg viewBox="0 0 1080 1350" aria-hidden="true"></svg>',
              }}
            />

            <div className="visual-preview-panel">
              <h2>Resultado</h2>
              <div className="visual-runtime-preview">
                {!uploadedSilhouetteIsActive || !displayedRuntimePreviewSrc ? (
                  <img src={previewReferenceAssetSrc} alt="" />
                ) : null}
                {displayedRuntimePreviewSrc ? (
                  <img src={displayedRuntimePreviewSrc} alt="" />
                ) : null}
                {displayedRuntimeHighlightSrc ? (
                  <img
                    className="visual-runtime-preview__highlight"
                    src={displayedRuntimeHighlightSrc}
                    alt=""
                    aria-hidden="true"
                  />
                ) : null}
              </div>
            </div>
          </div>

          <aside className="visual-editor__elements">
            <h2>Color, vivo y visibilidad</h2>
            {selectedElementIds.length === 0 ? (
              <p className="catalog-empty">Sin elementos seleccionados.</p>
            ) : (
              selectedElementIds.map((elementId) => {
                const element = indexedSvg?.elements.find(
                  (candidate) => candidate.id === elementId,
                );
                const paint = elementPaints[elementId] ?? {
                  mode: "preserve",
                  visibilityConditions: [],
                };
                const usesTrim =
                  paint.mode === "trim_fill" ||
                  paint.mode === "trim_stroke";

                return (
                  <div
                    className="visual-element-row"
                    key={elementId}
                    onFocusCapture={() => setHighlightedElementId(elementId)}
                    onPointerDown={() => setHighlightedElementId(elementId)}
                  >
                    <strong>{element?.label ?? elementId}</strong>
                    <select
                      value={paint.mode}
                      onChange={(event) =>
                        updatePaintMode(
                          elementId,
                          event.target.value as VisualElementPaint["mode"],
                        )
                      }
                    >
                      {PAINT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {usesTrim ? (
                      <select
                        value={paint.trimSourceValueId ?? ""}
                        onChange={(event) =>
                          updateTrimBinding(
                            elementId,
                            Number(event.target.value),
                          )
                        }
                      >
                        <option value="">Seccion de vivo</option>
                        {trimOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : null}
                    <ConditionsEditor
                      title="Mostrar este elemento cuando"
                      attributes={compatibleAttributes}
                      conditions={paint.visibilityConditions}
                      onChange={(conditions) =>
                        updateElementConditions(elementId, conditions)
                      }
                      compact
                    />
                  </div>
                );
              })
            )}
          </aside>
        </section>
      ) : null}

      {view === "catalog" ? (
        <section className="visual-version-list">
          {definitions.length === 0 ? (
            <p className="catalog-empty">No hay definiciones guardadas.</p>
          ) : (
            definitions.map((definition) => {
              const issues = getDefinitionOdooIssues(definition, products);
              const productNames = definition.binding.productTemplateIds.map(
                (productTemplateId) =>
                  products.find(
                    (product) => product.id === productTemplateId,
                  )?.name ?? `Plantilla ${productTemplateId}`,
              );

              return (
                <article className="visual-version-card" key={definition.id}>
                  <div>
                    <span
                      className={`visual-status visual-status--${definition.status}`}
                    >
                      {getDefinitionStatusLabel(definition.status)}
                    </span>
                    <h2>{definition.displayName}</h2>
                    <p>
                      {definition.binding.attributeName}:{" "}
                      {definition.binding.valueName}
                    </p>
                    <p>{productNames.join(", ")}</p>
                    <small>
                      Version {definition.version} · {definition.slot} ·{" "}
                      {definition.layer} ·{" "}
                      {definition.activationConditions.length} reglas ·{" "}
                      {new Date(definition.updatedAt).toLocaleString("es-CO")}
                    </small>
                    {issues.length > 0 ? (
                      <div className="catalog-inline-warning">
                        <strong>Referencia Odoo desactualizada</strong>
                        {issues.map((issue) => (
                          <p key={issue}>{issue}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="visual-version-card__actions">
                    {definition.status === "draft" ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            void handleDefinitionAction(definition, "edit")
                          }
                          disabled={isBusy}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void handleDefinitionAction(definition, "submit")
                          }
                          disabled={isBusy || issues.length > 0}
                        >
                          Enviar a revision
                        </button>
                      </>
                    ) : null}
                    {definition.status === "review" ? (
                      <button
                        type="button"
                        onClick={() =>
                          void handleDefinitionAction(definition, "approve")
                        }
                        disabled={isBusy || issues.length > 0}
                      >
                        Aprobar componente
                      </button>
                    ) : null}
                    {definition.status === "approved" ||
                    definition.status === "published" ||
                    definition.status === "archived" ? (
                      <button
                        type="button"
                        onClick={() =>
                          void handleDefinitionAction(definition, "clone")
                        }
                        disabled={isBusy}
                      >
                        Crear nueva version
                      </button>
                    ) : null}
                  </div>
                </article>
              );
            })
          )}
        </section>
      ) : null}

      {view === "releases" ? (
        <VisualReleaseManager
          definitions={definitions}
          releases={releases}
          activeReleaseId={activeReleaseId}
          canPublish={Boolean(authQuery.data.user.canPublishVisualCatalog)}
          onRefresh={refreshVersions}
          onMessage={setMessage}
          onError={setError}
          onOpenLaboratory={(releaseId, saleOrderLineId, scenarioId) =>
            navigate(
              `/tools/visual-catalog/releases/${releaseId}/preview/${saleOrderLineId}${
                scenarioId ? `?scenario=${scenarioId}` : ""
              }`,
            )
          }
        />
      ) : null}

      {view === "audit" ? (
        <section className="visual-audit-workspace">
          <div>
            <h2>Releases</h2>
            <div className="visual-audit-table">
              <div className="visual-audit-table__header">
                <span>Fecha</span>
                <span>Accion</span>
                <span>Usuario</span>
                <span>Release</span>
              </div>
              {releaseAuditEvents.map((event) => (
                <div className="visual-audit-table__row" key={event.id}>
                  <span>{new Date(event.createdAt).toLocaleString("es-CO")}</span>
                  <strong>{event.action}</strong>
                  <span>{event.actorEmail}</span>
                  <code>{event.releaseId.slice(0, 8)}</code>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2>Componentes</h2>
            <div className="visual-audit-table">
              <div className="visual-audit-table__header">
                <span>Fecha</span>
                <span>Accion</span>
                <span>Usuario</span>
                <span>Definicion</span>
              </div>
              {auditEvents.map((event) => (
                <div className="visual-audit-table__row" key={event.id}>
                  <span>{new Date(event.createdAt).toLocaleString("es-CO")}</span>
                  <strong>{event.action}</strong>
                  <span>{event.actorEmail}</span>
                  <code>{event.definitionId.slice(0, 8)}</code>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
