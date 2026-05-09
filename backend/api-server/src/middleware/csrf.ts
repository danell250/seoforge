import type { RequestHandler } from "express";
import { getSessionCookieName } from "../lib/auth";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

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

  if (!origins.includes("https://www.seoaxe.site")) {
    origins.push("https://www.seoaxe.site");
  }
  if (!origins.includes("https://seoaxe.site")) {
    origins.push("https://seoaxe.site");
  }
  return origins;
}

function readOriginFromHeaders(headers: Record<string, unknown>): string | null {
  const origin = headers.origin;
  if (typeof origin === "string" && origin.trim()) {
    return origin.trim();
  }

  const referer = headers.referer;
  if (typeof referer === "string" && referer.trim()) {
    try {
      return new URL(referer).origin;
    } catch {
      return null;
    }
  }

  return null;
}

function hasSessionCookie(cookieHeader: string | undefined): boolean {
  if (!cookieHeader) return false;
  const cookieName = getSessionCookieName();
  const encoded = encodeURIComponent(cookieName);
  return cookieHeader.split(";").some((chunk) => {
    const trimmed = chunk.trim();
    return trimmed.startsWith(`${cookieName}=`) || trimmed.startsWith(`${encoded}=`);
  });
}

function isWebhookPath(path: string): boolean {
  return path.startsWith("/api/payments/") && path.endsWith("/webhook");
}

export const csrfProtection: RequestHandler = (req, res, next) => {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  if (isWebhookPath(req.path)) {
    next();
    return;
  }

  const cookieHeader = req.headers.cookie;
  if (!hasSessionCookie(cookieHeader)) {
    next();
    return;
  }

  const origin = readOriginFromHeaders(req.headers as Record<string, unknown>);
  if (!origin) {
    res.status(403).json({ message: "Missing origin header for state-changing request." });
    return;
  }

  const allowed = allowedOrigins();
  if (!allowed.includes(origin)) {
    res.status(403).json({ message: "Origin not allowed for this action." });
    return;
  }

  next();
};

