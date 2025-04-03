import { useState, useEffect } from "react";
import { Clock, LogIn, LogOut, Keyboard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/use-session";
import { useActivityTracker } from "@/hooks/use-activity-tracker";
import { cn } from "@/lib/utils";

export function TimerPanel() {
  const { 
    isActive, 
    activeSeconds, 
    startSession, 
    endSession, 
    isLoading, 
    currentSession 
  } = useSession();
  
  const { 
    isIdle, 
    formatTime, 
    formatDuration, 
    resetIdleTimer 
  } = useActivityTracker();
  
  const [idleMinutes, setIdleMinutes] = useState(0);
  
  // Effect to track and display idle time
  useEffect(() => {
    let idleInterval: number | null = null;
    
    if (isActive && isIdle) {
      idleInterval = window.setInterval(() => {
        setIdleMinutes(prev => prev + 1);
      }, 60000); // Update every minute
    } else {
      setIdleMinutes(0);
    }
    
    return () => {
      if (idleInterval) window.clearInterval(idleInterval);
    };
  }, [isActive, isIdle]);
  
  // Auto-reset idle timer when component loads
  useEffect(() => {
    window.addEventListener('keydown', resetIdleTimer);
    return () => {
      window.removeEventListener('keydown', resetIdleTimer);
    };
  }, [resetIdleTimer]);
  
  // Determine status style
  const getStatusStyle = () => {
    if (!isActive) return {
      indicator: "bg-primary/60",
      text: "text-primary/60",
      label: "Ready",
      animation: "",
      badge: "bg-primary/10 text-primary/60",
      gradient: "bg-gradient-to-r from-primary/5 to-primary/20"
    };
    
    if (isIdle) return {
      indicator: "bg-amber-500",
      text: "text-amber-500",
      label: "Taking a Break",
      animation: "animate-bounce",
      badge: "bg-amber-500/30 text-amber-500 border border-amber-500/30",
      gradient: "bg-gradient-to-r from-amber-500/10 to-amber-500/30"
    };
    
    return {
      indicator: "bg-green-400",
      text: "text-green-400",
      label: "Working",
      animation: "animate-pulse",
      badge: "bg-green-400/30 text-green-400 border border-green-400/30",
      gradient: "bg-gradient-to-r from-green-400/10 to-green-400/30"
    };
  };
  
  const statusStyle = getStatusStyle();
  const activityPercentage = isIdle ? 10 : (isActive ? 75 : 0);
  
  return (
    <Card className={`${statusStyle.gradient} rounded-xl shadow-xl overflow-hidden mb-6 border-2 border-primary/30`}>
      <div className="p-5 border-b border-primary/20">
        <h3 className="font-bold text-lg flex items-center">
          <Clock className={`w-5 h-5 mr-2 ${statusStyle.text}`} />
          Current Session
        </h3>
      </div>
      
      <div className="p-5">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* Timer Display */}
          <div className="flex flex-col items-center lg:items-start bg-background/40 p-5 rounded-xl shadow-inner border border-primary/10">
            <div className="font-light text-sm mb-2 text-muted-foreground">Your Status</div>
            <div className={`flex items-center ${statusStyle.text} font-bold text-lg mb-4`}>
              <span className={`w-3 h-3 ${statusStyle.indicator} rounded-full ${statusStyle.animation} mr-2`}></span>
              <span>{statusStyle.label}</span>
            </div>
            
            <div className="font-light text-sm mb-2 text-muted-foreground">Time Tracked</div>
            <div className="text-5xl font-extrabold text-primary animate-pulse">{formatDuration(activeSeconds)}</div>
            
            <div className="flex flex-row gap-3 mt-3">
              <div className="text-xs bg-background/50 px-3 py-1 rounded-full">
                Started: {currentSession?.startTime 
                  ? formatTime(new Date(currentSession.startTime)) 
                  : "--:--:--"}
              </div>
              {isIdle && (
                <div className="text-xs bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full border border-amber-500/30">
                  Break time: {idleMinutes}m
                </div>
              )}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              className={cn(
                "px-8 py-8 min-w-[150px] rounded-xl text-md font-bold shadow-lg transition-all duration-300 hover:scale-105",
                !isActive && "bg-gradient-to-r from-green-400 to-green-500"
              )}
              onClick={startSession}
              disabled={isActive || isLoading}
            >
              <LogIn className="w-6 h-6 mr-2" />
              Start Work
            </Button>
            
            <Button
              variant="outline"
              className={cn(
                "px-8 py-8 min-w-[150px] rounded-xl text-md font-bold border-2 shadow-lg transition-all duration-300 hover:scale-105",
                isActive ? "border-primary/50 text-primary hover:bg-primary/10" : "opacity-50 cursor-not-allowed"
              )}
              onClick={endSession}
              disabled={!isActive || isLoading}
            >
              <LogOut className="w-6 h-6 mr-2" />
              End Work
            </Button>
          </div>
        </div>
        
        {/* Activity Status */}
        <div className="mt-6 p-5 bg-background/30 rounded-xl border border-primary/20 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-md font-semibold flex items-center">
              <Keyboard className="w-5 h-5 mr-2 text-primary" />
              Keyboard Activity
            </h4>
            <Badge className={`${statusStyle.badge} px-3 py-1 text-sm font-medium`}>
              {statusStyle.label}
            </Badge>
          </div>
          
          <div className="relative h-3 bg-background/50 rounded-full overflow-hidden border border-primary/20">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-500 ease-in-out" 
              style={{ width: `${activityPercentage}%` }}
            ></div>
          </div>
          <div className="mt-3 text-sm text-primary/70 flex items-center bg-background/30 p-2 rounded-lg border border-primary/10">
            <AlertCircle className="w-4 h-4 mr-2 text-primary/50" />
            <span>Tracking pauses after 5 minutes without keyboard activity</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
