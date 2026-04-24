import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const optimizationsTable = pgTable("optimizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  filename: text("filename"),
  title: text("title"),
  sourceUrl: text("source_url"),
  scoreTechnical: integer("score_technical").notNull(),
  scoreContent: integer("score_content").notNull(),
  scoreAeo: integer("score_aeo").notNull(),
  scoreOverall: integer("score_overall").notNull(),
  changesCount: integer("changes_count").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Optimization = typeof optimizationsTable.$inferSelect;
export type InsertOptimization = typeof optimizationsTable.$inferInsert;
