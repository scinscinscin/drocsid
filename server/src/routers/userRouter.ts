import { z } from "zod";
import { db, procedure, router } from "../trpc";
import crs from "crypto-random-string";
import jsonwebtoken from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { ServerResponse } from "http";

export const JWT_NAME = "drocsid_token";
export const JWT_SECRET = "my_secret";

export const userRouter = router({
  login: procedure.input(z.object({ username: z.string(), password: z.string() })).mutation(async ({ ctx, input }) => {
    let user = await db.user.findFirst({ where: { username: input.username } });

    if (user == null) {
      user = await db.user.create({
        data: {
          username: input.username,
          hash: input.password.split("").reverse().join(""),
          salt: crs(32),
        },
      });
    }

    if (input.password.split("").reverse().join("") !== user.hash) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
    }

    const res = ctx.res as ServerResponse;
    const cookie = jsonwebtoken.sign({ uuid: user.uuid }, JWT_SECRET, { expiresIn: "1d" });
    res.setHeader("Set-Cookie", `${JWT_NAME}=${cookie}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`);

    return { username: user.username };
  }),

  getUser: procedure.query(async ({ ctx, input }) => {
    const jwtCookie = (ctx.req as any).cookies[JWT_NAME];
    if (jwtCookie == null) return null;

    try {
      const { uuid } = jsonwebtoken.verify(jwtCookie, JWT_SECRET) as { uuid: string };
      const user = await db.user.findFirst({ where: { uuid } });
      if (user == null) throw new Error("User not found");

      return { username: user.username };
    } catch {
      return null;
    }
  }),
});
