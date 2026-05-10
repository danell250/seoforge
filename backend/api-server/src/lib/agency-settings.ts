import { db, agencySettingsTable, pool } from "@workspace/db";
import { DEFAULT_AGENCY_SETTINGS, normalizeBrandName } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import { isMissingRelationError } from "./db-errors";

export async function ensureAgencySettingsSchema() {
  try {
    await pool.query(`
      ALTER TABLE agency_settings
        ADD COLUMN IF NOT EXISTS user_id integer NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS brand_voice text,
        ADD COLUMN IF NOT EXISTS preferred_markets text,
        ADD COLUMN IF NOT EXISTS primary_cms text,
        ADD COLUMN IF NOT EXISTS optimization_style text,
        ADD COLUMN IF NOT EXISTS custom_subdomain text,
        ADD COLUMN IF NOT EXISTS custom_email_domain text,
        ADD COLUMN IF NOT EXISTS enable_client_portal boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
    `);
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS agency_settings_user_id_idx
        ON agency_settings (user_id);
    `);
  } catch (error) {
    if (isMissingRelationError(error, "agency_settings")) {
      logger.warn(
        { table: "agency_settings" },
        "Agency settings table is missing. Skipping additive schema guard until the schema is pushed.",
      );
      return;
    }
    throw error;
  }
}

export async function getAgencySettingsRow(userId?: number) {
  if (typeof userId === "number" && userId > 0) {
    const rows = await db
      .select()
      .from(agencySettingsTable)
      .where(eq(agencySettingsTable.userId, userId));
    if (rows.length > 0) {
      return rows[0];
    }
  }

  const legacyRows = await db
    .select()
    .from(agencySettingsTable)
    .where(eq(agencySettingsTable.userId, 0));
  return legacyRows[0] ?? null;
}

export async function ensureAgencySettingsRow(userId: number) {
  const existing = await getAgencySettingsRow(userId);
  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(agencySettingsTable)
    .values({
      userId,
      ...DEFAULT_AGENCY_SETTINGS,
    })
    .returning();
  return created;
}

export async function normalizeStoredAgencyBrandName() {
  try {
    await db.transaction(async (tx: any) => {
      const rows = await tx.select().from(agencySettingsTable);
      await Promise.all(
        rows.map(async (row) => {
          const nextBrandName = normalizeBrandName(row.brandName);
          if (nextBrandName === row.brandName) {
            return;
          }
          await tx
            .update(agencySettingsTable)
            .set({
              brandName: nextBrandName,
              updatedAt: new Date(),
            })
            .where(eq(agencySettingsTable.id, row.id));
        }),
      );
    });
  } catch (error) {
    if (isMissingRelationError(error, "agency_settings")) {
      logger.warn(
        { table: "agency_settings" },
        "Agency settings table is missing. Skipping brand normalization until the schema is pushed.",
      );
      return;
    }
    throw error;
  }
}
