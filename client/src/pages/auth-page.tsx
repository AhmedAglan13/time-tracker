import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Keyboard, Sparkles, Clock3 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema
const registerSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Redirect to="/" />;
  }
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      role: "DevOps Engineer",
    },
  });
  
  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };
  
  // Handle registration form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Hero Section */}
      <div className="md:w-1/2 bg-primary/10 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <Clock3 className="h-10 w-10 text-primary mr-3 animate-pulse" />
            <h1 className="text-4xl font-bold">Time <span className="text-primary font-extrabold">Tracker</span></h1>
          </div>
          
          <div className="bg-card rounded-xl p-6 shadow-lg border-2 border-primary/20 mb-8">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Track Your Time, Boost Productivity!</h2>
            <div className="flex justify-center mt-4">
              <Button variant="outline" className="rounded-full px-6 border-2 border-primary/30 hover:bg-primary/20">
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg shadow-md border border-primary/20 hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 text-primary mx-auto mb-2">
                <Keyboard className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-center">Track Activity</h3>
            </div>
            
            <div className="bg-card p-4 rounded-lg shadow-md border border-primary/20 hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 text-primary mx-auto mb-2">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-center">Save Time</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Forms */}
      <div className="md:w-1/2 p-8 flex items-center justify-center bg-gradient-to-br from-background to-background/80">
        <Card className="w-full max-w-md border-2 border-primary/20 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Welcome! 👋</CardTitle>
            <CardDescription>
              Sign in or create a new account
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 mx-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardContent>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="username" className="border-primary/20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" className="border-primary/20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full font-semibold text-md rounded-lg" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="register">
              <CardContent>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" className="border-primary/20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johnsmith" className="border-primary/20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" className="border-primary/20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="DevOps Engineer" className="border-primary/20" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full font-semibold text-md rounded-lg" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <CardFooter className="flex justify-center pt-2 pb-4">
            <p className="text-xs text-primary/70 text-center font-medium">
              Start tracking your time today! ✨
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
