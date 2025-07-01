import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Star, Clock, DollarSign, User, Calendar, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { Service } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ServiceDetailsModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

const serviceCategories = {
  "beauty_grooming": "💅",
  "culinary": "👨‍🍳",
  "wellness_spa": "🧘‍♀️",
  "photography_media": "📸",
  "entertainment": "🎵",
  "water_sports": "🏄‍♂️",
  "concierge_lifestyle": "🛎️"
};

export default function ServiceDetailsModal({ service, isOpen, onClose }: ServiceDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!service) return null;

  const serviceImages = service.images ? 
    (Array.isArray(service.images) ? service.images : [service.images]) : 
    service.imageUrl ? [service.imageUrl] : 
    ["/api/media/pexels-pixabay-163236_1750537277230.jpg"];

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/favorites/service/${service.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Success",
        description: "Updated favorites",
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
    if (serviceImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % serviceImages.length);
    }
  };

  const prevImage = () => {
    if (serviceImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + serviceImages.length) % serviceImages.length);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur-lg border border-purple-500/20 text-white">
        <DialogHeader className="sr-only">
          <h2>{service.name} Details</h2>
        </DialogHeader>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
        >
          <X size={20} className="text-gray-400" />
        </button>

        <div className="space-y-6">
          {/* Image Gallery */}
          {serviceImages.length > 0 && (
            <div className="relative w-full h-80 bg-gray-800 rounded-lg overflow-hidden">
              <img
                src={serviceImages[currentImageIndex]}
                alt={service.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/api/media/pexels-pixabay-163236_1750537277230.jpg";
                }}
              />

              {/* Navigation arrows */}
              {serviceImages.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft size={20} className="text-white" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
                  >
                    <ChevronRight size={20} className="text-white" />
                  </button>
                </>
              )}

              {/* Image counter */}
              {serviceImages.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-full px-3 py-1">
                  <span className="text-white text-sm">
                    {currentImageIndex + 1} / {serviceImages.length}
                  </span>
                </div>
              )}

              {/* Favorite button */}
              <button
                onClick={handleToggleFavorite}
                disabled={toggleFavoriteMutation.isPending}
                className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
              >
                <Heart size={20} className="text-white" />
              </button>
            </div>
          )}

          {/* Service Header */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">
                    {serviceCategories[service.category as keyof typeof serviceCategories] || "🛎️"}
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {service.name}
                    </h2>
                    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white mt-2">
                      {service.category?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-purple-400">
                  ${service.pricePerSession}
                </div>
                <div className="text-gray-400 text-sm">per session</div>
              </div>
            </div>

            {/* Service Stats */}
            <div className="flex flex-wrap gap-4">
              {service.duration && (
                <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2">
                  <Clock size={16} className="text-blue-400" />
                  <span className="text-sm">{service.duration} minutes</span>
                </div>
              )}
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2">
                <Star size={16} className="text-yellow-400" />
                <span className="text-sm">{service.rating || '4.8'} rating</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg px-3 py-2">
                <User size={16} className="text-green-400" />
                <span className="text-sm">
                  {service.isAvailable ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
          </div>

          {/* Service Description */}
          {service.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">About This Service</h3>
              <p className="text-gray-300 leading-relaxed">
                {service.description}
              </p>
            </div>
          )}

          {/* Provider Information */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Service Provider</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {service.providerId === 60 ? "MBYC Service" : "Service Provider"}
                </p>
                <p className="text-gray-400 text-sm">Professional Service</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              disabled={!service.isAvailable}
            >
              <Calendar size={16} className="mr-2" />
              {service.isAvailable ? "Book Service" : "Currently Unavailable"}
            </Button>
            <Button 
              variant="outline" 
              className="border-purple-500/30 text-purple-400 hover:border-purple-400 hover:text-purple-300"
              onClick={handleToggleFavorite}
              disabled={toggleFavoriteMutation.isPending}
            >
              <Heart size={16} className="mr-2" />
              Favorite
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}