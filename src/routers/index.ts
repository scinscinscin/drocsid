import { Connection, baseProcedure, wsValidate } from "@scinorandex/erpc";
import { createWebSocketEndpoint, getRootRouter } from "@scinorandex/rpscin";
import { z } from "zod";

type Endpoint = {
  Receives: {};
  Emits: { ping: { date: number }; newLogin: { username: string } };
};
const connections: Set<Connection<Endpoint>> = new Set();

export const unTypeSafeRouter = getRootRouter({
  "/status": {
    get: baseProcedure.use(async () => {
      return {
        status: "ok",
        time: Date.now(),
        timePH: new Date().toLocaleString("en-PH"),
      };
    }),

    /**
     * Create a websocket listener under /api/status that keeps track of new connections
     */
    ws: createWebSocketEndpoint(wsValidate<Endpoint>({}), async ({ conn, params, query }) => {
      console.log("Client has connected");
      connections.add(conn);

      const intervalId = setInterval(() => {
        conn.emit("ping", { date: Date.now() });
      }, 2000);

      conn.socket.on("close", () => {
        console.log("Client has disconnected");
        connections.delete(conn);
        clearTimeout(intervalId);
      });
    }),
  },

  "/broadcast": {
    /**
     * Send a message to every websocket connected to /api/status
     */
    post: baseProcedure.input(z.object({ username: z.string() })).use(async (req, res, { input }) => {
      connections.forEach((conn) => conn.emit("newLogin", { username: input.username }));
      return {};
    }),
  },
});
