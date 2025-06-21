import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Heart, 
  Star, 
  MapPin, 
  Filter, 
  Map,
  List,
  Users,
  Calendar,
  Anchor,
  Wifi,
  Car,
  Utensils,
  Waves
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SearchResultsProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  searchCriteria?: {
    location: string;
    checkIn: Date | undefined;
    checkOut: Date | undefined;
    guests: {
      adults: number;
      children: number;
      infants: number;
      pets: number;
    };
  };
}

interface YachtResult {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  amenities: string[];
  capacity: number;
  size: string;
  type: string;
  available: boolean;
  isGuestFavorite: boolean;
  host: {
    name: string;
    isSuperhost: boolean;
  };
}

export default function SearchResults({ currentView, setCurrentView, searchCriteria }: SearchResultsProps) {
  const [viewType, setViewType] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState('recommended');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Fetch real yacht data from API
  const { data: yachtsData = [], isLoading, error } = useQuery({
    queryKey: ['/api/yachts'],
    staleTime: 5 * 60 * 1000,
  });

  // Transform API data to match YachtResult interface
  const searchResults: YachtResult[] = (yachtsData as any[]).map((yacht: any) => ({
    id: yacht.id,
    name: yacht.name,
    location: yacht.location,
    price: yacht.pricePerHour ? parseInt(yacht.pricePerHour) * 4 : 0, // Convert hourly to 4-hour rate
    rating: 4.5 + Math.random() * 0.5, // Generate realistic ratings
    reviewCount: Math.floor(Math.random() * 200) + 50,
    images: yacht.imageUrl ? [yacht.imageUrl] : [
      'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop'
    ],
    amenities: yacht.amenities ? Object.keys(yacht.amenities) : ['WiFi', 'Kitchen'],
    capacity: yacht.capacity,
    size: `${yacht.size}ft`,
    type: 'Motor Yacht',
    available: yacht.isAvailable,
    isGuestFavorite: Math.random() > 0.7,
    host: {
      name: 'Captain Rodriguez',
      isSuperhost: Math.random() > 0.5
    }
  }));

  // Filter results based on search criteria
  const filteredResults = searchResults.filter(yacht => {
    if (!searchCriteria) return true;
    
    // Filter by location if provided
    if (searchCriteria.location && searchCriteria.location !== 'Anywhere') {
      const locationMatch = yacht.location.toLowerCase().includes(searchCriteria.location.toLowerCase());
      if (!locationMatch) return false;
    }
    
    // Filter by guest capacity
    const totalGuests = searchCriteria.guests.adults + searchCriteria.guests.children + searchCriteria.guests.infants;
    if (totalGuests > yacht.capacity) return false;
    
    // Only show available yachts
    return yacht.available;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading yachts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Error loading yachts. Please try again.</div>
      </div>
    );
  }



  const toggleFavorite = (yachtId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(yachtId)) {
        newFavorites.delete(yachtId);
      } else {
        newFavorites.add(yachtId);
      }
      return newFavorites;
    });
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi': return <Wifi size={16} />;
      case 'kitchen': case 'dining': return <Utensils size={16} />;
      case 'parking': return <Car size={16} />;
      case 'water sports': return <Waves size={16} />;
      default: return <Anchor size={16} />;
    }
  };



  const getTotalGuests = () => {
    if (!searchCriteria) return 0;
    return searchCriteria.guests.adults + searchCriteria.guests.children + searchCriteria.guests.infants;
  };

  const getDateRange = () => {
    if (!searchCriteria?.checkIn || !searchCriteria?.checkOut) return '';
    return `${format(searchCriteria.checkIn, 'MMM d')} - ${format(searchCriteria.checkOut, 'MMM d')}`;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Back to Explore Breadcrumb */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-gray-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => setCurrentView('home')}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Explore</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              {filteredResults.length} yacht charters available
            </h1>
            {searchCriteria && (
              <p className="text-gray-300 mt-1">
                {searchCriteria.location && `${searchCriteria.location} • `}
                {getDateRange() && `${getDateRange()} • `}
                {getTotalGuests() > 0 && `${getTotalGuests()} guests`}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-800/50 border border-purple-500/30 rounded-lg p-1">
              <Button
                onClick={() => setViewType('list')}
                variant={viewType === 'list' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "px-3",
                  viewType === 'list' 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                    : "text-gray-300 hover:text-white"
                )}
              >
                <List size={16} className="mr-2" />
                List
              </Button>
              <Button
                onClick={() => setViewType('map')}
                variant={viewType === 'map' ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  "px-3",
                  viewType === 'map' 
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white" 
                    : "text-gray-300 hover:text-white"
                )}
              >
                <Map size={16} className="mr-2" />
                Map
              </Button>
            </div>

            {/* Filters */}
            <Button variant="outline" className="flex items-center space-x-2 border-purple-500/30 bg-gray-800/50 text-gray-300 hover:text-white hover:border-purple-400">
              <Filter size={16} />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {/* No Results Message */}
        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              No yachts found matching your criteria
            </div>
            <p className="text-gray-500">
              Try adjusting your search filters or location
            </p>
          </div>
        )}

        {/* Results Grid */}
        {filteredResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredResults.map((yacht, index) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl border border-purple-500/20 hover:border-purple-400/50 transition-all duration-200"
              >
                <Card className="border-none shadow-none bg-transparent">
                  <div className="relative">
                    {/* Image */}
                    <div className="aspect-square overflow-hidden rounded-t-xl">
                      <img
                        src={yacht.images[0]}
                        alt={yacht.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(yacht.id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full transition-colors"
                    >
                      <Heart
                        size={16}
                        className={cn(
                          "transition-colors",
                          favorites.has(yacht.id) || yacht.isGuestFavorite
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
                        )}
                      />
                    </button>

                    {/* Guest Favorite Badge */}
                    {yacht.isGuestFavorite && (
                      <Badge className="absolute top-3 left-3 bg-white/90 text-gray-900 hover:bg-white">
                        Guest favourite
                      </Badge>
                    )}

                    {/* Superhost Badge */}
                    {yacht.host.isSuperhost && (
                      <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                        Superhost
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    {/* Location & Rating */}
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white truncate">
                        {yacht.location}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Star size={14} className="fill-current text-yellow-400" />
                        <span className="text-sm font-medium text-white">
                          {yacht.rating}
                        </span>
                      </div>
                    </div>

                    {/* Yacht Details */}
                    <p className="text-gray-300 text-sm mb-2 truncate">
                      {yacht.name}
                    </p>

                    {/* Specs */}
                    <div className="flex items-center space-x-4 text-xs text-gray-400 mb-3">
                      <span>{yacht.size}</span>
                      <span>•</span>
                      <span>{yacht.type}</span>
                      <span>•</span>
                      <span>Up to {yacht.capacity} guests</span>
                    </div>

                    {/* Amenities */}
                    <div className="flex items-center space-x-2 mb-3">
                      {yacht.amenities.slice(0, 4).map((amenity, idx) => (
                        <div
                          key={idx}
                          className="flex items-center text-purple-400"
                          title={amenity}
                        >
                          {getAmenityIcon(amenity)}
                        </div>
                      ))}
                      {yacht.amenities.length > 4 && (
                        <span className="text-xs text-gray-400">
                          +{yacht.amenities.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline space-x-1">
                      <span className="font-semibold text-white">
                        ${yacht.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-300">/ 4 hours</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Load More */}
        {filteredResults.length > 0 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="px-8 border-purple-500/30 bg-gray-800/50 text-white hover:bg-purple-600/20 hover:border-purple-400">
              Continue exploring
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}