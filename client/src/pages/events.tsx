import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { Footer } from "@/components/footer";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Sparkles, MapPin, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ApplicationModal } from "@/components/application-modal";

export default function EventsPage() {
  const { data: events } = useQuery({
    queryKey: ['/api/events'],
  });

  const upcomingEvents = events || [];
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <VideoHeader 
        title="Exclusive Events" 
        subtitle="Join our vibrant community of yacht enthusiasts"
      />

      {/* Events Grid */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Upcoming Events</h2>
            <p className="text-xl text-gray-400">Experience the finest yacht events in Miami</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event: any, index: number) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all">
                  <div className="relative h-64 overflow-hidden group">
                    <img 
                      src={event.imageUrl || '/api/media/pexels-goumbik-296278_1750537277229.jpg'}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    
                    {/* Lock Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                      <Lock className="w-16 h-16 text-white" />
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      ${event.ticketPrice}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{event.title}</h3>
                    <p className="text-gray-400 mb-4">{event.description}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span>
                          {event.eventDate 
                            ? new Date(event.eventDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            : event.startTime 
                              ? new Date(event.startTime).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })
                              : 'Date TBD'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span>{event.location || 'Location TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-300">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span>{(event.capacity - (event.bookedCount || 0)) || event.capacity || 'TBD'} spots available</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setIsApplicationModalOpen(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                    >
                      Register Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Private Events Footer Section */}
      <section className="relative min-h-[68vh] flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/api/media/video/MBYC_UPDATED_1751023212560.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/70" />
        
        {/* 3D Anamorphic Edges */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Edge - Enhanced blur to blend into black background */}
          <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-black via-black/80 to-transparent" />
          
          {/* Bottom Edge - Deeper for mobile */}
          <div className="absolute bottom-0 left-0 right-0 h-20 md:h-24 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Left Edge - Narrower */}
          <div className="absolute top-0 left-0 bottom-0 w-8 md:w-12 bg-gradient-to-r from-black/40 to-transparent" />
          
          {/* Right Edge - Narrower */}
          <div className="absolute top-0 right-0 bottom-0 w-8 md:w-12 bg-gradient-to-l from-black/40 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-8" />
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Private Events
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-gray-300 mb-10"
            >
              Host your next corporate event, wedding, or celebration aboard one of our luxury yachts. 
              Our event planning team will ensure every detail is perfect.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsApplicationModalOpen(true)}
                className="px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-lg rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all shadow-2xl"
              >
                Apply for Membership
              </motion.button>
              <Link href="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-transparent border-2 border-white text-white font-bold text-lg rounded-full hover:bg-white/10 transition-all"
                >
                  Plan Your Event
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
      
      <AnimatePresence>
        <ApplicationModal 
          isOpen={isApplicationModalOpen}
          onClose={() => setIsApplicationModalOpen(false)}
        />
      </AnimatePresence>
    </div>
  );
}