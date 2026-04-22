import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const agencySettingsTable = pgTable("agency_settings", {
  id: serial("id").primaryKey(),
  brandName: text("brand_name").notNull().default("SEOForge"),
  tagline: text("tagline").notNull().default("AI-Powered SEO and Answer Engine Optimization"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#2563eb"),
  supportEmail: text("support_email"),
  websiteUrl: text("website_url"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AgencySettings = typeof agencySettingsTable.$inferSelect;

export const sitemapUrlsTable = pgTable("sitemap_urls", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  priority: integer("priority").notNull().default(80),
  changefreq: text("changefreq").notNull().default("weekly"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type SitemapUrl = typeof sitemapUrlsTable.$inferSelect;
