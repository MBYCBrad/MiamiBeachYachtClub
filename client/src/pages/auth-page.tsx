import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  Anchor, 
  Eye, 
  EyeOff, 
  Shield,
  ArrowRight,
  Zap,
  Crown
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const PremiumAuthPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const particleRefs = useRef<(HTMLDivElement | null)[]>([]);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          setLocation('/admin');
          break;
        case 'staff':
          setLocation('/staff');
          break;
        case 'yacht_owner':
          setLocation('/yacht-owner');
          break;
        case 'service_provider':
          setLocation('/service-provider');
          break;
        default:
          setLocation('/member');
      }
    }
  }, [isAuthenticated, user, setLocation]);

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  // Floating particles animation
  useEffect(() => {
    const particles = particleRefs.current;
    particles.forEach((particle, index) => {
      if (particle) {
        const delay = index * 200;
        const duration = 3000 + Math.random() * 2000;
        
        const animate = () => {
          particle.animate([
            { transform: 'translateY(100vh) translateX(0px) rotate(0deg)', opacity: 0 },
            { transform: 'translateY(-20vh) translateX(50px) rotate(180deg)', opacity: 1 },
            { transform: 'translateY(-100vh) translateX(-30px) rotate(360deg)', opacity: 0 }
          ], {
            duration,
            easing: 'ease-in-out',
            delay
          }).addEventListener('finish', animate);
        };
        
        setTimeout(animate, delay);
      }
    });
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/api/media/MBYC_UPDATED_1751023212560.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-purple-900/30 to-blue-900/50" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            ref={el => particleRefs.current[i] = el}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
              className="mx-auto mb-6 relative w-20 h-20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse" />
              <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center">
                <img 
                  src="/api/media/MBYC-LOGO-WHITE_1751029522037.png" 
                  alt="MBYC Logo" 
                  className="w-8 h-8 object-contain filter brightness-110"
                />
              </div>
              {/* Rotating rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-2 border-2 border-purple-400/30 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-3 border border-blue-400/20 rounded-full"
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Miami Beach Yacht Club
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-gray-300 text-lg"
            >
              Exclusive Maritime Excellence
            </motion.p>
          </motion.div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Card className="bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
              <CardContent className="p-8">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="text-center mb-8"
                >
                  <h3 className="text-3xl font-bold text-white mb-2">
                    Welcome Back
                  </h3>
                  <p className="text-gray-300 text-lg">
                    Access your exclusive membership portal
                  </p>
                </motion.div>

                {/* Login Form */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
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
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white text-sm font-medium">Password</FormLabel>
                            <FormControl>
                              <motion.div whileFocus={{ scale: 1.02 }} className="relative">
                                <Input 
                                  {...field} 
                                  type={showPassword ? "text" : "password"}
                                  placeholder="Password"
                                  className="bg-gray-800/50 border border-gray-600 text-white placeholder-gray-400 h-12 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300 pr-12"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
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