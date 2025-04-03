import { useEffect } from "react";
import { CheckCircle, X, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Session } from "@shared/schema";
import { useActivityTracker } from "@/hooks/use-activity-tracker";

interface SessionSummaryProps {
  session: Session | null;
  onClose: () => void;
}

export function SessionSummary({ session, onClose }: SessionSummaryProps) {
  const { formatTime, formatDate, formatDurationFriendly } = useActivityTracker();
  
  if (!session) return null;
  
  // Calculate activity percentage
  const totalDuration = session.totalDuration || 0;
  const activeDuration = session.activeDuration || 0;
  const idleDuration = session.idleDuration || 0;
  
  const activePercentage = totalDuration > 0 
    ? Math.round((activeDuration / totalDuration) * 100) 
    : 0;
  
  return (
    <Dialog open={!!session} onOpenChange={() => onClose()}>
      <DialogContent className="bg-muted/50 border-border sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-success" />
            Session Summary
          </DialogTitle>
          <DialogDescription>
            Your completed work session details
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">Session Date</div>
              <div className="font-medium">
                {session.startTime ? formatDate(new Date(session.startTime)) : "-"}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">Start Time</div>
              <div className="font-medium">
                {session.startTime ? formatTime(new Date(session.startTime)) : "-"}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">End Time</div>
              <div className="font-medium">
                {session.endTime ? formatTime(new Date(session.endTime)) : "-"}
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">Total Duration</div>
              <div className="font-medium">
                {formatDurationFriendly(totalDuration)}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">Active Time</div>
              <div className="font-medium text-primary">
                {formatDurationFriendly(activeDuration)}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="text-sm text-muted-foreground mb-1">Idle Time</div>
              <div className="font-medium">
                {formatDurationFriendly(idleDuration)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-background/50 rounded-md border border-border">
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2 text-muted-foreground" />
            Activity Breakdown
          </h4>
          
          <div className="h-8 relative w-full bg-muted rounded-md overflow-hidden mb-4">
            <div 
              className="absolute left-0 top-0 h-full bg-primary" 
              style={{ width: `${activePercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{activePercentage}% Active</span>
            <span className="text-muted-foreground">{100 - activePercentage}% Idle</span>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
