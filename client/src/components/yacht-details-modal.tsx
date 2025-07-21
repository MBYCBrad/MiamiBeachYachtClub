import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, Anchor, Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Yacht } from '@shared/schema';
import YachtBookingModal from './yacht-booking-modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface YachtDetailsModalProps {
  yacht: Yacht | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function YachtDetailsModal({ yacht, isOpen, onClose }: YachtDetailsModalProps) {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!yacht) return null;

  // Get all yacht images - use images array if available, otherwise imageUrl
  const yachtImages = yacht.images && yacht.images.length > 0 
    ? yacht.images 
    : yacht.imageUrl 
    ? [yacht.imageUrl]
    : [];

  // Get user's favorites
  const { data: userFavorites = [] } = useQuery({
    queryKey: ['/api/favorites'],
    staleTime: 5 * 60 * 1000,
  });

  const isFavorite = userFavorites.some((fav: any) => fav.yachtId === yacht.id);

  // Toggle favorite mutation
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        const response = await apiRequest('DELETE', `/api/favorites?yachtId=${yacht.id}`);
        return response.json();
      } else {
        const response = await apiRequest('POST', '/api/favorites', { yachtId: yacht.id });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
        description: isFavorite 
          ? `${yacht.name} has been removed from your favorites` 
          : `${yacht.name} has been added to your favorites`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      });
    }
  });

  const nextImage = () => {
    if (yachtImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % yachtImages.length);
    }
  };

  const prevImage = () => {
    if (yachtImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + yachtImages.length) % yachtImages.length);
    }
  };

  const handleBookNow = () => {
    setIsBookingModalOpen(true);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto bg-black border border-gray-700/50 text-white" 
          aria-describedby="yacht-description"
          onPointerDownOutside={(e) => {
            e.preventDefault();
            onClose();
          }}
          onEscapeKeyDown={(e) => {
            e.preventDefault();
            onClose();
          }}
          onCloseAutoFocus={(e) => {
            e.preventDefault();
          }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{yacht.name} Details</DialogTitle>
          </DialogHeader>

          {/* Manual close button as fallback */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} className="text-gray-400" />
          </button>

          <div className="space-y-6">
            {/* Image Gallery */}
            {yachtImages.length > 0 && (
              <div className="relative w-full h-80 bg-gray-800 rounded-lg overflow-hidden">
                <img
                  src={yachtImages[currentImageIndex]}
                  alt={yacht.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to a default yacht image if the real image fails
                    e.currentTarget.src = "/api/media/pexels-diego-f-parra-33199-843633 (1)_1750537277228.jpg";
                  }}
                />
                
                {/* Image navigation */}
                {yachtImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                    
                    {/* Image indicators */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {yachtImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Favorite button */}
                <button
                  onClick={handleToggleFavorite}
                  disabled={toggleFavoriteMutation.isPending}
                  className="absolute top-4 left-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all"
                >
                  <Heart
                    size={20}
                    className={`transition-colors ${
                      isFavorite ? 'text-red-500 fill-red-500' : 'text-white'
                    }`}
                  />
                </button>
              </div>
            )}

            {/* Yacht Details */}
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{yacht.name}</h2>
                <div className="flex items-center text-gray-300 mb-3">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">{yacht.location}</span>
                </div>
              </div>

              {/* Yacht Info */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Anchor className="text-purple-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-400">Size</p>
                    <p className="text-white font-semibold">{yacht.size}ft</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="text-purple-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-400">Capacity</p>
                    <p className="text-white font-semibold">{yacht.capacity} guests</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="text-purple-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-400">Rating</p>
                    <p className="text-white font-semibold">4.8/5</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {yacht.description && (
                <div id="yacht-description">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{yacht.description}</p>
                </div>
              )}

              {/* Amenities */}
              {yacht.amenities && yacht.amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {yacht.amenities.map((amenity, index) => (
                      <Badge
                        key={index}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0"
                      >
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleBookNow}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300"
                >
                  Book Now
                </Button>
                <Button
                  onClick={handleToggleFavorite}
                  disabled={toggleFavoriteMutation.isPending}
                  variant="outline"
                  className="px-6 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Heart
                    size={18}
                    className={`mr-2 ${
                      isFavorite ? 'text-red-500 fill-red-500' : ''
                    }`}
                  />
                  {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Modal */}
      {yacht && (
        <YachtBookingModal
          yacht={yacht}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}
    </>
  );
}