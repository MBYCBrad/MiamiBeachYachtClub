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
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
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
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Premium Concierge Services
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Enhance your yacht experience with our four-tier service delivery system
          </p>
        </motion.div>

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