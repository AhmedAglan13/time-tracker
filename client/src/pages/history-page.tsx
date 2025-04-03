import { Layout } from "@/components/layout";
import { RecentSessions } from "@/components/recent-sessions";
import { SessionSummary } from "@/components/session-summary";
import { useSession } from "@/hooks/use-session";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, ArrowDownAZ } from "lucide-react";

export default function HistoryPage() {
  const { recentSessions, selectedSession, selectSession } = useSession();
  
  return (
    <Layout title="Session History">
      <Card className="mb-6 p-6 bg-muted/50">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-2 block">
              Search Sessions
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input className="pl-10" placeholder="Search by date, duration..." />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Calendar className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ArrowDownAZ className="h-4 w-4" />
            </Button>
            <Button>
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Session Summary Modal */}
      <SessionSummary 
        session={selectedSession} 
        onClose={() => selectSession(null)} 
      />
      
      <RecentSessions 
        sessions={recentSessions} 
        onViewSession={selectSession}
      />
    </Layout>
  );
}
