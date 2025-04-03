import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

interface ActivityLogProps {
  logs: { timestamp: Date; message: string }[];
  formatTime: (date: Date) => string;
}

export function ActivityLog({ logs, formatTime }: ActivityLogProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to the bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);
  
  return (
    <div className="mt-6 bg-muted/50 rounded-lg shadow-lg overflow-hidden">
      <div className="p-5 border-b border-border">
        <h3 className="font-semibold text-lg flex items-center">
          <Terminal className="w-5 h-5 mr-2 text-primary" />
          Activity Log
        </h3>
      </div>
      
      <div 
        ref={logContainerRef}
        className="p-4 bg-[#121824] font-mono text-sm h-[200px] overflow-y-auto" 
      >
        {logs.length === 0 ? (
          <div className="text-gray-400">$ system: Waiting for activity...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">
              <span className="text-gray-500">[{formatTime(log.timestamp)}]</span>{" "}
              <span className="text-blue-400">$</span>{" "}
              <span className="text-green-400">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
