import type { Request, RequestHandler } from "express";
import {
  buildClearedSessionCookie,
  getSessionCookieName,
  getSessionUser,
  type SessionUser,
} from "../lib/auth";

type RequestWithAuth = Request & {
  auth?: {
    user: SessionUser | null;
  };
};

function readSessionToken(req: Request): string | null {
  const cookies = (req as Request & { cookies?: Record<string, unknown> }).cookies;
  const token = cookies?.[getSessionCookieName()];
  return typeof token === "string" && token.trim() ? token : null;
}

export const attachRequestAuth: RequestHandler = async (req, _res, next) => {
  const request = req as RequestWithAuth;
  request.auth = { user: null };

  const token = readSessionToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    request.auth.user = await getSessionUser(token);
    if (!request.auth.user) {
      _res.append("Set-Cookie", buildClearedSessionCookie());
    }
  } catch (err) {
    req.log.error({ err }, "session lookup failed");
  }

  next();
};

export const requireAuthenticatedUser: RequestHandler = (req, res, next) => {
  const request = req as RequestWithAuth;
  if (!request.auth?.user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  next();
};

export function getAuthenticatedUser(req: Request): SessionUser | null {
  return (req as RequestWithAuth).auth?.user ?? null;
}
