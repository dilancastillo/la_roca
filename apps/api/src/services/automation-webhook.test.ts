import { describe, expect, it } from "vitest";
import {
  extractSaleOrderLineIdFromWebhookPayload,
  isValidAutomationToken,
  shouldDryRunAutomation,
} from "./automation-webhook.js";

describe("automation-webhook", () => {
  it("extracts the line id from a flat payload", () => {
    expect(extractSaleOrderLineIdFromWebhookPayload({ id: 25 })).toBe(25);
  });

  it("extracts the line id from nested webhook payloads", () => {
    expect(extractSaleOrderLineIdFromWebhookPayload({ data: { id: "31" } })).toBe(31);
    expect(extractSaleOrderLineIdFromWebhookPayload({ record: { id: 44 } })).toBe(44);
  });

  it("extracts common Odoo automation payload ids", () => {
    expect(extractSaleOrderLineIdFromWebhookPayload({ line_id: "56" })).toBe(56);
    expect(
      extractSaleOrderLineIdFromWebhookPayload({ sale_order_line_id: 57 }),
    ).toBe(57);
    expect(extractSaleOrderLineIdFromWebhookPayload({ ids: [58] })).toBe(58);
    expect(
      extractSaleOrderLineIdFromWebhookPayload({ records: [{ id: "59" }] }),
    ).toBe(59);
  });

  it("rejects invalid tokens", () => {
    expect(isValidAutomationToken(undefined, "abc")).toBe(false);
    expect(isValidAutomationToken("abc", null)).toBe(false);
    expect(isValidAutomationToken("abc", "def")).toBe(false);
    expect(isValidAutomationToken("abc", "abc")).toBe(true);
  });

  it("detects dry-run mode from query params or body", () => {
    expect(shouldDryRunAutomation(null, "true")).toBe(true);
    expect(shouldDryRunAutomation({ dryRun: true }, null)).toBe(true);
    expect(shouldDryRunAutomation({ dry_run: "1" }, null)).toBe(true);
    expect(shouldDryRunAutomation({ dryRun: false }, null)).toBe(false);
  });
});
