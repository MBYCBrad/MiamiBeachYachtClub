import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Star, 
  Calendar,
  Settings,
  Camera,
  Edit,
  Save,
  X,
  Upload
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceProvider {
  id: number;
  username: string;
  email: string;
  phone?: string;
  fullName?: string;
  bio?: string;
  location?: string;
  specialties?: string[];
  rating?: number;
  totalBookings?: number;
  joinedDate?: string;
  verificationStatus?: string;
  profileImage?: string;
  availability?: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  notifications?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    bookingReminders: boolean;
    promotionalEmails: boolean;
  };
}

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ServiceProvider>>({});
  const [profileImage, setProfileImage] = useState<string>('');
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch provider profile data
  const { data: profile, isLoading } = useQuery<ServiceProvider>({
    queryKey: ['/api/service-provider/profile'],
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setProfileImage(profile.profileImage || '');
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ServiceProvider>) => {
      return await apiRequest("PUT", "/api/service-provider/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/service-provider/profile'] });
      setIsEditing(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setIsEditing(false);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
              <p className="text-gray-400 text-lg">
                Manage your profile information and settings
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Profile Status</p>
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  {profile?.verificationStatus || 'Active'}
                </Badge>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Profile Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCancel}
                      className="text-gray-400 border-gray-600 hover:bg-gray-800"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 border-gray-600 hover:bg-gray-800"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-600 text-white text-2xl font-semibold">
                      {profile?.username?.charAt(0).toUpperCase() || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="fullName"
                          value={formData.fullName || ''}
                          onChange={(e) => updateField('fullName', e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white mt-1"
                        />
                      ) : (
                        <p className="text-white mt-1">{profile?.fullName || 'Not provided'}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="username" className="text-gray-300">Username</Label>
                      <p className="text-white mt-1">{profile?.username}</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="email" className="text-gray-300">Email</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={(e) => updateField('email', e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white mt-1"
                        />
                      ) : (
                        <p className="text-white mt-1 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {profile?.email}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone || ''}
                          onChange={(e) => updateField('phone', e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white mt-1"
                        />
                      ) : (
                        <p className="text-white mt-1 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          {profile?.phone || 'Not provided'}
                        </p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <Label htmlFor="location" className="text-gray-300">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={formData.location || ''}
                          onChange={(e) => updateField('location', e.target.value)}
                          className="bg-gray-800 border-gray-700 text-white mt-1"
                        />
                      ) : (
                        <p className="text-white mt-1 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {profile?.location || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    value={formData.bio || ''}
                    onChange={(e) => updateField('bio', e.target.value)}
                    rows={4}
                    className="bg-gray-800 border-gray-700 text-white mt-1"
                    placeholder="Tell us about yourself and your services..."
                  />
                ) : (
                  <p className="text-white mt-1">{profile?.bio || 'No bio provided yet.'}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats and Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="h-5 w-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {profile?.rating ? profile.rating.toFixed(1) : '0.0'}
                  </div>
                  <div className="text-sm text-gray-400">Average Rating</div>
                  <div className="flex justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(profile?.rating || 0)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {profile?.totalBookings || 0}
                  </div>
                  <div className="text-sm text-gray-400">Total Bookings</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {profile?.specialties?.length || 0}
                  </div>
                  <div className="text-sm text-gray-400">Specialties</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {profile?.joinedDate ? new Date(profile.joinedDate).getFullYear() : '2024'}
                  </div>
                  <div className="text-sm text-gray-400">Member Since</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Email Notifications</div>
                  <div className="text-sm text-gray-400">Receive booking updates via email</div>
                </div>
                <Switch
                  checked={formData.notifications?.emailNotifications || false}
                  onCheckedChange={(checked) => 
                    updateField('notifications', { 
                      ...formData.notifications, 
                      emailNotifications: checked 
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">SMS Notifications</div>
                  <div className="text-sm text-gray-400">Receive urgent alerts via SMS</div>
                </div>
                <Switch
                  checked={formData.notifications?.smsNotifications || false}
                  onCheckedChange={(checked) => 
                    updateField('notifications', { 
                      ...formData.notifications, 
                      smsNotifications: checked 
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Booking Reminders</div>
                  <div className="text-sm text-gray-400">Get reminders before upcoming bookings</div>
                </div>
                <Switch
                  checked={formData.notifications?.bookingReminders || false}
                  onCheckedChange={(checked) => 
                    updateField('notifications', { 
                      ...formData.notifications, 
                      bookingReminders: checked 
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Promotional Emails</div>
                  <div className="text-sm text-gray-400">Receive updates about new features and offers</div>
                </div>
                <Switch
                  checked={formData.notifications?.promotionalEmails || false}
                  onCheckedChange={(checked) => 
                    updateField('notifications', { 
                      ...formData.notifications, 
                      promotionalEmails: checked 
                    })
                  }
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}