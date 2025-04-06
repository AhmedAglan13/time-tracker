import { useState } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { SaveIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifyOnIdle, setNotifyOnIdle] = useState(true);
  const [notifyOnSession, setNotifyOnSession] = useState(true);
  const [idleThreshold, setIdleThreshold] = useState(5);
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your settings have been successfully updated."
    });
  };
  
  return (
    <Layout title="Settings">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account preferences and application settings.
          </p>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account details and personal information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={user?.username} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user?.name} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Job Title / Role</Label>
                  <Input id="role" defaultValue={user?.role || "Developer"} />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="idle-notifications">Idle Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when you've been idle for too long
                    </p>
                  </div>
                  <Switch 
                    id="idle-notifications" 
                    checked={notifyOnIdle}
                    onCheckedChange={setNotifyOnIdle}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="session-notifications">Session Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when a session is started or completed
                    </p>
                  </div>
                  <Switch 
                    id="session-notifications" 
                    checked={notifyOnSession}
                    onCheckedChange={setNotifyOnSession}
                  />
                </div>
                
                <div className="pt-2">
                  <Label htmlFor="idle-threshold">Idle Threshold (Minutes)</Label>
                  <div className="flex mt-2 space-x-4">
                    <Input 
                      id="idle-threshold" 
                      type="number" 
                      min={1} 
                      max={60} 
                      value={idleThreshold}
                      onChange={(e) => setIdleThreshold(parseInt(e.target.value))}
                    />
                    <Button onClick={() => setIdleThreshold(5)}>Reset</Button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground flex items-center">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Tracking pauses after this many minutes of inactivity
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Manage your password and account security.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>
                </div>
                <div className="flex items-center pt-2">
                  <div className="flex h-2 w-full rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <div className="bg-green-500 h-full w-1/2"></div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-3">Medium</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>
                  <SaveIcon className="mr-2 h-4 w-4" />
                  Update Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}