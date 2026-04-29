import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const aiTrainingExamplesTable = pgTable("ai_training_examples", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  optimizationId: integer("optimization_id"),
  taskName: text("task_name").notNull(),
  pageType: text("page_type"),
  title: text("title"),
  inputHtml: text("input_html").notNull(),
  outputHtml: text("output_html").notNull(),
  outputFingerprint: text("output_fingerprint"),
  evaluationScore: integer("evaluation_score"),
  evaluationSummary: text("evaluation_summary"),
  feedbackVerdict: text("feedback_verdict").notNull().default("pending"),
  feedbackNote: text("feedback_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AiTrainingExample = typeof aiTrainingExamplesTable.$inferSelect;
export type InsertAiTrainingExample = typeof aiTrainingExamplesTable.$inferInsert;
