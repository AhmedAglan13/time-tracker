import { useState } from "react";
import { Layout } from "@/components/layout";
import { TimerPanel } from "@/components/timer-panel";
import { RecentSessions } from "@/components/recent-sessions";
import { ActivityLog } from "@/components/activity-log";
import { SessionSummary } from "@/components/session-summary";
import { useSession } from "@/hooks/use-session";
import { useActivityTracker } from "@/hooks/use-activity-tracker";
import { Session } from "@shared/schema";

export default function DashboardPage() {
  const { recentSessions, selectedSession, selectSession } = useSession();
  const { activityLogs, formatTime } = useActivityTracker();
  
  return (
    <Layout title="Time Tracker">
      <TimerPanel />
      
      {/* Session Summary Modal */}
      <SessionSummary 
        session={selectedSession} 
        onClose={() => selectSession(null)} 
      />
      
      <RecentSessions 
        sessions={recentSessions.slice(0, 5)} 
        onViewSession={selectSession}
      />
      
      <ActivityLog 
        logs={activityLogs}
        formatTime={formatTime}
      />
    </Layout>
  );
}
