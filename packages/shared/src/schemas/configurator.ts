import { z } from "zod";

export const configuratorValueSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  attributeId: z.number(),
  attributeName: z.string().min(1),
  colorHex: z.string().regex(/^#(?:[0-9a-fA-F]{3}){1,2}$/).optional(),
  allowsCustomValue: z.boolean().optional(),
});

export const configuratorAttributeSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  displayType: z.enum([
    "color",
    "image",
    "option",
    "select",
    "multi",
    "radio",
    "unknown",
  ]),
  selectionMode: z.enum(["single", "multiple"]),
  variantMode: z.enum(["variant", "no_variant", "dynamic", "unknown"]),
  values: z.array(configuratorValueSchema),
});

export const exclusionRuleSchema = z.object({
  sourceValueId: z.number(),
  excludedValueId: z.number(),
});

export const configuratorStatusSchema = z.object({
  orderState: z.string().min(1),
  canEdit: z.boolean(),
  isLocked: z.boolean(),
  version: z.number().int().nonnegative(),
  generatedAt: z.string().datetime().nullable(),
});

export const configuratorSessionSchema = z.object({
  saleOrderLineId: z.number(),
  saleOrderId: z.number(),
  orderName: z.string().min(1),
  productId: z.number(),
  productTemplateId: z.number(),
  productName: z.string().min(1),
  graphicManifestKey: z.string().min(1),
  attributes: z.array(configuratorAttributeSchema),
  selectedValueIds: z.record(z.string(), z.array(z.number())),
  customValuesByValueId: z.record(z.string(), z.string()).optional(),
  exclusions: z.array(exclusionRuleSchema),
  status: configuratorStatusSchema,
  existingDesignBase64: z.string().min(1).nullable().optional(),
  warnings: z.array(z.string()).default([]),
});

export type ConfiguratorSession = z.infer<typeof configuratorSessionSchema>;

export const saveDesignRequestSchema = z.object({
  saleOrderLineId: z.number(),
  filename: z.string().min(1).max(140),
  imageBase64: z.string().min(1),
  selectedValueIds: z.record(z.string(), z.array(z.number())),
  customValuesByValueId: z.record(z.string(), z.string()).optional(),
});

export type SaveDesignRequest = z.infer<typeof saveDesignRequestSchema>;

export const appUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export const authSessionSchema = z.object({
  user: appUserSchema,
});

export type AppUser = z.infer<typeof appUserSchema>;

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(120),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
