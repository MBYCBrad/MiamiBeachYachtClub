import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // Role-based routing: redirect users to their appropriate dashboards
  if (path === "/" && user.role) {
    if (user.role === "admin") {
      return (
        <Route path={path}>
          <Redirect to="/admin" />
        </Route>
      );
    }
    if (user.role === "yacht_owner") {
      return (
        <Route path={path}>
          <Redirect to="/yacht-owner" />
        </Route>
      );
    }
    if (user.role === "service_provider") {
      return (
        <Route path={path}>
          <Redirect to="/service-provider" />
        </Route>
      );
    }
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}
