import { createContext, ReactNode, useContext, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "./use-auth";
import { Session } from "@shared/schema";
import { useToast } from "./use-toast";
import { useActivityTracker } from "./use-activity-tracker";

interface SessionContextType {
  currentSession: Session | null;
  isActive: boolean;
  activeSeconds: number;
  startSession: () => void;
  endSession: () => void;
  isLoading: boolean;
  recentSessions: Session[];
  selectedSession: Session | null;
  selectSession: (session: Session) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    startTracking, 
    stopTracking, 
    activeSeconds, 
    isActive, 
    logActivity 
  } = useActivityTracker();

  // Fetch recent sessions
  const { data: recentSessions = [] } = useQuery<Session[]>({
    queryKey: ["/api/sessions"],
    enabled: !!user,
  });

  // Start session mutation
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/sessions/start");
      return await res.json();
    },
    onSuccess: (session: Session) => {
      setCurrentSession(session);
      startTracking();
      logActivity(`Session started with ID: ${session.id}`);
      
      toast({
        title: "Session Started",
        description: `Your work session has begun. Keyboard activity is now being tracked.`,
      });
      
      // Invalidate sessions cache to update the list
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to start session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // End session mutation
  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!currentSession) return null;
      
      const res = await apiRequest(
        "POST", 
        `/api/sessions/${currentSession.id}/end`, 
        { activeDuration: activeSeconds }
      );
      return await res.json();
    },
    onSuccess: (session: Session | null) => {
      if (session) {
        stopTracking();
        logActivity(`Session ended. Active time: ${formatDuration(session.activeDuration || 0)}`);
        setSelectedSession(session);
        setCurrentSession(null);
        
        toast({
          title: "Session Ended",
          description: `Your work session has been completed and saved.`,
        });
        
        // Invalidate sessions cache to update the list
        queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to end session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Activity log mutation
  const activityLogMutation = useMutation({
    mutationFn: async ({ message, type }: { message: string; type: string }) => {
      if (!currentSession) return null;
      
      const res = await apiRequest(
        "POST", 
        `/api/sessions/${currentSession.id}/activity`, 
        { message, type }
      );
      return await res.json();
    }
  });

  // Format duration in seconds to HH:MM:SS
  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${padZero(hours)}:${padZero(minutes)}:${padZero(secs)}`;
  }

  // Pad number with leading zero if needed
  function padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  return (
    <SessionContext.Provider
      value={{
        currentSession,
        isActive,
        activeSeconds,
        startSession: () => startSessionMutation.mutate(),
        endSession: () => endSessionMutation.mutate(),
        isLoading: startSessionMutation.isPending || endSessionMutation.isPending,
        recentSessions,
        selectedSession,
        selectSession: setSelectedSession
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
