import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import type { OdooEnv } from "../lib/app-env.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderAutomationLine } from "./render-automation-line.js";

const mocks = vi.hoisted(() => ({
  deriveAutomationRenderScene: vi.fn(),
  getConfiguratorSession: vi.fn(),
  renderDesignImage: vi.fn(),
  storeDesignImage: vi.fn(),
}));

vi.mock("../render/derive-render-scene.js", () => ({
  deriveAutomationRenderScene: mocks.deriveAutomationRenderScene,
}));

vi.mock("../render/render-design-image.js", () => ({
  renderDesignImage: mocks.renderDesignImage,
}));

vi.mock("./get-configurator-session.js", () => ({
  getConfiguratorSession: mocks.getConfiguratorSession,
}));

vi.mock("./store-design-image.js", () => ({
  DESIGN_IMAGE_FIELD: "x_product_design_image",
  storeDesignImage: mocks.storeDesignImage,
}));

const env = {} as OdooEnv;

const editableSession: ConfiguratorSession = {
  saleOrderLineId: 304,
  saleOrderId: 130,
  orderName: "S00130",
  productId: 12345,
  productTemplateId: 678,
  productName: "Blusa",
  graphicManifestKey: "blusa",
  attributes: [],
  selectedValueIds: {},
  customValuesByValueId: {},
  exclusions: [],
  status: {
    orderState: "draft",
    canEdit: true,
    isLocked: false,
    version: 2,
    generatedAt: null,
  },
  existingDesignBase64: null,
  warnings: [],
};

describe("renderAutomationLine", () => {
  beforeEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
    mocks.getConfiguratorSession.mockResolvedValue(editableSession);
    mocks.deriveAutomationRenderScene.mockReturnValue({ productKind: "blouse" });
    mocks.renderDesignImage.mockResolvedValue(Buffer.from("png"));
    mocks.storeDesignImage.mockResolvedValue({
      version: 3,
      generatedAt: "2026-05-05T22:50:00.000Z",
      attachmentId: 900,
    });
  });

  it("renders and stores the automatic image when the line has no newer generated design", async () => {
    const result = await renderAutomationLine(env, 304, {
      triggerWriteDate: "2026-05-05 22:48:00.123456",
    });

    expect(mocks.renderDesignImage).toHaveBeenCalledOnce();
    expect(mocks.storeDesignImage).toHaveBeenCalledWith(env, {
      saleOrderLineId: 304,
      filename: "sale-line-304-autogen.png",
      imageBase64: Buffer.from("png").toString("base64"),
      currentVersion: 2,
    });
    expect(result).toMatchObject({
      dryRun: false,
      saleOrderLineId: 304,
      version: 3,
    });
  });

  it("skips stale webhook events so they do not overwrite a newer manual save", async () => {
    mocks.getConfiguratorSession.mockResolvedValue({
      ...editableSession,
      status: {
        ...editableSession.status,
        version: 3,
        generatedAt: "2026-05-05T22:50:00.000Z",
      },
    });

    const result = await renderAutomationLine(env, 304, {
      triggerWriteDate: "2026-05-05 22:49:59.900000",
    });

    expect(mocks.renderDesignImage).not.toHaveBeenCalled();
    expect(mocks.storeDesignImage).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      ok: true,
      skipped: true,
      currentVersion: 3,
      generatedAt: "2026-05-05T22:50:00.000Z",
    });
  });

  it("skips webhook events without write_date when a generated image is very recent", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-05T22:50:30.000Z"));
    mocks.getConfiguratorSession.mockResolvedValue({
      ...editableSession,
      status: {
        ...editableSession.status,
        version: 3,
        generatedAt: "2026-05-05T22:50:00.000Z",
      },
    });

    const result = await renderAutomationLine(env, 304);

    expect(mocks.renderDesignImage).not.toHaveBeenCalled();
    expect(mocks.storeDesignImage).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      ok: true,
      skipped: true,
      currentVersion: 3,
      generatedAt: "2026-05-05T22:50:00.000Z",
    });
  });

  it("skips webhook events created by the same manual design save", async () => {
    mocks.getConfiguratorSession.mockResolvedValue({
      ...editableSession,
      status: {
        ...editableSession.status,
        version: 10,
        generatedAt: "2026-05-12T03:19:58.000Z",
      },
    });

    const result = await renderAutomationLine(env, 334, {
      triggerWriteDate: "2026-05-12 03:20:00.000000",
    });

    expect(mocks.renderDesignImage).not.toHaveBeenCalled();
    expect(mocks.storeDesignImage).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      ok: true,
      skipped: true,
      currentVersion: 10,
      generatedAt: "2026-05-12T03:19:58.000Z",
      triggerWriteDate: "2026-05-12 03:20:00.000000",
    });
  });

  it("allows automation after a later Odoo line update", async () => {
    mocks.getConfiguratorSession.mockResolvedValue({
      ...editableSession,
      status: {
        ...editableSession.status,
        version: 3,
        generatedAt: "2026-05-05T22:50:00.000Z",
      },
    });

    await renderAutomationLine(env, 304, {
      triggerWriteDate: "2026-05-05 22:53:00.000000",
    });

    expect(mocks.renderDesignImage).toHaveBeenCalledOnce();
    expect(mocks.storeDesignImage).toHaveBeenCalledOnce();
  });
});
