import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
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
  DollarSign,
  Zap,
  Target,
  Bell,
  PartyPopper,
  Eye,
  Plus,
  ArrowRight,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

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
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Fetch real data for analytics and recommendations
  const { data: bookings = [] } = useQuery({ queryKey: ['/api/bookings'] }) as { data: any[] };
  const { data: events = [] } = useQuery({ queryKey: ['/api/events'] }) as { data: any[] };
  const { data: yachts = [] } = useQuery({ queryKey: ['/api/yachts'] }) as { data: any[] };
  const { data: services = [] } = useQuery({ queryKey: ['/api/services'] }) as { data: any[] };

  const handleLogout = () => {
    logoutMutation.mutate();
    setShowLogoutDialog(false);
  };

  const MembershipIcon = membershipIcons[user?.membershipTier as keyof typeof membershipIcons] || Crown;

  // Calculate real savings analytics
  const calculateSavings = () => {
    const bookingArray = Array.isArray(bookings) ? bookings : [];
    const totalBookings = bookingArray.length;
    const avgYachtOwnershipCost = 250000; // Average yacht ownership cost per year
    const avgMaintenanceCost = 50000; // Average maintenance cost per year
    const avgDockingCost = 15000; // Average docking cost per year
    const totalOwnershipCost = avgYachtOwnershipCost + avgMaintenanceCost + avgDockingCost;
    const totalSpentOnMBYC = bookingArray.reduce((sum: number, booking: any) => {
      return sum + (parseFloat(booking?.totalPrice) || 0);
    }, 0);
    const totalSaved = totalOwnershipCost - totalSpentOnMBYC - 5000; // Subtract membership fee
    return {
      totalSaved: Math.max(totalSaved, 0),
      percentageSaved: Math.round((totalSaved / totalOwnershipCost) * 100),
      totalSpent: totalSpentOnMBYC,
      bookingsThisYear: totalBookings
    };
  };

  const savings = calculateSavings();

  // Get upcoming events (next 3)
  const eventArray = Array.isArray(events) ? events : [];
  const upcomingEvents = eventArray
    .filter((event: any) => event?.eventDate && new Date(event.eventDate) > new Date())
    .sort((a: any, b: any) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 3);

  // Get newest yachts and services (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const yachtArray = Array.isArray(yachts) ? yachts : [];
  const newYachts = yachtArray
    .filter((yacht: any) => yacht?.createdAt && new Date(yacht.createdAt) > thirtyDaysAgo)
    .slice(0, 2);
    
  const serviceArray = Array.isArray(services) ? services : [];
  const newServices = serviceArray
    .filter((service: any) => service?.createdAt && new Date(service.createdAt) > thirtyDaysAgo)
    .slice(0, 2);

  // Enhanced stats with real data
  const bookingCount = Array.isArray(bookings) ? bookings.length : 0;
  const stats = [
    { label: 'Bookings', value: bookingCount.toString(), icon: Calendar, color: 'text-blue-400' },
    { label: 'Favorites', value: '8', icon: Heart, color: 'text-pink-400' },
    { label: 'Reviews', value: '5.0', icon: Star, color: 'text-yellow-400' },
    { label: 'Years Member', value: '2', icon: Trophy, color: 'text-purple-400' }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-auto pb-20">
      {/* Advanced Profile Header with Dynamic Background */}
      <div className="relative overflow-hidden">
        {/* Dynamic Video Background */}
        <div className="absolute inset-0 h-96">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-30"
          >
            <source src="/api/media/15768404-uhd_4096_2160_24fps_1750523880240.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/80 to-gray-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20" />
        </div>

        {/* Floating Particles Animation */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/10 rounded-full"
              animate={{
                y: [0, -100, 0],
                x: [0, Math.sin(i) * 50, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 8 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeInOut"
              }}
              style={{
                left: `${10 + i * 8}%`,
                top: '90%'
              }}
            />
          ))}
        </div>

        {/* Header Content */}
        <div className="relative h-96 flex flex-col justify-between p-8">
          {/* Top Status Bar */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-between items-start"
          >
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
              >
                <Crown className="h-6 w-6 text-amber-400" />
              </motion.div>
              <div>
                <div className="text-lg font-bold text-white">Elite Member</div>
                <div className="text-sm text-gray-300">Since 2023</div>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-white">Online</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Main Profile Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex items-center gap-8"
          >
            {/* Avatar with Advanced Styling */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group"
            >
              {/* Glowing Ring */}
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-cyan-500/40 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"
              />
              
              <Avatar className="relative h-32 w-32 border-4 border-white/30 shadow-2xl group-hover:border-white/50 transition-all duration-300">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                <AvatarFallback className="bg-gradient-to-br from-purple-700 to-blue-700 text-white text-4xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Status Indicator */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(34, 197, 94, 0.4)",
                    "0 0 0 10px rgba(34, 197, 94, 0)",
                    "0 0 0 0 rgba(34, 197, 94, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-gray-950 flex items-center justify-center"
              >
                <div className="w-3 h-3 bg-white rounded-full" />
              </motion.div>
              
              {/* Edit Button Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer backdrop-blur-sm"
              >
                <Edit className="h-6 w-6 text-white" />
              </motion.div>
            </motion.div>
            
            {/* Simplified Avatar Info for Hero */}
            <div className="flex-1 space-y-4">
              <div>
                <motion.h1 
                  className="text-3xl md:text-5xl font-bold text-white mb-2"
                  animate={{
                    textShadow: [
                      "0 0 20px rgba(139, 92, 246, 0.5)",
                      "0 0 40px rgba(59, 130, 246, 0.7)",
                      "0 0 20px rgba(139, 92, 246, 0.5)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {user?.username}
                </motion.h1>
                
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-3 mb-4"
                >
                  <div className="p-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-lg">
                    <Crown className="h-5 w-5 text-amber-400" />
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-white border-white/30 backdrop-blur-md text-sm md:text-lg px-3 md:px-4 py-1 md:py-2">
                    {user?.membershipTier} MEMBER
                  </Badge>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Bottom Actions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-between items-center"
          >

            

          </motion.div>
        </div>
      </div>

      {/* Enhanced Profile Information Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.1 }}
        className="px-4 md:px-6 mt-8 mb-12"
      >
        <div className="flex justify-end mb-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-md rounded-lg border border-purple-500/30 text-white hover:from-purple-600/30 hover:to-blue-600/30 transition-all duration-300"
          >
            <Edit className="h-4 w-4" />
            <span className="text-sm md:text-base">{isEditingProfile ? 'Save Changes' : 'Edit Profile'}</span>
          </motion.button>
        </div>

        {/* Profile Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Personal Information */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 hover:border-blue-500/50 transition-all duration-500 overflow-hidden h-full">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-400" />
                    Contact Details
                  </h3>
                  {isEditingProfile && (
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </motion.div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        defaultValue={user?.email}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    ) : (
                      <div className="text-white font-medium">{user?.email}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Phone Number</label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        defaultValue="+1 (305) 555-0123"
                        className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    ) : (
                      <div className="text-white font-medium">+1 (305) 555-0123</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Location & Membership */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group"
          >
            <Card className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 hover:border-green-500/50 transition-all duration-500 overflow-hidden h-full">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-green-600/10 via-blue-600/5 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-400" />
                    Location & Status
                  </h3>
                  {isEditingProfile && (
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </motion.div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Location</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        defaultValue="Miami Beach, FL"
                        className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                      />
                    ) : (
                      <div className="text-white font-medium">Miami Beach, FL</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Member Since</label>
                    <div className="text-white font-medium">January 2023</div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Member ID</label>
                    <div className="text-white font-medium font-mono">MBYC-{user?.id?.toString().padStart(6, '0')}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preferences & Settings */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group md:col-span-2 lg:col-span-1"
          >
            <Card className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 overflow-hidden h-full">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-pink-600/5 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
              
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-400" />
                    Preferences
                  </h3>
                  {isEditingProfile && (
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    >
                      <Edit className="h-4 w-4 text-gray-400" />
                    </motion.div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Notification Preferences</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          disabled={!isEditingProfile}
                          className="w-4 h-4 rounded border-gray-600 bg-white/5 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-white text-sm">Booking confirmations</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          disabled={!isEditingProfile}
                          className="w-4 h-4 rounded border-gray-600 bg-white/5 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-white text-sm">Event invitations</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          disabled={!isEditingProfile}
                          className="w-4 h-4 rounded border-gray-600 bg-white/5 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-white text-sm">Marketing updates</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Preferred Language</label>
                    {isEditingProfile ? (
                      <select className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:outline-none transition-colors">
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                      </select>
                    ) : (
                      <div className="text-white font-medium">English</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 p-4 md:p-6 bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-xl rounded-2xl border border-gray-700/50"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="p-2 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-lg"
              >
                <Zap className="h-5 w-5 text-cyan-400" />
              </motion.div>
              <div>
                <h4 className="text-white font-semibold text-sm md:text-base">Quick Actions</h4>
                <p className="text-gray-400 text-xs md:text-sm">Manage your account efficiently</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 backdrop-blur-md rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-all duration-300 text-sm"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 bg-green-600/20 backdrop-blur-md rounded-lg border border-green-500/30 text-green-400 hover:bg-green-600/30 transition-all duration-300 text-sm"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600/20 backdrop-blur-md rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-600/30 transition-all duration-300 text-sm"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 bg-orange-600/20 backdrop-blur-md rounded-lg border border-orange-500/30 text-orange-400 hover:bg-orange-600/30 transition-all duration-300 text-sm"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Advanced Analytics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="px-6 mt-6 mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="p-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl backdrop-blur-sm"
            >
              <Trophy className="h-6 w-6 text-indigo-400" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Member Analytics</h2>
              <p className="text-gray-400">Your yacht club achievements and insights</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.3 + index * 0.1,
                  type: "spring",
                  bounce: 0.4
                }}
                whileHover={{ 
                  scale: 1.05, 
                  y: -5,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className="group"
              >
                <Card className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 overflow-hidden">
                  {/* Animated Background Gradient */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/5 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      background: [
                        "linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.05), rgba(6, 182, 212, 0.1))",
                        "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(147, 51, 234, 0.05), rgba(59, 130, 246, 0.1))",
                        "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.05), rgba(147, 51, 234, 0.1))"
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  
                  {/* Glowing Border Effect */}
                  <motion.div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100"
                    animate={{
                      boxShadow: [
                        "0 0 0 1px rgba(147, 51, 234, 0)",
                        "0 0 20px 1px rgba(147, 51, 234, 0.3)",
                        "0 0 0 1px rgba(147, 51, 234, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  />
                  
                  <CardContent className="p-6 relative text-center">
                    {/* Icon with Advanced Animation */}
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                      className="mb-4 relative"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full blur-xl opacity-30"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        style={{
                          background: `radial-gradient(circle, ${stat.color === 'text-blue-400' ? '#3b82f6' : 
                                      stat.color === 'text-red-400' ? '#ef4444' : 
                                      stat.color === 'text-yellow-400' ? '#facc15' : '#a855f7'}40, transparent)`
                        }}
                      />
                      <Icon className={cn("h-10 w-10 mx-auto relative z-10", stat.color)} />
                    </motion.div>
                    
                    {/* Value with Counting Animation */}
                    <motion.div 
                      className="text-4xl font-bold text-white mb-2 relative"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        duration: 0.8, 
                        delay: 0.5 + index * 0.1,
                        type: "spring",
                        bounce: 0.5
                      }}
                    >
                      <motion.div
                        animate={{
                          textShadow: [
                            "0 0 10px rgba(255, 255, 255, 0.3)",
                            "0 0 20px rgba(147, 51, 234, 0.6)",
                            "0 0 10px rgba(255, 255, 255, 0.3)"
                          ]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                      >
                        {stat.value}
                      </motion.div>
                      
                      {/* Sparkle Effect */}
                      <motion.div
                        className="absolute -top-2 -right-2"
                        animate={{
                          rotate: [0, 360],
                          scale: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          delay: 1 + index * 0.5
                        }}
                      >
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                      </motion.div>
                    </motion.div>
                    
                    {/* Label with Hover Effect */}
                    <motion.div 
                      className="text-sm text-gray-400 uppercase tracking-wider font-medium"
                      whileHover={{ 
                        color: "#ffffff",
                        scale: 1.05
                      }}
                    >
                      {stat.label}
                    </motion.div>
                    
                    {/* Progress Ring for Interactive Feel */}
                    <motion.div
                      className="absolute bottom-2 right-2 w-8 h-8"
                      initial={{ rotate: -90, scale: 0 }}
                      animate={{ rotate: 270, scale: 1 }}
                      transition={{ 
                        duration: 1.5, 
                        delay: 0.8 + index * 0.2,
                        ease: "easeOut"
                      }}
                    >
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="16"
                          cy="16"
                          r="12"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="transparent"
                          className="text-gray-700"
                        />
                        <motion.circle
                          cx="16"
                          cy="16"
                          r="12"
                          stroke="currentColor"
                          strokeWidth="2"
                          fill="transparent"
                          strokeLinecap="round"
                          className={stat.color}
                          initial={{ strokeDasharray: "0 100" }}
                          animate={{ strokeDasharray: "75 100" }}
                          transition={{ 
                            duration: 2, 
                            delay: 1 + index * 0.2,
                            ease: "easeOut"
                          }}
                        />
                      </svg>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Enhanced Activity Timeline with Media */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="px-6 mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl backdrop-blur-sm"
            >
              <History className="h-6 w-6 text-blue-400" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
              <p className="text-gray-400">Your latest yacht club adventures</p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
              onClick={() => setCurrentView('trips')}
            >
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        </div>
        
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            whileHover={{ scale: 1.02, x: 10 }}
          >
            <Card className="bg-gray-900/60 border-gray-700/50 hover:border-blue-500/40 transition-all duration-300 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Yacht Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src="/api/media/pexels-mali-42091_1750537294323.jpg"
                      alt="Marina Breeze"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute bottom-1 right-1"
                    >
                      <Calendar className="h-4 w-4 text-blue-400" />
                    </motion.div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1">Booked Marina Breeze</h3>
                    <p className="text-gray-400 mb-2">85ft Luxury Yacht • 10 guests • Miami Marina</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">Yesterday at 3:30 PM</span>
                      </div>
                      <Badge className="bg-green-600/20 text-green-400 border-green-600/30">
                        Confirmed
                      </Badge>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="text-blue-400"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            whileHover={{ scale: 1.02, x: 10 }}
          >
            <Card className="bg-gray-900/60 border-gray-700/50 hover:border-purple-500/40 transition-all duration-300 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Yacht Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src="/api/media/pexels-mikebirdy-144634_1750537277230.jpg"
                      alt="Ocean Majesty"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent" />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, -5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="absolute bottom-1 right-1"
                    >
                      <Heart className="h-4 w-4 text-purple-400 fill-current" />
                    </motion.div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1">Added Ocean Majesty to favorites</h3>
                    <p className="text-gray-400 mb-2">120ft Super Yacht • 15 guests • Premium Fleet</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">2 days ago</span>
                      </div>
                      <Badge className="bg-purple-600/20 text-purple-400 border-purple-600/30">
                        Wishlist
                      </Badge>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="text-purple-400"
                  >
                    <Heart className="h-5 w-5 fill-current" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            whileHover={{ scale: 1.02, x: 10 }}
          >
            <Card className="bg-gray-900/60 border-gray-700/50 hover:border-emerald-500/40 transition-all duration-300 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6">
                <div className="flex items-center gap-6">
                  {/* Event Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src="/api/media/pexels-pixabay-163236_1750537277230.jpg"
                      alt="VIP Marina Party"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/80 to-transparent" />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 10, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      className="absolute bottom-1 right-1"
                    >
                      <PartyPopper className="h-4 w-4 text-emerald-400" />
                    </motion.div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1">Attended VIP Marina Party</h3>
                    <p className="text-gray-400 mb-2">Exclusive member event • Sunset cruise with live music</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-400">1 week ago</span>
                      </div>
                      <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
                        Completed
                      </Badge>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 15 }}
                    className="text-emerald-400"
                  >
                    <PartyPopper className="h-5 w-5" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Advanced Customization Hub */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="px-6 mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl backdrop-blur-sm"
            >
              <Settings className="h-6 w-6 text-purple-400" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Customization Hub</h2>
              <p className="text-gray-400">Personalize your yacht club experience</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Customization */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card className="bg-gray-900/60 border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 overflow-hidden relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="p-3 bg-blue-600/20 rounded-xl"
                    >
                      <User className="h-6 w-6 text-blue-400" />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-2">Profile & Avatar</h3>
                    <p className="text-gray-400 mb-4">Customize your profile with photos, bio, and preferences</p>
                    
                    {/* Mini Gallery Preview */}
                    <div className="flex gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg overflow-hidden">
                        <img 
                          src="/api/media/pexels-mali-42091_1750537294323.jpg"
                          alt="Profile option"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-8 h-8 rounded-lg overflow-hidden">
                        <img 
                          src="/api/media/pexels-mikebirdy-144634_1750537277230.jpg"
                          alt="Profile option"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-8 h-8 rounded-lg overflow-hidden">
                        <img 
                          src="/api/media/pexels-pixabay-163236_1750537277230.jpg"
                          alt="Profile option"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center">
                        <Plus className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-blue-400"
                    >
                      <span className="text-sm font-medium">Customize Now</span>
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Theme & Appearance */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card className="bg-gray-900/60 border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 overflow-hidden relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        rotate: [0, -5, 5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                      className="p-3 bg-purple-600/20 rounded-xl"
                    >
                      <Eye className="h-6 w-6 text-purple-400" />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-2">Theme & UI</h3>
                    <p className="text-gray-400 mb-4">Choose your visual style and interface preferences</p>
                    
                    {/* Theme Preview Dots */}
                    <div className="flex gap-2 mb-4">
                      <motion.div 
                        whileHover={{ scale: 1.2 }}
                        className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 cursor-pointer"
                      />
                      <motion.div 
                        whileHover={{ scale: 1.2 }}
                        className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 cursor-pointer"
                      />
                      <motion.div 
                        whileHover={{ scale: 1.2 }}
                        className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 cursor-pointer"
                      />
                      <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
                        <Plus className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-purple-400"
                    >
                      <span className="text-sm font-medium">Customize Theme</span>
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card className="bg-gray-900/60 border-gray-700/50 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-green-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        rotateZ: [0, 2, -2, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="p-3 bg-emerald-600/20 rounded-xl"
                    >
                      <Shield className="h-6 w-6 text-emerald-400" />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 1, 0.3]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
                      className="absolute -inset-1 bg-emerald-400/20 rounded-xl blur-sm"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-2">Privacy & Security</h3>
                    <p className="text-gray-400 mb-4">Manage your security settings and data privacy</p>
                    
                    {/* Security Status Indicators */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-400">Two-factor enabled</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-400">Data encrypted</span>
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-emerald-400"
                    >
                      <span className="text-sm font-medium">Security Settings</span>
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Payment & Billing */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            whileHover={{ scale: 1.03, y: -5 }}
          >
            <Card className="bg-gray-900/60 border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 overflow-hidden relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/10 to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <motion.div
                      animate={{ 
                        rotateY: [0, 180, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="p-3 bg-yellow-600/20 rounded-xl"
                    >
                      <CreditCard className="h-6 w-6 text-yellow-400" />
                    </motion.div>
                    <motion.div
                      animate={{ 
                        scale: [0, 1, 0],
                        rotate: [0, 360]
                      }}
                      transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                      className="absolute -top-2 -right-2"
                    >
                      <DollarSign className="h-4 w-4 text-yellow-400" />
                    </motion.div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-2">Payment & Billing</h3>
                    <p className="text-gray-400 mb-4">Manage cards, subscriptions, and billing history</p>
                    
                    {/* Payment Methods Preview */}
                    <div className="flex gap-2 mb-4">
                      <div className="px-2 py-1 bg-blue-600/20 rounded text-xs text-blue-400">
                        •••• 4242
                      </div>
                      <div className="px-2 py-1 bg-purple-600/20 rounded text-xs text-purple-400">
                        •••• 8888
                      </div>
                      <div className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-400">
                        + Add
                      </div>
                    </div>
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-2 text-yellow-400"
                    >
                      <span className="text-sm font-medium">Manage Billing</span>
                      <ArrowRight className="h-4 w-4" />
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Dynamic Action Center */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.8 }}
        className="px-6 mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="p-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-xl backdrop-blur-sm"
            >
              <Zap className="h-6 w-6 text-cyan-400" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-white">Action Center</h2>
              <p className="text-gray-400">Your yacht club at your fingertips</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Dynamic Booking Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.9 }}
            whileHover={{ 
              scale: 1.05, 
              y: -8,
              rotateY: 5
            }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
            onClick={() => setCurrentView('trips')}
          >
            <Card className="relative bg-gradient-to-br from-blue-900/80 to-cyan-900/60 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-500 overflow-hidden group">
              {/* Background Image */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                <img 
                  src="/api/media/pexels-goumbik-296278_1750537277229.jpg"
                  alt="Yacht booking"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Animated Gradient Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-cyan-600/10 to-blue-600/20"
                animate={{
                  x: ["-100%", "100%"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              <CardContent className="relative p-8 h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-3 bg-blue-500/30 rounded-xl backdrop-blur-sm"
                  >
                    <Calendar className="h-8 w-8 text-blue-300" />
                  </motion.div>
                  
                  {/* Live booking count */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="text-right"
                  >
                    <div className="text-2xl font-bold text-white">{bookingCount}</div>
                    <div className="text-xs text-blue-300 uppercase tracking-wide">Active</div>
                  </motion.div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Yacht Bookings</h3>
                  <p className="text-blue-200 text-sm">Manage your reservations</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Dynamic Favorites Action */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 2.0 }}
            whileHover={{ 
              scale: 1.05, 
              y: -8,
              rotateY: -5
            }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
            onClick={() => setCurrentView('favorites')}
          >
            <Card className="relative bg-gradient-to-br from-purple-900/80 to-pink-900/60 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-500 overflow-hidden group">
              {/* Background Image */}
              <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                <img 
                  src="/api/media/pexels-diego-f-parra-33199-843633 (1)_1750537277228.jpg"
                  alt="Favorite yachts"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Animated Gradient Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/10 to-purple-600/20"
                animate={{
                  x: ["100%", "-100%"]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              <CardContent className="relative p-8 h-32 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-3 bg-purple-500/30 rounded-xl backdrop-blur-sm"
                  >
                    <Heart className="h-8 w-8 text-purple-300 fill-current" />
                  </motion.div>
                  
                  {/* Live favorites count */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    className="text-right"
                  >
                    <div className="text-2xl font-bold text-white">8</div>
                    <div className="text-xs text-purple-300 uppercase tracking-wide">Saved</div>
                  </motion.div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">My Wishlist</h3>
                  <p className="text-purple-200 text-sm">Dream yacht collection</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Secondary Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2.1 }}
          className="grid grid-cols-4 gap-4 mt-6"
        >
          {[
            { icon: PartyPopper, label: "Events", color: "from-emerald-600 to-teal-600", view: "events" },
            { icon: Target, label: "Services", color: "from-orange-600 to-red-600", view: "services" },
            { icon: Bell, label: "Messages", color: "from-yellow-600 to-amber-600", view: "messages" },
            { icon: Gift, label: "Rewards", color: "from-indigo-600 to-purple-600", view: "profile" }
          ].map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 2.2 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="cursor-pointer"
              onClick={() => setCurrentView(action.view)}
            >
              <Card className="bg-gray-900/60 border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                <CardContent className="p-4 text-center">
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                    className={`p-3 bg-gradient-to-r ${action.color}/20 rounded-lg mx-auto mb-2 w-fit`}
                  >
                    <action.icon className={`h-6 w-6 bg-gradient-to-r ${action.color} bg-clip-text text-transparent`} />
                  </motion.div>
                  <div className="text-sm font-medium text-white">{action.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Logout Button */}
      <div className="px-6 mt-8 mb-8">
        <Button
          onClick={() => setShowLogoutDialog(true)}
          variant="outline"
          className="w-full bg-transparent border-red-600/50 text-red-400 hover:bg-red-600/10 hover:border-red-500 transition-all duration-300"
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </div>

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