import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles for type safety
export const UserRoles = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user'
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").default(UserRoles.USER),
  // Fields below are not in the existing database table yet
  // Used only for type definitions until we can safely migrate
  // email: text("email"),
  // department: text("department"),
  // isActive: boolean("is_active").default(true),
  // lastLogin: timestamp("last_login"),
  // createdAt: timestamp("created_at").defaultNow()
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

// New table for time blocks
export const timeBlocks = pgTable("time_blocks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id"),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  completed: boolean("completed").default(false),
  color: text("color").default("#4f46e5"), // Default color (indigo-600)
});

// New table for daily goals
export const dailyGoals = pgTable("daily_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id"),
  title: text("title").notNull(),
  description: text("description"),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  priority: integer("priority").default(0), // 0: low, 1: medium, 2: high
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true
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

export const insertTimeBlockSchema = createInsertSchema(timeBlocks).pick({
  userId: true,
  sessionId: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  completed: true,
  color: true,
});

export const insertDailyGoalSchema = createInsertSchema(dailyGoals).pick({
  userId: true,
  sessionId: true,
  title: true,
  description: true,
  completed: true,
  priority: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
export type TimeBlock = typeof timeBlocks.$inferSelect;
export type InsertTimeBlock = z.infer<typeof insertTimeBlockSchema>;
export type DailyGoal = typeof dailyGoals.$inferSelect;
export type InsertDailyGoal = z.infer<typeof insertDailyGoalSchema>;
