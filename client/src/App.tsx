import React, { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { usePrefetchData } from "@/hooks/use-prefetch";
import { usePerformanceMonitor, preloadCriticalResources } from "@/hooks/use-performance-monitor";
import { useInstantCache } from "@/hooks/use-instant-cache";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { Loader2 } from "lucide-react";
import { LoadingScreen } from "@/components/loading-screen";

import HomePage from "@/pages/home-page-new";
import AuthPage from "@/pages/auth-page";
import CalendarPage from "@/pages/calendar-page";
import YachtDetail from "@/pages/yacht-detail";
import YachtBooking from "@/pages/yacht-booking";
import ServiceDetail from "@/pages/service-detail";
import EventDetail from "@/pages/event-detail";
import CheckoutPage from "@/pages/checkout";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminApplications from "@/pages/admin-applications";
import AdminSettings from "@/pages/admin-settings";
import YachtOwnerDashboard from "@/pages/yacht-owner-dashboard";
import YachtOwnerCalendar from "@/pages/yacht-owner-calendar";
import ServiceProviderDashboard from "@/pages/service-provider-dashboard";
import CustomerServiceDashboard from "@/pages/customer-service-dashboard";
import StaffManagement from "@/pages/staff-management";
import YachtMaintenance from "@/pages/yacht-maintenance";
import StaffPortal from "@/pages/staff-portal";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing-page";
import HowItWorks from "@/pages/how-it-works";
import PricingPage from "@/pages/pricing";
import EventsPage from "@/pages/events";
import ServicesPage from "@/pages/services";
import FleetPage from "@/pages/fleet";
import BookTourPage from "@/pages/book-tour";
import FAQPage from "@/pages/faq";
import InvestPage from "@/pages/invest";
import YachtPartnerPage from "@/pages/yacht-partner";
import ServicePartnerPage from "@/pages/service-partner";
import EventPartnerPage from "@/pages/event-partner";
import ContactPage from "@/pages/contact";
import MessagesPage from "@/pages/messages-page";
import PrivacyPolicy from "@/pages/privacy-policy";

// Basic fallback - sophisticated 3D loading screen is in components/loading-screen.tsx

function Router() {
  // Scroll to top on route changes
  useScrollToTop();
  
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/home" component={LandingPage} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/services" component={ServicesPage} />
      <Route path="/fleet" component={FleetPage} />
      <Route path="/book-tour" component={BookTourPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/partner" component={InvestPage} />
      <Route path="/partner/yacht" component={YachtPartnerPage} />
      <Route path="/partner/service" component={ServicePartnerPage} />
      <Route path="/partner/event" component={EventPartnerPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/privacy" component={PrivacyPolicy} />
      <ProtectedRoute path="/member" component={HomePage} />
      <ProtectedRoute path="/messages" component={MessagesPage} />
      <ProtectedRoute path="/calendar" component={CalendarPage} />
      <ProtectedRoute path="/admin" component={AdminDashboard} />
      <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} />
      <ProtectedRoute path="/admin/applications" component={AdminApplications} />
      <ProtectedRoute path="/admin/settings" component={AdminSettings} />
      <ProtectedRoute path="/admin/staff-management" component={StaffManagement} />
      <ProtectedRoute path="/admin/yacht-maintenance" component={YachtMaintenance} />
      <ProtectedRoute path="/staff" component={StaffPortal} />
      <ProtectedRoute path="/staff-portal" component={StaffPortal} />
      <ProtectedRoute path="/yacht-owner" component={YachtOwnerDashboard} />
      <ProtectedRoute path="/yacht-owner-calendar" component={YachtOwnerCalendar} />
      <ProtectedRoute path="/service-provider" component={ServiceProviderDashboard} />
      <ProtectedRoute path="/customer-service" component={CustomerServiceDashboard} />
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
  
  // Preload critical resources immediately and force dark mode with black background
  useEffect(() => {
    preloadCriticalResources();
    // Force dark mode and black background for MBYC application
    document.documentElement.classList.add('dark');
    document.body.style.backgroundColor = '#000000';
    document.documentElement.style.backgroundColor = '#000000';
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
