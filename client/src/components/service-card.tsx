import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Heart } from "lucide-react";
import type { Service, Favorite } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user favorites
  const { data: userFavorites = [] } = useQuery<Favorite[]>({
    queryKey: ['/api/favorites'],
    enabled: !!user
  });

  // Check if this service is favorited
  const isFavorite = userFavorites.some(fav => fav.serviceId === service.id);

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/favorites', { serviceId: service.id });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Added to Favorites",
        description: `${service.name} has been added to your favorites`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add service to favorites",
        variant: "destructive",
      });
    }
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', `/api/favorites?serviceId=${service.id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from Favorites",
        description: `${service.name} has been removed from your favorites`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove service from favorites",
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

  return (
    <div className="group bg-black backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/30 hover:border-purple-600/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-600/20 transform hover:scale-105">
      <div className="relative overflow-hidden">
        <img 
          src={service.imageUrl || 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300'} 
          alt={service.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <button 
          onClick={toggleFavorite}
          className={`absolute top-3 right-3 w-8 h-8 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
            isFavorite 
              ? 'bg-red-500/80 hover:bg-red-600/80' 
              : 'bg-black/50 hover:bg-purple-600/80'
          }`}
        >
          <Heart className={`w-4 h-4 transition-all duration-300 ${
            isFavorite 
              ? 'text-white fill-white' 
              : 'text-white'
          }`} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full flex items-center justify-center border-2 border-purple-600/30">
            <i className="fas fa-user text-purple-400"></i>
          </div>
          <div>
            <h4 className="font-semibold text-white">{service.name}</h4>
            <p className="text-sm text-gray-400 capitalize">{service.category} Specialist</p>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <i className="fas fa-star text-yellow-400 text-sm"></i>
            <span className="text-sm text-gray-400">{service.rating || '5.0'}</span>
            <span className="text-sm text-gray-500">• {service.reviewCount} reviews</span>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{service.description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-white">${service.pricePerSession}</span>
            <span className="text-sm text-gray-400">/ session</span>
          </div>
          <Button 
            onClick={() => setLocation(`/services/${service.id}`)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-600/30 transition-all duration-300">
            Book Now
          </Button>
        </div>
        {service.duration && (
          <div className="mt-3 pt-3 border-t border-gray-700/30">
            <p className="text-xs text-gray-500">Duration: {service.duration} minutes</p>
          </div>
        )}
      </div>
    </div>
  );
}
