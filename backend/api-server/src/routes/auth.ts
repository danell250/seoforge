import { Router, type IRouter } from "express";
import {
  bootstrapAuth,
  buildClearedSessionCookie,
  buildSessionCookie,
  createSessionForLogin,
  getSessionCookieName,
  registerUserAccount,
  revokeSession,
} from "../lib/auth";
import { createRateLimit } from "../middleware/rate-limit";
import { getAuthenticatedUser } from "../middleware/auth";

const router: IRouter = Router();
const loginRateLimit = createRateLimit({
  key: "auth-login",
  max: 10,
  windowMs: 1000 * 60 * 15,
});
const registerRateLimit = createRateLimit({
  key: "auth-register",
  max: 10,
  windowMs: 1000 * 60 * 15,
});

function parseLoginBody(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const email = typeof (body as Record<string, unknown>).email === "string"
    ? (body as Record<string, string>).email.trim()
    : "";
  const password = typeof (body as Record<string, unknown>).password === "string"
    ? (body as Record<string, string>).password
    : "";

  if (!email || !password) return null;
  return { email, password };
}

function validateRegistrationInput(input: { email: string; password: string }) {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email);
  if (!emailOk) return "Enter a valid email address.";
  if (input.password.length < 8) return "Password must be at least 8 characters.";
  return null;
}

router.get("/auth/session", async (req, res) => {
  try {
    await bootstrapAuth();
  } catch (err) {
    req.log.error({ err }, "auth bootstrap failed");
    return res.status(503).json({ message: "Authentication is not configured yet." });
  }

  const user = getAuthenticatedUser(req);
  res.setHeader("Cache-Control", "no-store");
  return res.json({
    authenticated: Boolean(user),
    user,
  });
});

router.post("/auth/login", loginRateLimit, async (req, res) => {
  const body = parseLoginBody(req.body);
  if (!body) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  let session;
  try {
    session = await createSessionForLogin(body.email, body.password);
  } catch (err) {
    req.log.error({ err }, "auth bootstrap/login failed");
    return res.status(503).json({ message: "Authentication is not configured yet." });
  }

  if (!session) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.setHeader("Cache-Control", "no-store");
  res.append("Set-Cookie", buildSessionCookie(session.token, session.expiresAt));
  return res.json({
    authenticated: true,
    user: session.user,
  });
});

router.post("/auth/register", registerRateLimit, async (req, res) => {
  const body = parseLoginBody(req.body);
  if (!body) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const validationError = validateRegistrationInput(body);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  let result;
  try {
    result = await registerUserAccount(body.email, body.password);
  } catch (err) {
    req.log.error({ err }, "auth register failed");
    return res.status(503).json({ message: "Authentication is not configured yet." });
  }

  if (result.status === "exists") {
    return res.status(409).json({ message: "An account with that email already exists." });
  }

  res.setHeader("Cache-Control", "no-store");
  res.append("Set-Cookie", buildSessionCookie(result.token, result.expiresAt));
  return res.status(201).json({
    authenticated: true,
    user: result.user,
  });
});

router.post("/auth/logout", async (req, res) => {
  const cookies = (req as typeof req & { cookies?: Record<string, unknown> }).cookies;
  const token = cookies?.[getSessionCookieName()];

  if (typeof token === "string" && token.trim()) {
    await revokeSession(token).catch((err) => {
      req.log.warn({ err }, "session revoke failed");
    });
  }

  res.setHeader("Cache-Control", "no-store");
  res.append("Set-Cookie", buildClearedSessionCookie());
  return res.json({ success: true });
});

export default router;
