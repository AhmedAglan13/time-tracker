import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

type AllowedRole = "admin" | "user" | "both";

export function RoleProtectedRoute({
  path,
  component: Component,
  allowedRole = "both",
}: {
  path: string;
  component: () => React.JSX.Element;
  allowedRole?: AllowedRole;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  // User not authenticated at all
  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Check role permissions
  const userRole = user.role?.toLowerCase() || "user";
  
  if (
    allowedRole === "both" ||
    (allowedRole === "admin" && userRole === "admin") ||
    (allowedRole === "user" && userRole === "user")
  ) {
    return <Route path={path}><Component /></Route>;
  }

  // Redirect to appropriate dashboard based on role
  return (
    <Route path={path}>
      <Redirect to="/" />
    </Route>
  );
}