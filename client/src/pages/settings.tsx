import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Shield, Bell, Lock, Globe, Palette, Download, Trash2 } from "lucide-react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile data
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['/api/user/profile'],
    enabled: !!user,
  });

  const [settings, setSettings] = useState({
    // Privacy Settings
    profileVisibility: 'members',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingReminders: true,
    marketingEmails: false,
    
    // Account Settings
    language: 'en',
    timezone: 'America/New_York',
    currency: 'USD',
    theme: 'dark',
    
    // Security Settings
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: '24h'
  });

  // Update settings when profile data loads
  useEffect(() => {
    if (profileData) {
      setSettings(prev => ({
        ...prev,
        // Map any existing settings from profile data
        profileVisibility: profileData.profileVisibility || 'members',
        showEmail: profileData.showEmail || false,
        showPhone: profileData.showPhone || false,
        showLocation: profileData.showLocation !== undefined ? profileData.showLocation : true,
      }));
    }
  }, [profileData]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', '/api/user/profile', data);
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your settings have been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user/profile'] });
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

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Auto-save certain settings
    if (['profileVisibility', 'showEmail', 'showPhone', 'showLocation'].includes(key)) {
      updateSettingsMutation.mutate({ [key]: value });
    }
  };

  const handleBulkSave = () => {
    updateSettingsMutation.mutate(settings);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900/50 border-b border-gray-700/50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-gray-400">Manage your account preferences and privacy settings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        
        {/* Privacy Settings */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-purple-400" />
              <div>
                <CardTitle className="text-white">Privacy Settings</CardTitle>
                <CardDescription>Control who can see your information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Profile Visibility</Label>
              <Select value={settings.profileVisibility} onValueChange={(value) => handleSettingChange('profileVisibility', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="public">Public - Anyone can view</SelectItem>
                  <SelectItem value="members">Members Only</SelectItem>
                  <SelectItem value="private">Private - Only me</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Show Email Address</Label>
                <p className="text-sm text-gray-400">Allow other members to see your email</p>
              </div>
              <Switch
                checked={settings.showEmail}
                onCheckedChange={(checked) => handleSettingChange('showEmail', checked)}
                className="switch-gradient"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Show Phone Number</Label>
                <p className="text-sm text-gray-400">Allow other members to see your phone</p>
              </div>
              <Switch
                checked={settings.showPhone}
                onCheckedChange={(checked) => handleSettingChange('showPhone', checked)}
                className="switch-gradient"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Show Location</Label>
                <p className="text-sm text-gray-400">Display your location in your profile</p>
              </div>
              <Switch
                checked={settings.showLocation}
                onCheckedChange={(checked) => handleSettingChange('showLocation', checked)}
                className="switch-gradient"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-purple-400" />
              <div>
                <CardTitle className="text-white">Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Email Notifications</Label>
                <p className="text-sm text-gray-400">Receive booking confirmations and updates</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                className="switch-gradient"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">SMS Notifications</Label>
                <p className="text-sm text-gray-400">Get text messages for urgent updates</p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
                className="switch-gradient"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Push Notifications</Label>
                <p className="text-sm text-gray-400">Browser notifications for real-time updates</p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                className="switch-gradient"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Booking Reminders</Label>
                <p className="text-sm text-gray-400">Receive reminders before your yacht bookings</p>
              </div>
              <Switch
                checked={settings.bookingReminders}
                onCheckedChange={(checked) => handleSettingChange('bookingReminders', checked)}
                className="switch-gradient"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Marketing Emails</Label>
                <p className="text-sm text-gray-400">Receive newsletters and promotional content</p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onCheckedChange={(checked) => handleSettingChange('marketingEmails', checked)}
                className="switch-gradient"
              />
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-purple-400" />
              <div>
                <CardTitle className="text-white">Account Preferences</CardTitle>
                <CardDescription>Customize your account settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Language</Label>
                <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Timezone</Label>
                <Select value={settings.timezone} onValueChange={(value) => handleSettingChange('timezone', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Currency</Label>
                <Select value={settings.currency} onValueChange={(value) => handleSettingChange('currency', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => handleSettingChange('theme', value)}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="dark">Dark Mode</SelectItem>
                    <SelectItem value="light">Light Mode</SelectItem>
                    <SelectItem value="auto">Auto (System)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gray-900/50 border-gray-700/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-purple-400" />
              <div>
                <CardTitle className="text-white">Security & Access</CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Two-Factor Authentication</Label>
                <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                className="switch-gradient"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-white">Login Alerts</Label>
                <p className="text-sm text-gray-400">Get notified when someone logs into your account</p>
              </div>
              <Switch
                checked={settings.loginAlerts}
                onCheckedChange={(checked) => handleSettingChange('loginAlerts', checked)}
                className="switch-gradient"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Session Timeout</Label>
              <Select value={settings.sessionTimeout} onValueChange={(value) => handleSettingChange('sessionTimeout', value)}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="8h">8 Hours</SelectItem>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Changes Button */}
        <div className="flex justify-end">
          <Button 
            onClick={handleBulkSave}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            disabled={updateSettingsMutation.isPending}
          >
            {updateSettingsMutation.isPending ? "Saving..." : "Save All Changes"}
          </Button>
        </div>

      </div>
    </div>
  );
}