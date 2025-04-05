import { 
  users, 
  sessions, 
  activityLogs,
  timeBlocks,
  dailyGoals,
  type User, 
  type InsertUser, 
  type Session, 
  type InsertSession,
  type ActivityLog,
  type InsertActivityLog,
  type TimeBlock,
  type InsertTimeBlock,
  type DailyGoal,
  type InsertDailyGoal
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, desc, sql, count, sum, and, isNotNull } from "drizzle-orm";
import expressSession from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(expressSession);

// Updated interface with admin methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getUserCount(): Promise<number>;
  getActiveUsersCount(): Promise<number>;
  
  // Session methods
  getSession(id: number): Promise<Session | undefined>;
  getSessionsByUserId(userId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, session: Partial<Session>): Promise<Session>;
  getSessionCount(): Promise<number>;
  getTotalActiveDuration(): Promise<number>;
  
  // Activity log methods
  getActivityLog(id: number): Promise<ActivityLog | undefined>;
  getActivityLogsBySessionId(sessionId: number): Promise<ActivityLog[]>;
  createActivityLog(activityLog: InsertActivityLog): Promise<ActivityLog>;
  
  // Time Block methods
  getTimeBlock(id: number): Promise<TimeBlock | undefined>;
  getTimeBlocksByUserId(userId: number): Promise<TimeBlock[]>;
  getTimeBlocksBySessionId(sessionId: number): Promise<TimeBlock[]>;
  createTimeBlock(timeBlock: InsertTimeBlock): Promise<TimeBlock>;
  updateTimeBlock(id: number, timeBlock: Partial<TimeBlock>): Promise<TimeBlock>;
  deleteTimeBlock(id: number): Promise<void>;
  
  // Daily Goal methods
  getDailyGoal(id: number): Promise<DailyGoal | undefined>;
  getDailyGoalsByUserId(userId: number): Promise<DailyGoal[]>;
  getDailyGoalsBySessionId(sessionId: number): Promise<DailyGoal[]>;
  createDailyGoal(dailyGoal: InsertDailyGoal): Promise<DailyGoal>;
  updateDailyGoal(id: number, dailyGoal: Partial<DailyGoal>): Promise<DailyGoal>;
  deleteDailyGoal(id: number): Promise<void>;
  
  // Session store for authentication
  sessionStore: any;
}

// Implementation using PostgreSQL
export class DatabaseStorage implements IStorage {
  sessionStore: any;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool,
      tableName: 'session', // Explicitly name the table
      createTableIfMissing: true,
      pruneSessionInterval: 60 // Clean expired sessions every minute
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    console.log(`Getting user by id: ${id}`);
    try {
      const result = await db.select({
        id: users.id,
        username: users.username,
        password: users.password,
        name: users.name,
        role: users.role
      }).from(users).where(eq(users.id, id));
      
      if (result.length > 0) {
        console.log(`Found user with id ${id}: ${result[0].username}`);
      } else {
        console.log(`No user found with id: ${id}`);
      }
      return result[0];
    } catch (error) {
      console.error(`Error getting user by id ${id}:`, error);
      throw error;
    }
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    console.log(`Getting user by username: ${username}`);
    try {
      const result = await db.select({
        id: users.id,
        username: users.username,
        password: users.password,
        name: users.name,
        role: users.role
      }).from(users).where(eq(users.username, username));
      
      if (result.length > 0) {
        console.log(`Found user with username ${username}`);
      } else {
        console.log(`No user found with username: ${username}`);
      }
      return result[0];
    } catch (error) {
      console.error(`Error getting user by username ${username}:`, error);
      throw error;
    }
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    console.log(`Creating new user: ${insertUser.username}`);
    try {
      const result = await db.insert(users).values(insertUser).returning();
      console.log(`User created: ${result[0].username} with id: ${result[0].id}`);
      return result[0];
    } catch (error) {
      console.error(`Error creating user ${insertUser.username}:`, error);
      throw error;
    }
  }
  
  async updateUser(id: number, userUpdate: Partial<User>): Promise<User> {
    console.log(`Updating user with id: ${id}`);
    try {
      const result = await db
        .update(users)
        .set(userUpdate)
        .where(eq(users.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error(`User with id ${id} not found`);
      }
      
      console.log(`User updated: ${result[0].username}`);
      return result[0];
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      throw error;
    }
  }
  
  async getAllUsers(): Promise<User[]> {
    console.log('Getting all users');
    try {
      const result = await db
        .select({
          id: users.id,
          username: users.username,
          password: users.password,
          name: users.name,
          role: users.role
        })
        .from(users)
        .orderBy(users.username);
      
      console.log(`Found ${result.length} users`);
      return result;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }
  
  async getUserCount(): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(users);
      
      return result[0].count || 0;
    } catch (error) {
      console.error('Error getting user count:', error);
      throw error;
    }
  }
  
  async getActiveUsersCount(): Promise<number> {
    try {
      // Since we don't have lastLogin column yet, just return all users
      // Later when we have the lastLogin column we can filter by recent logins
      const result = await db
        .select({ count: count() })
        .from(users);
      
      return result[0].count || 0;
    } catch (error) {
      console.error('Error getting active users count:', error);
      throw error;
    }
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
  
  async getSessionCount(): Promise<number> {
    try {
      const result = await db
        .select({ count: count() })
        .from(sessions);
      
      return result[0].count || 0;
    } catch (error) {
      console.error('Error getting session count:', error);
      throw error;
    }
  }
  
  async getTotalActiveDuration(): Promise<number> {
    try {
      // Sum up all active durations from completed sessions
      const result = await db
        .select({
          total: sum(sessions.activeDuration)
        })
        .from(sessions)
        .where(isNotNull(sessions.endTime));
      
      // Safely handle null value from sum() and convert to number
      const totalDuration = result[0].total;
      return totalDuration === null ? 0 : Number(totalDuration);
    } catch (error) {
      console.error('Error getting total active duration:', error);
      throw error;
    }
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
  
  // Time Block methods
  async getTimeBlock(id: number): Promise<TimeBlock | undefined> {
    const result = await db.select().from(timeBlocks).where(eq(timeBlocks.id, id));
    return result[0];
  }
  
  async getTimeBlocksByUserId(userId: number): Promise<TimeBlock[]> {
    return await db
      .select()
      .from(timeBlocks)
      .where(eq(timeBlocks.userId, userId))
      .orderBy(timeBlocks.startTime);
  }
  
  async getTimeBlocksBySessionId(sessionId: number): Promise<TimeBlock[]> {
    return await db
      .select()
      .from(timeBlocks)
      .where(eq(timeBlocks.sessionId, sessionId))
      .orderBy(timeBlocks.startTime);
  }
  
  async createTimeBlock(insertTimeBlock: InsertTimeBlock): Promise<TimeBlock> {
    const result = await db.insert(timeBlocks).values(insertTimeBlock).returning();
    return result[0];
  }
  
  async updateTimeBlock(id: number, timeBlockUpdate: Partial<TimeBlock>): Promise<TimeBlock> {
    const result = await db
      .update(timeBlocks)
      .set(timeBlockUpdate)
      .where(eq(timeBlocks.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Time block with id ${id} not found`);
    }
    
    return result[0];
  }
  
  async deleteTimeBlock(id: number): Promise<void> {
    await db.delete(timeBlocks).where(eq(timeBlocks.id, id));
  }
  
  // Daily Goal methods
  async getDailyGoal(id: number): Promise<DailyGoal | undefined> {
    const result = await db.select().from(dailyGoals).where(eq(dailyGoals.id, id));
    return result[0];
  }
  
  async getDailyGoalsByUserId(userId: number): Promise<DailyGoal[]> {
    return await db
      .select()
      .from(dailyGoals)
      .where(eq(dailyGoals.userId, userId))
      .orderBy(desc(dailyGoals.createdAt));
  }
  
  async getDailyGoalsBySessionId(sessionId: number): Promise<DailyGoal[]> {
    return await db
      .select()
      .from(dailyGoals)
      .where(eq(dailyGoals.sessionId, sessionId))
      .orderBy(desc(dailyGoals.createdAt));
  }
  
  async createDailyGoal(insertDailyGoal: InsertDailyGoal): Promise<DailyGoal> {
    const result = await db.insert(dailyGoals).values(insertDailyGoal).returning();
    return result[0];
  }
  
  async updateDailyGoal(id: number, dailyGoalUpdate: Partial<DailyGoal>): Promise<DailyGoal> {
    const result = await db
      .update(dailyGoals)
      .set(dailyGoalUpdate)
      .where(eq(dailyGoals.id, id))
      .returning();
    
    if (result.length === 0) {
      throw new Error(`Daily goal with id ${id} not found`);
    }
    
    return result[0];
  }
  
  async deleteDailyGoal(id: number): Promise<void> {
    await db.delete(dailyGoals).where(eq(dailyGoals.id, id));
  }
}

export const storage = new DatabaseStorage();
