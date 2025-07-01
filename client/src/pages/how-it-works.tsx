import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { VideoFooter } from "@/components/video-footer";
import { Footer } from "@/components/footer";
import { CheckCircle, Users, Calendar, Ship, Phone, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Apply for Membership",
    description: "Complete our exclusive application process to join Miami Beach Yacht Club. Our team reviews each application to ensure the perfect fit.",
    icon: <Users className="w-8 h-8" />,
    color: "from-purple-600 to-purple-700"
  },
  {
    number: "02",
    title: "Select Your Tier",
    description: "Choose from Silver, Gold, or Diamond membership tiers. Each tier offers different yacht access and booking privileges.",
    icon: <Star className="w-8 h-8" />,
    color: "from-purple-700 to-indigo-600"
  },
  {
    number: "03",
    title: "Book Your Experience",
    description: "Use our exclusive booking portal or call our 24/7 concierge. Book up to 12 months in advance with no blackout dates.",
    icon: <Calendar className="w-8 h-8" />,
    color: "from-indigo-600 to-indigo-700"
  },
  {
    number: "04",
    title: "Enjoy Premium Service",
    description: "Arrive at the marina and let our professional crew handle everything. From catering to water sports, we've got you covered.",
    icon: <Ship className="w-8 h-8" />,
    color: "from-indigo-700 to-purple-600"
  }
];

// Animated Yacht Component
const AnimatedYacht = ({ activeStep }: { activeStep: number }) => {
  // Motion values for yacht position
  const yachtX = useMotionValue(0);
  const yachtY = useMotionValue(0);
  
  // Spring animation for smooth movement
  const springX = useSpring(yachtX, { stiffness: 300, damping: 30 });
  const springY = useSpring(yachtY, { stiffness: 300, damping: 30 });

  // Update position based on active step
  useEffect(() => {
    yachtX.set(activeStep * 200);
    yachtY.set(activeStep * 80);
  }, [activeStep, yachtX, yachtY]);

  return (
    <motion.div
      className="fixed top-1/2 left-10 z-30 pointer-events-none"
      style={{
        x: springX,
        y: springY,
      }}
      animate={{
        rotate: [0, 2, -2, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
      }}
    >
      <motion.svg
        width="80"
        height="60"
        viewBox="0 0 32 24"
        className="drop-shadow-2xl filter"
        animate={{
          filter: [
            "drop-shadow(0 8px 16px rgba(147, 51, 234, 0.4))",
            "drop-shadow(0 12px 24px rgba(99, 102, 241, 0.6))",
            "drop-shadow(0 8px 16px rgba(147, 51, 234, 0.4))",
          ]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Yacht Hull */}
        <motion.path
          d="M4 16 Q8 12 16 12 Q24 12 28 16 Q26 20 16 20 Q6 20 4 16 Z"
          fill="url(#yachtHull)"
          stroke="#e0e0e0"
          strokeWidth="0.5"
          animate={{
            d: [
              "M4 16 Q8 12 16 12 Q24 12 28 16 Q26 20 16 20 Q6 20 4 16 Z",
              "M4 16 Q8 11 16 11 Q24 11 28 16 Q26 21 16 21 Q6 21 4 16 Z",
              "M4 16 Q8 12 16 12 Q24 12 28 16 Q26 20 16 20 Q6 20 4 16 Z"
            ]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Sail */}
        <motion.path
          d="M16 6 Q20 8 22 12 Q20 16 16 18 Z"
          fill="url(#yachtSail)"
          stroke="#e0e0e0"
          strokeWidth="0.5"
          animate={{
            d: [
              "M16 6 Q20 8 22 12 Q20 16 16 18 Z",
              "M16 6 Q21 9 23 12 Q21 15 16 18 Z",
              "M16 6 Q20 8 22 12 Q20 16 16 18 Z"
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Mast */}
        <motion.line
          x1="16"
          y1="4"
          x2="16"
          y2="18"
          stroke="#e0e0e0"
          strokeWidth="1"
          animate={{
            strokeWidth: [1, 1.2, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Yacht Details */}
        <motion.circle
          cx="12"
          cy="17"
          r="0.8"
          fill="#ff6b6b"
          animate={{
            opacity: [0.6, 1, 0.6],
            r: [0.8, 1, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <motion.circle
          cx="20"
          cy="17"
          r="0.8"
          fill="#4ecdc4"
          animate={{
            opacity: [1, 0.6, 1],
            r: [0.8, 1, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />

        {/* Water Wake Effect */}
        <motion.path
          d="M2 18 Q6 20 10 18 Q14 16 18 18 Q22 20 26 18 Q30 16 32 18"
          fill="none"
          stroke="rgba(59, 130, 246, 0.4)"
          strokeWidth="1"
          strokeDasharray="2 4"
          animate={{
            strokeDashoffset: [0, -12],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ 
            strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" },
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
        />

        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="yachtHull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="yachtSail" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ddd6fe" />
            <stop offset="50%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Sailing Trail Effect */}
      <motion.div
        className="absolute top-8 -left-20 w-16 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60"
        animate={{
          scaleX: [0, 1, 0],
          opacity: [0, 0.8, 0]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  
  // Scroll progress for yacht animation
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Track which step is currently in view
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = window.scrollY;
        const stepHeight = window.innerHeight * 0.8;
        const currentStep = Math.min(Math.floor(scrollTop / stepHeight), steps.length - 1);
        setActiveStep(currentStep);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black" ref={containerRef}>
      <Navigation />
      
      {/* Video Header */}
      <VideoHeader 
        title="How It Works"
        subtitle="Your journey to exclusive yacht experiences begins with four simple steps"
      />

      {/* Animated Yacht */}
      <AnimatedYacht activeStep={activeStep} />

      {/* Steps Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-32">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Step Number & Icon */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                  animate={{
                    scale: activeStep === index ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <motion.div 
                    className={`w-64 h-64 rounded-full bg-gradient-to-br ${step.color} p-1`}
                    animate={{
                      boxShadow: activeStep === index 
                        ? [
                            "0 0 20px rgba(147, 51, 234, 0.4)",
                            "0 0 40px rgba(99, 102, 241, 0.6)",
                            "0 0 20px rgba(147, 51, 234, 0.4)"
                          ]
                        : "0 0 0px rgba(147, 51, 234, 0)"
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="w-full h-full bg-black rounded-full flex flex-col items-center justify-center">
                      <div className="text-6xl font-bold text-white mb-4">{step.number}</div>
                      <motion.div 
                        className="p-4 rounded-full bg-white/10"
                        animate={{
                          backgroundColor: activeStep === index 
                            ? "rgba(147, 51, 234, 0.3)"
                            : "rgba(255, 255, 255, 0.1)",
                          scale: activeStep === index ? [1, 1.2, 1] : 1
                        }}
                        transition={{ 
                          backgroundColor: { duration: 0.5 },
                          scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                        }}
                      >
                        <motion.div
                          animate={{
                            color: activeStep === index ? "#a78bfa" : "#ffffff"
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          {step.icon}
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <motion.div 
                      className="absolute top-full left-1/2 transform -translate-x-1/2 w-px h-32 bg-gradient-to-b from-white/20 to-transparent"
                      animate={{
                        background: activeStep === index 
                          ? "linear-gradient(to bottom, rgba(147, 51, 234, 0.6), transparent)"
                          : "linear-gradient(to bottom, rgba(255, 255, 255, 0.2), transparent)"
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6"
                    style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    {step.title}
                  </h2>
                  <p className="text-xl text-gray-400 mb-8 max-w-2xl">
                    {step.description}
                  </p>
                  
                  {/* Features for each step */}
                  <div className="space-y-3">
                    {index === 0 && (
                      <>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Quick online application</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Background verification</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Exclusive member benefits</span>
                        </div>
                      </>
                    )}
                    {index === 1 && (
                      <>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Silver: Up to 64ft yachts</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Gold: Up to 80ft yachts</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Diamond: Full fleet access</span>
                        </div>
                      </>
                    )}
                    {index === 2 && (
                      <>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Online booking portal</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">24/7 concierge line</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Instant confirmation</span>
                        </div>
                      </>
                    )}
                    {index === 3 && (
                      <>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Professional captain & crew</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Gourmet catering options</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Water sports equipment</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Concierge Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-indigo-900/10" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-sm rounded-3xl p-12 border border-white/10"
          >
            <Phone className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              24/7 Concierge Service
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Our dedicated concierge team is always available to assist with bookings, 
              special requests, and ensuring your experience is perfect.
            </p>
            <div className="text-3xl font-bold text-purple-400 mb-8">
              Call: 786-551-3878
            </div>
            <Link href="/apply">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                Start Your Application
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Video CTA */}
      <VideoCTA />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}