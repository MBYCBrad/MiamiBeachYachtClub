import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Filter, Star, MapPin, Settings, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Service } from '@shared/schema';
import HamburgerMenu from '@/components/HamburgerMenu';
import ServiceBookingModal from '@/components/service-booking-modal';

interface ServicesPageProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function ServicesPage({ currentView, setCurrentView }: ServicesPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ['/api/services', { available: true }]
  });

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBookService = (service: Service) => {
    setSelectedService(service);
    setIsBookingModalOpen(true);
  };

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
                  {service.imageUrl ? (
                    <img 
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Settings className="h-12 w-12 text-gray-600" />
                    </div>
                  )}
                </div>
                
                {/* Service Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 bg-purple-600/80 text-white text-xs rounded-full backdrop-blur-sm">
                    {service.category}
                  </span>
                </div>
                
                {/* Availability Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-xs rounded-full backdrop-blur-sm ${
                    service.isAvailable 
                      ? 'bg-green-600/80 text-white' 
                      : 'bg-red-600/80 text-white'
                  }`}>
                    {service.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors">
                      {service.name}
                    </h3>
                    <span className="text-lg font-bold text-purple-400">
                      ${service.pricePerSession}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {service.duration && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {service.duration}min
                        </span>
                      )}
                      <span className="flex items-center">
                        <Star className="h-4 w-4 mr-1 text-yellow-400" />
                        {service.rating || '4.8'}
                      </span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => handleBookService(service)}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Settings className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No services available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}