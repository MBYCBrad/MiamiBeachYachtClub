import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut, User, Anchor } from 'lucide-react';
import NotificationCenter from '@/components/NotificationCenter';

const AppHeader: React.FC = () => {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'yacht_owner':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'service_provider':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'yacht_owner':
        return 'Yacht Owner';
      case 'service_provider':
        return 'Service Provider';
      case 'admin':
        return 'Admin';
      default:
        return 'Member';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img 
              src="/attached_assets/MBYC-LOGO-WHITE_1750687226929.png"
              alt="Miami Beach Yacht Club"
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">MBYC</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Miami Beach Yacht Club</p>
            </div>
          </div>
        </div>

        {/* User Info and Actions */}
        <div className="flex items-center gap-4">
          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.username}
                </span>
                <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              {user.membershipTier && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.membershipTier.charAt(0).toUpperCase() + user.membershipTier.slice(1)} Member
                </div>
              )}
            </div>
            <div className="profile-picture-outline w-8 h-8">
              <div className="profile-picture-inner w-full h-full">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notification Center */}
          <NotificationCenter />

          {/* Logout Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;