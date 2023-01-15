import { PrismaClient } from "@prisma/client";
import { inferAsyncReturnType, initTRPC } from "@trpc/server";
import { IncomingMessage, ServerResponse } from "http";
import { WebSocket } from "ws";

const t = initTRPC.context<inferAsyncReturnType<typeof createContext>>().create();
export const router = t.router;
export const procedure = t.procedure;
export const middleware = t.middleware;

export async function createContext(ctx: { req: IncomingMessage; res: ServerResponse | WebSocket }) {
  return { req: ctx.req, res: ctx.res };
}

let prisma: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  //@ts-ignore
  if (!global.prisma) global.prisma = new PrismaClient();
  //@ts-ignore
  prisma = global.prisma;
}

export const db = prisma;
