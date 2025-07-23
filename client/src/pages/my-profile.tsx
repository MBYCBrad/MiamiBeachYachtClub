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
import { User, Mail, Phone, MapPin, Calendar, Settings, Shield, Bell, Lock, Edit, Save, Camera, Upload } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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

  // Fetch user profile data with real-time refresh
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds for real-time sync
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    fullName: '',
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

  // Update form data when profile data loads
  useEffect(() => {
    if (profileData) {
      setFormData(prev => ({
        username: (profileData as any).username || '',
        email: (profileData as any).email || '',
        phone: (profileData as any).phone || '',
        location: (profileData as any).location || '',
        bio: (profileData as any).bio || '',
        fullName: (profileData as any).fullName || '',
        notifications: {
          email: (profileData as any).notifications?.email ?? prev.notifications.email,
          sms: (profileData as any).notifications?.sms ?? prev.notifications.sms,
          push: (profileData as any).notifications?.push ?? prev.notifications.push
        },
        privacy: {
          showEmail: (profileData as any).privacy?.showEmail ?? prev.privacy.showEmail,
          showPhone: (profileData as any).privacy?.showPhone ?? prev.privacy.showPhone,
          showLocation: (profileData as any).privacy?.showLocation ?? prev.privacy.showLocation
        }
      }));
    }
  }, [profileData]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', '/api/user/profile', data);
    },
    onSuccess: (updatedData) => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
      
      // Comprehensive cache invalidation for real-time sync across all application layers
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/staff/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/staff/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/staff/users'] });
      
      // Force immediate refetch for all user-related queries
      queryClient.refetchQueries({ queryKey: ['/api/user/profile'] });
      queryClient.refetchQueries({ queryKey: ['/api/user'] });
      queryClient.refetchQueries({ queryKey: ['/api/staff/profile'] });
      queryClient.refetchQueries({ queryKey: ['/api/staff/stats'] });
      queryClient.refetchQueries({ queryKey: ['/api/staff/users'] });
      
      // Update cached data optimistically for instant UI updates
      if (updatedData) {
        queryClient.setQueryData(['/api/user/profile'], updatedData);
        queryClient.setQueryData(['/api/user'], updatedData);
        queryClient.setQueryData(['/api/staff/profile'], updatedData);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadProfileImageMutation = useMutation({
    mutationFn: async (file: File) => {
      console.log('Profile image upload starting for file:', file.name);
      const formData = new FormData();
      formData.append('image', file);
      
      // Use fetch directly for file uploads since apiRequest doesn't handle FormData properly
      const response = await fetch('/api/user/profile/image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      console.log('Profile image upload response:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile image upload error:', errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Profile image upload successful:', result);
      return result;
    },
    onSuccess: (data) => {
      setAvatarDialogOpen(false);
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been updated successfully.",
      });
      
      // Comprehensive cache invalidation for real-time sync across all application layers
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/staff/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/staff/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/staff/users'] });
      
      // Force immediate refetch for all user-related queries
      queryClient.refetchQueries({ queryKey: ['/api/user/profile'] });
      queryClient.refetchQueries({ queryKey: ['/api/user'] });
      queryClient.refetchQueries({ queryKey: ['/api/staff/profile'] });
      queryClient.refetchQueries({ queryKey: ['/api/staff/stats'] });
      queryClient.refetchQueries({ queryKey: ['/api/staff/users'] });
      
      // Update cached data optimistically for instant UI updates across all contexts
      queryClient.setQueryData(['/api/user/profile'], (old: any) => ({
        ...old,
        profileImage: data.url,
        profileImageUrl: data.url
      }));
      
      queryClient.setQueryData(['/api/user'], (old: any) => ({
        ...old,
        profileImage: data.url,
        profileImageUrl: data.url
      }));
      
      // Update staff-specific cache data
      queryClient.setQueryData(['/api/staff/profile'], (old: any) => ({
        ...old,
        profileImage: data.url,
        profileImageUrl: data.url
      }));
      
      // Also update the user in the staff users list if present
      queryClient.setQueryData(['/api/staff/users'], (old: any[]) => {
        if (!old) return old;
        return old.map(staffUser => 
          staffUser.id === data.user.id ? { ...staffUser, profileImageUrl: data.url } : staffUser
        );
      });
    },
    onError: (error: Error) => {
      console.error('Profile image upload mutation error:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });



  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const [dragActive, setDragActive] = useState(false);

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
      uploadProfileImageMutation.mutate(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File Too Large",
          description: "Please select an image under 10MB.",
          variant: "destructive",
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive",
        });
        return;
      }
      uploadProfileImageMutation.mutate(file);
    }
  };



  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'yacht_owner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'service_provider': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  const formatRole = (role: string) => {
    if (!role) return 'Staff'; // Safe fallback for undefined role
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
                  <div className="profile-picture-outline w-24 h-24">
                    <div className="profile-picture-inner w-full h-full">
                      {((profileData as any)?.profileImageUrl || (profileData as any)?.profileImage || user.profileImageUrl || user.profileImage) ? (
                        <img
                          src={(profileData as any)?.profileImageUrl || (profileData as any)?.profileImage || user.profileImageUrl || user.profileImage}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                          <span className="text-white text-2xl font-semibold">
                            {((profileData as any)?.username || user.username)?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
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
                <CardTitle className="text-white">{(profileData as any)?.username || user.username}</CardTitle>
                <CardDescription className="text-gray-400">{(profileData as any)?.email || user.email}</CardDescription>
                <div className="flex justify-center mt-3">
                  <Badge className={getRoleBadgeColor((profileData as any)?.role || user.role)}>
                    {formatRole((profileData as any)?.role || user.role)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="h-4 w-4 text-purple-400" />
                  <span className="text-sm">Joined {new Date((profileData as any)?.createdAt || user.createdAt).toLocaleDateString()}</span>
                </div>
                {((profileData as any)?.membershipTier || user.membershipTier) && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Shield className="h-4 w-4 text-purple-400" />
                    <span className="text-sm">{(profileData as any)?.membershipTier || user.membershipTier} Member</span>
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
                    value={isEditing ? formData.username : ((profileData as any)?.username || user?.username || '')}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    disabled={!isEditing}
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                  <Input
                    id="fullName"
                    value={isEditing ? formData.fullName : ((profileData as any)?.fullName || '')}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    disabled={!isEditing}
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={isEditing ? formData.email : ((profileData as any)?.email || user?.email || '')}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    disabled={!isEditing}
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                  <Input
                    id="phone"
                    value={isEditing ? formData.phone : ((profileData as any)?.phone || user?.phone || '')}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
                <div>
                  <Label htmlFor="location" className="text-gray-300">Location</Label>
                  <Input
                    id="location"
                    value={isEditing ? formData.location : ((profileData as any)?.location || user?.location || '')}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    disabled={!isEditing}
                    className="bg-gray-900 border-gray-700 text-white disabled:opacity-60"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                  <Textarea
                    id="bio"
                    value={isEditing ? formData.bio : ((profileData as any)?.bio || user?.bio || '')}
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
                    className="switch-gradient"
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
                    className="switch-gradient"
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
                    className="switch-gradient"
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
                    className="switch-gradient"
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
                    className="switch-gradient"
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
                    className="switch-gradient"
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
            
            <div className="space-y-4">
              <div 
                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer
                  ${dragActive 
                    ? 'border-purple-400 bg-purple-400/10' 
                    : 'border-gray-600 hover:border-gray-500'
                  }
                  ${uploadProfileImageMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploadProfileImageMutation.isPending && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadProfileImageMutation.isPending}
                />
                
                {uploadProfileImageMutation.isPending ? (
                  <>
                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">Uploading profile picture...</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-300 mb-2">Click to upload or drag and drop</p>
                    <p className="text-gray-500 text-sm">PNG, JPG up to 10MB</p>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600"
                      disabled={uploadProfileImageMutation.isPending}
                    >
                      Choose File
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}