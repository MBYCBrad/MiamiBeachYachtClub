import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { Footer } from "@/components/footer";
import { Check, Crown, Star, Sparkles } from "lucide-react";
import { useState } from "react";
import { ApplicationModal } from "@/components/application-modal";

// Membership Tiers Data (matching themiamibeachyachtclub.com exactly)
const membershipTiers = [
  {
    name: "Gold",
    title: "GOLD MEMBERSHIP",
    monthlyFee: "$5,000",
    initiationFee: "$25,000",
    color: "from-purple-600 to-indigo-600",
    icon: <Crown className="w-8 h-8 text-white" />,
    yachtAccess: "Access Yachts Up To 70ft",
    bookings: "4 Bookings at a time",
    weekdayBookings: "2",
    weekendBookings: "2", 
    features: [
      "Future Access To Marinas In Caribbeans, Europe & More...",
      "*Gold members are entitled to four (4) reservations concurrently on the calendar, two (2) on weekdays and two (2) on weekends."
    ],
    popular: false
  },
  {
    name: "Platinum", 
    title: "PLATINUM MEMBERSHIP",
    monthlyFee: "$7,500",
    initiationFee: "$50,000",
    color: "from-purple-600 to-indigo-600",
    icon: <Star className="w-8 h-8 text-white" />,
    yachtAccess: "Access Yachts Up To 80ft",
    bookings: "6 Bookings at a time",
    weekdayBookings: "3",
    weekendBookings: "3",
    features: [
      "Future Access To Marinas In Caribbeans, Europe & More...",
      "*Platinum members are entitled to six (6) reservations concurrently on the calendar, no more than three (3) on weekdays and with three (3) on weekends."
    ],
    popular: false
  },
  {
    name: "Diamond",
    title: "DIAMOND MEMBERSHIP", 
    monthlyFee: "$10,000",
    initiationFee: "$100,000",
    color: "from-purple-600 to-indigo-600",
    icon: <Sparkles className="w-8 h-8 text-white" />,
    yachtAccess: "Access Yachts Up To 100ft",
    bookings: "6 Bookings at a time",
    weekdayBookings: "3",
    weekendBookings: "3",
    features: [
      "Future Access To Marinas In Caribbeans, Europe & More...",
      "*Diamond members are entitled to six (6) reservations concurrently on the calendar, three (3) on weekdays and three (3) on weekends."
    ],
    popular: true
  }
];

export default function Pricing() {
  const [activeTab, setActiveTab] = useState('full');
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      
      <VideoHeader 
        title="Plans & Pricing"
        subtitle="Choose your membership plan"
      />

      {/* Tab Navigation */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex justify-center mb-12">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-full p-2 border border-gray-700">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('full')}
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeTab === 'full'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Full Membership
                </button>
                <button
                  onClick={() => setActiveTab('mariners')}
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeTab === 'mariners'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Mariner's Membership
                </button>
              </div>
            </div>
          </div>

          {/* Tab Subtitle */}
          {activeTab === 'full' && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-gray-300 mb-12 max-w-2xl mx-auto"
            >
              *Platinum Packages limited to a select amount. Once sold out they will not be available to the public unless Platinum member wants to resell.
            </motion.p>
          )}
        </div>
      </section>

      {/* Full Membership Content */}
      {activeTab === 'full' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Membership Tiers */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-1 rounded-full text-sm font-semibold z-20">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 hover:border-white/20 transition-all duration-300 h-full overflow-hidden">
                      {/* Header with color background */}
                      <div className={`bg-gradient-to-r ${tier.color} p-8 text-center`}>
                        <div className="flex items-center justify-center mb-4">
                          {tier.icon}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{tier.title}</h3>
                      </div>

                      {/* Price Section */}
                      <div className="p-8 text-center">
                        <div className="mb-6">
                          <div className="text-4xl font-bold text-white mb-2">{tier.monthlyFee}</div>
                          <div className="text-gray-400">Every Month</div>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-300">+{tier.initiationFee} One Time Member Ownership Fee</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-300">{tier.yachtAccess}</span>
                          </div>
                          <div className="flex items-center justify-center gap-2">
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-300">Future Access To Marinas In Caribbeans, Europe & More...</span>
                          </div>
                        </div>

                        <Button 
                          onClick={() => setIsApplicationModalOpen(true)}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white mb-6"
                        >
                          APPLY NOW
                        </Button>

                        <div className="text-sm text-gray-400 space-y-2">
                          <p>Unlimited reservations {tier.bookings}.</p>
                          {tier.features.map((feature, idx) => (
                            <p key={idx}>{feature}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Additional Info */}
          <section className="py-12">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-6 text-gray-300"
              >
                <p>
                  The Member Ownership Fee is a one-time, lifetime fee that grants ownership of a membership which owns the right to use the yachts. As long as membership dues are maintained, and once we reach the maximum number of memberships sold, new members will only be able to join by purchasing a membership from an existing member through MBYC directly.
                </p>
                <p className="italic">
                  The bookings replenish 48 hours after you complete your trip.
                </p>
              </motion.div>
            </div>
          </section>
        </motion.div>
      )}

      {/* Mariner's Membership Content */}
      {activeTab === 'mariners' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <section className="py-20">
            <div className="max-w-4xl mx-auto px-6">
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
                <p className="text-2xl text-gray-300 mb-4">
                  The Ultimate Flexible Yachting Experience
                </p>
                <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                  The Mariner's Membership is designed for those who seek ultimate flexibility in their yachting experience. This à la carte membership allows you to tailor your access to the club on a month-to-month basis, choosing your membership tier based on your plans and needs.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10 mb-12"
              >
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">HOW IT WORKS:</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>Membership can begin on the 1st or 15th of any month.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>Members can change tiers each month depending on their schedule.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>Example: Be a Gold Member from Feb 15 – March 15, switch to Diamond from March 15- April 15, and take a break until returning in September, without paying for unused months.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>No long-term commitments, only pay for the months you choose to be active.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Pricing</h3>
                    <div className="space-y-4 text-gray-300">
                      <div>
                        <p className="font-semibold">One-Time Member Ownership Fee: <span className="text-white">$10,000</span></p>
                      </div>
                      <div>
                        <p className="font-semibold mb-2">Monthly Fee: 2X the standard monthly membership rate</p>
                        <ul className="space-y-1 ml-4">
                          <li>• Gold: $10,000/month</li>
                          <li>• Platinum: $15,000/month</li>
                          <li>• Diamond: $20,000/month</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">Benefits & Outing Access</h3>
                    <ul className="space-y-3 text-gray-300">
                      <li className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Gold Membership: 4 four-hour outings per month</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Platinum Membership: 6 four-hour outings per month</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Diamond Membership: 6 four-hour outings per month</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span>Diamond members get 2 outings on the 95' yacht, and the remaining 4 outings must be on other yachts in the fleet.</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-white mb-4">FLEXIBILITY:</h3>
                    <p className="text-gray-300 mb-4">
                      This membership is perfect for those who split their time between locations, have changing schedules, or want the flexibility to experience different levels of membership throughout the year without any long-term obligations.
                    </p>
                    <p className="text-gray-300">
                      Mariner's Members can switch to a yearly membership plan at any time, and their initial $10,000 Member Ownership fee will be credited towards their yearly membership. And by switching to full time membership your monthly fees will be cut in half.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-gray-400 mb-6">
                    Ready to get started? Contact us today to learn more and secure your Mariner's Membership at The Miami Beach Yacht Club!
                  </p>
                  <Button 
                    onClick={() => setIsApplicationModalOpen(true)}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-full"
                  >
                    APPLY NOW
                  </Button>
                </div>
              </motion.div>
            </div>
          </section>
        </motion.div>
      )}

      {/* Video CTA */}
      <VideoCTA />
      
      {/* Footer */}
      <Footer />
      
      <ApplicationModal 
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
      />
    </div>
  );
}