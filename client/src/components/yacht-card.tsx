import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import YachtBookingModal from './yacht-booking-modal';
import YachtDetailsModal from './yacht-details-modal';
import type { Yacht } from "@shared/schema";
import { cn } from '@/lib/utils';
import { useOptimizedImage } from '@/hooks/use-optimized-images';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface YachtCardProps {
  yacht: Yacht;
  index?: number;
}

const YachtCard = memo(function YachtCard({ yacht, index = 0 }: YachtCardProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Use real yacht images from database - imageUrl for main image or first image from images array
  // Add timestamp to bust browser cache and ensure real-time updates
  const yachtImage = yacht.imageUrl || (yacht.images && yacht.images.length > 0 ? yacht.images[0] : undefined);
  const imageWithTimestamp = yachtImage ? `${yachtImage}?t=${Date.now()}` : undefined;
  const { imageSrc, isLoading } = useOptimizedImage(imageWithTimestamp || "/api/media/pexels-diego-f-parra-33199-843633 (1)_1750537277228.jpg");

  // Get user's favorites
  const { data: userFavorites = [] } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });

  const isFavorite = Array.isArray(userFavorites) && userFavorites.some((fav: any) => fav.yachtId === yacht.id);

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/favorites', { yachtId: yacht.id });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Added to Favorites",
        description: `${yacht.name} has been added to your favorites`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add yacht to favorites",
        variant: "destructive",
      });
    }
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/favorites?yachtId=${yacht.id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from Favorites",
        description: `${yacht.name} has been removed from your favorites`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove yacht from favorites",
        variant: "destructive",
      });
    }
  });

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save favorites",
        variant: "destructive",
      });
      return;
    }

    if (isFavorite) {
      removeFavoriteMutation.mutate();
    } else {
      addFavoriteMutation.mutate();
    }
  };

  const openBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay: index * 0.1,
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      whileHover={{ 
        y: -8,
        scale: 1.02,
        transition: { 
          type: "spring", 
          stiffness: 400, 
          damping: 25 
        }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={() => setIsDetailsModalOpen(true)}
      className="group relative cursor-pointer bg-gray-900/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-700/50 transition-all duration-500 overflow-hidden
        hover:shadow-[0_20px_50px_rgba(168,85,247,0.4)] 
        hover:border-purple-400/60
        hover:bg-gray-800/50
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-600/0 before:via-purple-600/5 before:to-blue-600/0 before:opacity-0 before:transition-opacity before:duration-500
        hover:before:opacity-100"
    >
      <div className="relative z-10">
        <div className="relative overflow-hidden rounded-t-2xl">
          {isLoading ? (
            <div className="w-full h-48 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
              <div className="text-gray-600">Loading...</div>
            </div>
          ) : (
            <motion.img 
              src={imageSrc || yachtImage} 
              alt={yacht.name}
              className="w-full h-48 object-cover"
              key={yacht.id}
              loading="eager"
              whileHover={{ 
                scale: 1.1,
                transition: { 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20 
                }
              }}
            />
          )}
          
          {/* Animated overlay on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            initial={false}
          />
          
          {/* Shimmer effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
          </div>

          {/* Premium Favorite Button */}
          <motion.button
            onClick={toggleFavorite}
            disabled={addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
            className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full backdrop-blur-sm shadow-lg z-20 group/heart disabled:opacity-50"
            whileHover={{ 
              scale: 1.1,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              transition: { type: "spring", stiffness: 400 }
            }}
            whileTap={{ 
              scale: 0.9,
              transition: { type: "spring", stiffness: 600 }
            }}
          >
            <motion.div
              animate={
                isFavorite
                  ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <Heart
                size={16}
                className={cn(
                  "transition-all duration-300 group-hover/heart:drop-shadow-lg",
                  isFavorite
                    ? "fill-red-500 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                    : "text-gray-600 group-hover/heart:text-red-400"
                )}
              />
            </motion.div>
          </motion.button>

          {/* Member Favorite Badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 0 20px rgba(168, 85, 247, 0.6)"
            }}
            className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-blue-600 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-medium text-white shadow-lg border border-purple-400/50"
          >
            Member Favorite
          </motion.div>
        </div>

        <div className="p-4">
          {/* Header with Name and Rating */}
          <motion.div 
            className="flex items-center justify-between mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.h4 
              className="font-semibold text-white group-hover:text-purple-200 transition-colors duration-300"
              whileHover={{ x: 2 }}
            >
              {yacht.name}
            </motion.h4>
            <motion.div 
              className="flex items-center space-x-1"
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400 }
              }}
            >
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
              >
                <Star size={14} className="fill-current text-yellow-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
              </motion.div>
              <span className="text-sm text-gray-400 group-hover:text-yellow-300 transition-colors duration-300">5.0</span>
            </motion.div>
          </motion.div>

          {/* Location */}
          <motion.p 
            className="text-sm text-gray-400 mb-2 group-hover:text-gray-300 transition-colors duration-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ x: 2 }}
          >
            {yacht.location}
          </motion.p>

          {/* Yacht Specs */}
          <motion.p 
            className="text-sm text-gray-400 mb-3 group-hover:text-gray-300 transition-colors duration-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.span whileHover={{ scale: 1.05, color: "#a855f7" }}>{yacht.size}ft</motion.span>
            <span> • Capacity: </span>
            <motion.span whileHover={{ scale: 1.05, color: "#10b981" }}>{yacht.capacity}</motion.span>
          </motion.p>

          {/* Price Section */}
          <motion.div 
            className="mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div whileHover={{ scale: 1.02 }}>
              <motion.span 
                className="text-lg font-bold text-white group-hover:text-purple-200 transition-colors duration-300"
                whileHover={{ 
                  scale: 1.1,
                  textShadow: "0 0 8px rgba(168, 85, 247, 0.6)"
                }}
              >
                FREE
              </motion.span>
              <span className="text-sm text-gray-400 block group-hover:text-purple-300 transition-colors duration-300">with membership</span>
            </motion.div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            className="flex gap-2 mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="flex-1"
              whileHover={{ 
                scale: 1.02,
                transition: { type: "spring", stiffness: 400 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  openBookingModal();
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300"
              >
                Book Now
              </Button>
            </motion.div>
          </motion.div>

          {/* Amenities */}
          {yacht.amenities && yacht.amenities.length > 0 && (
            <motion.div 
              className="mt-3 pt-3 border-t border-gray-700/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs text-gray-500 mb-1 group-hover:text-purple-400 transition-colors duration-300">Amenities:</p>
              <div className="flex flex-wrap gap-1">
                {yacht.amenities.slice(0, 3).map((amenity, amenityIndex) => (
                  <motion.span 
                    key={amenityIndex} 
                    className="text-xs bg-gray-700/50 px-2 py-1 rounded text-gray-300 group-hover:bg-purple-600/20 group-hover:text-purple-200 transition-all duration-300"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ 
                      delay: 0.7 + (amenityIndex * 0.1),
                      type: "spring",
                      stiffness: 300
                    }}
                    whileHover={{ 
                      scale: 1.1,
                      backgroundColor: "rgba(168, 85, 247, 0.3)",
                      transition: { type: "spring", stiffness: 400 }
                    }}
                  >
                    {amenity}
                  </motion.span>
                ))}
                {yacht.amenities.length > 3 && (
                  <motion.span 
                    className="text-xs text-purple-400 group-hover:text-purple-300 transition-colors duration-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    +{yacht.amenities.length - 3} more
                  </motion.span>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Yacht Details Modal */}
      <YachtDetailsModal 
        yacht={yacht}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      {/* Booking Modal */}
      <YachtBookingModal 
        yacht={yacht}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
      />
    </motion.div>
  );
});

export default YachtCard;
