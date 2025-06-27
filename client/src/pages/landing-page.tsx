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
          <source src={(heroVideo as any).url} type={(heroVideo as any).mimetype} />
        </video>
      )}
      
      {/* Light Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-8"
        >
          <img 
            src="/api/media/MBYC-LOGO-WHITE (1)_1751027380901.png" 
            alt="Miami Beach Yacht Club" 
            className="mx-auto w-[400px] md:w-[600px] lg:w-[700px] mb-8"
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
            Become A Member Today &
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Download the MBYC Mobile App
            </span>
          </h2>
          

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
            <div className="relative w-[300px] h-[650px] mx-auto">
              {/* iPhone Frame Image */}
              <img 
                src="/api/media/apple-intelligence_hw__b7r46krxys9y_large_1751028888126.png"
                alt="iPhone Frame"
                className="absolute inset-0 w-full h-full z-20 pointer-events-none"
              />
              
              {/* Screen Content - positioned to fit within the phone screen area */}
              <div className="absolute inset-0 flex items-center justify-center" style={{ paddingTop: '12px', paddingBottom: '12px' }}>
                <div className="relative w-[278px] h-[626px] rounded-[48px] overflow-hidden">
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
                  
                  {/* App UI Overlay - Login Form */}
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center px-6">
                    {/* Logo */}
                    <img 
                      src="/api/media/MBYC-LOGO-WHITE (1)_1751027380901.png" 
                      alt="Miami Beach Yacht Club" 
                      className="w-40 h-40 object-contain mb-6" 
                    />
                    
                    {/* Login Form */}
                    <div className="w-full max-w-[240px] space-y-4">
                      <h3 className="text-white text-xl font-bold text-center mb-2">Member Login</h3>
                      
                      {/* Username Input */}
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Username" 
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:outline-none focus:border-purple-400"
                          defaultValue="Simon"
                        />
                      </div>
                      
                      {/* Password Input */}
                      <div className="relative">
                        <input 
                          type="password" 
                          placeholder="Password" 
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 text-sm focus:outline-none focus:border-purple-400"
                          defaultValue="••••••••"
                        />
                      </div>
                      
                      {/* Login Button */}
                      <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg text-sm hover:from-purple-700 hover:to-indigo-700 transition-all">
                        Sign In
                      </button>
                      
                      {/* Footer Links */}
                      <div className="flex justify-between text-xs text-white/60 mt-4">
                        <a href="#" className="hover:text-white">Forgot Password?</a>
                        <a href="#" className="hover:text-white">Join MBYC</a>
                      </div>
                    </div>
                    
                    {/* Bottom Text */}
                    <p className="text-white/40 text-xs mt-8 text-center">
                      Exclusive access for MBYC members
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* App Store Badges Below Phone */}
            <div className="flex gap-4 justify-center mt-16">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <img 
                  src="/api/media/app-store-badge_1751029750830.png" 
                  alt="Download on the App Store" 
                  className="h-16 object-contain"
                />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <img 
                  src="/api/media/google-play-badge_1751029663061.png" 
                  alt="Get it on Google Play" 
                  className="h-16 object-contain"
                />
              </motion.a>
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