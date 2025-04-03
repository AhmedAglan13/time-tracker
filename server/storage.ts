import { 
  users, 
  sessions, 
  activityLogs, 
  type User, 
  type InsertUser, 
  type Session, 
  type InsertSession,
  type ActivityLog,
  type InsertActivityLog
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc } from "drizzle-orm";
import expressSession from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(expressSession);

// Interface remains the same
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session methods
  getSession(id: number): Promise<Session | undefined>;
  getSessionsByUserId(userId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, session: Partial<Session>): Promise<Session>;
  
  // Activity log methods
  getActivityLog(id: number): Promise<ActivityLog | undefined>;
  getActivityLogsBySessionId(sessionId: number): Promise<ActivityLog[]>;
  createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog>;
  
  // Session store for authentication
  sessionStore: any;
}

// Implementation using PostgreSQL
export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Session methods
  async getSession(id: number): Promise<Session | undefined> {
    const result = await db.select().from(sessions).where(eq(sessions.id, id));
    return result[0];
  }
  
  async getSessionsByUserId(userId: number): Promise<Session[]> {
    return await db
      .select()
      .from(sessions)
      .where(eq(sessions.userId, userId))
      .orderBy(desc(sessions.startTime));
  }
  
  async createSession(insertSession: InsertSession): Promise<Session> {
    const result = await db.insert(sessions).values(insertSession).returning();
    return result[0];
  }
  
  async updateSession(id: number, sessionUpdate: Partial<Session>): Promise<Session> {
    const result = await db
      .update(sessions)
      .set(sessionUpdate)
      .where(eq(sessions.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Session with id ${id} not found`);
    }
    
    return result[0];
  }
  
  // Activity log methods
  async getActivityLog(id: number): Promise<ActivityLog | undefined> {
    const result = await db.select().from(activityLogs).where(eq(activityLogs.id, id));
    return result[0];
  }
  
  async getActivityLogsBySessionId(sessionId: number): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.sessionId, sessionId))
      .orderBy(activityLogs.timestamp);
  }
  
  async createActivityLog(insertActivityLog: InsertActivityLog): Promise<ActivityLog> {
    const result = await db.insert(activityLogs).values(insertActivityLog).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
