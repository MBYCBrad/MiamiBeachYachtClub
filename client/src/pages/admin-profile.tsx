import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Camera,
  Edit2,
  Save,
  X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function AdminProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Query for user profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/admin/profile"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/profile");
      return response.json();
    }
  });

  // State for editable fields
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    username: "",
    email: "",
    phone: "",
    location: ""
  });

  // Update editValues when profile data loads
  useEffect(() => {
    if (profile) {
      setEditValues({
        username: profile.username || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || ""
      });
    }
  }, [profile]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", "/api/admin/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile"] });
      toast({ title: "Profile updated successfully" });
      setEditingField(null);
    },
    onError: (error: any) => {
      toast({ title: "Error updating profile", description: error.message, variant: "destructive" });
    }
  });

  // Avatar upload mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await fetch("/api/admin/profile/avatar", {
        method: "POST",
        body: formData
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/profile"] });
      toast({ title: "Avatar updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error uploading avatar", description: error.message, variant: "destructive" });
    }
  });

  const handleEdit = (field: string) => {
    setEditingField(field);
    setEditValues(prev => ({
      ...prev,
      [field]: profile?.[field] || ""
    }));
  };

  const handleSave = (field: string) => {
    updateProfileMutation.mutate({ [field]: editValues[field as keyof typeof editValues] });
  };

  const handleCancel = () => {
    setEditingField(null);
    setEditValues({
      username: profile?.username || "",
      email: profile?.email || "",
      phone: profile?.phone || "",
      location: profile?.location || ""
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Admin Profile</h1>
          <p className="text-gray-400">Manage your administrative account settings</p>
        </motion.div>

        {/* Avatar Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative group">
                  <motion.div 
                    className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAvatarClick}
                  >
                    {profile?.avatarUrl ? (
                      <img 
                        src={profile.avatarUrl} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16" />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white">{profile?.username || "Admin User"}</h2>
                  <p className="text-gray-400">{profile?.role || "Administrator"}</p>
                </div>
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
          <Card className="bg-gray-900/50 border-gray-700/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Username Field */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <Label className="text-gray-300">Username</Label>
                    {editingField === 'username' ? (
                      <Input
                        value={editValues.username}
                        onChange={(e) => setEditValues(prev => ({ ...prev, username: e.target.value }))}
                        className="bg-gray-900 border-gray-700 text-white mt-1"
                      />
                    ) : (
                      <p className="text-white">{profile?.username || "Not set"}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {editingField === 'username' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave('username')}
                        disabled={updateProfileMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit('username')}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <Label className="text-gray-300">Email</Label>
                    {editingField === 'email' ? (
                      <Input
                        value={editValues.email}
                        onChange={(e) => setEditValues(prev => ({ ...prev, email: e.target.value }))}
                        className="bg-gray-900 border-gray-700 text-white mt-1"
                      />
                    ) : (
                      <p className="text-white">{profile?.email || "Not set"}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {editingField === 'email' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave('email')}
                        disabled={updateProfileMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit('email')}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Phone Field */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all">
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <Label className="text-gray-300">Phone</Label>
                    {editingField === 'phone' ? (
                      <Input
                        value={editValues.phone}
                        onChange={(e) => setEditValues(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-gray-900 border-gray-700 text-white mt-1"
                      />
                    ) : (
                      <p className="text-white">{profile?.phone || "Not set"}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {editingField === 'phone' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave('phone')}
                        disabled={updateProfileMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit('phone')}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Location Field */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <Label className="text-gray-300">Location</Label>
                    {editingField === 'location' ? (
                      <Input
                        value={editValues.location}
                        onChange={(e) => setEditValues(prev => ({ ...prev, location: e.target.value }))}
                        className="bg-gray-900 border-gray-700 text-white mt-1"
                      />
                    ) : (
                      <p className="text-white">{profile?.location || "Not set"}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {editingField === 'location' ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSave('location')}
                        disabled={updateProfileMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancel}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit('location')}
                      className="text-gray-400 hover:text-white"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-900/50 hover:bg-gray-700/50 transition-all">
                  <div>
                    <h3 className="text-white font-medium">Change Password</h3>
                    <p className="text-gray-400 text-sm">Update your account password</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-gray-600 hover:border-purple-500">
                        Update Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Change Password</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-gray-300">Current Password</Label>
                          <Input type="password" className="bg-gray-900 border-gray-700 text-white" />
                        </div>
                        <div>
                          <Label className="text-gray-300">New Password</Label>
                          <Input type="password" className="bg-gray-900 border-gray-700 text-white" />
                        </div>
                        <div>
                          <Label className="text-gray-300">Confirm New Password</Label>
                          <Input type="password" className="bg-gray-900 border-gray-700 text-white" />
                        </div>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">
                          Update Password
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}