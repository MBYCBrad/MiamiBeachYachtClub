import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Eye, EyeOff, ChevronDown } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertUserSchema, UserRole, MembershipTier } from '@shared/schema';
import { z } from 'zod';
import MBYCLogo from "@assets/MBYC-LOGO-WHITE_1750532808484.png";

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

const AppleAuthPage: React.FC = () => {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

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
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94],
        delay: 0.2
      }
    }
  };

  const inputVariants = {
    focus: { 
      scale: 1.02,
      transition: { duration: 0.2, ease: "easeOut" }
    },
    blur: { 
      scale: 1,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen relative overflow-hidden"
    >
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/api/media/video/15768404-uhd_4096_2160_24fps_1750523880240.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
        <motion.div 
          variants={cardVariants}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.img
              src={MBYCLogo}
              alt="MBYC"
              className="w-24 h-24 mx-auto mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-2xl font-light text-white/90 tracking-wide"
            >
              Miami Beach Yacht Club
            </motion.h1>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            {/* Tab Switcher */}
            <div className="p-2">
              <div className="flex bg-white/10 rounded-2xl p-1">
                {(['login', 'register'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 relative"
                  >
                    {activeTab === tab && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/20 rounded-xl"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className={`relative z-10 block py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === tab ? 'text-white' : 'text-white/60'
                    }`}>
                      {tab === 'login' ? 'Sign In' : 'Join'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 pt-4">
              <AnimatePresence mode="wait">
                {/* Login Form */}
                {activeTab === 'login' && (
                  <motion.div
                    key="login"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <motion.div
                                  variants={inputVariants}
                                  whileFocus="focus"
                                  className="relative"
                                >
                                  <Input 
                                    {...field} 
                                    placeholder="Username"
                                    className="bg-white/10 border-white/20 text-white placeholder-white/50 h-14 rounded-2xl text-lg font-light focus:bg-white/15 focus:border-white/40 transition-all duration-200"
                                  />
                                </motion.div>
                              </FormControl>
                              <FormMessage className="text-red-300 text-sm" />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <motion.div
                                  variants={inputVariants}
                                  whileFocus="focus"
                                  className="relative"
                                >
                                  <Input 
                                    {...field} 
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="bg-white/10 border-white/20 text-white placeholder-white/50 h-14 rounded-2xl text-lg font-light focus:bg-white/15 focus:border-white/40 transition-all duration-200 pr-12"
                                  />
                                  <motion.button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                  </motion.button>
                                </motion.div>
                              </FormControl>
                              <FormMessage className="text-red-300 text-sm" />
                            </FormItem>
                          )}
                        />

                        <motion.div 
                          className="pt-4"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="submit" 
                            className="w-full h-14 bg-white/20 hover:bg-white/30 text-white border-0 rounded-2xl text-lg font-medium backdrop-blur-xl transition-all duration-200"
                            disabled={loginMutation.isPending}
                          >
                            {loginMutation.isPending ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              />
                            ) : (
                              'Sign In'
                            )}
                          </Button>
                        </motion.div>
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
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <motion.div variants={inputVariants} whileFocus="focus">
                                    <Input 
                                      {...field} 
                                      placeholder="Username"
                                      className="bg-white/10 border-white/20 text-white placeholder-white/50 h-12 rounded-xl text-sm font-light focus:bg-white/15 focus:border-white/40 transition-all duration-200"
                                    />
                                  </motion.div>
                                </FormControl>
                                <FormMessage className="text-red-300 text-xs" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <motion.div variants={inputVariants} whileFocus="focus">
                                    <Input 
                                      {...field} 
                                      type="email"
                                      placeholder="Email"
                                      className="bg-white/10 border-white/20 text-white placeholder-white/50 h-12 rounded-xl text-sm font-light focus:bg-white/15 focus:border-white/40 transition-all duration-200"
                                    />
                                  </motion.div>
                                </FormControl>
                                <FormMessage className="text-red-300 text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <motion.div variants={inputVariants} whileFocus="focus" className="relative">
                                  <Input 
                                    {...field} 
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className="bg-white/10 border-white/20 text-white placeholder-white/50 h-12 rounded-xl text-sm font-light focus:bg-white/15 focus:border-white/40 transition-all duration-200 pr-10"
                                  />
                                  <motion.button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </motion.button>
                                </motion.div>
                              </FormControl>
                              <FormMessage className="text-red-300 text-xs" />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <motion.div variants={inputVariants} whileFocus="focus" className="relative">
                                  <Input 
                                    {...field} 
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    className="bg-white/10 border-white/20 text-white placeholder-white/50 h-12 rounded-xl text-sm font-light focus:bg-white/15 focus:border-white/40 transition-all duration-200 pr-10"
                                  />
                                  <motion.button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </motion.button>
                                </motion.div>
                              </FormControl>
                              <FormMessage className="text-red-300 text-xs" />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={registerForm.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 rounded-xl focus:bg-white/15 focus:border-white/40">
                                      <SelectValue placeholder="Role" />
                                      <ChevronDown className="h-4 w-4 opacity-50" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/20">
                                    <SelectItem value={UserRole.MEMBER} className="text-white hover:bg-white/10">Member</SelectItem>
                                    <SelectItem value={UserRole.YACHT_OWNER} className="text-white hover:bg-white/10">Yacht Owner</SelectItem>
                                    <SelectItem value={UserRole.SERVICE_PROVIDER} className="text-white hover:bg-white/10">Service Provider</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-red-300 text-xs" />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={registerForm.control}
                            name="membershipTier"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 rounded-xl focus:bg-white/15 focus:border-white/40">
                                      <SelectValue placeholder="Tier" />
                                      <ChevronDown className="h-4 w-4 opacity-50" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-gray-900/95 backdrop-blur-xl border-white/20">
                                    <SelectItem value={MembershipTier.BRONZE} className="text-white hover:bg-white/10">Bronze</SelectItem>
                                    <SelectItem value={MembershipTier.SILVER} className="text-white hover:bg-white/10">Silver</SelectItem>
                                    <SelectItem value={MembershipTier.GOLD} className="text-white hover:bg-white/10">Gold</SelectItem>
                                    <SelectItem value={MembershipTier.PLATINUM} className="text-white hover:bg-white/10">Platinum</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-red-300 text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>

                        <motion.div 
                          className="pt-4"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button 
                            type="submit" 
                            className="w-full h-12 bg-white/20 hover:bg-white/30 text-white border-0 rounded-xl text-sm font-medium backdrop-blur-xl transition-all duration-200"
                            disabled={registerMutation.isPending}
                          >
                            {registerMutation.isPending ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              />
                            ) : (
                              'Create Account'
                            )}
                          </Button>
                        </motion.div>
                      </form>
                    </Form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-8"
          >
            <p className="text-white/50 text-sm font-light">
              Luxury yacht experiences await
            </p>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AppleAuthPage;