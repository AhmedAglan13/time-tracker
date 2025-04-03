import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role"),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  totalDuration: integer("total_duration"), // in seconds
  activeDuration: integer("active_duration"), // in seconds
  idleDuration: integer("idle_duration"), // in seconds
});

export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  timestamp: timestamp("timestamp").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // "info", "warning", "error", etc.
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  role: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  startTime: true,
  endTime: true,
  totalDuration: true,
  activeDuration: true,
  idleDuration: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).pick({
  sessionId: true,
  timestamp: true,
  message: true,
  type: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
