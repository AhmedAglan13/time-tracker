import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertSessionSchema, 
  insertActivityLogSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";
import { 
  isAuthenticated, 
  hasRole, 
  isAdmin, 
  isAdminOrManager, 
  isSelfOrAdmin 
} from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Get all sessions for a user
  app.get("/api/sessions", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const sessions = await storage.getSessionsByUserId(userId);
    res.json(sessions);
  });

  // Get a specific session
  app.get("/api/sessions/:id", isAuthenticated, async (req, res) => {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await storage.getSession(sessionId);
    if (!session || session.userId !== req.user!.id) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  });

  // Start a new session
  app.post("/api/sessions/start", isAuthenticated, async (req, res) => {
    const userId = req.user!.id;
    const startTime = new Date();
    
    try {
      const sessionData = insertSessionSchema.parse({
        userId,
        startTime,
        endTime: null,
        totalDuration: 0,
        activeDuration: 0,
        idleDuration: 0
      });
      
      const session = await storage.createSession(sessionData);

      // Create initial activity log
      await storage.createActivityLog({
        sessionId: session.id,
        timestamp: new Date(),
        message: "Session started",
        type: "info"
      });
      
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  // End a session
  app.post("/api/sessions/:id/end", isAuthenticated, async (req, res) => {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const { activeDuration } = req.body;
    
    try {
      const session = await storage.getSession(sessionId);
      if (!session || session.userId !== req.user!.id) {
        return res.status(404).json({ message: "Session not found" });
      }

      const endTime = new Date();
      const totalDuration = Math.floor((endTime.getTime() - new Date(session.startTime).getTime()) / 1000);
      const parsedActiveDuration = parseInt(activeDuration);
      const idleDuration = totalDuration - parsedActiveDuration;
      
      const updatedSession = await storage.updateSession(sessionId, {
        endTime,
        totalDuration,
        activeDuration: parsedActiveDuration,
        idleDuration
      });

      // Create end session activity log
      await storage.createActivityLog({
        sessionId,
        timestamp: new Date(),
        message: "Session ended",
        type: "info"
      });
      
      res.json(updatedSession);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  // Log activity for a session
  app.post("/api/sessions/:id/activity", isAuthenticated, async (req, res) => {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    try {
      const { message, type } = req.body;
      const activityLogSchema = z.object({
        message: z.string(),
        type: z.string()
      });
      
      const validatedData = activityLogSchema.parse({ message, type });
      
      const session = await storage.getSession(sessionId);
      if (!session || session.userId !== req.user!.id) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const activityLog = await storage.createActivityLog({
        sessionId,
        timestamp: new Date(),
        message: validatedData.message,
        type: validatedData.type
      });
      
      res.status(201).json(activityLog);
    } catch (error) {
      res.status(400).json({ message: "Invalid activity log data" });
    }
  });

  // Get all activity logs for a session
  app.get("/api/sessions/:id/activity", isAuthenticated, async (req, res) => {
    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await storage.getSession(sessionId);
    if (!session || session.userId !== req.user!.id) {
      return res.status(404).json({ message: "Session not found" });
    }

    const activityLogs = await storage.getActivityLogsBySessionId(sessionId);
    res.json(activityLogs);
  });

  // ADMIN ROUTES
  
  // Get all users (admin only)
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get user by ID (admin or self)
  app.get("/api/users/:userId", isSelfOrAdmin("userId"), async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update user (admin or self)
  app.patch("/api/users/:userId", isSelfOrAdmin("userId"), async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
      const currentUser = await storage.getUser(userId);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Regular users can't change their own role
      if (req.user!.id === userId && req.user!.role !== 'admin' && req.body.role) {
        delete req.body.role;
      }

      // Don't allow password updates through this endpoint
      if (req.body.password) {
        delete req.body.password;
      }

      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new user (admin only)
  app.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  // Get analytics data (admins and managers)
  app.get("/api/admin/analytics", isAdminOrManager, async (req, res) => {
    try {
      // Implement analytics aggregation logic here
      const userCount = await storage.getUserCount();
      const sessionCount = await storage.getSessionCount();
      const activeUsers = await storage.getActiveUsersCount();
      
      // Calculate total active time across all sessions
      const totalActiveTime = await storage.getTotalActiveDuration();
      
      res.json({
        userCount,
        sessionCount,
        activeUsers,
        totalActiveTime
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get sessions for any user (admin only)
  app.get("/api/admin/users/:userId/sessions", isAdmin, async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const sessions = await storage.getSessionsByUserId(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
