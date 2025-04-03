import { useState } from "react";
import { useSession } from "@/hooks/use-session";
import { Layout } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, AreaChart, PieChart } from "recharts";
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, Area, Pie, Cell, Legend } from "recharts";
import { FileBarChart2, Clock, Calendar } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample data for charts
const weeklyData = [
  { day: "Mon", hours: 6.5 },
  { day: "Tue", hours: 7.2 },
  { day: "Wed", hours: 5.8 },
  { day: "Thu", hours: 8.0 },
  { day: "Fri", hours: 6.2 },
  { day: "Sat", hours: 2.5 },
  { day: "Sun", hours: 0 },
];

const monthlyData = [
  { name: "Week 1", active: 28, idle: 4 },
  { name: "Week 2", active: 32, idle: 5 },
  { name: "Week 3", active: 26, idle: 7 },
  { name: "Week 4", active: 30, idle: 3 },
];

const activityData = [
  { name: "Active", value: 80, color: "#10b981" },
  { name: "Idle", value: 15, color: "#f59e0b" },
  { name: "Break", value: 5, color: "#6366f1" },
];

export default function ReportsPage() {
  const { recentSessions } = useSession();
  const [timeframe, setTimeframe] = useState("week");

  const COLORS = ["#10b981", "#f59e0b", "#6366f1", "#ef4444"];

  return (
    <Layout title="Reports & Analytics">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
          <p className="text-muted-foreground">
            View insights and statistics about your work sessions.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Select
            value={timeframe}
            onValueChange={setTimeframe}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Summary Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Active Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32h 45m</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last {timeframe}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentSessions.length || 15}</div>
            <p className="text-xs text-muted-foreground">
              {recentSessions.length ? '+' : '-'}2 from last {timeframe}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Session Length</CardTitle>
            <FileBarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4h 12m</div>
            <p className="text-xs text-muted-foreground">
              -8% from last {timeframe}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* Bar Chart - Daily Hours */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Daily Working Hours</CardTitle>
            <CardDescription>Hours tracked per day</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} hours`, 'Time']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Area Chart - Weekly Progress */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Active vs. idle time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 5, right: 20, bottom: 20, left: 0 }}>
                <defs>
                  <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="idleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="active" stroke="#10b981" fillOpacity={1} fill="url(#activeGradient)" />
                <Area type="monotone" dataKey="idle" stroke="#f59e0b" fillOpacity={1} fill="url(#idleGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart - Activity Distribution */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Activity Distribution</CardTitle>
            <CardDescription>Time allocation</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {activityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Summary */}
        <Card className="col-span-2 md:col-span-1">
          <CardHeader>
            <CardTitle>Session Insights</CardTitle>
            <CardDescription>Key statistics from your recent sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  <span>Most Productive Day</span>
                </div>
                <span className="font-medium">Thursday</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                  <span>Least Productive Day</span>
                </div>
                <span className="font-medium">Monday</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                  <span>Average Session Duration</span>
                </div>
                <span className="font-medium">4h 12m</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Total Sessions</span>
                </div>
                <span className="font-medium">{recentSessions.length || 15}</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                These insights are based on your tracked sessions from the past {timeframe}.
                Continue tracking your work to get more accurate insights.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}