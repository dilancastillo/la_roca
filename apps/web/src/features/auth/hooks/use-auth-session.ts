import { useQuery } from "@tanstack/react-query";
import { ApiError } from "../../../lib/api-client";
import { fetchAuthSession } from "../api";

export function useAuthSession() {
  return useQuery({
    queryKey: ["auth-session"],
    queryFn: fetchAuthSession,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 401) {
        return false;
      }

      return failureCount < 1;
    },
  });
}
