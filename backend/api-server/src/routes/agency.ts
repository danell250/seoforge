import { Router, type IRouter } from "express";
import { db, agencySettingsTable } from "@workspace/db";
import {
  DEFAULT_AGENCY_SETTINGS,
  GetAgencySettingsResponse,
  normalizeBrandName,
  UpdateAgencySettingsBody,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { requireAuthenticatedUser } from "../middleware/auth";
import { isMissingRelationError } from "../lib/db-errors";
import { ensureAgencySettingsRow, getAgencySettingsRow } from "../lib/agency-settings";

const router: IRouter = Router();

const DEFAULT_SETTINGS = DEFAULT_AGENCY_SETTINGS;
const SINGLETON_ID = 1;

function toResponse(row: typeof agencySettingsTable.$inferSelect) {
  return {
    brandName: normalizeBrandName(row.brandName),
    tagline: row.tagline,
    logoUrl: row.logoUrl,
    primaryColor: row.primaryColor,
    supportEmail: row.supportEmail,
    websiteUrl: row.websiteUrl,
  };
}

router.get("/agency-settings", requireAuthenticatedUser, async (_req, res) => {
  try {
    const row = await getAgencySettingsRow();
    if (!row) {
      return res.json(GetAgencySettingsResponse.parse(DEFAULT_SETTINGS));
    }
    return res.json(GetAgencySettingsResponse.parse(toResponse(row)));
  } catch (err) {
    if (isMissingRelationError(err, "agency_settings")) {
      _req.log.warn(
        { table: "agency_settings" },
        "Agency settings table is missing. Returning defaults until the schema is pushed.",
      );
      return res.json(GetAgencySettingsResponse.parse(DEFAULT_SETTINGS));
    }
    throw err;
  }
});

router.put("/agency-settings", requireAuthenticatedUser, async (req, res) => {
  const parsed = UpdateAgencySettingsBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  await ensureAgencySettingsRow();
  const [updated] = await db
    .update(agencySettingsTable)
    .set({
      brandName: normalizeBrandName(parsed.data.brandName),
      tagline: parsed.data.tagline,
      logoUrl: parsed.data.logoUrl ?? null,
      primaryColor: parsed.data.primaryColor,
      supportEmail: parsed.data.supportEmail ?? null,
      websiteUrl: parsed.data.websiteUrl ?? null,
      updatedAt: new Date(),
    })
    .where(eq(agencySettingsTable.id, SINGLETON_ID))
    .returning();
  return res.json(GetAgencySettingsResponse.parse(toResponse(updated)));
});

export default router;
