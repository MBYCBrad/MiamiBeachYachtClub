import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

// Role-based dashboard routing component
function RoleBasedDashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect to="/auth" />;
  }

  // Role-based dashboard routing
  switch (user.role) {
    case 'admin':
      return <Redirect to="/admin" />;
    case 'yacht_owner':
      return <Redirect to="/yacht-owner" />;
    case 'service_provider':
      return <Redirect to="/service-provider" />;
    case 'member':
      return <Redirect to="/" />;
    default:
      // Handle staff roles (any role starting with "Staff" or containing "Coordinator")
      if (user.role?.startsWith('Staff') || user.role?.includes('Coordinator')) {
        return <Redirect to="/staff" />;
      }
      return <Redirect to="/" />;
  }
}

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
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

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  // For root path, do role-based routing
  if (path === "/") {
    return (
      <Route path={path}>
        <RoleBasedDashboard />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}
