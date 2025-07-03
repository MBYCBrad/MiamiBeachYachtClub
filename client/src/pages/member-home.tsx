import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { useHeroVideo } from '@/hooks/use-hero-video';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AirbnbSearchBar from '@/components/AirbnbSearchBar';
import { TabNavigation } from '@/components/AnimatedTabIcons';
import ServiceBookingModal from '@/components/service-booking-modal';
import ServiceDetailsModal from '@/components/service-details-modal';
import EventDetailsModal from '@/components/event-details-modal';
import { 
  Search, 
  Heart, 
  Star, 
  MapPin, 
  Users, 
  Waves,
  Fuel,
  Shield,
  Calendar,
  Filter,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import YachtCard from '@/components/yacht-card';
import type { Yacht, Service, Event as EventType } from '@shared/schema';



// Removed static SERVICE_IMAGES - now using real-time database images

interface MemberHomeProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MemberHome({ currentView, setCurrentView }: MemberHomeProps) {
  const { user } = useAuth();
  const { data: heroVideo, isLoading: videoLoading } = useHeroVideo();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('yachts');
  const [showFilters, setShowFilters] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [selectedYacht, setSelectedYacht] = useState<Yacht | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<Service | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  const handleSearch = (criteria: any) => {
    // Navigate to search results with criteria
    setCurrentView('search-results');
  };

  const { data: yachts = [] } = useQuery<Yacht[]>({ queryKey: ['/api/yachts'] });
  const { data: services = [] } = useQuery<Service[]>({ queryKey: ['/api/services'] });
  const { data: events = [] } = useQuery<EventType[]>({ queryKey: ['/api/events'] });

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
        // Show success message or redirect
      } else {
        const error = await response.json();
        console.error('Booking failed:', error.message);
      }
    } catch (error) {
      console.error('Booking error:', error);
    }
  };



  // Removed getServiceImage function - now using real-time database images

  const filteredYachts = yachts.filter(yacht => 
    yacht.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    yacht.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Hero Video Background */}
      <div className="relative h-[65vh] sm:h-[70vh] lg:h-[75vh] overflow-hidden">
        {videoLoading ? (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black animate-pulse" />
        ) : heroVideo ? (
          <>
            <video
              className="absolute inset-0 w-full h-full object-cover scale-110"
              autoPlay
              loop
              muted={isMuted}
              playsInline
            >
              <source src={heroVideo.url} type={heroVideo.mimeType || "video/mp4"} />
            </video>
            
            {/* Seamless Edge Transition */}
            <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black via-black/60 via-black/30 via-black/10 to-transparent" />
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/40 via-black/20 to-transparent" />
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/60 via-black/30 via-black/10 to-transparent" />
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/60 via-black/30 via-black/10 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black" />
        )}
        
        {/* Enhanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-purple-900/10 to-black/70" />
        
        {/* Sound Control - Mobile optimized */}
        <motion.div 
          className="absolute top-4 right-4"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40 mobile-button min-h-[44px] min-w-[44px] p-3"
          >
            {isMuted ? <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" /> : <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </motion.div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto w-full"
          >
            <motion.div
              className="mb-2 sm:mb-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
            >
              <img 
                src="/api/media/MBYC-LOGO-WHITE_1750532808484.png" 
                alt="Miami Beach Yacht Club Logo"
                className="w-64 sm:w-80 md:w-96 lg:w-[500px] h-auto mx-auto"
              />
            </motion.div>
            <motion.p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-3 sm:mb-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Discover extraordinary yachts and premium experiences
            </motion.p>
            
            {/* Airbnb-Style Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="relative w-full max-w-4xl mx-auto"
            >
              <AirbnbSearchBar 
                onSearch={handleSearch}
                className="shadow-2xl"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* 3D Animated Tab Navigation - Pulled up very close to search bar */}
      <motion.div 
        className="relative z-40 -mt-20 border-none"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.0 }}
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6), rgba(0,0,0,0.9))',
          backdropFilter: 'blur(40px) brightness(1.1)',
          WebkitBackdropFilter: 'blur(40px) brightness(1.1)',
          maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,1) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 30%, rgba(0,0,0,1) 100%)'
        }}
      >
        <div className="px-4 py-1 flex justify-center">
          <TabNavigation 
            activeTab={selectedCategory}
            onTabChange={setSelectedCategory}
          />
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-32">
        <AnimatePresence mode="wait">
          {selectedCategory === 'yachts' && (
            <motion.div
              key="yachts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-24"
            >
              {filteredYachts.map((yacht, index) => (
                <YachtCard key={yacht.id} yacht={yacht} index={index} />
              ))}
            </motion.div>
          )}

          {selectedCategory === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-24"
            >
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedServiceForDetails(service)}
                >
                  <Card className="overflow-hidden bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                    <div className="relative overflow-hidden">
                      <motion.img
                        src={service.imageUrl || 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop'}
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
                        <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white backdrop-blur-sm">
                          {service.category}
                        </Badge>
                        <Badge 
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white backdrop-blur-sm text-xs"
                        >
                          {service.deliveryType === 'yacht' ? 'Yacht Add-On' :
                           service.deliveryType === 'marina' ? 'Marina Service' :
                           service.deliveryType === 'location' ? 'To Your Location' :
                           'External Location'}
                        </Badge>
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
                          <div className="mt-2 space-y-1">
                            {service.deliveryType === 'marina' && service.marinaLocation && (
                              <p className="text-white text-xs">
                                📍 Marina: {service.marinaLocation}
                              </p>
                            )}
                            {service.deliveryType === 'external_location' && service.businessAddress && (
                              <p className="text-white text-xs">
                                📍 Visit: {service.businessAddress}
                              </p>
                            )}
                            {service.deliveryType === 'location' && (
                              <p className="text-white text-xs">
                                🚗 We come to your location
                              </p>
                            )}
                            {service.deliveryType === 'yacht' && (
                              <p className="text-white text-xs">
                                🛥️ Available during your yacht charter
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
              ))}
            </motion.div>
          )}

          {selectedCategory === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-24"
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                >
                  <Card className="overflow-hidden bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10">
                    <div className="relative overflow-hidden">
                      <motion.img
                        src={event.imageUrl || `/api/media/pexels-mali-42092_1750537277229.jpg`}
                        alt={event.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                        whileHover={{ scale: 1.1 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(event.id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart 
                          className={cn(
                            "h-5 w-5 transition-colors duration-200",
                            likedItems.has(event.id) ? "fill-red-500 text-red-500" : "text-white"
                          )}
                        />
                      </motion.button>

                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="text-white text-sm">
                          {new Date(event.startTime).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors duration-300">
                            {event.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {event.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-white">
                            <span className="text-xl font-bold">${event.ticketPrice}</span>
                            <span className="text-gray-400 text-sm ml-1">/ticket</span>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              size="sm" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none shadow-lg shadow-purple-500/25"
                            >
                              Register
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Yacht Detail Modal */}
      <Dialog open={!!selectedYacht} onOpenChange={() => setSelectedYacht(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700 text-white">
          {selectedYacht && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">
                  {selectedYacht.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="relative">
                <img
                  src={selectedYacht.imageUrl || `https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop&crop=center`}
                  alt={selectedYacht.name}
                  className="w-full h-80 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-lg" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Specifications</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="font-medium">Length:</span> {selectedYacht.size}ft</p>
                    <p><span className="font-medium">Capacity:</span> {selectedYacht.capacity} guests</p>
                    <p><span className="font-medium">Location:</span> {selectedYacht.location}</p>
                    <p><span className="font-medium">Description:</span> {selectedYacht.description || 'Luxury yacht experience'}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Pricing</h3>
                  <div className="text-3xl font-bold text-white">
                    ${selectedYacht.pricePerHour}<span className="text-lg text-gray-400">/hour</span>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none shadow-lg">
                    Book This Yacht
                  </Button>
                </div>
              </div>

              {selectedYacht.amenities && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedYacht.amenities.map((amenity, index) => (
                      <Badge key={index} variant="secondary" className="bg-gray-700 text-gray-200">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Service Booking Modal */}
      <ServiceBookingModal
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        service={selectedService!}
        onConfirm={handleServiceBooking}
      />

      {/* Service Details Modal */}
      <ServiceDetailsModal
        service={selectedServiceForDetails}
        isOpen={!!selectedServiceForDetails}
        onClose={() => setSelectedServiceForDetails(null)}
        onBookService={(service) => {
          setSelectedServiceForDetails(null);
          setSelectedService(service);
        }}
        isFavorite={selectedServiceForDetails ? likedItems.has(selectedServiceForDetails.id) : false}
        onToggleFavorite={(serviceId) => toggleLike(serviceId)}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}