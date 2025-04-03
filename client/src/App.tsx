import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./hooks/use-auth";
import { SessionProvider } from "./hooks/use-session";
import { ProtectedRoute } from "./lib/protected-route";
import DashboardPage from "./pages/dashboard-page";
import TrackerPage from "./pages/tracker-page";
import AuthPage from "./pages/auth-page";
import HistoryPage from "./pages/history-page";
import ReportsPage from "./pages/reports-page";
import SettingsPage from "./pages/settings-page";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/tracker" component={TrackerPage} />
      <ProtectedRoute path="/history" component={HistoryPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
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
