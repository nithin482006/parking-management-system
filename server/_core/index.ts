import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ENV } from "./env";

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

/**
 * Validate OAuth environment variables during startup
 */
function validateOAuthConfig() {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required OAuth environment variables
  if (!ENV.appId) {
    errors.push('VITE_APP_ID is not configured');
  }

  if (!ENV.oAuthServerUrl) {
    errors.push('OAUTH_SERVER_URL is not configured');
  }

  // Check for production domain configuration if needed
  const productionDomain = process.env.VITE_PRODUCTION_DOMAIN;
  if (!productionDomain && ENV.isProduction) {
    warnings.push('VITE_PRODUCTION_DOMAIN is not configured for production. Preview deployments may not support OAuth.');
  }

  if (errors.length > 0) {
    console.error('[OAuth] Configuration Errors:');
    errors.forEach(err => console.error(`  - ${err}`));
    throw new Error('OAuth configuration is incomplete. Cannot start server.');
  }

  if (warnings.length > 0) {
    console.warn('[OAuth] Configuration Warnings:');
    warnings.forEach(warn => console.warn(`  - ${warn}`));
  }

  console.log('[OAuth] Configuration validated successfully');
  console.log(`  - App ID: ${ENV.appId}`);
  console.log(`  - OAuth Server: ${ENV.oAuthServerUrl}`);
  console.log(`  - Production Domain: ${productionDomain || 'not configured'}`);
  console.log(`  - Environment: ${ENV.isProduction ? 'production' : 'development'}`);
}

async function startServer() {
  // Validate OAuth configuration before starting
  validateOAuthConfig();

  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
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
