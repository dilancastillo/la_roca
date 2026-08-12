import { z } from "zod";

export const VISUAL_CATALOG_SVG_MAX_BYTES = 800_000;
export const VISUAL_CATALOG_MUTATION_MAX_BYTES = 3_500_000;
const isoDatetimeSchema = z.string().datetime({ offset: true });

function getUtf8ByteLength(value: string) {
  return new TextEncoder().encode(value).byteLength;
}

const visualCatalogSvgSchema = z
  .string()
  .min(1)
  .max(VISUAL_CATALOG_SVG_MAX_BYTES)
  .refine(
    (svg) => getUtf8ByteLength(svg) <= VISUAL_CATALOG_SVG_MAX_BYTES,
    "El SVG supera el limite de 800 KB.",
  );

export const visualSlotSchema = z.enum(["neck", "lower_pocket", "boot"]);
export type VisualSlot = z.infer<typeof visualSlotSchema>;

export const visualDefinitionStatusSchema = z.enum([
  "draft",
  "review",
  "approved",
  "published",
  "archived",
]);
export type VisualDefinitionStatus = z.infer<
  typeof visualDefinitionStatusSchema
>;

export const visualLayerSchema = z.enum([
  "structure",
  "component",
  "detail",
  "accent",
]);
export type VisualLayer = z.infer<typeof visualLayerSchema>;

export const visualActivationConditionSchema = z.object({
  attributeId: z.number().int().positive(),
  attributeName: z.string().min(1).max(180),
  sourceValueIds: z.array(z.number().int().positive()).min(1),
  valueNames: z.array(z.string().min(1).max(180)).default([]),
});
export type VisualActivationCondition = z.infer<
  typeof visualActivationConditionSchema
>;

export const visualElementPaintModeSchema = z.enum([
  "preserve",
  "base_fill",
  "base_stroke",
  "trim_fill",
  "trim_stroke",
  "outline",
]);
export type VisualElementPaintMode = z.infer<
  typeof visualElementPaintModeSchema
>;

export const visualElementPaintSchema = z.object({
  mode: visualElementPaintModeSchema,
  trimSourceValueId: z.number().int().positive().optional(),
  visibilityConditions: z
    .array(visualActivationConditionSchema)
    .default([]),
});
export type VisualElementPaint = z.infer<typeof visualElementPaintSchema>;

export const visualPlacementSchema = z.object({
  targetWidth: z.number().positive().default(1080),
  targetHeight: z.number().positive().default(1350),
  x: z.number().finite().default(0),
  y: z.number().finite().default(0),
  scaleX: z
    .number()
    .finite()
    .refine((value) => value !== 0, "La escala horizontal no puede ser cero.")
    .default(1),
  scaleY: z
    .number()
    .finite()
    .refine((value) => value !== 0, "La escala vertical no puede ser cero.")
    .default(1),
  rotation: z.number().finite().default(0),
});
export type VisualPlacement = z.infer<typeof visualPlacementSchema>;

export const visualOdooBindingSchema = z.object({
  productTemplateIds: z.array(z.number().int().positive()).min(1),
  attributeId: z.number().int().positive(),
  valueId: z.number().int().positive(),
  sourceValueId: z.number().int().positive().optional(),
  attributeName: z.string().min(1).max(180),
  valueName: z.string().min(1).max(180),
});
export type VisualOdooBinding = z.infer<typeof visualOdooBindingSchema>;

const visualDefinitionMetadataShape = {
  id: z.string().uuid(),
  seriesId: z.string().uuid(),
  version: z.number().int().nonnegative(),
  displayName: z.string().min(1).max(180),
  slot: visualSlotSchema,
  layer: visualLayerSchema.default("component"),
  status: visualDefinitionStatusSchema,
  binding: visualOdooBindingSchema,
  activationConditions: z
    .array(visualActivationConditionSchema)
    .default([]),
  selectedElementIds: z.array(z.string().min(1).max(180)),
  elementPaints: z.record(z.string(), visualElementPaintSchema),
  placement: visualPlacementSchema,
  referenceAssetSrc: z.string().min(1).max(500),
  createdBy: z.string().email(),
  approvedBy: z.string().email().nullable(),
  createdAt: isoDatetimeSchema,
  updatedAt: isoDatetimeSchema,
  submittedAt: isoDatetimeSchema.nullable(),
  publishedAt: isoDatetimeSchema.nullable(),
} as const;

export const visualDefinitionSummarySchema = z.object(
  visualDefinitionMetadataShape,
);
export type VisualDefinitionSummary = z.infer<
  typeof visualDefinitionSummarySchema
>;

export const visualDefinitionSchema = visualDefinitionSummarySchema.extend({
  originalSvg: z.string().min(1),
  normalizedSvg: z.string().min(1),
  runtimeSvg: z.string().min(1),
});
export type VisualDefinition = z.infer<typeof visualDefinitionSchema>;

export const visualDefinitionMutationSchema = z
  .object({
    displayName: z.string().min(1).max(180),
    slot: visualSlotSchema,
    layer: visualLayerSchema.default("component"),
    binding: visualOdooBindingSchema,
    activationConditions: z
      .array(visualActivationConditionSchema)
      .default([]),
    selectedElementIds: z.array(z.string().min(1).max(180)).min(1),
    elementPaints: z.record(z.string(), visualElementPaintSchema),
    placement: visualPlacementSchema,
    referenceAssetSrc: z.string().min(1).max(500),
    originalSvg: visualCatalogSvgSchema,
    normalizedSvg: visualCatalogSvgSchema,
    runtimeSvg: visualCatalogSvgSchema,
  })
  .superRefine((mutation, context) => {
    const payloadBytes = getUtf8ByteLength(JSON.stringify(mutation));

    if (payloadBytes > VISUAL_CATALOG_MUTATION_MAX_BYTES) {
      context.addIssue({
        code: "custom",
        message:
          "La definicion completa supera el limite seguro de 3.5 MB para Vercel.",
      });
    }
  });
export type VisualDefinitionMutation = z.infer<
  typeof visualDefinitionMutationSchema
>;

export const visualDefinitionListSchema = z.object({
  definitions: z.array(visualDefinitionSummarySchema),
});

export const activeVisualDefinitionSchema = z.object({
  id: z.string().uuid(),
  seriesId: z.string().uuid(),
  version: z.number().int().positive(),
  displayName: z.string().min(1),
  slot: visualSlotSchema,
  layer: visualLayerSchema.default("component"),
  binding: visualOdooBindingSchema,
  activationConditions: z
    .array(visualActivationConditionSchema)
    .default([]),
  selectedElementIds: z.array(z.string().min(1).max(180)).default([]),
  elementPaints: z
    .record(z.string(), visualElementPaintSchema)
    .default({}),
  runtimeSvg: z.string().min(1),
});
export type ActiveVisualDefinition = z.infer<
  typeof activeVisualDefinitionSchema
>;

export const visualDefinitionTransitionResultSchema = z.object({
  definition: visualDefinitionSchema,
});

export const visualCatalogAuditEventSchema = z.object({
  id: z.string().uuid(),
  definitionId: z.string().uuid(),
  action: z.enum([
    "created",
    "updated",
    "submitted",
    "approved",
    "published",
    "archived",
    "cloned",
  ]),
  actorEmail: z.string().email(),
  createdAt: isoDatetimeSchema,
  details: z.record(z.string(), z.unknown()).default({}),
});
export type VisualCatalogAuditEvent = z.infer<
  typeof visualCatalogAuditEventSchema
>;

export const visualCatalogAuditListSchema = z.object({
  events: z.array(visualCatalogAuditEventSchema),
});

export const visualCatalogProductFamilySchema = z.enum([
  "blouse",
  "pants",
  "uniform",
]);
export type VisualCatalogProductFamily = z.infer<
  typeof visualCatalogProductFamilySchema
>;

export const visualCatalogOdooValueSchema = z.object({
  id: z.number().int().positive(),
  sourceValueId: z.number().int().positive(),
  name: z.string().min(1),
  sequence: z.number().finite(),
  excludedValueIds: z.array(z.number().int().positive()).default([]),
});
export type VisualCatalogOdooValue = z.infer<
  typeof visualCatalogOdooValueSchema
>;

export const visualCatalogOdooAttributeSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  sequence: z.number().finite(),
  values: z.array(visualCatalogOdooValueSchema),
});
export type VisualCatalogOdooAttribute = z.infer<
  typeof visualCatalogOdooAttributeSchema
>;

export const visualCatalogProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  family: visualCatalogProductFamilySchema,
  attributes: z.array(visualCatalogOdooAttributeSchema),
  warnings: z.array(z.string()).default([]),
});
export type VisualCatalogProduct = z.infer<
  typeof visualCatalogProductSchema
>;

export const visualCatalogProductListSchema = z.object({
  products: z.array(visualCatalogProductSchema),
  refreshedAt: isoDatetimeSchema,
});

export const visualReleaseStatusSchema = z.enum([
  "candidate",
  "review",
  "approved",
  "active",
  "retired",
]);
export type VisualReleaseStatus = z.infer<typeof visualReleaseStatusSchema>;

export const visualReleaseChecklistSchema = z.object({
  odooReferences: z.boolean().default(false),
  combinations: z.boolean().default(false),
  colorsAndTrims: z.boolean().default(false),
  placement: z.boolean().default(false),
  productFamilies: z.boolean().default(false),
  browserRender: z.boolean().default(false),
  savedRender: z.boolean().default(false),
  comparison: z.boolean().default(false),
  noDuplicates: z.boolean().default(false),
});
export type VisualReleaseChecklist = z.infer<
  typeof visualReleaseChecklistSchema
>;

export const visualReleaseSchema = z.object({
  id: z.string().uuid(),
  number: z.number().int().positive(),
  displayName: z.string().min(1).max(180),
  notes: z.string().max(2_000).default(""),
  status: visualReleaseStatusSchema,
  definitionIds: z.array(z.string().uuid()),
  changedDefinitionIds: z.array(z.string().uuid()).min(1),
  baselineDefinitionIds: z.array(z.string().uuid()),
  baseReleaseId: z.string().uuid().nullable(),
  checklist: visualReleaseChecklistSchema,
  createdBy: z.string().email(),
  approvedBy: z.string().email().nullable(),
  publishedBy: z.string().email().nullable(),
  createdAt: isoDatetimeSchema,
  updatedAt: isoDatetimeSchema,
  submittedAt: isoDatetimeSchema.nullable(),
  approvedAt: isoDatetimeSchema.nullable(),
  publishedAt: isoDatetimeSchema.nullable(),
});
export type VisualRelease = z.infer<typeof visualReleaseSchema>;

export const visualReleaseCreateSchema = z.object({
  displayName: z.string().min(1).max(180),
  notes: z.string().max(2_000).default(""),
  changedDefinitionIds: z.array(z.string().uuid()).min(1),
});
export type VisualReleaseCreate = z.infer<typeof visualReleaseCreateSchema>;

export const visualReleaseChecklistMutationSchema = z.object({
  checklist: visualReleaseChecklistSchema,
});

export const visualReleaseListSchema = z.object({
  releases: z.array(visualReleaseSchema),
  activeReleaseId: z.string().uuid().nullable(),
});

export const visualReleaseTransitionResultSchema = z.object({
  release: visualReleaseSchema,
});

export const visualReleaseScenarioSchema = z.object({
  id: z.string().uuid(),
  releaseId: z.string().uuid(),
  saleOrderLineId: z.number().int().positive(),
  displayName: z.string().min(1).max(180),
  selectedValueIds: z.record(z.string(), z.array(z.number())),
  customValuesByValueId: z.record(z.string(), z.string()).default({}),
  createdBy: z.string().email(),
  createdAt: isoDatetimeSchema,
  updatedAt: isoDatetimeSchema,
});
export type VisualReleaseScenario = z.infer<
  typeof visualReleaseScenarioSchema
>;

export const visualReleaseScenarioMutationSchema = z.object({
  displayName: z.string().min(1).max(180),
  saleOrderLineId: z.number().int().positive(),
  selectedValueIds: z.record(z.string(), z.array(z.number())),
  customValuesByValueId: z.record(z.string(), z.string()).default({}),
});

export const visualReleaseScenarioListSchema = z.object({
  scenarios: z.array(visualReleaseScenarioSchema),
});

export const visualReleaseAuditEventSchema = z.object({
  id: z.string().uuid(),
  releaseId: z.string().uuid(),
  action: z.enum([
    "created",
    "checklist_updated",
    "submitted",
    "approved",
    "published",
    "restored",
    "scenario_saved",
  ]),
  actorEmail: z.string().email(),
  createdAt: isoDatetimeSchema,
  details: z.record(z.string(), z.unknown()).default({}),
});
export type VisualReleaseAuditEvent = z.infer<
  typeof visualReleaseAuditEventSchema
>;

export const visualReleaseAuditListSchema = z.object({
  events: z.array(visualReleaseAuditEventSchema),
});
