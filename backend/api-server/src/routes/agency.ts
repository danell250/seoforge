import { Router, type IRouter } from "express";
import { db, agencySettingsTable } from "@workspace/db";
import { UpdateAgencySettingsBody, GetAgencySettingsResponse } from "@workspace/api-zod";
import { eq } from "drizzle-orm";
import { requireAuthenticatedUser } from "../middleware/auth";

const router: IRouter = Router();

const SINGLETON_ID = 1;

async function ensureRow() {
  const rows = await db.select().from(agencySettingsTable).where(eq(agencySettingsTable.id, SINGLETON_ID));
  if (rows.length > 0) return rows[0];
  const [created] = await db.insert(agencySettingsTable).values({ id: SINGLETON_ID }).returning();
  return created;
}

function toResponse(row: typeof agencySettingsTable.$inferSelect) {
  return {
    brandName: row.brandName,
    tagline: row.tagline,
    logoUrl: row.logoUrl,
    primaryColor: row.primaryColor,
    supportEmail: row.supportEmail,
    websiteUrl: row.websiteUrl,
  };
}

router.get("/agency-settings", async (_req, res) => {
  const row = await ensureRow();
  return res.json(GetAgencySettingsResponse.parse(toResponse(row)));
});

router.put("/agency-settings", requireAuthenticatedUser, async (req, res) => {
  const parsed = UpdateAgencySettingsBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid request body" });
  }
  await ensureRow();
  const [updated] = await db
    .update(agencySettingsTable)
    .set({
      brandName: parsed.data.brandName,
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
