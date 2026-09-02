import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import { toNodeHandler } from "better-auth/node";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { auth } from "./auth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { ENV } from "./env";
import {
  createApiRateLimiter,
  createAuthRateLimiter,
  requestIdMiddleware,
} from "./security";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Security headers. CSP is left to a dedicated follow-up once every external asset
  // domain (S3, Google Maps, fonts) is enumerated, to avoid breaking legitimate content.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(requestIdMiddleware);

  // Configure trust proxy based on explicit TRUST_PROXY setting
  if (ENV.trustProxy !== undefined && ENV.trustProxy.trim().length > 0) {
    const rawVal = ENV.trustProxy.trim();
    if (rawVal === "true") {
      app.set("trust proxy", true);
    } else if (rawVal === "false") {
      app.set("trust proxy", false);
    } else if (!isNaN(Number(rawVal))) {
      app.set("trust proxy", Number(rawVal));
    } else {
      app.set("trust proxy", rawVal);
    }
  } else if (ENV.isProduction) {
    // In production behind reverse proxy/load-balancer, trust 1 upstream proxy hop
    app.set("trust proxy", 1);
  } else {
    // In local development, disable trust proxy to avoid spoofing
    app.set("trust proxy", false);
  }

  // Mount Better Auth handler BEFORE body-parsing middleware
  app.all("/api/auth/*", createAuthRateLimiter(), toNodeHandler(auth));

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createApiRateLimiter(),
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV !== "production") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
