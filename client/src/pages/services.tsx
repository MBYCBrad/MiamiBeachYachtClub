import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { Footer } from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { useServicesWebSocket } from "@/hooks/use-services-websocket";
import { Calendar, Users, Wine, Camera, Music, Waves, Sparkles, Clock, Star, ChevronRight, Lock } from "lucide-react";

const serviceCategories = [
  {
    icon: Sparkles,
    title: "Beauty & Grooming",
    description: "Onboard hair styling, makeup, and spa treatments",
    services: ["Professional Hair Styling", "Makeup Artists", "Massage Therapy"],
    gradient: "from-pink-600 to-purple-600"
  },
  {
    icon: Wine,
    title: "Culinary Excellence",
    description: "Private chefs and gourmet catering services",
    services: ["Private Chef Services", "Wine Pairing", "Cocktail Mixology"],
    gradient: "from-orange-600 to-red-600"
  },
  {
    icon: Sparkles,
    title: "Wellness & Spa",
    description: "Rejuvenating treatments and wellness experiences",
    services: ["Yoga Sessions", "Meditation", "Wellness Coaching"],
    gradient: "from-green-600 to-teal-600"
  },
  {
    icon: Camera,
    title: "Photography & Media",
    description: "Capture your perfect yacht moments",
    services: ["Professional Photography", "Drone Videography", "Social Media Content"],
    gradient: "from-blue-600 to-indigo-600"
  },
  {
    icon: Music,
    title: "Entertainment",
    description: "Live music and exclusive performances",
    services: ["Live Musicians", "DJ Services", "Private Performances"],
    gradient: "from-purple-600 to-pink-600"
  },
  {
    icon: Waves,
    title: "Water Sports",
    description: "Expert instruction and equipment",
    services: ["Jet Ski Training", "Scuba Diving", "Water Skiing"],
    gradient: "from-cyan-600 to-blue-600"
  }
];

export default function ServicesPage() {
  // Initialize services WebSocket for real-time service updates
  useServicesWebSocket();
  
  const { data: services } = useQuery({
    queryKey: ['/api/services'],
  });

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <VideoHeader 
        title="Concierge Services"
        subtitle="Elevate Your Yacht Experience with Premium Services"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link href="/book-tour">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              Book a Service
            </Button>
          </Link>
          <Link href="/contact">
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300"
            >
              Contact Concierge
            </Button>
          </Link>
        </div>
      </VideoHeader>

      {/* Service Categories */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Premium Yacht Services
            </h2>
            <p className="text-xl text-gray-400">
              Curated experiences designed to perfect your time on the water
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${category.gradient} mb-6`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  {category.title}
                </h3>
                <p className="text-gray-400 mb-6">
                  {category.description}
                </p>

                {/* Service List */}
                <ul className="space-y-2 mb-6">
                  {category.services.map((service) => (
                    <li key={service} className="flex items-center text-gray-300">
                      <ChevronRight className="w-4 h-4 mr-2 text-purple-400" />
                      {service}
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm"
                >
                  Explore Services
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Most Popular Services
            </h2>
            <p className="text-xl text-gray-400">
              Trusted by our members for exceptional experiences
            </p>
          </motion.div>

          {services && services.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(services as any[]).slice(0, 6).map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-gray-900 rounded-3xl overflow-hidden hover:scale-105 transition-transform duration-300 group"
                >
                  {/* Service Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={service.imageUrl} 
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    
                    {/* Hover Overlay with Lock */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-indigo-600/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Lock className="w-12 h-12 text-white" />
                    </div>
                    
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full z-10">
                      <span className="text-white text-sm font-semibold">${service.pricePerHour}/hr</span>
                    </div>
                  </div>

                  {/* Service Details */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{service.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 text-yellow-400 mr-1" />
                        <span className="text-white">4.9</span>
                        <span className="text-gray-400 ml-2">(127)</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">4 hours min</span>
                      </div>
                    </div>

                    <Link href="/apply">
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                        Apply for Membership
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 
              className="text-4xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              How It Works
            </h2>
            <p className="text-xl text-gray-400">
              Booking premium services is simple and seamless
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                step: "01",
                title: "Choose Your Service",
                description: "Browse our curated selection of premium yacht services"
              },
              {
                step: "02",
                title: "Select Date & Time",
                description: "Pick a convenient time that works with your yacht booking"
              },
              {
                step: "03",
                title: "Confirm Booking",
                description: "Review details and complete your service reservation"
              },
              {
                step: "04",
                title: "Enjoy Your Experience",
                description: "Our professionals arrive on time to deliver exceptional service"
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center space-x-6"
              >
                <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Service Providers" },
              { value: "98%", label: "Satisfaction Rate" },
              { value: "24/7", label: "Concierge Support" },
              { value: "50+", label: "Service Categories" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <VideoCTA />
      <Footer />
    </div>
  );
}