import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronDown, Anchor, Sparkles, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import starPattern from "@assets/PF0007919-big_1751025963434.jpg";
import realisticIphone from "@assets/apple-intelligence_hw__b7r46krxys9y_large_1751026886721.png";

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
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-8xl font-bold text-white mb-6"
          style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          WELCOME TO THE
          <br />
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            MIAMI BEACH
          </span>
          <br />
          YACHT CLUB
        </motion.h1>
        
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

          {/* Hyper-realistic iPhone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative mx-auto"
          >
            <div className="relative w-[350px] h-[700px] mx-auto">
              {/* Realistic iPhone Image */}
              <img 
                src={realisticIphone} 
                alt="iPhone" 
                className="absolute inset-0 w-full h-full object-contain z-10"
              />
              
              {/* Screen Content - Positioned to fit the phone screen */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[310px] h-[670px] rounded-[2.5rem] overflow-hidden">
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
                  
                  {/* App Demo - Scrolling Member Experience */}
                  <div className="absolute inset-0 bg-black overflow-hidden">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center px-6 py-1 text-white text-xs">
                      <span>9:41 AM</span>
                      <div className="flex gap-1">
                        <div className="w-4 h-3 bg-white rounded-sm"></div>
                        <div className="w-4 h-3 bg-white rounded-sm"></div>
                        <div className="w-4 h-3 bg-white rounded-sm"></div>
                      </div>
                    </div>
                    
                    {/* Scrolling App Content */}
                    <motion.div
                      className="absolute inset-0 pt-8"
                      animate={{
                        y: [0, -1200, -2400, -3600, 0]
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut",
                        times: [0, 0.25, 0.5, 0.75, 1]
                      }}
                    >
                      {/* Screen 1: Dashboard */}
                      <div className="h-full bg-gradient-to-b from-gray-900 to-black p-6">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h3 className="text-white text-2xl font-bold">Welcome, Sarah</h3>
                            <p className="text-gray-400 text-sm">Platinum Member</p>
                          </div>
                          <img src="/api/media/MBYC-LOGO-WHITE_1750553590720.png" alt="MBYC" className="w-12 h-12" />
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6">
                            <h4 className="text-white font-semibold mb-2">Next Booking</h4>
                            <p className="text-white/90">Azure Dream - Tomorrow 2PM</p>
                            <p className="text-white/70 text-sm">4 hours • 6 guests</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                              <div className="text-purple-400 text-3xl font-bold">12</div>
                              <div className="text-gray-400 text-sm">Trips This Month</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                              <div className="text-purple-400 text-3xl font-bold">148</div>
                              <div className="text-gray-400 text-sm">Hours on Water</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Screen 2: Yacht Selection */}
                      <div className="h-full bg-gradient-to-b from-gray-900 to-black p-6">
                        <h3 className="text-white text-2xl font-bold mb-6">Select Your Yacht</h3>
                        <div className="space-y-4">
                          <div className="bg-white/10 backdrop-blur rounded-xl overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
                            <div className="p-4">
                              <h4 className="text-white font-semibold">Ocean Paradise</h4>
                              <p className="text-gray-400 text-sm">92ft • 12 guests • Miami Beach</p>
                              <button className="mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
                                Book Now
                              </button>
                            </div>
                          </div>
                          
                          <div className="bg-white/10 backdrop-blur rounded-xl overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-purple-600 to-pink-600"></div>
                            <div className="p-4">
                              <h4 className="text-white font-semibold">Sunset Majesty</h4>
                              <p className="text-gray-400 text-sm">85ft • 10 guests • Key Biscayne</p>
                              <button className="mt-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
                                Book Now
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Screen 3: Services */}
                      <div className="h-full bg-gradient-to-b from-gray-900 to-black p-6">
                        <h3 className="text-white text-2xl font-bold mb-6">Concierge Services</h3>
                        <div className="space-y-3">
                          <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-semibold">Private Chef</h4>
                              <p className="text-gray-400 text-sm">5-star dining experience</p>
                            </div>
                            <span className="text-purple-400">$1,200</span>
                          </div>
                          
                          <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-semibold">Spa & Wellness</h4>
                              <p className="text-gray-400 text-sm">Onboard massage therapy</p>
                            </div>
                            <span className="text-purple-400">$450</span>
                          </div>
                          
                          <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-semibold">Water Sports</h4>
                              <p className="text-gray-400 text-sm">Jet ski & equipment</p>
                            </div>
                            <span className="text-purple-400">$800</span>
                          </div>
                          
                          <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-semibold">Photography</h4>
                              <p className="text-gray-400 text-sm">Professional photographer</p>
                            </div>
                            <span className="text-purple-400">$600</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Screen 4: Profile */}
                      <div className="h-full bg-gradient-to-b from-gray-900 to-black p-6">
                        <div className="text-center mb-8">
                          <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-3xl font-bold">SP</span>
                          </div>
                          <h3 className="text-white text-2xl font-bold">Sarah Peterson</h3>
                          <p className="text-purple-400">Platinum Member Since 2023</p>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-gray-400">Membership Status</span>
                              <span className="text-purple-400 font-semibold">Active</span>
                            </div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-gray-400">Yacht Access</span>
                              <span className="text-white">Up to 100ft</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-400">Member Benefits</span>
                              <span className="text-white">Premium</span>
                            </div>
                          </div>
                          
                          <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold">
                            Upgrade Membership
                          </button>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Bottom Navigation */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur border-t border-white/10">
                      <div className="flex justify-around py-2">
                        <div className="p-2">
                          <div className="w-6 h-6 bg-purple-600 rounded"></div>
                        </div>
                        <div className="p-2">
                          <div className="w-6 h-6 bg-gray-600 rounded"></div>
                        </div>
                        <div className="p-2">
                          <div className="w-6 h-6 bg-gray-600 rounded"></div>
                        </div>
                        <div className="p-2">
                          <div className="w-6 h-6 bg-gray-600 rounded"></div>
                        </div>
                      </div>
                    </div>
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
        
        {/* App Store Buttons - Below Phone */}
        <motion.div 
          className="flex gap-4 justify-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <div className="bg-black rounded-lg px-6 py-3 flex items-center gap-3 border border-gray-800">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs text-gray-400">Download on the</div>
                <div className="text-lg font-semibold text-white">App Store</div>
              </div>
            </div>
          </motion.a>
          
          <motion.a
            href="https://play.google.com"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <div className="bg-black rounded-lg px-6 py-3 flex items-center gap-3 border border-gray-800">
              <svg className="w-8 h-8" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5Z"/>
                <path fill="#34A853" d="M20.16,10.81L17.89,9.5L15.39,12L17.89,14.5L20.16,13.19C20.5,12.92 20.75,12.5 20.75,12C20.75,11.5 20.5,11.08 20.16,10.81Z"/>
                <path fill="#FBBC05" d="M13.69,12L3.84,2.15C4.28,1.87 4.85,1.92 5.24,2.31L16.81,8.88L13.69,12Z"/>
                <path fill="#EA4335" d="M13.69,12L16.81,15.12L5.24,21.69C4.85,22.08 4.28,22.13 3.84,21.85L13.69,12Z"/>
              </svg>
              <div className="text-left">
                <div className="text-xs text-gray-400">GET IT ON</div>
                <div className="text-lg font-semibold text-white">Google Play</div>
              </div>
            </div>
          </motion.a>
        </motion.div>
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