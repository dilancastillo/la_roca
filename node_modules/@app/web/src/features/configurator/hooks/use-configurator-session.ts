import { useQuery } from "@tanstack/react-query";
import { configuratorSessionSchema } from "@repo/shared/schemas/configurator";

export function useConfiguratorSession(lineId: number) {
  return useQuery({
    queryKey: ["configurator-session", lineId],
    queryFn: async () => {
      const res = await fetch(`/api/session/${lineId}`, {
        credentials: "same-origin",
        headers: {
          Accept: "application/json"
        }
      });

      if (!res.ok) {
        throw new Error("No se pudo cargar la sesión.");
      }

      const json = await res.json();
      return configuratorSessionSchema.parse(json);
    },
    staleTime: 60_000
  });
}