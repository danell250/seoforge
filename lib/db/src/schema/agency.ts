import { pgTable, serial, text, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";

export const agencySettingsTable = pgTable(
  "agency_settings",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    brandName: text("brand_name").notNull().default("SEOaxe"),
    tagline: text("tagline").notNull().default("AI-Powered SEO and Answer Engine Optimization"),
    logoUrl: text("logo_url"),
    primaryColor: text("primary_color").notNull().default("#2563eb"),
    supportEmail: text("support_email"),
    websiteUrl: text("website_url"),
    brandVoice: text("brand_voice"),
    preferredMarkets: text("preferred_markets"),
    primaryCms: text("primary_cms"),
    optimizationStyle: text("optimization_style"),
    customSubdomain: text("custom_subdomain"),
    customEmailDomain: text("custom_email_domain"),
    enableClientPortal: boolean("enable_client_portal").default(false),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userIdIdx: index("agency_settings_user_id_idx").on(t.userId),
  }),
);

export type AgencySettings = typeof agencySettingsTable.$inferSelect;

export const sitemapUrlsTable = pgTable("sitemap_urls", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  priority: integer("priority").notNull().default(80),
  changefreq: text("changefreq").notNull().default("weekly"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SitemapUrl = typeof sitemapUrlsTable.$inferSelect;

export const auditEventsTable = pgTable("audit_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AuditEvent = typeof auditEventsTable.$inferSelect;
