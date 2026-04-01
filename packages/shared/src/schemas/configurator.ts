import { z } from "zod";

export const productAttributeValueSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  attributeName: z.string().min(1),
});

export const productAttributeSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  values: z.array(productAttributeValueSchema),
});

export const exclusionRuleSchema = z.object({
  sourceValueId: z.number(),
  excludedValueId: z.number(),
});

export const configuratorSessionSchema = z.object({
  saleOrderLineId: z.number(),
  productTemplateId: z.number(),
  productName: z.string().min(1),
  attributes: z.array(productAttributeSchema),
  exclusions: z.array(exclusionRuleSchema),
  graphicManifestKey: z.string().min(1),
  existingDesignUrl: z.string().url().optional(),
});

export type ConfiguratorSession = z.infer<typeof configuratorSessionSchema>;

export const saveDesignRequestSchema = z.object({
  saleOrderLineId: z.number(),
  filename: z.string().min(1).max(140),
  imageBase64: z.string().min(1),
});

export type SaveDesignRequest = z.infer<typeof saveDesignRequestSchema>;