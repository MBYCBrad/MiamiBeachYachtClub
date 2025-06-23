import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { usePrefetchData } from "@/hooks/use-prefetch";
import { usePerformanceMonitor, preloadCriticalResources } from "@/hooks/use-performance-monitor";
import { useInstantCache } from "@/hooks/use-instant-cache";

import HomePage from "@/pages/home-page-new";
import AuthPage from "@/pages/auth-page";
import CalendarPage from "@/pages/calendar-page";
import YachtDetail from "@/pages/yacht-detail";
import YachtBooking from "@/pages/yacht-booking";
import ServiceDetail from "@/pages/service-detail";
import EventDetail from "@/pages/event-detail";
import EventsPage from "@/pages/events-page";
import CheckoutPage from "@/pages/checkout";
import AdminDashboard from "@/pages/admin-dashboard";
import YachtOwnerDashboard from "@/pages/yacht-owner-dashboard";
import ServiceProviderDashboard from "@/pages/service-provider-dashboard";
import CustomerServiceDashboard from "@/pages/customer-service-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/calendar" component={CalendarPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/yacht-owner" component={YachtOwnerDashboard} />
      <ProtectedRoute path="/service-provider" component={ServiceProviderDashboard} />
      <ProtectedRoute path="/customer-service" component={CustomerServiceDashboard} />
      <ProtectedRoute path="/events" component={() => <EventsPage currentView="events" setCurrentView={() => {}} />} />
      <ProtectedRoute path="/yachts/:id" component={YachtDetail} />
      <ProtectedRoute path="/yachts/:id/book" component={YachtBooking} />
      <ProtectedRoute path="/services/:id" component={ServiceDetail} />
      <ProtectedRoute path="/events/:id" component={EventDetail} />
      <ProtectedRoute path="/checkout" component={CheckoutPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  // Performance monitoring and optimization
  usePerformanceMonitor();
  usePrefetchData();
  useInstantCache();
  
  // Preload critical resources immediately and force dark mode
  useEffect(() => {
    preloadCriticalResources();
    // Force dark mode for MBYC application
    document.documentElement.classList.add('dark');
  }, []);
  
  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
