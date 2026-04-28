import { db, agencySettingsTable } from "@workspace/db";
import { DEFAULT_AGENCY_SETTINGS, normalizeBrandName } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import { isMissingRelationError } from "./db-errors";

const SINGLETON_ID = 1;

export async function getAgencySettingsRow() {
  const rows = await db.select().from(agencySettingsTable).where(eq(agencySettingsTable.id, SINGLETON_ID));
  return rows[0] ?? null;
}

export async function ensureAgencySettingsRow() {
  const existing = await getAgencySettingsRow();
  if (existing) {
    return existing;
  }

  const [created] = await db
    .insert(agencySettingsTable)
    .values({
      id: SINGLETON_ID,
      ...DEFAULT_AGENCY_SETTINGS,
    })
    .returning();
  return created;
}

export async function normalizeStoredAgencyBrandName() {
  try {
    await db.transaction(async (tx) => {
      const rows = await tx.select().from(agencySettingsTable).where(eq(agencySettingsTable.id, SINGLETON_ID));
      const row = rows[0];
      if (!row) {
        return;
      }

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
        .where(eq(agencySettingsTable.id, SINGLETON_ID));
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
