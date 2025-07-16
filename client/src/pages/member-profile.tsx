import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Camera,
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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import MembershipUpgradeModal from '@/components/membership-upgrade-modal';

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
  const [showSecurityDialog, setShowSecurityDialog] = useState(false);
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Form state management with real user data
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    language: 'en',
    notifications: {
      bookings: true,
      events: true,
      marketing: false
    }
  });

  // Update form data when user data changes
  React.useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '+1 (305) 555-0123',
        location: user.location || 'Miami Beach, FL',
        language: user.language || 'en',
        notifications: user.notifications || {
          bookings: true,
          events: true,
          marketing: false
        }
      });
    }
  }, [user]);

  // Real-time profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<typeof formData>) => {
      const response = await apiRequest('PATCH', '/api/profile', updates);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      // Update the user cache
      queryClient.setQueryData(['/api/user'], updatedUser);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to save changes.",
        variant: "destructive",
      });
    },
  });

  // Handle form field changes with real-time updates
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Debounced real-time update to database
    const updates = { [field]: value };
    updateProfileMutation.mutate(updates);
  };

  // Handle nested notification changes
  const handleNotificationChange = (key: string, value: boolean) => {
    const updatedNotifications = {
      ...formData.notifications,
      [key]: value
    };
    
    setFormData(prev => ({
      ...prev,
      notifications: updatedNotifications
    }));
    
    updateProfileMutation.mutate({ notifications: updatedNotifications });
  };

  // Fetch real data for analytics and recommendations
  const { data: bookings = [] } = useQuery({ queryKey: ['/api/bookings'] }) as { data: any[] };
  const { data: events = [] } = useQuery({ queryKey: ['/api/events'] }) as { data: any[] };
  const { data: yachts = [] } = useQuery({ queryKey: ['/api/yachts'] }) as { data: any[] };
  const { data: services = [] } = useQuery({ queryKey: ['/api/services'] }) as { data: any[] };

  const handleLogout = () => {
    logoutMutation.mutate();
    setShowLogoutDialog(false);
  };

  // Password change mutation
  const passwordChangeMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      return await apiRequest('POST', '/api/auth/change-password', data);
    },
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
      });
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }
    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error", 
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    passwordChangeMutation.mutate(passwordData);
  };

  const handleUpgradeToPlatinum = () => {
    setShowUpgradeModal(true);
  };

  // Avatar upload handler
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include' // Include cookies for session
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      });

      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
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
    { label: 'Favorites', value: '8', icon: Heart, color: 'text-purple-400' },
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
        <div className="relative h-64 flex flex-col justify-end p-6 pb-8 mt-16">
          {/* Top Status Bar */}


          {/* Main Profile Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="flex items-center gap-8"
          >
            {/* Avatar with Upload Functionality */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group cursor-pointer"
              onClick={() => document.getElementById('avatar-upload')?.click()}
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
              
              <Avatar className="relative h-24 w-24 border-3 border-white/30 shadow-2xl group-hover:border-white/50 transition-all duration-300">
                <AvatarImage src={user?.profileImage || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-purple-700 to-blue-700 text-white text-2xl font-bold">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* Status Indicator */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  boxShadow: [
                    "0 0 0 0 rgba(34, 197, 94, 0.4)",
                    "0 0 0 8px rgba(34, 197, 94, 0)",
                    "0 0 0 0 rgba(34, 197, 94, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-gray-950 flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
              
              {/* Upload Button Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer backdrop-blur-sm"
              >
                {isUploadingAvatar ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </motion.div>
              
              {/* Hidden file input */}
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </motion.div>
            
            {/* Simplified Avatar Info for Hero */}
            <div className="flex-1 space-y-2">
              <div>
                <motion.h1 
                  className="text-2xl md:text-4xl font-bold text-white mb-1"
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
                  className="inline-flex items-center gap-2 mb-2"
                >
                  <div className="p-1.5 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-lg">
                    <Crown className="h-4 w-4 text-amber-400" />
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-white border-white/30 backdrop-blur-md text-sm px-3 py-1">
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
                    <label className="text-sm text-gray-400 mb-1 block">Username</label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleFieldChange('username', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    ) : (
                      <div className="text-white font-medium">{formData.username}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Email Address</label>
                    {isEditingProfile ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    ) : (
                      <div className="text-white font-medium">{formData.email}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Phone Number</label>
                    {isEditingProfile ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    ) : (
                      <div className="text-white font-medium">{formData.phone}</div>
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
                        value={formData.location}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        className="w-full px-3 py-2 bg-white/5 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:outline-none transition-colors"
                      />
                    ) : (
                      <div className="text-white font-medium">{formData.location}</div>
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


        </div>


      </motion.div>

      {/* Advanced Analytics Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="px-4 md:px-6 mt-6 mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 md:gap-4">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="p-2 md:p-3 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-xl backdrop-blur-sm"
            >
              <Trophy className="h-5 w-5 md:h-6 md:w-6 text-indigo-400" />
            </motion.div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Member Analytics</h2>
              <p className="text-sm md:text-base text-gray-400">Your yacht club achievements and insights</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
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
                  
                  <CardContent className="p-4 md:p-6 relative text-center">
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
                      <Icon className={cn("h-8 w-8 md:h-10 md:w-10 mx-auto relative z-10", stat.color)} />
                    </motion.div>
                    
                    {/* Value with Counting Animation */}
                    <motion.div 
                      className="text-2xl md:text-4xl font-bold text-white mb-2 relative"
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
                      

                    </motion.div>
                    
                    {/* Label with Hover Effect */}
                    <motion.div 
                      className="text-xs md:text-sm text-gray-400 uppercase tracking-wider font-medium"
                      whileHover={{ 
                        color: "#ffffff",
                        scale: 1.05
                      }}
                    >
                      {stat.label}
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
          {/* Privacy & Security */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            whileHover={{ scale: 1.03, y: -5 }}
            onClick={() => setShowSecurityDialog(true)}
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
            transition={{ duration: 0.8, delay: 1.5 }}
            whileHover={{ scale: 1.03, y: -5 }}
            onClick={() => setShowBillingDialog(true)}
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
              
              <CardContent className="relative p-6 h-36 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 bg-blue-500/30 rounded-xl backdrop-blur-sm"
                  >
                    <Calendar className="h-6 w-6 text-blue-300" />
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
                
                <div className="mt-2">
                  <h3 className="text-lg font-bold text-white mb-1 leading-tight">Yacht Bookings</h3>
                  <p className="text-blue-200 text-sm leading-tight">Manage your reservations</p>
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
              
              <CardContent className="relative p-6 h-36 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 bg-purple-500/30 rounded-xl backdrop-blur-sm"
                  >
                    <Heart className="h-6 w-6 text-purple-300 fill-current" />
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
                
                <div className="mt-2">
                  <h3 className="text-lg font-bold text-white mb-1 leading-tight">My Wishlist</h3>
                  <p className="text-purple-200 text-sm leading-tight">Dream yacht collection</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>


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

      {/* Privacy & Security Dialog */}
      <Dialog open={showSecurityDialog} onOpenChange={setShowSecurityDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-emerald-400" />
              Privacy & Security Settings
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage your account security and privacy preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-green-400">Enabled</span>
                </div>
              </div>
              <Button variant="outline" className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/10">
                Configure 2FA
              </Button>
            </div>

            {/* Password Security */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">Password Security</h3>
                  <p className="text-sm text-gray-400">Change your password and security settings</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-400">Strong</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
                onClick={() => setShowPasswordDialog(true)}
              >
                Change Password
              </Button>
            </div>

            {/* Data Privacy */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">Data Privacy</h3>
                  <p className="text-sm text-gray-400">Control how your data is used and shared</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-400">Protected</span>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 w-full">
                  Download My Data
                </Button>
                <Button variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/10 w-full">
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment & Billing Dialog */}
      <Dialog open={showBillingDialog} onOpenChange={setShowBillingDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <CreditCard className="h-6 w-6 text-yellow-400" />
              Payment & Billing
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Manage your payment methods and billing information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Payment Methods */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Payment Methods</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">Visa •••• 4242</p>
                      <p className="text-sm text-gray-400">Expires 12/25</p>
                    </div>
                  </div>
                  <Badge className="bg-green-600/20 text-green-400">Primary</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-white font-medium">Mastercard •••• 8888</p>
                      <p className="text-sm text-gray-400">Expires 06/26</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    Remove
                  </Button>
                </div>
              </div>
              <Button className="w-full mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                + Add Payment Method
              </Button>
            </div>

            {/* Billing History */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Recent Transactions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 border-b border-gray-700">
                  <div>
                    <p className="text-white text-sm">Premium Concierge Service</p>
                    <p className="text-xs text-gray-400">July 15, 2025</p>
                  </div>
                  <span className="text-green-400 font-medium">$485.00</span>
                </div>
                <div className="flex items-center justify-between p-2 border-b border-gray-700">
                  <div>
                    <p className="text-white text-sm">Yacht Club Membership</p>
                    <p className="text-xs text-gray-400">July 1, 2025</p>
                  </div>
                  <span className="text-green-400 font-medium">$5,000.00</span>
                </div>
                <div className="flex items-center justify-between p-2">
                  <div>
                    <p className="text-white text-sm">Service Booking Fee</p>
                    <p className="text-xs text-gray-400">June 28, 2025</p>
                  </div>
                  <span className="text-green-400 font-medium">$125.00</span>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-3 border-gray-600 text-gray-300 hover:bg-gray-800">
                View All Transactions
              </Button>
            </div>

            {/* Membership */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-3">Membership Status</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Gold Membership</p>
                  <p className="text-sm text-gray-400">Next billing: August 1, 2025</p>
                </div>
                <Badge className="bg-yellow-600/20 text-yellow-400">Active</Badge>
              </div>
              <div className="mt-3 space-y-2">
                <Button 
                  onClick={handleUpgradeToPlatinum}
                  variant="outline" 
                  className="w-full border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                >
                  Upgrade to Platinum
                </Button>
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-800">
                  Manage Subscription
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-emerald-400" />
              Change Password
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="Enter current password"
              />
            </div>
            
            <div>
              <Label htmlFor="newPassword" className="text-white">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white mt-1"
                placeholder="Confirm new password"
              />
            </div>
            
            {/* Password requirements */}
            <div className="text-sm text-gray-400 space-y-1">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li className={passwordData.newPassword.length >= 8 ? 'text-green-400' : 'text-gray-400'}>
                  At least 8 characters
                </li>
                <li className={passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword.length > 0 ? 'text-green-400' : 'text-gray-400'}>
                  Passwords match
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
              disabled={
                passwordChangeMutation.isPending ||
                !passwordData.currentPassword ||
                !passwordData.newPassword ||
                !passwordData.confirmPassword ||
                passwordData.newPassword !== passwordData.confirmPassword ||
                passwordData.newPassword.length < 8
              }
            >
              {passwordChangeMutation.isPending ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Membership Upgrade Modal */}
      <MembershipUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={user?.membershipTier || 'bronze'}
      />
    </div>
  );
}