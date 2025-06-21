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
  const [selectedCategory, setSelectedCategory] = useState('yachts');
  const [selectedYacht, setSelectedYacht] = useState<Yacht | null>(null);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const { data: yachts = [], isLoading: yachtsLoading } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts']
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/services']
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<EventType[]>({
    queryKey: ['/api/events']
  });

  const { data: heroVideo, isLoading: videoLoading, error: videoError } = useHeroVideo();
  const videoUrl = heroVideo?.url;

  const getYachtImage = (index: number) => YACHT_IMAGES[index % YACHT_IMAGES.length];
  const getServiceImage = (index: number) => SERVICE_IMAGES[index % SERVICE_IMAGES.length];

  const toggleLike = (id: number) => {
    const newLikedItems = new Set(likedItems);
    if (newLikedItems.has(id)) {
      newLikedItems.delete(id);
    } else {
      newLikedItems.add(id);
    }
    setLikedItems(newLikedItems);
  };

  const filteredYachts = yachts.filter(yacht => yacht.isAvailable);
  const filteredServices = services.filter(service => service.isAvailable);
  const filteredEvents = events.filter(event => new Date(event.startTime) > new Date());

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Video Section */}
      <div className="relative h-screen overflow-hidden">
        {videoUrl && !videoLoading && !videoError ? (
          <video
            autoPlay
            loop
            muted={isVideoMuted}
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-blue-900/80 to-black/80" />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        
        {/* Video Controls */}
        <div className="absolute top-6 right-6 flex gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVideoMuted(!isVideoMuted)}
            className="bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 rounded-full p-3"
          >
            {isVideoMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="max-w-4xl"
          >
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
              Monaco Bay Yacht Club
            </h1>
            <p className="text-xl sm:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
              Experience luxury yachting in Miami Beach with exclusive access to premium vessels and concierge services
            </p>
          </motion.div>
        </div>

        {/* Search Bar */}
        <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <AirbnbSearchBar onSearch={(query) => console.log('Search:', query)} />
        </motion.div>
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
              className="space-y-8"
            >
              {/* Premium Yachts Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">
                    Premium yachts in Miami Beach
                  </h2>
                  <Button 
                    variant="ghost" 
                    className="text-gray-400 hover:text-white text-base font-medium underline hover:no-underline"
                  >
                    Show all
                  </Button>
                </div>
                
                <div className="overflow-x-auto scroll-container">
                  <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                    {filteredYachts.slice(0, 8).map((yacht, index) => (
                      <motion.div
                        key={yacht.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="group relative bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 cursor-pointer flex-shrink-0"
                        style={{
                          width: '280px',
                          height: '320px',
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
                        <div className="relative h-48 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
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
                            className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Heart 
                              className={cn(
                                "h-4 w-4 transition-colors duration-200",
                                likedItems.has(yacht.id) ? "fill-red-500 text-red-500" : "text-white"
                              )}
                            />
                          </motion.button>
                          
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
                              <span className="text-sm text-gray-400 font-normal"> per hour</span>
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedCategory === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Premium Services Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">
                    Premium services available now
                  </h2>
                  <Button 
                    variant="ghost" 
                    className="text-gray-400 hover:text-white text-base font-medium underline hover:no-underline"
                  >
                    Show all
                  </Button>
                </div>
                
                <div className="overflow-x-auto scroll-container">
                  <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                    {filteredServices.slice(0, 8).map((service, index) => (
                      <motion.div
                        key={service.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
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

                        {/* Service Image */}
                        <div className="relative h-48 bg-gradient-to-br from-purple-900/30 to-pink-900/30">
                          <img
                            src={getServiceImage(index)}
                            alt={service.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          
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
                                "h-4 w-4 transition-colors duration-200",
                                likedItems.has(service.id) ? "fill-red-500 text-red-500" : "text-white"
                              )}
                            />
                          </motion.button>
                        </div>

                        {/* Service Info */}
                        <div className="p-4 flex flex-col justify-between flex-1">
                          <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors mb-1">
                              {service.name}
                            </h3>
                            <p className="text-gray-400 text-sm mb-2">
                              {service.category || 'Premium Service'}
                            </p>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-white text-sm">4.8</span>
                              <span className="text-gray-400 text-sm">(12 reviews)</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-white">
                              ${service.pricePerSession ? parseFloat(service.pricePerSession).toLocaleString() : 'Quote'}
                              <span className="text-sm text-gray-400 font-normal"> per service</span>
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {selectedCategory === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Upcoming Events Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">
                    Exclusive events this month
                  </h2>
                  <Button 
                    variant="ghost" 
                    className="text-gray-400 hover:text-white text-base font-medium underline hover:no-underline"
                  >
                    Show all
                  </Button>
                </div>
                
                <div className="overflow-x-auto scroll-container">
                  <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                    {filteredEvents.slice(0, 8).map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: index * 0.05 }}
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

                        {/* Event Image */}
                        <div className="relative h-48 bg-gradient-to-br from-purple-900/30 to-pink-900/30">
                          <img
                            src={`https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=800&h=600&fit=crop`}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          
                          <div className="absolute top-3 left-3">
                            <div className="bg-purple-600/80 text-white px-2 py-1 rounded-lg text-xs font-medium">
                              {new Date(event.startTime).toLocaleDateString()}
                            </div>
                          </div>

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
                                "h-4 w-4 transition-colors duration-200",
                                likedItems.has(event.id) ? "fill-red-500 text-red-500" : "text-white"
                              )}
                            />
                          </motion.button>
                        </div>

                        {/* Event Info */}
                        <div className="p-4 flex flex-col justify-between flex-1">
                          <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition-colors mb-1">
                              {event.title}
                            </h3>
                            <p className="text-gray-400 text-sm mb-2">
                              {event.location || 'Exclusive Event'}
                            </p>
                            <div className="flex items-center gap-1 mb-2">
                              <span className="text-gray-300 text-sm">
                                {event.capacity ? `${event.capacity} spots available` : 'Limited seats'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-white">
                              {event.ticketPrice ? `$${event.ticketPrice}` : 'Free'}
                              <span className="text-sm text-gray-400 font-normal"> per person</span>
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
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
                  <h3 className="text-xl font-semibold text-white">Details</h3>
                  <div className="space-y-2 text-gray-300">
                    <p><span className="text-white font-medium">Size:</span> {selectedYacht.size}ft</p>
                    <p><span className="text-white font-medium">Capacity:</span> {selectedYacht.capacity} guests</p>
                    <p><span className="text-white font-medium">Location:</span> {selectedYacht.location}</p>
                    <p><span className="text-white font-medium">Price:</span> ${selectedYacht.pricePerHour}/hour</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">Amenities</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedYacht.amenities && typeof selectedYacht.amenities === 'object' && 
                      Object.entries(selectedYacht.amenities).map(([amenity, index]) => (
                        <div key={index} className="flex items-center gap-2 text-gray-300">
                          <div className="w-2 h-2 bg-cyan-400 rounded-full" />
                          <span className="text-sm capitalize">{amenity}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}