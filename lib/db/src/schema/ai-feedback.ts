import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const aiFeedbackTable = pgTable("ai_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  optimizationId: integer("optimization_id"),
  taskName: text("task_name").notNull(),
  pageType: text("page_type"),
  verdict: text("verdict").notNull().default("pending"),
  evaluationScore: integer("evaluation_score"),
  evaluationSummary: text("evaluation_summary"),
  outputFingerprint: text("output_fingerprint"),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AiFeedback = typeof aiFeedbackTable.$inferSelect;
export type InsertAiFeedback = typeof aiFeedbackTable.$inferInsert;
