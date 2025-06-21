import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import BottomNavigation from '@/components/BottomNavigation';
import { motion } from 'framer-motion';

// Import new pages
import YachtsPage from '@/pages/yachts-page';
import ServicesPage from '@/pages/services-page';
import EventsPage from '@/pages/events-page';
import MemberMessages from '@/pages/member-messages';
import MemberFavorites from '@/pages/member-favorites';
import MemberProfile from '@/pages/member-profile';

// Import dashboard components for other roles
import YachtOwnerDashboard from '@/screens/YachtOwnerDashboard';
import ServiceProviderDashboard from '@/screens/ServiceProviderDashboard';
import AdminDashboard from '@/screens/AdminDashboard';

export default function HomePage() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('yachts');

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  const renderContent = () => {
    switch (user.role) {
      case 'member':
        return renderMemberContent();
      case 'yacht_owner':
        return <YachtOwnerDashboard />;
      case 'service_provider':
        return <ServiceProviderDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return renderMemberContent();
    }
  };

  const renderMemberContent = () => {
    switch (currentView) {
      case 'yachts':
        return <YachtsPage currentView={currentView} setCurrentView={setCurrentView} />;
      case 'services':
        return <ServicesPage currentView={currentView} setCurrentView={setCurrentView} />;
      case 'events':
        return <EventsPage currentView={currentView} setCurrentView={setCurrentView} />;
      case 'messages':
        return <MemberMessages currentView={currentView} setCurrentView={setCurrentView} />;
      case 'favorites':
        return <MemberFavorites currentView={currentView} setCurrentView={setCurrentView} />;
      case 'profile':
        return <MemberProfile currentView={currentView} setCurrentView={setCurrentView} />;
      default:
        return <YachtsPage currentView={currentView} setCurrentView={setCurrentView} />;
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