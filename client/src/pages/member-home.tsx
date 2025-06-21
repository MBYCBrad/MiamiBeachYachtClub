import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, MapPin, Clock, Users, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

interface MemberHomeProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const categories = [
  { id: 'yachts', label: 'Yachts', icon: '⛵', color: 'text-blue-400' },
  { id: 'services', label: 'Services', icon: '🛠️', color: 'text-purple-400' },
  { id: 'events', label: 'Events', icon: '🎉', color: 'text-pink-400' },
];

const yachtImages = [
  "/api/placeholder/400/300",
  "/api/placeholder/400/301", 
  "/api/placeholder/400/302",
  "/api/placeholder/400/303",
  "/api/placeholder/400/304",
  "/api/placeholder/400/305",
];

const serviceImages = [
  "/api/placeholder/400/306",
  "/api/placeholder/400/307",
  "/api/placeholder/400/308",
];

const getYachtImage = (index: number) => yachtImages[index % yachtImages.length];
const getServiceImage = (index: number) => serviceImages[index % serviceImages.length];

export default function MemberHome({ currentView, setCurrentView }: MemberHomeProps) {
  const [selectedCategory, setSelectedCategory] = useState('yachts');
  const [selectedYacht, setSelectedYacht] = useState<any>(null);
  const [likedItems, setLikedItems] = useState<Set<number>>(new Set());

  const { data: yachts = [], isLoading: yachtsLoading } = useQuery({
    queryKey: ['/api/yachts'],
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
  });

  const filteredYachts = yachts.filter((yacht: any) => yacht.isAvailable);
  const filteredServices = services.slice(0, 6);
  const filteredEvents = events.slice(0, 6);

  const toggleLike = (id: number) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Video Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/api/media/15768404-uhd_4096_2160_24fps_1750523880240.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Miami Beach Yacht Club
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-200 mb-8 max-w-2xl"
          >
            Experience luxury yachting in Miami Beach with exclusive access to premium vessels and concierge services
          </motion.p>
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-md bg-black/30 backdrop-blur-sm rounded-full p-2 flex items-center gap-3"
          >
            <div className="text-gray-300 pl-4">🔍</div>
            <input
              type="text"
              placeholder="Where to? • Any week"
              className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
            />
          </motion.div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex justify-center items-center px-4 py-3">
          <div className="flex gap-1 bg-gray-800/50 rounded-full p-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-300 text-sm font-medium",
                  selectedCategory === category.id
                    ? "bg-white text-gray-900"
                    : "text-gray-300 hover:text-white hover:bg-gray-700/50"
                )}
              >
                <span className="text-lg">{category.icon}</span>
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-4 py-6">
        <AnimatePresence mode="wait">
          {selectedCategory === 'yachts' && (
            <motion.div
              key="yachts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Premium yachts in Miami Beach</h2>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white underline text-sm"
                  onClick={() => setCurrentView('yachts')}
                >
                  Show all
                </Button>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4"
              >
                {filteredYachts.map((yacht: any, index: number) => (
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
            </motion.div>
          )}

          {selectedCategory === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Premium Services</h2>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white underline text-sm"
                  onClick={() => setCurrentView('services')}
                >
                  Show all
                </Button>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4"
              >
                {filteredServices.map((service: any, index: number) => (
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
                    {/* Service Image */}
                    <div className="relative h-3/5 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                      <img
                        src={getServiceImage(index)}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Like Button */}
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
                          {service.category}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-bold text-white">
                          ${service.price ? Math.round(parseFloat(service.price)/100) + 'K' : 'Ask'}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <Star className="h-2 w-2 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-400">4.8</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {selectedCategory === 'events' && (
            <motion.div
              key="events"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Exclusive Events</h2>
                <Button
                  variant="ghost"
                  className="text-gray-300 hover:text-white underline text-sm"
                  onClick={() => setCurrentView('events')}
                >
                  Show all
                </Button>
              </div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4"
              >
                {filteredEvents.map((event: any, index: number) => (
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
                    {/* Event Image */}
                    <div className="relative h-3/5 bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                      <img
                        src={getServiceImage(index)}
                        alt={event.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Like Button */}
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
                      
                      {/* Date Badge */}
                      <div className="absolute top-1 left-1 bg-black/40 px-1.5 py-0.5 rounded-full">
                        <span className="text-white text-xs font-medium">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="p-2 h-2/5 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                          {event.name}
                        </h3>
                        <p className="text-gray-400 text-xs truncate">
                          {event.location}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-bold text-white">
                          ${event.price ? Math.round(parseFloat(event.price)) : 'Free'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {event.maxCapacity - event.currentCapacity} spots
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Yacht Detail Modal */}
      <Dialog open={!!selectedYacht} onOpenChange={() => setSelectedYacht(null)}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              {selectedYacht?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedYacht && (
            <div className="space-y-4">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <img
                  src={getYachtImage(selectedYacht.id % yachtImages.length)}
                  alt={selectedYacht.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <MapPin className="h-4 w-4" />
                  {selectedYacht.location}
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="h-4 w-4" />
                  {selectedYacht.capacity} guests
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <DollarSign className="h-4 w-4" />
                  ${selectedYacht.pricePerHour}/hour
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <span className="h-4 w-4">⚡</span>
                  {selectedYacht.size}ft yacht
                </div>
              </div>
              
              {selectedYacht.amenities && (
                <div>
                  <h4 className="text-white font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(selectedYacht.amenities).map((amenity) => (
                      <Badge key={amenity} variant="secondary" className="bg-gray-700 text-gray-200">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                Book Now
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}