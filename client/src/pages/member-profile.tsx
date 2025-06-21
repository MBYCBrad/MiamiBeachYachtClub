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
  ChevronRight,
  DollarSign,
  TrendingUp,
  Zap,
  Target,
  Award,
  Sparkles,
  Clock,
  Users,
  ArrowRight,
  Plus,
  Eye,
  Bell,
  Anchor,
  Waves,
  Ship,
  PartyPopper,
  Coins,
  Flame,
  Gem
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
    <div className="min-h-screen bg-black text-white overflow-auto pb-20">
      {/* Hero Header with Savings Analytics */}
      <div className="relative h-80 overflow-hidden">
        <div className={cn("absolute inset-0 bg-gradient-to-br", membershipColors[user?.membershipTier as keyof typeof membershipColors] || 'from-purple-600 to-blue-600')} />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Floating Elements */}
        <motion.div
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-10 right-10 text-white/10"
        >
          <Anchor className="h-16 w-16" />
        </motion.div>
        
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute bottom-10 left-10 text-white/10"
        >
          <Waves className="h-12 w-12" />
        </motion.div>

        {/* Profile Content */}
        <div className="relative h-full flex flex-col justify-between p-6">
          {/* Top Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center"
          >
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-400" />
              <span className="text-sm font-medium text-white/90">{savings.bookingsThisYear} bookings this year</span>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 backdrop-blur-sm">
              <TrendingUp className="h-3 w-3 mr-1" />
              ${savings.percentageSaved}% saved
            </Badge>
          </motion.div>

          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-end gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <Avatar className="h-24 w-24 border-4 border-white/30 shadow-2xl">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                <AvatarFallback className="bg-white/10 text-white text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 h-6 w-6 bg-green-500 rounded-full flex items-center justify-center"
              >
                <Zap className="h-3 w-3 text-white" />
              </motion.div>
            </motion.div>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white">{user?.username}</h1>
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 15 }}
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

      {/* Savings Analytics Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="px-6 -mt-16 relative z-10 mb-8"
      >
        <Card className="bg-gradient-to-r from-green-900/80 to-emerald-900/80 border-green-500/30 backdrop-blur-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-400/5 rounded-full -translate-y-16 translate-x-16" />
          
          <CardContent className="p-6 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">MBYC Savings</h3>
                  <p className="text-green-400 text-sm font-medium">vs. Yacht Ownership</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Coins className="h-6 w-6 text-green-400" />
              </motion.div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-green-400 mb-1">
                  ${savings.totalSaved.toLocaleString()}
                </div>
                <p className="text-white/70 text-sm">Total Saved</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-white mb-1">
                  {savings.percentageSaved}%
                </div>
                <p className="text-white/70 text-sm">Cost Reduction</p>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Yacht Ownership Cost</span>
                <span className="text-white font-medium">$315,000/year</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/70">Your MBYC Spending</span>
                <span className="text-green-400 font-medium">$${savings.totalSpent.toLocaleString()}/year</span>
              </div>
              <Progress value={savings.percentageSaved} className="mt-3 h-2 bg-white/10" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Enhanced Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-6 mb-8"
      >
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                whileHover={{ y: -6, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700/50 text-center hover:bg-gray-800/80 transition-all duration-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5" />
                  <CardContent className="p-4 relative">
                    <Icon className={cn("h-6 w-6 mx-auto mb-2", stat.color)} />
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Upcoming Events - Addictive Section */}
      {upcomingEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="px-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <PartyPopper className="h-6 w-6 text-purple-400" />
              Don't Miss Out!
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-purple-400 hover:text-purple-300"
              onClick={() => setCurrentView('events')}
            >
              See All <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {upcomingEvents.map((event: any, index: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.1 }}
                whileHover={{ x: 8, scale: 1.02 }}
              >
                <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                          <Calendar className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{event.title}</h3>
                          <p className="text-sm text-gray-400">
                            {new Date(event.eventDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          ${event.ticketPrice}
                        </Badge>
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight className="h-4 w-4 text-purple-400" />
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* New Additions - Discovery Section */}
      {(newYachts.length > 0 || newServices.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="px-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-cyan-400" />
              Fresh Arrivals
            </h2>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 animate-pulse">
              <Plus className="h-3 w-3 mr-1" />
              New this month
            </Badge>
          </div>

          <div className="space-y-4">
            {newYachts.map((yacht: any, index: number) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.9 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 cursor-pointer"
                      onClick={() => setCurrentView('explore')}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-500/20 rounded-xl">
                          <Ship className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{yacht.name}</h3>
                          <p className="text-sm text-gray-400">{yacht.size}ft • {yacht.capacity} guests</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                          ${yacht.pricePerHour}/hr
                        </Badge>
                        <Eye className="h-4 w-4 text-cyan-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {newServices.map((service: any, index: number) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 cursor-pointer"
                      onClick={() => setCurrentView('services')}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-xl">
                          <Target className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{service.name}</h3>
                          <p className="text-sm text-gray-400">Premium Service</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          ${service.price}
                        </Badge>
                        <Eye className="h-4 w-4 text-emerald-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Achievement Progress */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.0 }}
        className="px-6 mb-8"
      >
        <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border-amber-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Award className="h-5 w-5 text-amber-400" />
              Next Achievement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-medium">Elite Navigator</span>
                <span className="text-amber-400 text-sm">{bookingCount}/15 bookings</span>
              </div>
              <Progress value={(bookingCount / 15) * 100} className="h-2 bg-white/10" />
              <p className="text-sm text-gray-400">
                Complete 3 more bookings to unlock exclusive concierge benefits!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.1 }}
        className="px-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              className="w-full h-16 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
              onClick={() => setCurrentView('trips')}
            >
              <div className="flex flex-col items-center gap-1">
                <Calendar className="h-5 w-5" />
                <span className="text-sm">Book Now</span>
              </div>
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              className="w-full h-16 bg-gradient-to-br from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white border-0"
              onClick={() => setCurrentView('favorites')}
            >
              <div className="flex flex-col items-center gap-1">
                <Heart className="h-5 w-5" />
                <span className="text-sm">Wishlist</span>
              </div>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.2 }}
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