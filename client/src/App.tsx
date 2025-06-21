import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";

import { BottomTabNavigator } from "@/navigation/BottomTabNavigator";
import { useState } from "react";
import AuthPage from "@/pages/auth-page";
import YachtDetail from "@/pages/yacht-detail";
import ServiceDetail from "@/pages/service-detail";
import EventDetail from "@/pages/event-detail";
import CheckoutPage from "@/pages/checkout";
import NotFound from "@/pages/not-found";

function Router() {
  const [activeTab, setActiveTab] = useState('bookings');

  return (
    <Switch>
      <ProtectedRoute path="/" component={() => (
        <BottomTabNavigator 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      )} />
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
