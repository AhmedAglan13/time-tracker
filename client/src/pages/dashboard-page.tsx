import { Layout } from "@/components/layout";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Clock, 
  Calendar, 
  Sparkles, 
  BarChart,
  History, 
  Settings,
  ArrowRight,
  Users,
  Shield,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { useAuth } from "@/hooks/use-auth";
import { useTimeTheme } from "@/components/time-theme-provider";
import { useHelpContent } from "@/hooks/use-help-content";
import { HelpBubble } from "@/components/help-bubble";
import { cn } from '@/lib/utils';
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardPage() {
  const { user } = useAuth();
  const { currentSession, activeSeconds, isActive } = useSession();
  const { getGreeting, timePeriod, colorScheme, getPeriodIcon } = useTimeTheme();
  const { getHelpContent } = useHelpContent();
  
  // Helper function to format a date
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Helper function to format seconds
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes} minutes`;
    }
    
    return `${hours}h ${minutes}m`;
  };
  
  // Admin dashboard statistics
  const [adminStats, setAdminStats] = useState({
    userCount: 0,
    sessionCount: 0,
    activeUsers: 0,
    totalTrackedTime: '0h 0m'
  });

  // Fetch admin stats if user is admin
  useEffect(() => {
    const fetchAdminStats = async () => {
      if (user?.role?.toLowerCase() === 'admin') {
        try {
          const response = await fetch('/api/admin/analytics');
          if (response.ok) {
            const data = await response.json();
            setAdminStats({
              userCount: data.userCount || 0,
              sessionCount: data.sessionCount || 0,
              activeUsers: data.activeUsersCount || 0,
              totalTrackedTime: data.totalActiveDuration 
                ? formatDuration(data.totalActiveDuration) 
                : '0h 0m'
            });
          }
        } catch (error) {
          console.error("Failed to fetch admin analytics:", error);
        }
      }
    };

    fetchAdminStats();
  }, [user]);

  // Check if user is admin
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  return (
    <Layout title="Dashboard">
      {/* Welcome Banner */}
      <div className="dashboard-greeting mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-start">
            <div>
              <h1 className="greeting-text mb-2 text-card-title font-semibold text-xl">
                {getGreeting()}, {user?.username || 'User'}! {getPeriodIcon()}
              </h1>
              <p className="timestamp-text text-card-text">
                Today is {formatDate(new Date())}
                {isAdmin && <span className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-semibold">Admin</span>}
              </p>
            </div>
            <HelpBubble 
              content={getHelpContent('dashboard-overview')?.content} 
              title={getHelpContent('dashboard-overview')?.title}
              position="right"
              className="ml-2 mt-1"
            />
          </div>
          <div className="mt-4 md:mt-0">
            {!isAdmin && isActive ? (
              <div className="bg-green-500/20 text-green-500 px-4 py-2 rounded-full border border-green-500/30 flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
                <span className="font-medium">Currently Working</span>
              </div>
            ) : !isAdmin ? (
              <Button asChild>
                <Link href="/tracker">
                  <Clock className="mr-2 h-4 w-4" />
                  Start Tracking
                </Link>
              </Button>
            ) : (
              <Button 
                asChild 
                className="bg-[#0F172A] text-white hover:bg-[#1E293B]"
                variant="secondary"
              >
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Show different content based on user role */}
      {isAdmin ? (
        <>
          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm text-card-title">Total Users</h3>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-card-text">{adminStats.userCount}</div>
                <div className="text-xs text-card-text mt-1">
                  All registered users
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm text-card-title">Active Users</h3>
                  <div className="h-8 w-8 rounded-full bg-indigo-400/10 flex items-center justify-center">
                    <Users className="h-4 w-4 text-indigo-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-card-text">{adminStats.activeUsers}</div>
                <div className="text-xs text-card-text mt-1">
                  Currently active
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm text-card-title">Total Sessions</h3>
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-card-text">{adminStats.sessionCount}</div>
                <div className="text-xs text-card-text mt-1">
                  Completed sessions
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm text-card-title">Total Time</h3>
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-green-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-card-text">{adminStats.totalTrackedTime}</div>
                <div className="text-xs text-card-text mt-1">
                  All user activity
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Admin Quick Access */}
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold text-card-title">Admin Tools</h2>
            <HelpBubble 
              content={getHelpContent('admin-overview')?.content} 
              title={getHelpContent('admin-overview')?.title}
              position="right"
              className="ml-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <Link href="/admin">
                <CardContent className="p-6 flex flex-col cursor-pointer h-full">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mb-2 text-card-title">User Management</CardTitle>
                  <p className="text-sm text-card-text flex-grow mb-4">
                    Manage users, view sessions, and monitor team productivity.
                  </p>
                  <div className="text-primary flex items-center text-sm font-medium">
                    Manage Users <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <Link href="/reports">
                <CardContent className="p-6 flex flex-col cursor-pointer h-full">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BarChart className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center mb-2">
                    <CardTitle className="text-card-title">Analytics</CardTitle>
                    <HelpBubble 
                      content={getHelpContent('analytics-usage')?.content} 
                      title={getHelpContent('analytics-usage')?.title}
                      position="top"
                      className="ml-1.5"
                    />
                  </div>
                  <p className="text-sm text-card-text flex-grow mb-4">
                    View organization-wide analytics and generate reports.
                  </p>
                  <div className="text-primary flex items-center text-sm font-medium">
                    View Analytics <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <Link href="/settings">
                <CardContent className="p-6 flex flex-col cursor-pointer h-full">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Download className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mb-2 text-card-title">Export Data</CardTitle>
                  <p className="text-sm text-card-text flex-grow mb-4">
                    Export organization data for reports and integration with other systems.
                  </p>
                  <div className="text-primary flex items-center text-sm font-medium">
                    Export Data <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Regular User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h3 className="font-medium text-sm text-card-title">Current Session</h3>
                    <HelpBubble 
                      content={getHelpContent('current-session')?.content} 
                      title={getHelpContent('current-session')?.title}
                      position="top"
                      className="ml-1.5"
                    />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-card-text">
                  {isActive ? formatDuration(activeSeconds) : 'Not tracking'}
                </div>
                {isActive && (
                  <div className="text-xs text-card-text mt-1">
                    Started at {new Date(currentSession?.startTime || '').toLocaleTimeString()}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm text-card-title">This Week</h3>
                  <div className="h-8 w-8 rounded-full bg-indigo-400/10 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-indigo-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-card-text">12h 45m</div>
                <div className="text-xs text-card-text mt-1">
                  8 sessions total
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-sm text-card-title">Average Daily</h3>
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <BarChart className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-card-text">4h 15m</div>
                <div className="text-xs text-card-text mt-1">
                  +12% from last week
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Regular User Feature Cards */}
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-bold text-card-title">Quick Access</h2>
            <HelpBubble 
              content={getHelpContent('dashboard-overview')?.content} 
              title={getHelpContent('dashboard-overview')?.title}
              position="right"
              className="ml-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <Link href="/tracker">
                <CardContent className="p-6 flex flex-col cursor-pointer h-full">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mb-2 text-card-title">Time Tracker</CardTitle>
                  <p className="text-sm text-card-text flex-grow mb-4">
                    Track your work sessions and monitor your productivity in real-time.
                  </p>
                  <div className="text-primary flex items-center text-sm font-medium">
                    Go to Tracker <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <Link href="/history">
                <CardContent className="p-6 flex flex-col cursor-pointer h-full">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <History className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center mb-2">
                    <CardTitle className="text-card-title">Session History</CardTitle>
                    <HelpBubble 
                      content={getHelpContent('history-filters')?.content} 
                      title={getHelpContent('history-filters')?.title}
                      position="top"
                      className="ml-1.5"
                    />
                  </div>
                  <p className="text-sm text-card-text flex-grow mb-4">
                    View your past work sessions and analyze your work patterns.
                  </p>
                  <div className="text-primary flex items-center text-sm font-medium">
                    View History <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>
            
            <Card className="border border-border shadow-md rounded-xl hover:shadow-lg transition-all duration-300 bg-card">
              <Link href="/settings">
                <CardContent className="p-6 flex flex-col cursor-pointer h-full">
                  <div className="mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mb-2 text-card-title">Preferences</CardTitle>
                  <p className="text-sm text-card-text flex-grow mb-4">
                    Customize your tracking settings and notification preferences.
                  </p>
                  <div className="text-primary flex items-center text-sm font-medium">
                    Change Settings <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
        </>
      )}
    </Layout>
  );
}