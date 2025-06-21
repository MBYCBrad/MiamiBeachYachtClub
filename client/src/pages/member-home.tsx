import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('yachts');
  const [showFilters, setShowFilters] = useState(false);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());
  const [selectedYacht, setSelectedYacht] = useState<Yacht | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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
    <div className="min-h-screen bg-black text-white overflow-auto">
      {/* Hero Video Background */}
      <div className="relative h-[60vh] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted={isMuted}
          playsInline
        >
          <source src="https://videos.pexels.com/video-files/2257002/2257002-hd_1920_1080_25fps.mp4" type="video/mp4" />
        </video>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-purple-900/20 to-black/80" />
        
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
        <div className="absolute inset-0 flex items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-4xl mx-auto"
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
            >
              Luxury Awaits
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-200 mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Discover extraordinary yachts and premium experiences
            </motion.p>
            
            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="relative max-w-2xl mx-auto"
            >
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                <Input
                  placeholder="Search yachts, services, events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-16 py-4 text-lg bg-white/10 backdrop-blur-md border-white/20 text-white placeholder-gray-300 rounded-2xl focus:bg-white/20 focus:border-purple-400 transition-all duration-300 group-hover:bg-white/15"
                />
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl"
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Category Pills */}
      <motion.div 
        className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="px-4 py-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {[
              { id: 'yachts', label: 'Yachts', icon: Waves },
              { id: 'services', label: 'Services', icon: Shield },
              { id: 'events', label: 'Events', icon: Calendar }
            ].map((category) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-full whitespace-nowrap transition-all duration-300 font-medium",
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                      : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {selectedCategory === 'yachts' && (
            <motion.div
              key="yachts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredYachts.map((yacht, index) => (
                <motion.div
                  key={yacht.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedYacht(yacht)}
                >
                  <Card className="overflow-hidden bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                    <div className="relative overflow-hidden">
                      <motion.img
                        src={getYachtImage(index)}
                        alt={yacht.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                        whileHover={{ scale: 1.1 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
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
                            "h-5 w-5 transition-colors duration-200",
                            likedItems.has(yacht.id) ? "fill-red-500 text-red-500" : "text-white"
                          )}
                        />
                      </motion.button>

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        {yacht.amenities?.includes('fuel') && (
                          <Badge className="bg-green-600/80 text-white backdrop-blur-sm">
                            <Fuel className="h-3 w-3 mr-1" />
                            Fuel Included
                          </Badge>
                        )}
                        {yacht.amenities?.includes('crew') && (
                          <Badge className="bg-blue-600/80 text-white backdrop-blur-sm">
                            <Users className="h-3 w-3 mr-1" />
                            Crew Included
                          </Badge>
                        )}
                      </div>

                      {/* Quick Info */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">4.9</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-4 w-4" />
                            {yacht.location}
                          </div>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-xl text-white group-hover:text-purple-300 transition-colors duration-300">
                            {yacht.name}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            {yacht.size}ft • {yacht.capacity} guests
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-white">
                            <span className="text-2xl font-bold">${yacht.pricePerHour}</span>
                            <span className="text-gray-400 text-sm ml-1">/hour</span>
                          </div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              size="sm" 
                              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none shadow-lg shadow-purple-500/25"
                            >
                              Book Now
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

          {selectedCategory === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                >
                  <Card className="overflow-hidden bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10">
                    <div className="relative overflow-hidden">
                      <motion.img
                        src={getServiceImage(index)}
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

                      <Badge className="absolute top-3 left-3 bg-purple-600/80 text-white backdrop-blur-sm">
                        {service.category}
                      </Badge>
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
                              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-none shadow-lg shadow-blue-500/25"
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
                        src={`https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=800&h=600&fit=crop`}
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
                              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white border-none shadow-lg shadow-cyan-500/25"
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