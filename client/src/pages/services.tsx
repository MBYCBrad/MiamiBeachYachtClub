import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Clock, Users, Check, Lock, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import ServiceBookingModal from "@/components/service-booking-modal-4step";

const serviceCategories = [
  { id: "all", name: "All Services", icon: Sparkles },
  { id: "Beauty & Grooming", name: "Beauty & Grooming", icon: Sparkles },
  { id: "Culinary", name: "Culinary", icon: Sparkles },
  { id: "Wellness & Spa", name: "Wellness & Spa", icon: Sparkles },
  { id: "Photography & Media", name: "Photography & Media", icon: Sparkles },
  { id: "Entertainment", name: "Entertainment", icon: Sparkles },
  { id: "Water Sports", name: "Water Sports", icon: Sparkles },
  { id: "Concierge & Lifestyle", name: "Concierge & Lifestyle", icon: Sparkles },
];

export default function ServicesPage() {
  const { data: services } = useQuery({
    queryKey: ['/api/services', { available: true }],
  });

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isServiceBookingModalOpen, setIsServiceBookingModalOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user favorites
  const { data: userFavorites = [] } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: !!user
  });

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      console.log('Adding favorite for serviceId:', serviceId);
      const response = await apiRequest('POST', '/api/favorites', { serviceId });
      const result = await response.json();
      console.log('Add favorite response:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Added to Favorites",
        description: "Service has been added to your favorites",
      });
    },
    onError: (error) => {
      console.error('Add favorite error:', error);
      toast({
        title: "Error",
        description: "Failed to add service to favorites",
        variant: "destructive",
      });
    }
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      console.log('Removing favorite for serviceId:', serviceId);
      const response = await apiRequest('DELETE', `/api/favorites?serviceId=${serviceId}`);
      const result = await response.json();
      console.log('Remove favorite response:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Removed from Favorites",
        description: "Service has been removed from your favorites",
      });
    },
    onError: (error) => {
      console.error('Remove favorite error:', error);
      toast({
        title: "Error",
        description: "Failed to remove service from favorites",
        variant: "destructive",
      });
    }
  });

  // Service booking mutation
  const serviceBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/service-bookings', bookingData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bookings'] });
      toast({
        title: "Service Booked Successfully!",
        description: "Your service booking has been confirmed.",
      });
      setSelectedService(null);
      setIsServiceBookingModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Failed to book service. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleBookService = (service: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to book services",
        variant: "destructive",
      });
      return;
    }
    setSelectedService(service);
    setIsServiceBookingModalOpen(true);
  };

  const handleServiceBookingConfirm = (bookingData: any) => {
    serviceBookingMutation.mutate(bookingData);
  };

  const toggleFavorite = (e: React.MouseEvent, serviceId: number) => {
    e.stopPropagation();
    console.log('Service heart clicked:', serviceId, user);
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to save favorites",
        variant: "destructive",
      });
      return;
    }

    const isFavorite = userFavorites.some((fav: any) => fav.serviceId === serviceId);
    console.log('Service is favorite?', isFavorite);
    
    if (isFavorite) {
      removeFavoriteMutation.mutate(serviceId);
    } else {
      addFavoriteMutation.mutate(serviceId);
    }
  };

  const filteredServices = services?.filter((service: any) => {
    if (selectedCategory === "all") return true;
    return service.category === selectedCategory;
  }) || [];

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <VideoHeader 
        title="Concierge Services" 
        subtitle="Elevate your yacht experience with premium services"
      />

      {/* Service Categories */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            {serviceCategories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "bg-white/10 text-gray-300 hover:bg-white/20"
                }`}
              >
                <category.icon className="w-4 h-4 inline mr-2" />
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {selectedCategory === "all" ? "All Services" : selectedCategory}
            </h2>
            <p className="text-xl text-gray-400">
              Professional services to enhance your yacht experience
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service: any, index: number) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 border border-white/10 relative">
                  {/* Heart Button - Positioned absolutely to the card, not the image container */}
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Service heart button clicked - TEST', service.id);
                      toggleFavorite(e, service.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full backdrop-blur-sm shadow-lg z-50"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart 
                      size={16}
                      className={`transition-colors ${
                        userFavorites.some((fav: any) => fav.serviceId === service.id)
                          ? 'text-red-500 fill-current' 
                          : 'text-gray-600 hover:text-red-400'
                      }`} 
                    />
                  </motion.button>
                  
                  {/* Service Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.imageUrl || '/api/placeholder/400/300'}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <Badge className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                        {service.category}
                      </Badge>
                    </div>

                    {/* Rating */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-white text-sm">
                        {service.rating || 4.8}
                      </span>
                    </div>
                  </div>

                  {/* Service Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {service.name}
                    </h3>
                    
                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {service.description}
                    </p>

                    {/* Service Details */}
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration || 60} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>Up to {service.maxParticipants || 8}</span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-white">
                          ${service.pricePerSession}
                        </span>
                        <span className="text-gray-400 ml-1">per session</span>
                      </div>
                    </div>

                    {/* Book Now Button */}
                    <Button
                      onClick={() => handleBookService(service)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white relative z-20 px-6 py-2"
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredServices.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <Sparkles className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Services Found</h3>
              <p className="text-gray-400">
                No services available in this category at the moment.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Membership Benefits Section */}
      <section className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
              Membership Benefits
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-gray-400 max-w-3xl mx-auto"
            >
              Unlock exclusive access to premium yacht concierge services
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "Premium Service Access",
                description: "Exclusive access to all yacht concierge services with priority booking"
              },
              {
                icon: Users,
                title: "Personalized Experience",
                description: "Tailored service recommendations based on your preferences and yacht itinerary"
              },
              {
                icon: Check,
                title: "Quality Guarantee",
                description: "All service providers are vetted professionals with 5-star ratings"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <VideoCTA 
        title="Ready to Elevate Your Yacht Experience?"
        description="Become a member and unlock access to our exclusive concierge services. From personal chefs to water sports instructors, we'll make every moment on the water extraordinary."
        onApplyClick={() => window.location.href = '/auth'}
        secondaryButtonText="Contact Our Concierge"
        secondaryButtonLink="/contact"
      />

      <Footer />

      {/* Service Booking Modal */}
      <ServiceBookingModal
        service={selectedService}
        isOpen={isServiceBookingModalOpen}
        onClose={() => {
          setIsServiceBookingModalOpen(false);
          setSelectedService(null);
        }}
        onConfirm={handleServiceBookingConfirm}
      />
    </div>
  );
}