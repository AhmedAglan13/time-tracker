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
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private activityLogs: Map<number, ActivityLog>;
  sessionStore: session.SessionStore;
  
  userCurrentId: number;
  sessionCurrentId: number;
  activityLogCurrentId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.activityLogs = new Map();
    this.userCurrentId = 1;
    this.sessionCurrentId = 1;
    this.activityLogCurrentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Session methods
  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }
  
  async getSessionsByUserId(userId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(
      (session) => session.userId === userId,
    );
  }
  
  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.sessionCurrentId++;
    const session: Session = { ...insertSession, id };
    this.sessions.set(id, session);
    return session;
  }
  
  async updateSession(id: number, sessionUpdate: Partial<Session>): Promise<Session> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Session with id ${id} not found`);
    }
    
    const updatedSession = { ...session, ...sessionUpdate };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // Activity log methods
  async getActivityLog(id: number): Promise<ActivityLog | undefined> {
    return this.activityLogs.get(id);
  }
  
  async getActivityLogsBySessionId(sessionId: number): Promise<ActivityLog[]> {
    return Array.from(this.activityLogs.values()).filter(
      (activityLog) => activityLog.sessionId === sessionId,
    );
  }
  
  async createActivityLog(insertActivityLog: InsertActivityLog): Promise<ActivityLog> {
    const id = this.activityLogCurrentId++;
    const activityLog: ActivityLog = { ...insertActivityLog, id };
    this.activityLogs.set(id, activityLog);
    return activityLog;
  }
}

export const storage = new MemStorage();
