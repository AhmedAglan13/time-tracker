import { useState } from "react";
import { useSession } from "@/hooks/use-session";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { format, addHours, parse } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { TimeBlock } from "@shared/schema";
import { CalendarIcon, Clock, Edit, Plus, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimeTheme } from "@/components/time-theme-provider";

export default function TimeBlocksPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { timePeriod, colorScheme } = useTimeTheme();
  const { currentSession } = useSession();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [editingTimeBlock, setEditingTimeBlock] = useState<TimeBlock | null>(null);
  const [newTimeBlock, setNewTimeBlock] = useState({
    title: "",
    description: "",
    startTime: new Date(),
    endTime: addHours(new Date(), 1),
    color: colorScheme.primary,
    completed: false,
    sessionId: currentSession?.id || null
  });

  // Query to fetch time blocks
  const { data: timeBlocks = [], isLoading } = useQuery<TimeBlock[]>({
    queryKey: ['/api/time-blocks'],
    staleTime: 30000,
  });

  // Create a new time block
  const createTimeBlockMutation = useMutation({
    mutationFn: async (timeBlock: typeof newTimeBlock) => {
      const res = await apiRequest("POST", "/api/time-blocks", timeBlock);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-blocks'] });
      toast({
        title: "Time Block Created",
        description: "Your time block has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      resetNewTimeBlockForm();
    },
    onError: (error) => {
      toast({
        title: "Error Creating Time Block",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update a time block
  const updateTimeBlockMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<TimeBlock> }) => {
      const res = await apiRequest("PATCH", `/api/time-blocks/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-blocks'] });
      toast({
        title: "Time Block Updated",
        description: "Your time block has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setEditingTimeBlock(null);
    },
    onError: (error) => {
      toast({
        title: "Error Updating Time Block",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete a time block
  const deleteTimeBlockMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/time-blocks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-blocks'] });
      toast({
        title: "Time Block Deleted",
        description: "Your time block has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Time Block",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle completion status
  const toggleTimeBlockCompletion = (timeBlock: TimeBlock) => {
    updateTimeBlockMutation.mutate({
      id: timeBlock.id,
      data: { completed: !timeBlock.completed }
    });
  };

  // Handle form submission for creating a new time block
  const handleCreateTimeBlock = (e: React.FormEvent) => {
    e.preventDefault();
    createTimeBlockMutation.mutate(newTimeBlock);
  };

  // Handle form submission for updating a time block
  const handleUpdateTimeBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTimeBlock) return;

    const updatedData = {
      title: editingTimeBlock.title,
      description: editingTimeBlock.description,
      startTime: editingTimeBlock.startTime,
      endTime: editingTimeBlock.endTime,
      color: editingTimeBlock.color,
      completed: editingTimeBlock.completed,
      sessionId: editingTimeBlock.sessionId
    };

    updateTimeBlockMutation.mutate({
      id: editingTimeBlock.id,
      data: updatedData
    });
  };

  // Reset form for new time block
  const resetNewTimeBlockForm = () => {
    setNewTimeBlock({
      title: "",
      description: "",
      startTime: new Date(),
      endTime: addHours(new Date(), 1),
      color: colorScheme.primary,
      completed: false,
      sessionId: currentSession?.id || null
    });
  };

  // Open edit dialog with time block data
  const openEditDialog = (timeBlock: TimeBlock) => {
    setEditingTimeBlock({
      ...timeBlock,
      startTime: new Date(timeBlock.startTime),
      endTime: new Date(timeBlock.endTime)
    });
    setIsEditDialogOpen(true);
  };

  // Format time for display
  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "h:mm a");
  };

  // Filter time blocks for today
  const todaysTimeBlocks = timeBlocks.filter(block => {
    const blockDate = new Date(block.startTime);
    const today = new Date();
    return (
      blockDate.getDate() === today.getDate() &&
      blockDate.getMonth() === today.getMonth() &&
      blockDate.getFullYear() === today.getFullYear()
    );
  });

  // Filter time blocks for the selected date
  const selectedDateTimeBlocks = date ? timeBlocks.filter(block => {
    const blockDate = new Date(block.startTime);
    return (
      blockDate.getDate() === date.getDate() &&
      blockDate.getMonth() === date.getMonth() &&
      blockDate.getFullYear() === date.getFullYear()
    );
  }) : [];

  return (
    <Layout title="Time Blocks">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Time Blocks</h1>
            <p className="text-muted-foreground">
              Plan and organize your time with focused blocks of work.
            </p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full md:w-auto"
            style={{ backgroundColor: colorScheme.primary }}
          >
            <Plus className="mr-2 h-4 w-4" /> Create Time Block
          </Button>
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Today's Time Blocks</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {format(new Date(), "EEEE, MMMM do")}
                  </span>
                </CardTitle>
                <CardDescription>
                  {todaysTimeBlocks.length ? 
                    `You have ${todaysTimeBlocks.length} time blocks scheduled for today.` : 
                    "No time blocks scheduled for today."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : todaysTimeBlocks.length > 0 ? (
                  <div className="space-y-4">
                    {todaysTimeBlocks.map((block) => (
                      <div 
                        key={block.id}
                        className={cn(
                          "p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                          block.completed ? "bg-muted/50" : "bg-card"
                        )}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div 
                            className="w-3 h-12 rounded-full mt-1" 
                            style={{ backgroundColor: block.color || colorScheme.primary }}
                          />
                          <div className="space-y-1 flex-1">
                            <div className="flex items-start justify-between">
                              <h4 className={cn(
                                "font-medium text-lg", 
                                block.completed && "line-through text-muted-foreground"
                              )}>
                                {block.title}
                              </h4>
                              <div className="flex gap-2 ml-2">
                                <Button
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openEditDialog(block)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost" 
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => deleteTimeBlockMutation.mutate(block.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {block.description && (
                              <p className={cn(
                                "text-sm text-muted-foreground",
                                block.completed && "line-through"
                              )}>
                                {block.description}
                              </p>
                            )}
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(block.startTime)} - {formatTime(block.endTime)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Switch
                            checked={block.completed || false}
                            onCheckedChange={() => toggleTimeBlockCompletion(block)}
                            style={block.completed ? undefined : { backgroundColor: colorScheme.primary }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No time blocks for today</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add a time block
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedDateTimeBlocks.length > 0 && date && !isSameDay(date, new Date()) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Time Blocks for {format(date, "MMMM do")}</span>
                  </CardTitle>
                  <CardDescription>
                    {selectedDateTimeBlocks.length} time blocks scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedDateTimeBlocks.map((block) => (
                      <div 
                        key={block.id}
                        className={cn(
                          "p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                          block.completed ? "bg-muted/50" : "bg-card"
                        )}
                      >
                        <div className="flex items-start gap-3 flex-1">
                          <div 
                            className="w-3 h-12 rounded-full mt-1" 
                            style={{ backgroundColor: block.color || colorScheme.primary }}
                          />
                          <div className="space-y-1 flex-1">
                            <div className="flex items-start justify-between">
                              <h4 className={cn(
                                "font-medium text-lg", 
                                block.completed && "line-through text-muted-foreground"
                              )}>
                                {block.title}
                              </h4>
                              <div className="flex gap-2 ml-2">
                                <Button
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openEditDialog(block)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost" 
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => deleteTimeBlockMutation.mutate(block.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {block.description && (
                              <p className={cn(
                                "text-sm text-muted-foreground",
                                block.completed && "line-through"
                              )}>
                                {block.description}
                              </p>
                            )}
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(block.startTime)} - {formatTime(block.endTime)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Switch
                            checked={block.completed || false}
                            onCheckedChange={() => toggleTimeBlockCompletion(block)}
                            style={block.completed ? undefined : { backgroundColor: colorScheme.primary }}
                          />
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
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select a date to view time blocks</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Time Block Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Time Block</DialogTitle>
            <DialogDescription>
              Plan a focused block of time for your work.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTimeBlock}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTimeBlock.title}
                  onChange={(e) => setNewTimeBlock({ ...newTimeBlock, title: e.target.value })}
                  placeholder="Enter a title for your time block"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={newTimeBlock.description || ""}
                  onChange={(e) => setNewTimeBlock({ ...newTimeBlock, description: e.target.value })}
                  placeholder="Add more details about what you'll work on"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Start Time</Label>
                  <div className="flex">
                    <Input
                      type="time"
                      value={format(newTimeBlock.startTime, "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":");
                        const newDate = new Date(newTimeBlock.startTime);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setNewTimeBlock({ ...newTimeBlock, startTime: newDate });
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>End Time</Label>
                  <div className="flex">
                    <Input
                      type="time"
                      value={format(newTimeBlock.endTime, "HH:mm")}
                      onChange={(e) => {
                        const [hours, minutes] = e.target.value.split(":");
                        const newDate = new Date(newTimeBlock.endTime);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setNewTimeBlock({ ...newTimeBlock, endTime: newDate });
                      }}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(newTimeBlock.startTime, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newTimeBlock.startTime}
                      onSelect={(date) => {
                        if (!date) return;
                        
                        // Keep the time but change the date
                        const newStartDate = new Date(date);
                        newStartDate.setHours(
                          newTimeBlock.startTime.getHours(),
                          newTimeBlock.startTime.getMinutes()
                        );
                        
                        const newEndDate = new Date(date);
                        newEndDate.setHours(
                          newTimeBlock.endTime.getHours(),
                          newTimeBlock.endTime.getMinutes()
                        );
                        
                        setNewTimeBlock({
                          ...newTimeBlock,
                          startTime: newStartDate,
                          endTime: newEndDate
                        });
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  {['#4f46e5', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-all",
                        newTimeBlock.color === color ? "border-primary scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewTimeBlock({ ...newTimeBlock, color })}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="link-session"
                  checked={!!newTimeBlock.sessionId}
                  onCheckedChange={(checked) => 
                    setNewTimeBlock({ 
                      ...newTimeBlock, 
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
              <Button type="submit">Create Time Block</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Time Block Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Time Block</DialogTitle>
            <DialogDescription>
              Make changes to your time block.
            </DialogDescription>
          </DialogHeader>
          {editingTimeBlock && (
            <form onSubmit={handleUpdateTimeBlock}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingTimeBlock.title}
                    onChange={(e) => setEditingTimeBlock({ ...editingTimeBlock, title: e.target.value })}
                    placeholder="Enter a title for your time block"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description (optional)</Label>
                  <Textarea
                    id="edit-description"
                    value={editingTimeBlock.description || ""}
                    onChange={(e) => setEditingTimeBlock({ ...editingTimeBlock, description: e.target.value })}
                    placeholder="Add more details about what you'll work on"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Time</Label>
                    <div className="flex">
                      <Input
                        type="time"
                        value={format(new Date(editingTimeBlock.startTime), "HH:mm")}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(editingTimeBlock.startTime);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setEditingTimeBlock({ ...editingTimeBlock, startTime: newDate });
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>End Time</Label>
                    <div className="flex">
                      <Input
                        type="time"
                        value={format(new Date(editingTimeBlock.endTime), "HH:mm")}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(":");
                          const newDate = new Date(editingTimeBlock.endTime);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setEditingTimeBlock({ ...editingTimeBlock, endTime: newDate });
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(new Date(editingTimeBlock.startTime), "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={new Date(editingTimeBlock.startTime)}
                        onSelect={(date) => {
                          if (!date) return;
                          
                          // Keep the time but change the date
                          const newStartDate = new Date(date);
                          const currentStart = new Date(editingTimeBlock.startTime);
                          newStartDate.setHours(
                            currentStart.getHours(),
                            currentStart.getMinutes()
                          );
                          
                          const newEndDate = new Date(date);
                          const currentEnd = new Date(editingTimeBlock.endTime);
                          newEndDate.setHours(
                            currentEnd.getHours(),
                            currentEnd.getMinutes()
                          );
                          
                          setEditingTimeBlock({
                            ...editingTimeBlock,
                            startTime: newStartDate,
                            endTime: newEndDate
                          });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {['#4f46e5', '#16a34a', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          editingTimeBlock.color === color ? "border-primary scale-110" : "border-transparent"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditingTimeBlock({ ...editingTimeBlock, color })}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="edit-completed"
                    checked={editingTimeBlock.completed || false}
                    onCheckedChange={(checked) => 
                      setEditingTimeBlock({ 
                        ...editingTimeBlock, 
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
                    checked={!!editingTimeBlock.sessionId}
                    onCheckedChange={(checked) => 
                      setEditingTimeBlock({ 
                        ...editingTimeBlock, 
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
                    setEditingTimeBlock(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

// Helper function to check if two dates are the same day
function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}