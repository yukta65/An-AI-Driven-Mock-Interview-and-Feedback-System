import { serial, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const MockInterview = pgTable("mockInterview", {
  id: serial("id").primaryKey(),
  jsonMockResp: text("jsonMockResp").notNull(),  // ✅ Removed { length: 255 }, text doesn't take length
  jobPosition: varchar("jobPosition", 255).notNull(), // ✅ Corrected syntax
  jobDesc: varchar("jobDesc", 700).notNull(),
  jobExperience: varchar("jobExperience", 200).notNull(),
  createdBy: varchar("createdBy", 255).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow(), // ✅ Use timestamp for date fields
  mockId: varchar("mockId", 255).notNull(),
});

export const UserAnswer = pgTable('userAnswer',{
  id: serial("id").primaryKey(),
  mockIDRef : varchar('mockId').notNull(),
  question:varchar('question').notNull(),
  correctAns:text('correctAns'),
  userAns:text('userAns'),
  feedback:text('feedback'),
  rating:varchar('rating'),
  userEmail:varchar('userEmail'),
  createdAt:varchar('createdAt')
})