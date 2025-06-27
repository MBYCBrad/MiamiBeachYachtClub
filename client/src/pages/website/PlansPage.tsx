import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import { Check, Sparkles, Crown, Gem, Shield } from 'lucide-react';

const membershipPlans = [
  {
    id: 'bronze',
    name: 'Bronze',
    icon: Shield,
    price: 2500,
    color: 'from-orange-700 to-orange-900',
    features: [
      'Access to yachts up to 40ft',
      '4 days of yacht usage per month',
      'Basic concierge services',
      'Member events access',
      'Standard booking priority',
      '10% discount on services'
    ],
    yachtAccess: 'Up to 40ft yachts',
    monthlyDays: 4
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: Sparkles,
    price: 5000,
    color: 'from-gray-400 to-gray-600',
    features: [
      'Access to yachts up to 55ft',
      '8 days of yacht usage per month',
      'Premium concierge services',
      'VIP event invitations',
      'Priority booking access',
      '20% discount on services',
      'Guest passes (2 per month)'
    ],
    yachtAccess: 'Up to 55ft yachts',
    monthlyDays: 8,
    popular: true
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: Crown,
    price: 10000,
    color: 'from-yellow-500 to-yellow-700',
    features: [
      'Access to yachts up to 70ft',
      '15 days of yacht usage per month',
      'Dedicated concierge team',
      'Exclusive member events',
      'Premium booking priority',
      '30% discount on services',
      'Guest passes (5 per month)',
      'Complimentary captain service'
    ],
    yachtAccess: 'Up to 70ft yachts',
    monthlyDays: 15
  },
  {
    id: 'platinum',
    name: 'Platinum',
    icon: Gem,
    price: 25000,
    color: 'from-purple-600 to-blue-600',
    features: [
      'Unlimited yacht access (all sizes)',
      'Unlimited days per month',
      'White-glove concierge service',
      'Private events & experiences',
      'Instant booking availability',
      '50% discount on services',
      'Unlimited guest passes',
      'Complimentary crew & catering',
      'Helicopter transfers available'
    ],
    yachtAccess: 'All yachts in fleet',
    monthlyDays: 'Unlimited',
    exclusive: true
  }
];

export default function PlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const getPrice = (plan: typeof membershipPlans[0]) => {
    const basePrice = plan.price;
    return billingCycle === 'annual' ? Math.floor(basePrice * 0.9) : basePrice;
  };

  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative py-24 px-4 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-7xl mx-auto text-center"
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-thin text-white mb-6">
              Membership Plans
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12">
              Choose the perfect membership tier for your yachting lifestyle
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <span className={`text-lg ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-16 h-8 bg-gray-800 rounded-full transition-colors"
              >
                <motion.div
                  className="absolute top-1 left-1 w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full"
                  animate={{ x: billingCycle === 'annual' ? 32 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                />
              </button>
              <span className={`text-lg ${billingCycle === 'annual' ? 'text-white' : 'text-gray-500'}`}>
                Annual
                <span className="text-green-500 text-sm ml-2">Save 10%</span>
              </span>
            </div>
          </motion.div>

          {/* Animated Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-black to-black" />
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ 
                duration: 30, 
                repeat: Infinity, 
                repeatType: 'reverse' 
              }}
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 80% 80%, #2563eb 0%, transparent 50%)',
                backgroundSize: '200% 200%',
              }}
            />
          </div>
        </section>

        {/* Plans Grid */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {membershipPlans.map((plan, index) => {
                const Icon = plan.icon;
                const isSelected = selectedPlan === plan.id;
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="relative"
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="px-4 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm rounded-full">
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <motion.div
                      whileHover={{ y: -10 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative h-full p-8 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-white bg-white/5'
                          : 'border-gray-800 hover:border-gray-600 bg-gray-950/50'
                      }`}
                    >
                      {/* Plan Header */}
                      <div className="text-center mb-8">
                        <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${plan.color} mb-4`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-2xl font-medium text-white mb-2">{plan.name}</h3>
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-4xl font-bold text-white">
                            ${getPrice(plan).toLocaleString()}
                          </span>
                          <span className="text-gray-400">/{billingCycle === 'annual' ? 'year' : 'month'}</span>
                        </div>
                      </div>

                      {/* Key Benefits */}
                      <div className="mb-6 pb-6 border-b border-gray-800">
                        <div className="text-center">
                          <p className="text-purple-400 font-medium mb-1">{plan.yachtAccess}</p>
                          <p className="text-gray-400">
                            {typeof plan.monthlyDays === 'number' 
                              ? `${plan.monthlyDays} days/month` 
                              : plan.monthlyDays}
                          </p>
                        </div>
                      </div>

                      {/* Features List */}
                      <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <Link href="/auth">
                        <a className={`block w-full py-4 rounded-full text-center font-medium transition-all ${
                          plan.exclusive
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                            : isSelected
                            ? 'bg-white text-black hover:bg-gray-100'
                            : 'bg-gray-800 text-white hover:bg-gray-700'
                        }`}>
                          {plan.exclusive ? 'Apply Now' : 'Select Plan'}
                        </a>
                      </Link>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-950">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-thin text-white mb-4">
                Compare Plans
              </h2>
              <p className="text-xl text-gray-400">
                Find the perfect membership for your needs
              </p>
            </motion.div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-4 text-gray-400 font-normal">Features</th>
                    {membershipPlans.map(plan => (
                      <th key={plan.id} className="text-center py-4 px-4">
                        <div className="text-white font-medium">{plan.name}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4 text-gray-300">Monthly Price</td>
                    {membershipPlans.map(plan => (
                      <td key={plan.id} className="text-center py-4 px-4 text-white">
                        ${plan.price.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4 text-gray-300">Yacht Access</td>
                    {membershipPlans.map(plan => (
                      <td key={plan.id} className="text-center py-4 px-4 text-white">
                        {plan.yachtAccess}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-gray-800">
                    <td className="py-4 px-4 text-gray-300">Monthly Days</td>
                    {membershipPlans.map(plan => (
                      <td key={plan.id} className="text-center py-4 px-4 text-white">
                        {plan.monthlyDays}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-thin text-white text-center mb-16">
                Frequently Asked Questions
              </h2>

              <div className="space-y-8">
                {[
                  {
                    q: "Can I upgrade my membership anytime?",
                    a: "Yes, you can upgrade your membership tier at any time. The price difference will be prorated for the remaining period."
                  },
                  {
                    q: "What happens to unused days?",
                    a: "Unused days do not roll over to the next month. We encourage members to make the most of their monthly allocation."
                  },
                  {
                    q: "Are there any additional fees?",
                    a: "Your membership covers yacht access and listed benefits. Additional services like catering or special events may have separate fees."
                  },
                  {
                    q: "How do I book a yacht?",
                    a: "Once you're a member, you can book yachts through our app or by contacting your dedicated concierge team."
                  }
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="border-l-2 border-purple-600 pl-6"
                  >
                    <h3 className="text-xl font-medium text-white mb-2">{faq.q}</h3>
                    <p className="text-gray-400">{faq.a}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-t from-gray-950 to-black">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-thin text-white mb-6">
              Ready to Join?
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Start your luxury yachting journey today
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/auth">
                <a className="px-12 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg rounded-full hover:from-purple-700 hover:to-blue-700 transition-all">
                  Create Account
                </a>
              </Link>
              <Link href="/website/contact">
                <a className="px-12 py-5 border-2 border-white/30 text-white text-lg rounded-full hover:bg-white/10 transition-all">
                  Contact Us
                </a>
              </Link>
            </div>
          </motion.div>
        </section>
      </div>
    </WebsiteLayout>
  );
}