import { pgTable, text, serial, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { classroomsTable } from "./classrooms";

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull().references(() => classroomsTable.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  isAnswered: boolean("is_answered").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ id: true, createdAt: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;
