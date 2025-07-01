import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { VideoFooter } from "@/components/video-footer";
import { Footer } from "@/components/footer";
import { Users, Calendar, Ship, Star } from "lucide-react";

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
    description: "Choose from Bronze Explorer, Silver Navigator, Gold Admiral, or Platinum Captain membership tiers. Each tier offers different yacht access and booking privileges.",
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
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <VideoHeader
        title="How It Works"
        subtitle="Discover the simple 4-step process to begin your luxury yachting journey with Miami Beach Yacht Club."
      />

      {/* Process Steps Section */}
      <section className="py-32 bg-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-16">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12 lg:gap-20`}
              >
                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-xl`}>
                      {step.number}
                    </div>
                    <div className={`p-4 rounded-full bg-gradient-to-r ${step.color}`}>
                      {step.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-4xl md:text-5xl font-bold text-white mb-4"
                    style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    {step.title}
                  </h3>
                  
                  <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
                    {step.description}
                  </p>
                </div>

                {/* Visual Element */}
                <div className="flex-1">
                  <div className={`relative w-full h-80 rounded-2xl bg-gradient-to-r ${step.color} p-1`}>
                    <div className="w-full h-full bg-black rounded-xl flex items-center justify-center">
                      <div className={`p-8 rounded-full bg-gradient-to-r ${step.color}`}>
                        <div className="w-16 h-16 text-white flex items-center justify-center">
                          {step.icon}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Ready to Begin?
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Join Miami Beach Yacht Club today and experience the ultimate in luxury yachting. Our exclusive membership opens doors to unlimited adventures on the water.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl"
                >
                  APPLY FOR MEMBERSHIP
                </Button>
              </Link>
              
              <Link href="/book-tour">
                <Button 
                  variant="outline"
                  size="lg" 
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300"
                >
                  BOOK A PRIVATE TOUR
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <VideoCTA />
      <VideoFooter />
      <Footer />
    </div>
  );
}