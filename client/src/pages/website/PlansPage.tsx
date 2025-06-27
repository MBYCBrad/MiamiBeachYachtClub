import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Check, Anchor, Calendar, Users, MapPin, Crown, Shield, Star, Sparkles } from "lucide-react";

const membershipPlans = [
  {
    name: "Silver",
    monthlyFee: "$3,000",
    oneTimeFee: "$10,000",
    yachtAccess: "Up to 64ft",
    color: "from-gray-400 to-gray-600",
    icon: Shield,
    features: [
      "Access to yachts up to 64 feet",
      "4 reservations at a time",
      "Marina access",
      "In-season scheduling",
      "Adventure cruising",
      "Exclusive events",
      "Standard concierge services",
      "48-hour token replenishment"
    ],
    priorityBooking: false,
    reservations: "4 at a time (2 weekdays, 2 weekends)"
  },
  {
    name: "Gold",
    monthlyFee: "$5,000",
    oneTimeFee: "$25,000",
    yachtAccess: "Up to 70ft",
    color: "from-yellow-400 to-yellow-600",
    icon: Crown,
    features: [
      "Access to yachts up to 70 feet",
      "4 reservations at a time",
      "Marina access",
      "Discounted adventure cruising",
      "All club events included",
      "Enhanced concierge services",
      "48-hour token replenishment",
      "Special date reservations"
    ],
    priorityBooking: false,
    reservations: "4 at a time (2 weekdays, 2 weekends)",
    bestValue: true
  },
  {
    name: "Platinum",
    monthlyFee: "$7,500",
    oneTimeFee: "$50,000",
    yachtAccess: "Up to 80ft",
    color: "from-purple-400 to-purple-600",
    icon: Star,
    features: [
      "Access to yachts up to 80 feet",
      "6 reservations at a time",
      "Priority booking included",
      "Marina access",
      "Out-of-season scheduling",
      "Discounted adventure cruising",
      "Premium events access",
      "VIP concierge services"
    ],
    priorityBooking: true,
    reservations: "6 at a time (3 weekdays, 3 weekends)",
    popular: true
  },
  {
    name: "Diamond",
    monthlyFee: "$10,000",
    oneTimeFee: "$100,000",
    yachtAccess: "Up to 100ft",
    color: "from-blue-400 to-blue-600",
    icon: Sparkles,
    features: [
      "Access to entire fleet (up to 100ft)",
      "6 reservations at a time",
      "Priority booking included",
      "Marina access",
      "Out-of-season scheduling",
      "Full day reservations",
      "Guest passes included",
      "Free adventure cruising",
      "White-glove concierge services"
    ],
    priorityBooking: true,
    reservations: "6 at a time (3 weekdays, 3 weekends)"
  }
];

const additionalOptions = [
  {
    name: "Mariner's Membership",
    description: "Flexible month-to-month option",
    features: [
      "No long-term commitment",
      "Access to select yachts",
      "Limited availability",
      "Perfect for trying MBYC"
    ],
    price: "Starting at $2,500/month"
  },
  {
    name: "Snowbird Membership",
    description: "Seasonal membership for winter visitors",
    features: [
      "3-6 month terms",
      "Full club benefits during season",
      "Flexible yacht access",
      "Exclusive snowbird events"
    ],
    price: "Custom pricing"
  },
  {
    name: "Corporate Membership",
    description: "Business entertainment solutions",
    features: [
      "Multiple user accounts",
      "Business event hosting",
      "Tax-deductible benefits",
      "Dedicated account manager"
    ],
    price: "Contact for pricing"
  }
];

export default function PlansPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  return (
    <main className="bg-gray-950 min-h-screen text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/api/media/MBYC-LOGO-WHITE_1750978675231.png" 
                alt="MBYC" 
                className="h-10 w-auto"
              />
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/website" className="text-gray-300 hover:text-white transition">Home</Link>
              <Link href="/website/how-it-works" className="text-gray-300 hover:text-white transition">How It Works</Link>
              <Link href="/website/plans" className="text-white font-semibold">Plans & Pricing</Link>
              <Link href="/website/events" className="text-gray-300 hover:text-white transition">Events</Link>
              <Link href="/website/fleet" className="text-gray-300 hover:text-white transition">Fleet</Link>
              <Link href="/website/faq" className="text-gray-300 hover:text-white transition">FAQ</Link>
              <Link href="/website/contact" className="text-gray-300 hover:text-white transition">Contact</Link>
              <Link href="/auth" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-white font-semibold hover:from-purple-700 hover:to-blue-600 transition">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Plans & Pricing
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Choose the membership that fits your lifestyle
            </p>
            
            {/* Billing Toggle */}
            <div className="inline-flex items-center bg-gray-900 rounded-full p-1">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full transition ${
                  billingCycle === "monthly" 
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white" 
                    : "text-gray-400"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-6 py-2 rounded-full transition ${
                  billingCycle === "annual" 
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white" 
                    : "text-gray-400"
                }`}
              >
                Annual <span className="text-sm">(Save 10%)</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {membershipPlans.map((plan, index) => {
              const Icon = plan.icon;
              const annualDiscount = billingCycle === "annual" ? 0.9 : 1;
              const monthlyAmount = parseInt(plan.monthlyFee.replace(/\$/g, "").replace(/,/g, ""));
              const adjustedMonthly = Math.round(monthlyAmount * annualDiscount);
              
              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  )}
                  {plan.bestValue && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full text-sm font-semibold">
                      Best Value
                    </div>
                  )}
                  
                  <div className={`bg-gray-900/50 rounded-2xl p-8 border ${
                    plan.popular ? "border-purple-500" : "border-gray-700"
                  } hover:border-purple-400 transition h-full flex flex-col`}>
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className={`inline-flex p-3 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                        <Icon size={32} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <p className="text-gray-400 text-sm">{plan.yachtAccess}</p>
                    </div>

                    {/* Pricing */}
                    <div className="text-center mb-6">
                      <div className="mb-2">
                        <span className="text-4xl font-bold">
                          ${adjustedMonthly.toLocaleString()}
                        </span>
                        <span className="text-gray-400">/month</span>
                      </div>
                      <p className="text-sm text-purple-400">
                        +{plan.oneTimeFee} One-time fee
                      </p>
                      {billingCycle === "annual" && (
                        <p className="text-sm text-green-400 mt-1">
                          Save ${(monthlyAmount * 12 * 0.1).toLocaleString()}/year
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start space-x-3">
                          <Check size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Reservations Info */}
                    <div className="text-sm text-gray-400 mb-6 pb-6 border-b border-gray-700">
                      <p className="font-semibold mb-1">Reservations</p>
                      <p>{plan.reservations}</p>
                    </div>

                    {/* CTA */}
                    <Link href="/auth">
                      <button className={`w-full py-3 rounded-full font-semibold transition transform hover:scale-105 ${
                        plan.popular 
                          ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white hover:from-purple-700 hover:to-blue-600"
                          : "bg-gray-800 text-white hover:bg-gray-700"
                      }`}>
                        Join Now
                      </button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Options */}
      <section className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Additional Membership Options</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {additionalOptions.map((option, index) => (
              <motion.div
                key={option.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700"
              >
                <h3 className="text-2xl font-bold mb-2">{option.name}</h3>
                <p className="text-gray-400 mb-6">{option.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {option.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <Check size={20} className="text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <p className="text-lg font-semibold text-purple-400 mb-4">{option.price}</p>
                
                <Link href="/website/contact">
                  <button className="w-full py-3 bg-gray-700 rounded-full text-white font-semibold hover:bg-gray-600 transition">
                    Learn More
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Summary */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How Membership Works</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 mb-4">
                <Anchor size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Your Tier</h3>
              <p className="text-gray-400">Select the membership level that matches your yachting lifestyle and desired vessel size.</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 mb-4">
                <Calendar size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Your Trips</h3>
              <p className="text-gray-400">Use our app to reserve yachts with your tokens. Standard trips are 4 hours, combine tokens for 8-hour adventures.</p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 mb-4">
                <Users size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Enjoy the Experience</h3>
              <p className="text-gray-400">Step aboard with captain, crew, and fuel included. Bring guests and enjoy exclusive member events.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Join the Club?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Experience unlimited luxury yachting with Miami Beach Yacht Club
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-blue-600 transition transform hover:scale-105">
                Start Your Membership
              </button>
            </Link>
            <Link href="/website/tour">
              <button className="px-8 py-4 border-2 border-white rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transition">
                Schedule a Tour
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/api/media/MBYC-LOGO-WHITE_1750978675231.png" 
                alt="MBYC" 
                className="h-12 w-auto mb-4"
              />
              <p className="text-gray-400">The premier luxury yacht club experience in Miami Beach.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/website/about" className="hover:text-white transition">About Us</Link></li>
                <li><Link href="/website/fleet" className="hover:text-white transition">Fleet</Link></li>
                <li><Link href="/website/events" className="hover:text-white transition">Events</Link></li>
                <li><Link href="/website/invest" className="hover:text-white transition">Invest</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>786-981-3875</li>
                <li>membership@mbyc.miami</li>
                <li>300 Alton Road, Suite 305b</li>
                <li>Miami Beach, FL 33139</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Opening Hours</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Mon - Fri: 9am - 6pm</li>
                <li>Sat: 10am - 6pm</li>
                <li>Sun: 10am - 6pm</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>©2025 Miami Beach Yacht Club. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}