import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { Anchor, DollarSign, Shield, Users, Settings, TrendingUp, Ship, ChevronDown, Star, Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useState } from "react";

export default function PartnerPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const partnerTypes = [
    {
      id: "yacht",
      title: "Become A Yacht Partner",
      subtitle: "Join the fleet showing star images instead of the yachts",
      icon: Ship,
      description: "Partner with MBYC by adding your luxury yacht to our exclusive fleet. Earn passive income while we handle everything from maintenance to member experiences.",
      benefits: [
        "Earn Passive Income - Receive stable monthly lease payments",
        "Unlock Elite Membership - Access our entire yacht collection",
        "No Hassle Ownership - We handle crew, maintenance, and logistics",
        "Be Part of the Expansion - Join our growing luxury yacht network"
      ],
      testimonials: [
        {
          name: "Marcus Richardson",
          role: "Investor & Fleet Partner",
          content: "MBYC transformed my yacht from a seasonal expense into a year-round income stream. The professional management is exceptional.",
          avatar: "⭐"
        },
        {
          name: "Sarah Wellington",
          role: "Investment Portfolio Manager",
          content: "The returns have exceeded expectations while maintaining the pristine condition of our vessel. A brilliant partnership model.",
          avatar: "⭐"
        }
      ],
      cta: "Apply as Yacht Partner"
    },
    {
      id: "service",
      title: "Become A Service Provider Partner",
      subtitle: "Full page similar to yacht owner page with application form",
      icon: Users,
      description: "Join our network of premium service providers offering luxury yacht experiences to MBYC members across beauty, culinary, wellness, and lifestyle services.",
      benefits: [
        "Access Elite Clientele - Serve MBYC's exclusive membership base",
        "Guaranteed Bookings - Steady stream of high-value clients",
        "Professional Support - Marketing and booking management included",
        "Premium Rates - Command top-tier pricing for your services"
      ],
      testimonials: [
        {
          name: "Chef Alexandre Dubois",
          role: "Service Provider Partner",
          content: "MBYC connects me with discerning clients who appreciate culinary excellence. The partnership has elevated my business significantly.",
          avatar: "⭐"
        },
        {
          name: "Isabella Martinez",
          role: "Wellness Provider",
          content: "The quality of clients and consistent bookings through MBYC have made this partnership incredibly rewarding for my spa services.",
          avatar: "⭐"
        }
      ],
      cta: "Apply as Service Provider"
    },
    {
      id: "event",
      title: "Become An Event Provider Partner",
      subtitle: "Application form to become an event provider",
      icon: Calendar,
      description: "Partner with MBYC to create and host exclusive yacht club events, from intimate member gatherings to luxury celebrations and corporate experiences.",
      benefits: [
        "Premium Event Platform - Host exclusive yacht club experiences",
        "High-Value Events - Access to luxury event budgets and requirements",
        "Marketing Support - MBYC promotion and member outreach included",
        "Repeat Business - Build relationships with returning members"
      ],
      testimonials: [
        {
          name: "Victoria Sterling",
          role: "Event Partner",
          content: "Creating events for MBYC members is a privilege. The sophistication and appreciation of our clients makes every event memorable.",
          avatar: "⭐"
        },
        {
          name: "David Chen",
          role: "Corporate Events",
          content: "MBYC partnerships have opened doors to the most exclusive corporate events. The member network is unparalleled.",
          avatar: "⭐"
        }
      ],
      cta: "Apply as Event Provider"
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <VideoHeader 
        title="Partner" 
        subtitle="Join Miami Beach Yacht Club's exclusive partner network"
      />

      {/* Hero Content */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Partner with Miami Beach Yacht Club
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join our elite network of partners and be part of the world's most exclusive yacht club experience.
            </p>
            <p className="text-lg text-gray-400">
              Choose your partnership path and unlock premium opportunities with MBYC's growing luxury ecosystem.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Partnership Options */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">Choose Your Partnership</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Three distinct paths to join Miami Beach Yacht Club's exclusive partner network
            </p>
          </motion.div>

          <div className="space-y-8">
            {partnerTypes.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
              >
                {/* Header */}
                <div 
                  className="p-8 cursor-pointer hover:bg-gray-800/30 transition-all"
                  onClick={() => toggleSection(partner.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                        <partner.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{partner.title}</h3>
                        <p className="text-gray-400">{partner.subtitle}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedSection === partner.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    </motion.div>
                  </div>
                </div>

                {/* Expanded Content */}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: expandedSection === partner.id ? "auto" : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-8 pb-8 border-t border-white/10">
                    <div className="grid lg:grid-cols-2 gap-12 pt-8">
                      {/* Left Column - Description & Benefits */}
                      <div>
                        <p className="text-lg text-gray-300 mb-8">{partner.description}</p>
                        
                        <h4 className="text-xl font-bold text-white mb-4">Partnership Benefits</h4>
                        <ul className="space-y-3">
                          {partner.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start space-x-3">
                              <Star className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300">{benefit}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-8">
                          <Link href={`/partner/${partner.id}`}>
                            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl transform hover:scale-105 transition-all">
                              {partner.cta}
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Right Column - Testimonials */}
                      <div>
                        <h4 className="text-xl font-bold text-white mb-6">Partner Testimonials</h4>
                        <div className="space-y-6">
                          {partner.testimonials.map((testimonial, idx) => (
                            <div key={idx} className="bg-black/30 rounded-xl p-6 border border-white/5">
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-2xl">
                                  {testimonial.avatar}
                                </div>
                                <div className="flex-1">
                                  <p className="text-gray-300 mb-3 italic">"{testimonial.content}"</p>
                                  <div>
                                    <p className="font-semibold text-white">{testimonial.name}</p>
                                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video CTA */}
      <VideoCTA 
        title="Ready to Become a Partner?"
        subtitle="Join Miami Beach Yacht Club's exclusive partner network and unlock premium opportunities."
        buttonText="Apply Now"
        buttonLink="/partner/yacht"
        showStats={false}
      />

      <Footer />
    </div>
  );
}