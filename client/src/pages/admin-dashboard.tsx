import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Loader2, Users, BarChart, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTimeTheme } from "@/components/time-theme-provider";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { timePeriod } = useTimeTheme();
  
  const {
    data: analytics,
    isLoading: analyticsLoading,
    error: analyticsError
  } = useQuery<{
    userCount: number;
    sessionCount: number;
    activeUsers: number;
    totalActiveTime: number;
  }>({
    queryKey: ["/api/admin/analytics"],
    enabled: user?.role?.toLowerCase() === "admin",
  });

  // Function to format duration from seconds
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (user?.role?.toLowerCase() !== "admin") {
    return (
      <Layout title="Admin Access Denied">
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-8">
            You need administrator privileges to access this page.
          </p>
        </div>
      </Layout>
    );
  }

  if (analyticsLoading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (analyticsError) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h2 className="text-2xl font-bold mb-4">Error Loading Admin Data</h2>
          <p className="text-muted-foreground mb-8">
            {(analyticsError as Error)?.message || "An unknown error occurred"}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      {/* Statistics Overview */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className={cn(
          "cursor-pointer hover:shadow-md transition-all border-2 border-primary/10 hover:border-primary/30",
          timePeriod === 'night' ? 'hover:bg-primary/5' : ''
        )}>
          <Link href="/user-management">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <div className="mr-4 w-12 h-12 rounded-full flex items-center justify-center bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-3xl font-bold">{analytics?.userCount || 0}</div>
                <p className="text-xs text-muted-foreground">All registered users</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className={cn(
          "cursor-pointer hover:shadow-md transition-all border-2 border-indigo-500/10 hover:border-indigo-500/30",
          timePeriod === 'night' ? 'hover:bg-indigo-500/5' : ''
        )}>
          <Link href="/">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <div className="mr-4 w-12 h-12 rounded-full flex items-center justify-center bg-indigo-500/10">
                <BarChart className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <div className="text-3xl font-bold">{analytics?.sessionCount || 0}</div>
                <p className="text-xs text-muted-foreground">Completed sessions</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className={cn(
          "cursor-pointer hover:shadow-md transition-all border-2 border-green-500/10 hover:border-green-500/30",
          timePeriod === 'night' ? 'hover:bg-green-500/5' : ''
        )}>
          <Link href="/user-management">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <div className="mr-4 w-12 h-12 rounded-full flex items-center justify-center bg-green-500/10">
                <Users className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <div className="text-3xl font-bold">{analytics?.activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className={cn(
          "cursor-pointer hover:shadow-md transition-all border-2 border-amber-500/10 hover:border-amber-500/30",
          timePeriod === 'night' ? 'hover:bg-amber-500/5' : ''
        )}>
          <Link href="/reports">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Active Time</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center">
              <div className="mr-4 w-12 h-12 rounded-full flex items-center justify-center bg-amber-500/10">
                <Loader2 className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {analytics ? formatDuration(analytics.totalActiveTime) : "00:00:00"}
                </div>
                <p className="text-xs text-muted-foreground">Total active time</p>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Administrative Actions */}
      <h2 className="text-2xl font-bold mb-4">Administrative Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className={cn(
          "border-2 border-primary/20 shadow-md rounded-xl hover:shadow-lg transition-all duration-300 hover:border-primary/40",
          timePeriod === 'night' ? 'hover:bg-primary/5' : ''
        )}>
          <Link href="/user-management">
            <CardContent className="p-6 flex flex-col cursor-pointer h-full">
              <div className={cn(
                "mb-4 h-12 w-12 rounded-full flex items-center justify-center",
                timePeriod === 'night' ? 'bg-primary/20' : 'bg-primary/10'
              )}>
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mb-2">User Management</CardTitle>
              <p className="text-sm text-muted-foreground flex-grow mb-4">
                View all users, manage accounts, and monitor individual user sessions.
              </p>
              <div className="text-primary flex items-center text-sm font-medium">
                Manage Users
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className={cn(
          "border-2 border-primary/20 shadow-md rounded-xl hover:shadow-lg transition-all duration-300 hover:border-primary/40",
          timePeriod === 'night' ? 'hover:bg-primary/5' : ''
        )}>
          <Link href="/reports">
            <CardContent className="p-6 flex flex-col cursor-pointer h-full">
              <div className={cn(
                "mb-4 h-12 w-12 rounded-full flex items-center justify-center",
                timePeriod === 'night' ? 'bg-primary/20' : 'bg-primary/10'
              )}>
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mb-2">Analytics</CardTitle>
              <p className="text-sm text-muted-foreground flex-grow mb-4">
                View detailed analytics and reports on user productivity and time usage.
              </p>
              <div className="text-primary flex items-center text-sm font-medium">
                View Reports
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className={cn(
          "border-2 border-primary/20 shadow-md rounded-xl hover:shadow-lg transition-all duration-300 hover:border-primary/40",
          timePeriod === 'night' ? 'hover:bg-primary/5' : ''
        )}>
          <Link href="/settings">
            <CardContent className="p-6 flex flex-col cursor-pointer h-full">
              <div className={cn(
                "mb-4 h-12 w-12 rounded-full flex items-center justify-center",
                timePeriod === 'night' ? 'bg-primary/20' : 'bg-primary/10'
              )}>
                <Download className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="mb-2">Export Data</CardTitle>
              <p className="text-sm text-muted-foreground flex-grow mb-4">
                Export organization data for reports and integration with other systems.
              </p>
              <div className="text-primary flex items-center text-sm font-medium">
                Export Reports
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </Layout>
  );
}