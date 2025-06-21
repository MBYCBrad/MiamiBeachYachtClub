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
import AirbnbSearchBar from '@/components/AirbnbSearchBar';

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

  // Mock search results data based on search criteria
  const mockResults: YachtResult[] = [
    {
      id: 1,
      name: 'Marina Breeze - Luxury Yacht',
      location: 'Miami Beach, Florida',
      price: 1250,
      rating: 4.89,
      reviewCount: 127,
      images: [
        'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop'
      ],
      amenities: ['WiFi', 'Kitchen', 'Parking', 'Water Sports'],
      capacity: 12,
      size: '65ft',
      type: 'Motor Yacht',
      available: true,
      isGuestFavorite: true,
      host: {
        name: 'Captain Rodriguez',
        isSuperhost: true
      }
    },
    {
      id: 2,
      name: 'Ocean Pearl - Premium Charter',
      location: 'Biscayne Bay, Miami',
      price: 985,
      rating: 4.94,
      reviewCount: 89,
      images: [
        'https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop'
      ],
      amenities: ['WiFi', 'Kitchen', 'Water Sports', 'Dining'],
      capacity: 10,
      size: '58ft',
      type: 'Sailing Yacht',
      available: true,
      isGuestFavorite: false,
      host: {
        name: 'Marina Club',
        isSuperhost: false
      }
    },
    {
      id: 3,
      name: 'Sunset Dream - Catamaran',
      location: 'Key Biscayne, Florida',
      price: 875,
      rating: 4.76,
      reviewCount: 203,
      images: [
        'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&h=600&fit=crop'
      ],
      amenities: ['WiFi', 'Kitchen', 'Parking', 'Water Sports', 'Dining'],
      capacity: 14,
      size: '48ft',
      type: 'Catamaran',
      available: true,
      isGuestFavorite: true,
      host: {
        name: 'Captain Sarah',
        isSuperhost: true
      }
    },
    {
      id: 4,
      name: 'Aqua Escape - Sport Fisher',
      location: 'Fort Lauderdale, Florida',
      price: 1450,
      rating: 4.82,
      reviewCount: 156,
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581002103090-f96a1bae5e3b?w=800&h=600&fit=crop'
      ],
      amenities: ['WiFi', 'Kitchen', 'Fishing Gear', 'Water Sports'],
      capacity: 8,
      size: '72ft',
      type: 'Sport Fisher',
      available: true,
      isGuestFavorite: false,
      host: {
        name: 'Deep Sea Charters',
        isSuperhost: true
      }
    },
    {
      id: 5,
      name: 'Coastal Elegance - Mega Yacht',
      location: 'West Palm Beach, Florida',
      price: 2250,
      rating: 4.97,
      reviewCount: 74,
      images: [
        'https://images.unsplash.com/photo-1592915068688-b9e0d1b6b1d5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1581007871115-a5e2b5f28c9d?w=800&h=600&fit=crop'
      ],
      amenities: ['WiFi', 'Kitchen', 'Parking', 'Water Sports', 'Dining', 'Spa'],
      capacity: 20,
      size: '120ft',
      type: 'Mega Yacht',
      available: true,
      isGuestFavorite: true,
      host: {
        name: 'Luxury Yacht Co.',
        isSuperhost: true
      }
    }
  ];

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

  const handleNewSearch = (criteria: any) => {
    // Handle new search from the search bar
    console.log('New search:', criteria);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sticky Search Bar */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-purple-500/30 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <AirbnbSearchBar onSearch={handleNewSearch} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              Over {mockResults.length * 100} yacht charters
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

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {mockResults.map((yacht, index) => (
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
                      <span className="text-sm text-gray-300">/ day</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8 border-purple-500/30 bg-gray-800/50 text-white hover:bg-purple-600/20 hover:border-purple-400">
            Continue exploring
          </Button>
        </div>
      </div>
    </div>
  );
}