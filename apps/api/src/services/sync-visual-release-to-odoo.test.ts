import type { ConfiguratorSession } from "@repo/shared/schemas/configurator";
import type { VisualRelease } from "@repo/shared/schemas/visual-catalog";
import type { OdooEnv } from "../lib/app-env.js";
import { parseConfiguratorStateDescription } from "./configurator-state-metadata.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { syncVisualReleaseToOdoo } from "./sync-visual-release-to-odoo.js";

const mocks = vi.hoisted(() => ({
  deriveAutomationRenderScene: vi.fn(),
  getConfiguratorSession: vi.fn(),
  getVisualRelease: vi.fn(),
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
  storeDesignImage: mocks.storeDesignImage,
}));
vi.mock("./visual-release-repository.js", () => ({
  getVisualRelease: mocks.getVisualRelease,
}));

const env = {} as OdooEnv;
const release = {
  id: "734fd0e7-51bb-44da-a7c3-45e148fce4e1",
  number: 174,
  status: "active",
  definitionIds: ["03d284a6-a5a1-4b6a-bd33-c77ab71a1d5f"],
} as VisualRelease;
const session = {
  saleOrderLineId: 295,
  selectedValueIds: { "12": [44] },
  customValuesByValueId: { "44": "Azul" },
  visualDefinitions: [{ id: "03d284a6-a5a1-4b6a-bd33-c77ab71a1d5f" }],
  status: { canEdit: true, version: 9 },
} as unknown as ConfiguratorSession;

describe("syncVisualReleaseToOdoo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getVisualRelease.mockResolvedValue(release);
    mocks.getConfiguratorSession.mockResolvedValue(session);
    mocks.deriveAutomationRenderScene.mockReturnValue({ productKind: "uniform" });
    mocks.renderDesignImage.mockResolvedValue(Buffer.from("png"));
    mocks.storeDesignImage.mockResolvedValue({
      ok: true,
      attachmentId: 901,
      version: 10,
      generatedAt: "2026-10-05T15:00:00.000Z",
    });
  });

  it("renders the published snapshot and pins that exact snapshot on the Odoo line", async () => {
    const result = await syncVisualReleaseToOdoo(env, release.id, 295);

    expect(mocks.getConfiguratorSession).toHaveBeenCalledWith(env, 295, {
      visualDefinitionIdsOverride: release.definitionIds,
      visualReleaseId: release.id,
      pinActiveVisualRelease: false,
    });
    expect(mocks.storeDesignImage).toHaveBeenCalledOnce();
    const input = mocks.storeDesignImage.mock.calls[0]?.[1];
    expect(input).toMatchObject({
      saleOrderLineId: 295,
      filename: "sale-line-295-release-r174.png",
      currentVersion: 9,
      imageBase64: Buffer.from("png").toString("base64"),
    });
    expect(parseConfiguratorStateDescription(input.attachmentDescription)).toEqual({
      selectedValueIds: { "12": [44] },
      customValuesByValueId: { "44": "Azul" },
      visualDefinitionVersionIds: release.definitionIds,
    });
    expect(result).toMatchObject({
      ok: true,
      saleOrderLineId: 295,
      releaseId: release.id,
      releaseNumber: 174,
      imageSizeBytes: 3,
    });
  });

  it("refuses to overwrite Odoo with a release that is not in production", async () => {
    mocks.getVisualRelease.mockResolvedValue({ ...release, status: "approved" });

    await expect(syncVisualReleaseToOdoo(env, release.id, 295)).rejects.toThrow(
      "release que esta activa",
    );
    expect(mocks.renderDesignImage).not.toHaveBeenCalled();
    expect(mocks.storeDesignImage).not.toHaveBeenCalled();
  });

  it("refuses to overwrite a non-editable order line", async () => {
    mocks.getConfiguratorSession.mockResolvedValue({
      ...session,
      status: { ...session.status, canEdit: false },
    });

    await expect(syncVisualReleaseToOdoo(env, release.id, 295)).rejects.toThrow(
      "no se puede sobrescribir su imagen",
    );
    expect(mocks.storeDesignImage).not.toHaveBeenCalled();
  });
});
