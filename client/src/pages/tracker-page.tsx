import { Layout } from "@/components/layout";
import { TimerPanel } from "@/components/timer-panel";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Clock, Calendar, Sparkles, MoonStar, Sun, Sunrise, Sunset } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { SessionSummary } from "@/components/session-summary";
import { useTimeTheme } from "@/components/time-theme-provider";
import { cn } from "@/lib/utils";

export default function TrackerPage() {
  const { selectedSession, selectSession } = useSession();
  const { timePeriod, getPeriodIcon } = useTimeTheme();
  
  // Get appropriate time-of-day icon
  const getTimeIcon = () => {
    switch(timePeriod) {
      case 'morning': return <Sunrise className="h-8 w-8 text-amber-400" />;
      case 'afternoon': return <Sun className="h-8 w-8 text-orange-400" />;
      case 'evening': return <Sunset className="h-8 w-8 text-pink-400" />;
      case 'night': return <MoonStar className="h-8 w-8 text-indigo-400" />;
      default: return <Bell className="h-8 w-8 text-primary" />;
    }
  };
  
  // Get gradient based on time of day for tip card
  const getTipCardGradient = () => {
    switch(timePeriod) {
      case 'morning': 
        return 'bg-amber-400/5';
      case 'afternoon': 
        return 'bg-orange-400/5';
      case 'evening': 
        return 'bg-pink-400/5';
      case 'night': 
        return 'bg-indigo-900/20';
      default: 
        return 'bg-primary/5';
    }
  };
  
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
      
      {/* Daily Tips */}
      <Card className={cn(
        "border-2 border-primary/20 shadow-lg rounded-xl mt-8",
        getTipCardGradient()
      )}>
        <CardContent className="p-8 flex flex-col items-center text-center">
          <div className={cn(
            "h-16 w-16 rounded-full flex items-center justify-center mb-4",
            timePeriod === 'night' ? 'bg-indigo-500/20' : 'bg-primary/20'
          )}>
            {getTimeIcon()}
          </div>
          <h2 className="text-2xl font-bold mb-2">Daily Tips {getPeriodIcon()}</h2>
          <p className="text-muted-foreground max-w-md">
            {timePeriod === 'morning' && "Morning is perfect for deep work! Focus on complex tasks that need concentration."}
            {timePeriod === 'afternoon' && "Take regular breaks every 45-60 minutes to maintain productivity throughout your work day."}
            {timePeriod === 'evening' && "Evening is ideal for planning and organizing tasks for tomorrow's workday."}
            {timePeriod === 'night' && "Night work sessions should be shorter. Remember to get adequate rest for productivity."}
          </p>
        </CardContent>
      </Card>
      
      {/* Quick Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className={cn(
          "border-2 border-primary/20 shadow-md rounded-xl hover:shadow-lg transition-all duration-300",
          timePeriod === 'night' ? 'bg-green-400/15' : 'bg-green-400/10'
        )}>
          <CardContent className="p-6 flex items-start">
            <div className={cn(
              "mr-4 h-10 w-10 rounded-full flex items-center justify-center text-green-400",
              timePeriod === 'night' ? 'bg-green-400/30' : 'bg-green-400/20'
            )}>
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold mb-2">Time Blocking</h3>
              <p className="text-sm text-muted-foreground">
                Allocate specific time blocks for focused work on single tasks to maximize efficiency.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className={cn(
          "border-2 border-primary/20 shadow-md rounded-xl hover:shadow-lg transition-all duration-300",
          timePeriod === 'night' ? 'bg-amber-500/15' : 'bg-amber-500/10'
        )}>
          <CardContent className="p-6 flex items-start">
            <div className={cn(
              "mr-4 h-10 w-10 rounded-full flex items-center justify-center text-amber-500",
              timePeriod === 'night' ? 'bg-amber-500/30' : 'bg-amber-500/20'
            )}>
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold mb-2">Track Daily Goals</h3>
              <p className="text-sm text-muted-foreground">
                Set and track 2-3 specific goals for each work session to stay focused and motivated.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}