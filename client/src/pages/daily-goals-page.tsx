import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { DailyGoal } from "@shared/schema";
import { useSession } from "@/hooks/use-session";
import { CheckCircle2, Edit, Plus, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTimeTheme } from "@/components/time-theme-provider";
import { Checkbox } from "@/components/ui/checkbox";

export default function DailyGoalsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { timePeriod, colorScheme } = useTimeTheme();
  const { currentSession } = useSession();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<DailyGoal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    priority: 0,
    completed: false,
    sessionId: currentSession?.id || null
  });

  // Query to fetch daily goals
  const { data: dailyGoals = [], isLoading } = useQuery<DailyGoal[]>({
    queryKey: ['/api/daily-goals'],
    staleTime: 30000,
  });

  // Create a new daily goal
  const createGoalMutation = useMutation({
    mutationFn: async (goal: typeof newGoal) => {
      const res = await apiRequest("POST", "/api/daily-goals", goal);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-goals'] });
      toast({
        title: "Goal Created",
        description: "Your daily goal has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      resetNewGoalForm();
    },
    onError: (error) => {
      toast({
        title: "Error Creating Goal",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update a daily goal
  const updateGoalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<DailyGoal> }) => {
      const res = await apiRequest("PATCH", `/api/daily-goals/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-goals'] });
      toast({
        title: "Goal Updated",
        description: "Your goal has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingGoal(null);
    },
    onError: (error) => {
      toast({
        title: "Error Updating Goal",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete a daily goal
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/daily-goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/daily-goals'] });
      toast({
        title: "Goal Deleted",
        description: "Your goal has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Goal",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle completion status
  const toggleGoalCompletion = (goal: DailyGoal) => {
    updateGoalMutation.mutate({
      id: goal.id,
      data: { completed: !goal.completed }
    });
  };

  // Handle form submission for creating a new goal
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    createGoalMutation.mutate(newGoal);
  };

  // Handle form submission for updating a goal
  const handleUpdateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoal) return;

    const updatedData = {
      title: editingGoal.title,
      description: editingGoal.description,
      priority: editingGoal.priority,
      completed: editingGoal.completed,
      sessionId: editingGoal.sessionId
    };

    updateGoalMutation.mutate({
      id: editingGoal.id,
      data: updatedData
    });
  };

  // Reset form for new goal
  const resetNewGoalForm = () => {
    setNewGoal({
      title: "",
      description: "",
      priority: 0,
      completed: false,
      sessionId: currentSession?.id || null
    });
  };

  // Open edit dialog with goal data
  const openEditDialog = (goal: DailyGoal) => {
    setEditingGoal({
      ...goal,
    });
    setIsEditDialogOpen(true);
  };

  // Filter goals by completion status
  const completedGoals = dailyGoals.filter(goal => goal.completed);
  const pendingGoals = dailyGoals.filter(goal => !goal.completed);

  // Sort goals by priority (High to Low)
  const sortedPendingGoals = [...pendingGoals].sort((a, b) => {
    const aPriority = a.priority ?? 0;
    const bPriority = b.priority ?? 0;
    return bPriority - aPriority;
  });

  // Get priority label
  const getPriorityLabel = (priority: number | null) => {
    switch (priority) {
      case 2: return "High";
      case 1: return "Medium";
      case 0:
      default: return "Low";
    }
  };

  // Get priority color
  const getPriorityColor = (priority: number | null) => {
    switch (priority) {
      case 2: return "text-red-500";
      case 1: return "text-amber-500";
      case 0:
      default: return "text-blue-500";
    }
  };

  return (
    <Layout title="Daily Goals">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Daily Goals</h1>
            <p className="text-muted-foreground">
              Track your daily objectives and stay focused on what matters.
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full md:w-auto"
            style={{ backgroundColor: colorScheme.primary }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Goal
          </Button>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Pending Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Today's Goals</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {format(new Date(), "EEEE, MMMM do")}
                  </span>
                </CardTitle>
                <CardDescription>
                  {sortedPendingGoals.length ? 
                    `You have ${sortedPendingGoals.length} pending goals.` : 
                    "No pending goals for today."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : sortedPendingGoals.length > 0 ? (
                  <div className="space-y-4">
                    {sortedPendingGoals.map((goal) => (
                      <div 
                        key={goal.id}
                        className="p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <button
                            onClick={() => toggleGoalCompletion(goal)}
                            className="mt-1 flex-shrink-0 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-primary"
                            style={{ color: colorScheme.primary }}
                          >
                            <div className="h-5 w-5 border-2 rounded-full flex items-center justify-center">
                              {goal.completed && <CheckCircle2 className="h-4 w-4" />}
                            </div>
                          </button>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-lg">
                                {goal.title}
                              </h4>
                              <div className="flex gap-2 ml-2">
                                <Button
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openEditDialog(goal)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost" 
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => deleteGoalMutation.mutate(goal.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground">
                                {goal.description}
                              </p>
                            )}
                            <div className="flex items-center text-sm">
                              <span className={cn("font-medium", getPriorityColor(goal.priority))}>
                                {getPriorityLabel(goal.priority)} Priority
                              </span>
                              {goal.sessionId && (
                                <span className="ml-3 text-muted-foreground">
                                  • Linked to active session
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleGoalCompletion(goal)}
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Complete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No pending goals for today</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add a goal
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Completed Goals</CardTitle>
                  <CardDescription>
                    You've completed {completedGoals.length} goals today.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {completedGoals.map((goal) => (
                      <div 
                        key={goal.id}
                        className="p-3 rounded-lg border bg-muted/50 flex items-start gap-3"
                      >
                        <div 
                          className="mt-1 h-5 w-5 rounded-full flex items-center justify-center text-primary"
                          style={{ color: colorScheme.primary }}
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium line-through text-muted-foreground">
                              {goal.title}
                            </h4>
                            <Button
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => toggleGoalCompletion(goal)}
                            >
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          {goal.description && (
                            <p className="text-sm line-through text-muted-foreground">
                              {goal.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
                <CardDescription>Your goal completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completed</span>
                      <span className="font-medium">{completedGoals.length} of {dailyGoals.length}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: dailyGoals.length > 0 ? `${(completedGoals.length / dailyGoals.length) * 100}%` : '0%',
                          backgroundColor: colorScheme.primary
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Goals by Priority</h4>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-red-500">High Priority</span>
                        <span>{dailyGoals.filter(g => g.priority === 2).length}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-amber-500">Medium Priority</span>
                        <span>{dailyGoals.filter(g => g.priority === 1).length}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-blue-500">Low Priority</span>
                        <span>{dailyGoals.filter(g => g.priority === 0).length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center pt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add New Goal
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription>
              Add a new goal to track for today.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGoal}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="Enter your goal"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newGoal.description || ""}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Add more details about this goal"
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label>Priority Level</Label>
                <RadioGroup 
                  value={String(newGoal.priority)} 
                  onValueChange={(value) => setNewGoal({ ...newGoal, priority: parseInt(value) })}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="priority-high" />
                    <Label htmlFor="priority-high" className="font-normal text-red-500">High Priority</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="priority-medium" />
                    <Label htmlFor="priority-medium" className="font-normal text-amber-500">Medium Priority</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="priority-low" />
                    <Label htmlFor="priority-low" className="font-normal text-blue-500">Low Priority</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="link-session"
                  checked={!!newGoal.sessionId}
                  onCheckedChange={(checked) => 
                    setNewGoal({ 
                      ...newGoal, 
                      sessionId: checked ? currentSession?.id || null : null 
                    })
                  }
                  disabled={!currentSession}
                />
                <Label htmlFor="link-session" className="text-sm font-normal">
                  Link to current session {!currentSession && "(No active session)"}
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Goal</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>
              Make changes to your goal.
            </DialogDescription>
          </DialogHeader>
          {editingGoal && (
            <form onSubmit={handleUpdateGoal}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Goal Title</Label>
                  <Input
                    id="edit-title"
                    value={editingGoal.title}
                    onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                    placeholder="Enter your goal"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description (optional)</Label>
                  <Textarea
                    id="edit-description"
                    value={editingGoal.description || ""}
                    onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                    placeholder="Add more details about this goal"
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Priority Level</Label>
                  <RadioGroup 
                    value={String(editingGoal.priority ?? 0)} 
                    onValueChange={(value) => setEditingGoal({ ...editingGoal, priority: parseInt(value) })}
                    className="flex flex-col gap-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="edit-priority-high" />
                      <Label htmlFor="edit-priority-high" className="font-normal text-red-500">High Priority</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="edit-priority-medium" />
                      <Label htmlFor="edit-priority-medium" className="font-normal text-amber-500">Medium Priority</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="0" id="edit-priority-low" />
                      <Label htmlFor="edit-priority-low" className="font-normal text-blue-500">Low Priority</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-completed"
                    checked={editingGoal.completed || false}
                    onCheckedChange={(checked) => 
                      setEditingGoal({ 
                        ...editingGoal, 
                        completed: !!checked
                      })
                    }
                  />
                  <Label htmlFor="edit-completed" className="text-sm font-normal">
                    Mark as completed
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-link-session"
                    checked={!!editingGoal.sessionId}
                    onCheckedChange={(checked) => 
                      setEditingGoal({ 
                        ...editingGoal, 
                        sessionId: checked ? currentSession?.id || null : null 
                      })
                    }
                    disabled={!currentSession}
                  />
                  <Label htmlFor="edit-link-session" className="text-sm font-normal">
                    Link to current session {!currentSession && "(No active session)"}
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingGoal(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}