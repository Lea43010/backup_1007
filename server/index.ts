import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { 
  corsOptions, 
  setupSecurity, 
  rateLimitConfig
} from "./security";
import { errorPrevention, createPreventionMiddleware } from "./error-prevention";
import { createErrorLearningMiddleware } from "./error-learning-middleware";
import { startTrialReminderScheduler } from "./trialReminderService";

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Apply CORS first
app.use(cors(corsOptions));

// Apply rate limiting
app.use(rateLimit(rateLimitConfig));

// Setup security headers and CSP
setupSecurity(app);

// Apply basic helmet security (excluding CSP since we handle it manually)
app.use(helmet({
  contentSecurityPolicy: false, // We handle CSP in security.ts
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Add Error Prevention Middleware
app.use(createPreventionMiddleware());

// Add comprehensive Error Learning Middleware
app.use(createErrorLearningMiddleware());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Replace basic error handler with intelligent error learning handler
  app.use(errorPrevention.createExpressErrorHandler());

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Start the trial reminder scheduler after server is ready
    startTrialReminderScheduler();
  });
})();
