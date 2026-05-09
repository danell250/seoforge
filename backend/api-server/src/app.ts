import express, { type Express } from "express";
import cors, { type CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { attachRequestAuth } from "./middleware/auth";
import { createRateLimit, startRateLimitCleanupLoop } from "./middleware/rate-limit";

const app: Express = express();

function allowedOrigins(): string[] {
  const raw = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "http://localhost:5173";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function setSecurityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  if (process.env.NODE_ENV === "production") {
    const proto = req.headers["x-forwarded-proto"];
    if (req.secure || proto === "https") {
      res.setHeader("Strict-Transport-Security", "max-age=15552000; includeSubDomains");
    }
  }
  next();
}

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins().includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin not allowed by CORS"));
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
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
startRateLimitCleanupLoop();
app.use(createRateLimit({ key: "api", max: 300, windowMs: 1000 * 60 * 15 }));
app.use(attachRequestAuth);

app.use("/api", router);

export default app;
