import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@shared/schema';
import MemberDashboard from '@/screens/MemberDashboard';
import YachtOwnerDashboard from '@/screens/YachtOwnerDashboard';
import ServiceProviderDashboard from '@/screens/ServiceProviderDashboard';
import AdminDashboard from '@/screens/AdminDashboard';
import { Loader2 } from 'lucide-react';

const RoleBasedNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-white text-lg">Loading Miami Beach Yacht Club...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Auth will redirect to login
  }

  // Role-based dashboard routing
  switch (user.role) {
    case UserRole.MEMBER:
      return <MemberDashboard />;
    
    case UserRole.YACHT_OWNER:
      return <YachtOwnerDashboard />;
    
    case UserRole.SERVICE_PROVIDER:
      return <ServiceProviderDashboard />;
    
    case UserRole.ADMIN:
      return <AdminDashboard />;
    
    default:
      return <MemberDashboard />; // Default fallback
  }
};

export default RoleBasedNavigator;