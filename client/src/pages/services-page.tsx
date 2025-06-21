import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, Star, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Service } from '@shared/schema';
import HamburgerMenu from '@/components/HamburgerMenu';

interface ServicesPageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function ServicesPage({ currentView, setCurrentView }: ServicesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services', { available: true }]
  });

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative">
        {/* Background Gradient */}
        <div className="absolute inset-0 z-0">
          <div className="w-full h-64 bg-gradient-to-br from-blue-900/50 to-purple-900/50" />
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
                Premium Services
              </motion.h1>
              <p className="text-gray-300 text-sm sm:text-base lg:text-lg">
                Professional yacht services and exclusive experiences
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
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 pr-12 sm:pr-16 py-3 sm:py-4 bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-2xl text-sm sm:text-base lg:text-lg focus:bg-white/20 focus:border-blue-500 transition-all duration-300"
            />
            <Button
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl p-2"
            >
              <Filter size={14} />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20 sm:pb-24">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-2xl h-56 sm:h-64 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 hover-lift card-hover"
              >
                {/* Service Image */}
                <div className="relative h-40 bg-gradient-to-br from-blue-900/30 to-purple-900/30">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-blue-600/80 text-white text-xs rounded-full font-medium">
                      {service.category}
                    </span>
                  </div>
                  {service.rating && (
                    <div className="absolute top-3 right-3 flex items-center space-x-1 bg-black/40 px-2 py-1 rounded-full">
                      <Star size={12} className="text-yellow-400 fill-current" />
                      <span className="text-white text-xs font-medium">{service.rating}</span>
                    </div>
                  )}
                </div>

                {/* Service Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors mb-2">
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center text-gray-400 text-xs mb-3">
                    <span>{service.duration ? `${service.duration} minutes` : 'Custom duration'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-white">
                      ${service.pricePerSession ? parseFloat(service.pricePerSession).toLocaleString() : 'Contact'}
                      {service.pricePerSession && <span className="text-sm text-gray-400 font-normal">/session</span>}
                    </span>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 rounded-xl px-6"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}