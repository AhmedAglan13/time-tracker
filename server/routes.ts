import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertSessionSchema, 
  insertActivityLogSchema, 
  insertTimeBlockSchema, 
  insertDailyGoalSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Get all sessions for a user
  app.get("/api/sessions", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user!.id;
    const sessions = await storage.getSessionsByUserId(userId);
    res.json(sessions);
  });

  // Get a specific session
  app.get("/api/sessions/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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
  app.post("/api/sessions/start", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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
  app.post("/api/sessions/:id/end", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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
  app.post("/api/sessions/:id/activity", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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
  app.get("/api/sessions/:id/activity", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

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

  // ===========================================
  // TIME BLOCKS API
  // ===========================================

  // Get all time blocks for a user
  app.get("/api/time-blocks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user!.id;
    const timeBlocks = await storage.getTimeBlocksByUserId(userId);
    res.json(timeBlocks);
  });

  // Get time blocks for a specific session
  app.get("/api/sessions/:id/time-blocks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await storage.getSession(sessionId);
    if (!session || session.userId !== req.user!.id) {
      return res.status(404).json({ message: "Session not found" });
    }

    const timeBlocks = await storage.getTimeBlocksBySessionId(sessionId);
    res.json(timeBlocks);
  });

  // Create a new time block
  app.post("/api/time-blocks", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user!.id;
    
    try {
      const timeBlockData = insertTimeBlockSchema.parse({
        ...req.body,
        userId,
      });
      
      const timeBlock = await storage.createTimeBlock(timeBlockData);
      res.status(201).json(timeBlock);
    } catch (error) {
      res.status(400).json({ message: "Invalid time block data" });
    }
  });

  // Update a time block
  app.patch("/api/time-blocks/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const timeBlockId = parseInt(req.params.id);
    if (isNaN(timeBlockId)) {
      return res.status(400).json({ message: "Invalid time block ID" });
    }

    try {
      const timeBlock = await storage.getTimeBlock(timeBlockId);
      if (!timeBlock || timeBlock.userId !== req.user!.id) {
        return res.status(404).json({ message: "Time block not found" });
      }

      const validUpdateFields = [
        'title', 'description', 'startTime', 'endTime', 
        'completed', 'color', 'sessionId'
      ];
      
      const updates = Object.keys(req.body)
        .filter(key => validUpdateFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
      
      const updatedTimeBlock = await storage.updateTimeBlock(timeBlockId, updates);
      res.json(updatedTimeBlock);
    } catch (error) {
      res.status(400).json({ message: "Invalid time block data" });
    }
  });

  // Delete a time block
  app.delete("/api/time-blocks/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const timeBlockId = parseInt(req.params.id);
    if (isNaN(timeBlockId)) {
      return res.status(400).json({ message: "Invalid time block ID" });
    }

    try {
      const timeBlock = await storage.getTimeBlock(timeBlockId);
      if (!timeBlock || timeBlock.userId !== req.user!.id) {
        return res.status(404).json({ message: "Time block not found" });
      }

      await storage.deleteTimeBlock(timeBlockId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete time block" });
    }
  });

  // ===========================================
  // DAILY GOALS API
  // ===========================================

  // Get all daily goals for a user
  app.get("/api/daily-goals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user!.id;
    const dailyGoals = await storage.getDailyGoalsByUserId(userId);
    res.json(dailyGoals);
  });

  // Get daily goals for a specific session
  app.get("/api/sessions/:id/daily-goals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessionId = parseInt(req.params.id);
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await storage.getSession(sessionId);
    if (!session || session.userId !== req.user!.id) {
      return res.status(404).json({ message: "Session not found" });
    }

    const dailyGoals = await storage.getDailyGoalsBySessionId(sessionId);
    res.json(dailyGoals);
  });

  // Create a new daily goal
  app.post("/api/daily-goals", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user!.id;
    
    try {
      const dailyGoalData = insertDailyGoalSchema.parse({
        ...req.body,
        userId,
      });
      
      const dailyGoal = await storage.createDailyGoal(dailyGoalData);
      res.status(201).json(dailyGoal);
    } catch (error) {
      res.status(400).json({ message: "Invalid daily goal data" });
    }
  });

  // Update a daily goal
  app.patch("/api/daily-goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dailyGoalId = parseInt(req.params.id);
    if (isNaN(dailyGoalId)) {
      return res.status(400).json({ message: "Invalid daily goal ID" });
    }

    try {
      const dailyGoal = await storage.getDailyGoal(dailyGoalId);
      if (!dailyGoal || dailyGoal.userId !== req.user!.id) {
        return res.status(404).json({ message: "Daily goal not found" });
      }

      const validUpdateFields = [
        'title', 'description', 'completed', 'priority', 'sessionId'
      ];
      
      const updates = Object.keys(req.body)
        .filter(key => validUpdateFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = req.body[key];
          return obj;
        }, {});
      
      const updatedDailyGoal = await storage.updateDailyGoal(dailyGoalId, updates);
      res.json(updatedDailyGoal);
    } catch (error) {
      res.status(400).json({ message: "Invalid daily goal data" });
    }
  });

  // Delete a daily goal
  app.delete("/api/daily-goals/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const dailyGoalId = parseInt(req.params.id);
    if (isNaN(dailyGoalId)) {
      return res.status(400).json({ message: "Invalid daily goal ID" });
    }

    try {
      const dailyGoal = await storage.getDailyGoal(dailyGoalId);
      if (!dailyGoal || dailyGoal.userId !== req.user!.id) {
        return res.status(404).json({ message: "Daily goal not found" });
      }

      await storage.deleteDailyGoal(dailyGoalId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete daily goal" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
