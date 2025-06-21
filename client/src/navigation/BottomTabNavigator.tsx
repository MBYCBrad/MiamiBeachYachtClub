import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@shared/schema';
import { Anchor, CalendarDays, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

interface BottomTabNavigatorProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Import role-based dashboard components
import SimpleMemberDashboard from '@/screens/SimpleMemberDashboard';
import YachtOwnerDashboard from '@/screens/YachtOwnerDashboard';
import ServiceProviderDashboard from '@/screens/ServiceProviderDashboard';
import AdminDashboard from '@/screens/AdminDashboard';

export const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const { user } = useAuth();

  if (!user) return null;

  // Define tabs based on user role with role-specific content
  const getTabsForRole = () => {
    const baseTabs: TabItem[] = [
      {
        key: 'bookings',
        label: 'Bookings',
        icon: Anchor,
        component: user.role === UserRole.YACHT_OWNER ? YachtOwnerDashboard :
                  user.role === UserRole.ADMIN ? AdminDashboard :
                  SimpleMemberDashboard
      },
      {
        key: 'services',
        label: 'Services',
        icon: Sparkles,
        component: user.role === UserRole.SERVICE_PROVIDER ? ServiceProviderDashboard :
                  user.role === UserRole.ADMIN ? AdminDashboard :
                  SimpleMemberDashboard
      },
      {
        key: 'experiences',
        label: 'Experiences',
        icon: CalendarDays,
        component: user.role === UserRole.ADMIN ? AdminDashboard :
                  SimpleMemberDashboard
      }
    ];

    return baseTabs;
  };

  const tabs = getTabsForRole();
  const ActiveComponent = tabs.find(tab => tab.key === activeTab)?.component || SimpleMemberDashboard;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <ActiveComponent />
      </div>

      {/* Bottom Navigation Bar - Airbnb Style */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-t border-purple-500/20">
        <div className="flex items-center justify-around h-20 px-4 max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 transition-all duration-300",
                  isActive 
                    ? "text-purple-400" 
                    : "text-gray-400 hover:text-purple-300"
                )}
              >
                <div className={cn(
                  "relative p-2 rounded-full transition-all duration-300",
                  isActive && "bg-purple-500/20 shadow-lg shadow-purple-500/25"
                )}>
                  <Icon className={cn(
                    "w-6 h-6 transition-all duration-300",
                    isActive && "scale-110"
                  )} />
                  
                  {/* Active indicator glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-purple-400/30 blur-sm animate-pulse" />
                  )}
                </div>
                
                <span className={cn(
                  "text-xs font-medium mt-1 transition-all duration-300",
                  isActive ? "text-purple-400 scale-105" : "text-gray-400"
                )}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};