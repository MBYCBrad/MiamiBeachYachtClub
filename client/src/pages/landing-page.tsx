import { Link } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Anchor, Sparkles, Waves, Star, Users, Trophy, Shield, ArrowRight, Phone, Mail, MapPin, Clock, Check, Zap, Globe, Award, Crown, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import starPattern from "@assets/PF0007919-big_1751025963434.jpg";
import { useState } from "react";
import { VideoFooter } from "@/components/video-footer";

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
      
      {/* 3D Anamorphic Edges */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Edge */}
        <div 
          className="absolute top-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(to right, transparent 10%, rgba(147, 51, 234, 0.8) 50%, transparent 90%)',
            boxShadow: '0 2px 20px rgba(147, 51, 234, 0.5)',
            transform: 'perspective(1000px) rotateX(-45deg)',
            transformOrigin: 'top center'
          }}
        />
        
        {/* Bottom Edge */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{
            background: 'linear-gradient(to right, transparent 10%, rgba(99, 102, 241, 0.8) 50%, transparent 90%)',
            boxShadow: '0 -2px 20px rgba(99, 102, 241, 0.5)',
            transform: 'perspective(1000px) rotateX(45deg)',
            transformOrigin: 'bottom center'
          }}
        />
        
        {/* Left Edge */}
        <div 
          className="absolute top-0 left-0 bottom-0 w-1"
          style={{
            background: 'linear-gradient(to bottom, transparent 10%, rgba(147, 51, 234, 0.8) 50%, transparent 90%)',
            boxShadow: '2px 0 20px rgba(147, 51, 234, 0.5)',
            transform: 'perspective(1000px) rotateY(45deg)',
            transformOrigin: 'left center'
          }}
        />
        
        {/* Right Edge */}
        <div 
          className="absolute top-0 right-0 bottom-0 w-1"
          style={{
            background: 'linear-gradient(to bottom, transparent 10%, rgba(99, 102, 241, 0.8) 50%, transparent 90%)',
            boxShadow: '-2px 0 20px rgba(99, 102, 241, 0.5)',
            transform: 'perspective(1000px) rotateY(-45deg)',
            transformOrigin: 'right center'
          }}
        />
        
        {/* Corner Highlights for 3D Effect */}
        <div 
          className="absolute top-0 left-0 w-20 h-20"
          style={{
            background: 'radial-gradient(circle at 0% 0%, rgba(147, 51, 234, 0.4) 0%, transparent 70%)',
          }}
        />
        <div 
          className="absolute top-0 right-0 w-20 h-20"
          style={{
            background: 'radial-gradient(circle at 100% 0%, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
          }}
        />
        <div 
          className="absolute bottom-0 left-0 w-20 h-20"
          style={{
            background: 'radial-gradient(circle at 0% 100%, rgba(99, 102, 241, 0.4) 0%, transparent 70%)',
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-20 h-20"
          style={{
            background: 'radial-gradient(circle at 100% 100%, rgba(147, 51, 234, 0.4) 0%, transparent 70%)',
          }}
        />
      </div>

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



// Stats Section Component
function StatsSection() {
  const stats = [
    { value: "50+", label: "Luxury Yachts", icon: <Anchor className="w-8 h-8 text-white" /> },
    { value: "24/7", label: "Concierge Service", icon: <Phone className="w-8 h-8 text-white" /> },
    { value: "95%", label: "Member Satisfaction", icon: <Star className="w-8 h-8 text-white" /> },
    { value: "15+", label: "Years Experience", icon: <Award className="w-8 h-8 text-white" /> }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Why Choose
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> MBYC</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join Miami's most exclusive yacht club and experience luxury like never before
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 h-full"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  {stat.icon}
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2"
                >
                  {stat.value}
                </motion.div>
                <p className="text-gray-400 text-lg">{stat.label}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Packages Section Component
function PackagesSection() {
  const packages = [
    {
      name: "Silver",
      icon: <Anchor className="w-8 h-8 text-white" />,
      price: "Contact Us",
      features: [
        "Access to 40-64ft yachts",
        "2-4 concurrent bookings",
        "Professional captain & crew",
        "Basic concierge services",
        "Member events access"
      ],
      popular: false
    },
    {
      name: "Gold",
      icon: <Crown className="w-8 h-8 text-white" />,
      price: "Contact Us",
      features: [
        "Access to 65-74ft yachts",
        "4 concurrent bookings",
        "Priority booking",
        "Premium concierge services",
        "VIP event invitations",
        "Guest passes included"
      ],
      popular: true
    },
    {
      name: "Platinum",
      icon: <Sparkles className="w-8 h-8 text-white" />,
      price: "Contact Us",
      features: [
        "Access to 75-84ft yachts",
        "6-8 concurrent bookings",
        "24/7 dedicated concierge",
        "Luxury car transfers",
        "Private chef services",
        "Custom itinerary planning"
      ],
      popular: false
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Choose Your
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Membership</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            Select the perfect tier for your yachting lifestyle
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/pricing'}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            View All Membership Tiers
          </motion.button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className={`h-full rounded-2xl p-8 ${
                  pkg.popular 
                    ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-2 border-purple-500/50' 
                    : 'bg-gradient-to-br from-purple-900/10 to-indigo-900/10 border border-purple-500/20'
                } backdrop-blur-sm`}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    {pkg.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">{pkg.name}</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    {pkg.price}
                  </p>
                </div>
                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '/book-tour'}
                  className={`w-full py-3 rounded-full font-semibold transition-all ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700'
                      : 'bg-purple-900/20 text-purple-400 border border-purple-500/50 hover:bg-purple-900/30'
                  }`}
                >
                  Apply Now
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section Component
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Michael Chen",
      role: "Platinum Member",
      image: "/api/media/pexels-cottonbro-4065880_1750547001525.jpg",
      quote: "MBYC has transformed my weekends. The concierge service is exceptional, and the yacht selection is unmatched in Miami."
    },
    {
      name: "Sarah Williams",
      role: "Gold Member",
      image: "/api/media/pexels-anastasia-shuraeva-7662328_1750561361972.jpg",
      quote: "From booking to boarding, everything is seamless. The crew is professional and the experiences are unforgettable."
    },
    {
      name: "David Rodriguez",
      role: "Diamond Member",
      image: "/api/media/pexels-italo-melo-2379004_1750537290661.jpg",
      quote: "Being a Diamond member has opened doors to incredible networking opportunities. It's more than a yacht club - it's a lifestyle."
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/5 to-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Member
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Stories</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Hear from our members about their MBYC experience
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ y: -5 }}
                className="h-full bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-500/50"
                  />
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-purple-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <Quote className="w-8 h-8 text-purple-500/30 mb-4" />
                <p className="text-gray-300 italic">{testimonial.quote}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/book-tour'}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Join Our Community
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// Fleet Preview Section
function FleetPreviewSection() {
  const yachts = [
    {
      name: "Azure Dream",
      size: "65ft",
      capacity: "12 guests",
      image: "/api/media/pexels-albin-berlin-32056-919073_1750536883658.jpg"
    },
    {
      name: "Marina Breeze",
      size: "75ft",
      capacity: "15 guests",
      image: "/api/media/pexels-pixabay-163236_1750536883656.jpg"
    },
    {
      name: "Ocean Pearl",
      size: "85ft",
      capacity: "20 guests",
      image: "/api/media/pexels-nikola-johnny-mirkovic-660282-11887305_1750536883660.jpg"
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Our Luxury
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Fleet</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience Miami's finest collection of luxury yachts
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {yachts.map((yacht, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div
                whileHover={{ y: -10 }}
                className="group cursor-pointer"
                onClick={() => window.location.href = '/fleet'}
              >
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img 
                    src={yacht.image} 
                    alt={yacht.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2">{yacht.name}</h3>
                    <div className="flex items-center gap-4 text-gray-300">
                      <span className="flex items-center gap-1">
                        <Anchor className="w-4 h-4" />
                        {yacht.size}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {yacht.capacity}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/fleet'}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Explore Full Fleet
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: "How does MBYC membership work?",
      answer: "MBYC offers tiered memberships that provide access to our luxury yacht fleet. Each tier includes a specific number of concurrent bookings, yacht size access, and exclusive benefits."
    },
    {
      question: "What's included in my membership?",
      answer: "All memberships include professional captain and crew, fuel, maintenance, insurance, and basic refreshments. Higher tiers add premium services like gourmet catering and private chefs."
    },
    {
      question: "How far in advance can I book?",
      answer: "Members can book yachts up to 90 days in advance. Platinum and Diamond members receive priority booking windows for peak times and special events."
    },
    {
      question: "Can I bring guests?",
      answer: "Yes! All memberships allow guests. The number depends on yacht capacity and your membership tier. Gold members and above receive complimentary guest passes each month."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/5 to-black" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Frequently Asked
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Questions</span>
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-purple-900/10 transition-colors"
                >
                  <h3 className="text-xl font-semibold text-white pr-4">{faq.question}</h3>
                  <ChevronDown 
                    className={`w-6 h-6 text-purple-400 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-8 pb-6">
                        <p className="text-gray-400">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">Have more questions?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/contact'}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Contact Our Team
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// Final CTA Section with Video Background
function FinalCTASection() {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
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
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-bold text-white mb-6"
          style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
        >
          Ready to Join Miami's Most Exclusive
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Yacht Club?</span>
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          viewport={{ once: true }}
          className="text-xl text-gray-300 mb-10"
        >
          Start your luxury yachting journey today. Limited memberships available.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/book-tour'}
            className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all shadow-2xl"
          >
            Book Your Private Tour
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/contact'}
            className="px-10 py-5 bg-transparent border-2 border-white text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all"
          >
            Contact Us
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

// Footer Component
function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <img 
              src="/api/media/MBYC-LOGO-WHITE (1)_1751027380901.png" 
              alt="Miami Beach Yacht Club" 
              className="w-48 mb-4"
            />
            <p className="text-gray-400 text-sm">
              Miami's premier yacht club offering exclusive access to luxury vessels and world-class maritime experiences.
            </p>
          </div>
          
          {/* Main Menu */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider">Main Menu</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-purple-400 transition-colors">Home</Link></li>
              <li><Link href="/how-it-works" className="text-gray-400 hover:text-purple-400 transition-colors">How It Works</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-purple-400 transition-colors">Plans & Pricing</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-purple-400 transition-colors">Events</Link></li>
              <li><Link href="/fleet" className="text-gray-400 hover:text-purple-400 transition-colors">Fleet</Link></li>
              <li><Link href="/book-tour" className="text-gray-400 hover:text-purple-400 transition-colors">Book a Private Tour</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-purple-400 transition-colors">FAQ</Link></li>
              <li><Link href="/invest" className="text-gray-400 hover:text-purple-400 transition-colors">Invest</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-purple-400 transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-purple-400 mt-0.5" />
                <div>
                  <a href="tel:786-981-3875" className="text-gray-400 hover:text-purple-400 transition-colors">
                    786-981-3875
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-400 mt-0.5" />
                <a href="mailto:membership@mbyc.miami" className="text-gray-400 hover:text-purple-400 transition-colors">
                  membership@mbyc.miami
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5" />
                <div className="text-gray-400">
                  300 Alton Road, Suite 305b<br />
                  Miami Beach, Florida 33139<br />
                  United States
                </div>
              </div>
            </div>
          </div>
          
          {/* Opening Hours */}
          <div>
            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider">Opening Hours</h3>
            <div className="space-y-2 text-gray-400">
              <div className="flex justify-between">
                <span>Mon - Fri:</span>
                <span>9am - 6pm</span>
              </div>
              <div className="flex justify-between">
                <span>Sat:</span>
                <span>10am - 6pm</span>
              </div>
              <div className="flex justify-between">
                <span>Sun:</span>
                <span>10am - 5pm</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              ©2025 Miami Beach Yacht Club. All Rights Reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <PackagesSection />
      <TestimonialsSection />
      <FleetPreviewSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}