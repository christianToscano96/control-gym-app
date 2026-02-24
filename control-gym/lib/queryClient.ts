import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos antes de considerar datos "stale"
      gcTime: 1000 * 60 * 10, // 10 minutos en cache antes de garbage collection
      retry: 2,
      refetchOnWindowFocus: false, // En mobile no aplica tanto como en web
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
