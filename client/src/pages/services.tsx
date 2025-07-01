import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ServiceBookingModal from '@/components/service-booking-modal';
import { 
  Heart, 
  Star, 
  MapPin, 
  Ship,
  MapPinIcon,
  Car,
  Building2,
  Phone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';
import type { Service } from '@shared/schema';

const deliveryTypeConfig = {
  yacht: {
    icon: Ship,
    label: 'Yacht Add-On',
    description: 'Available during your yacht charter',
    color: 'bg-blue-600/80',
    textColor: 'text-blue-400'
  },
  marina: {
    icon: MapPinIcon,
    label: 'Marina Service',
    description: 'Meet at the marina before boarding',
    color: 'bg-green-600/80',
    textColor: 'text-green-400'
  },
  location: {
    icon: Car,
    label: 'To Your Location',
    description: 'We come to your specified address',
    color: 'bg-orange-600/80',
    textColor: 'text-orange-400'
  },
  external_location: {
    icon: Building2,
    label: 'External Location',
    description: 'Visit our business location',
    color: 'bg-red-600/80',
    textColor: 'text-red-400'
  }
};

export default function Services() {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<string>('all');

  const { data: services = [] } = useQuery<Service[]>({ queryKey: ['/api/services'] });

  const handleServiceBooking = async (bookingData: any) => {
    try {
      const response = await fetch('/api/service-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (response.ok) {
        setSelectedService(null);
        // Show success message
      } else {
        const error = await response.json();
        console.error('Booking failed:', error.message);
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };

  const toggleLike = (id: number) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(id)) {
        newLiked.delete(id);
      } else {
        newLiked.add(id);
      }
      return newLiked;
    });
  };

  const filteredServices = selectedDeliveryType === 'all' 
    ? services 
    : services.filter(service => service.serviceType === selectedDeliveryType);

  const servicesByDeliveryType = {
    yacht: services.filter(s => s.serviceType === 'yacht'),
    marina: services.filter(s => s.serviceType === 'marina'),
    location: services.filter(s => s.serviceType === 'location'),
    external_location: services.filter(s => s.serviceType === 'external_location')
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Video Header Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/api/media/video/MBYC_UPDATED_1751023212560.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* 3D Anamorphic Edges */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-0 left-0 bottom-0 w-8 bg-gradient-to-r from-black/40 to-transparent" />
          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-black/40 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h1 
              className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Premium Concierge
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Services
              </span>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-2xl text-gray-300 max-w-3xl mx-auto mb-8"
            >
              Elevate your yacht experience with our world-class concierge services, 
              delivered through four specialized tiers of luxury support.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto p-6">

        {/* Delivery Type Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            variant={selectedDeliveryType === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedDeliveryType('all')}
            className={cn(
              selectedDeliveryType === 'all' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
            )}
          >
            All Services ({services.length})
          </Button>
          {Object.entries(deliveryTypeConfig).map(([type, config]) => {
            const Icon = config.icon;
            const count = servicesByDeliveryType[type as keyof typeof servicesByDeliveryType].length;
            return (
              <Button
                key={type}
                variant={selectedDeliveryType === type ? 'default' : 'outline'}
                onClick={() => setSelectedDeliveryType(type)}
                className={cn(
                  'flex items-center gap-2',
                  selectedDeliveryType === type 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600' 
                    : 'bg-gray-800 border-gray-600 hover:bg-gray-700'
                )}
              >
                <Icon className="h-4 w-4" />
                {config.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Service Categories Overview */}
        {selectedDeliveryType === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {Object.entries(deliveryTypeConfig).map(([type, config]) => {
              const Icon = config.icon;
              const count = servicesByDeliveryType[type as keyof typeof servicesByDeliveryType].length;
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="cursor-pointer"
                  onClick={() => setSelectedDeliveryType(type)}
                >
                  <Card className="bg-gray-900/50 border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4", config.color)}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{config.label}</h3>
                      <p className="text-gray-400 text-sm mb-3">{config.description}</p>
                      <Badge className="bg-purple-600/20 text-purple-300">
                        {count} Services
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Services Grid */}
        <motion.div
          key={selectedDeliveryType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredServices.map((service, index) => {
            const deliveryConfig = deliveryTypeConfig[service.serviceType as keyof typeof deliveryTypeConfig];
            const DeliveryIcon = deliveryConfig?.icon || Ship;
            
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
              >
                <Card className="overflow-hidden bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={service.imageUrl || '/api/media/default-service.jpg'}
                      alt={service.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                      whileHover={{ scale: 1.1 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(service.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart 
                        className={cn(
                          "h-5 w-5 transition-colors duration-200",
                          likedItems.has(service.id) ? "fill-red-500 text-red-500" : "text-white"
                        )}
                      />
                    </motion.button>

                    <div className="absolute top-3 left-3 space-y-1">
                      <Badge className="bg-purple-600/80 text-white backdrop-blur-sm">
                        {service.category}
                      </Badge>
                      {deliveryConfig && (
                        <Badge className={cn("backdrop-blur-sm text-xs", deliveryConfig.color, "text-white")}>
                          <DeliveryIcon className="h-3 w-3 mr-1" />
                          {deliveryConfig.label}
                        </Badge>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center text-white text-sm">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {service.rating || '4.8'}
                        <span className="text-gray-300 ml-2">({service.reviewCount || 24} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors duration-300">
                          {service.name}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {service.description}
                        </p>
                        
                        {/* Delivery Information */}
                        <div className="mt-2 space-y-1">
                          {service.serviceType === 'marina' && service.marinaLocation && (
                            <p className="text-green-400 text-xs flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              Marina: {service.marinaLocation}
                            </p>
                          )}
                          {service.serviceType === 'external_location' && service.businessAddress && (
                            <p className="text-red-400 text-xs flex items-center">
                              <Building2 className="h-3 w-3 mr-1" />
                              Visit: {service.businessAddress}
                            </p>
                          )}
                          {service.serviceType === 'location' && (
                            <p className="text-orange-400 text-xs flex items-center">
                              <Car className="h-3 w-3 mr-1" />
                              We come to your location
                            </p>
                          )}
                          {service.serviceType === 'yacht' && (
                            <p className="text-blue-400 text-xs flex items-center">
                              <Ship className="h-3 w-3 mr-1" />
                              Available during your yacht charter
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-white">
                          <span className="text-xl font-bold">${service.pricePerSession}</span>
                          <span className="text-gray-400 text-sm ml-1">/session</span>
                        </div>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none shadow-lg shadow-purple-500/25"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedService(service);
                            }}
                          >
                            Book Service
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No services found for the selected delivery type.</p>
          </div>
        )}
      </div>

      {/* Concierge Section */}
      <section className="relative min-h-[68vh] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/api/media/video/MBYC_UPDATED_1751023212560.mp4" type="video/mp4" />
        </video>
        
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
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Phone className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6"
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all shadow-2xl"
              >
                Start Your Application
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Service Booking Modal */}
      <ServiceBookingModal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={selectedService!}
        onConfirm={handleServiceBooking}
      />
    </div>
  );
}