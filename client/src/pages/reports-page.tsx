import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import { useAuth } from "@/hooks/use-auth";
import { Clock, Calendar, Download, BarChart, LineChart } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, differenceInDays, isWithinInterval } from "date-fns";
import { useState, useEffect } from "react";
import { Session } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart as RechartsBarChart,
  Bar
} from "recharts";

type TimeRange = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'all_time';

export default function ReportsPage() {
  const { recentSessions } = useSession();
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeRange, setTimeRange] = useState<TimeRange>('this_week');
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  
  // Format time as hours and minutes
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return { hours, minutes };
  };
  
  // Get the start and end dates for the selected time range
  const getDateRange = (range: TimeRange) => {
    const now = new Date();
    let startDate: Date;
    let endDate = now;
    
    switch (range) {
      case 'this_week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        endDate = endOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'last_week':
        const lastWeekEnd = subDays(startOfWeek(now, { weekStartsOn: 1 }), 1);
        startDate = startOfWeek(lastWeekEnd, { weekStartsOn: 1 });
        endDate = lastWeekEnd;
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'all_time':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    return { startDate, endDate };
  };
  
  // Filter sessions based on the selected time range
  useEffect(() => {
    const { startDate, endDate } = getDateRange(timeRange);
    
    const filtered = recentSessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return isWithinInterval(sessionDate, { start: startDate, end: endDate });
    });
    
    setFilteredSessions(filtered);
  }, [recentSessions, timeRange]);
  
  // Calculate total active time in seconds
  const totalActiveTime = filteredSessions.reduce((total, session) => {
    return total + (session.activeDuration || 0);
  }, 0);
  
  // Format for display
  const { hours: activeHours, minutes: activeMinutes } = formatTime(totalActiveTime);
  
  // Calculate sessions completed
  const sessionsCompleted = filteredSessions.filter(session => session.endTime).length;
  
  // Calculate average session length
  const averageSessionLength = sessionsCompleted > 0 
    ? totalActiveTime / sessionsCompleted 
    : 0;
  const { hours: avgHours, minutes: avgMinutes } = formatTime(averageSessionLength);
  
  // Calculate percentage change from previous period
  const getPercentageChange = () => {
    // Get previous time range
    let previousRange: TimeRange;
    switch (timeRange) {
      case 'this_week':
        previousRange = 'last_week';
        break;
      case 'last_week':
        previousRange = 'this_week'; // Just for comparison
        break;
      case 'this_month':
        previousRange = 'last_month';
        break;
      case 'last_month':
        previousRange = 'this_month'; // Just for comparison
        break;
      default:
        return { activeTimeChange: 0, sessionsChange: 0, avgSessionChange: 0 };
    }
    
    const { startDate: prevStart, endDate: prevEnd } = getDateRange(previousRange);
    
    const previousSessions = recentSessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      return isWithinInterval(sessionDate, { start: prevStart, end: prevEnd });
    });
    
    const previousActiveTime = previousSessions.reduce((total, session) => {
      return total + (session.activeDuration || 0);
    }, 0);
    
    const previousSessionsCompleted = previousSessions.filter(session => session.endTime).length;
    
    const previousAvgSessionLength = previousSessionsCompleted > 0 
      ? previousActiveTime / previousSessionsCompleted 
      : 0;
    
    const activeTimeChange = previousActiveTime > 0 
      ? ((totalActiveTime - previousActiveTime) / previousActiveTime) * 100 
      : 0;
    
    const sessionsChange = previousSessionsCompleted > 0 
      ? ((sessionsCompleted - previousSessionsCompleted) / previousSessionsCompleted) * 100 
      : 0;
    
    const avgSessionChange = previousAvgSessionLength > 0 
      ? ((averageSessionLength - previousAvgSessionLength) / previousAvgSessionLength) * 100 
      : 0;
    
    return { activeTimeChange, sessionsChange, avgSessionChange };
  };
  
  const { activeTimeChange, sessionsChange, avgSessionChange } = getPercentageChange();
  
  // Prepare data for daily working hours chart
  const getDailyWorkingHoursData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dayStats = days.map(day => ({ name: day, hours: 0 }));
    
    filteredSessions.forEach(session => {
      const date = new Date(session.startTime);
      const dayIndex = (date.getDay() + 6) % 7; // Convert from Sun-Sat (0-6) to Mon-Sun (0-6)
      const activeDurationHours = (session.activeDuration || 0) / 3600;
      dayStats[dayIndex].hours += activeDurationHours;
    });
    
    return dayStats;
  };
  
  // Prepare data for monthly overview chart
  const getMonthlyOverviewData = () => {
    const { startDate, endDate } = getDateRange(timeRange);
    const dayCount = differenceInDays(endDate, startDate) + 1;
    
    // Create entries for each day/week depending on the range
    const entries = [];
    const isWeekly = dayCount > 31; // Use weeks for longer periods
    
    if (isWeekly) {
      // Group by weeks
      const weekCount = Math.ceil(dayCount / 7);
      for (let i = 0; i < weekCount; i++) {
        entries.push({
          name: `Week ${i + 1}`,
          active: 0,
          idle: 0
        });
      }
      
      filteredSessions.forEach(session => {
        const sessionDate = new Date(session.startTime);
        const dayDiff = differenceInDays(sessionDate, startDate);
        const weekIndex = Math.floor(dayDiff / 7);
        
        if (weekIndex >= 0 && weekIndex < entries.length) {
          const activeDurationHours = (session.activeDuration || 0) / 3600;
          entries[weekIndex].active += activeDurationHours;
          
          // Calculate approximate idle time (total session time - active time)
          if (session.endTime) {
            const totalDurationHours = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 3600000;
            const idleHours = Math.max(0, totalDurationHours - activeDurationHours);
            entries[weekIndex].idle += idleHours;
          }
        }
      });
    } else {
      // Daily data
      for (let i = 0; i < dayCount; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        entries.push({
          name: format(date, "MMM d"),
          active: 0,
          idle: 0
        });
      }
      
      filteredSessions.forEach(session => {
        const sessionDate = new Date(session.startTime);
        const dayDiff = differenceInDays(sessionDate, startDate);
        
        if (dayDiff >= 0 && dayDiff < entries.length) {
          const activeDurationHours = (session.activeDuration || 0) / 3600;
          entries[dayDiff].active += activeDurationHours;
          
          // Calculate approximate idle time (total session time - active time)
          if (session.endTime) {
            const totalDurationHours = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 3600000;
            const idleHours = Math.max(0, totalDurationHours - activeDurationHours);
            entries[dayDiff].idle += idleHours;
          }
        }
      });
    }
    
    return entries;
  };
  
  // Export report as CSV
  const exportReportCSV = () => {
    // Define CSV headers
    const headers = ["Date Range", "Total Active Time (h)", "Sessions Completed", "Average Session Length (h)"];
    
    // Convert data to CSV rows
    const { startDate, endDate } = getDateRange(timeRange);
    const dateRangeStr = `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
    const totalActiveTimeHours = totalActiveTime / 3600;
    const avgSessionLengthHours = averageSessionLength / 3600;
    
    const reportRow = [
      dateRangeStr,
      totalActiveTimeHours.toFixed(2),
      sessionsCompleted,
      avgSessionLengthHours.toFixed(2)
    ].join(",");
    
    // Daily data
    const dailyData = getDailyWorkingHoursData();
    const dailyHeaders = ["Day", "Hours Worked"];
    const dailyRows = dailyData.map(day => `${day.name},${day.hours.toFixed(2)}`);
    
    // Monthly overview data
    const monthlyData = getMonthlyOverviewData();
    const monthlyHeaders = ["Period", "Active Hours", "Idle Hours"];
    const monthlyRows = monthlyData.map(entry => 
      `${entry.name},${entry.active.toFixed(2)},${entry.idle.toFixed(2)}`
    );
    
    // Combine all data
    const csvContent = [
      "SUMMARY",
      headers.join(","),
      reportRow,
      "",
      "DAILY WORKING HOURS",
      dailyHeaders.join(","),
      ...dailyRows,
      "",
      "PERIOD OVERVIEW",
      monthlyHeaders.join(","),
      ...monthlyRows
    ].join("\n");
    
    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `time_tracker_report_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Successful",
      description: "Report has been exported as CSV."
    });
  };
  
  return (
    <Layout title="Reports & Analytics">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Reports & Analytics</h1>
          <p className="text-muted-foreground">View insights and statistics about your work sessions.</p>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={timeRange}
            onValueChange={(value: TimeRange) => setTimeRange(value)}
          >
            <SelectTrigger className="min-w-[150px] border-primary/20 bg-primary/5">
              <SelectValue placeholder="This Week" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline"
            className="border-primary/20 hover:bg-primary/10"
            onClick={exportReportCSV}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground mb-1">Total Active Time</p>
                <h3 className="text-3xl font-bold mb-1">
                  {activeHours}h {activeMinutes}m
                </h3>
                <div className={cn(
                  "text-sm",
                  activeTimeChange > 0 ? "text-green-500" : activeTimeChange < 0 ? "text-red-500" : "text-muted-foreground"
                )}>
                  {activeTimeChange > 0 ? "+" : ""}{activeTimeChange.toFixed(1)}% from last {timeRange.includes('week') ? 'week' : 'month'}
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground mb-1">Sessions Completed</p>
                <h3 className="text-3xl font-bold mb-1">
                  {sessionsCompleted}
                </h3>
                <div className={cn(
                  "text-sm",
                  sessionsChange > 0 ? "text-green-500" : sessionsChange < 0 ? "text-red-500" : "text-muted-foreground"
                )}>
                  {sessionsChange > 0 ? "+" : ""}{sessionsChange.toFixed(1)}% from last {timeRange.includes('week') ? 'week' : 'month'}
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-muted-foreground mb-1">Average Session Length</p>
                <h3 className="text-3xl font-bold mb-1">
                  {avgHours}h {avgMinutes}m
                </h3>
                <div className={cn(
                  "text-sm",
                  avgSessionChange > 0 ? "text-green-500" : avgSessionChange < 0 ? "text-red-500" : "text-muted-foreground"
                )}>
                  {avgSessionChange > 0 ? "+" : ""}{avgSessionChange.toFixed(1)}% from last {timeRange.includes('week') ? 'week' : 'month'}
                </div>
              </div>
              <div className="bg-primary/10 p-2 rounded-lg">
                <Clock className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Working Hours */}
        <Card className="border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <div className="flex justify-between items-center">
              <CardTitle>Daily Working Hours</CardTitle>
              <div className="text-sm text-muted-foreground">Hours tracked per day</div>
            </div>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={getDailyWorkingHoursData()}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="hours" name="Hours" fill="#7C3AED" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Monthly Overview */}
        <Card className="border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <div className="flex justify-between items-center">
              <CardTitle>Activity Overview</CardTitle>
              <div className="text-sm text-muted-foreground">Active vs. idle time</div>
            </div>
          </CardHeader>
          <CardContent className="p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={getMonthlyOverviewData()}
                margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorIdle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#555" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="active" 
                  name="Active" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#colorActive)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="idle" 
                  name="Idle" 
                  stroke="#F59E0B" 
                  fillOpacity={1} 
                  fill="url(#colorIdle)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}