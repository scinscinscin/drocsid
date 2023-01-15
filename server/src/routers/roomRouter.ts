import { TRPCError } from "@trpc/server";
import { db, middleware, procedure, router } from "../trpc";
import { JWT_NAME, JWT_SECRET } from "./userRouter";
import jsonwebtoken from "jsonwebtoken";
import { z } from "zod";
import { observable } from "@trpc/server/observable";
import EventEmitter from "events";

const memberProcedure = procedure.use(
  middleware(async ({ ctx, next, type }) => {
    const jwtCookie = (ctx.req as any).cookies[JWT_NAME];
    if (jwtCookie == null) throw new TRPCError({ code: "UNAUTHORIZED" });

    try {
      const { uuid } = jsonwebtoken.verify(jwtCookie, JWT_SECRET) as { uuid: string };
      const user = await db.user.findFirst({ where: { uuid } });
      if (user == null) throw new TRPCError({ code: "UNAUTHORIZED" });
      return next({ ctx: { user } });
    } catch {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
  })
);

const ee = new EventEmitter();

export const roomRouter = router({
  create: memberProcedure.input(z.object({ name: z.string() })).mutation(async ({ ctx, input }) => {
    const newRoom = await db.room.create({ data: { name: input.name } });
    return { uuid: newRoom.uuid, name: newRoom.name };
  }),

  getMany: memberProcedure
    .input(z.array(z.string()))
    .output(z.array(z.object({ uuid: z.string(), name: z.string() })))
    .query(async ({ ctx, input }) => {
      const rooms = await db.room.findMany({ where: { uuid: { in: input } } });
      return rooms.map((room) => ({ uuid: room.uuid, name: room.name }));
    }),

  listen: procedure.input(z.string()).subscription(async ({ ctx, input }) => {
    console.log("ctx.user.username", "started listening to", input);
    return observable<{ username: string; msg: string }>((emit) => {
      const handler = (data: { username: string; msg: string }) => emit.next(data);
      ee.on(`msg-${input}`, handler);
      return () => ee.off(`msg-${input}`, handler);
    });
  }),

  broadcast: memberProcedure
    .input(z.object({ roomUuid: z.string(), msg: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log(ctx.user.username, "sent message", input);
      ee.emit(`msg-${input.roomUuid}`, { username: ctx.user.username, msg: input.msg });
    }),
});
