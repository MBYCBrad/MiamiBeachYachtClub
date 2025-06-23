import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Heart, 
  Star, 
  MapPin, 
  Users, 
  Waves,
  Calendar,
  Filter,
  Trash2,
  Share,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import YachtCard from '@/components/yacht-card';
import type { Yacht, Service, Event as EventType, MediaAsset, Favorite } from '@shared/schema';

const YACHT_IMAGES = [
  "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800&h=600&fit=crop"
];

const SERVICE_IMAGES = [
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1567327286077-e5de925ca8b7?w=800&h=600&fit=crop"
];

interface MemberFavoritesProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function MemberFavorites({ currentView, setCurrentView }: MemberFavoritesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: heroVideo } = useQuery<MediaAsset>({
    queryKey: ['/api/media/hero/active']
  });

  const { data: yachts = [], isLoading: yachtsLoading } = useQuery<Yacht[]>({
    queryKey: ['/api/yachts']
  });

  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['/api/services']
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<EventType[]>({
    queryKey: ['/api/events']
  });

  // Real-time favorites data from database
  const { data: userFavorites = [], isLoading: favoritesLoading } = useQuery<Favorite[]>({
    queryKey: ['/api/favorites']
  });

  // Extract favorite items based on database favorites
  const favoriteYachtIds = userFavorites.filter(f => f.yachtId).map(f => f.yachtId);
  const favoriteServiceIds = userFavorites.filter(f => f.serviceId).map(f => f.serviceId);
  const favoriteEventIds = userFavorites.filter(f => f.eventId).map(f => f.eventId);

  const favoriteYachts = yachts.filter(yacht => favoriteYachtIds.includes(yacht.id));
  const favoriteServices = services.filter(service => favoriteServiceIds.includes(service.id));
  const favoriteEvents = events.filter(event => favoriteEventIds.includes(event.id));

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async ({ yachtId, serviceId, eventId }: { yachtId?: number; serviceId?: number; eventId?: number }) => {
      const response = await apiRequest('POST', '/api/favorites', { yachtId, serviceId, eventId });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Added to Favorites",
        description: "Item has been added to your favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to favorites",
        variant: "destructive",
      });
    }
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async ({ yachtId, serviceId, eventId }: { yachtId?: number; serviceId?: number; eventId?: number }) => {
      const params = new URLSearchParams();
      if (yachtId) params.append('yachtId', yachtId.toString());
      if (serviceId) params.append('serviceId', serviceId.toString());
      if (eventId) params.append('eventId', eventId.toString());
      
      const response = await apiRequest('DELETE', `/api/favorites?${params.toString()}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from Favorites",
        description: "Item has been removed from your favorites",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from favorites",
        variant: "destructive",
      });
    }
  });

  const toggleFavorite = (type: 'yacht' | 'service' | 'event', id: number) => {
    const isCurrentlyFavorite = 
      (type === 'yacht' && favoriteYachtIds.includes(id)) ||
      (type === 'service' && favoriteServiceIds.includes(id)) ||
      (type === 'event' && favoriteEventIds.includes(id));

    if (isCurrentlyFavorite) {
      removeFavoriteMutation.mutate({
        yachtId: type === 'yacht' ? id : undefined,
        serviceId: type === 'service' ? id : undefined,
        eventId: type === 'event' ? id : undefined
      });
    } else {
      addFavoriteMutation.mutate({
        yachtId: type === 'yacht' ? id : undefined,
        serviceId: type === 'service' ? id : undefined,
        eventId: type === 'event' ? id : undefined
      });
    }
  };

  const filteredYachts = favoriteYachts.filter(yacht =>
    yacht.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    yacht.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredServices = favoriteServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEvents = favoriteEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allFavorites = [
    ...filteredYachts.map(item => ({ ...item, type: 'yacht' })),
    ...filteredServices.map(item => ({ ...item, type: 'service' })),
    ...filteredEvents.map(item => ({ ...item, type: 'event' }))
  ];

  const handleRemoveFavorite = (type: string, id: number) => {
    toggleFavorite(type as 'yacht' | 'service' | 'event', id);
  };

  const renderYachtCard = (yacht: Yacht, index: number) => (
    <YachtCard key={yacht.id} yacht={yacht} index={index} />
  );

  const renderServiceCard = (service: Service, index: number) => (
    <motion.div
      key={service.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-gray-900/50 border-gray-800 hover-lift overflow-hidden">
        <div className="relative h-40">
          <img
            src={SERVICE_IMAGES[index % SERVICE_IMAGES.length]}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3">
            <Badge className="bg-blue-600/80 text-white border-0">
              {service.category}
            </Badge>
          </div>
          <Button
            onClick={() => handleRemoveFavorite('service', service.id)}
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full p-2"
          >
            <Heart size={18} className="fill-current" />
          </Button>
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-bold text-white mb-2">{service.name}</h3>
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {service.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-white">
              ${service.pricePerSession ? parseFloat(service.pricePerSession).toLocaleString() : 'Contact'}
            </span>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 rounded-xl"
            >
              Book
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderEventCard = (event: EventType, index: number) => (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-gray-900/50 border-gray-800 hover-lift overflow-hidden">
        <div className="relative h-40 bg-gradient-to-br from-purple-900/30 to-pink-900/30">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3">
            <Badge className="bg-purple-600/80 text-white border-0">
              <Calendar size={12} className="mr-1" />
              {new Date(event.startTime).toLocaleDateString()}
            </Badge>
          </div>
          <Button
            onClick={() => handleRemoveFavorite('event', event.id)}
            size="sm"
            variant="ghost"
            className="absolute top-3 right-3 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-full p-2"
          >
            <Heart size={18} className="fill-current" />
          </Button>
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-bold text-white mb-2">{event.title}</h3>
          <div className="flex items-center text-gray-400 text-sm mb-3">
            <MapPin size={14} className="mr-1" />
            <span>{event.location}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-white">
              ${event.ticketPrice ? parseFloat(event.ticketPrice).toLocaleString() : 'Free'}
            </span>
            <Button
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 rounded-xl"
            >
              Register
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Video Cover Header */}
      <div className="relative h-96 overflow-hidden">
        {/* Hero Video Background */}
        {heroVideo && (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideo.url} type="video/mp4" />
          </video>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/90" />

        {/* Header Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-gradient-animate mb-4"
          >
            Your Favorites
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-200 max-w-2xl leading-relaxed"
          >
            Curated collection of your saved yachts, services, and experiences
          </motion.p>
          
          {/* Stats overlay */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-8 flex space-x-6 text-center"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{favoriteYachts.length}</div>
              <div className="text-sm text-gray-300">Yachts</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{favoriteServices.length}</div>
              <div className="text-sm text-gray-300">Services</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-2xl font-bold text-white">{favoriteEvents.length}</div>
              <div className="text-sm text-gray-300">Events</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search your favorites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 py-3 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 rounded-xl focus:bg-gray-800 focus:border-purple-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 rounded-xl mb-6">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              All ({allFavorites.length})
            </TabsTrigger>
            <TabsTrigger 
              value="yachts" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              Yachts ({filteredYachts.length})
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              Services ({filteredServices.length})
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              Events ({filteredEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {allFavorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No favorites yet</h3>
                <p className="text-gray-500 mb-6">Start exploring and save items you love</p>
                <Button
                  onClick={() => setCurrentView('explore')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 rounded-xl px-8"
                >
                  Start Exploring
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredYachts.map((yacht, index) => renderYachtCard(yacht, index))}
                {filteredServices.map((service, index) => renderServiceCard(service, index))}
                {filteredEvents.map((event, index) => renderEventCard(event, index))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="yachts">
            {filteredYachts.length === 0 ? (
              <div className="text-center py-12">
                <Waves size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No favorite yachts</h3>
                <p className="text-gray-500">Save yachts you'd love to charter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredYachts.map((yacht, index) => renderYachtCard(yacht, index))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="services">
            {filteredServices.length === 0 ? (
              <div className="text-center py-12">
                <Star size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No favorite services</h3>
                <p className="text-gray-500">Save services you'd like to book</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service, index) => renderServiceCard(service, index))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-400 mb-2">No favorite events</h3>
                <p className="text-gray-500">Save events you're interested in</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEvents.map((event, index) => renderEventCard(event, index))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}