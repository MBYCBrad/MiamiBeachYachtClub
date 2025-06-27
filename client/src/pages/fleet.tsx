import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/navigation';
import { Anchor, Users, Ruler, Gauge, Shield, ChevronRight, Waves, Star, Sparkles } from 'lucide-react';

interface Yacht {
  id: number;
  name: string;
  type: string;
  size: number;
  capacity: number;
  captain: string;
  location: string;
  pricePerDay: string;
  amenities: string[];
  imageUrl: string;
  description: string;
  features: string[];
  membershipTier: string;
}

// 3D rotating yacht badge
function YachtBadge({ tier }: { tier: string }) {
  return (
    <motion.div
      className="absolute -top-6 -right-6 w-24 h-24"
      animate={{ rotateY: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    >
      <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl">
        <span className="text-white font-bold text-sm">{tier}</span>
      </div>
    </motion.div>
  );
}

// Animated water effect
function WaterEffect() {
  return (
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 1200 200" preserveAspectRatio="none">
        <motion.path
          d="M0,100 C150,150 350,50 600,100 C850,150 1050,50 1200,100 L1200,200 L0,200 Z"
          fill="url(#water-gradient)"
          animate={{
            d: [
              "M0,100 C150,150 350,50 600,100 C850,150 1050,50 1200,100 L1200,200 L0,200 Z",
              "M0,100 C150,50 350,150 600,100 C850,50 1050,150 1200,100 L1200,200 L0,200 Z",
              "M0,100 C150,150 350,50 600,100 C850,150 1050,50 1200,100 L1200,200 L0,200 Z",
            ],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <defs>
          <linearGradient id="water-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// Yacht card with premium design
function YachtCard({ yacht, index }: { yacht: Yacht; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group cursor-pointer"
    >
      <div className="relative bg-gray-900/50 rounded-3xl overflow-hidden border border-white/10 backdrop-blur-sm">
        {/* Premium tier badge */}
        {yacht.membershipTier === 'PLATINUM' && <YachtBadge tier={yacht.membershipTier} />}
        
        {/* Image section */}
        <div className="relative h-80 overflow-hidden">
          <motion.img
            src={yacht.imageUrl}
            alt={yacht.name}
            className="w-full h-full object-cover"
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Specs overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <div>
              <h3 className="text-3xl font-bold text-white mb-1">{yacht.name}</h3>
              <p className="text-gray-300">{yacht.type}</p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <Ruler className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-white font-semibold">{yacht.size}ft</p>
              </div>
              <div className="text-center">
                <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                <p className="text-white font-semibold">{yacht.capacity}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content section */}
        <div className="p-6">
          <p className="text-gray-400 mb-4 line-clamp-2">{yacht.description}</p>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {yacht.features.slice(0, 4).map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-400">
                <Sparkles className="w-3 h-3 text-purple-400" />
                {feature}
              </div>
            ))}
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-2 mb-6">
            {yacht.amenities.slice(0, 5).map((amenity, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs"
              >
                {amenity}
              </span>
            ))}
          </div>

          {/* Price and CTA */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Day charter from</p>
              <p className="text-3xl font-bold text-white">${yacht.pricePerDay}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold flex items-center gap-2 shadow-lg"
            >
              View Details
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <motion.div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(139, 92, 246, 0.15), transparent 40%)',
        }}
      />
    </motion.div>
  );
}

// Fleet stats section
function FleetStats() {
  const stats = [
    { value: '12', label: 'Luxury Yachts', icon: Anchor },
    { value: '250+', label: 'Charter Days', icon: Waves },
    { value: '98%', label: 'Satisfaction', icon: Star },
    { value: '24/7', label: 'Concierge', icon: Shield },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="text-center"
        >
          <stat.icon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <p className="text-4xl font-bold text-white mb-2">{stat.value}</p>
          <p className="text-gray-400">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function FleetPage() {
  const [selectedSize, setSelectedSize] = useState<string>('All');
  
  const { data: yachts = [] } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts'],
    select: (data: any[]) => data.map(yacht => ({
      id: yacht.id,
      name: yacht.name,
      type: yacht.type,
      size: yacht.size,
      capacity: yacht.capacity,
      captain: yacht.captain || 'Captain Smith',
      location: yacht.location,
      pricePerDay: yacht.pricePerDay,
      amenities: yacht.amenities || ['WiFi', 'Air Conditioning', 'Gourmet Kitchen', 'Jet Skis', 'Snorkeling Gear'],
      imageUrl: yacht.imageUrl || '/api/media/PF0007919-big_1751025963434.jpg',
      description: yacht.description || 'Experience luxury on the water with this stunning yacht.',
      features: ['Professional Crew', 'Water Sports', 'Fine Dining', 'Entertainment System'],
      membershipTier: yacht.size >= 70 ? 'PLATINUM' : yacht.size >= 55 ? 'GOLD' : yacht.size >= 40 ? 'SILVER' : 'BRONZE'
    }))
  });

  const sizeRanges = ['All', '30-50ft', '50-70ft', '70ft+'];
  
  const filteredYachts = selectedSize === 'All' 
    ? yachts 
    : yachts.filter(yacht => {
        if (selectedSize === '30-50ft') return yacht.size >= 30 && yacht.size < 50;
        if (selectedSize === '50-70ft') return yacht.size >= 50 && yacht.size < 70;
        if (selectedSize === '70ft+') return yacht.size >= 70;
        return true;
      });

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <WaterEffect />
        
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Our Fleet
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover our collection of world-class yachts, each meticulously maintained 
              and ready to deliver an unforgettable experience on Miami's waters.
            </p>
          </motion.div>

          {/* Fleet stats */}
          <FleetStats />

          {/* Size filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            {sizeRanges.map((size) => (
              <motion.button
                key={size}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedSize(size)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedSize === size
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                }`}
              >
                {size}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Yachts Grid */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedSize}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredYachts.map((yacht, index) => (
                <YachtCard key={yacht.id} yacht={yacht} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-indigo-900/20" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <Gauge className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Set Sail?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join Miami Beach Yacht Club today and gain unlimited access to our entire fleet. 
            Your next adventure awaits.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold text-lg shadow-lg"
          >
            Become a Member
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}