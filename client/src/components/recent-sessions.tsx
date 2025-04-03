import { History, Eye } from "lucide-react";
import { Session } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useActivityTracker } from "@/hooks/use-activity-tracker";

interface RecentSessionsProps {
  sessions: Session[];
  onViewSession: (session: Session) => void;
}

export function RecentSessions({ sessions, onViewSession }: RecentSessionsProps) {
  const { formatDate, formatTime, formatDurationFriendly } = useActivityTracker();
  
  return (
    <div className="bg-muted/50 rounded-lg shadow-lg overflow-hidden">
      <div className="p-5 border-b border-border flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center">
          <History className="w-5 h-5 mr-2 text-primary" />
          Recent Sessions
        </h3>
        <Button variant="link" size="sm" className="text-primary">
          View All
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Start Time</th>
              <th className="px-5 py-3">End Time</th>
              <th className="px-5 py-3">Duration</th>
              <th className="px-5 py-3">Active Time</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-4 text-center text-muted-foreground">
                  No sessions recorded yet
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id} className="hover:bg-accent/10 transition-colors">
                  <td className="px-5 py-4 text-sm">
                    {session.startTime ? formatDate(new Date(session.startTime)) : "-"}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {session.startTime ? formatTime(new Date(session.startTime)) : "-"}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {session.endTime ? formatTime(new Date(session.endTime)) : "Active"}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    {session.totalDuration ? formatDurationFriendly(session.totalDuration) : "-"}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-primary">
                    {session.activeDuration ? formatDurationFriendly(session.activeDuration) : "-"}
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewSession(session)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {sessions.length > 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground border-t border-border">
          Showing {sessions.length} of {sessions.length} sessions
        </div>
      )}
    </div>
  );
}
