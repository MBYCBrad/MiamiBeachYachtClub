import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { motion } from 'framer-motion';
import { Phone, Users, Calendar, MessageSquare, Clock, Settings, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerServiceDashboard from './customer-service-dashboard';
import { useLocation } from 'wouter';

interface StaffDashboardProps {}

const StaffDashboard: React.FC<StaffDashboardProps> = () => {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState('customer-service');

  // Role-based navigation based on staff permissions
  const getStaffNavigation = () => {
    const permissions = user?.permissions || [];
    const navigation = [];

    // Customer Service permissions
    if (permissions.includes('customer_service') || permissions.includes('phone_calls')) {
      navigation.push({
        id: 'customer-service',
        label: 'Customer Service',
        icon: Phone,
        color: 'from-green-500 to-emerald-500'
      });
    }

    // User Management permissions
    if (permissions.includes('user_management')) {
      navigation.push({
        id: 'users',
        label: 'User Management',
        icon: Users,
        color: 'from-blue-500 to-cyan-500'
      });
    }

    // Booking Management permissions
    if (permissions.includes('bookings') || permissions.includes('booking_management')) {
      navigation.push({
        id: 'bookings',
        label: 'Booking Management',
        icon: Calendar,
        color: 'from-purple-500 to-indigo-500'
      });
    }

    // Services Management permissions
    if (permissions.includes('services')) {
      navigation.push({
        id: 'services',
        label: 'Services Management',
        icon: Settings,
        color: 'from-orange-500 to-red-500'
      });
    }

    // Events Management permissions
    if (permissions.includes('events')) {
      navigation.push({
        id: 'events',
        label: 'Events Management',
        icon: Calendar,
        color: 'from-violet-500 to-purple-500'
      });
    }

    // Analytics permissions
    if (permissions.includes('analytics')) {
      navigation.push({
        id: 'analytics',
        label: 'Analytics',
        icon: MessageSquare,
        color: 'from-pink-500 to-rose-500'
      });
    }

    // Always include profile and settings
    navigation.push(
      {
        id: 'profile',
        label: 'My Profile',
        icon: User,
        color: 'from-gray-500 to-slate-500'
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        color: 'from-gray-500 to-slate-500'
      }
    );

    return navigation;
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const sidebarItems = getStaffNavigation();

  const renderContent = () => {
    switch (activeSection) {
      case 'customer-service':
        return <CustomerServiceDashboard />;
      case 'profile':
        return (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-white mb-4">Staff Profile</h1>
            <p className="text-gray-400">Profile management for staff members</p>
          </div>
        );
      case 'settings':
        return (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-white mb-4">Staff Settings</h1>
            <p className="text-gray-400">Settings and preferences</p>
          </div>
        );
      default:
        return (
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-white mb-4">Coming Soon</h1>
            <p className="text-gray-400">This section is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex h-screen overflow-hidden">
        {/* Staff Sidebar */}
        <motion.div
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 30 }}
          className="w-80 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col"
        >
          {/* Logo */}
          <div className="p-6 border-b border-gray-700/50">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center space-x-3"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <img 
                  src="/api/media/MBYC-LOGO-WHITE_1750688569645.png" 
                  alt="MBYC Logo" 
                  className="w-8 h-8 object-contain"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Staff Portal</h2>
                <p className="text-sm text-gray-400">Miami Beach Yacht Club</p>
              </div>
            </motion.div>
          </div>

          {/* Staff Info */}
          <div className="p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase() || 'S'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{user?.username || 'Staff User'}</p>
                <p className="text-xs text-gray-400">{user?.role || 'Staff Member'}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-2">
              {sidebarItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                        : 'text-gray-400 hover:bg-gradient-to-r hover:from-green-600 hover:to-emerald-600 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-700/50'} transition-all duration-300`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* Logout */}
          <div className="p-6 border-t border-gray-700/50">
            <Button
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {logoutMutation.isPending ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;