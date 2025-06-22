import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  Star, 
  MapPin, 
  Users, 
  Waves,
  Calendar,
  Filter,
  Grid3X3,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MemberFavoritesProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const favoriteYachts = [
  {
    id: 1,
    name: "Marina Breeze",
    size: "40ft",
    capacity: 8,
    location: "Miami Beach",
    pricePerHour: "$450",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop",
    amenities: ["Fuel Included", "Crew Included"]
  },
  {
    id: 2,
    name: "Coastal Star",
    size: "45ft",
    capacity: 10,
    location: "Key Biscayne",
    pricePerHour: "$580",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
    amenities: ["Fuel Included"]
  }
];

const favoriteServices = [
  {
    id: 1,
    name: "Executive Chef Service",
    category: "Culinary",
    pricePerSession: "$850",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop"
  },
  {
    id: 2,
    name: "Wellness & Spa",
    category: "Wellness",
    pricePerSession: "$320",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop"
  }
];

const favoriteEvents = [
  {
    id: 1,
    title: "Sunset Cocktail Cruise",
    date: "Dec 25, 2024",
    ticketPrice: "$125",
    image: "https://images.unsplash.com/photo-1566473965997-3de9c817e938?w=800&h=600&fit=crop"
  }
];

export default function MemberFavorites({ currentView, setCurrentView }: MemberFavoritesProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('yachts');

  const removeFavorite = (id: number, type: string) => {
    // Handle removing from favorites
    console.log(`Removing ${type} ${id} from favorites`);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-auto pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-gray-800"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              Favorites
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid3X3 className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg"
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="px-6 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900/50 border border-gray-700">
            <TabsTrigger 
              value="yachts" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white"
            >
              <Waves className="h-4 w-4 mr-2" />
              Yachts ({favoriteYachts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="services"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white"
            >
              Services ({favoriteServices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="events"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-purple-600 data-[state=active]:text-white"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Events ({favoriteEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="yachts" className="mt-6">
            <AnimatePresence>
              <div className={cn(
                "gap-6",
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                  : "space-y-4"
              )}>
                {favoriteYachts.map((yacht, index) => (
                  <motion.div
                    key={yacht.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="group cursor-pointer"
                  >
                    <Card className="overflow-hidden bg-gray-900/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/10">
                      <div className="relative overflow-hidden">
                        <motion.img
                          src={yacht.image}
                          alt={yacht.name}
                          className={cn(
                            "object-cover group-hover:scale-110 transition-transform duration-700",
                            viewMode === 'grid' ? "w-full h-64" : "w-full h-48"
                          )}
                          whileHover={{ scale: 1.1 }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        
                        {/* Remove from Favorites */}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(yacht.id, 'yacht');
                          }}
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                        </motion.button>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          {yacht.amenities.map((amenity, idx) => (
                            <Badge key={idx} className="bg-green-600/80 text-white backdrop-blur-sm text-xs">
                              {amenity}
                            </Badge>
                          ))}
                        </div>

                        {/* Rating & Location */}
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{yacht.rating}</span>
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
                              {yacht.size} • {yacht.capacity} guests
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-white">
                              <span className="text-2xl font-bold">{yacht.pricePerHour}</span>
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
              </div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <div className={cn(
              "gap-6",
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "space-y-4"
            )}>
              {favoriteServices.map((service, index) => (
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
                        src={service.image}
                        alt={service.name}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                        whileHover={{ scale: 1.1 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(service.id, 'service');
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                      </motion.button>

                      <Badge className="absolute top-3 left-3 bg-blue-600/80 text-white backdrop-blur-sm">
                        {service.category}
                      </Badge>

                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-1 text-white">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{service.rating}</span>
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg text-white group-hover:text-blue-300 transition-colors duration-300">
                          {service.name}
                        </h3>

                        <div className="flex items-center justify-between">
                          <div className="text-white">
                            <span className="text-xl font-bold">{service.pricePerSession}</span>
                            <span className="text-gray-400 text-sm ml-1">/session</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-none"
                          >
                            Book Service
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <div className={cn(
              "gap-6",
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "space-y-4"
            )}>
              {favoriteEvents.map((event, index) => (
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
                        src={event.image}
                        alt={event.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                        whileHover={{ scale: 1.1 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(event.id, 'event');
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                      </motion.button>

                      <div className="absolute bottom-3 left-3 text-white text-sm">
                        {event.date}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg text-white group-hover:text-cyan-300 transition-colors duration-300">
                          {event.title}
                        </h3>

                        <div className="flex items-center justify-between">
                          <div className="text-white">
                            <span className="text-xl font-bold">{event.ticketPrice}</span>
                            <span className="text-gray-400 text-sm ml-1">/ticket</span>
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white border-none"
                          >
                            Register
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {activeTab === 'yachts' && favoriteYachts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Heart className="h-16 w-16 mx-auto text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No favorite yachts yet</h3>
            <p className="text-gray-500 mb-6">Start exploring and save your favorite yachts</p>
            <Button 
              onClick={() => setCurrentView('home')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Explore Yachts
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}