import { useQuery } from "@tanstack/react-query";
import { configuratorSessionSchema } from "@repo/shared/schemas/configurator";
import { requestJson } from "../../../lib/api-client";

type ConfiguratorSessionQueryOptions = {
  visualReleaseId?: string;
  view?: "candidate" | "baseline";
  scenarioId?: string;
};

export function useConfiguratorSession(
  lineId: number,
  enabled = true,
  options: ConfiguratorSessionQueryOptions = {},
) {
  const isVisualLaboratory = Boolean(options.visualReleaseId);
  const view = options.view ?? "candidate";

  return useQuery({
    queryKey: isVisualLaboratory
      ? [
          "configurator-session",
          "visual-laboratory",
          options.visualReleaseId,
          lineId,
          view,
          options.scenarioId ?? null,
        ]
      : ["configurator-session", lineId],
    queryFn: async () => {
      const search = new URLSearchParams();
      search.set("view", view);
      if (options.scenarioId) {
        search.set("scenarioId", options.scenarioId);
      }
      const data = await requestJson(
        isVisualLaboratory
          ? `/api/admin/visual-catalog/releases/${options.visualReleaseId}/preview-session/${lineId}?${search.toString()}`
          : `/api/session/${lineId}`,
      );
      return configuratorSessionSchema.parse(data);
    },
    staleTime: 0,
    refetchOnMount: "always",
    retry: false,
    enabled,
  });
}
