import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { applyWSSHandler } from "@trpc/server/adapters/ws";
import { appRouter as router } from "./routers/appRouter";
import { createContext } from "./trpc";
import { WebSocketServer } from "ws";
import { createServer } from "http";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const PORT = parseInt(process.env.PORT || "6969", 10);

const server = createServer();
const expressServer = express();
const wss = new WebSocketServer({ server: server });
const handler = applyWSSHandler({ wss, router, createContext });

expressServer.use(
  cors({
    origin: process.env.ENV === "development" ? "http://localhost:5173" : "https://drocsid.scinorandex.xyz",
    credentials: true,
    maxAge: 86400,
    preflightContinue: true,
  })
);

expressServer.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Cache-Control", "public, max-age=86400");
    // No Vary required: cors sets it already set automatically
    res.end();
  } else {
    next();
  }
});

expressServer.use(cookieParser());

expressServer.use("/trpc", createExpressMiddleware({ router, createContext }));

server.on("request", expressServer).listen(PORT, () => {
  console.log("Server started on port", PORT);
});

wss.on("connection", (ws) => {
  console.log("New connection", wss.clients.size);

  ws.on("close", () => {
    console.log("Connection closed", wss.clients.size);
  });
});

process.on("SIGTERM", () => {
  handler.broadcastReconnectNotification();
  wss.close();
});
