import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import type { Yacht } from "@shared/schema";
import { cn } from '@/lib/utils';

// Authentic yacht images from storage bucket
const YACHT_IMAGES = [
  "/api/media/pexels-diego-f-parra-33199-843633 (1)_1750537277228.jpg", // Luxury mega yacht
  "/api/media/pexels-goumbik-296278_1750537277229.jpg", // White sport yacht
  "/api/media/pexels-mali-42092_1750537277229.jpg", // Marina luxury yacht
  "/api/media/pexels-mikebirdy-144634_1750537277230.jpg", // Harbor motor yacht
  "/api/media/pexels-pixabay-163236_1750537277230.jpg", // Modern sport cruiser
  "/api/media/pexels-mali-42091_1750537294323.jpg", // Premium superyacht
  "/api/media/pexels-diego-f-parra-33199-843633 (1)_1750537277228.jpg", // Luxury mega yacht
  "/api/media/pexels-goumbik-296278_1750537277229.jpg", // White sport yacht
  "/api/media/pexels-mali-42092_1750537277229.jpg", // Marina luxury yacht
  "/api/media/pexels-mikebirdy-144634_1750537277230.jpg"  // Harbor motor yacht
];

const getYachtImage = (yachtId: number) => {
  return YACHT_IMAGES[(yachtId - 1) % YACHT_IMAGES.length];
};

interface YachtCardProps {
  yacht: Yacht;
  index?: number;
}

export default function YachtCard({ yacht, index = 0 }: YachtCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
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
      className="group relative bg-gray-800/30 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-500/20 transition-all duration-500 cursor-pointer overflow-hidden
        hover:shadow-[0_20px_50px_rgba(168,85,247,0.4)] 
        hover:border-purple-400/60
        hover:bg-gray-800/50
        before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-600/0 before:via-purple-600/5 before:to-blue-600/0 before:opacity-0 before:transition-opacity before:duration-500
        hover:before:opacity-100"
    >
      <div className="relative z-10">
        <div className="relative overflow-hidden rounded-t-2xl">
          <motion.img 
            src={yacht.imageUrl || getYachtImage(yacht.id)} 
            alt={yacht.name}
            className="w-full h-48 object-cover"
            whileHover={{ 
              scale: 1.1,
              transition: { 
                type: "spring", 
                stiffness: 300, 
                damping: 20 
              }
            }}
          />
          
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
            className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full backdrop-blur-sm shadow-lg z-20 group/heart"
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

          {/* Price and Reserve Button */}
          <motion.div 
            className="flex items-center justify-between mb-3"
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
            <motion.div
              whileHover={{ 
                scale: 1.05,
                transition: { type: "spring", stiffness: 400 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300">
                Reserve
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
    </motion.div>
  );
}
