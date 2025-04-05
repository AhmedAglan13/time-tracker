import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { Loader2, UserPlus, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { User, Session } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedUserSessions, setSelectedUserSessions] = useState<Session[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.role?.toLowerCase() === "admin",
  });

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

  // Get user sessions
  const getUserSessions = async (userId: number): Promise<void> => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/sessions`);
      if (!response.ok) throw new Error("Failed to fetch user sessions");
      
      const sessions = await response.json();
      setSelectedUserSessions(sessions);
      setShowSessions(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user sessions",
        variant: "destructive",
      });
    }
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

  if (usersLoading || analyticsLoading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (usersError || analyticsError) {
    return (
      <Layout title="Admin Dashboard">
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h2 className="text-2xl font-bold mb-4">Error Loading Admin Data</h2>
          <p className="text-muted-foreground mb-8">
            {(usersError as Error)?.message || (analyticsError as Error)?.message || "An unknown error occurred"}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.userCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.sessionCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{analytics?.activeUsers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Active Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics ? formatDuration(analytics.totalActiveTime) : "00:00:00"}
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users && users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        user.role?.toLowerCase() === "admin" 
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}>
                        {user.role || "user"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => user.id && getUserSessions(user.id)}
                      >
                        View Sessions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Session Dialog */}
      <Dialog open={showSessions} onOpenChange={setShowSessions}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Sessions</DialogTitle>
            <DialogDescription>
              Viewing all tracked time sessions for this user
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Active Duration</TableHead>
                  <TableHead>Total Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedUserSessions.length > 0 ? (
                  selectedUserSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>{session.id}</TableCell>
                      <TableCell>{new Date(session.startTime).toLocaleString()}</TableCell>
                      <TableCell>
                        {session.endTime 
                          ? new Date(session.endTime).toLocaleString() 
                          : "Active"}
                      </TableCell>
                      <TableCell>{formatDuration(session.activeDuration || 0)}</TableCell>
                      <TableCell>{formatDuration(session.totalDuration || 0)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4">
                      No sessions found for this user
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <DialogClose asChild>
            <Button variant="outline" className="mt-4">Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}