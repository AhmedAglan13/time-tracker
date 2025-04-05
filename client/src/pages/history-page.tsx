import { Layout } from "@/components/layout";
import { SessionSummary } from "@/components/session-summary";
import { RecentSessions } from "@/components/recent-sessions";
import { useSession } from "@/hooks/use-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Calendar, 
  ArrowDownAZ, 
  History, 
  Clock, 
  Download,
  FileSpreadsheet,
  FileJson
} from "lucide-react";
import { format, addDays, isAfter, isBefore, startOfDay, subDays, subWeeks, subMonths, startOfWeek, startOfMonth } from "date-fns";
import { useState, useEffect } from "react";
import { Session } from "@shared/schema";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type TimePeriod = 'today' | 'week' | 'month' | 'all';

export default function HistoryPage() {
  const { selectedSession, selectSession, recentSessions } = useSession();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [sortByDuration, setSortByDuration] = useState(false);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [activeTimePeriod, setActiveTimePeriod] = useState<TimePeriod>('all');
  
  // Function to export sessions data as CSV
  const exportSessionsCSV = () => {
    if (filteredSessions.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no sessions matching your current filters.",
        variant: "destructive"
      });
      return;
    }
    
    // Define CSV headers
    const headers = ["ID", "Start Time", "End Time", "Duration (minutes)", "Active Duration (minutes)", "Status"];
    
    // Convert sessions to CSV rows
    const csvData = filteredSessions.map(session => {
      const startTime = new Date(session.startTime).toLocaleString();
      const endTime = session.endTime ? new Date(session.endTime).toLocaleString() : "Ongoing";
      const duration = session.endTime ? 
        Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000) : 
        "Ongoing";
      const activeDuration = session.activeDuration ? Math.floor(session.activeDuration / 60) : 0;
      const status = session.endTime ? "Completed" : "In Progress";
      
      return [
        session.id,
        startTime,
        endTime,
        duration,
        activeDuration,
        status
      ].join(",");
    });
    
    // Combine headers and data
    const csvContent = [headers.join(","), ...csvData].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `session_history_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `${filteredSessions.length} sessions exported as CSV.`
    });
  };
  
  // Function to export sessions data as JSON
  const exportSessionsJSON = () => {
    if (filteredSessions.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no sessions matching your current filters.",
        variant: "destructive"
      });
      return;
    }
    
    // Format the data for better readability
    const jsonData = filteredSessions.map(session => {
      return {
        id: session.id,
        userId: session.userId,
        startTime: new Date(session.startTime).toISOString(),
        endTime: session.endTime ? new Date(session.endTime).toISOString() : null,
        activeDuration: session.activeDuration,
        status: session.endTime ? "Completed" : "In Progress"
      };
    });
    
    // Create download link
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `session_history_${format(new Date(), "yyyy-MM-dd")}.json`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: `${filteredSessions.length} sessions exported as JSON.`
    });
  };
  
  // Function to handle time period filter
  const handleTimePeriodFilter = (period: TimePeriod) => {
    setActiveTimePeriod(period);
    // Clear date filter when using time period filters
    setDate(undefined);
    
    // Show toast notification
    toast({
      title: `${period.charAt(0).toUpperCase() + period.slice(1)} Filter Applied`,
      description: period === 'all' 
        ? 'Showing all sessions' 
        : `Showing sessions from the ${period}`
    });
  };
  
  // Apply filters to sessions
  useEffect(() => {
    let result = [...recentSessions];
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(session => {
        const startTime = new Date(session.startTime).toLocaleString();
        const duration = session.activeDuration ? 
          `${Math.floor(session.activeDuration / 60)} minutes` : '';
        
        return startTime.toLowerCase().includes(query) || 
               duration.toLowerCase().includes(query);
      });
    }
    
    // Apply date filter (exact date via calendar)
    if (date) {
      const dayStart = startOfDay(date);
      const dayEnd = startOfDay(addDays(date, 1));
      
      result = result.filter(session => {
        const sessionDate = new Date(session.startTime);
        return isAfter(sessionDate, dayStart) && isBefore(sessionDate, dayEnd);
      });
    } 
    // Apply time period filter (today, week, month)
    else if (activeTimePeriod !== 'all') {
      const now = new Date();
      let filterStart: Date;
      
      if (activeTimePeriod === 'today') {
        filterStart = startOfDay(now);
      } else if (activeTimePeriod === 'week') {
        filterStart = startOfWeek(now);
      } else if (activeTimePeriod === 'month') {
        filterStart = startOfMonth(now);
      } else {
        filterStart = new Date(0); // Beginning of time if 'all'
      }
      
      result = result.filter(session => {
        const sessionDate = new Date(session.startTime);
        return isAfter(sessionDate, filterStart);
      });
    }
    
    // Apply sort by duration
    if (sortByDuration) {
      result.sort((a, b) => {
        const durationA = a.activeDuration || 0;
        const durationB = b.activeDuration || 0;
        return durationB - durationA; // Sort by longest first
      });
    }
    
    setFilteredSessions(result);
  }, [recentSessions, searchQuery, date, sortByDuration, activeTimePeriod]);
  
  // Handle apply filters click
  const handleApplyFilters = () => {
    toast({
      title: "Filters Applied",
      description: `Showing ${filteredSessions.length} sessions based on your filters.`
    });
  };
  
  // Toggle duration sort
  const toggleDurationSort = () => {
    setSortByDuration(!sortByDuration);
  };
  
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
              <Input 
                className="pl-10 border-primary/20" 
                placeholder="Search by date, duration..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className={cn(
                  "border-primary/20 hover:bg-primary/10",
                  date && "bg-primary/20"
                )}>
                  <Calendar className="h-4 w-4 text-primary/80" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              variant="outline" 
              size="icon" 
              className={cn(
                "border-primary/20 hover:bg-primary/10",
                sortByDuration && "bg-primary/20"
              )}
              onClick={toggleDurationSort}
            >
              <ArrowDownAZ className="h-4 w-4 text-primary/80" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-primary/20 hover:bg-primary/10">
                  <Download className="h-4 w-4 mr-2 text-primary/80" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportSessionsCSV} className="cursor-pointer">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  <span>Export as CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportSessionsJSON} className="cursor-pointer">
                  <FileJson className="h-4 w-4 mr-2" />
                  <span>Export as JSON</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button onClick={handleApplyFilters}>
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
        <Card className="border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Session History</CardTitle>
                {date && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Date filter: {format(date, "MMMM d, yyyy")}
                  </div>
                )}
                {activeTimePeriod !== 'all' && !date && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Period filter: {activeTimePeriod.charAt(0).toUpperCase() + activeTimePeriod.slice(1)}
                  </div>
                )}
                {sortByDuration && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Sorted by: Duration (longest first)
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Badge 
                  variant={activeTimePeriod === 'today' ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer hover:bg-primary/90 transition-colors",
                    activeTimePeriod === 'today' ? "bg-primary" : "bg-background hover:text-primary"
                  )}
                  onClick={() => handleTimePeriodFilter('today')}
                >
                  Today
                </Badge>
                <Badge 
                  variant={activeTimePeriod === 'week' ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer hover:bg-primary/90 transition-colors",
                    activeTimePeriod === 'week' ? "bg-primary" : "bg-background hover:text-primary"
                  )}
                  onClick={() => handleTimePeriodFilter('week')}
                >
                  Week
                </Badge>
                <Badge 
                  variant={activeTimePeriod === 'month' ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer hover:bg-primary/90 transition-colors",
                    activeTimePeriod === 'month' ? "bg-primary" : "bg-background hover:text-primary"
                  )}
                  onClick={() => handleTimePeriodFilter('month')}
                >
                  Month
                </Badge>
                <Badge 
                  variant={activeTimePeriod === 'all' ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer hover:bg-primary/90 transition-colors",
                    activeTimePeriod === 'all' ? "bg-primary" : "bg-background hover:text-primary"
                  )}
                  onClick={() => handleTimePeriodFilter('all')}
                >
                  All
                </Badge>
              </div>
            </div>
          </CardHeader>
          {recentSessions.length === 0 ? (
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 mx-auto">
                <History className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No sessions recorded yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start tracking your work to create session history.
              </p>
            </CardContent>
          ) : filteredSessions.length === 0 ? (
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 mx-auto">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No matching sessions</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Try adjusting your search criteria or filters.
              </p>
            </CardContent>
          ) : (
            <CardContent className="p-0">
              <RecentSessions 
                sessions={filteredSessions} 
                onViewSession={selectSession} 
              />
            </CardContent>
          )}
        </Card>
      </div>
    </Layout>
  );
}