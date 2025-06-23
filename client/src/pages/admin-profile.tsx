import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Eye, 
  EyeOff, 
  Shield, 
  Bell, 
  Download,
  Settings,
  User,
  Lock,
  Globe,
  Calendar,
  MapPin,
  Camera,
  UserCircle,
  Edit3,
  Save,
  Phone,
  Mail
} from 'lucide-react';

export default function AdminProfile() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  
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
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: '30',
      loginAlerts: true
    }
  });

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

  const [avatarType, setAvatarType] = useState<'upload' | 'digital'>('digital');

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PATCH", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
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
      setProfileData(prev => ({ ...prev, avatar: data.avatarUrl }));
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
    
    updateProfileMutation.mutate({ 
      notifications: { 
        ...profileData.notifications, 
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

  const digitalAvatars = [
    '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🔧', '👩‍🔬', '🧑‍🎓', 
    '👨‍⚕️', '👩‍🎨', '🧑‍🚀', '👨‍🏫', '👩‍💻', '🧑‍🔧'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-2"
          >
            My Profile
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Manage your admin account settings and preferences
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-4"
        >
          <Button 
            onClick={downloadData}
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-blue-600"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Avatar & Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Avatar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Display */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl font-bold text-white overflow-hidden">
                    {profileData.avatar ? (
                      <img 
                        src={profileData.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      profileData.username?.charAt(0).toUpperCase() || 'A'
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>
                
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white">{profileData.username}</h3>
                  <p className="text-gray-400">{profileData.email}</p>
                  <Badge className="mt-2 bg-purple-500/20 text-purple-400 border-purple-500/30">
                    System Administrator
                  </Badge>
                </div>
              </div>

              {/* Avatar Type Selection */}
              <div className="space-y-4">
                <Label className="text-white">Avatar Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={avatarType === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAvatarType('upload')}
                    className="flex items-center space-x-2"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Upload Photo</span>
                  </Button>
                  <Button
                    variant={avatarType === 'digital' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAvatarType('digital')}
                    className="flex items-center space-x-2"
                  >
                    <UserCircle className="h-4 w-4" />
                    <span>Digital Avatar</span>
                  </Button>
                </div>

                {avatarType === 'upload' && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={uploadAvatarMutation.isPending}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadAvatarMutation.isPending ? 'Uploading...' : 'Choose File'}
                    </Button>
                    <p className="text-xs text-gray-400">Max 5MB, JPG/PNG only</p>
                  </div>
                )}

                {avatarType === 'digital' && (
                  <div className="grid grid-cols-6 gap-2">
                    {digitalAvatars.map((avatar, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="p-2 text-lg"
                        onClick={() => handleInputChange('avatar', avatar)}
                      >
                        {avatar}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Edit3 className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="Enter username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="Enter email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="Enter location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className="text-white">Language</Label>
                  <Select 
                    value={profileData.language} 
                    onValueChange={(value) => handleInputChange('language', value)}
                  >
                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Italian">Italian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Admin since June 2025</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>Miami Beach, FL</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security & Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Security Settings */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-400">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={profileData.security.twoFactorEnabled}
                  onCheckedChange={(checked) => toggleTwoFactorMutation.mutate(checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Login Alerts</p>
                  <p className="text-sm text-gray-400">Get notified of new logins</p>
                </div>
                <Switch
                  checked={profileData.security.loginAlerts}
                  onCheckedChange={(checked) => {
                    setProfileData(prev => ({
                      ...prev,
                      security: { ...prev.security, loginAlerts: checked }
                    }));
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Session Timeout</Label>
                <Select 
                  value={profileData.security.sessionTimeout}
                  onValueChange={(value) => {
                    setProfileData(prev => ({
                      ...prev,
                      security: { ...prev.security, sessionTimeout: value }
                    }));
                  }}
                >
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="bg-gray-800/50 border-gray-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(profileData.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium capitalize">
                      {key} Notifications
                    </p>
                    <p className="text-sm text-gray-400">
                      Receive notifications via {key}
                    </p>
                  </div>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => handleNotificationChange(key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Password Change Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Lock className="h-5 w-5 mr-2" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-white">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPassword.current ? "text" : "password"}
                    value={passwordData.current}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white pr-10"
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPassword.current ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-white">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword.new ? "text" : "password"}
                    value={passwordData.new}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white pr-10"
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPassword.new ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                    className="bg-gray-800/50 border-gray-600 text-white pr-10"
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPassword.confirm ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handlePasswordChange}
                disabled={changePasswordMutation.isPending || !passwordData.current || !passwordData.new || !passwordData.confirm}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}