import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Anchor, Eye, EyeOff } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertUserSchema, UserRole, MembershipTier } from '@shared/schema';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const AuthPage: React.FC = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: UserRole.MEMBER,
      membershipTier: MembershipTier.BRONZE,
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate({
      username: data.username,
      password: data.password,
    });
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Anchor className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Miami Beach Yacht Club
              </h1>
              <p className="text-gray-400 text-sm">Luxury Yacht Experiences</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
              Experience Luxury<br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                On The Water
              </span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
              Join Miami's most exclusive yacht club. Access premium vessels, concierge services, 
              and unforgettable experiences on the beautiful waters of Biscayne Bay.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">50+</div>
              <div className="text-sm text-gray-400">Luxury Yachts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">24/7</div>
              <div className="text-sm text-gray-400">Concierge</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">500+</div>
              <div className="text-sm text-gray-400">Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">100%</div>
              <div className="text-sm text-gray-400">Satisfaction</div>
            </div>
          </div>
        </div>

        {/* Authentication Forms */}
        <div className="w-full max-w-md mx-auto">
          <Card className="bg-gray-800/50 backdrop-blur-sm border-purple-800/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white">Welcome to MBYC</CardTitle>
              <CardDescription className="text-gray-300">
                {activeTab === 'login' ? 'Sign in to your account' : 'Create your membership account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-700/50">
                  <TabsTrigger 
                    value="login"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
                  >
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger 
                    value="register"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600"
                  >
                    Join Now
                  </TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login" className="space-y-4 mt-6">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Username</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter your username"
                                className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field} 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Enter your password"
                                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 pr-10"
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
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* Register Form */}
                <TabsContent value="register" className="space-y-4 mt-6">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Username</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="Username"
                                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="email"
                                  placeholder="Email address"
                                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field} 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Create password"
                                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 pr-10"
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
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  {...field} 
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Confirm password"
                                  className="bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-gray-400" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Account Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={UserRole.MEMBER}>Member</SelectItem>
                                  <SelectItem value={UserRole.YACHT_OWNER}>Yacht Owner</SelectItem>
                                  <SelectItem value={UserRole.SERVICE_PROVIDER}>Service Provider</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="membershipTier"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-white">Membership Tier</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={MembershipTier.BRONZE}>Bronze</SelectItem>
                                  <SelectItem value={MembershipTier.SILVER}>Silver</SelectItem>
                                  <SelectItem value={MembershipTier.GOLD}>Gold</SelectItem>
                                  <SelectItem value={MembershipTier.PLATINUM}>Platinum</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? 'Creating Account...' : 'Join Miami Beach Yacht Club'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="mt-4 bg-gray-800/30 backdrop-blur-sm border-purple-800/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-300">Demo Credentials</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-400 space-y-1">
              <div>Member: <span className="text-purple-400">demo_member / password</span></div>
              <div>Yacht Owner: <span className="text-blue-400">demo_owner / password</span></div>
              <div>Service Provider: <span className="text-green-400">demo_provider / password</span></div>
              <div>Admin: <span className="text-yellow-400">admin / password</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;