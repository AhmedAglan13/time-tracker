import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "./hooks/use-auth";
import { SessionProvider } from "./hooks/use-session";
import { TimeThemeProvider } from "./components/time-theme-provider";
import { ProtectedRoute } from "./lib/protected-route";
import { RoleProtectedRoute } from "./lib/role-protected-route";
import DashboardPage from "./pages/dashboard-page";
import TrackerPage from "./pages/tracker-page";
import AuthPage from "./pages/auth-page";
import HistoryPage from "./pages/history-page";
import ReportsPage from "./pages/reports-page";
import SettingsPage from "./pages/settings-page";
import AdminDashboard from "./pages/admin-dashboard";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={DashboardPage} />
      {/* Time tracking features only available to regular users */}
      <RoleProtectedRoute path="/tracker" component={TrackerPage} allowedRole="user" />
      <RoleProtectedRoute path="/history" component={HistoryPage} allowedRole="user" />
      <RoleProtectedRoute path="/reports" component={ReportsPage} allowedRole="both" />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      {/* Admin dashboard only available to admin users */}
      <RoleProtectedRoute path="/admin" component={AdminDashboard} allowedRole="admin" />
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
          <TimeThemeProvider>
            <Router />
            <Toaster />
          </TimeThemeProvider>
        </SessionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
