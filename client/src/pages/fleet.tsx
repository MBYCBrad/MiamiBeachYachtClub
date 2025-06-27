import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { Anchor, Users, Gauge, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function FleetPage() {
  const { data: yachts } = useQuery({
    queryKey: ['/api/yachts'],
  });

  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "all", name: "All Yachts" },
    { id: "sport", name: "Sport Yachts" },
    { id: "luxury", name: "Luxury Cruisers" },
    { id: "mega", name: "Mega Yachts" },
  ];

  const filteredYachts = yachts?.filter((yacht: any) => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "sport") return yacht.length <= 50;
    if (selectedCategory === "luxury") return yacht.length > 50 && yacht.length <= 70;
    if (selectedCategory === "mega") return yacht.length > 70;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <VideoHeader 
        title="Our Fleet" 
        subtitle="Discover luxury yachts for every occasion"
      />

      {/* Fleet Categories */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                    : 'bg-gray-900/50 text-gray-400 hover:text-white border border-white/10'
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet Grid */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {filteredYachts.length} Yachts Available
            </h2>
            <p className="text-xl text-gray-400">Each yacht is meticulously maintained to the highest standards</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredYachts.map((yacht: any, index: number) => (
              <motion.div
                key={yacht.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all">
                  <div className="relative h-64 overflow-hidden group">
                    <img 
                      src={yacht.images?.[0] || '/api/media/pexels-mali-42091_1750537294323.jpg'}
                      alt={yacht.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    
                    {/* Lock Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                      <Lock className="w-16 h-16 text-white" />
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {yacht.type}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{yacht.name}</h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500">Length</p>
                        <p className="text-white font-semibold">{yacht.length}ft</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Guests</p>
                        <p className="text-white font-semibold">{yacht.capacity}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Crew</p>
                        <p className="text-white font-semibold">{yacht.crewRequired || 2}</p>
                      </div>
                    </div>

                    <p className="text-gray-400 mb-4">{yacht.description}</p>

                    {/* Amenities */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {yacht.amenities?.slice(0, 3).map((amenity: string) => (
                          <span 
                            key={amenity}
                            className="text-xs px-2 py-1 bg-purple-900/30 text-purple-300 rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                        {yacht.amenities?.length > 3 && (
                          <span className="text-xs px-2 py-1 text-gray-400">
                            +{yacht.amenities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Link href={`/fleet/${yacht.id}`}>
                        <Button 
                          variant="outline" 
                          className="w-full border-white/20 text-white hover:bg-white/10"
                        >
                          View Details
                        </Button>
                      </Link>
                      <Link href="/auth">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-32"
          >
            <div className="text-center mb-16">
              <Anchor className="w-16 h-16 text-purple-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose Our Fleet</h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Every yacht in our fleet is selected for its exceptional quality, performance, and luxury amenities.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl p-8 border border-purple-500/20">
                <Users className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Professional Crew</h3>
                <p className="text-gray-400">Every yacht comes with experienced captains and crew members dedicated to your safety and comfort.</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl p-8 border border-purple-500/20">
                <Gauge className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Peak Performance</h3>
                <p className="text-gray-400">Regular maintenance and inspections ensure every yacht performs at its best on every voyage.</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl p-8 border border-purple-500/20">
                <Check className="w-12 h-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Fully Insured</h3>
                <p className="text-gray-400">Comprehensive insurance coverage gives you complete peace of mind during your yacht experience.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}