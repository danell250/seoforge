import { Router, type IRouter } from "express";
import { z } from "zod";
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

// ---------- Validation schemas ----------
const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address.").max(254),
  password: z.string().min(1, "Password is required.").max(1024),
});

const RegisterSchema = z.object({
  email: z.string().email("Enter a valid email address.").max(254),
  password: z.string().min(8, "Password must be at least 8 characters.").max(1024),
});

const GoogleLoginSchema = z.object({
  idToken: z.string().min(1, "Google ID token is required.").max(4096),
});

// ---------- Rate limiters ----------
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

// ---------- Helpers ----------
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

// ---------- Routes ----------
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
  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0]?.message ?? "Email and password are required." });
  }
  const { email, password } = parsed.data;

  let session;
  try {
    session = await createSessionForLogin(email, password);
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
  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.errors[0]?.message ?? "Email and password are required." });
  }
  const { email, password } = parsed.data;

  let result;
  try {
    result = await registerUserAccount(email, password);
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
  const parsed = GoogleLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Google ID token is required." });
  }
  const { idToken } = parsed.data;

  const configuredClientIds = resolveGoogleClientIds();
  if (configuredClientIds.length === 0) {
    return res.status(503).json({ message: "Google login is not configured yet." });
  }

  let tokenInfo: GoogleTokenInfo | null = null;

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
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

  const displayName =
    tokenInfo?.name?.trim() ||
    [tokenInfo?.given_name, tokenInfo?.family_name].filter(Boolean).join(" ").trim() ||
    null;

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
