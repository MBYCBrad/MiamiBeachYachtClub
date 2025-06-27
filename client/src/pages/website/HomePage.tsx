import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion, useScroll, useTransform } from 'framer-motion';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import Yacht3DShowcase from '@/components/website/Yacht3DShowcase';
import Phone3DSimple from '@/components/website/Phone3DSimple';

export default function HomePage() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  
  // Parallax transforms
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  
  // Fetch hero video
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });

  // Fetch MBYC logo
  const { data: logo } = useQuery({
    queryKey: ['/api/media/MBYC-LOGO-WHITE_1750978675231.png'],
    queryFn: () => ({ url: '/api/media/MBYC-LOGO-WHITE_1750978675231.png' }),
  });

  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-black">
      {/* Hero Section with Full Video Background - Apple-style with Rolls-Royce luxury */}
      <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background with Preload Optimization */}
        {heroVideo && (
          <div className="absolute inset-0 w-full h-full">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              poster="/api/media/Screenshot 2025-06-26 at 2.20.59 PM_1750972860790.png"
              onLoadedData={() => setVideoLoaded(true)}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-2000 ${
                videoLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ filter: 'brightness(0.7)' }}
            >
              <source src={`/api/media/video/${heroVideo.filename}`} type="video/mp4" />
              <source src={`/api/media/video/${heroVideo.filename.replace('.mp4', '.webm')}`} type="video/webm" />
            </video>
            
            {/* Gradient Overlay for Text Legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
            
            {/* Animated Gradient Accent */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 3 }}
              className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-blue-600/20"
            />
          </div>
        )}

        {/* Hero Content with Motion */}
        <motion.div 
          style={{ y, opacity }}
          className="relative z-10 text-center px-4 max-w-7xl mx-auto"
        >
          {/* Animated Logo */}
          {logo && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="mb-12"
            >
              <img 
                src={logo.url} 
                alt="Miami Beach Yacht Club" 
                className="h-24 md:h-32 mx-auto filter brightness-0 invert"
              />
            </motion.div>
          )}

          {/* Main Headline with Stagger Animation */}
          <motion.h1
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-5xl md:text-7xl lg:text-8xl font-thin text-white mb-6 tracking-wide"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}
          >
            Unlimited Luxury.
            <span className="block font-extralight bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              One Club.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-8 font-light max-w-4xl mx-auto"
          >
            The Miami Beach Yacht Club: Seamless, Stress-Free Yachting
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Experience the epitome of maritime luxury with exclusive access to our world-class fleet, 
            personalized concierge service, and unforgettable moments on the water.
          </motion.p>

          {/* CTA Buttons with Hover Effects */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link href="/website/plans">
              <a className="group relative inline-block px-12 py-5 overflow-hidden rounded-full">
                <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 transition-transform duration-300 group-hover:scale-110" />
                <span className="relative text-white text-lg font-medium">Apply Now</span>
              </a>
            </Link>
            
            <Link href="/website/fleet">
              <a className="group relative inline-block px-12 py-5 rounded-full border-2 border-white/30 backdrop-blur-sm hover:border-white/60 transition-all duration-300">
                <span className="text-white text-lg font-medium">Book a Tour</span>
              </a>
            </Link>
          </motion.div>
        </motion.div>

        {/* Animated Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
          >
            <motion.div 
              animate={{ y: [0, 16, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1 h-3 bg-white/60 rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* 3D Yacht Section - Revolutionary scroll-based rotation */}
      <Yacht3DShowcase 
        yachtName="95ft Sunseeker 'Pura Vida'"
        yachtSpecs={{
          length: "95′",
          cabins: 4,
          baths: 5
        }}
      />

      {/* Features Grid - Apple-style with micro-animations */}
      <section className="py-32 px-4 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-thin text-white mb-8">
              Redefining Yacht Ownership
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              All the privileges. None of the hassles.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Instant Booking",
                description: "Reserve any yacht in our fleet up to 12 months in advance through our seamless portal"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: "Personal Concierge",
                description: "Dedicated support available 24/7 for all your yachting needs and special requests"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Zero Maintenance",
                description: "We handle all maintenance, cleaning, and logistics so you can focus on enjoying"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Flexible Plans",
                description: "Multiple membership tiers to match your lifestyle and yachting preferences"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ),
                title: "Global Access",
                description: "Take your membership worldwide with partner clubs in premium destinations"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                ),
                title: "Exclusive Events",
                description: "Access member-only events from sunset cruises to Art Basel celebrations"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-gray-900/50 backdrop-blur-sm rounded-3xl p-8 hover:bg-gray-900/80 transition-all duration-300"
              >
                <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-medium text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Preview - Rolls-Royce inspired luxury cards */}
      <section className="py-32 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-thin text-white mb-8">
              Choose Your Experience
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Four tiers of membership. Unlimited possibilities.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: 'Silver', price: '$3,000', initiation: '$10,000', yachts: 'Up to 50ft', gradient: 'from-gray-600 to-gray-400' },
              { name: 'Gold', price: '$5,000', initiation: '$25,000', yachts: 'Up to 65ft', gradient: 'from-yellow-600 to-yellow-400' },
              { name: 'Platinum', price: '$7,500', initiation: '$50,000', yachts: 'Up to 80ft', gradient: 'from-purple-600 to-purple-400' },
              { name: 'Diamond', price: '$10,000', initiation: '$100,000', yachts: 'All Yachts', gradient: 'from-blue-600 to-cyan-400' }
            ].map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl"
                     style={{ background: `linear-gradient(to bottom right, ${tier.gradient.split(' ')[1]}, ${tier.gradient.split(' ')[3]})` }} />
                
                <div className="relative bg-gray-950 border border-gray-800 rounded-3xl p-8 hover:border-gray-600 transition-all duration-300">
                  <div className={`inline-flex px-4 py-2 rounded-full bg-gradient-to-r ${tier.gradient} text-white text-sm font-medium mb-6`}>
                    {tier.name} Membership
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-5xl font-thin text-white mb-2">{tier.price}</p>
                    <p className="text-gray-400">per month</p>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <p className="text-sm text-gray-500">One-time initiation</p>
                      <p className="text-xl text-white">{tier.initiation}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Yacht access</p>
                      <p className="text-xl text-white">{tier.yachts}</p>
                    </div>
                  </div>
                  
                  <Link href="/website/plans">
                    <a className="block text-center py-3 rounded-full border border-gray-700 text-white hover:bg-white hover:text-black transition-all duration-300">
                      Learn More
                    </a>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial - Minimalist Apple style */}
      <section className="py-32 px-4 bg-gray-950">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <svg className="w-20 h-20 mx-auto text-purple-600/50 mb-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            
            <blockquote className="text-3xl md:text-4xl lg:text-5xl font-thin text-white mb-8 leading-relaxed">
              The Miami Beach Yacht Club has transformed how I experience yachting. 
              The convenience and luxury are unmatched.
            </blockquote>
            
            <cite className="text-gray-400 text-xl">
              — Ben Crump, Civil Rights Attorney
            </cite>
          </motion.div>
        </div>
      </section>

      {/* Final CTA - Premium feel */}
      <section className="py-32 px-4 bg-gradient-to-b from-gray-950 to-black">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-thin text-white mb-8">
              Your Journey Begins Here
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join an exclusive community of yachting enthusiasts who demand the very best.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/website/plans">
                <a className="group relative inline-block px-16 py-6 overflow-hidden rounded-full">
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600" />
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                  <span className="relative text-white text-xl font-medium">Apply for Membership</span>
                </a>
              </Link>
              
              <Link href="/website/contact">
                <a className="group relative inline-block px-16 py-6 rounded-full border-2 border-white/30 backdrop-blur-sm hover:border-white transition-all duration-300">
                  <span className="text-white text-xl font-medium">Schedule a Tour</span>
                </a>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
    </WebsiteLayout>
  );
}