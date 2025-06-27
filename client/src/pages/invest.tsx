import React from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '@/components/navigation';
import { TrendingUp, DollarSign, Users, Globe, Shield, ChartBar, ArrowUpRight, Sparkles, Check } from 'lucide-react';

// Investment opportunity data
const investmentHighlights = [
  {
    icon: TrendingUp,
    title: '35% Annual Growth',
    description: 'Consistent year-over-year revenue growth'
  },
  {
    icon: DollarSign,
    title: '$50M Valuation',
    description: 'Current market valuation with strong fundamentals'
  },
  {
    icon: Users,
    title: '2,500+ Members',
    description: 'Growing community of luxury yacht enthusiasts'
  },
  {
    icon: Globe,
    title: 'Global Expansion',
    description: 'Plans for international locations by 2026'
  }
];

const investmentTiers = [
  {
    name: 'Explorer',
    minInvestment: '$25,000',
    equity: '0.1%',
    perks: [
      'Platinum membership for 2 years',
      'Priority booking privileges',
      'Quarterly investor updates',
      'Annual investor yacht event'
    ]
  },
  {
    name: 'Navigator',
    minInvestment: '$100,000',
    equity: '0.5%',
    perks: [
      'Lifetime Platinum membership',
      'Board observer rights',
      'Monthly executive calls',
      'Naming rights on select yachts',
      'VIP concierge access'
    ]
  },
  {
    name: 'Admiral',
    minInvestment: '$500,000',
    equity: '2.5%',
    perks: [
      'Board seat opportunity',
      'Strategic advisory role',
      'Custom yacht experiences',
      'Global club access',
      'Revenue sharing options'
    ]
  }
];

export default function InvestPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-indigo-900/30" />
          {/* Animated particles */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500/50 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              transition={{
                duration: Math.random() * 40 + 20,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 text-sm font-semibold">Series A Now Open</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Invest in the Future
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                of Luxury Yachting
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
              Join us in revolutionizing the yacht club experience. MBYC is raising $10M 
              to expand our fleet, enhance technology, and enter new markets.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold text-lg shadow-lg flex items-center gap-2 mx-auto"
            >
              View Investment Deck
              <ArrowUpRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Investment Highlights */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-white text-center mb-12"
          >
            Investment Highlights
          </motion.h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {investmentHighlights.map((highlight, index) => (
              <motion.div
                key={highlight.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <highlight.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{highlight.title}</h3>
                <p className="text-gray-400">{highlight.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-indigo-900/20" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                $8.5B Market Opportunity
              </h2>
              <p className="text-gray-400 mb-6">
                The luxury yacht charter market is experiencing unprecedented growth, 
                driven by increasing demand for experiential luxury and flexible ownership models.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">15% CAGR in luxury yacht charters globally</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">78% of HNWIs prefer access over ownership</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <span className="text-gray-300">Digital transformation driving operational efficiency</span>
                </li>
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            >
              <ChartBar className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">Growth Projections</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">2024</span>
                    <span className="text-white">$15M Revenue</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">2025</span>
                    <span className="text-white">$35M Revenue</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full" style={{ width: '60%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">2026</span>
                    <span className="text-white">$75M Revenue</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Investment Tiers */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Investment Opportunities
            </h2>
            <p className="text-xl text-gray-400">
              Choose the investment level that aligns with your goals
            </p>
          </motion.div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {investmentTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <p className="text-3xl font-bold text-purple-400">{tier.minInvestment}</p>
                  <p className="text-gray-400">Minimum investment</p>
                </div>
                <div className="mb-6">
                  <p className="text-xl font-semibold text-white">{tier.equity} Equity</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{perk}</span>
                    </li>
                  ))}
                </ul>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold"
                >
                  Learn More
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-indigo-900/20" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <Shield className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Join Our Journey?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Request our comprehensive investment deck and schedule a call with our 
            executive team to discuss how you can be part of MBYC's growth story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold text-lg shadow-lg"
            >
              Request Investment Deck
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-semibold text-lg border border-white/20"
            >
              Schedule Call
            </motion.button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}