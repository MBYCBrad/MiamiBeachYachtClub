import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, Heart, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Yacht } from '@shared/schema';
import HamburgerMenu from '@/components/HamburgerMenu';

interface YachtsPageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function YachtsPage({ currentView, setCurrentView }: YachtsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: yachts = [], isLoading } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts', { available: true }]
  });

  const filteredYachts = yachts.filter(yacht =>
    yacht.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    yacht.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-64 bg-gradient-to-br from-purple-900/50 to-blue-900/50" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Header Content */}
        <div className="relative z-10 pt-8 sm:pt-12 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start mb-6 sm:mb-8">
            <div className="flex-1">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient-animate mb-2"
              >
                Luxury Yachts
              </motion.h1>
              <p className="text-gray-300 text-sm sm:text-base lg:text-lg">
                Discover extraordinary yachts and premium experiences
              </p>
            </div>
            <HamburgerMenu currentView={currentView} setCurrentView={setCurrentView} />
          </div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Search yachts, locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 pr-12 sm:pr-16 py-3 sm:py-4 bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-2xl text-sm sm:text-base lg:text-lg focus:bg-white/20 focus:border-purple-500 transition-all duration-300"
            />
            <Button
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 rounded-xl p-2"
            >
              <Filter size={14} />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Yachts Grid - Airbnb Style */}
      <div className="px-3 sm:px-6 lg:px-8 pb-20 sm:pb-24">
        {isLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto scroll-container">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-4 pb-4 min-w-full"
              style={{ width: 'max-content' }}
            >
              {filteredYachts.map((yacht, index) => (
                <motion.div
                  key={yacht.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer flex-shrink-0"
                  style={{
                    width: '280px',
                    height: '320px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                  }}
                >
                  {/* Purple Outline Animation */}
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-purple-500/0 group-hover:border-purple-500/60 transition-all duration-300"
                    initial={false}
                    animate={{
                      borderColor: "rgba(168, 85, 247, 0)",
                    }}
                    whileHover={{
                      borderColor: "rgba(168, 85, 247, 0.6)",
                      boxShadow: "0 0 20px rgba(168, 85, 247, 0.3)",
                    }}
                  />

                  {/* Yacht Image */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-3 right-3 text-white hover:text-red-400 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-2"
                    >
                      <Heart size={16} />
                    </Button>
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-white text-sm font-medium">4.9</span>
                    </div>
                  </div>

                  {/* Yacht Info */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors mb-1">
                        {yacht.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {yacht.location}
                      </p>
                      <p className="text-gray-300 text-sm">
                        {yacht.size}ft • {yacht.capacity} guests
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-lg font-bold text-white">
                        ${yacht.pricePerHour ? parseFloat(yacht.pricePerHour).toLocaleString() : 'Contact'}
                        <span className="text-sm text-gray-400 font-normal">/hour</span>
                      </span>
                      <Button 
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 rounded-xl px-4"
                      >
                        Book
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}