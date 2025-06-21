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
    <div className="min-h-screen bg-gray-950 text-white overflow-auto pb-20">
      {/* Clean Hero Section with MBYC Coin Focus */}
      <div className="relative h-80 overflow-hidden">
        <div className="absolute inset-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-40"
          >
            <source src="/api/media/15768404-uhd_4096_2160_24fps_1750523880240.mp4" type="video/mp4" />
          </video>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/90 to-gray-950" />
        
        <div className="relative h-full flex flex-col justify-between p-6">
          {/* Top - MBYC Coin Counter */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="p-3 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 rounded-full"
              >
                <Coins className="h-6 w-6 text-amber-400" />
              </motion.div>
              <div>
                <div className="text-2xl font-bold text-amber-400">0</div>
                <div className="text-gray-400 text-sm">MBYC Coins</div>
              </div>
            </div>
            
            <Badge className="bg-gradient-to-r from-green-600/40 to-emerald-600/40 text-green-300 border-green-500/30 px-4 py-2">
              Elite Status
            </Badge>
          </motion.div>

          {/* Center - Profile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <Avatar className="h-20 w-20 border-3 border-white/30">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-amber-500 rounded-full flex items-center justify-center">
                <Crown className="h-3 w-3 text-gray-900" />
              </div>
            </motion.div>
            
            <div>
              <h1 className="text-3xl font-bold text-white">{user?.username}</h1>
              <Badge className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-white mt-2">
                {user?.membershipTier} MEMBER
              </Badge>
              <p className="text-gray-400 mt-1">{user?.email}</p>
            </div>
          </motion.div>

          {/* Bottom - Scroll Hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 text-gray-400">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span className="text-sm">Scroll for exclusive insights</span>
              <Sparkles className="h-4 w-4 text-purple-400" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Clean Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 -mt-8 relative z-10 mb-8"
      >
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <Card className="bg-gray-900/80 border-gray-700/50 text-center hover:border-gray-600/50 transition-all duration-300">
                  <CardContent className="p-4">
                    <Icon className={cn("h-6 w-6 mx-auto mb-2", stat.color)} />
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* MBYC Coin Events & Experiences */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="px-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl">
              <PartyPopper className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Earn MBYC Coins</h2>
              <p className="text-gray-400">Join events & experiences</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-purple-400 hover:text-purple-300"
            onClick={() => setCurrentView('events')}
          >
            See All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {[
            { id: 1, title: "Sunset Cocktail Cruise", coins: 50, date: "Tomorrow 6:00 PM" },
            { id: 2, title: "Miami Vice Night", coins: 75, date: "This Weekend" },
            { id: 3, title: "VIP Marina Party", coins: 100, date: "Next Week" }
          ].map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              whileHover={{ x: 6, scale: 1.01 }}
              className="cursor-pointer"
              onClick={() => setCurrentView('events')}
            >
              <Card className="bg-gray-900/60 border-gray-700/50 hover:border-purple-500/40 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-600/20 rounded-lg">
                        <Calendar className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{event.title}</h3>
                        <p className="text-sm text-gray-400">{event.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-400 font-bold">+{event.coins}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Premium Services for MBYC Coins */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="px-6 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-xl">
              <Target className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Premium Services</h2>
              <p className="text-gray-400">Book services to earn coins</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            className="text-emerald-400 hover:text-emerald-300"
            onClick={() => setCurrentView('services')}
          >
            See All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 1, name: "Chef Experience", coins: 25, price: "$350" },
            { id: 2, name: "Premium Concierge", coins: 15, price: "$200" },
            { id: 3, name: "Spa Services", coins: 20, price: "$280" },
            { id: 4, name: "Photography", coins: 10, price: "$150" }
          ].map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              whileHover={{ scale: 1.03, y: -4 }}
              className="cursor-pointer"
              onClick={() => setCurrentView('services')}
            >
              <Card className="bg-gray-900/60 border-gray-700/50 hover:border-emerald-500/40 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">{service.name}</h3>
                      <div className="flex items-center gap-1">
                        <Coins className="h-4 w-4 text-amber-400" />
                        <span className="text-amber-400 font-bold">+{service.coins}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-semibold">{service.price}</span>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-3">
                        Book Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="px-6 mb-8"
      >
        <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }} 
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="w-full h-16 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0"
              onClick={() => setCurrentView('trips')}
            >
              <div className="flex flex-col items-center gap-1">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-medium">Book Yacht</span>
              </div>
            </Button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }} 
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              className="w-full h-16 bg-gradient-to-br from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white border-0"
              onClick={() => setCurrentView('favorites')}
            >
              <div className="flex flex-col items-center gap-1">
                <Heart className="h-5 w-5" />
                <span className="text-sm font-medium">My Wishlist</span>
              </div>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Simple MBYC Savings Summary */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        className="px-6 mb-8"
      >
        <Card className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/30 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <DollarSign className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">MBYC Savings</h3>
                  <p className="text-green-400 text-sm">vs. Yacht Ownership</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold text-green-400">
                  ${savings.totalSaved.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">saved this year</div>
              </div>
            </div>
          </CardContent>
        </Card>
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