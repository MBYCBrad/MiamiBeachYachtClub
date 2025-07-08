import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Users, Calendar, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  pricePerSession: string;
  duration: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  images?: string[];
  deliveryType: string;
  businessAddress?: string;
  marinaLocation?: string;
  provider?: {
    name: string;
    role: string;
  };
  availability?: string;
  maxCapacity?: number;
  isAvailable: boolean;
}

interface ServiceDetailsModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onBookService?: (service: Service) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (serviceId: number) => void;
}

export default function ServiceDetailsModal({
  service,
  isOpen,
  onClose,
  onBookService,
  isFavorite = false,
  onToggleFavorite
}: ServiceDetailsModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!service) return null;

  const allImages = service.images && service.images.length > 0 
    ? service.images 
    : service.imageUrl 
    ? [service.imageUrl] 
    : [];

  const getDeliveryTypeInfo = () => {
    switch (service.deliveryType) {
      case 'yacht':
        return { icon: '🛥️', text: 'Available during your yacht charter', color: 'text-white' };
      case 'marina':
        return { icon: '📍', text: `Marina: ${service.marinaLocation || 'Miami Marina'}`, color: 'text-white' };
      case 'location':
        return { icon: '🚗', text: 'We come to your location', color: 'text-white' };
      case 'external_location':
        return { icon: '📍', text: `Visit: ${service.businessAddress || 'Provider Location'}`, color: 'text-white' };
      default:
        return { icon: '📍', text: 'Location service', color: 'text-white' };
    }
  };

  const deliveryInfo = getDeliveryTypeInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-black border-gray-700 text-white max-h-[90vh] overflow-hidden">
        <div className="max-h-[80vh] overflow-y-auto pr-2">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            {service.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Image Gallery */}
          <div className="space-y-4">
            {allImages.length > 0 && (
              <div className="relative">
                <motion.img
                  key={selectedImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  src={allImages[selectedImageIndex]}
                  alt={service.name}
                  className="w-full h-64 lg:h-80 object-cover rounded-lg"
                />
                
                {/* Image Counter */}
                {allImages.length > 1 && (
                  <div className="absolute top-4 right-4 bg-black/60 px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {allImages.length}
                  </div>
                )}

                {/* Navigation Arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-2 rounded-full transition-colors"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 p-2 rounded-full transition-colors"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Image Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors",
                      selectedImageIndex === index ? "border-purple-500" : "border-gray-600 hover:border-gray-400"
                    )}
                  >
                    <img
                      src={image}
                      alt={`${service.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Details */}
          <div className="space-y-6">
            {/* Tags and Rating */}
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  {service.category}
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  {service.deliveryType === 'yacht' && 'Yacht Add-On'}
                  {service.deliveryType === 'location' && 'Your Location'}
                  {service.deliveryType === 'marina' && 'Marina Service'}
                  {service.deliveryType === 'external_location' && 'External Location'}
                  {!service.deliveryType && 'Location Service'}
                </Badge>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium">{service.rating}</span>
                  <span className="text-gray-400">({service.reviewCount} reviews)</span>
                </div>
                
                {onToggleFavorite && (
                  <button
                    onClick={() => onToggleFavorite(service.id)}
                    className="flex items-center gap-1 hover:scale-110 transition-transform"
                  >
                    <Heart 
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isFavorite ? "text-red-500 fill-current" : "text-gray-400 hover:text-red-400"
                      )} 
                    />
                  </button>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-300 leading-relaxed">{service.description}</p>
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-sm">{service.duration} minutes</span>
              </div>
              
              {service.maxCapacity && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">Up to {service.maxCapacity} guests</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-white">Available Now</span>
              </div>
            </div>

            {/* Location Info */}
            <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
              <span className="text-lg">{deliveryInfo.icon}</span>
              <span className="text-white text-sm">{deliveryInfo.text}</span>
            </div>

            {/* Provider Info */}
            {service.provider && (
              <div>
                <h3 className="font-semibold mb-2">Service Provider</h3>
                <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center">
                    <span className="text-white font-semibold">{service.provider.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium">{service.provider.name}</p>
                    <p className="text-gray-400 text-sm">{service.provider.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing and Book Button */}
            <div className="border-t border-gray-700 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-3xl font-bold text-white">${service.pricePerSession}</span>
                  <span className="text-gray-400 ml-2">/session</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Duration</p>
                  <p className="font-medium">{service.duration} min</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => onBookService?.(service)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-3 text-lg font-semibold"
                  disabled={!service.isAvailable}
                >
                  {service.isAvailable ? 'Begin Experience' : 'Currently Unavailable'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}