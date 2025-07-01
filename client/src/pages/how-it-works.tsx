import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { VideoFooter } from "@/components/video-footer";
import { Footer } from "@/components/footer";
import { CheckCircle, Users, Calendar, Ship, Phone, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const steps = [
  {
    number: "01",
    title: "Apply for Membership",
    description: "Complete our exclusive application process to join Miami Beach Yacht Club. Our team reviews each application to ensure the perfect fit.",
    icon: <Users className="w-8 h-8" />,
    color: "from-purple-600 to-purple-700"
  },
  {
    number: "02",
    title: "Select Your Tier",
    description: "Choose from Silver, Gold, or Diamond membership tiers. Each tier offers different yacht access and booking privileges.",
    icon: <Star className="w-8 h-8" />,
    color: "from-purple-700 to-indigo-600"
  },
  {
    number: "03",
    title: "Book Your Experience",
    description: "Use our exclusive booking portal or call our 24/7 concierge. Book up to 12 months in advance with no blackout dates.",
    icon: <Calendar className="w-8 h-8" />,
    color: "from-indigo-600 to-indigo-700"
  },
  {
    number: "04",
    title: "Enjoy Premium Service",
    description: "Arrive at the marina and let our professional crew handle everything. From catering to water sports, we've got you covered.",
    icon: <Ship className="w-8 h-8" />,
    color: "from-indigo-700 to-purple-600"
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Video Header */}
      <VideoHeader 
        title="How It Works"
        subtitle="Your journey to exclusive yacht experiences begins with four simple steps"
      />

      {/* Steps Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="space-y-32">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Step Number & Icon */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative"
                >
                  <div className={`w-64 h-64 rounded-full bg-gradient-to-br ${step.color} p-1`}>
                    <div className="w-full h-full bg-black rounded-full flex flex-col items-center justify-center">
                      <div className="text-6xl font-bold text-white mb-4">{step.number}</div>
                      <div className="p-4 rounded-full bg-white/10">
                        {step.icon}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connecting Line */}
                  {index < steps.length - 1 && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-px h-32 bg-gradient-to-b from-white/20 to-transparent" />
                  )}
                </motion.div>

                {/* Content */}
                <div className="flex-1 text-center lg:text-left">
                  <h2 className="text-4xl md:text-5xl font-bold text-white mb-6"
                    style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    {step.title}
                  </h2>
                  <p className="text-xl text-gray-400 mb-8 max-w-2xl">
                    {step.description}
                  </p>
                  
                  {/* Features for each step */}
                  <div className="space-y-3">
                    {index === 0 && (
                      <>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Quick online application</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Background verification</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Exclusive member benefits</span>
                        </div>
                      </>
                    )}
                    {index === 1 && (
                      <>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Silver: Up to 64ft yachts</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Gold: Up to 80ft yachts</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Diamond: Full fleet access</span>
                        </div>
                      </>
                    )}
                    {index === 2 && (
                      <>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Online booking portal</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">24/7 concierge line</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Instant confirmation</span>
                        </div>
                      </>
                    )}
                    {index === 3 && (
                      <>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Professional captain & crew</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Gourmet catering options</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-purple-500" />
                          <span className="text-gray-300">Water sports equipment</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* Video CTA */}
      <VideoCTA />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}