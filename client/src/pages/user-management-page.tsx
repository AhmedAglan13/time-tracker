import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Layout } from "@/components/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, Clock, Shield, UserIcon, Key,
  UserPlus, Trash2, UserCheck, UserX, Edit, MoreHorizontal 
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import type { User, Session } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Form schemas
const createUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["user", "admin"] as const)
});

// Define role type
type UserRole = "user" | "admin";

const updateRoleSchema = z.object({
  role: z.enum(["user", "admin"] as const)
});

type CreateUserFormValues = z.infer<typeof createUserSchema>;
type UpdateRoleFormValues = z.infer<typeof updateRoleSchema>;

// Reset password schema
const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function UserManagementPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedUserSessions, setSelectedUserSessions] = useState<Session[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showUpdateRoleDialog, setShowUpdateRoleDialog] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<UserRole | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError
  } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: user?.role?.toLowerCase() === "admin",
  });

  // Function to format duration from seconds
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Create user form
  const createUserForm = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      role: "user"
    }
  });

  // Update role form
  const updateRoleForm = useForm<UpdateRoleFormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      role: "user"
    }
  });
  
  // Reset password form
  const resetPasswordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserFormValues) => {
      const res = await apiRequest("POST", "/api/admin/users", userData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowCreateUserDialog(false);
      createUserForm.reset();
      toast({
        title: "Success",
        description: "User created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating user",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: UserRole }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}`, { role });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowUpdateRoleDialog(false);
      updateRoleForm.reset();
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${userId}`);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowDeleteConfirmDialog(false);
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting user",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: async ({ userId, password }: { userId: number; password: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/password`, { password });
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setShowResetPasswordDialog(false);
      resetPasswordForm.reset();
      toast({
        title: "Success",
        description: "User password has been reset successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error resetting password",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Create user handler
  const onCreateUserSubmit = (data: CreateUserFormValues) => {
    createUserMutation.mutate(data);
  };

  // Update role handler
  const onUpdateRoleSubmit = (data: UpdateRoleFormValues) => {
    if (selectedUserId) {
      updateRoleMutation.mutate({ userId: selectedUserId, role: data.role });
    }
  };

  // Delete user handler
  const onDeleteUser = () => {
    if (selectedUserId) {
      deleteUserMutation.mutate(selectedUserId);
    }
  };
  
  // Reset password handler
  const onResetPasswordSubmit = (data: ResetPasswordFormValues) => {
    if (selectedUserId) {
      resetPasswordMutation.mutate({ userId: selectedUserId, password: data.password });
    }
  };
  
  // Open reset password dialog
  const openResetPasswordDialog = (userId: number, username: string) => {
    setSelectedUserId(userId);
    setSelectedUsername(username);
    setShowResetPasswordDialog(true);
    resetPasswordForm.reset();
  };

  // Open update role dialog
  const openUpdateRoleDialog = (userId: number, currentRole: string) => {
    setSelectedUserId(userId);
    // Ensure currentRole is one of the valid roles before setting it
    const validRole: UserRole = currentRole.toLowerCase() === "admin" ? "admin" : "user";
    setSelectedUserRole(validRole);
    updateRoleForm.setValue("role", validRole);
    setShowUpdateRoleDialog(true);
  };

  // Open delete confirmation dialog
  const openDeleteConfirmDialog = (userId: number) => {
    setSelectedUserId(userId);
    setShowDeleteConfirmDialog(true);
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

  if (usersLoading) {
    return (
      <Layout title="User Management">
        <div className="flex justify-center items-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (usersError) {
    return (
      <Layout title="User Management">
        <div className="flex flex-col items-center justify-center h-[70vh]">
          <h2 className="text-2xl font-bold mb-4">Error Loading User Data</h2>
          <p className="text-muted-foreground mb-8">
            {(usersError as Error)?.message || "An unknown error occurred"}
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="User Management">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button 
          onClick={() => setShowCreateUserDialog(true)}
          className="bg-primary"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>
    
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
                users.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell>{userData.id}</TableCell>
                    <TableCell>{userData.username}</TableCell>
                    <TableCell>{userData.name}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        userData.role?.toLowerCase() === "admin" 
                          ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}>
                        {userData.role || "user"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => userData.id && getUserSessions(userData.id)}
                        >
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          Sessions
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => userData.id && userData.role && 
                                openUpdateRoleDialog(userData.id, userData.role)
                              }
                            >
                              <Edit className="h-3.5 w-3.5 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => userData.id && userData.username && 
                                openResetPasswordDialog(userData.id, userData.username)
                              }
                            >
                              <Key className="h-3.5 w-3.5 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600"
                              onClick={() => userData.id && 
                                openDeleteConfirmDialog(userData.id)
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
      
      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Add a new user to the Time Tracker application.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createUserForm}>
            <form onSubmit={createUserForm.handleSubmit(onCreateUserSubmit)} className="space-y-4">
              <FormField
                control={createUserForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createUserForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createUserForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createUserForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="user">Regular User</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                  className="w-full mt-4"
                >
                  {createUserMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    <>Create User</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Update Role Dialog */}
      <Dialog open={showUpdateRoleDialog} onOpenChange={setShowUpdateRoleDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for this user account.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...updateRoleForm}>
            <form onSubmit={updateRoleForm.handleSubmit(onUpdateRoleSubmit)} className="space-y-4">
              <FormField
                control={updateRoleForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="user">Regular User</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateRoleMutation.isPending}
                  className="w-full mt-4"
                >
                  {updateRoleMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Updating...</>
                  ) : (
                    <>Update Role</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirmDialog} onOpenChange={setShowDeleteConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</>
              ) : (
                <>Delete</>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Reset Password Dialog */}
      <Dialog open={showResetPasswordDialog} onOpenChange={setShowResetPasswordDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Reset password for user "{selectedUsername}".
            </DialogDescription>
          </DialogHeader>
          
          <Form {...resetPasswordForm}>
            <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
              <FormField
                control={resetPasswordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={resetPasswordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={resetPasswordMutation.isPending}
                  className="w-full mt-4"
                >
                  {resetPasswordMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetting...</>
                  ) : (
                    <>Reset Password</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}