import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Anchor, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Crown, 
  Star,
  Users,
  Shield,
  Waves,
  ArrowRight,
  CheckCircle,
  Zap,
  Loader2
} from 'lucide-react';
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



const PremiumAuthPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      console.log('Auth page - user already authenticated, redirecting to dashboard', user.role);
      if (user.role === "admin") {
        window.location.href = '/admin';
      } else if (user.role === "staff") {
        window.location.href = '/staff-portal';
      } else if (user.role === "yacht_owner") {
        window.location.href = '/yacht-owner';
      } else if (user.role === "service_provider") {
        window.location.href = '/service-provider';
      } else if (user.role === "member") {
        window.location.href = '/member';
      } else {
        window.location.href = '/';
      }
    }
  }, [isAuthenticated, isLoading, user]);

  // Preload video on component mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

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

  // Immediate redirect if user is already authenticated
  useEffect(() => {
    if (user) {
      console.log("Auth page - user already authenticated, redirecting to dashboard", user.role);
      
      // Instant client-side navigation without page reload
      if (user.role === "admin") {
        setLocation("/admin");
      } else if (user.role === "yacht_owner") {
        setLocation("/yacht-owner");
      } else if (user.role === "service_provider") {
        setLocation("/service-provider");
      } else if (user.role === "staff") {
        setLocation("/staff-portal");
      } else if (user.role === "member") {
        setLocation("/member");
      } else {
        setLocation("/");
      }
    }
  }, [user, setLocation]);

  if (user) {
    // Show minimal loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white text-lg">Redirecting to dashboard...</div>
      </div>
    );
  }

  const membershipTiers = [
    { value: MembershipTier.BRONZE, label: 'Bronze Member', icon: Star, color: 'text-orange-400', desc: 'Yachts up to 40ft' },
    { value: MembershipTier.SILVER, label: 'Silver Member', icon: Shield, color: 'text-gray-300', desc: 'Yachts up to 55ft' },
    { value: MembershipTier.GOLD, label: 'Gold Member', icon: Crown, color: 'text-yellow-400', desc: 'Yachts up to 70ft' },
    { value: MembershipTier.PLATINUM, label: 'Platinum Elite', icon: Sparkles, color: 'text-purple-400', desc: 'Unlimited access' },
  ];

  const roleOptions = [
    { value: UserRole.MEMBER, label: 'Club Member', icon: Users, desc: 'Book yachts and services' },
    { value: UserRole.YACHT_OWNER, label: 'Yacht Owner', icon: Anchor, desc: 'List your yacht' },
    { value: UserRole.SERVICE_PROVIDER, label: 'Service Provider', icon: Sparkles, desc: 'Offer premium services' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          onError={(e) => console.error('Video error:', e)}
          className="w-full h-full object-cover"
          style={{ 
            opacity: isVideoLoaded ? 1 : 0, 
            transition: 'opacity 0.5s ease-in-out',
            // Force hardware acceleration
            transform: 'translateZ(0)',
            willChange: 'transform',
            backfaceVisibility: 'hidden',
            perspective: 1000
          }}
        >
          <source src="/api/media/MBYC_UPDATED_1751023212560.mp4" type="video/mp4" />
        </video>
        
        {/* Fallback gradient background when video is loading */}
        {!isVideoLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        )}
        
        {/* Video Overlay - very light to show video clearly */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-purple-900/5 to-blue-900/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        
        {/* 3D Anamorphic Side Edges */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Bottom Edge - Deeper for mobile */}
          <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Left Edge - Narrower */}
          <div className="absolute top-0 left-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-black/40 to-transparent" />
          
          {/* Right Edge - Narrower */}
          <div className="absolute top-0 right-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-black/40 to-transparent" />
        </div>

      </div>



      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex items-center justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.02, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"
              />
              <div className="relative p-4">
                <img 
                  src="/api/media/MBYC-LOGO-WHITE_1750553590720.png" 
                  alt="Miami Beach Yacht Club" 
                  className="w-64 h-auto drop-shadow-2xl"
                />
              </div>
            </motion.div>
          </motion.div>

          {/* Authentication Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
            className="w-full"
          >
            <Card className="bg-black/40 backdrop-blur-2xl border border-purple-500/20 shadow-2xl">
              <CardContent className="p-8">
                {/* Form Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mb-8"
                >
                  <h3 className="text-3xl font-bold text-white mb-2">
                    {activeTab === 'login' ? 'Welcome Back' : 'Join The Elite'}
                  </h3>
                  <p className="text-gray-300 text-lg">
                    {activeTab === 'login' 
                      ? 'Access your exclusive membership portal' 
                      : 'Begin your luxury yacht experience'}
                  </p>
                </motion.div>



                {/* Login Form */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                      <Form {...loginForm}>
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white text-sm font-medium">Username</FormLabel>
                                <FormControl>
                                  <motion.div
                                    whileFocus={{ scale: 1.02 }}
                                    className="relative"
                                  >
                                    <Input 
                                      {...field} 
                                      placeholder="Enter your username"
                                      className="bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 h-12 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                                    />
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-blue-500/0 hover:from-purple-500/5 hover:to-blue-500/5 transition-all duration-300 pointer-events-none" />
                                  </motion.div>
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
                                <FormLabel className="text-white text-sm font-medium">Password</FormLabel>
                                <FormControl>
                                  <motion.div
                                    whileFocus={{ scale: 1.02 }}
                                    className="relative"
                                  >
                                    <Input 
                                      {...field} 
                                      type={showPassword ? "text" : "password"}
                                      placeholder="Enter your password"
                                      className="bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 h-12 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 pr-12"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white hover:bg-purple-500/20"
                                      onClick={() => setShowPassword(!showPassword)}
                                    >
                                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 to-blue-500/0 hover:from-purple-500/5 hover:to-blue-500/5 transition-all duration-300 pointer-events-none" />
                                  </motion.div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              type="submit" 
                              className="w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 text-lg"
                              disabled={loginMutation.isPending}
                            >
                              <motion.div
                                initial={{ x: 0 }}
                                animate={{ x: loginMutation.isPending ? 0 : 0 }}
                                className="flex items-center justify-center"
                              >
                                {loginMutation.isPending ? (
                                  <>
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                    />
                                    Signing In...
                                  </>
                                ) : (
                                  <>
                                    <Shield className="w-5 h-5 mr-2" />
                                    Access Your Account
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                  </>
                                )}
                              </motion.div>
                            </Button>
                          </motion.div>
                        </form>
                      </Form>
                </motion.div>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="mt-8 text-center"
                >
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>Secure</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full" />
                    <div className="flex items-center space-x-1">
                      <Zap className="w-4 h-4" />
                      <span>Instant Access</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-500 rounded-full" />
                    <div className="flex items-center space-x-1">
                      <Crown className="w-4 h-4" />
                      <span>Premium</span>
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PremiumAuthPage;