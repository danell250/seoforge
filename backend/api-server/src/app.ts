import express, { type ErrorRequestHandler, type Express, type RequestHandler } from "express";
import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { attachRequestAuth } from "./middleware/auth";
import { csrfProtection } from "./middleware/csrf";
import { createRateLimit, startRateLimitCleanupLoop } from "./middleware/rate-limit";

const app: Express = express();

function allowedOrigins(): string[] {
  const raw =
    process.env.FRONTEND_URLS ||
    process.env.FRONTEND_URL ||
    process.env.CORS_ORIGIN ||
    "http://localhost:5173";
  const origins = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  
  // Always include the production domain for SEOaxe
  if (!origins.includes("https://www.seoaxe.site")) {
    origins.push("https://www.seoaxe.site");
  }
  if (!origins.includes("https://seoaxe.site")) {
    origins.push("https://seoaxe.site");
  }
  
  return origins;
}

function setSecurityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none';");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  if (process.env.NODE_ENV === "production") {
    const proto = req.headers["x-forwarded-proto"];
    if (req.secure || proto === "https") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    }
  }
  next();
}

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    const allowed = allowedOrigins();
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
      return;
    }
    logger.warn({ origin, allowed }, "CORS rejected origin");
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.set("trust proxy", 1);
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors(corsOptions));
app.use(setSecurityHeaders);
app.use(cookieParser());
app.use(
  express.json({
    limit: "10mb",
    verify(req, _res, buf) {
      // Keep raw bytes for webhook signature validation.
      const request = req as express.Request & { rawBody?: Buffer; originalUrl?: string };
      if (request.method === "POST" && request.originalUrl?.startsWith("/api/payments/")) {
        request.rawBody = Buffer.from(buf);
      }
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
startRateLimitCleanupLoop();
app.use(createRateLimit({ key: "api", max: 300, windowMs: 1000 * 60 * 15 }));
app.use(attachRequestAuth);
app.use(csrfProtection);

app.use("/api", router);

const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` });
};

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  req.log.error({ err }, "Unhandled API error");
  if (res.headersSent) return;
  res.status(500).json({ message: "Internal server error" });
};

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
