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
  Zap
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

const FloatingParticle = ({ delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 100 }}
    animate={{
      opacity: [0, 1, 0],
      y: [100, -20, -100],
      x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
    }}
    transition={{
      duration: 6,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute w-1 h-1 bg-blue-400 rounded-full"
    style={{
      left: `${Math.random() * 100}%`,
      filter: 'blur(0.5px)',
    }}
  />
);

const PremiumAuthPage: React.FC = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

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
    }, {
      onSuccess: (user) => {
        // Immediately redirect after successful login
        setTimeout(() => {
          if (user.role === UserRole.ADMIN) {
            setLocation('/admin');
          } else if (user.role === UserRole.YACHT_OWNER) {
            setLocation('/yacht-owner');
          } else if (user.role === UserRole.SERVICE_PROVIDER) {
            setLocation('/service-provider');
          } else {
            setLocation('/');
          }
        }, 100);
      }
    });
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...userData } = data;
    registerMutation.mutate(userData);
  };

  if (user) {
    return null;
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
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.3} />
        ))}
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

                {/* Tab Switcher */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex space-x-2 mb-8 p-1 bg-gray-800/50 rounded-full"
                >
                  {(['login', 'register'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-3 px-6 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden ${
                        activeTab === tab
                          ? 'text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {activeTab === tab && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center">
                        {tab === 'login' ? (
                          <>
                            <Shield className="w-4 h-4 mr-2" />
                            Sign In
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Join Elite
                          </>
                        )}
                      </span>
                    </button>
                  ))}
                </motion.div>

                <AnimatePresence mode="wait">
                  {/* Login Form */}
                  {activeTab === 'login' && (
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
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

                          <Button 
                            type="submit" 
                            className="w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 text-lg hover:scale-[1.02] active:scale-[0.98]"
                            disabled={loginMutation.isPending}
                          >
                            <div className="flex items-center justify-center">
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
                            </div>
                          </Button>
                        </form>
                      </Form>
                    </motion.div>
                  )}

                  {/* Register Form */}
                  {activeTab === 'register' && (
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Form {...registerForm}>
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white text-sm font-medium">Username</FormLabel>
                                  <FormControl>
                                    <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                                      <Input 
                                        {...field} 
                                        placeholder="Username"
                                        className="bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 h-12 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                                      />
                                    </motion.div>
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
                                  <FormLabel className="text-white text-sm font-medium">Email</FormLabel>
                                  <FormControl>
                                    <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                                      <Input 
                                        {...field} 
                                        type="email"
                                        placeholder="Email"
                                        className="bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 h-12 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                                      />
                                    </motion.div>
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
                                <FormLabel className="text-white text-sm font-medium">Password</FormLabel>
                                <FormControl>
                                  <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                                    <Input 
                                      {...field} 
                                      type={showPassword ? "text" : "password"}
                                      placeholder="Create password"
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
                                  </motion.div>
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
                                <FormLabel className="text-white text-sm font-medium">Confirm Password</FormLabel>
                                <FormControl>
                                  <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                                    <Input 
                                      {...field} 
                                      type={showConfirmPassword ? "text" : "password"}
                                      placeholder="Confirm password"
                                      className="bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 h-12 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 pr-12"
                                    />
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white hover:bg-purple-500/20"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                  </motion.div>
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
                                  <FormLabel className="text-white text-sm font-medium">Account Type</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800/50 border border-gray-600 text-white h-12 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      {roleOptions.map((role) => (
                                        <SelectItem key={role.value} value={role.value} className="text-white hover:bg-purple-500/20">
                                          <div className="flex items-center space-x-3">
                                            <role.icon className="h-4 w-4" />
                                            <div>
                                              <div className="font-medium">{role.label}</div>
                                              <div className="text-xs text-gray-400">{role.desc}</div>
                                            </div>
                                          </div>
                                        </SelectItem>
                                      ))}
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
                                  <FormLabel className="text-white text-sm font-medium">Membership Tier</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="bg-gray-800/50 border border-gray-600 text-white h-12 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                                        <SelectValue placeholder="Select tier" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="bg-gray-800 border-gray-600">
                                      {membershipTiers.map((tier) => (
                                        <SelectItem key={tier.value} value={tier.value} className="text-white hover:bg-purple-500/20">
                                          <div className="flex items-center space-x-3">
                                            <tier.icon className={`h-4 w-4 ${tier.color}`} />
                                            <div>
                                              <div className="font-medium">{tier.label}</div>
                                              <div className="text-xs text-gray-400">{tier.desc}</div>
                                            </div>
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              type="submit" 
                              className="w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 text-lg"
                              disabled={registerMutation.isPending}
                            >
                              <motion.div
                                initial={{ x: 0 }}
                                animate={{ x: registerMutation.isPending ? 0 : 0 }}
                                className="flex items-center justify-center"
                              >
                                {registerMutation.isPending ? (
                                  <>
                                    <motion.div
                                      animate={{ rotate: 360 }}
                                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                    />
                                    Creating Account...
                                  </>
                                ) : (
                                  <>
                                    <Crown className="w-5 h-5 mr-2" />
                                    Join The Elite
                                    <Sparkles className="w-5 h-5 ml-2" />
                                  </>
                                )}
                              </motion.div>
                            </Button>
                          </motion.div>
                        </form>
                      </Form>
                    </motion.div>
                  )}
                </AnimatePresence>

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