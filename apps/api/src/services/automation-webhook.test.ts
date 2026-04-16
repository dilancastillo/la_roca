import { describe, expect, it } from "vitest";
import {
  extractSaleOrderLineIdFromWebhookPayload,
  isValidAutomationToken,
} from "./automation-webhook.js";

describe("automation-webhook", () => {
  it("extracts the line id from a flat payload", () => {
    expect(extractSaleOrderLineIdFromWebhookPayload({ id: 25 })).toBe(25);
  });

  it("extracts the line id from nested webhook payloads", () => {
    expect(extractSaleOrderLineIdFromWebhookPayload({ data: { id: "31" } })).toBe(31);
    expect(extractSaleOrderLineIdFromWebhookPayload({ record: { id: 44 } })).toBe(44);
  });

  it("rejects invalid tokens", () => {
    expect(isValidAutomationToken(undefined, "abc")).toBe(false);
    expect(isValidAutomationToken("abc", null)).toBe(false);
    expect(isValidAutomationToken("abc", "def")).toBe(false);
    expect(isValidAutomationToken("abc", "abc")).toBe(true);
  });
});
