import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Star, Clock, Users, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ApplicationModal } from "@/components/application-modal";

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
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

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
                <div className="bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 border border-white/10 relative">
                  {/* Hover Overlay with Lock Icon */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/20 backdrop-blur-md rounded-full p-4"
                    >
                      <Lock className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>

                  {/* Service Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={service.imageUrl || '/api/placeholder/400/300'}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                        {service.category}
                      </Badge>
                    </div>

                    {/* Rating */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
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
                      onClick={() => setIsApplicationModalOpen(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white relative z-20"
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
      <section className="py-32 bg-white/5">
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
        onApplyClick={() => setIsApplicationModalOpen(true)}
        secondaryButtonText="Contact Our Concierge"
        secondaryButtonLink="/contact"
      />

      <Footer />

      {/* Application Modal */}
      <AnimatePresence>
        {isApplicationModalOpen && (
          <ApplicationModal
            isOpen={isApplicationModalOpen}
            onClose={() => setIsApplicationModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}