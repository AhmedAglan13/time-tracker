import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./hooks/use-auth";
import { SessionProvider } from "./hooks/use-session";
import { ProtectedRoute } from "./lib/protected-route";
import DashboardPage from "./pages/dashboard-page";
import AuthPage from "./pages/auth-page";
import HistoryPage from "./pages/history-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/tracker" component={DashboardPage} /> {/* Reusing Dashboard for now */}
      <ProtectedRoute path="/history" component={HistoryPage} />
      <ProtectedRoute path="/reports" component={NotFound} /> {/* Placeholder for future Reports page */}
      <ProtectedRoute path="/settings" component={NotFound} /> {/* Placeholder for future Settings page */}
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SessionProvider>
          <Router />
          <Toaster />
        </SessionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
