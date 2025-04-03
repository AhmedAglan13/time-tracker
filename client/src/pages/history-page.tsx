import { Layout } from "@/components/layout";
import { SessionSummary } from "@/components/session-summary";
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
      
      {/* Empty State */}
      <Card className="mt-6 text-center p-8 border-2 border-primary/20 bg-primary/5 rounded-xl shadow-lg">
        <CardContent className="p-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
            <History className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-xl mb-3">Session History Coming Soon!</CardTitle>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            We're working on enhancing your Time Tracker experience with detailed session history. Check back soon!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 max-w-3xl mx-auto">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-background/50 border border-primary/10 shadow-sm">
                <CardContent className="p-4 flex items-center">
                  <div className="mr-3 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary/60" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">Example Session</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(), "MMMM d, yyyy")}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
