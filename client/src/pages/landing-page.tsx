import { Link, useLocation } from "wouter";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ChevronDown, Anchor, Sparkles, Waves, Star, Users, Trophy, Shield, ArrowRight, Phone, Mail, MapPin, Clock, Check, Zap, Globe, Award, Crown, Quote, ChevronLeft, ChevronRight, User, Package, CreditCard, CheckCircle, Ship, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { Yacht } from "@shared/schema";
import { Navigation } from "@/components/navigation";
import starPattern from "@assets/PF0007919-big_1751025963434.jpg";
import { useState } from "react";
import { VideoFooter } from "@/components/video-footer";
import { ApplicationModal } from "@/components/application-modal";

// Membership Tiers Data
const membershipTiers = [
  {
    name: "gold",
    title: "Gold Membership",
    icon: <Crown className="w-6 h-6" />,
    price: "$5,000/month + $25,000 One Time Member Ownership Fee",
    yachtSize: "Up to 70ft",
    features: ["Unlimited reservations 4 Bookings at a time", "2 on weekdays and 2 on weekends", "Future Access To Marinas In Caribbeans, Europe & More"],
    color: "from-yellow-400 to-yellow-500"
  },
  {
    name: "platinum",
    title: "Platinum Membership",
    icon: <Star className="w-6 h-6" />,
    price: "$7,500/month + $50,000 One Time Member Ownership Fee",
    yachtSize: "Up to 80ft",
    features: ["Unlimited reservations 6 Bookings at a time", "3 on weekdays and 3 on weekends", "Future Access To Marinas In Caribbeans, Europe & More"],
    color: "from-gray-300 to-gray-400"
  },
  {
    name: "diamond",
    title: "Diamond Membership",
    icon: <Sparkles className="w-6 h-6" />,
    price: "$10,000/month + $100,000 One Time Member Ownership Fee",
    yachtSize: "Up to 100ft",
    features: ["Unlimited reservations 6 Bookings at a time", "3 on weekdays and 3 on weekends", "Future Access To Marinas In Caribbeans, Europe & More"],
    color: "from-blue-400 to-purple-500"
  }
];


// Hero Section with Video Background

// Hero Section with Video Background
function HeroSection({ onApplyClick }: { onApplyClick: () => void }) {
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
        {/* Top Edge - Enhanced blur to blend into black background */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
        
        {/* Bottom Edge - Deeper for mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Left Edge - Narrower */}
        <div className="absolute top-0 left-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-black/40 to-transparent" />
        
        {/* Right Edge - Narrower */}
        <div className="absolute top-0 right-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto mt-16 sm:mt-20 lg:mt-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-6 sm:mb-8"
        >
          <img 
            src="/api/media/MBYC-LOGO-WHITE (1)_1751027380901.png" 
            alt="Miami Beach Yacht Club" 
            className="mx-auto w-[280px] sm:w-[400px] md:w-[500px] lg:w-[600px] xl:w-[700px] mb-6 sm:mb-8"
          />
        </motion.div>
        


        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center"
        >
          <Button 
            size="lg" 
            onClick={onApplyClick}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-base sm:text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl"
          >
            APPLY NOW
          </Button>
          <Link href="/book-tour">
            <Button 
              variant="outline"
              size="lg" 
              className="border-2 border-white/30 text-white hover:bg-white/10 px-6 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 text-base sm:text-lg rounded-full transform hover:scale-105 transition-all duration-300"
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
    <section className="py-16 sm:py-24 lg:py-32 bg-black relative overflow-hidden">
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
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16 lg:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Become A Member Today &
            <br />
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Download the MBYC Mobile App
            </span>
          </h2>
          

        </motion.div>

        {/* Mobile: Top 3 features */}
        <div className="lg:hidden space-y-6 mb-12">
          {leftFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{feature.title}</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-center">
          {/* Left Features - Desktop Only */}
          <div className="hidden lg:block space-y-8">
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
                  <h3 className="text-xl lg:text-2xl font-bold text-white">{feature.title}</h3>
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex-shrink-0">
                    {feature.icon}
                  </div>
                </div>
                <p className="text-base text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative mx-auto lg:order-2"
          >
            <div className="relative w-[240px] sm:w-[280px] lg:w-[300px] h-[520px] sm:h-[600px] lg:h-[650px] mx-auto">
              {/* iPhone Frame Image */}
              <img 
                src="/api/media/apple-intelligence_hw__b7r46krxys9y_large_1751028888126.png"
                alt="iPhone Frame"
                className="absolute inset-0 w-full h-full z-20 pointer-events-none"
              />
              
              {/* Screen Content - properly sized to fit within phone frame */}
              <div className="absolute inset-0 flex items-center justify-center p-[12%]">
                <div className="relative w-full h-full rounded-[12%] overflow-hidden">
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
                  
                  {/* 3D Anamorphic Edges for Mobile Screen */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Top Edge - Enhanced blur to blend into black background */}
                    <div className="absolute top-0 left-0 right-0 h-[10%] bg-gradient-to-b from-black via-black/80 to-transparent rounded-t-[12%]" />
                    
                    {/* Bottom Edge - Deeper for mobile */}
                    <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-gradient-to-t from-black/40 to-transparent rounded-b-[12%]" />
                    
                    {/* Left Edge - Narrower */}
                    <div className="absolute top-0 left-0 bottom-0 w-[4%] bg-gradient-to-r from-black/40 to-transparent rounded-l-[12%]" />
                    
                    {/* Right Edge - Narrower */}
                    <div className="absolute top-0 right-0 bottom-0 w-[4%] bg-gradient-to-l from-black/40 to-transparent rounded-r-[12%]" />
                  </div>
                  
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mt-8 sm:mt-12 lg:mt-16">
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex justify-center"
              >
                <img 
                  src="/api/media/app-store-badge_1751029750830.png" 
                  alt="Download on the App Store" 
                  className="h-12 sm:h-14 lg:h-16 object-contain mx-auto"
                />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex justify-center"
              >
                <img 
                  src="/api/media/google-play-badge_1751029663061.png" 
                  alt="Get it on Google Play" 
                  className="h-12 sm:h-14 lg:h-16 object-contain mx-auto"
                />
              </motion.a>
            </div>
          </motion.div>

          {/* Right Features - Desktop Only */}
          <div className="hidden lg:block space-y-8">
            {rightFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-left"
              >
                <div className="flex items-center justify-start gap-4 mb-2">
                  <div className="p-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-base text-gray-400 ml-14">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: Bottom 3 features */}
        <div className="lg:hidden space-y-6 mt-12">
          {rightFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex-shrink-0">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">{feature.title}</h3>
              </div>
              <p className="text-sm sm:text-base text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}



// Stats Section Component
function StatsSection() {
  const stats = [
    { value: "6+", label: "Luxury Yachts", icon: <Anchor className="w-8 h-8 text-white" /> },
    { value: "24/7", label: "Concierge Service", icon: <Phone className="w-8 h-8 text-white" /> },
    { value: "95%", label: "Member Satisfaction", icon: <Star className="w-8 h-8 text-white" /> },
    { value: "15+", label: "Years Experience", icon: <Award className="w-8 h-8 text-white" /> }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Why Choose
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> MBYC</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto px-4">
            Join Miami's most exclusive yacht club and experience luxury like never before
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
                className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 h-full"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white">
                    {stat.icon}
                  </div>
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                  viewport={{ once: true }}
                  className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2"
                >
                  {stat.value}
                </motion.div>
                <p className="text-gray-400 text-sm sm:text-base lg:text-lg">{stat.label}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Packages Section Component
function PackagesSection({ onApplyClick }: { onApplyClick?: () => void }) {
  const packages = [
    {
      name: "Gold",
      nameSubtext: "MEMBERSHIP",
      icon: <Crown className="w-8 h-8 text-white" />,
      price: "$5,000",
      priceSubtext: "every month",
      membershipFee: "+$25,000 One Time Member Ownership Fee",
      features: [
        "Access Yachts Up To 70ft",
        "Future Access To Marinas In Caribbeans, Europe & More..."
      ],
      detailedDescription: "Unlimited reservations 4 Bookings at a time. *Gold members are entitled to four (4) reservations concurrently on the calendar, two (2) on weekdays and two (2) on weekends.",
      popular: false
    },
    {
      name: "Platinum", 
      nameSubtext: "MEMBERSHIP",
      icon: <Sparkles className="w-8 h-8 text-white" />,
      price: "$7,500",
      priceSubtext: "every month",
      membershipFee: "+$50,000 One Time Member Ownership Fee",
      features: [
        "Access Yachts Up To 80ft",
        "Future Access To Marinas In Caribbeans, Europe & More..."
      ],
      detailedDescription: "Unlimited reservations 6 Bookings at a time. *Platinum members are entitled to six (6) reservations concurrently on the calendar, no more than three (3) on weekdays and with three (3) on weekends.",
      popular: true
    },
    {
      name: "Diamond",
      nameSubtext: "MEMBERSHIP", 
      icon: <Award className="w-8 h-8 text-white" />,
      price: "$10,000",
      priceSubtext: "every month",
      membershipFee: "+$100,000 One Time Member Ownership Fee",
      features: [
        "Access Yachts Up To 100ft",
        "Future Access To Marinas In Caribbeans, Europe & More..."
      ],
      detailedDescription: "Unlimited reservations 6 Bookings at a time. *Diamond members are entitled to six (6) reservations concurrently on the calendar, three (3) on weekdays and three (3) on weekends.",
      popular: false
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 sm:mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Choose Your
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"> Membership</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
            Select the perfect tier for your yachting lifestyle
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/pricing'}
            className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all text-sm sm:text-base"
          >
            View All Membership Tiers
          </motion.button>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                className={`h-full rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 ${
                  pkg.popular 
                    ? 'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-2 border-purple-500/50' 
                    : 'bg-gradient-to-br from-purple-900/10 to-indigo-900/10 border border-purple-500/20'
                } backdrop-blur-sm`}
              >
                <div className="text-center mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white">
                      {pkg.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-1">{pkg.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 tracking-widest">{pkg.nameSubtext}</p>
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                    {pkg.price}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">{pkg.priceSubtext}</p>
                  <p className="text-xs sm:text-sm text-purple-400 font-semibold mb-4 sm:mb-6">{pkg.membershipFee}</p>
                </div>
                <ul className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 sm:gap-3">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-purple-900/10 rounded-lg border border-purple-500/20">
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{pkg.detailedDescription}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onApplyClick || (() => window.location.href = '/book-tour')}
                  className={`w-full py-2.5 sm:py-3 rounded-full font-semibold transition-all text-sm sm:text-base ${
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
        
        {/* Additional Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8">
            <p className="text-gray-300 text-center leading-relaxed mb-6">
              The Member Ownership Fee is a one-time, lifetime fee that grants ownership of a membership which owns the right to use the yachts. As long as membership dues are maintained, and once we reach the maximum number of memberships sold, new members will only be able to join by purchasing a membership from an existing member through MBYC directly.
            </p>
            <div className="text-center">
              <p className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent italic">
                The bookings replenish 48 hours after you complete your trip.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Mariner's Membership Section Component
function MarinersSection({ onApplyClick }: { onApplyClick?: () => void }) {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black"></div>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
            MARINER'S MEMBERSHIP
          </h2>
          <p className="text-xl bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold tracking-wider" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>
            THE ULTIMATE FLEXIBLE YACHTING EXPERIENCE
          </p>
          <div className="max-w-4xl mx-auto mt-8">
            <p className="text-gray-300 leading-relaxed text-lg" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
              The <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">Mariner's Membership</span> is designed for those who seek <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">ultimate flexibility</span> in their yachting experience. This <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">à la carte</span> membership allows you to tailor your access to the club on a <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">month-to-month basis</span>, choosing your membership tier based on your plans and needs.
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300"
          >
            <h3 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>HOW IT WORKS:</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm px-2 py-1 rounded-full min-w-[24px] text-center">1</span>
                <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Membership can <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">begin on the 1st or 15th</span> of any month.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm px-2 py-1 rounded-full min-w-[24px] text-center">2</span>
                <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Members can <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">change tiers each month</span> depending on their schedule.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm px-2 py-1 rounded-full min-w-[24px] text-center">3</span>
                <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}><span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">Example:</span> Be a Gold Member from <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Feb 15 - March 15</span>, switch to Diamond from <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">March 15 - April 15</span>, and take a break until returning in September, without paying for unused months.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm px-2 py-1 rounded-full min-w-[24px] text-center">4</span>
                <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}><span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">No long-term commitments</span>, only pay for the months you choose to be active.</p>
              </div>
            </div>
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-purple-900/30 to-indigo-900/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300"
          >
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>PRICING</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg p-4 border border-purple-500/20">
                <p className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>One-Time Member Ownership Fee:</p>
                <p className="text-3xl font-bold text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>$10,000</p>
              </div>
              <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg p-4 border border-purple-500/20">
                <p className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold mb-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Monthly Fee: 2X the standard membership rate</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Gold:</span>
                    <span className="text-white font-bold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>$10,000/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Platinum:</span>
                    <span className="text-white font-bold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>$15,000/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Diamond:</span>
                    <span className="text-white font-bold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>$20,000/month</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits & Outing Access */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300"
          >
            <h3 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>BENEFITS & OUTING ACCESS</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Gold Membership:</p>
                  <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>4 four-hour outings per month</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Platinum Membership:</p>
                  <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>6 four-hour outings per month</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Award className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Diamond Membership:</p>
                  <p className="text-gray-300" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>6 four-hour outings per month</p>
                  <p className="text-sm text-purple-300 mt-1" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>Diamond members get 2 outings on the 95' yacht, and the remaining 4 outings must be on other yachts in the fleet.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Flexibility Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 max-w-6xl mx-auto"
        >
          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-8 hover:border-purple-400/50 transition-all duration-300">
            <h3 className="text-3xl font-bold text-white mb-6 text-center" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}>FLEXIBILITY:</h3>
            <p className="text-gray-300 leading-relaxed mb-6 text-center text-lg" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
              This membership is perfect for those who <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">split their time between locations</span>, have <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">changing schedules</span>, or want the <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">flexibility to experience different levels of membership</span> throughout the year without any long-term obligations.
            </p>
            <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg p-6 border border-purple-500/20">
              <p className="text-gray-300 leading-relaxed" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">Mariner's Members</span> can switch to a yearly membership plan at any time, and their initial <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">$10,000 Member Ownership fee</span> will be credited towards their yearly membership. And by switching to full time membership your <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent font-semibold">monthly fees will be cut in half</span>.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Apply Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onApplyClick || (() => window.location.href = '/apply')}
            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-full text-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif' }}
          >
            APPLY NOW
          </motion.button>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif' }}>
            Ready to get started? Contact us today to learn more and secure your Mariner's Membership at The Miami Beach Yacht Club!
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// Testimonials Section Component
function TestimonialsSection({ onApplyClick }: { onApplyClick: () => void }) {
  const testimonials = [
    {
      name: "Michael Chen",
      role: "Platinum Member",
      image: "/api/media/2018_10_01_13_06_40_1880672045400179171_458353437_1750933334676_176907645.jpg",
      quote: "MBYC has transformed my weekends. The concierge service is exceptional, and the yacht selection is unmatched in Miami."
    },
    {
      name: "Sarah Williams",
      role: "Gold Member",
      image: "/api/media/QK_5314_credit_Quin_BISSET_665x443_1751116152867_804854212.jpg",
      quote: "From booking to boarding, everything is seamless. The crew is professional and the experiences are unforgettable."
    },
    {
      name: "David Rodriguez",
      role: "Diamond Member",
      image: "/api/media/IMG_0243_2_1751116578225_891415775.jpg",
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
            onClick={onApplyClick}
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
  const { data: yachts = [], isLoading } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts'],
  });

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
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative overflow-hidden rounded-2xl mb-4 bg-gray-800 animate-pulse"
              >
                <div className="w-full h-64 bg-gray-700" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="h-6 bg-gray-600 rounded mb-2" />
                  <div className="flex gap-4">
                    <div className="h-4 w-16 bg-gray-600 rounded" />
                    <div className="h-4 w-20 bg-gray-600 rounded" />
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            (yachts as Yacht[]).slice(0, 3).map((yacht: Yacht, index: number) => (
              <motion.div
                key={yacht.id}
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
                      src={yacht.imageUrl || yacht.images?.[0] || '/api/media/pexels-pixabay-163236_1750537277230.jpg'} 
                      alt={yacht.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Lock Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 flex items-start justify-center pt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                      <Lock className="w-16 h-16 text-white" />
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-2">{yacht.name}</h3>
                      <div className="flex items-center gap-4 text-gray-300">
                        <span className="flex items-center gap-1">
                          <Anchor className="w-4 h-4" />
                          {yacht.size}ft
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {yacht.capacity} guests
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))
          )}
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
function FinalCTASection({ onApplyClick }: { onApplyClick: () => void }) {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });

  return (
    <section className="relative min-h-[68vh] flex items-center justify-center overflow-hidden">
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
      
      {/* 3D Anamorphic Edges */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top Edge - Enhanced blur to blend into black background */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
        
        {/* Bottom Edge - Deeper for mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Left Edge - Narrower */}
        <div className="absolute top-0 left-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-black/40 to-transparent" />
        
        {/* Right Edge - Narrower */}
        <div className="absolute top-0 right-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-black/40 to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12 sm:py-16 lg:py-20">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6"
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
          className="text-base sm:text-lg lg:text-xl text-gray-300 mb-8 sm:mb-10 px-4"
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
            className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-base sm:text-lg rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all shadow-2xl"
          >
            Book Your Private Tour
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/contact'}
            className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-transparent border-2 border-white text-white font-bold text-base sm:text-lg rounded-full hover:bg-white/10 transition-all"
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
    <footer className="bg-black border-t border-gray-800 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="sm:col-span-2 lg:col-span-1">
            <img 
              src="/api/media/MBYC-LOGO-WHITE (1)_1751027380901.png" 
              alt="Miami Beach Yacht Club" 
              className="w-32 sm:w-40 lg:w-48 mb-4"
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
              <li><Link href="/partner" className="text-gray-400 hover:text-purple-400 transition-colors">Partner</Link></li>
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
              <div className="flex gap-4">
                <span className="w-20">Mon - Fri:</span>
                <span>9am - 6pm</span>
              </div>
              <div className="flex gap-4">
                <span className="w-20">Sat:</span>
                <span>10am - 6pm</span>
              </div>
              <div className="flex gap-4">
                <span className="w-20">Sun:</span>
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
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <HeroSection onApplyClick={() => setIsApplicationModalOpen(true)} setLocation={setLocation} />
      <FeaturesSection setLocation={setLocation} />
      <StatsSection />
      <FleetPreviewSection setLocation={setLocation} />
      <PackagesSection onApplyClick={() => setIsApplicationModalOpen(true)} setLocation={setLocation} />
      <MarinersSection onApplyClick={() => setIsApplicationModalOpen(true)} setLocation={setLocation} />
      <TestimonialsSection onApplyClick={() => setIsApplicationModalOpen(true)} />
      <FAQSection />
      <FinalCTASection onApplyClick={() => setIsApplicationModalOpen(true)} setLocation={setLocation} />
      <Footer setLocation={setLocation} />
      
      <AnimatePresence>
        <ApplicationModal 
          isOpen={isApplicationModalOpen} 
          onClose={() => setIsApplicationModalOpen(false)} 
        />
      </AnimatePresence>
    </div>
  );
}