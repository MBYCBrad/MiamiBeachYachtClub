import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  User, 
  Crown, 
  Trophy, 
  Star, 
  Calendar, 
  CreditCard, 
  Settings, 
  LogOut, 
  Heart,
  History,
  Gift,
  Shield,
  MapPin,
  Phone,
  Mail,
  Edit,
  ChevronRight
} from 'lucide-react';
import VideoBackground from '@/components/VideoBackground';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MemberProfileProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const membershipColors = {
  BRONZE: 'from-amber-600 to-amber-800',
  SILVER: 'from-gray-400 to-gray-600',
  GOLD: 'from-yellow-400 to-yellow-600',
  PLATINUM: 'from-purple-400 to-purple-600'
};

const membershipIcons = {
  BRONZE: Trophy,
  SILVER: Star,
  GOLD: Crown,
  PLATINUM: Crown
};

export default function MemberProfile({ currentView, setCurrentView }: MemberProfileProps) {
  const { user, logoutMutation } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
    setShowLogoutDialog(false);
  };

  const MembershipIcon = membershipIcons[user?.membershipTier as keyof typeof membershipIcons] || Trophy;

  const stats = [
    { label: 'Bookings', value: '12', icon: Calendar },
    { label: 'Favorites', value: '8', icon: Heart },
    { label: 'Reviews', value: '5.0', icon: Star },
    { label: 'Years Member', value: '2', icon: Trophy }
  ];

  const menuItems = [
    {
      icon: User,
      label: 'Personal Information',
      description: 'Update your profile details',
      action: () => {}
    },
    {
      icon: CreditCard,
      label: 'Payment Methods',
      description: 'Manage your payment options',
      action: () => {}
    },
    {
      icon: History,
      label: 'Booking History',
      description: 'View your past reservations',
      action: () => {}
    },
    {
      icon: Heart,
      label: 'Favorites',
      description: 'Your saved yachts and services',
      action: () => {}
    },
    {
      icon: Gift,
      label: 'Rewards & Offers',
      description: 'Exclusive member benefits',
      action: () => {}
    },
    {
      icon: Shield,
      label: 'Privacy & Security',
      description: 'Account security settings',
      action: () => {}
    },
    {
      icon: Settings,
      label: 'App Settings',
      description: 'Notifications and preferences',
      action: () => {}
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-auto pb-20">
      {/* Header with Video Background */}
      <div className="relative h-64 overflow-hidden">
        <VideoBackground showControls={false} overlay={false} />
        <div className={cn("absolute inset-0 bg-gradient-to-br", membershipColors[user?.membershipTier as keyof typeof membershipColors] || 'from-purple-600 to-blue-600')} />
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Profile Content */}
        <div className="relative h-full flex flex-col justify-end p-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-end gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <Avatar className="h-24 w-24 border-4 border-white/20 shadow-2xl">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="ghost"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </motion.div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-1"
                >
                  <MembershipIcon className="h-6 w-6 text-white" />
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    {user?.membershipTier}
                  </Badge>
                </motion.div>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Miami Beach, FL</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 -mt-8 relative z-10"
      >
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700/50 text-center hover:bg-gray-800/80 transition-all duration-300">
                  <CardContent className="p-4">
                    <Icon className="h-6 w-6 mx-auto mb-2 text-purple-400" />
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Membership Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-6 mt-8"
      >
        <Card className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Crown className="h-5 w-5 text-purple-400" />
              {user?.membershipTier} Member Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <div className="h-2 w-2 bg-purple-400 rounded-full" />
                Priority Booking
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="h-2 w-2 bg-purple-400 rounded-full" />
                Exclusive Events
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="h-2 w-2 bg-purple-400 rounded-full" />
                Concierge Service
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <div className="h-2 w-2 bg-purple-400 rounded-full" />
                Special Discounts
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Menu Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="px-6 mt-8 space-y-3"
      >
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <Card 
                className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer"
                onClick={item.action}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-600/20 rounded-lg">
                        <Icon className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{item.label}</h3>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="px-6 mt-8 mb-8"
      >
        <Button
          onClick={() => setShowLogoutDialog(true)}
          variant="outline"
          className="w-full bg-transparent border-red-600/50 text-red-400 hover:bg-red-600/10 hover:border-red-500 transition-all duration-300"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </motion.div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to sign out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}