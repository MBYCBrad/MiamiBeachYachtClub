import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronDown, Anchor, Sparkles, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import starPattern from "@assets/PF0007919-big_1751025963434.jpg";

// Hero Section with Video Background
function HeroSection() {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      {heroVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={heroVideo.url} type={heroVideo.mimetype} />
        </video>
      )}
      
      {/* Light Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
          }}
          transition={{ duration: 1 }}
          className="mb-12 relative"
        >
          {/* 3D Glow Effect Behind Logo */}
          <motion.div
            className="absolute inset-0 -z-10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="absolute inset-0 bg-white blur-[100px] opacity-50" />
          </motion.div>
          
          {/* Main Logo with 3D Pulse Effect */}
          <motion.img 
            src="/api/media/MBYC-LOGO-WHITE (1)_1751027380901.png" 
            alt="Miami Beach Yacht Club" 
            className="relative mx-auto w-[400px] md:w-[600px] lg:w-[700px]"
            animate={{
              scale: [1, 1.05, 1],
              filter: [
                "drop-shadow(0 0 30px rgba(255, 255, 255, 0.5))",
                "drop-shadow(0 0 60px rgba(255, 255, 255, 0.8))",
                "drop-shadow(0 0 30px rgba(255, 255, 255, 0.5))"
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              transform: "perspective(1000px) rotateX(5deg)",
              transformStyle: "preserve-3d",
            }}
          />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
        >
          Experience luxury yachting like never before. Unlimited access to our premium fleet with world-class service.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <Link href="/apply">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              APPLY NOW
            </Button>
          </Link>
          <Link href="/book-tour">
            <Button 
              variant="outline"
              size="lg" 
              className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300"
            >
              BOOK A PRIVATE TOUR
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <ChevronDown className="w-8 h-8 text-white/60" />
      </motion.div>
    </section>
  );
}

// Features Section with Phone Mockup
function FeaturesSection() {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });

  const leftFeatures = [
    {
      title: "Unlimited Access",
      description: "Book unlimited trips on our luxury yacht fleet",
      icon: <Anchor className="w-6 h-6" />
    },
    {
      title: "Concierge Service",
      description: "24/7 dedicated concierge for all your needs",
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      title: "Exclusive Events",
      description: "Access to members-only events and experiences",
      icon: <Waves className="w-6 h-6" />
    }
  ];

  const rightFeatures = [
    {
      title: "Professional Crew",
      description: "Experienced captains and crew at your service",
      icon: <Anchor className="w-6 h-6" />
    },
    {
      title: "Premium Catering",
      description: "Gourmet dining options from top Miami chefs",
      icon: <Sparkles className="w-6 h-6" />
    },
    {
      title: "Flexible Booking",
      description: "Book up to 12 months in advance",
      icon: <Waves className="w-6 h-6" />
    }
  ];

  return (
    <section className="py-32 bg-black relative overflow-hidden">
      {/* Silver Stars Background Pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${starPattern})`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'auto',
          backgroundPosition: '0 0',
          imageRendering: 'crisp-edges',
          opacity: 0.6,
        }}
      />
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-indigo-900/10" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Become A Member &
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Download The MBYC Mobile App Today
            </span>
          </h2>
          
          {/* App Store Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center gap-3 cursor-pointer border border-white/20"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs text-gray-400">Download on the</div>
                <div className="text-sm font-semibold text-white">App Store</div>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 flex items-center gap-3 cursor-pointer border border-white/20"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs text-gray-400">Get it on</div>
                <div className="text-sm font-semibold text-white">Google Play</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Left Features */}
          <div className="space-y-8">
            {leftFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-right"
              >
                <div className="flex items-center justify-end gap-4 mb-2">
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
                    {feature.icon}
                  </div>
                </div>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative mx-auto"
          >
            <div className="relative w-[390px] h-[844px] mx-auto">
              {/* iPhone Image */}
              <img 
                src="/api/media/apple-intelligence_hw__b7r46krxys9y_large_1751027471917.png" 
                alt="iPhone" 
                className="absolute inset-0 w-full h-full object-contain z-10"
              />
              
              {/* Screen Content - Auth Page with 3D Anamorphic Effect */}
              <div 
                className="absolute top-[80px] left-[30px] right-[30px] bottom-[80px] rounded-[40px] overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                  boxShadow: `
                    inset 0 2px 4px rgba(255, 255, 255, 0.1),
                    inset 0 -2px 4px rgba(0, 0, 0, 0.5),
                    0 0 20px rgba(147, 51, 234, 0.3)
                  `,
                  transform: 'perspective(1000px) rotateX(2deg)',
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Video Background WITHOUT dark overlay */}
                <div className="absolute inset-0">
                  {heroVideo && (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src={heroVideo.url} type={heroVideo.mimetype} />
                    </video>
                  )}
                </div>
                
                {/* 3D Edge Effect */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 3%),
                      linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 3%),
                      linear-gradient(to right, rgba(255,255,255,0.05) 0%, transparent 2%),
                      linear-gradient(to left, rgba(0,0,0,0.2) 0%, transparent 2%)
                    `,
                  }}
                />
                
                {/* Auth UI Content */}
                <div className="relative z-20 h-full flex flex-col justify-center px-8 py-12">
                  {/* Logo with Single Radiate Animation */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="mx-auto mb-8 relative"
                  >
                    {/* One-time Radiating Glow */}
                    <motion.div
                      className="absolute inset-0 -z-10"
                      initial={{ scale: 1, opacity: 0 }}
                      animate={{
                        scale: [1, 1.5, 1.5],
                        opacity: [0, 0.6, 0],
                      }}
                      transition={{
                        duration: 1.5,
                        ease: "easeOut"
                      }}
                    >
                      <div className="absolute inset-0 bg-white blur-[60px]" />
                    </motion.div>
                    
                    {/* Static Logo */}
                    <img 
                      src="/api/media/MBYC-LOGO-WHITE (1)_1751027380901.png" 
                      alt="MBYC" 
                      className="relative w-28 h-28 mx-auto"
                    />
                  </motion.div>
                  
                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white text-center mb-2">Welcome Back</h2>
                  <p className="text-gray-400 text-center text-sm mb-8">Sign in to your member account</p>
                  
                  {/* Form Fields */}
                  <div className="space-y-4 mb-6">
                    <div className="relative">
                      <input 
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm"
                        defaultValue="member@mbyc.com"
                      />
                    </div>
                    <div className="relative">
                      <input 
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 text-sm"
                        defaultValue="••••••••"
                      />
                    </div>
                  </div>
                  
                  {/* Sign In Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg mb-4 text-sm"
                  >
                    Sign In
                  </motion.button>
                  
                  {/* Divider */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1 h-px bg-white/20" />
                    <span className="text-gray-400 text-xs">OR</span>
                    <div className="flex-1 h-px bg-white/20" />
                  </div>
                  
                  {/* Face ID Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M7 3C5.9 3 5 3.9 5 5V8H7V5H10V3H7ZM17 3C18.1 3 19 3.9 19 5V8H21V5C21 2.79 19.21 1 17 1H14V3H17ZM7 21C5.9 21 5 20.1 5 19V16H3V19C3 21.21 4.79 23 7 23H10V21H7ZM17 21C18.1 21 19 20.1 19 19V16H21V19C21 21.21 19.21 23 17 23H14V21H17Z" 
                        fill="currentColor"
                      />
                    </svg>
                    Sign in with Face ID
                  </motion.button>
                  
                  {/* Footer Links */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-400 text-xs">
                      Not a member? 
                      <span className="text-purple-400 ml-1">Apply Now</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Features */}
          <div className="space-y-8">
            {rightFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-left"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-gray-400 ml-14">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}



// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      {/* More sections will be added here */}
    </div>
  );
}