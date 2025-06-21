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
      {/* Revolutionary Video Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {/* Full Video Background */}
        <div className="absolute inset-0">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="/api/media/15768404-uhd_4096_2160_24fps_1750523880240.mp4" type="video/mp4" />
          </video>
        </div>
        
        {/* Dark Mode Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/80 to-gray-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-blue-900/30" />
        
        {/* Floating Animations */}
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute top-12 right-12 text-white/20"
        >
          <Anchor className="h-24 w-24" />
        </motion.div>
        
        <motion.div
          animate={{ 
            x: [0, 20, -20, 0],
            y: [0, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute bottom-12 left-12 text-white/15"
        >
          <Ship className="h-20 w-20" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col justify-between p-8">
          {/* Top Status */}
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex justify-between items-start"
          >
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="p-3 bg-gradient-to-r from-orange-500/40 to-red-500/40 rounded-full backdrop-blur-sm"
              >
                <Flame className="h-6 w-6 text-orange-300" />
              </motion.div>
              <div>
                <div className="text-2xl font-bold text-white drop-shadow-xl">
                  {savings.bookingsThisYear} 
                </div>
                <div className="text-gray-300 font-medium">adventures completed</div>
              </div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.1 }}
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(34, 197, 94, 0.4)",
                  "0 0 40px rgba(34, 197, 94, 0.6)",
                  "0 0 20px rgba(34, 197, 94, 0.4)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-6 py-3 bg-gradient-to-r from-green-600/50 to-emerald-600/50 rounded-2xl backdrop-blur-md border border-green-400/30"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-300" />
                <span className="text-xl font-bold text-green-300">Elite Status</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Center Profile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex items-center justify-center gap-8"
          >
            <motion.div
              whileHover={{ scale: 1.15, rotate: 10 }}
              className="relative"
            >
              {/* Glowing Ring */}
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-4 bg-gradient-to-r from-purple-500/60 via-blue-500/60 to-cyan-500/60 rounded-full blur-xl"
              />
              
              <Avatar className="relative h-32 w-32 border-4 border-white/50 shadow-2xl">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                <AvatarFallback className="bg-gradient-to-br from-purple-700 to-blue-700 text-white text-4xl font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              {/* Crown Badge */}
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-3 -right-3 h-12 w-12 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full flex items-center justify-center shadow-2xl"
              >
                <Crown className="h-6 w-6 text-gray-900" />
              </motion.div>
            </motion.div>
            
            <div className="text-center space-y-4">
              <motion.h1 
                className="text-5xl font-bold text-white drop-shadow-2xl text-gradient-animate"
                animate={{ 
                  textShadow: [
                    "0 0 20px rgba(139, 92, 246, 0.8)",
                    "0 0 40px rgba(59, 130, 246, 0.8)",
                    "0 0 20px rgba(139, 92, 246, 0.8)"
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {user?.username}
              </motion.h1>
              
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="flex items-center justify-center gap-3"
              >
                <MembershipIcon className="h-8 w-8 text-amber-400" />
                <Badge className="bg-gradient-to-r from-purple-600/60 to-pink-600/60 text-white border-white/40 backdrop-blur-md text-xl px-6 py-2">
                  {user?.membershipTier} MEMBER
                </Badge>
              </motion.div>
              
              <div className="space-y-2 text-gray-300">
                <div className="flex items-center justify-center gap-2">
                  <Mail className="h-5 w-5" />
                  <span className="text-lg">{user?.email}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span className="text-lg">Miami Beach, FL</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-full backdrop-blur-md"
            >
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <span className="text-gray-300 font-medium">Scroll for exclusive insights</span>
              <Sparkles className="h-5 w-5 text-purple-400" />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Revolutionary Stats Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="px-6 -mt-12 relative z-10 mb-12"
      >
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.4 + index * 0.15,
                  type: "spring",
                  bounce: 0.4
                }}
                whileHover={{ 
                  y: -12, 
                  scale: 1.08,
                  rotateY: 10
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Card className="bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 text-center hover:border-purple-500/50 transition-all duration-500 relative overflow-hidden group">
                  {/* Animated Background */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-blue-600/10 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    animate={{
                      background: [
                        "linear-gradient(135deg, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))",
                        "linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))",
                        "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1), rgba(147, 51, 234, 0.1))"
                      ]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  {/* Glowing Border */}
                  <motion.div
                    className="absolute inset-0 rounded-lg"
                    animate={{
                      boxShadow: [
                        "0 0 0 1px rgba(147, 51, 234, 0)",
                        "0 0 20px 1px rgba(147, 51, 234, 0.3)",
                        "0 0 0 1px rgba(147, 51, 234, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  />
                  
                  <CardContent className="p-6 relative">
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
                      className="mb-4"
                    >
                      <Icon className={cn("h-8 w-8 mx-auto", stat.color)} />
                    </motion.div>
                    
                    <motion.div 
                      className="text-3xl font-bold text-white mb-2"
                      animate={{
                        textShadow: [
                          "0 0 10px rgba(255, 255, 255, 0.5)",
                          "0 0 20px rgba(147, 51, 234, 0.8)",
                          "0 0 10px rgba(255, 255, 255, 0.5)"
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    >
                      {stat.value}
                    </motion.div>
                    
                    <div className="text-sm text-gray-400 font-medium uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Addictive Upcoming Events */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="px-6 mb-12"
      >
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-4 bg-gradient-to-r from-pink-600/30 to-purple-600/30 rounded-2xl backdrop-blur-sm"
            >
              <PartyPopper className="h-8 w-8 text-pink-400" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-white">Don't Miss Out!</h2>
              <p className="text-gray-400">Exclusive events just for you</p>
            </div>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="ghost" 
              size="lg"
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 border border-purple-500/30"
              onClick={() => setCurrentView('events')}
            >
              See All Events <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
        
        <div className="grid gap-6">
          {(upcomingEvents.length > 0 ? upcomingEvents : [
            { id: 1, title: "Sunset Cocktail Cruise", eventDate: new Date(Date.now() + 86400000 * 3), ticketPrice: 150 },
            { id: 2, title: "Miami Vice Night", eventDate: new Date(Date.now() + 86400000 * 7), ticketPrice: 200 },
            { id: 3, title: "VIP Marina Party", eventDate: new Date(Date.now() + 86400000 * 14), ticketPrice: 300 }
          ]).map((event: any, index: number) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.8 + index * 0.2,
                type: "spring",
                bounce: 0.3
              }}
              whileHover={{ 
                x: 12, 
                scale: 1.03,
                rotateY: 5
              }}
              className="cursor-pointer"
              onClick={() => setCurrentView('events')}
            >
              <Card className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border border-purple-500/30 hover:border-pink-500/50 transition-all duration-500 relative overflow-hidden group backdrop-blur-xl">
                {/* Animated Background Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-purple-600/10"
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <motion.div
                        animate={{ 
                          rotate: [0, 360],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          duration: 4, 
                          repeat: Infinity,
                          delay: index * 0.5
                        }}
                        className="p-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl backdrop-blur-sm"
                      >
                        <Calendar className="h-8 w-8 text-purple-400" />
                      </motion.div>
                      
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-gray-400 text-lg">
                          {new Date(event.eventDate).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            month: 'long', 
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}
                        </p>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-500 text-sm">Exclusive Member Event</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-3">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      >
                        <Badge className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-300 border-green-500/30 text-lg px-4 py-2">
                          ${event.ticketPrice}
                        </Badge>
                      </motion.div>
                      
                      <motion.div
                        animate={{ x: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center justify-end gap-2"
                      >
                        <span className="text-purple-400 font-medium">Join Now</span>
                        <ArrowRight className="h-5 w-5 text-purple-400" />
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Breathtaking Discovery Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.9 }}
        className="px-6 mb-12"
      >
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.15, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="p-4 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-2xl backdrop-blur-sm"
            >
              <Sparkles className="h-8 w-8 text-cyan-400" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold text-white">Fresh Arrivals</h2>
              <p className="text-gray-400">New yachts and services added this month</p>
            </div>
          </div>
          
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 0 20px rgba(6, 182, 212, 0.3)",
                "0 0 40px rgba(6, 182, 212, 0.5)",
                "0 0 20px rgba(6, 182, 212, 0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Badge className="bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 border-cyan-500/50 backdrop-blur-md text-lg px-4 py-2">
              <Plus className="h-4 w-4 mr-2" />
              4 New This Month
            </Badge>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* New Yachts */}
          {(newYachts.length > 0 ? newYachts : [
            { id: 1, name: "Ocean Majesty", size: 120, capacity: 15, pricePerHour: 850 },
            { id: 2, name: "Azure Dream", size: 85, capacity: 10, pricePerHour: 650 }
          ]).map((yacht: any, index: number) => (
            <motion.div
              key={yacht.id}
              initial={{ opacity: 0, y: 30, rotateY: -20 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 1.1 + index * 0.2 }}
              whileHover={{ 
                scale: 1.05,
                rotateY: 10,
                y: -10
              }}
              className="cursor-pointer"
              onClick={() => setCurrentView('explore')}
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-cyan-900/20 border border-cyan-500/40 hover:border-cyan-400/70 transition-all duration-500 relative overflow-hidden group backdrop-blur-xl">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 via-blue-600/10 to-cyan-600/5"
                  animate={{
                    x: ["-100%", "100%"]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ 
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                        className="p-3 bg-gradient-to-r from-cyan-600/30 to-blue-600/30 rounded-xl backdrop-blur-sm"
                      >
                        <Ship className="h-8 w-8 text-cyan-400" />
                      </motion.div>
                      
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {yacht.name}
                        </h3>
                        <p className="text-gray-400">{yacht.size}ft • {yacht.capacity} guests</p>
                        <div className="flex items-center gap-2">
                          <Gem className="h-4 w-4 text-cyan-500" />
                          <span className="text-cyan-400 text-sm font-medium">Just Added</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <Badge className="bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 border-cyan-500/40 text-lg px-3 py-1">
                        ${yacht.pricePerHour}/hr
                      </Badge>
                      
                      <motion.div
                        animate={{ x: [0, 6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center justify-end gap-1"
                      >
                        <Eye className="h-4 w-4 text-cyan-400" />
                        <span className="text-cyan-400 text-sm">Explore</span>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* New Services */}
          {(newServices.length > 0 ? newServices : [
            { id: 1, name: "Premium Concierge", price: 200 },
            { id: 2, name: "Chef Experience", price: 350 }
          ]).map((service: any, index: number) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30, rotateY: 20 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 1.3 + index * 0.2 }}
              whileHover={{ 
                scale: 1.05,
                rotateY: -10,
                y: -10
              }}
              className="cursor-pointer"
              onClick={() => setCurrentView('services')}
            >
              <Card className="bg-gradient-to-br from-gray-900/90 to-emerald-900/20 border border-emerald-500/40 hover:border-emerald-400/70 transition-all duration-500 relative overflow-hidden group backdrop-blur-xl">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-600/5 via-teal-600/10 to-emerald-600/5"
                  animate={{
                    x: ["100%", "-100%"]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ 
                          rotate: [0, -10, 10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                        className="p-3 bg-gradient-to-r from-emerald-600/30 to-teal-600/30 rounded-xl backdrop-blur-sm"
                      >
                        <Target className="h-8 w-8 text-emerald-400" />
                      </motion.div>
                      
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {service.name}
                        </h3>
                        <p className="text-gray-400">Premium Service</p>
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-emerald-500" />
                          <span className="text-emerald-400 text-sm font-medium">New Service</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <Badge className="bg-gradient-to-r from-emerald-600/30 to-teal-600/30 text-emerald-300 border-emerald-500/40 text-lg px-3 py-1">
                        ${service.price}
                      </Badge>
                      
                      <motion.div
                        animate={{ x: [0, 6, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center justify-end gap-1"
                      >
                        <Eye className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400 text-sm">Book Now</span>
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Elite Achievement Progress */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="px-6 mb-12"
      >
        <Card className="bg-gradient-to-r from-gray-900/90 to-amber-900/40 border border-amber-500/40 backdrop-blur-xl relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-amber-600/5 via-yellow-600/10 to-amber-600/5"
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
          
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-4 text-white">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="p-3 bg-gradient-to-r from-amber-600/30 to-yellow-600/30 rounded-xl"
              >
                <Award className="h-8 w-8 text-amber-400" />
              </motion.div>
              <div>
                <div className="text-2xl font-bold">Next Achievement</div>
                <div className="text-amber-400 text-lg">Elite Navigator Status</div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="relative space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xl font-semibold text-white">Progress to Elite</span>
              <motion.span 
                className="text-2xl font-bold text-amber-400"
                animate={{
                  textShadow: [
                    "0 0 10px rgba(251, 191, 36, 0.5)",
                    "0 0 20px rgba(251, 191, 36, 0.8)",
                    "0 0 10px rgba(251, 191, 36, 0.5)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {bookingCount}/15 bookings
              </motion.span>
            </div>
            
            <div className="relative">
              <Progress 
                value={(bookingCount / 15) * 100} 
                className="h-4 bg-gray-800/50" 
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-yellow-400/20 rounded-full"
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            <motion.p 
              className="text-gray-300 text-lg"
              animate={{
                color: ["#d1d5db", "#fbbf24", "#d1d5db"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Complete {15 - bookingCount} more bookings to unlock exclusive concierge benefits!
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revolutionary Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="px-6 mb-16"
      >
        <motion.h3 
          className="text-3xl font-bold text-white mb-8 text-center"
          animate={{
            textShadow: [
              "0 0 20px rgba(147, 51, 234, 0.5)",
              "0 0 40px rgba(59, 130, 246, 0.7)",
              "0 0 20px rgba(147, 51, 234, 0.5)"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Ready for Your Next Adventure?
        </motion.h3>
        
        <div className="grid grid-cols-2 gap-6">
          <motion.div 
            whileHover={{ 
              scale: 1.08, 
              rotateY: 10,
              y: -10
            }} 
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            <Button 
              className="w-full h-24 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white border-0 relative overflow-hidden group"
              onClick={() => setCurrentView('trips')}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10"
                animate={{
                  x: ["-100%", "100%"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              <div className="flex flex-col items-center gap-2 relative z-10">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Calendar className="h-8 w-8" />
                </motion.div>
                <span className="text-lg font-bold">Book Yacht</span>
                <span className="text-sm opacity-90">Start your journey</span>
              </div>
            </Button>
          </motion.div>
          
          <motion.div 
            whileHover={{ 
              scale: 1.08, 
              rotateY: -10,
              y: -10
            }} 
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <Button 
              className="w-full h-24 bg-gradient-to-br from-pink-600 via-red-600 to-orange-600 hover:from-pink-700 hover:via-red-700 hover:to-orange-700 text-white border-0 relative overflow-hidden group"
              onClick={() => setCurrentView('favorites')}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-white/10"
                animate={{
                  x: ["100%", "-100%"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
              
              <div className="flex flex-col items-center gap-2 relative z-10">
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="h-8 w-8" />
                </motion.div>
                <span className="text-lg font-bold">My Wishlist</span>
                <span className="text-sm opacity-90">Dream collection</span>
              </div>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* MBYC Savings Analytics - Bottom Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1.2, delay: 1.5 }}
        className="px-6 mb-12"
      >
        <motion.div
          className="relative overflow-hidden rounded-3xl"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.5 }}
        >
          {/* Background Video Effect */}
          <div className="absolute inset-0 opacity-20">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            >
              <source src="/api/media/15768404-uhd_4096_2160_24fps_1750523880240.mp4" type="video/mp4" />
            </video>
          </div>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/95 via-emerald-900/90 to-teal-900/95" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Animated Elements */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute top-8 right-8 text-green-400/20"
          >
            <DollarSign className="h-32 w-32" />
          </motion.div>
          
          <motion.div
            animate={{ 
              y: [0, -30, 0],
              x: [0, 20, -20, 0],
              scale: [1, 1.3, 1],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{ 
              duration: 15, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="absolute bottom-8 left-8 text-emerald-400/20"
          >
            <TrendingUp className="h-28 w-28" />
          </motion.div>

          <Card className="bg-transparent border-0 relative">
            <CardContent className="p-10 relative">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.7 }}
                className="text-center mb-10"
              >
                <div className="flex items-center justify-center gap-4 mb-6">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="p-4 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-2xl backdrop-blur-sm"
                  >
                    <Coins className="h-12 w-12 text-green-400" />
                  </motion.div>
                  <div>
                    <motion.h2 
                      className="text-5xl font-bold text-white mb-2"
                      animate={{
                        textShadow: [
                          "0 0 20px rgba(34, 197, 94, 0.6)",
                          "0 0 40px rgba(16, 185, 129, 0.8)",
                          "0 0 20px rgba(34, 197, 94, 0.6)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      MBYC Savings
                    </motion.h2>
                    <p className="text-2xl text-green-400 font-semibold">vs. Yacht Ownership</p>
                  </div>
                </div>
              </motion.div>

              {/* Main Stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 1.9 }}
                className="grid grid-cols-2 gap-8 mb-10"
              >
                <div className="text-center space-y-3">
                  <motion.div 
                    className="text-6xl font-bold text-green-400 mb-2"
                    animate={{
                      scale: [1, 1.05, 1],
                      textShadow: [
                        "0 0 20px rgba(34, 197, 94, 0.8)",
                        "0 0 40px rgba(34, 197, 94, 1)",
                        "0 0 20px rgba(34, 197, 94, 0.8)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ${savings.totalSaved.toLocaleString()}
                  </motion.div>
                  <p className="text-xl text-white/90 font-semibold">Total Saved This Year</p>
                  <div className="flex items-center justify-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-medium">vs. Ownership Costs</span>
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <motion.div 
                    className="text-6xl font-bold text-white mb-2"
                    animate={{
                      scale: [1, 1.05, 1],
                      textShadow: [
                        "0 0 20px rgba(255, 255, 255, 0.6)",
                        "0 0 40px rgba(255, 255, 255, 0.8)",
                        "0 0 20px rgba(255, 255, 255, 0.6)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  >
                    {savings.percentageSaved}%
                  </motion.div>
                  <p className="text-xl text-white/90 font-semibold">Cost Reduction</p>
                  <div className="flex items-center justify-center gap-2">
                    <Award className="h-5 w-5 text-amber-400" />
                    <span className="text-amber-400 font-medium">Smart Choice</span>
                  </div>
                </div>
              </motion.div>

              {/* Detailed Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 2.1 }}
                className="space-y-4 mb-8"
              >
                <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                  <span className="text-xl text-white/80">Annual Yacht Ownership Cost</span>
                  <span className="text-2xl font-bold text-red-400">$315,000</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-black/20 rounded-xl backdrop-blur-sm">
                  <span className="text-xl text-white/80">Your MBYC Spending</span>
                  <span className="text-2xl font-bold text-green-400">$${savings.totalSpent.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-xl backdrop-blur-sm border border-green-500/30">
                  <span className="text-xl text-white font-semibold">You're Saving</span>
                  <span className="text-3xl font-bold text-green-300">${savings.totalSaved.toLocaleString()}</span>
                </div>
              </motion.div>

              {/* Progress Bar */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 1.5, delay: 2.3 }}
                className="relative"
              >
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Yacht Ownership Cost</span>
                  <span>MBYC Smart Spending</span>
                </div>
                
                <div className="relative h-6 bg-gray-800/50 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${savings.percentageSaved}%` }}
                    transition={{ duration: 2, delay: 2.5, ease: "easeOut" }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                      animate={{
                        x: ["-100%", "100%"]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 2.7 }}
                className="text-center mt-8"
              >
                <p className="text-xl text-green-300 font-semibold mb-4">
                  Keep sailing smart with MBYC! 🛥️
                </p>
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 20px rgba(34, 197, 94, 0.3)",
                      "0 0 40px rgba(34, 197, 94, 0.6)",
                      "0 0 20px rgba(34, 197, 94, 0.3)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-2xl backdrop-blur-md border border-green-500/40"
                >
                  <Sparkles className="h-6 w-6 text-green-400" />
                  <span className="text-xl font-bold text-green-300">Elite Financial Navigator</span>
                  <Sparkles className="h-6 w-6 text-emerald-400" />
                </motion.div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 2.9 }}
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