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
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Yacht, Service, Event as EventType } from '@shared/schema';

const YACHT_IMAGES = [
  "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1540946485063-a40da27545f8?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1582719366682-5a7e5e44c0d7?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1605281317010-fe5ffe798166?w=800&h=600&fit=crop"
];

const SERVICE_IMAGES = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1567327286077-e5de925ca8b7?w=800&h=600&fit=crop"
];

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
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
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

  const getYachtImage = (index: number) => {
    return YACHT_IMAGES[index % YACHT_IMAGES.length];
  };

  const getServiceImage = (index: number) => {
    return SERVICE_IMAGES[index % SERVICE_IMAGES.length];
  };

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
        
        {/* Video Controls */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVideoPlaying(!isVideoPlaying)}
            className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"
          >
            {isVideoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMuted(!isMuted)}
            className="bg-black/20 backdrop-blur-sm text-white hover:bg-black/40"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto w-full"
          >
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
            >
              Luxury Awaits
            </motion.h1>
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

      {/* 3D Animated Tab Navigation */}
      <motion.div 
        className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="px-4 py-3 flex justify-center">
          <TabNavigation 
            activeTab={selectedCategory}
            onTabChange={setSelectedCategory}
          />
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <AnimatePresence mode="wait">
          {selectedCategory === 'yachts' && (
            <motion.div
              key="yachts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4"
            >
              {filteredYachts.map((yacht, index) => (
                <motion.div
                  key={yacht.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative aspect-square bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer"
                  style={{
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                  }}
                  onClick={() => setSelectedYacht(yacht)}
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
                    <img
                      src={getYachtImage(index)}
                      alt={yacht.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Like Button */}
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(yacht.id);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart 
                        className={cn(
                          "h-3 w-3 transition-colors duration-200",
                          likedItems.has(yacht.id) ? "fill-red-500 text-red-500" : "text-white"
                        )}
                      />
                    </motion.button>

                    {/* Rating Badge */}
                    <div className="absolute top-1 left-1 flex items-center gap-0.5 bg-black/40 px-1.5 py-0.5 rounded-full">
                      <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-white text-xs font-medium">4.9</span>
                    </div>
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
          )}

          {selectedCategory === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4"
            >
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
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

                  {/* Service Image */}
                  <div className="relative h-3/5 bg-gradient-to-br from-blue-900/30 to-purple-900/30">
                    <img
                      src={getServiceImage(index)}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    <div className="absolute top-1 left-1">
                      <span className="px-2 py-0.5 bg-blue-600/80 text-white text-xs rounded-full font-medium">
                        {service.category}
                      </span>
                    </div>

                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(service.id);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart 
                        className={cn(
                          "h-3 w-3 transition-colors duration-200",
                          likedItems.has(service.id) ? "fill-red-500 text-red-500" : "text-white"
                        )}
                      />
                    </motion.button>
                  </div>

                  {/* Service Info */}
                  <div className="p-2 h-2/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                        {service.name}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">
                        {service.description}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-bold text-white">
                        ${service.pricePerSession ? Math.round(parseFloat(service.pricePerSession)/10) + '0' : 'Ask'}
                        <span className="text-xs text-gray-400 font-normal">/hr</span>
                      </span>
                      <span className="text-xs text-gray-400">
                        {service.duration ? `${service.duration}m` : 'Custom'}
                      </span>
                    </div>
                  </div>
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
              className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4"
            >
              {filteredEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
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

                  {/* Event Image */}
                  <div className="relative h-3/5 bg-gradient-to-br from-purple-900/30 to-pink-900/30">
                    <img
                      src={`https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=800&h=600&fit=crop`}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    <div className="absolute top-1 left-1">
                      <div className="bg-purple-600/80 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                        <Calendar size={10} className="inline mr-1" />
                        {new Date(event.startTime).toLocaleDateString()}
                      </div>
                    </div>

                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(event.id);
                      }}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart 
                        className={cn(
                          "h-3 w-3 transition-colors duration-200",
                          likedItems.has(event.id) ? "fill-red-500 text-red-500" : "text-white"
                        )}
                      />
                    </motion.button>
                  </div>

                  {/* Event Info */}
                  <div className="p-2 h-2/5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                        {event.title}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">
                        {event.location || 'Exclusive Event'}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs font-bold text-white">
                        {event.ticketPrice ? `$${event.ticketPrice}` : 'Free'}
                        <span className="text-xs text-gray-400 font-normal">/person</span>
                      </span>
                      <span className="text-xs text-gray-400">
                        {event.capacity ? `${event.capacity} spots` : 'Limited'}
                      </span>
                    </div>
                  </div>
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
                  src={getYachtImage(selectedYacht.id - 1)}
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
    </div>
  );
}