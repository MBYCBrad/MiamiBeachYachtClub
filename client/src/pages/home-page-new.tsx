import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import BottomNavigation from '@/components/BottomNavigation';
import { motion } from 'framer-motion';

// Import original member pages
import MemberHome from '@/pages/member-home';
import MemberTrips from '@/pages/member-trips';
import MemberMessages from '@/pages/member-messages';
import MemberFavorites from '@/pages/member-favorites-new';
import MemberProfile from '@/pages/member-profile';
import SearchResults from '@/pages/search-results';
import EventsPage from '@/pages/events-page';

// Import dashboard components for other roles
import YachtOwnerDashboard from '@/screens/YachtOwnerDashboard';
import ServiceProviderDashboard from '@/screens/ServiceProviderDashboard';
import AdminDashboard from '@/screens/AdminDashboard';

export default function HomePage() {
  const { user } = useAuth();
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
        return renderMemberContent();
      case 'yacht_owner':
        // Redirect yacht owner users to the new yacht owner dashboard
        window.location.href = '/yacht-owner';
        return null;
      case 'service_provider':
        // Redirect service provider users to the new service provider dashboard
        window.location.href = '/service-provider';
        return null;
      case 'admin':
        // Redirect admin users to the new admin dashboard
        window.location.href = '/admin';
        return null;
      default:
        return renderMemberContent();
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