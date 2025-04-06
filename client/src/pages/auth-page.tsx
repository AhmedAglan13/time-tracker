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
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation, isLoading, error } = useAuth();
  
  // Add debug logging
  useEffect(() => {
    console.log("Auth context state:", { user, isLoading, error });
    
    if (error) {
      console.error("Auth error:", error);
    }
    
    if (loginMutation.isError) {
      console.error("Login error:", loginMutation.error);
    }
    
    if (registerMutation.isError) {
      console.error("Register error:", registerMutation.error);
    }
  }, [user, isLoading, error, loginMutation.isError, registerMutation.isError, loginMutation.error, registerMutation.error]);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "testuser",
      password: "testpass",
    },
  });
  
  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
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

  // Redirect to dashboard if user is logged in
  if (user) {
    console.log("User is logged in, redirecting to dashboard:", user);
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Hero Section */}
      <div className="md:w-1/2 bg-blue-50 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <Clock3 className="h-10 w-10 text-blue-600 mr-3 animate-pulse" />
            <h1 className="text-4xl font-bold text-gray-800">Time <span className="text-blue-600 font-extrabold">Tracker</span></h1>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-200 mb-8">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">Track Your Time, Boost Productivity!</h2>
            <div className="flex justify-center mt-4">
              <Button variant="outline" className="rounded-full px-6 border-2 border-blue-300 hover:bg-blue-50 text-blue-700">
                Learn More
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-md border border-blue-100 hover:border-blue-300 transition-all duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mx-auto mb-2">
                <Keyboard className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-center text-gray-800">Track Activity</h3>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md border border-blue-100 hover:border-blue-300 transition-all duration-300">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 mx-auto mb-2">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-center text-gray-800">Save Time</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Forms */}
      <div className="md:w-1/2 p-8 flex items-center justify-center bg-white">
        <Card className="w-full max-w-md border border-blue-200 shadow-xl rounded-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-3xl font-bold text-gray-800">Welcome! 👋</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Sign in or create a new account
            </CardDescription>
          </CardHeader>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4 mx-8 bg-blue-50">
              <TabsTrigger value="login" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Login</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardContent>
                <div className="bg-blue-50 mb-6 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700 font-medium">
                    <strong>Demo Account:</strong> Use <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-700 font-bold">testuser</code> with password <code className="bg-blue-100 px-1.5 py-0.5 rounded text-blue-700 font-bold">testpass</code>
                  </p>
                </div>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="username" 
                              className="border-gray-300 focus:border-blue-500 bg-white text-gray-800" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                console.log("Username field changed:", e.target.value);
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              className="border-gray-300 focus:border-blue-500 bg-white text-gray-800" 
                              {...field} 
                              onChange={(e) => {
                                field.onChange(e);
                                console.log("Password field changed:", e.target.value.replace(/./g, '*'));
                              }}
                            />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full font-semibold text-base rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md py-6" 
                      disabled={loginMutation.isPending}
                      onClick={() => {
                        console.log("Login form submitted with:", {
                          username: loginForm.getValues().username,
                          password: loginForm.getValues().password.replace(/./g, '*')
                        });
                      }}
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
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" className="border-gray-300 focus:border-blue-500 bg-white text-gray-800" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Username</FormLabel>
                          <FormControl>
                            <Input placeholder="johnsmith" className="border-gray-300 focus:border-blue-500 bg-white text-gray-800" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" className="border-gray-300 focus:border-blue-500 bg-white text-gray-800" {...field} />
                          </FormControl>
                          <FormMessage className="text-red-500" />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full font-semibold text-base rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md py-6" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </TabsContent>
          </Tabs>
          
          <CardFooter className="flex justify-center pt-4 pb-6">
            <p className="text-sm text-blue-600 text-center font-medium">
              Start tracking your time today! ✨
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
