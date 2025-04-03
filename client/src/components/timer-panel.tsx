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
      indicator: "bg-muted-foreground",
      text: "text-muted-foreground",
      label: "Inactive",
      animation: "",
      badge: "bg-muted/20 text-muted-foreground"
    };
    
    if (isIdle) return {
      indicator: "bg-yellow-500",
      text: "text-yellow-500",
      label: "Idle",
      animation: "",
      badge: "bg-yellow-500/20 text-yellow-500"
    };
    
    return {
      indicator: "bg-green-500",
      text: "text-green-500",
      label: "Active",
      animation: "animate-pulse",
      badge: "bg-green-500/20 text-green-500"
    };
  };
  
  const statusStyle = getStatusStyle();
  const activityPercentage = isIdle ? 10 : (isActive ? 75 : 0);
  
  return (
    <Card className="bg-muted/50 rounded-lg shadow-lg overflow-hidden mb-6">
      <div className="p-5 border-b border-border">
        <h3 className="font-semibold text-lg flex items-center">
          <Clock className="w-5 h-5 mr-2 text-primary" />
          Current Session
        </h3>
      </div>
      
      <div className="p-5">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* Timer Display */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="font-light text-sm mb-1 text-muted-foreground">Current Status:</div>
            <div className={`flex items-center ${statusStyle.text} font-medium mb-4`}>
              <span className={`w-2.5 h-2.5 ${statusStyle.indicator} rounded-full ${statusStyle.animation} mr-2`}></span>
              <span>{statusStyle.label}</span>
            </div>
            
            <div className="font-light text-sm mb-1 text-muted-foreground">Active Time:</div>
            <div className="text-4xl font-bold">{formatDuration(activeSeconds)}</div>
            
            <div className="flex flex-row gap-3 mt-2">
              <div className="text-xs text-muted-foreground">
                Started: {currentSession?.startTime 
                  ? formatTime(new Date(currentSession.startTime)) 
                  : "--:--:--"}
              </div>
              {isIdle && (
                <div className="text-xs text-yellow-500">
                  Idle: {idleMinutes}m
                </div>
              )}
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex flex-col md:flex-row gap-3">
            <Button
              className="px-6 py-6 min-w-[150px]"
              onClick={startSession}
              disabled={isActive || isLoading}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In
            </Button>
            
            <Button
              variant="outline"
              className={cn(
                "px-6 py-6 min-w-[150px]",
                !isActive && "opacity-50 cursor-not-allowed"
              )}
              onClick={endSession}
              disabled={!isActive || isLoading}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
        
        {/* Activity Status */}
        <div className="mt-6 p-4 bg-background/50 rounded-md border border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium flex items-center">
              <Keyboard className="w-4 h-4 mr-2 text-muted-foreground" />
              Keyboard Activity
            </h4>
            <Badge variant="outline" className={statusStyle.badge}>
              {statusStyle.label}
            </Badge>
          </div>
          
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-primary" 
              style={{ width: `${activityPercentage}%` }}
            ></div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex items-center">
            <AlertCircle className="w-3 h-3 mr-1" />
            <span>Monitoring keypress activity. Tracking pauses after 5 minutes of inactivity.</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
