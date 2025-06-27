import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation } from '@/components/navigation';
import { ChevronDown, Search, Anchor, CreditCard, Calendar, Shield, Users, Sparkles } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Membership
  {
    category: 'Membership',
    question: 'What are the different membership tiers?',
    answer: 'MBYC offers four exclusive membership tiers: Bronze (access to yachts up to 40ft), Silver (up to 55ft), Gold (up to 70ft), and Platinum (unlimited access to our entire fleet). Each tier includes unlimited bookings, concierge services, and exclusive event invitations.'
  },
  {
    category: 'Membership',
    question: 'How do I upgrade my membership?',
    answer: 'You can upgrade your membership at any time through the mobile app or by contacting our concierge team. Upgrades take effect immediately, and you\'ll only pay the prorated difference for the remainder of your billing period.'
  },
  {
    category: 'Membership',
    question: 'Is there a minimum commitment period?',
    answer: 'Yes, all memberships require a minimum 12-month commitment. After the initial period, memberships automatically renew on a month-to-month basis unless cancelled with 30 days notice.'
  },
  
  // Booking
  {
    category: 'Booking',
    question: 'How far in advance can I book a yacht?',
    answer: 'Members can book yachts up to 12 months in advance. Platinum members enjoy priority booking privileges and can reserve yachts 14 days before other tiers for peak dates.'
  },
  {
    category: 'Booking',
    question: 'What is included in a yacht booking?',
    answer: 'Every booking includes a professional captain and crew, fuel for standard routes, water sports equipment, and basic refreshments. Gourmet catering, premium beverages, and special services can be added through our concierge.'
  },
  {
    category: 'Booking',
    question: 'Can I cancel or modify my booking?',
    answer: 'Bookings can be modified or cancelled up to 48 hours before departure without penalty. Cancellations within 48 hours may incur a fee, except for weather-related cancellations which are always free.'
  },
  
  // Services
  {
    category: 'Services',
    question: 'What concierge services are available?',
    answer: 'Our 24/7 concierge can arrange everything from gourmet catering and spa treatments to photography sessions and water sports instructors. Simply request services when booking or contact concierge directly.'
  },
  {
    category: 'Services',
    question: 'Are concierge services included in membership?',
    answer: 'Basic concierge assistance is included with all memberships. Individual services like catering, spa treatments, or special experiences are billed separately at member rates.'
  },
  
  // Payment
  {
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, ACH transfers, and wire transfers. Platinum members can also arrange for invoiced billing on a monthly basis.'
  },
  {
    category: 'Payment',
    question: 'When am I charged for services?',
    answer: 'Membership fees are charged monthly in advance. Additional services are charged upon booking confirmation. A hold may be placed on your card 24 hours before yacht departure.'
  },
  
  // Safety
  {
    category: 'Safety',
    question: 'What safety measures are in place?',
    answer: 'All yachts are equipped with the latest safety equipment and undergo regular inspections. Our captains are licensed professionals with extensive experience. We maintain comprehensive insurance coverage for all members and guests.'
  },
  {
    category: 'Safety',
    question: 'What happens in case of bad weather?',
    answer: 'Safety is our top priority. If weather conditions are unsafe, your captain will reschedule your trip at no charge. We monitor weather 24/7 and will contact you proactively about any concerns.'
  },
];

// Category icon mapping
const categoryIcons: { [key: string]: React.ElementType } = {
  Membership: Users,
  Booking: Calendar,
  Services: Sparkles,
  Payment: CreditCard,
  Safety: Shield,
};

// FAQ accordion item
function FAQAccordion({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <h3 className="text-lg font-semibold text-white pr-4">{item.question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-purple-400 flex-shrink-0" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-4">
              <p className="text-gray-400 leading-relaxed">{item.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const categories = ['All', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <Anchor className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h1 className="text-6xl md:text-8xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
            >
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to know about Miami Beach Yacht Club membership, 
              bookings, and services.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 backdrop-blur-sm border border-white/10 rounded-full text-white placeholder:text-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            {categories.map((category) => {
              const Icon = categoryIcons[category];
              return (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {category}
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="pb-32">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            {filteredFAQs.map((item, index) => (
              <FAQAccordion
                key={index}
                item={item}
                isOpen={openItems.includes(index)}
                onToggle={() => toggleItem(index)}
              />
            ))}
          </motion.div>

          {filteredFAQs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-gray-400 text-xl">No questions found matching your search.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-indigo-900/20" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Still Have Questions?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Our concierge team is available 24/7 to assist you with any questions about 
            membership, bookings, or yacht experiences.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold text-lg shadow-lg"
          >
            Contact Concierge
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}