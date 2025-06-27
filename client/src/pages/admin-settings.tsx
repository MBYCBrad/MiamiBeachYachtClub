import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, TestTube, Save, Key, Shield, CreditCard, MessageSquare, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

type SystemSetting = {
  id: number;
  settingKey: string;
  settingValue: string;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy: number;
};

export default function AdminSettings() {
  const [stripeApiKey, setStripeApiKey] = useState('');
  const [twilioAccountSid, setTwilioAccountSid] = useState('');
  const [twilioAuthToken, setTwilioAuthToken] = useState('');
  const [showStripeKey, setShowStripeKey] = useState(false);
  const [showTwilioToken, setShowTwilioToken] = useState(false);
  const [stripeTestResult, setStripeTestResult] = useState<any>(null);
  const [twilioTestResult, setTwilioTestResult] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    retry: false,
  });

  // Load existing settings when data is available
  useEffect(() => {
    if (settings) {
      const stripeKey = settings.find((s: SystemSetting) => s.settingKey === 'stripe_api_key');
      const twilioSid = settings.find((s: SystemSetting) => s.settingKey === 'twilio_account_sid');
      const twilioToken = settings.find((s: SystemSetting) => s.settingKey === 'twilio_auth_token');
      
      if (stripeKey) setStripeApiKey(stripeKey.settingValue);
      if (twilioSid) setTwilioAccountSid(twilioSid.settingValue);
      if (twilioToken) setTwilioAuthToken(twilioToken.settingValue);
    }
  }, [settings]);

  // Test Stripe connection
  const testStripeMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      return apiRequest('POST', '/api/admin/stripe/test-connection', { apiKey });
    },
    onSuccess: (data) => {
      setStripeTestResult(data);
      toast({
        title: "Stripe Connection Successful",
        description: `Connected to account: ${data.account.email}`,
      });
    },
    onError: (error: any) => {
      setStripeTestResult({ success: false, message: error.message });
      toast({
        title: "Stripe Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test Twilio connection
  const testTwilioMutation = useMutation({
    mutationFn: async ({ accountSid, authToken }: { accountSid: string; authToken: string }) => {
      return apiRequest('POST', '/api/admin/twilio/test-connection', { accountSid, authToken });
    },
    onSuccess: (data) => {
      setTwilioTestResult(data);
      toast({
        title: "Twilio Connection Successful",
        description: `Connected to account: ${data.account.friendlyName}`,
      });
    },
    onError: (error: any) => {
      setTwilioTestResult({ success: false, message: error.message });
      toast({
        title: "Twilio Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save settings mutation
  const saveSettingMutation = useMutation({
    mutationFn: async ({ settingKey, settingValue, isEncrypted = true }: { settingKey: string; settingValue: string; isEncrypted?: boolean }) => {
      return apiRequest('POST', '/api/admin/settings', { settingKey, settingValue, isEncrypted });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
      toast({
        title: "Settings Saved",
        description: `${variables.settingKey} has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTestStripe = () => {
    if (!stripeApiKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter a Stripe API key to test.",
        variant: "destructive",
      });
      return;
    }
    testStripeMutation.mutate(stripeApiKey);
  };

  const handleTestTwilio = () => {
    if (!twilioAccountSid.trim() || !twilioAuthToken.trim()) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both Twilio Account SID and Auth Token to test.",
        variant: "destructive",
      });
      return;
    }
    testTwilioMutation.mutate({ accountSid: twilioAccountSid, authToken: twilioAuthToken });
  };

  const handleSaveStripe = () => {
    if (!stripeApiKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter a Stripe API key to save.",
        variant: "destructive",
      });
      return;
    }
    saveSettingMutation.mutate({ settingKey: 'stripe_api_key', settingValue: stripeApiKey });
  };

  const handleSaveTwilio = () => {
    if (!twilioAccountSid.trim() || !twilioAuthToken.trim()) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both Twilio Account SID and Auth Token to save.",
        variant: "destructive",
      });
      return;
    }
    
    // Save both settings
    saveSettingMutation.mutate({ settingKey: 'twilio_account_sid', settingValue: twilioAccountSid });
    saveSettingMutation.mutate({ settingKey: 'twilio_auth_token', settingValue: twilioAuthToken });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800/50 bg-black/95 backdrop-blur-sm">
        <div className="px-8 py-6">
          <h1 className="text-5xl font-bold tracking-tight mb-2" style={{ fontFamily: 'SF Pro Display, system-ui, sans-serif' }}>
            System Settings
          </h1>
          <p className="text-lg text-gray-400">
            Configure API integrations and system parameters for Miami Beach Yacht Club
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-8">
        <Tabs defaultValue="stripe" className="w-full max-w-4xl">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 border border-gray-700/50">
            <TabsTrigger value="stripe" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600">
              <CreditCard className="w-4 h-4 mr-2" />
              Stripe Connect
            </TabsTrigger>
            <TabsTrigger value="twilio" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              Twilio SMS
            </TabsTrigger>
          </TabsList>

          {/* Stripe Configuration */}
          <TabsContent value="stripe" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Stripe Connect Integration
                </CardTitle>
                <CardDescription>
                  Configure Stripe API for payment processing and Connect accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="stripe-key" className="text-sm font-medium">
                    Stripe Secret API Key
                  </Label>
                  <div className="relative">
                    <Input
                      id="stripe-key"
                      type={showStripeKey ? "text" : "password"}
                      value={stripeApiKey}
                      onChange={(e) => setStripeApiKey(e.target.value)}
                      placeholder="sk_live_... or sk_test_..."
                      className="bg-black border-gray-700 text-white pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowStripeKey(!showStripeKey)}
                    >
                      {showStripeKey ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleTestStripe}
                    disabled={testStripeMutation.isPending}
                    variant="outline"
                    className="border-gray-600 hover:bg-gray-800"
                  >
                    {testStripeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                  
                  <Button
                    onClick={handleSaveStripe}
                    disabled={saveSettingMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {saveSettingMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Configuration
                  </Button>
                </div>

                {/* Test Results */}
                {stripeTestResult && (
                  <div className="mt-4 p-4 rounded-lg border border-gray-700/50 bg-gray-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      {stripeTestResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {stripeTestResult.success ? 'Connection Successful' : 'Connection Failed'}
                      </span>
                    </div>
                    {stripeTestResult.success ? (
                      <div className="text-sm text-gray-300 space-y-1">
                        <p><strong>Account ID:</strong> {stripeTestResult.account.id}</p>
                        <p><strong>Email:</strong> {stripeTestResult.account.email}</p>
                        <p><strong>Country:</strong> {stripeTestResult.account.country}</p>
                        <p><strong>Business Type:</strong> {stripeTestResult.account.business_type}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-red-400">{stripeTestResult.message}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Twilio Configuration */}
          <TabsContent value="twilio" className="mt-6">
            <Card className="bg-gray-900/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Twilio SMS Integration
                </CardTitle>
                <CardDescription>
                  Configure Twilio API for SMS notifications and concierge services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twilio-sid" className="text-sm font-medium">
                      Account SID
                    </Label>
                    <Input
                      id="twilio-sid"
                      type="text"
                      value={twilioAccountSid}
                      onChange={(e) => setTwilioAccountSid(e.target.value)}
                      placeholder="AC..."
                      className="bg-black border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twilio-token" className="text-sm font-medium">
                      Auth Token
                    </Label>
                    <div className="relative">
                      <Input
                        id="twilio-token"
                        type={showTwilioToken ? "text" : "password"}
                        value={twilioAuthToken}
                        onChange={(e) => setTwilioAuthToken(e.target.value)}
                        placeholder="Your Twilio Auth Token"
                        className="bg-black border-gray-700 text-white pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowTwilioToken(!showTwilioToken)}
                      >
                        {showTwilioToken ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleTestTwilio}
                    disabled={testTwilioMutation.isPending}
                    variant="outline"
                    className="border-gray-600 hover:bg-gray-800"
                  >
                    {testTwilioMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Test Connection
                  </Button>
                  
                  <Button
                    onClick={handleSaveTwilio}
                    disabled={saveSettingMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {saveSettingMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Configuration
                  </Button>
                </div>

                {/* Test Results */}
                {twilioTestResult && (
                  <div className="mt-4 p-4 rounded-lg border border-gray-700/50 bg-gray-800/50">
                    <div className="flex items-center gap-2 mb-2">
                      {twilioTestResult.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="font-medium">
                        {twilioTestResult.success ? 'Connection Successful' : 'Connection Failed'}
                      </span>
                    </div>
                    {twilioTestResult.success ? (
                      <div className="text-sm text-gray-300 space-y-1">
                        <p><strong>Account SID:</strong> {twilioTestResult.account.sid}</p>
                        <p><strong>Name:</strong> {twilioTestResult.account.friendlyName}</p>
                        <p><strong>Status:</strong> {twilioTestResult.account.status}</p>
                        <p><strong>Type:</strong> {twilioTestResult.account.type}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-red-400">{twilioTestResult.message}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Current Settings Overview */}
        <Card className="mt-8 bg-gray-900/50 border-gray-700/50 max-w-4xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Current Configuration
            </CardTitle>
            <CardDescription>
              Overview of current system settings and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {settings?.map((setting: SystemSetting) => (
                <div key={setting.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700/30">
                  <div className="flex items-center gap-3">
                    <Key className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{setting.settingKey.replace(/_/g, ' ').toUpperCase()}</p>
                      <p className="text-sm text-gray-400">
                        Last updated: {new Date(setting.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {setting.isEncrypted && (
                      <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 border-purple-700/50">
                        Encrypted
                      </Badge>
                    )}
                    <Badge variant="outline" className="border-green-600 text-green-400">
                      Active
                    </Badge>
                  </div>
                </div>
              ))}
              
              {(!settings || settings.length === 0) && (
                <div className="text-center py-8 text-gray-400">
                  <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No system settings configured yet.</p>
                  <p className="text-sm">Add API keys above to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}