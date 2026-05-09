import { Router, type IRouter } from "express";
import {
  bootstrapAuth,
  buildClearedSessionCookie,
  buildSessionCookie,
  createSessionForGoogleLogin,
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
  failOpen: false,
});
const registerRateLimit = createRateLimit({
  key: "auth-register",
  max: 10,
  windowMs: 1000 * 60 * 15,
  failOpen: false,
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

function parseGoogleLoginBody(body: unknown) {
  if (!body || typeof body !== "object") return null;
  const idToken = typeof (body as Record<string, unknown>).idToken === "string"
    ? (body as Record<string, string>).idToken.trim()
    : "";
  if (!idToken) return null;
  return { idToken };
}

function resolveGoogleClientIds(): string[] {
  const raw = process.env.GOOGLE_CLIENT_ID?.trim() || "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

type GoogleTokenInfo = {
  email?: string;
  email_verified?: string;
  aud?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
};

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

router.post("/auth/google", loginRateLimit, async (req, res) => {
  const body = parseGoogleLoginBody(req.body);
  if (!body) {
    return res.status(400).json({ message: "Google ID token is required." });
  }

  const configuredClientIds = resolveGoogleClientIds();
  if (configuredClientIds.length === 0) {
    return res.status(503).json({ message: "Google login is not configured yet." });
  }

  let tokenInfo: GoogleTokenInfo | null = null;

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(body.idToken)}`,
    );
    if (!response.ok) {
      return res.status(401).json({ message: "Google token verification failed." });
    }
    tokenInfo = (await response.json()) as GoogleTokenInfo;
  } catch (err) {
    req.log.error({ err }, "Google token verification request failed");
    return res.status(502).json({ message: "Google login service is temporarily unavailable." });
  }

  const audience = tokenInfo?.aud?.trim();
  if (!audience || !configuredClientIds.includes(audience)) {
    return res.status(401).json({ message: "Google token audience mismatch." });
  }

  const email = tokenInfo?.email?.trim().toLowerCase();
  if (!email || tokenInfo?.email_verified !== "true") {
    return res.status(401).json({ message: "Google account email is not verified." });
  }

  const displayName = tokenInfo?.name?.trim()
    || [tokenInfo?.given_name, tokenInfo?.family_name].filter(Boolean).join(" ").trim()
    || null;

  try {
    const session = await createSessionForGoogleLogin({ email, displayName });
    res.setHeader("Cache-Control", "no-store");
    res.append("Set-Cookie", buildSessionCookie(session.token, session.expiresAt));
    return res.json({
      authenticated: true,
      user: session.user,
    });
  } catch (err) {
    req.log.error({ err }, "Google auth login failed");
    return res.status(500).json({ message: "Google login failed." });
  }
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
