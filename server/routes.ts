import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertSessionSchema, insertActivityLogSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
