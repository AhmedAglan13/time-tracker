import { useState, useEffect } from "react";
import { Clock, LogIn, LogOut, Keyboard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/use-session";
import { useActivityTracker } from "@/hooks/use-activity-tracker";
import { useTimeTheme } from "@/components/time-theme-provider";
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
  
  const { timePeriod, colorScheme, getPeriodIcon } = useTimeTheme();
  
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
    // Base style with time of day influence
    let baseGradient = 'from-primary/5 to-primary/20';
    
    if (timePeriod === 'morning') {
      baseGradient = 'from-amber-200/10 to-purple-200/20';
    } else if (timePeriod === 'afternoon') {
      baseGradient = 'from-orange-200/10 to-purple-200/20';
    } else if (timePeriod === 'evening') {
      baseGradient = 'from-pink-200/10 to-purple-300/20';
    } else if (timePeriod === 'night') {
      baseGradient = 'from-indigo-900/20 to-purple-800/30';
    }
    
    if (!isActive) return {
      indicator: "bg-primary/60",
      text: "text-primary/60",
      label: "Ready",
      animation: "",
      badge: "bg-primary/10 text-primary/60",
      gradient: `bg-gradient-to-r ${baseGradient}`
    };
    
    if (isIdle) return {
      indicator: "bg-amber-500",
      text: "text-amber-500",
      label: "Taking a Break",
      animation: "animate-bounce",
      badge: "bg-amber-500/30 text-amber-500 border border-amber-500/30",
      gradient: `bg-gradient-to-r from-amber-500/10 to-amber-500/30`
    };
    
    return {
      indicator: "bg-green-400",
      text: "text-green-400",
      label: "Working",
      animation: "animate-pulse",
      badge: "bg-green-400/30 text-green-400 border border-green-400/30",
      gradient: `bg-gradient-to-r from-green-400/10 to-green-400/30`
    };
  };
  
  const statusStyle = getStatusStyle();
  
  // Get button gradient based on time of day
  const getStartButtonGradient = () => {
    if (isActive) return '';
    
    switch(timePeriod) {
      case 'morning': 
        return 'bg-gradient-to-r from-amber-400 to-amber-500';
      case 'afternoon': 
        return 'bg-gradient-to-r from-orange-400 to-orange-500';
      case 'evening': 
        return 'bg-gradient-to-r from-pink-500 to-purple-500';
      case 'night': 
        return 'bg-gradient-to-r from-blue-600 to-indigo-700';
      default: 
        return 'bg-gradient-to-r from-green-400 to-green-500';
    }
  };
  
  return (
    <Card className={`${statusStyle.gradient} rounded-xl shadow-xl overflow-hidden mb-6 border-2 border-primary/30`}>
      <div className="p-5 border-b border-primary/20">
        <h3 className="font-bold text-lg flex items-center">
          <Clock className={`w-5 h-5 mr-2 ${statusStyle.text}`} />
          Current Session {getPeriodIcon()}
        </h3>
      </div>
      
      <div className="p-5">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* Timer Display */}
          <div className={cn(
            "flex flex-col items-center lg:items-start p-5 rounded-xl shadow-inner border border-primary/10",
            timePeriod === 'night' ? 'bg-background/30' : 'bg-background/40'
          )}>
            <div className="font-light text-sm mb-2 text-muted-foreground">Your Status</div>
            <div className={`flex items-center ${statusStyle.text} font-bold text-lg mb-4`}>
              <span className={`w-3 h-3 ${statusStyle.indicator} rounded-full ${statusStyle.animation} mr-2`}></span>
              <span>{statusStyle.label}</span>
            </div>
            
            <div className="font-light text-sm mb-2 text-muted-foreground">Time Tracked</div>
            <div className="text-5xl font-extrabold text-primary animate-pulse">{formatDuration(activeSeconds)}</div>
            
            <div className="flex flex-row gap-3 mt-3">
              <div className={cn(
                "text-xs px-3 py-1 rounded-full",
                timePeriod === 'night' ? 'bg-background/70' : 'bg-background/50'
              )}>
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
                getStartButtonGradient()
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
                isActive ? "border-primary/50 text-primary hover:bg-primary/10" : "opacity-50 cursor-not-allowed",
                timePeriod === 'night' && isActive ? 'hover:bg-primary/20 border-primary/70' : ''
              )}
              onClick={endSession}
              disabled={!isActive || isLoading}
            >
              <LogOut className="w-6 h-6 mr-2" />
              End Work
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
