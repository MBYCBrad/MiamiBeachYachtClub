import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Phone, MapPin, Calendar, Settings, Shield, Bell, Lock, Edit, Save, Camera, Upload, Sparkles, Image as ImageIcon, Wand2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function MyProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [avatarMethod, setAvatarMethod] = useState<'upload' | 'avatar' | 'generate'>('upload');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    privacy: {
      showEmail: false,
      showPhone: false,
      showLocation: true
    }
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
        notifications: prev.notifications,
        privacy: prev.privacy
      }));
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('PATCH', '/api/profile', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) throw new Error('Failed to upload avatar');
      return response.json();
    },
    onSuccess: (data) => {
      setAvatarDialogOpen(false);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const selectAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      const response = await apiRequest('POST', '/api/select/avatar', { avatarUrl });
      return response.json();
    },
    onSuccess: () => {
      setAvatarDialogOpen(false);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Selection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const generateAvatarMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/generate-avatar', { prompt });
      return response.json();
    },
    onSuccess: (data) => {
      setAvatarDialogOpen(false);
      toast({
        title: "Avatar Generated",
        description: "Your AI-generated avatar has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
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

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    selectAvatarMutation.mutate(avatarUrl);
  };

  const handleGenerateAvatar = () => {
    const prompt = `Professional headshot of a ${user?.role || 'professional'} for Miami Beach Yacht Club, luxury maritime theme, high quality`;
    generateAvatarMutation.mutate(prompt);
  };

  const predefinedAvatars = [
    '/api/media/avatars/avatar1.jpg',
    '/api/media/avatars/avatar2.jpg', 
    '/api/media/avatars/avatar3.jpg',
    '/api/media/avatars/avatar4.jpg',
    '/api/media/avatars/avatar5.jpg',
    '/api/media/avatars/avatar6.jpg',
    '/api/media/Screenshot 2025-06-21 at 10.07.13 AM_1750525636853.png',
    '/api/media/Screenshot 2025-06-21 at 10.13.02 AM_1750525984464.png',
    '/api/media/Screenshot 2025-06-21 at 10.15.18 AM_1750526121299.png',
    '/api/media/Screenshot 2025-06-21 at 10.17.47 AM_1750526270437.png',
    '/api/media/Screenshot 2025-06-21 at 10.18.48 AM_1750526331757.png',
    '/api/media/Screenshot 2025-06-21 at 10.24.01 AM_1750526643824.png'
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'yacht_owner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'service_provider': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  const formatRole = (role: string) => {
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900/50 flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900/50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">My Profile</h1>
            <p className="text-gray-400 mt-2">Manage your account settings and preferences</p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <>
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
                  className="bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader className="text-center pb-4">
                <div className="relative mx-auto w-24 h-24 mb-4">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-semibold">
                        {user.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <Button 
                      size="sm" 
                      onClick={() => setAvatarDialogOpen(true)}
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-gradient-to-r from-purple-600 to-indigo-600"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardTitle className="text-white">{user.username}</CardTitle>
                <CardDescription className="text-gray-400">{user.email}</CardDescription>
                <div className="flex justify-center mt-3">
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {formatRole(user.role)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <span className="text-sm">Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                {user.membershipTier && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Shield className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">{user.membershipTier} Member</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-400" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <Input
                    id="username"
                    value={isEditing ? formData.username : (user?.username || '')}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    disabled={!isEditing}
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? formData.email : (user?.email || '')}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                  <Input
                    id="phone"
                    value={isEditing ? formData.phone : (user?.phone || '')}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-gray-300">Location</Label>
                  <Input
                    id="location"
                    value={isEditing ? formData.location : (user?.location || '')}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    disabled={!isEditing}
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                  <Textarea
                    id="bio"
                    value={isEditing ? formData.bio : (user?.bio || '')}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-60"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-purple-400" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={formData.notifications.email}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, notifications: {...formData.notifications, email: checked}})
                    }
                    disabled={!isEditing}
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">SMS Notifications</Label>
                    <p className="text-sm text-gray-500">Receive updates via text message</p>
                  </div>
                  <Switch
                    checked={formData.notifications.sms}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, notifications: {...formData.notifications, sms: checked}})
                    }
                    disabled={!isEditing}
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive browser notifications</p>
                  </div>
                  <Switch
                    checked={formData.notifications.push}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, notifications: {...formData.notifications, push: checked}})
                    }
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-400" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Show Email</Label>
                    <p className="text-sm text-gray-500">Make your email visible to other users</p>
                  </div>
                  <Switch
                    checked={formData.privacy.showEmail}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, privacy: {...formData.privacy, showEmail: checked}})
                    }
                    disabled={!isEditing}
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Show Phone</Label>
                    <p className="text-sm text-gray-500">Make your phone number visible to other users</p>
                  </div>
                  <Switch
                    checked={formData.privacy.showPhone}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, privacy: {...formData.privacy, showPhone: checked}})
                    }
                    disabled={!isEditing}
                  />
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-gray-300">Show Location</Label>
                    <p className="text-sm text-gray-500">Make your location visible to other users</p>
                  </div>
                  <Switch
                    checked={formData.privacy.showLocation}
                    onCheckedChange={(checked) => 
                      setFormData({...formData, privacy: {...formData.privacy, showLocation: checked}})
                    }
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Avatar Management Dialog */}
        <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
          <DialogContent className="sm:max-w-[600px] bg-gray-900/50 border-gray-700/50">
            <DialogHeader>
              <DialogTitle className="text-white">Update Profile Picture</DialogTitle>
            </DialogHeader>
            
            <Tabs value={avatarMethod} onValueChange={(value: any) => setAvatarMethod(value)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800">
                <TabsTrigger value="upload" className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="avatar" className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Pick Avatar
                </TabsTrigger>
                <TabsTrigger value="generate" className="text-gray-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600">
                  <Wand2 className="h-4 w-4 mr-2" />
                  AI Generate
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Click to upload or drag and drop</p>
                  <p className="text-gray-500 text-sm">PNG, JPG up to 10MB</p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600"
                    disabled={uploadAvatarMutation.isPending}
                  >
                    {uploadAvatarMutation.isPending ? "Uploading..." : "Choose File"}
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="avatar" className="space-y-4">
                <div className="max-h-96 overflow-y-auto pr-2">
                  <div className="grid grid-cols-3 gap-4">
                    {predefinedAvatars.map((avatarUrl, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer rounded-lg border-2 transition-colors ${
                          selectedAvatar === avatarUrl 
                            ? 'border-purple-500' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onClick={() => handleAvatarSelect(avatarUrl)}
                      >
                        <Avatar className="w-full h-24">
                          <AvatarImage src={avatarUrl} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                            {index + 1}
                          </AvatarFallback>
                        </Avatar>
                        {selectedAvatar === avatarUrl && (
                          <div className="absolute inset-0 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <div className="bg-purple-500 rounded-full p-1">
                              <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="generate" className="space-y-4">
                <div className="text-center space-y-4">
                  <Sparkles className="h-12 w-12 text-purple-400 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">AI Avatar Generation</h3>
                    <p className="text-gray-400">Generate a professional avatar using AI based on your role</p>
                  </div>
                  <Button 
                    onClick={handleGenerateAvatar}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600"
                    disabled={generateAvatarMutation.isPending}
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    {generateAvatarMutation.isPending ? "Generating..." : "Generate Avatar"}
                  </Button>
                  <p className="text-gray-500 text-sm">
                    Creates a professional headshot for {user?.role || 'your role'}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}