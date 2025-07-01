import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { Footer } from "@/components/footer";
import { Check, Crown, Sparkles, Anchor, Star } from "lucide-react";

const membershipTiers = [
  {
    name: "Silver",
    icon: <Star className="w-8 h-8" />,
    yachtAccess: "Up to 64ft yachts",
    bookings: "2-4 concurrent bookings",
    weekdayBookings: "1-2 weekdays",
    weekendBookings: "1-2 weekends",
    color: "from-purple-600 to-indigo-600",
    features: [
      "Access to entry-level luxury yachts",
      "Professional captain & crew",
      "Fuel & maintenance included",
      "Basic concierge services",
      "Member events access"
    ]
  },
  {
    name: "Gold",
    icon: <Crown className="w-8 h-8" />,
    yachtAccess: "Up to 74ft yachts",
    bookings: "4 concurrent bookings",
    weekdayBookings: "2 weekdays",
    weekendBookings: "2 weekends",
    color: "from-purple-600 to-indigo-600",
    popular: true,
    features: [
      "Access to mid-tier luxury yachts",
      "Priority booking over Silver",
      "Premium concierge services",
      "Gourmet catering options",
      "VIP event invitations",
      "Guest passes (2 per month)"
    ]
  },
  {
    name: "Platinum",
    icon: <Sparkles className="w-8 h-8" />,
    yachtAccess: "Up to 84ft yachts",
    bookings: "6-8 concurrent bookings",
    weekdayBookings: "2-3 weekdays",
    weekendBookings: "3-4 weekends",
    color: "from-purple-600 to-indigo-600",
    features: [
      "Access to premium yacht fleet",
      "Highest booking priority",
      "24/7 dedicated concierge",
      "Luxury car transfers",
      "Private chef services",
      "Unlimited guest passes",
      "Custom itinerary planning"
    ]
  },
  {
    name: "Diamond",
    icon: <Anchor className="w-8 h-8" />,
    yachtAccess: "Up to 100ft yachts",
    bookings: "6-12 concurrent bookings",
    weekdayBookings: "3 weekdays",
    weekendBookings: "3-6 weekends",
    color: "from-purple-600 to-indigo-600",
    features: [
      "Full fleet access including flagship",
      "2 trips on 95ft flagship yacht",
      "Ultimate booking flexibility",
      "Private jet coordination",
      "Exclusive Diamond events",
      "Caribbean & Europe access",
      "Personal yacht consultant",
      "Complimentary crew gratuity"
    ]
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Video Header */}
      <VideoHeader 
        title="Plans & Pricing"
        subtitle="Choose the perfect membership tier for your yachting lifestyle"
      />
      


      {/* Premium Membership Callout */}
      <section className="py-12 relative">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Full Membership
            </h2>
            <p className="text-xl text-gray-300 mb-6">
              Limited to 55 exclusive members
            </p>
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-8">
              <div>
                <p className="text-gray-400 mb-2">Initiation Fee</p>
                <p className="text-4xl font-bold text-white">$25,000</p>
                <p className="text-sm text-gray-400">One-time</p>
              </div>
              <div className="text-3xl text-purple-400">+</div>
              <div>
                <p className="text-gray-400 mb-2">Monthly Fee</p>
                <p className="text-4xl font-bold text-white">$10,000</p>
                <p className="text-sm text-gray-400">Per month</p>
              </div>
            </div>
            <Link href="/apply">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-full"
              >
                Apply for Full Membership
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Membership Tiers
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {membershipTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative group ${tier.popular ? 'transform scale-105' : ''}`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold z-20">
                    Most Popular
                  </div>
                )}
                
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 hover:border-white/20 transition-all duration-300 h-full">
                  {/* Tier Header */}
                  <div className="text-center mb-8">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                      {tier.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">{tier.name}</h3>
                    <p className="text-purple-400 font-semibold">{tier.yachtAccess}</p>
                  </div>

                  {/* Booking Info */}
                  <div className="bg-black/30 rounded-xl p-4 mb-6">
                    <p className="text-gray-400 text-sm mb-2">Concurrent Bookings</p>
                    <p className="text-white font-semibold text-lg mb-3">{tier.bookings}</p>
                    <div className="flex justify-between text-sm">
                      <div>
                        <p className="text-gray-400">Weekdays</p>
                        <p className="text-white">{tier.weekdayBookings}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Weekends</p>
                        <p className="text-white">{tier.weekendBookings}</p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href="/apply">
                    <Button 
                      className={`w-full bg-gradient-to-r ${tier.color} hover:opacity-90 text-white`}
                    >
                      Select {tier.name}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Flexible Membership Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-indigo-900/10" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Mariner's Membership
            </h2>
            <p className="text-xl text-gray-300">
              Flexible month-to-month options for seasonal residents
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">How It Works</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Monthly fee of selected tier + 20% premium</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Change tiers monthly or pause membership</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Start on the 1st or 15th of any month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">$10,000 fee credited toward full membership</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Perfect For</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Seasonal Miami residents</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Business travelers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Trial before committing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">Flexible lifestyle needs</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-400 mb-2">One-time Member Ownership Fee</p>
              <p className="text-4xl font-bold text-white mb-8">$10,000</p>
              <Link href="/apply">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full"
                >
                  Apply for Mariner's Membership
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* All-Inclusive Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Everything Included
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Yacht & Crew",
                items: ["Professional captain", "Experienced crew", "Fuel included", "Insurance covered", "Maintenance handled"]
              },
              {
                title: "Services",
                items: ["24/7 concierge", "Trip planning", "Catering coordination", "Transportation", "Event access"]
              },
              {
                title: "Flexibility",
                items: ["12-month advance booking", "No blackout dates", "48-hour rebooking", "Guest privileges", "Global access coming"]
              }
            ].map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-800"
              >
                <h3 className="text-2xl font-bold text-white mb-6">{category.title}</h3>
                <ul className="space-y-3">
                  {category.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-purple-500" />
                      <span className="text-gray-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold text-white mb-8"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Ready to Set Sail?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-gray-300 mb-12"
          >
            Join Miami Beach Yacht Club and start your luxury yachting journey today.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 justify-center"
          >
            <Link href="/apply">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-12 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                Apply Now
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                variant="outline"
                size="lg"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-12 py-6 text-lg rounded-full transform hover:scale-105 transition-all duration-300"
              >
                Contact Sales
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Video CTA */}
      <VideoCTA />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}