import { useState } from "react";
import { Layout } from "@/components/layout";
import { TimerPanel } from "@/components/timer-panel";
import { SessionSummary } from "@/components/session-summary";
import { useSession } from "@/hooks/use-session";
import { useActivityTracker } from "@/hooks/use-activity-tracker";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const { selectedSession, selectSession } = useSession();
  
  return (
    <Layout title="Time Tracker">
      <TimerPanel />
      
      {/* Session Summary Modal */}
      {selectedSession && (
        <SessionSummary 
          session={selectedSession} 
          onClose={() => selectSession(null)} 
        />
      )}
      
      {/* Welcome Message */}
      <Card className="border-2 border-primary/20 bg-primary/5 shadow-lg rounded-xl mt-8">
        <CardContent className="p-8 flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Welcome to Time Tracker!</h2>
          <p className="text-muted-foreground max-w-md">
            Track your productive time and boost your efficiency. Just click "Start Work" when you begin and "End Work" when you're done.
          </p>
        </CardContent>
      </Card>
      
      {/* Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="border-2 border-primary/20 bg-green-400/10 shadow-md rounded-xl hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 flex items-start">
            <div className="mr-4 h-10 w-10 rounded-full bg-green-400/20 flex items-center justify-center text-green-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold mb-2">Focus on One Task</h3>
              <p className="text-sm text-muted-foreground">
                For maximum productivity, focus on a single task during each work session.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-primary/20 bg-amber-500/10 shadow-md rounded-xl hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 flex items-start">
            <div className="mr-4 h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold mb-2">Take Regular Breaks</h3>
              <p className="text-sm text-muted-foreground">
                Remember to take short breaks to stay refreshed and maintain high productivity.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
