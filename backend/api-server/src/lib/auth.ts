import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt } from "drizzle-orm";
import { db, usersTable, sessionsTable } from "@workspace/db";
import { logger } from "./logger";

const scrypt = promisify(scryptCallback);

const SESSION_COOKIE_NAME = "seoforge_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const SESSION_TOUCH_INTERVAL_MS = 1000 * 60 * 5;
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const COOKIE_SAME_SITE = (
  process.env.SESSION_COOKIE_SAMESITE ?? (IS_PRODUCTION ? "none" : "lax")
).trim().toLowerCase();
const COOKIE_PARTITIONED = (process.env.SESSION_COOKIE_PARTITIONED ?? "true").trim().toLowerCase() !== "false";
const DEV_ADMIN_EMAIL = "admin@localhost";
const BOOTSTRAP_FLAG = "AUTH_BOOTSTRAP_ADMIN";
const DEFAULT_ADMIN_PLAN = "agency";

let bootstrapPromise: Promise<void> | null = null;
let warnedAboutDevCredentials = false;
let warnedAboutBootstrap = false;

export class AuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConfigurationError";
  }
}

export interface SessionUser {
  id: number;
  email: string;
  displayName: string;
  role: string;
  plan: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (password) {
    return {
      email: normalizeEmail(email || DEV_ADMIN_EMAIL),
      password,
      usingDefaults: !email,
    };
  }

  if (!IS_PRODUCTION) {
    throw new AuthConfigurationError(
      "ADMIN_PASSWORD must be set for auth bootstrap. Optionally set ADMIN_EMAIL; it defaults to admin@localhost in development.",
    );
  }

  throw new AuthConfigurationError("ADMIN_EMAIL and ADMIN_PASSWORD must be set in production.");
}

function getAdminPlan() {
  const plan = process.env.ADMIN_PLAN?.trim();
  return plan || DEFAULT_ADMIN_PLAN;
}

function buildDisplayName(email: string) {
  const local = email.split("@")[0] ?? "Workspace User";
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return "Workspace User";
  return cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toSessionUser(user: typeof usersTable.$inferSelect): SessionUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    plan: user.plan,
  };
}

async function hashPassword(password: string, salt = randomBytes(16).toString("hex")): Promise<string> {
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(expectedHex, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(expected, derived);
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function syncExistingAdmin(existing: typeof usersTable.$inferSelect, password: string, plan: string) {
  const updates: Partial<typeof usersTable.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (existing.plan !== plan) {
    updates.plan = plan;
  }

  const passwordMatches = await verifyPassword(password, existing.passwordHash);
  if (!passwordMatches) {
    updates.passwordHash = await hashPassword(password);
  }

  if (Object.keys(updates).length > 1) {
    await db.update(usersTable).set(updates).where(eq(usersTable.id, existing.id));
  }
}

async function ensureAdminUser(): Promise<void> {
  const { email, password, usingDefaults } = getAdminCredentials();
  const plan = getAdminPlan();
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  const canBootstrap = process.env[BOOTSTRAP_FLAG] === "true";

  if (!existing) {
    if (!canBootstrap) {
      if (!warnedAboutBootstrap) {
        warnedAboutBootstrap = true;
        logger.warn(
          {
            email,
            bootstrapFlag: BOOTSTRAP_FLAG,
          },
          "Admin bootstrap skipped because AUTH_BOOTSTRAP_ADMIN is not enabled.",
        );
      }
      return;
    }

    const passwordHash = await hashPassword(password);
    await db.insert(usersTable).values({
      email,
      passwordHash,
      displayName: "Workspace Admin",
      role: "admin",
      plan,
    });
  } else if (canBootstrap) {
    await syncExistingAdmin(existing, password, plan);
  }

  if (usingDefaults && !warnedAboutDevCredentials) {
    warnedAboutDevCredentials = true;
    logger.warn(
      {
        email: DEV_ADMIN_EMAIL,
      },
      "Using development admin credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD before production.",
    );
  }
}

export async function bootstrapAuth(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = ensureAdminUser();
  }
  return bootstrapPromise;
}

export async function createSessionForLogin(email: string, password: string) {
  await bootstrapAuth();

  const normalizedEmail = normalizeEmail(email);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail)).limit(1);
  if (!user) return null;

  const passwordOk = await verifyPassword(password, user.passwordHash);
  if (!passwordOk) return null;

  const rawToken = randomBytes(32).toString("base64url");
  const hashedToken = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessionsTable).values({
    id: hashedToken,
    userId: user.id,
    expiresAt,
    lastSeenAt: new Date(),
  });

  return {
    token: rawToken,
    expiresAt,
    user: toSessionUser(user),
  };
}

export async function registerUserAccount(email: string, password: string) {
  await bootstrapAuth();

  const normalizedEmail = normalizeEmail(email);
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail)).limit(1);
  if (existing) {
    return { status: "exists" as const };
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(usersTable)
    .values({
      email: normalizedEmail,
      passwordHash,
      displayName: buildDisplayName(normalizedEmail),
      role: "user",
      plan: "free",
    })
    .returning();

  const rawToken = randomBytes(32).toString("base64url");
  const hashedToken = hashSessionToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db.insert(sessionsTable).values({
    id: hashedToken,
    userId: user.id,
    expiresAt,
    lastSeenAt: new Date(),
  });

  return {
    status: "created" as const,
    token: rawToken,
    expiresAt,
    user: toSessionUser(user),
  };
}

export async function getSessionUser(sessionToken: string): Promise<SessionUser | null> {
  const hashedToken = hashSessionToken(sessionToken);
  const now = new Date();

  const rows = await db
    .select({
      sessionId: sessionsTable.id,
      expiresAt: sessionsTable.expiresAt,
      lastSeenAt: sessionsTable.lastSeenAt,
      user: usersTable,
    })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(and(eq(sessionsTable.id, hashedToken), gt(sessionsTable.expiresAt, now)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    await db.delete(sessionsTable).where(eq(sessionsTable.id, hashedToken)).catch(() => undefined);
    return null;
  }

  if (now.getTime() - row.lastSeenAt.getTime() >= SESSION_TOUCH_INTERVAL_MS) {
    void db
      .update(sessionsTable)
      .set({ lastSeenAt: now })
      .where(eq(sessionsTable.id, row.sessionId))
      .catch(() => undefined);
  }

  return toSessionUser(row.user);
}

export async function revokeSession(sessionToken: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.id, hashSessionToken(sessionToken)));
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

function getCookieAttributes(expiresAt?: Date) {
  const sameSite =
    COOKIE_SAME_SITE === "none"
      ? "None"
      : COOKIE_SAME_SITE === "strict"
        ? "Strict"
        : "Lax";
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    `SameSite=${sameSite}`,
  ];
  if (IS_PRODUCTION || sameSite === "None") {
    parts.push("Secure");
  }
  if (sameSite === "None" && COOKIE_PARTITIONED) {
    parts.push("Partitioned");
  }
  if (expiresAt) {
    parts[0] = `${SESSION_COOKIE_NAME}=`;
    parts.push(`Expires=${expiresAt.toUTCString()}`);
  } else {
    parts.push("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
  }
  return parts;
}

export function buildSessionCookie(sessionToken: string, expiresAt: Date): string {
  const parts = getCookieAttributes(expiresAt);
  parts[0] = `${SESSION_COOKIE_NAME}=${sessionToken}`;
  return parts.join("; ");
}

export function buildClearedSessionCookie(): string {
  return getCookieAttributes().join("; ");
}
