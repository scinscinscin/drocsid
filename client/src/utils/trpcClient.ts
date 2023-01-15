import { createTRPCProxyClient, createWSClient, httpLink, wsLink } from "@trpc/client";
import type { AppRouter } from "../../../server/src/routers/appRouter";

export const api = createTRPCProxyClient<AppRouter>({
  links: [wsLink({ client: createWSClient({ url: `ws://localhost:6969` }) })],
});

export const httpClient = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: `http://localhost:6969/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
