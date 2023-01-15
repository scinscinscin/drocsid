import { z } from "zod";
import { procedure, router } from "../trpc";
import { roomRouter } from "./roomRouter";
import { userRouter } from "./userRouter";

export const appRouter = router({
  user: userRouter,
  room: roomRouter,
});

export type AppRouter = typeof appRouter;
