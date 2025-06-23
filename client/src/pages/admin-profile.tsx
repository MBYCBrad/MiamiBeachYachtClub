import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time database query for user profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/user'],
    enabled: !!user?.id,
  });
  
  const [profileFormData, setProfileFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    language: 'English',
    bio: '',
    notifications: {
      email: true,
      sms: false,
      push: true,
    }
  });

  // Update form data when database data loads
  useEffect(() => {
    if (profileData) {
      setProfileFormData({
        username: profileData.username || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        language: profileData.language || 'English',
        bio: profileData.bio || '',
        notifications: {
          email: true,
          sms: false,
          push: true,
        }
      });
    }
  }, [profileData]);

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
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', '/api/admin/profile', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await apiRequest('POST', '/api/admin/avatar', formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });
      setShowAvatarEditor(false);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload avatar.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setProfileFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileFormData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image under 10MB.",
          variant: "destructive",
        });
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    updateProfileMutation.mutate({ avatar });
    setShowAvatarEditor(false);
  };

  const generateRandomAvatar = () => {
    const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
    const shapes = ['circle', 'square'];
    const selectedColor = colors[Math.floor(Math.random() * colors.length)];
    const selectedShape = shapes[Math.floor(Math.random() * shapes.length)];
    
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileFormData.username || 'Admin')}&background=${selectedColor.slice(1)}&color=fff&size=128&rounded=${selectedShape === 'circle' ? 'true' : 'false'}`;
    
    updateProfileMutation.mutate({ avatar: avatarUrl });
    setShowAvatarEditor(false);
  };

  const currentUser = profileData || user || {
    username: 'Loading...',
    email: '',
    fullName: '',
    role: 'admin'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-lg"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Admin Profile</h1>
          <p className="text-purple-100">Manage your administrator account settings and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Avatar Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="admin-profile-card">
              <CardHeader className="text-center">
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                    {currentUser.avatar ? (
                      <img 
                        src={currentUser.avatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling!.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-500">
                      {currentUser.username?.charAt(0)?.toUpperCase() || 'A'}
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => setShowAvatarEditor(true)}
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full bg-purple-600 hover:bg-purple-700 w-10 h-10 p-0"
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                
                <CardTitle className="text-white text-xl">{currentUser.fullName || currentUser.username}</CardTitle>
                <Badge variant="secondary" className="mx-auto bg-purple-100 text-purple-800">
                  {currentUser.role?.toUpperCase()}
                </Badge>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="admin-profile-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username" className="text-gray-300">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={profileFormData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white mt-1"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileFormData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white mt-1"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileFormData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white mt-1"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-gray-300">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      value={profileFormData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-white mt-1"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                  <textarea
                    id="bio"
                    value={profileFormData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className="w-full mt-1 bg-gray-800/50 border border-gray-700 rounded-md px-3 py-2 text-white min-h-[80px] resize-none"
                    placeholder="Tell us about yourself..."
                    disabled={!isEditing}
                  />
                </div>

                {isEditing ? (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSaveProfile}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      disabled={updateProfileMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="admin-profile-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-300">Change Password</Label>
                  <div className="space-y-3 mt-2">
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Current Password"
                        value={passwordData.current}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                        className="bg-gray-800/50 border-gray-700 text-white pr-10"
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
                    <Input
                      type="password"
                      placeholder="New Password"
                      value={passwordData.new}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                    <Input
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwordData.confirm}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                      className="bg-gray-800/50 border-gray-700 text-white"
                    />
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                      Update Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Avatar Editor Modal */}
        <AnimatePresence>
          {showAvatarEditor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowAvatarEditor(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gradient-to-br from-purple-900 to-blue-900 p-6 rounded-xl max-w-md w-full border border-purple-500/20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Update Avatar</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAvatarEditor(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {!avatarOption && (
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        onClick={() => setAvatarOption('upload')}
                        className="flex flex-col items-center p-4 h-auto bg-purple-800/50 hover:bg-purple-700/50 border border-purple-500/30"
                      >
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-sm">Upload Photo</span>
                      </Button>
                      <Button
                        onClick={() => setAvatarOption('emoji')}
                        className="flex flex-col items-center p-4 h-auto bg-purple-800/50 hover:bg-purple-700/50 border border-purple-500/30"
                      >
                        <Smile className="h-8 w-8 mb-2" />
                        <span className="text-sm">Choose Emoji</span>
                      </Button>
                      <Button
                        onClick={() => setAvatarOption('generate')}
                        className="flex flex-col items-center p-4 h-auto bg-purple-800/50 hover:bg-purple-700/50 border border-purple-500/30"
                      >
                        <Wand2 className="h-8 w-8 mb-2" />
                        <span className="text-sm">Generate</span>
                      </Button>
                    </div>
                  )}

                  {avatarOption === 'upload' && (
                    <div className="space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={uploadAvatarMutation.isPending}
                      >
                        <Image className="h-4 w-4 mr-2" />
                        {uploadAvatarMutation.isPending ? 'Uploading...' : 'Select Image'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setAvatarOption(null)}
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        Back
                      </Button>
                    </div>
                  )}

                  {avatarOption === 'emoji' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                        {digitalAvatars.map((emoji, index) => (
                          <Button
                            key={index}
                            onClick={() => handleAvatarSelect(emoji)}
                            className="h-12 w-12 text-2xl bg-purple-800/50 hover:bg-purple-700 border border-purple-500/30"
                            disabled={updateProfileMutation.isPending}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setAvatarOption(null)}
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        Back
                      </Button>
                    </div>
                  )}

                  {avatarOption === 'generate' && (
                    <div className="space-y-4">
                      <Button
                        onClick={generateRandomAvatar}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={updateProfileMutation.isPending}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        {updateProfileMutation.isPending ? 'Generating...' : 'Generate Random Avatar'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setAvatarOption(null)}
                        className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        Back
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}