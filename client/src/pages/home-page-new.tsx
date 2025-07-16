import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import BottomNavigation from '@/components/BottomNavigation';
import { motion } from 'framer-motion';
import { MemberThemeProvider } from '@/contexts/MemberThemeContext';

// Import original member pages
import MemberHome from '@/pages/member-home';
import MemberTrips from '@/pages/member-trips';
import MemberMessages from '@/pages/member-messages';
import MemberFavorites from '@/pages/member-favorites-new';
import MemberProfile from '@/pages/member-profile';
import SearchResults from '@/pages/search-results';
import EventsPage from '@/pages/events-page';
import MyEvents from '@/pages/my-events';
import MyServices from '@/pages/my-services';

// Import dashboard components for other roles
import YachtOwnerDashboard from '@/screens/YachtOwnerDashboard';
import ServiceProviderDashboard from '@/screens/ServiceProviderDashboard';
import AdminDashboard from '@/screens/AdminDashboard';

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState('explore');

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Loading...</div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  const renderContent = () => {
    switch (user.role) {
      case 'member':
        return (
          <MemberThemeProvider>
            {renderMemberContent()}
          </MemberThemeProvider>
        );
      case 'yacht_owner':
        // Instant client-side navigation to yacht owner dashboard
        setLocation('/yacht-owner');
        return null;
      case 'service_provider':
        // Instant client-side navigation to service provider dashboard
        setLocation('/service-provider');
        return null;
      case 'admin':
        // Instant client-side navigation to admin dashboard
        setLocation('/admin');
        return null;
      default:
        return (
          <MemberThemeProvider>
            {renderMemberContent()}
          </MemberThemeProvider>
        );
    }
  };

  const renderMemberContent = () => {
    switch (currentView) {
      case 'explore':
        return <MemberHome currentView={currentView} setCurrentView={setCurrentView} />;
      case 'trips':
        return <MemberTrips currentView={currentView} setCurrentView={setCurrentView} />;
      case 'favorites':
        return <MemberFavorites currentView={currentView} setCurrentView={setCurrentView} />;
      case 'events':
        return <MyEvents currentView={currentView} setCurrentView={setCurrentView} />;
      case 'services':
        return <MyServices currentView={currentView} setCurrentView={setCurrentView} />;
      case 'messages':
        return <MemberMessages currentView={currentView} setCurrentView={setCurrentView} />;
      case 'profile':
        return <MemberProfile currentView={currentView} setCurrentView={setCurrentView} />;
      case 'search-results':
        return <SearchResults currentView={currentView} setCurrentView={setCurrentView} />;
      default:
        return <MemberHome currentView={currentView} setCurrentView={setCurrentView} />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-black relative"
    >
      {/* Main Content */}
      <main className="relative z-10">
        {renderContent()}
      </main>

      {/* Bottom Navigation for Members */}
      {user.role === 'member' && (
        <BottomNavigation currentView={currentView} setCurrentView={setCurrentView} />
      )}
    </motion.div>
  );
}