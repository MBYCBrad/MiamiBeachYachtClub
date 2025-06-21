import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, Heart } from 'lucide-react';
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
              className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4 min-w-full"
            >
              {filteredYachts.map((yacht, index) => (
                <motion.div
                  key={yacht.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative aspect-square bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                  style={{
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
                  <div className="relative h-3/5 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-1 right-1 text-white hover:text-red-400 bg-black/20 hover:bg-black/40 backdrop-blur-sm rounded-full p-1"
                    >
                      <Heart size={12} />
                    </Button>
                  </div>

                  {/* Yacht Info */}
                  <div className="p-2 h-2/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                        {yacht.name}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">
                        {yacht.location}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-bold text-white">
                        ${yacht.pricePerHour ? Math.round(parseFloat(yacht.pricePerHour)/100) + 'K' : 'Ask'}
                        <span className="text-xs text-gray-400 font-normal">/hr</span>
                      </span>
                      <span className="text-xs text-gray-400">
                        {yacht.size}ft
                      </span>
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