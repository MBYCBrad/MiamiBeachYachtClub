import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft,
  User,
  Mail,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Globe,
  Lock,
  Bell,
  Save,
  LogOut,
  Camera,
  Upload,
  Check,
  X,
  Eye,
  EyeOff,
  CreditCard,
  Download,
  Settings,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useLocation } from "wouter";

export default function AdminProfile() {
  const [, setLocation] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    language: user?.language || 'English',
    avatar: '',
    notifications: {
      email: true,
      sms: false,
      push: true,
      marketing: false,
      security: true,
      marketing: false,
      security: true
    },
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: '2025-06-01',
      activeSessionsCount: 1
    },
    preferences: {
      theme: 'dark',
      timezone: 'America/New_York',
      currency: 'USD',
      language: 'en'
    }
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        language: user.language || 'English',
        notifications: {
          email: true,
          sms: false,
          push: true
        }
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Success", description: "Profile updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Upload failed');
      return response.json();
    },
    onSuccess: (data) => {
      setProfileData(prev => ({ ...prev, avatar: data.avatar }));
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Success", description: "Avatar updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: typeof passwordData) => {
      const response = await apiRequest("PATCH", "/api/profile/password", data);
      return response.json();
    },
    onSuccess: () => {
      setPasswordData({ current: '', new: '', confirm: '' });
      setIsChangingPassword(false);
      toast({ title: "Success", description: "Password changed successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const toggleTwoFactorMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await apiRequest("PATCH", "/api/profile/2fa", { enabled });
      return response.json();
    },
    onSuccess: (data) => {
      setProfileData(prev => ({
        ...prev,
        security: { ...prev.security, twoFactorEnabled: data.enabled }
      }));
      toast({ 
        title: "Success", 
        description: `Two-factor authentication ${data.enabled ? 'enabled' : 'disabled'}` 
      });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Auto-save on change with debouncing
    setTimeout(() => {
      updateProfileMutation.mutate({ [field]: value });
    }, 500);
  };

  const handleNotificationChange = (type: string, value: boolean) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value
      }
    }));
    
    // Real-time database update
    updateProfileMutation.mutate({ 
      notifications: { 
        ...profileData.notifications, 
        [type]: value 
      } 
    });
  };

  const handlePreferenceChange = (type: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [type]: value
      }
    }));
    
    // Real-time database update
    updateProfileMutation.mutate({ 
      preferences: { 
        ...profileData.preferences, 
        [type]: value 
      } 
    });
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ 
          title: "Error", 
          description: "File size must be less than 5MB", 
          variant: "destructive" 
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: "Error", 
          description: "Please select an image file", 
          variant: "destructive" 
        });
        return;
      }
      
      uploadAvatarMutation.mutate(file);
    }
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({ 
        title: "Error", 
        description: "New passwords don't match", 
        variant: "destructive" 
      });
      return;
    }
    
    if (passwordData.new.length < 8) {
      toast({ 
        title: "Error", 
        description: "Password must be at least 8 characters", 
        variant: "destructive" 
      });
      return;
    }
    
    changePasswordMutation.mutate(passwordData);
  };

  const downloadData = () => {
    const dataToDownload = {
      profile: profileData,
      exportDate: new Date().toISOString(),
      user: user?.username
    };
    
    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profile-data-${user?.username}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: "Success", description: "Profile data downloaded successfully" });
  };

  const stableAvatarSeed = user?.username || 'admin';

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          className="w-full h-full object-cover opacity-20"
        >
          <source src="/api/media/hero/active" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-20 p-6 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/admin')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">My Profile</h1>
              <p className="text-gray-400">Manage your admin account settings</p>
            </div>
          </div>
          
          <Button
            variant="destructive"
            onClick={() => logoutMutation.mutate()}
            className="bg-red-600 hover:bg-red-700"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-1"
          >
            <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="relative group"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      className="absolute -inset-4 bg-gradient-to-r from-purple-500/40 via-blue-500/40 to-cyan-500/40 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"
                    />
                    
                    <Avatar className="relative h-24 w-24 border-3 border-white/30 shadow-2xl group-hover:border-white/50 transition-all duration-300">
                      <AvatarImage src={profileData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${stableAvatarSeed}`} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-700 to-blue-700 text-white text-2xl font-bold">
                        {stableAvatarSeed?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Upload Button Overlay */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                      disabled={uploadAvatarMutation.isPending}
                    >
                      {uploadAvatarMutation.isPending ? (
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </motion.button>
                    
                    {/* Hidden File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-gray-900"
                    />
                  </motion.div>
                </div>
                
                <CardTitle className="text-white">{user?.username}</CardTitle>
                <CardDescription className="text-gray-400">{user?.email}</CardDescription>
                
                <div className="flex justify-center mt-4">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    <Shield className="h-3 w-3 mr-1" />
                    System Administrator
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Separator className="bg-gray-700/50" />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span>Admin since June 2025</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    <span>Miami Beach, FL</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Globe className="h-4 w-4 text-green-400" />
                    <span>English</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Settings Cards */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <User className="h-5 w-5 text-purple-400" />
                    <span>Personal Information</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-300">Username</Label>
                      <Input
                        id="username"
                        value={profileData.username}
                        onChange={(e) => handleInputChange('username', e.target.value)}
                        className="bg-gray-800/50 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="bg-gray-800/50 border-gray-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="bg-gray-800/50 border-gray-600 text-white"
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-gray-300">Location</Label>
                      <Input
                        id="location"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="bg-gray-800/50 border-gray-600 text-white"
                        placeholder="Miami Beach, FL"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Notification Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Bell className="h-5 w-5 text-blue-400" />
                    <span>Notification Preferences</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Email Notifications</Label>
                      <p className="text-sm text-gray-400">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={profileData.notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>
                  
                  <Separator className="bg-gray-700/50" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">SMS Notifications</Label>
                      <p className="text-sm text-gray-400">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={profileData.notifications.sms}
                      onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                    />
                  </div>
                  
                  <Separator className="bg-gray-700/50" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-gray-300">Push Notifications</Label>
                      <p className="text-sm text-gray-400">Receive push notifications</p>
                    </div>
                    <Switch
                      checked={profileData.notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Lock className="h-5 w-5 text-red-400" />
                    <span>Security Settings</span>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Manage your account security and access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 hover:border-purple-500 text-gray-300 hover:text-white"
                  >
                    Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 hover:border-blue-500 text-gray-300 hover:text-white"
                  >
                    Enable Two-Factor Authentication
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-600 hover:border-green-500 text-gray-300 hover:text-white"
                  >
                    View Login History
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}