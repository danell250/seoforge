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
const DEV_ADMIN_EMAIL = "admin@localhost";
const DEV_ADMIN_PASSWORD = "ChangeMe123!";
const BOOTSTRAP_FLAG = "AUTH_BOOTSTRAP_ADMIN";

let bootstrapPromise: Promise<void> | null = null;
let warnedAboutDevCredentials = false;
let warnedAboutBootstrap = false;

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

  if (email && password) {
    return {
      email: normalizeEmail(email),
      password,
      usingDefaults: false,
    };
  }

  if (!IS_PRODUCTION) {
    return {
      email: DEV_ADMIN_EMAIL,
      password: DEV_ADMIN_PASSWORD,
      usingDefaults: true,
    };
  }

  throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in production.");
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

async function ensureAdminUser(): Promise<void> {
  const { email, password, usingDefaults } = getAdminCredentials();
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
    });
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
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (IS_PRODUCTION) {
    parts.push("Secure");
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
