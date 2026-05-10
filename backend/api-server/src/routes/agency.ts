import { Router, type IRouter } from "express";
import { db, agencySettingsTable } from "@workspace/db";
import {
  DEFAULT_AGENCY_SETTINGS,
  GetAgencySettingsResponse,
  normalizeBrandName,
  UpdateAgencySettingsBody,
} from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser, requireAuthenticatedUser } from "../middleware/auth";
import { isMissingRelationError } from "../lib/db-errors";
import { ensureAgencySettingsRow, getAgencySettingsRow } from "../lib/agency-settings";

const router: IRouter = Router();

const DEFAULT_SETTINGS = DEFAULT_AGENCY_SETTINGS;

function toResponse(row: typeof agencySettingsTable.$inferSelect) {
  return {
    brandName: normalizeBrandName(row.brandName),
    tagline: row.tagline,
    logoUrl: row.logoUrl,
    primaryColor: row.primaryColor,
    supportEmail: row.supportEmail,
    websiteUrl: row.websiteUrl,
    brandVoice: row.brandVoice,
    preferredMarkets: row.preferredMarkets,
    primaryCms: row.primaryCms,
    optimizationStyle: row.optimizationStyle,
    customSubdomain: row.customSubdomain,
    customEmailDomain: row.customEmailDomain,
    enableClientPortal: row.enableClientPortal,
  };
}

router.get("/agency-settings", requireAuthenticatedUser, async (req, res) => {
  try {
    const user = getAuthenticatedUser(req);
    const row = await getAgencySettingsRow(user!.id);
    if (!row) {
      return res.json(GetAgencySettingsResponse.parse(DEFAULT_SETTINGS));
    }
    return res.json(GetAgencySettingsResponse.parse(toResponse(row)));
  } catch (err) {
    if (isMissingRelationError(err, "agency_settings")) {
      req.log.warn(
        { table: "agency_settings" },
        "Agency settings table is missing. Returning defaults until the schema is pushed.",
      );
      return res.json(GetAgencySettingsResponse.parse(DEFAULT_SETTINGS));
    }
    throw err;
  }
});

router.put("/agency-settings", requireAuthenticatedUser, async (req, res) => {
  const user = getAuthenticatedUser(req);
  const parsed = UpdateAgencySettingsBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  await ensureAgencySettingsRow(user!.id);
  const [updated] = await db
    .update(agencySettingsTable)
    .set({
      brandName: normalizeBrandName(parsed.data.brandName),
      tagline: parsed.data.tagline,
      logoUrl: parsed.data.logoUrl ?? null,
      primaryColor: parsed.data.primaryColor,
      supportEmail: parsed.data.supportEmail ?? null,
      websiteUrl: parsed.data.websiteUrl ?? null,
      brandVoice: parsed.data.brandVoice ?? null,
      preferredMarkets: parsed.data.preferredMarkets ?? null,
      primaryCms: parsed.data.primaryCms ?? null,
      optimizationStyle: parsed.data.optimizationStyle ?? null,
      customSubdomain: parsed.data.customSubdomain ?? null,
      customEmailDomain: parsed.data.customEmailDomain ?? null,
      enableClientPortal: parsed.data.enableClientPortal ?? false,
      updatedAt: new Date(),
    })
    .where(eq(agencySettingsTable.userId, user!.id))
    .returning();
  return res.json(GetAgencySettingsResponse.parse(toResponse(updated)));
});

export default router;
