import { Layout } from "@/components/layout";
import { SessionSummary } from "@/components/session-summary";
import { RecentSessions } from "@/components/recent-sessions";
import { useSession } from "@/hooks/use-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Calendar, ArrowDownAZ, History, Clock } from "lucide-react";
import { format } from "date-fns";

export default function HistoryPage() {
  const { selectedSession, selectSession } = useSession();
  
  return (
    <Layout title="Session History">
      <Card className="mb-6 p-6 bg-primary/5 rounded-xl border-2 border-primary/20 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium text-primary/80 mb-2 block">
              Search Your Sessions
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary/60 h-4 w-4" />
              <Input className="pl-10 border-primary/20" placeholder="Search by date, duration..." />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary/10">
              <Calendar className="h-4 w-4 text-primary/80" />
            </Button>
            <Button variant="outline" size="icon" className="border-primary/20 hover:bg-primary/10">
              <ArrowDownAZ className="h-4 w-4 text-primary/80" />
            </Button>
            <Button>
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Session Summary Modal */}
      {selectedSession && (
        <SessionSummary 
          session={selectedSession} 
          onClose={() => selectSession(null)} 
        />
      )}
      
      {/* Sessions List */}
      <div className="mt-6">
        {/* Import RecentSessions component to display sessions */}
        <Card className="border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle>Session History</CardTitle>
          </CardHeader>
          {useSession().recentSessions.length === 0 ? (
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 mx-auto">
                <History className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No sessions recorded yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start tracking your work to create session history.
              </p>
            </CardContent>
          ) : (
            <CardContent className="p-0">
              <RecentSessions 
                sessions={useSession().recentSessions} 
                onViewSession={selectSession} 
              />
            </CardContent>
          )}
        </Card>
      </div>
    </Layout>
  );
}
