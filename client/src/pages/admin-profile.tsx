import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  User,
  Globe,
  Calendar,
  MapPin,
  UserCircle,
  Edit3,
  Save,
  Wand2,
  Sparkles,
  X,
  Image,
  Smile
} from 'lucide-react';

export default function AdminProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    language: user?.language || 'English',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    notifications: {
      email: true,
      sms: false,
      push: true,
    }
  });

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [avatarOption, setAvatarOption] = useState<'upload' | 'emoji' | 'generate' | null>(null);

  const digitalAvatars = [
    '👨‍💼', '👩‍💼', '🧑‍💻', '👨‍🔧', '👩‍🔬', '🧑‍🎓', 
    '👨‍⚕️', '👩‍🎨', '🧑‍🚀', '👨‍🏫', '👩‍💻', '🧑‍🔧',
    '👨‍🎤', '👩‍🎭', '🧑‍🍳', '👨‍🌾', '👩‍🏭', '🧑‍🔬',
    '👨‍🎨', '👩‍💼', '🧑‍⚖️', '👨‍🚒', '👩‍✈️', '🧑‍🚀'
  ];

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof profileData) => {
      const response = await apiRequest("PATCH", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      setIsEditing(false);
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
      setShowAvatarEditor(false);
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

  const handleSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordChange = () => {
    if (passwordData.new !== passwordData.confirm) {
      toast({ 
        title: "Error", 
        description: "Passwords don't match", 
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setProfileData(prev => ({ ...prev, avatar: emoji }));
    setShowAvatarEditor(false);
    updateProfileMutation.mutate({ ...profileData, avatar: emoji });
  };

  const generateAvatar = () => {
    const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const initials = (profileData.username || 'A').substring(0, 2).toUpperCase();
    
    const svgAvatar = `data:image/svg+xml,${encodeURIComponent(`
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="60" fill="${randomColor}"/>
        <text x="60" y="75" font-family="Arial, sans-serif" font-size="36" font-weight="bold" 
              text-anchor="middle" fill="white">${initials}</text>
      </svg>
    `)}`;
    
    setProfileData(prev => ({ ...prev, avatar: svgAvatar }));
    setShowAvatarEditor(false);
    updateProfileMutation.mutate({ ...profileData, avatar: svgAvatar });
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

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
            <p className="text-lg text-gray-400">
              Manage your admin account settings and preferences
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={downloadData}
              size="sm" 
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gray-700/20" />
              
              <CardContent className="p-8 text-center relative">
                <div className="relative inline-block group">
                  <motion.div
                    className="relative w-32 h-32 mx-auto mb-6"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-1">
                      <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                        {profileData.avatar ? (
                          profileData.avatar.startsWith('data:') ? (
                            <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : profileData.avatar.match(/^[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u) ? (
                            <span className="text-4xl">{profileData.avatar}</span>
                          ) : (
                            <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                          )
                        ) : (
                          <UserCircle className="w-16 h-16 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <motion.div
                      className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                      whileHover={{ opacity: 1 }}
                      onClick={() => setShowAvatarEditor(true)}
                    >
                      <Edit3 className="w-6 h-6 text-white" />
                    </motion.div>
                  </motion.div>
                </div>

                <h3 className="text-xl font-semibold text-white mb-1">{profileData.username}</h3>
                <Badge variant="secondary" className="bg-gray-600/20 text-gray-300 border-gray-600/30">
                  System Administrator
                </Badge>
                <p className="text-gray-400 mt-2">{profileData.email}</p>
                
                <div className="mt-6 space-y-3 text-sm text-gray-400">
                  <div className="flex items-center justify-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Admin since June 2025</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData.location || 'Miami Beach, FL'}</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>{profileData.language}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 space-y-8"
          >
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  className={isEditing ? "bg-green-600 hover:bg-green-700" : "border-gray-600 text-gray-300 hover:bg-gray-800"}
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Username</Label>
                    <Input
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-gray-700/50 border-gray-600 text-white disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Email</Label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-gray-700/50 border-gray-600 text-white disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Phone</Label>
                    <Input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-gray-700/50 border-gray-600 text-white disabled:opacity-50"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Location</Label>
                    <Input
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!isEditing}
                      className="bg-gray-700/50 border-gray-600 text-white disabled:opacity-50"
                      placeholder="Enter location"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Language</Label>
                  <Select
                    value={profileData.language}
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, language: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white disabled:opacity-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="bg-gray-600 hover:bg-gray-700"
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Current Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.current}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                        className="bg-gray-700/50 border-gray-600 text-white pr-12"
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">New Password</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={passwordData.new}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                      className="bg-gray-700/50 border-gray-600 text-white"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
                <div className="space-y-2 md:w-1/2">
                  <Label className="text-gray-300">Confirm New Password</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                    className="bg-gray-700/50 border-gray-600 text-white"
                    placeholder="Confirm new password"
                  />
                </div>
                
                <Button
                  onClick={handlePasswordChange}
                  disabled={changePasswordMutation.isPending || !passwordData.current || !passwordData.new}
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-400">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={profileData.notifications.email}
                      onCheckedChange={(checked) => 
                        setProfileData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, email: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">SMS Notifications</h4>
                      <p className="text-sm text-gray-400">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={profileData.notifications.sms}
                      onCheckedChange={(checked) => 
                        setProfileData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, sms: checked }
                        }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Push Notifications</h4>
                      <p className="text-sm text-gray-400">Receive browser notifications</p>
                    </div>
                    <Switch
                      checked={profileData.notifications.push}
                      onCheckedChange={(checked) => 
                        setProfileData(prev => ({
                          ...prev,
                          notifications: { ...prev.notifications, push: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showAvatarEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAvatarEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Edit Avatar</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAvatarEditor(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {!avatarOption ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-700/50 rounded-xl p-6 cursor-pointer border-2 border-transparent hover:border-gray-500/50"
                    onClick={() => setAvatarOption('upload')}
                  >
                    <div className="text-center">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-white font-semibold mb-2">Upload Photo</h3>
                      <p className="text-gray-400 text-sm">Upload a custom image from your device</p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-700/50 rounded-xl p-6 cursor-pointer border-2 border-transparent hover:border-gray-500/50"
                    onClick={() => setAvatarOption('emoji')}
                  >
                    <div className="text-center">
                      <Smile className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-white font-semibold mb-2">Choose Avatar</h3>
                      <p className="text-gray-400 text-sm">Select from emoji avatars</p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gray-700/50 rounded-xl p-6 cursor-pointer border-2 border-transparent hover:border-gray-500/50"
                    onClick={() => setAvatarOption('generate')}
                  >
                    <div className="text-center">
                      <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-white font-semibold mb-2">Generate</h3>
                      <p className="text-gray-400 text-sm">Magically generate an avatar</p>
                    </div>
                  </motion.div>
                </div>
              ) : avatarOption === 'upload' ? (
                <div className="text-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="border-2 border-dashed border-gray-600 rounded-xl p-12 cursor-pointer hover:border-gray-500/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">Click to upload</h3>
                    <p className="text-gray-400">or drag and drop your image here</p>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                  </motion.div>
                  <Button
                    variant="outline"
                    onClick={() => setAvatarOption(null)}
                    className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Back
                  </Button>
                </div>
              ) : avatarOption === 'emoji' ? (
                <div>
                  <div className="grid grid-cols-8 gap-3 mb-6">
                    {digitalAvatars.map((emoji, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 text-2xl rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center"
                        onClick={() => handleEmojiSelect(emoji)}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setAvatarOption(null)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Back
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 mx-auto mb-6"
                  >
                    <Sparkles className="w-full h-full text-purple-400" />
                  </motion.div>
                  <h3 className="text-white font-semibold mb-4">Generate Magic Avatar</h3>
                  <p className="text-gray-400 mb-6">Create a unique avatar based on your initials</p>
                  <div className="space-y-4">
                    <Button
                      onClick={generateAvatar}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      Generate Avatar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setAvatarOption(null)}
                      className="ml-4 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Back
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}