import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import { ChevronRight, Star, Shield, Globe, Users, Calendar, Award, TrendingUp, Phone, Mail, MapPin, Clock, Check, ArrowRight, Sparkles, Ship, Waves, Anchor, Compass, Flag, LifeBuoy, Navigation, Play, Pause, Volume2, VolumeX, ChevronDown, Zap, Crown, Diamond, Gem } from 'lucide-react';

export default function HomePage() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState(1);
  const [activeService, setActiveService] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -200]);

  const { data: heroVideo } = useQuery({ 
    queryKey: ['/api/media/hero/active']
  });

  const { data: yachts = [] } = useQuery({ 
    queryKey: ['/api/yachts'] 
  });

  const { data: services = [] } = useQuery({ 
    queryKey: ['/api/services'] 
  });

  const { data: events = [] } = useQuery({ 
    queryKey: ['/api/events'] 
  });

  useEffect(() => {
    if (heroVideo?.url) {
      const video = document.createElement('video');
      video.src = heroVideo.url;
      video.onloadeddata = () => setVideoLoaded(true);
      video.onerror = () => setIsVideoError(true);
    }
  }, [heroVideo]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX - innerWidth / 2) / innerWidth);
      mouseY.set((clientY - innerHeight / 2) / innerHeight);
      setMousePosition({ x: clientX, y: clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = window.scrollY / totalHeight;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGalleryImage((prev) => (prev + 1) % 8);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleVideo = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const features = [
    {
      title: "Exclusive Fleet Access",
      description: "Choose from our curated selection of 50+ luxury yachts ranging from 40ft to 200ft superyachts",
      icon: <Ship className="w-8 h-8" />,
      stats: "50+ Yachts",
      color: "from-blue-500 to-purple-600",
      image: yachts[0]?.images?.[0] || "/api/placeholder/600/400"
    },
    {
      title: "24/7 Concierge",
      description: "White-glove service with dedicated yacht specialists available around the clock",
      icon: <Phone className="w-8 h-8" />,
      stats: "24/7 Support",
      color: "from-purple-500 to-pink-600",
      image: "/api/placeholder/600/400"
    },
    {
      title: "Exclusive Events",
      description: "Private member gatherings, regattas, and curated yacht expeditions worldwide",
      icon: <Calendar className="w-8 h-8" />,
      stats: "100+ Events/Year",
      color: "from-pink-500 to-orange-600",
      image: events[0]?.images?.[0] || "/api/placeholder/600/400"
    },
    {
      title: "Premium Amenities",
      description: "Michelin-star chefs, spa services, water sports, and entertainment systems",
      icon: <Sparkles className="w-8 h-8" />,
      stats: "5-Star Service",
      color: "from-orange-500 to-yellow-600",
      image: services[0]?.images?.[0] || "/api/placeholder/600/400"
    }
  ];

  const membershipTiers = [
    {
      name: "Bronze",
      price: "$2,500",
      period: "per month",
      features: [
        "Access to yachts up to 40ft",
        "4 bookings per month",
        "Basic concierge services",
        "Member events access",
        "Priority support",
        "Digital membership card"
      ],
      color: "from-orange-600 to-orange-700",
      gradient: "from-orange-400 via-orange-500 to-orange-600",
      icon: <Shield className="w-12 h-12" />
    },
    {
      name: "Silver",
      price: "$5,000",
      period: "per month",
      features: [
        "Access to yachts up to 55ft",
        "8 bookings per month",
        "Priority concierge services",
        "VIP event invitations",
        "Complimentary catering",
        "Guest passes (4/month)",
        "Marina lounge access"
      ],
      color: "from-gray-400 to-gray-500",
      gradient: "from-gray-300 via-gray-400 to-gray-500",
      popular: true,
      icon: <Award className="w-12 h-12" />
    },
    {
      name: "Gold",
      price: "$10,000",
      period: "per month",
      features: [
        "Access to yachts up to 70ft",
        "Unlimited bookings",
        "Dedicated account manager",
        "Private chef services",
        "Helicopter transfers",
        "International destinations",
        "Exclusive merchandise",
        "Guest passes (8/month)"
      ],
      color: "from-yellow-500 to-yellow-600",
      gradient: "from-yellow-400 via-yellow-500 to-amber-600",
      icon: <Crown className="w-12 h-12" />
    },
    {
      name: "Platinum",
      price: "Contact Us",
      period: "bespoke pricing",
      features: [
        "Access to entire fleet",
        "Unlimited global bookings",
        "Personal yacht curator",
        "Custom itineraries",
        "Exclusive yacht purchases",
        "Private island access",
        "Celebrity chef services",
        "Unlimited guest passes",
        "Yacht ownership advisory"
      ],
      color: "from-purple-600 to-indigo-600",
      gradient: "from-purple-500 via-indigo-500 to-blue-600",
      icon: <Diamond className="w-12 h-12" />
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Tech Entrepreneur",
      content: "MBYC has transformed how I experience yachting. The seamless booking process and exceptional service make every voyage unforgettable. It's like having your own fleet without any of the hassles.",
      rating: 5,
      image: "/api/placeholder/80/80",
      yacht: "65ft Azimut"
    },
    {
      name: "David Chen",
      role: "Investment Banker",
      content: "The quality of the fleet and the attention to detail is unmatched. From sunset cruises to week-long adventures, every experience exceeds expectations. The concierge team anticipates every need.",
      rating: 5,
      image: "/api/placeholder/80/80",
      yacht: "85ft Princess"
    },
    {
      name: "Maria Rodriguez",
      role: "Fashion Designer",
      content: "MBYC delivers perfection every time. Whether it's a photoshoot on the water or entertaining clients, they make everything effortless. The variety of yachts means there's always the perfect vessel.",
      rating: 5,
      image: "/api/placeholder/80/80",
      yacht: "95ft Sunseeker"
    }
  ];

  const stats = [
    { value: "500+", label: "Active Members", icon: <Users className="w-6 h-6" /> },
    { value: "50+", label: "Luxury Yachts", icon: <Ship className="w-6 h-6" /> },
    { value: "98%", label: "Satisfaction Rate", icon: <Star className="w-6 h-6" /> },
    { value: "24/7", label: "Concierge Service", icon: <Phone className="w-6 h-6" /> }
  ];

  const featuredYachts = yachts.slice(0, 3);

  const experiences = [
    {
      title: "Sunset Cruises",
      description: "Romantic evening voyages with champagne and gourmet dining",
      image: "/api/placeholder/800/600",
      duration: "4 hours",
      price: "From $1,200"
    },
    {
      title: "Island Hopping",
      description: "Multi-day adventures exploring hidden coves and private beaches",
      image: "/api/placeholder/800/600", 
      duration: "3-7 days",
      price: "From $8,000"
    },
    {
      title: "Corporate Events",
      description: "Impress clients with meetings and celebrations on the water",
      image: "/api/placeholder/800/600",
      duration: "Full day",
      price: "From $5,000"
    },
    {
      title: "Water Sports",
      description: "Jet skiing, wakeboarding, and diving in crystal clear waters",
      image: "/api/placeholder/800/600",
      duration: "Half day",
      price: "From $2,500"
    }
  ];

  return (
    <WebsiteLayout>
      {/* Custom Cursor */}
      <motion.div
        className="fixed w-8 h-8 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16
        }}
      >
        <motion.div
          className="w-full h-full bg-white rounded-full"
          animate={{
            scale: hoveredFeature !== null ? 2 : 1,
            opacity: hoveredFeature !== null ? 0.5 : 0.8
          }}
        />
      </motion.div>

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 z-[9998]"
        style={{
          scaleX: scrollProgress,
          transformOrigin: "0%"
        }}
      />
      {/* Hero Section with Cinematic Video */}
      <section className="relative h-screen overflow-hidden">
        <motion.div 
          style={{ 
            opacity: heroOpacity, 
            scale: heroScale,
            y: heroY
          }}
          className="absolute inset-0"
        >
          {heroVideo?.url && !isVideoError ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  videoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <source src={heroVideo.url} type="video/mp4" />
              </video>
              
              {/* Video Controls */}
              <div className="absolute bottom-8 right-8 flex gap-2 z-20">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleVideo}
                  className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMute}
                  className="w-12 h-12 bg-white/10 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </motion.button>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-black" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        </motion.div>

        {/* Dynamic Particle System */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: 0
              }}
              animate={{ 
                y: [null, -200],
                scale: [0, 1, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: Math.random() * 20 + 10,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: "easeInOut"
              }}
            >
              <div className="relative">
                <div className="w-2 h-2 bg-white rounded-full" />
                <div className="absolute inset-0 bg-white rounded-full animate-ping" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Hero Content with Advanced Animations */}
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.3 }}
              className="mb-8"
            >
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-block"
              >
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-xl rounded-full text-white/90 text-sm font-medium border border-white/20">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Welcome to the Ultimate Yachting Experience
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </span>
              </motion.div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.5, delay: 0.5, type: "spring" }}
              className="text-6xl sm:text-7xl lg:text-9xl font-bold text-white mb-8 tracking-tight"
            >
              <motion.span
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ 
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="block text-transparent bg-clip-text"
                style={{
                  backgroundImage: "linear-gradient(90deg, #fff, #a78bfa, #fff, #818cf8, #fff)",
                  backgroundSize: "200% 100%"
                }}
              >
                Miami Beach
              </motion.span>
              <motion.span 
                className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-indigo-400 relative"
                animate={{ 
                  filter: ["hue-rotate(0deg)", "hue-rotate(360deg)"]
                }}
                transition={{ 
                  duration: 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                Yacht Club
                <motion.div
                  className="absolute -inset-x-20 -inset-y-10 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 blur-3xl"
                  animate={{ 
                    opacity: [0.5, 1, 0.5],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.7 }}
              className="text-2xl sm:text-3xl lg:text-4xl text-gray-100 mb-12 max-w-5xl mx-auto leading-relaxed font-light"
              style={{
                textShadow: "0 2px 20px rgba(0,0,0,0.5)"
              }}
            >
              Where luxury meets the ocean. Experience unparalleled maritime excellence 
              <span className="block mt-2 text-purple-300">with our exclusive fleet and world-class services.</span>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-6 justify-center mb-12"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/auth">
                  <a className="group relative px-12 py-6 overflow-hidden rounded-full font-bold text-xl transition-all transform flex items-center justify-center gap-3">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"
                      animate={{ 
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{
                        backgroundSize: "200% 100%"
                      }}
                    />
                    <span className="relative z-10 text-white">Start Your Journey</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-6 h-6 relative z-10 text-white" />
                    </motion.div>
                  </a>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/fleet">
                  <a className="group px-12 py-6 bg-white/10 backdrop-blur-xl text-white rounded-full font-bold text-xl hover:bg-white/20 transition-all transform border border-white/30 flex items-center justify-center gap-3">
                    Explore Our Fleet
                    <Ship className="w-6 h-6" />
                  </a>
                </Link>
              </motion.div>
            </motion.div>

            {/* Animated Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 1.2 }}
              className="flex flex-wrap justify-center gap-8 text-white/80 text-sm"
            >
              {[
                { icon: <Shield className="w-5 h-5" />, text: "Fully Licensed & Insured" },
                { icon: <Award className="w-5 h-5" />, text: "Award-Winning Service" },
                { icon: <Globe className="w-5 h-5" />, text: "Worldwide Destinations" }
              ].map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 + index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full"
                >
                  {badge.icon}
                  <span>{badge.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Ultra Premium Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
          >
            <div className="relative">
              <motion.div
                className="w-12 h-20 border-2 border-white/30 rounded-full flex justify-center"
                whileHover={{ scale: 1.1, borderColor: "rgba(255,255,255,0.6)" }}
              >
                <motion.div 
                  animate={{ 
                    y: [4, 24, 4],
                    opacity: [1, 0.3, 1]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-2 h-6 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full mt-2"
                />
              </motion.div>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-4 bg-white/10 rounded-full blur-xl"
              />
            </div>
            <p className="text-white/60 text-xs mt-4 font-medium tracking-widest uppercase">Scroll to explore</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Animated Stats Section with Counter Animation */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
        {/* Animated Background Gradient */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{ 
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{ 
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(120, 80, 255, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255, 80, 120, 0.3) 0%, transparent 50%)",
            backgroundSize: "200% 200%",
          }}
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className="relative group"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="text-center p-8 bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl rounded-3xl border border-gray-700/50 hover:border-purple-500/50 transition-all"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", delay: index * 0.1 + 0.2 }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl mb-4 text-white"
                  >
                    {stat.icon}
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", delay: index * 0.1 + 0.3 }}
                    className="text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 mb-2"
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-gray-400 text-lg font-medium">{stat.label}</p>
                  
                  {/* Hover Glow Effect */}
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Revolutionary Features Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        {/* Dynamic Background Pattern */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 30c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20zm0 10c-5.523 0-10 4.477-10 10s4.477 10 10 10 10-4.477 10-10-4.477-10-10-10z' fill='%239C92AC' fill-opacity='0.4'/%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '100px 100px'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.h2 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8"
              whileInView={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ 
                duration: 5,
                repeat: Infinity
              }}
              style={{
                backgroundImage: "linear-gradient(90deg, #fff, #a78bfa, #fff)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Unmatched Luxury At Every Turn
            </motion.h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
              Discover why Miami Beach Yacht Club is the premier choice for discerning yacht enthusiasts worldwide
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring" }}
                onHoverStart={() => setHoveredFeature(index)}
                onHoverEnd={() => setHoveredFeature(null)}
                className="relative group"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/50 transition-all"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover opacity-20"
                      animate={{
                        scale: hoveredFeature === index ? 1.1 : 1
                      }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative p-10 lg:p-12">
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                      className={`w-20 h-20 bg-gradient-to-r ${feature.color} rounded-3xl flex items-center justify-center mb-8 text-white shadow-2xl`}
                    >
                      {feature.icon}
                    </motion.div>
                    
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <motion.span 
                        className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400"
                        animate={{
                          opacity: hoveredFeature === index ? [1, 0.5, 1] : 1
                        }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {feature.stats}
                      </motion.span>
                      <motion.div
                        animate={{ x: hoveredFeature === index ? 10 : 0 }}
                        className="flex items-center gap-2 text-purple-400"
                      >
                        <span className="text-sm font-medium">Learn More</span>
                        <ChevronRight className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Hover Overlay Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-indigo-600/0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredFeature === index ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Yacht Showcase */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              Featured
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"> Luxury Yachts</span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto">
              Explore our handpicked selection of the finest yachts available for charter
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredYachts.map((yacht, index) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, y: 50, rotateY: -30 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, type: "spring" }}
                className="group relative"
              >
                <motion.div
                  whileHover={{ y: -10 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/50 transition-all"
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: "1000px"
                  }}
                >
                  {/* Image with Parallax Effect */}
                  <div className="relative h-80 overflow-hidden">
                    <motion.img 
                      src={yacht.images?.[0] || '/api/placeholder/600/400'} 
                      alt={yacht.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    
                    {/* Floating Badge */}
                    <motion.div
                      initial={{ x: 100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.2 + 0.5 }}
                      className="absolute top-6 right-6"
                    >
                      <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 backdrop-blur rounded-full text-white text-sm font-bold shadow-2xl">
                        {yacht.type}
                      </div>
                    </motion.div>

                    {/* Price Tag */}
                    <motion.div
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.2 + 0.6 }}
                      className="absolute bottom-6 left-6"
                    >
                      <div className="text-3xl font-bold text-white">
                        From <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">$5,000</span>/day
                      </div>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-3xl font-bold text-white mb-4">{yacht.name}</h3>
                    <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                      {yacht.description?.slice(0, 120)}...
                    </p>
                    
                    {/* Specs Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 bg-gray-800/50 rounded-2xl"
                      >
                        <p className="text-sm text-gray-400 mb-1">Length</p>
                        <p className="text-2xl font-bold text-white">{yacht.length}ft</p>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 bg-gray-800/50 rounded-2xl"
                      >
                        <p className="text-sm text-gray-400 mb-1">Guests</p>
                        <p className="text-2xl font-bold text-white">{yacht.capacity}</p>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-4 bg-gray-800/50 rounded-2xl"
                      >
                        <p className="text-sm text-gray-400 mb-1">Cabins</p>
                        <p className="text-2xl font-bold text-white">{yacht.cabins}</p>
                      </motion.div>
                    </div>
                    
                    <Link href={`/fleet/${yacht.id}`}>
                      <motion.a 
                        className="relative flex items-center justify-center gap-3 w-full py-4 rounded-2xl font-bold text-lg overflow-hidden group/btn"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600"
                          animate={{ 
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                          }}
                          transition={{ 
                            duration: 3,
                            repeat: Infinity
                          }}
                          style={{
                            backgroundSize: "200% 100%"
                          }}
                        />
                        <span className="relative z-10 text-white">Explore Yacht</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="relative z-10"
                        >
                          <ArrowRight className="w-5 h-5 text-white" />
                        </motion.div>
                      </motion.a>
                    </Link>
                  </div>

                  {/* Hover Glow */}
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-indigo-600/20 rounded-3xl blur-3xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: yacht.id === hoveredFeature ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <Link href="/fleet">
              <motion.a 
                className="inline-flex items-center gap-3 text-2xl text-purple-400 hover:text-purple-300 font-bold group"
                whileHover={{ scale: 1.05 }}
              >
                View Entire Fleet
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                </motion.div>
              </motion.a>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Interactive Membership Tiers */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 100% 100%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 0% 0%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              Choose Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"> Membership</span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto">
              Unlock exclusive access to our world-class fleet and premium services
            </p>
          </motion.div>

          {/* 3D Tier Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {membershipTiers.map((tier, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateX: -20 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={{ y: -20, rotateY: 5 }}
                onClick={() => setSelectedTier(index)}
                className="relative cursor-pointer"
                style={{
                  transformStyle: "preserve-3d",
                  perspective: "1000px"
                }}
              >
                {tier.popular && (
                  <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-20"
                  >
                    <div className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white text-sm font-bold shadow-2xl">
                      MOST POPULAR
                    </div>
                  </motion.div>
                )}
                
                <motion.div
                  className={`relative h-full p-8 rounded-3xl backdrop-blur-xl border-2 transition-all ${
                    selectedTier === index 
                      ? 'border-purple-500 bg-gradient-to-br from-purple-900/30 to-indigo-900/30' 
                      : tier.popular 
                        ? 'border-purple-500/50 bg-gray-900/80' 
                        : 'border-gray-700 bg-gray-900/60'
                  }`}
                  animate={{
                    scale: selectedTier === index ? 1.05 : 1
                  }}
                >
                  {/* Tier Icon */}
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                    className="mb-6"
                  >
                    <div className={`w-24 h-24 mx-auto bg-gradient-to-r ${tier.gradient} rounded-3xl flex items-center justify-center text-white shadow-2xl`}>
                      {tier.icon}
                    </div>
                  </motion.div>

                  {/* Tier Name */}
                  <h3 className={`text-3xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r ${tier.gradient}`}>
                    {tier.name}
                  </h3>

                  {/* Price */}
                  <div className="text-center mb-8">
                    <motion.div
                      animate={{ scale: selectedTier === index ? [1, 1.1, 1] : 1 }}
                      transition={{ duration: 0.5 }}
                      className="text-5xl font-bold text-white mb-2"
                    >
                      {tier.price}
                    </motion.div>
                    <p className="text-gray-400">{tier.period}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 + i * 0.05 }}
                        className="flex items-start gap-3"
                      >
                        <motion.div
                          whileHover={{ scale: 1.2, rotate: 360 }}
                          className="mt-0.5"
                        >
                          <Check className="w-5 h-5 text-purple-400 flex-shrink-0" />
                        </motion.div>
                        <span className="text-gray-300">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href="/auth">
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`block w-full py-4 text-center rounded-2xl font-bold text-lg transition-all ${
                        tier.popular || selectedTier === index
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700' 
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      Get Started
                    </motion.a>
                  </Link>

                  {/* Hover Glow */}
                  <motion.div
                    className={`absolute -inset-4 bg-gradient-to-r ${tier.gradient} rounded-3xl blur-3xl`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: selectedTier === index ? 0.3 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Services Carousel */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              Premium
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"> Concierge Services</span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto">
              Elevate your yachting experience with our exclusive range of luxury services
            </p>
          </motion.div>

          {/* Service Cards with Hover Effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.slice(0, 6).map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.8, rotateY: -45 }}
                whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring" }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="group relative cursor-pointer"
                onHoverStart={() => setActiveService(index)}
                onHoverEnd={() => setActiveService(-1)}
              >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/50 transition-all h-full">
                  {/* Image with Ken Burns Effect */}
                  <div className="relative h-64 overflow-hidden">
                    <motion.img 
                      src={service.images?.[0] || '/api/placeholder/600/400'} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                      animate={{
                        scale: activeService === index ? 1.3 : 1.1
                      }}
                      transition={{ duration: 10, ease: "linear" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    
                    {/* Category Badge */}
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="absolute top-6 left-6"
                    >
                      <div className="px-4 py-2 bg-purple-600/90 backdrop-blur rounded-full text-white text-sm font-bold">
                        {service.category}
                      </div>
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-white mb-3">{service.name}</h3>
                    <p className="text-gray-300 mb-6 line-clamp-2">{service.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <motion.div
                        animate={{ scale: activeService === index ? [1, 1.1, 1] : 1 }}
                        transition={{ duration: 0.5 }}
                        className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400"
                      >
                        ${service.price}
                      </motion.div>
                      <motion.div
                        animate={{ x: activeService === index ? 10 : 0 }}
                        className="flex items-center gap-2 text-purple-400"
                      >
                        <span className="text-sm font-medium">Book Now</span>
                        <ArrowRight className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-indigo-600/0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: activeService === index ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Experience Showcase */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              Unforgettable
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"> Experiences</span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto">
              Create memories that last a lifetime with our curated yacht experiences
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {experiences.map((experience, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, type: "spring" }}
                className="group relative"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="relative h-96 overflow-hidden rounded-3xl"
                >
                  {/* Background Image */}
                  <motion.img
                    src={experience.image}
                    alt={experience.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-10">
                    <motion.h3
                      initial={{ x: -30, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="text-4xl font-bold text-white mb-3"
                    >
                      {experience.title}
                    </motion.h3>
                    
                    <motion.p
                      initial={{ x: -30, opacity: 0 }}
                      whileInView={{ x: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="text-xl text-gray-200 mb-6"
                    >
                      {experience.description}
                    </motion.p>
                    
                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className="flex items-center justify-between"
                    >
                      <div className="flex gap-6">
                        <div>
                          <p className="text-sm text-gray-400">Duration</p>
                          <p className="text-lg font-semibold text-white">{experience.duration}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Starting</p>
                          <p className="text-lg font-semibold text-white">{experience.price}</p>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-white/10 backdrop-blur rounded-full text-white font-semibold hover:bg-white/20 transition-all flex items-center gap-2"
                      >
                        Explore
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </motion.div>
                  </div>

                  {/* Hover Effect */}
                  <motion.div
                    className="absolute inset-0 bg-purple-600/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: experience.title === hoveredFeature ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinematic Testimonials */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              What Our Members
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"> Say</span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto">
              Join hundreds of satisfied members who've discovered the MBYC difference
            </p>
          </motion.div>

          {/* Testimonial Carousel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.8 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/50">
                  <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Avatar */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="flex-shrink-0"
                    >
                      <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 p-1">
                          <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center text-white text-4xl font-bold">
                            {testimonials[activeTestimonial].name[0]}
                          </div>
                        </div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="absolute -inset-2 bg-gradient-to-r from-purple-600/30 to-indigo-600/30 rounded-full blur-xl"
                        />
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 text-center lg:text-left">
                      {/* Stars */}
                      <div className="flex justify-center lg:justify-start mb-6">
                        {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                          >
                            <Star className="w-6 h-6 text-yellow-400 fill-current" />
                          </motion.div>
                        ))}
                      </div>

                      {/* Quote */}
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl text-gray-300 mb-8 italic leading-relaxed"
                      >
                        "{testimonials[activeTestimonial].content}"
                      </motion.p>

                      {/* Author */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <p className="text-2xl font-bold text-white mb-1">
                          {testimonials[activeTestimonial].name}
                        </p>
                        <p className="text-lg text-purple-400 mb-2">
                          {testimonials[activeTestimonial].role}
                        </p>
                        <p className="text-sm text-gray-500">
                          Favorite Yacht: {testimonials[activeTestimonial].yacht}
                        </p>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-12 gap-3">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className="relative"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === activeTestimonial 
                        ? 'w-12 bg-gradient-to-r from-purple-600 to-indigo-600' 
                        : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                  {index === activeTestimonial && (
                    <motion.div
                      className="absolute inset-0 bg-purple-600/30 rounded-full blur-xl"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Journey Timeline */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              Your Journey
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"> Starts Here</span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto">
              From membership to your first voyage - we make luxury yachting effortless
            </p>
          </motion.div>

          <div className="relative">
            {/* Animated Timeline Line */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-purple-600 via-pink-600 to-indigo-600"
            />

            {/* Timeline Items */}
            {[
              { 
                step: "01", 
                title: "Choose Your Membership", 
                description: "Select from our four tiers based on your yachting needs and lifestyle",
                icon: <Users className="w-8 h-8" />,
                image: "/api/placeholder/600/400"
              },
              { 
                step: "02", 
                title: "Browse & Book", 
                description: "Access our fleet through our app or dedicated concierge service",
                icon: <Compass className="w-8 h-8" />,
                image: yachts[0]?.images?.[0] || "/api/placeholder/600/400"
              },
              { 
                step: "03", 
                title: "Customize Your Experience", 
                description: "Add premium services, catering, and entertainment to your voyage",
                icon: <Sparkles className="w-8 h-8" />,
                image: services[0]?.images?.[0] || "/api/placeholder/600/400"
              },
              { 
                step: "04", 
                title: "Set Sail in Luxury", 
                description: "Enjoy your perfectly curated yachting adventure with our crew",
                icon: <Anchor className="w-8 h-8" />,
                image: "/api/placeholder/600/400"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, type: "spring" }}
                className={`relative flex items-center mb-24 ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                }`}
              >
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-16 text-right' : 'pl-16'}`}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`inline-block ${index % 2 === 0 ? 'ml-auto' : ''}`}
                  >
                    <div className="relative group">
                      {/* Card */}
                      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all">
                        {/* Image */}
                        <div className="relative h-48 mb-6 rounded-2xl overflow-hidden">
                          <img 
                            src={item.image} 
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="flex items-start gap-4 mb-4">
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.8 }}
                            className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                          >
                            {item.icon}
                          </motion.div>
                          <div>
                            <span className="text-purple-400 font-bold text-2xl">{item.step}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                        <p className="text-gray-300 text-lg">{item.description}</p>
                      </div>

                      {/* Hover Glow */}
                      <motion.div
                        className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </motion.div>
                </div>
                
                {/* Center Circle */}
                <motion.div
                  whileHover={{ scale: 1.5 }}
                  className="absolute left-1/2 transform -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full ring-8 ring-black flex items-center justify-center text-white font-bold cursor-pointer"
                >
                  {index + 1}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              scale: [1, 1.5, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ 
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px]"
          >
            <div className="w-full h-full bg-gradient-to-r from-purple-600/10 via-transparent to-indigo-600/10 rounded-full blur-3xl" />
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              Sail
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"> Worldwide</span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto">
              From Miami to Monaco, Caribbean to Mediterranean - your perfect voyage awaits
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                destination: "Miami & Florida Keys",
                description: "Crystal waters, vibrant nightlife, and year-round sunshine",
                highlights: ["South Beach", "Key West", "Biscayne Bay"],
                image: yachts[0]?.images?.[0] || "/api/placeholder/600/400"
              },
              {
                destination: "Caribbean Islands",
                description: "Pristine beaches, hidden coves, and tropical paradise",
                highlights: ["Bahamas", "Virgin Islands", "St. Barts"],
                image: events[0]?.images?.[0] || "/api/placeholder/600/400"
              },
              {
                destination: "Mediterranean",
                description: "Historic ports, azure waters, and coastal glamour",
                highlights: ["French Riviera", "Italian Coast", "Greek Islands"],
                image: services[0]?.images?.[0] || "/api/placeholder/600/400"
              }
            ].map((location, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, type: "spring" }}
                className="group relative"
              >
                <motion.div
                  whileHover={{ y: -10 }}
                  className="relative h-full overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/50 transition-all"
                >
                  <div className="relative h-64 overflow-hidden">
                    <motion.img
                      src={location.image}
                      alt={location.destination}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.2 }}
                      transition={{ duration: 0.8 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    
                    <motion.div
                      initial={{ y: 100, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2 + 0.3 }}
                      className="absolute bottom-6 left-6 right-6"
                    >
                      <MapPin className="w-8 h-8 text-purple-400 mb-2" />
                      <h3 className="text-3xl font-bold text-white">{location.destination}</h3>
                    </motion.div>
                  </div>

                  <div className="p-8">
                    <p className="text-gray-300 text-lg mb-6">{location.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      {location.highlights.map((highlight, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.2 + i * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <Compass className="w-5 h-5 text-purple-400" />
                          <span className="text-gray-300">{highlight}</span>
                        </motion.div>
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                      Explore Destination
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Yacht Tracker */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600/20 backdrop-blur rounded-full mb-8"
            >
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 font-medium">LIVE FLEET STATUS</span>
            </motion.div>
            
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              Real-Time
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"> Fleet Tracker</span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto">
              Track our yachts in real-time and see availability at a glance
            </p>
          </motion.div>

          <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Map Visualization */}
              <div className="relative h-96 bg-gray-800/50 rounded-2xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="relative"
                  >
                    <Globe className="w-32 h-32 text-purple-400/20" />
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-4 h-4 bg-purple-400 rounded-full"
                        style={{
                          top: `${20 + Math.random() * 60}%`,
                          left: `${20 + Math.random() * 60}%`
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.4
                        }}
                      >
                        <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping" />
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Live Status */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white mb-6">Fleet Status</h3>
                {featuredYachts.map((yacht, index) => (
                  <motion.div
                    key={yacht.id}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-green-500' : index === 1 ? 'bg-yellow-500' : 'bg-red-500'
                      } animate-pulse`} />
                      <div>
                        <p className="text-white font-semibold">{yacht.name}</p>
                        <p className="text-sm text-gray-400">{yacht.length}ft • {yacht.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        index === 0 ? 'text-green-400' : index === 1 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {index === 0 ? 'Available' : index === 1 ? 'Returning Soon' : 'On Charter'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {index === 0 ? 'Miami Marina' : index === 1 ? 'ETA 2 hours' : 'Key West'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ with Animations */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              Frequently Asked
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"> Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: "How quickly can I book a yacht?",
                a: "With our 24/7 concierge service, you can book a yacht instantly. Most bookings are confirmed within minutes, and our team is always ready to accommodate last-minute requests."
              },
              {
                q: "What's included in the membership?",
                a: "All memberships include access to our fleet, concierge services, member events, and basic insurance. Higher tiers include additional perks like catering, priority booking, and exclusive access to superyachts."
              },
              {
                q: "Can I bring guests?",
                a: "Absolutely! Each yacht has a specific guest capacity, and you can bring friends and family on your adventures. Platinum members enjoy unlimited guest passes."
              },
              {
                q: "Are there any hidden fees?",
                a: "No hidden fees. Your membership covers yacht access, and you only pay extra for optional services like catering, special equipment, or extended trips."
              },
              {
                q: "What destinations are available?",
                a: "We operate throughout Florida, the Caribbean, and select international destinations. Platinum members have access to exclusive routes and private island destinations."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-purple-500/50 transition-all cursor-pointer"
                >
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-between">
                    {faq.q}
                    <ChevronDown className="w-6 h-6 text-purple-400 group-hover:rotate-180 transition-transform" />
                  </h3>
                  <p className="text-gray-300 text-lg leading-relaxed">{faq.a}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram-style Gallery */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              Life at
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"> MBYC</span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto">
              Follow our members' incredible journeys and experiences
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="relative aspect-square overflow-hidden rounded-2xl cursor-pointer group"
              >
                <AnimatePresence>
                  <motion.img
                    key={activeGalleryImage === index ? "active" : "inactive"}
                    src={
                      index % 3 === 0 ? yachts[0]?.images?.[0] : 
                      index % 3 === 1 ? services[0]?.images?.[0] : 
                      events[0]?.images?.[0] || "/api/placeholder/400/400"
                    }
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover"
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold mb-1">@mbyc_member</p>
                    <p className="text-gray-300 text-sm">Living the yacht life ⚓️</p>
                    <div className="flex items-center gap-4 mt-2">
                      <motion.div whileHover={{ scale: 1.2 }} className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-white fill-white" />
                        <span className="text-white text-sm">1,234</span>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.2 }} className="flex items-center gap-1">
                        <Ship className="w-4 h-4 text-white" />
                        <span className="text-white text-sm">432</span>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Instagram-style hover effect */}
                <motion.div
                  className="absolute inset-0 bg-white"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.1 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Yacht Matcher */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundImage: [
                "radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(79, 70, 229, 0.2) 0%, transparent 50%)",
                "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(147, 51, 234, 0.2) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur rounded-full mb-8"
            >
              <Zap className="w-5 h-5 text-purple-400" />
              <span className="text-purple-400 font-medium">AI-POWERED EXPERIENCE</span>
            </motion.div>
            
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              Find Your Perfect
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"> Yacht Match</span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto mb-12">
              Our AI analyzes your preferences to recommend the ideal yacht for your next adventure
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl rounded-3xl p-12 border border-gray-700/50"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold text-white mb-8">Tell us about your dream voyage</h3>
                
                <div className="space-y-6">
                  {[
                    { label: "Destination", value: "Caribbean Islands" },
                    { label: "Group Size", value: "8-12 guests" },
                    { label: "Experience Type", value: "Luxury & Relaxation" },
                    { label: "Duration", value: "One week" }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <label className="text-gray-400 text-sm mb-2 block">{item.label}</label>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative"
                      >
                        <input
                          type="text"
                          value={item.value}
                          readOnly
                          className="w-full px-6 py-4 bg-gray-800/50 rounded-2xl text-white border border-gray-700 focus:border-purple-500 transition-all cursor-pointer group-hover:border-purple-500/50"
                        />
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                      </motion.div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  Get AI Recommendations
                </motion.button>
              </div>

              <div className="relative">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotateY: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <div className="aspect-w-16 aspect-h-12 rounded-2xl overflow-hidden">
                    <img 
                      src={yachts[0]?.images?.[0] || "/api/placeholder/600/400"} 
                      alt="AI Recommended Yacht"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* AI Analysis Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-24 h-24 border-2 border-purple-400 rounded-lg"
                          style={{
                            top: `${20 + i * 25}%`,
                            left: `${15 + i * 20}%`
                          }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ 
                            opacity: [0, 1, 1, 0],
                            scale: [0.8, 1, 1, 0.8]
                          }}
                          transition={{
                            duration: 3,
                            delay: i * 0.5,
                            repeat: Infinity
                          }}
                        >
                          <motion.div
                            className="absolute -top-8 left-0 bg-purple-600 px-3 py-1 rounded-full text-white text-xs"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 1, 0] }}
                            transition={{
                              duration: 3,
                              delay: i * 0.5 + 0.5,
                              repeat: Infinity
                            }}
                          >
                            {i === 0 ? "Perfect Size" : i === 1 ? "Ideal Amenities" : "Best Route"}
                          </motion.div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-bold">AI Match Score</h4>
                      <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">98%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-600"
                        initial={{ width: 0 }}
                        whileInView={{ width: "98%" }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Augmented Reality Preview */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur rounded-full mb-8"
            >
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-purple-400 font-medium">NEW TECHNOLOGY</span>
            </motion.div>
            
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-8">
              View in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400"> Augmented Reality</span>
            </h2>
            <p className="text-2xl text-gray-400 max-w-4xl mx-auto">
              Experience our yachts in your space with cutting-edge AR technology
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/50 backdrop-blur-xl rounded-3xl overflow-hidden"
            >
              <div className="aspect-w-16 aspect-h-9 relative">
                <img 
                  src="/api/placeholder/1200/675" 
                  alt="AR Preview"
                  className="w-full h-full object-cover"
                />
                
                {/* AR Interface Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40">
                  {/* AR Grid */}
                  <svg className="absolute inset-0 w-full h-full opacity-20">
                    <defs>
                      <pattern id="ar-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#ar-grid)" />
                  </svg>

                  {/* AR Tracking Points */}
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-4 h-4"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${10 + Math.random() * 80}%`
                      }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.2,
                        repeat: Infinity
                      }}
                    >
                      <div className="w-full h-full bg-purple-400 rounded-full" />
                      <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping" />
                    </motion.div>
                  ))}

                  {/* AR Controls */}
                  <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="px-8 py-4 bg-white/10 backdrop-blur rounded-2xl text-white font-semibold flex items-center gap-3 hover:bg-white/20 transition-all"
                    >
                      <Phone className="w-5 h-5" />
                      View in AR
                    </motion.button>

                    <div className="flex gap-4">
                      {["1:1", "Interior", "360°"].map((mode, index) => (
                        <motion.button
                          key={mode}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-6 py-3 rounded-xl font-medium transition-all ${
                            index === 0 
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                              : 'bg-white/10 text-white hover:bg-white/20'
                          }`}
                        >
                          {mode}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Ultimate CTA Section */}
      <section className="py-40 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 30,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -top-1/2 -right-1/2 w-full h-full opacity-20"
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 rounded-full blur-3xl" />
          </motion.div>
          <motion.div
            animate={{ 
              rotate: -360,
              scale: [1, 1.3, 1]
            }}
            transition={{ 
              duration: 40,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute -bottom-1/2 -left-1/2 w-full h-full opacity-20"
          >
            <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 rounded-full blur-3xl" />
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", duration: 1 }}
          >
            {/* Icon */}
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block mb-8"
            >
              <div className="w-32 h-32 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center">
                <Ship className="w-16 h-16 text-white" />
              </div>
            </motion.div>

            {/* Heading */}
            <motion.h2 
              className="text-6xl sm:text-7xl lg:text-8xl font-bold text-white mb-8"
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", duration: 1 }}
            >
              Your Luxury Yacht
              <motion.span 
                className="block mt-4"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity
                }}
                style={{
                  backgroundImage: "linear-gradient(90deg, #fff, #a78bfa, #fff, #ec4899, #fff)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}
              >
                Awaits
              </motion.span>
            </motion.h2>
            
            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-3xl text-gray-100 mb-16 max-w-4xl mx-auto leading-relaxed"
            >
              Join Miami Beach Yacht Club today and embark on extraordinary maritime adventures
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-8 justify-center mb-16"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/auth">
                  <a className="group relative px-16 py-8 overflow-hidden rounded-full font-bold text-2xl transition-all transform flex items-center justify-center gap-4">
                    <motion.div
                      className="absolute inset-0 bg-white"
                    />
                    <span className="relative z-10 text-purple-900">Become a Member</span>
                    <Sparkles className="w-8 h-8 relative z-10 text-purple-900 group-hover:rotate-12 transition-transform" />
                  </a>
                </Link>
              </motion.div>
              
              <motion.a 
                href="tel:+13055559248"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-16 py-8 bg-transparent text-white rounded-full font-bold text-2xl border-4 border-white hover:bg-white hover:text-purple-900 transition-all transform flex items-center justify-center gap-4"
              >
                <Phone className="w-8 h-8" />
                Call Now
              </motion.a>
            </motion.div>

            {/* Trust Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="flex flex-wrap justify-center gap-12 text-white/90 text-lg"
            >
              {[
                { icon: <Shield className="w-6 h-6" />, text: "Licensed & Insured" },
                { icon: <TrendingUp className="w-6 h-6" />, text: "500+ Happy Members" },
                { icon: <Award className="w-6 h-6" />, text: "5-Star Rated" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur rounded-full"
                >
                  {item.icon}
                  <span className="font-medium">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight
              }}
              animate={{ 
                y: [null, Math.random() * -200 - 100],
                x: [null, Math.random() * 200 - 100]
              }}
              transition={{
                duration: Math.random() * 20 + 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: Math.random() * 10 + 10, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 bg-white/20 rounded-full"
              />
            </motion.div>
          ))}
        </div>
      </section>
    </WebsiteLayout>
  );
}