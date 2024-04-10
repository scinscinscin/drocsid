import next from "next";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import { unTypeSafeRouter } from "./routers/index.js";
import { Server } from "@scinorandex/rpscin";
import { createServer } from "http";
import { userRouter } from "./routers/userRouter.js";
import { JwtAuth } from "./utils/auth.js";
import { channelRouter } from "./routers/channelRouter.js";

const nextApp = next({ dev: process.env.NODE_ENV === "development" });
const handle = nextApp.getRequestHandler();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticFolderPath = path.join(__dirname, "../public/");

const appRouter = unTypeSafeRouter.mergeRouter(userRouter).mergeRouter(channelRouter);
export type AppRouter = typeof appRouter;

const main = async () => {
  await nextApp.prepare();

  const server = express();
  const erpcServer = Server(
    {
      port: 0,
      startAuto: false,
      logErrors: process.env.NODE_ENV === "development",
      apiPrefix: "/api",
    },
    appRouter
  );

  server.disable("etag");
  server.disable("x-powered-by");

  server.use(cookieParser());

  server.use(async (req, res, next) => {
    const user = await JwtAuth.authenticate(req).catch(() => null);
    res.locals.user = user;
    next();
  });

  server.use("/api", erpcServer.intermediate);
  server.get("/static/*", express.static(staticFolderPath, { etag: false, immutable: true }));
  server.get("*", (req, res) => handle(req, res));

  server.use((req, res) => nextApp.render404(req, res));
  server.use("*", (err: Error, req: Request, res: Response) => {
    nextApp.renderError(err, req, res, req.path, {});
  });

  const httpServer = createServer(server);
  httpServer.on("upgrade", (req, socket, head) => {
    return erpcServer.createWebSocketHandler()(req, socket, head);
  });

  httpServer.listen(8000, () => {
    console.log("Started on http://localhost:8000 and ws://localhost:8000");
  });
};

main().catch((err) => console.log("unexpected error occured", err));
