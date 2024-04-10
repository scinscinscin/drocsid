import { Connection, baseProcedure, wsValidate } from "@scinorandex/erpc";
import { createWebSocketEndpoint, getRootRouter } from "@scinorandex/rpscin";
import { z } from "zod";
import { unTypeSafeRouter } from "./index.js";
import { JwtAuth, authProcedure } from "../utils/auth.js";
import { User } from "@prisma/client";
import { db } from "../utils/prisma.js";

type Endpoint = {
  Receives: { send_message: { contents: string } };
  Emits: { ping: { date: number }; new_message: { contents: string; username: string } };
};

const connections = new Map<string, Set<{ user: User; conn: Connection<Endpoint> }>>();

export const channelRouter = unTypeSafeRouter.sub("/channel", {
  "/create": {
    post: authProcedure.input(z.object({ name: z.string() })).use(async (req, res, { input }) => {
      const newChannel = await db.channel.create({ data: { name: input.name } });
      return { channel: newChannel };
    }),
  },

  "/:channel_uuid": {
    ws: createWebSocketEndpoint(
      wsValidate<Endpoint>({
        send_message: z.object({ contents: z.string() }),
      }),
      async ({ conn, params, query }) => {
        const user = await JwtAuth.authenticate(conn.req);

        console.log(`${user.username} connecteo to ${params.channel_uuid}`);
        if (!connections.has(params.channel_uuid)) connections.set(params.channel_uuid, new Set());
        const sessions = connections.get(params.channel_uuid)!;

        const newSession = { user, conn };
        sessions.add(newSession);

        conn.on("send_message", async ({ contents }) => {
          sessions.forEach((session) => {
            session.conn.emit("new_message", { contents, username: user.username });
          });
        });

        const intervalId = setInterval(() => {
          conn.emit("ping", { date: Date.now() });
        }, 2000);

        conn.socket.on("close", () => {
          console.log("Client has disconnected");
          clearTimeout(intervalId);
          sessions.delete(newSession);
        });
      }
    ),
  },
});
