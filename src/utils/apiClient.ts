import Cookies from "js-cookie";
import { Client } from "@scinorandex/rpscin/dist/client";
import { Browser } from "@scinorandex/rpscin/dist/envs/browser";
import type { AppRouter } from "../server";

export const client = Client<AppRouter, WebSocket>({
  wsClient: Browser.generateWebSocketClient("ws://localhost:8000/api"),
  serializer: Browser.serializer,
  apiLink: "/api",
  generateHeaders: () => ({
    // "x-csrf-token": Cookies.get("csrfToken") ?? "",
  }),
});
