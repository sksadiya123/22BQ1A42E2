import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const urls = pgTable("urls", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  shortCode: varchar("short_code", { length: 10 }).notNull().unique(),
  longUrl: text("long_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").default(true).notNull(),
  clickCount: integer("click_count").default(0).notNull(),
});

export const clickLogs = pgTable("click_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  urlId: varchar("url_id").notNull().references(() => urls.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sourceIp: text("source_ip"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  location: text("location"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUrlSchema = createInsertSchema(urls).pick({
  shortCode: true,
  longUrl: true,
  expiresAt: true,
}).extend({
  shortCode: z.string().optional(),
  longUrl: z.string().url("Please enter a valid URL"),
  validityMinutes: z.number().min(1).max(43200).optional(),
});

export const insertClickLogSchema = createInsertSchema(clickLogs).pick({
  urlId: true,
  sourceIp: true,
  userAgent: true,
  referrer: true,
  location: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUrl = z.infer<typeof insertUrlSchema>;
export type Url = typeof urls.$inferSelect;
export type InsertClickLog = z.infer<typeof insertClickLogSchema>;
export type ClickLog = typeof clickLogs.$inferSelect;

export type UrlWithClickLogs = Url & {
  clickLogs: ClickLog[];
};
