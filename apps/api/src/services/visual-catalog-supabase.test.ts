import { afterEach, describe, expect, it, vi } from "vitest";
import { listVisualDefinitions } from "./visual-catalog-repository.js";
import {
  getVisualRelease,
  listVisualReleases,
} from "./visual-release-repository.js";

const env = {
  VISUAL_CATALOG_BACKEND: "supabase",
  SUPABASE_URL: "https://catalog-test.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-test",
};

const definitionId = "10000000-0000-4000-8000-000000000001";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Supabase visual catalog datetime boundaries", () => {
  it("normaliza las fechas de definiciones antes de validar el contrato", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json([
          {
            id: definitionId,
            series_id: "10000000-0000-4000-8000-000000000002",
            version: 1,
            display_name: "Cuello Supabase",
            slot: "neck",
            layer: "component",
            status: "approved",
            binding: {
              productTemplateIds: [5],
              attributeId: 63,
              valueId: 334,
              sourceValueId: 562,
              attributeName: "Modelo de cuello",
              valueName: "PUNTAS",
            },
            activation_conditions: [],
            selected_element_ids: ["neck"],
            element_paints: {
              neck: { mode: "preserve", visibilityConditions: [] },
            },
            placement: {
              targetWidth: 1080,
              targetHeight: 1350,
              x: 0,
              y: 0,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
            },
            reference_asset_src: "/assets/reference.svg",
            original_asset_key: "series/definition/original.svg",
            normalized_asset_key: "series/definition/normalized.svg",
            runtime_asset_key: "series/definition/runtime.svg",
            created_by: "admin@la-roca.local",
            approved_by: "admin@la-roca.local",
            created_at: "2026-08-11T19:55:00.123456+00:00",
            updated_at: "2026-08-11T20:05:00.654321+00:00",
            submitted_at: "2026-08-11T20:00:00+00:00",
            published_at: null,
          },
        ]),
      ),
    );

    const [definition] = await listVisualDefinitions(env);

    expect(definition?.createdAt).toBe("2026-08-11T19:55:00.123Z");
    expect(definition?.updatedAt).toBe("2026-08-11T20:05:00.654Z");
    expect(definition?.submittedAt).toBe("2026-08-11T20:00:00.000Z");
  });

  it("normaliza las fechas de releases devueltas por PostgREST", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = String(input);

        if (url.includes("visual_catalog_release_state")) {
          return Response.json([{ active_release_id: null }]);
        }

        return Response.json([
          {
            id: "20000000-0000-4000-8000-000000000001",
            number: 1,
            display_name: "Release inicial",
            notes: "",
            status: "candidate",
            definition_ids: [definitionId],
            changed_definition_ids: [definitionId],
            baseline_definition_ids: [],
            base_release_id: null,
            checklist: {},
            created_by: "admin@la-roca.local",
            approved_by: null,
            published_by: null,
            created_at: "2026-08-11T19:55:00.123456+00:00",
            updated_at: "2026-08-11T20:05:00.654321+00:00",
            submitted_at: null,
            approved_at: null,
            published_at: null,
          },
        ]);
      }),
    );

    const releases = await listVisualReleases(env);
    const [release] = releases.releases;

    expect(release?.createdAt).toBe("2026-08-11T19:55:00.123Z");
    expect(release?.updatedAt).toBe("2026-08-11T20:05:00.654Z");
  });

  it("consulta una release puntual por UUID sin descargar todo el historial", async () => {
    const releaseId = "20000000-0000-4000-8000-000000000001";
    const fetchMock = vi.fn(async (_input: string | URL | Request) =>
      Response.json([
        {
          id: releaseId,
          number: 61,
          display_name: "V19 CUELLO",
          notes: "",
          status: "active",
          definition_ids: [definitionId],
          changed_definition_ids: [definitionId],
          baseline_definition_ids: [],
          base_release_id: null,
          checklist: {},
          created_by: "admin@la-roca.local",
          approved_by: "admin@la-roca.local",
          published_by: "admin@la-roca.local",
          created_at: "2026-09-12T17:00:00+00:00",
          updated_at: "2026-09-12T17:05:00+00:00",
          submitted_at: "2026-09-12T17:02:00+00:00",
          approved_at: "2026-09-12T17:03:00+00:00",
          published_at: "2026-09-12T17:05:00+00:00",
        },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    const release = await getVisualRelease(env, releaseId);
    const requestedUrl = String(fetchMock.mock.calls[0]?.[0]);

    expect(release.id).toBe(releaseId);
    expect(requestedUrl).toContain(
      `visual_catalog_releases?id=eq.${releaseId}&select=*&limit=1`,
    );
    expect(requestedUrl).not.toContain("order=number.desc");
  });

  it("reintenta una lectura puntual cuando Supabase responde 504", async () => {
    const releaseId = "20000000-0000-4000-8000-000000000001";
    const fetchMock = vi
      .fn(async (_input: string | URL | Request) =>
        Response.json([], { status: 504 }),
      )
      .mockResolvedValueOnce(
        Response.json({ message: "Gateway Timeout" }, { status: 504 }),
      )
      .mockResolvedValueOnce(
        Response.json([
          {
            id: releaseId,
            number: 61,
            display_name: "V19 CUELLO",
            notes: "",
            status: "active",
            definition_ids: [definitionId],
            changed_definition_ids: [definitionId],
            baseline_definition_ids: [],
            base_release_id: null,
            checklist: {},
            created_by: "admin@la-roca.local",
            approved_by: "admin@la-roca.local",
            published_by: "admin@la-roca.local",
            created_at: "2026-09-12T17:00:00+00:00",
            updated_at: "2026-09-12T17:05:00+00:00",
            submitted_at: "2026-09-12T17:02:00+00:00",
            approved_at: "2026-09-12T17:03:00+00:00",
            published_at: "2026-09-12T17:05:00+00:00",
          },
        ]),
      );
    vi.stubGlobal("fetch", fetchMock);

    const release = await getVisualRelease(env, releaseId);

    expect(release.status).toBe("active");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
