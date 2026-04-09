import { useQuery } from "@tanstack/react-query";
import { configuratorSessionSchema } from "@repo/shared/schemas/configurator";
import { requestJson } from "../../../lib/api-client";

export function useConfiguratorSession(lineId: number, enabled = true) {
  return useQuery({
    queryKey: ["configurator-session", lineId],
    queryFn: async () => {
      const data = await requestJson(`/api/session/${lineId}`);
      return configuratorSessionSchema.parse(data);
    },
    staleTime: 30_000,
    retry: false,
    enabled,
  });
}
