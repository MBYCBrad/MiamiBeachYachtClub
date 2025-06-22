import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import HomePage from "@/pages/home-page-new";
import AuthPage from "@/pages/auth-page";
import YachtDetail from "@/pages/yacht-detail";
import YachtSearch from "@/pages/yacht-search";
import ServiceDetail from "@/pages/service-detail";
import EventDetail from "@/pages/event-detail";
import EventsPage from "@/pages/events-page";
import CheckoutPage from "@/pages/checkout";
import AdminDashboard from "@/pages/admin-dashboard";
import YachtOwnerDashboard from "@/pages/yacht-owner-dashboard";
import ServiceProviderDashboard from "@/pages/service-provider-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/yacht-owner" component={YachtOwnerDashboard} />
      <ProtectedRoute path="/service-provider" component={ServiceProviderDashboard} />
      <ProtectedRoute path="/yacht-search" component={YachtSearch} />
      <ProtectedRoute path="/yacht/:id" component={YachtDetail} />
      <ProtectedRoute path="/events" component={() => <EventsPage currentView="events" setCurrentView={() => {}} />} />
      <ProtectedRoute path="/yachts/:id" component={YachtDetail} />
      <ProtectedRoute path="/services/:id" component={ServiceDetail} />
      <ProtectedRoute path="/events/:id" component={EventDetail} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
