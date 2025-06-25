import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  User,
  Settings,
  Bell,
  Shield,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Clock,
  Users,
  Save
} from "lucide-react";

export default function StaffPortal() {
  const { user, logout } = useAuth();
  const navigate = useLocation()[1];
  const { toast } = useToast();

  // Redirect if not staff
  useEffect(() => {
    if (user && !user.role.toLowerCase().includes('staff')) {
      navigate('/');
    }
  }, [user, navigate]);

  // Profile settings state
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    location: user?.location || '',
    notifications: {
      email: true,
      sms: false,
      desktop: true
    },
    workSchedule: {
      startTime: '09:00',
      endTime: '17:00',
      timezone: 'EST'
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  if (!user || !user.role.toLowerCase().includes('staff')) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
          <p className="text-gray-400">This area is for MBYC staff members only.</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Your profile settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (type: string, enabled: boolean) => {
    setProfileData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: enabled
      }
    }));
  };

  const handleScheduleChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      workSchedule: {
        ...prev.workSchedule,
        [field]: value
      }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Staff Portal</h1>
              <p className="text-gray-400 text-sm">{user.fullName} • {user.role}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Information */}
        <Card className="bg-gray-950 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-gray-400">
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
                <Input
                  id="fullName"
                  value={profileData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="bg-gray-950 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-gray-950 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-gray-300">Phone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-gray-950 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department" className="text-gray-300">Department</Label>
                <Input
                  id="department"
                  value={profileData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="bg-gray-950 border-gray-700 text-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-gray-300">Location</Label>
              <Input
                id="location"
                value={profileData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="bg-gray-950 border-gray-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-gray-950 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Bell className="w-5 h-5 mr-2" />
              Notification Preferences
            </CardTitle>
            <CardDescription className="text-gray-400">
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-white">Email Notifications</p>
                  <p className="text-sm text-gray-400">Receive updates via email</p>
                </div>
              </div>
              <Switch
                checked={profileData.notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-white">SMS Notifications</p>
                  <p className="text-sm text-gray-400">Receive urgent alerts via SMS</p>
                </div>
              </div>
              <Switch
                checked={profileData.notifications.sms}
                onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Settings className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-white">Desktop Notifications</p>
                  <p className="text-sm text-gray-400">Show browser notifications</p>
                </div>
              </div>
              <Switch
                checked={profileData.notifications.desktop}
                onCheckedChange={(checked) => handleNotificationChange('desktop', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Schedule */}
        <Card className="bg-gray-950 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Clock className="w-5 h-5 mr-2" />
              Work Schedule
            </CardTitle>
            <CardDescription className="text-gray-400">
              Set your working hours and timezone
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-gray-300">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={profileData.workSchedule.startTime}
                  onChange={(e) => handleScheduleChange('startTime', e.target.value)}
                  className="bg-gray-950 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime" className="text-gray-300">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={profileData.workSchedule.endTime}
                  onChange={(e) => handleScheduleChange('endTime', e.target.value)}
                  className="bg-gray-950 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-gray-300">Timezone</Label>
                <Select
                  value={profileData.workSchedule.timezone}
                  onValueChange={(value) => handleScheduleChange('timezone', value)}
                >
                  <SelectTrigger className="bg-gray-950 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-950 border-gray-700">
                    <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                    <SelectItem value="CST">Central Time (CST)</SelectItem>
                    <SelectItem value="MST">Mountain Time (MST)</SelectItem>
                    <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gray-950 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Shield className="w-5 h-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your account security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                className="bg-gray-950 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                className="bg-gray-950 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                className="bg-gray-950 border-gray-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}