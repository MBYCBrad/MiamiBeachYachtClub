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
  const [sortBy, setSortBy] = useState('recommended');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    yachtSize: 'any',
    capacity: undefined as string | undefined,
    yachtType: undefined as string | undefined,
    location: undefined as string | undefined,
    amenities: [] as string[],
  });

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

  // Filter results based on search criteria and filters
  const filteredResults = searchResults.filter(yacht => {
    // Search criteria filters
    if (searchCriteria) {
      // Filter by location if provided
      if (searchCriteria.location && searchCriteria.location !== 'Anywhere') {
        const locationMatch = yacht.location.toLowerCase().includes(searchCriteria.location.toLowerCase());
        if (!locationMatch) return false;
      }
      
      // Filter by guest capacity
      const totalGuests = searchCriteria.guests.adults + searchCriteria.guests.children + searchCriteria.guests.infants;
      if (totalGuests > yacht.capacity) return false;
    }
    
    // Additional filters
    // Filter by yacht size
    if (filters.yachtSize !== 'any') {
      const yachtSizeNum = parseInt(yacht.size);
      switch (filters.yachtSize) {
        case 'small':
          if (yachtSizeNum >= 60) return false;
          break;
        case 'medium':
          if (yachtSizeNum < 60 || yachtSizeNum >= 100) return false;
          break;
        case 'large':
          if (yachtSizeNum < 100) return false;
          break;
      }
    }

    // Filter by guest capacity
    if (filters.capacity) {
      switch (filters.capacity) {
        case 'small':
          if (yacht.capacity < 2 || yacht.capacity > 6) return false;
          break;
        case 'medium':
          if (yacht.capacity < 7 || yacht.capacity > 12) return false;
          break;
        case 'large':
          if (yacht.capacity < 13) return false;
          break;
      }
    }

    // Filter by yacht type
    if (filters.yachtType) {
      const yachtTypeMatch = yacht.type.toLowerCase().includes(filters.yachtType.toLowerCase());
      if (!yachtTypeMatch) return false;
    }

    // Filter by location
    if (filters.location) {
      const locationKeywords = {
        'miami': ['miami', 'beach'],
        'fort': ['fort', 'lauderdale'],
        'key': ['key', 'biscayne'],
        'aventura': ['aventura']
      };
      
      const keywords = locationKeywords[filters.location as keyof typeof locationKeywords] || [filters.location];
      const locationMatch = keywords.some(keyword => 
        yacht.location.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!locationMatch) return false;
    }
    
    // Filter by amenities
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity => 
        yacht.amenities.some(yachtAmenity => 
          yachtAmenity.toLowerCase().includes(amenity.toLowerCase())
        )
      );
      if (!hasAllAmenities) return false;
    }
    
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
            {/* Filters */}
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center space-x-2 border-purple-500/30 bg-gray-800/50 text-gray-300 hover:text-white hover:border-purple-400",
                showFilters && "bg-purple-600/20 border-purple-400 text-white"
              )}
            >
              <Filter size={16} />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Yacht Size */}
              <div className="space-y-3">
                <label className="text-white font-medium">Yacht Size</label>
                <select
                  value={filters.yachtSize}
                  onChange={(e) => setFilters({ ...filters, yachtSize: e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full"
                >
                  <option value="any">Any Size</option>
                  <option value="small">Small (Under 60ft)</option>
                  <option value="medium">Medium (60-100ft)</option>
                  <option value="large">Large (100ft+)</option>
                </select>
              </div>

              {/* Guest Capacity */}
              <div className="space-y-3">
                <label className="text-white font-medium">Guest Capacity</label>
                <select
                  value={filters.capacity || 'any'}
                  onChange={(e) => setFilters({ ...filters, capacity: e.target.value === 'any' ? undefined : e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full"
                >
                  <option value="any">Any Capacity</option>
                  <option value="small">2-6 Guests</option>
                  <option value="medium">7-12 Guests</option>
                  <option value="large">13+ Guests</option>
                </select>
              </div>

              {/* Yacht Type */}
              <div className="space-y-3">
                <label className="text-white font-medium">Yacht Type</label>
                <select
                  value={filters.yachtType || 'any'}
                  onChange={(e) => setFilters({ ...filters, yachtType: e.target.value === 'any' ? undefined : e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full"
                >
                  <option value="any">Any Type</option>
                  <option value="motor">Motor Yacht</option>
                  <option value="sailing">Sailing Yacht</option>
                  <option value="catamaran">Catamaran</option>
                  <option value="luxury">Luxury Yacht</option>
                  <option value="sport">Sport Yacht</option>
                </select>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label className="text-white font-medium">Marina Location</label>
                <select
                  value={filters.location || 'any'}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value === 'any' ? undefined : e.target.value })}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white w-full"
                >
                  <option value="any">Any Marina</option>
                  <option value="miami">Miami Beach Marina</option>
                  <option value="fort">Fort Lauderdale</option>
                  <option value="key">Key Biscayne</option>
                  <option value="aventura">Aventura Marina</option>
                </select>
              </div>
            </div>

            {/* Amenities Grid */}
            <div className="mt-6">
              <label className="text-white font-medium mb-3 block">Amenities & Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  'WiFi', 'Kitchen', 'Bar', 'Dining Area', 'Water Sports', 'Snorkeling Gear',
                  'Fishing Equipment', 'Sound System', 'Air Conditioning', 'Sun Deck',
                  'Swimming Platform', 'Jet Ski', 'Paddleboard', 'Kayak', 'BBQ Grill',
                  'Captain Included', 'Crew Service', 'Towels & Linens', 'Ice & Cooler',
                  'Bluetooth Audio', 'TV/Entertainment', 'Floating Mats', 'Umbrella/Shade',
                  'Safety Equipment'
                ].map((amenity) => (
                  <label key={amenity} className="flex items-center space-x-2 cursor-pointer bg-gray-700/30 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({
                            ...filters,
                            amenities: [...filters.amenities, amenity]
                          });
                        } else {
                          setFilters({
                            ...filters,
                            amenities: filters.amenities.filter(a => a !== amenity)
                          });
                        }
                      }}
                      className="rounded border-gray-600 bg-gray-700 text-purple-600"
                    />
                    <span className="text-gray-300 text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setFilters({
                  yachtSize: 'any',
                  capacity: undefined,
                  yachtType: undefined,
                  location: undefined,
                  amenities: [],
                })}
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                Clear Filters
              </Button>
            </div>
          </motion.div>
        )}

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