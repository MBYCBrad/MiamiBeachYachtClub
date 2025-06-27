import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqCategories = [
  {
    category: 'Membership',
    questions: [
      {
        q: 'What are the different membership tiers?',
        a: 'We offer four membership tiers: Bronze (up to 40ft yachts, 4 days/month), Silver (up to 55ft, 8 days/month), Gold (up to 70ft, 15 days/month), and Platinum (unlimited access to all yachts).'
      },
      {
        q: 'Can I upgrade my membership anytime?',
        a: 'Yes, you can upgrade your membership tier at any time. The price difference will be prorated for the remaining period. Downgrades take effect at the next billing cycle.'
      },
      {
        q: 'What\'s included in my membership?',
        a: 'All memberships include yacht access based on your tier, concierge services, member events, discounts on additional services, and access to our mobile app for bookings.'
      },
      {
        q: 'Are there any additional fees?',
        a: 'Your membership covers yacht access and listed benefits. Additional services like special catering, premium events, or extended trips may have separate fees.'
      }
    ]
  },
  {
    category: 'Booking & Usage',
    questions: [
      {
        q: 'How do I book a yacht?',
        a: 'You can book yachts through our mobile app or website. Simply select your desired yacht, choose available dates, and confirm your booking. Our concierge team is also available to assist.'
      },
      {
        q: 'How far in advance can I book?',
        a: 'Members can book up to 60 days in advance. Platinum members have priority access and can book up to 90 days ahead.'
      },
      {
        q: 'What happens to unused days?',
        a: 'Monthly yacht days do not roll over to the next month. We encourage members to make the most of their monthly allocation.'
      },
      {
        q: 'Can I cancel or modify bookings?',
        a: 'Bookings can be modified or cancelled up to 48 hours before the scheduled time without penalty. Late cancellations may count against your monthly allocation.'
      }
    ]
  },
  {
    category: 'Yachts & Services',
    questions: [
      {
        q: 'What types of yachts are available?',
        a: 'Our fleet includes luxury motor yachts, sailing yachts, and catamarans ranging from 30ft to over 100ft, all maintained to the highest standards.'
      },
      {
        q: 'Are crew members included?',
        a: 'All yacht bookings include a professional captain. Gold and Platinum members receive complimentary crew service. Additional crew can be arranged for other tiers.'
      },
      {
        q: 'What additional services are available?',
        a: 'We offer catering, water sports equipment, photography, spa services, private chefs, and custom itinerary planning through our concierge team.'
      },
      {
        q: 'Where can I sail?',
        a: 'Our yachts primarily operate in Miami and South Florida waters, including trips to the Keys, Bahamas (with advance notice), and along the Florida coast.'
      }
    ]
  },
  {
    category: 'Policies & Safety',
    questions: [
      {
        q: 'What are the safety protocols?',
        a: 'All yachts are equipped with required safety equipment and undergo regular inspections. Our captains are licensed professionals with extensive experience.'
      },
      {
        q: 'Is there an age requirement?',
        a: 'Primary members must be 21 or older. Children are welcome on board with adult supervision. Some events may have age restrictions.'
      },
      {
        q: 'What about weather cancellations?',
        a: 'If weather conditions make sailing unsafe, we\'ll work with you to reschedule without using your monthly days. Safety is our top priority.'
      },
      {
        q: 'Are pets allowed?',
        a: 'Pet policies vary by yacht. Please check with our concierge team when booking. Service animals are always welcome.'
      }
    ]
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [openQuestions, setOpenQuestions] = useState<Record<string, boolean>>({});

  const toggleQuestion = (id: string) => {
    setOpenQuestions(prev => ({ ...prev, [id]: !prev[id] }));
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
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Everything you need to know about Miami Beach Yacht Club membership
            </p>
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

        {/* FAQ Content */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Category Navigation */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <h2 className="text-2xl font-medium text-white mb-6">Categories</h2>
                  <nav className="space-y-2">
                    {faqCategories.map((cat, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveCategory(index)}
                        className={`w-full text-left px-6 py-4 rounded-xl transition-all duration-300 ${
                          activeCategory === index
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                            : 'text-gray-400 hover:text-white hover:bg-gray-900'
                        }`}
                      >
                        {cat.category}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>

              {/* Questions & Answers */}
              <div className="lg:col-span-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-3xl font-medium text-white mb-8">
                      {faqCategories[activeCategory].category}
                    </h2>
                    
                    <div className="space-y-4">
                      {faqCategories[activeCategory].questions.map((item, index) => {
                        const questionId = `${activeCategory}-${index}`;
                        const isOpen = openQuestions[questionId];
                        
                        return (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="border border-gray-800 rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
                          >
                            <button
                              onClick={() => toggleQuestion(questionId)}
                              className="w-full px-6 py-6 flex items-center justify-between text-left hover:bg-gray-950/50 transition-colors"
                            >
                              <span className="text-lg font-medium text-white pr-4">
                                {item.q}
                              </span>
                              <ChevronDown
                                className={`w-5 h-5 text-purple-400 transition-transform flex-shrink-0 ${
                                  isOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>
                            
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                                    {item.a}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-4 bg-gradient-to-t from-gray-950 to-black">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <HelpCircle className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-thin text-white mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-400 mb-12">
              Our team is here to help you with any questions about membership
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="tel:+13055551234"
                className="px-12 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg rounded-full hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Call Us: (305) 555-1234
              </a>
              <a
                href="mailto:info@miamibeachyachtclub.com"
                className="px-12 py-5 border-2 border-white/30 text-white text-lg rounded-full hover:bg-white/10 transition-all"
              >
                Email Support
              </a>
            </div>
          </motion.div>
        </section>
      </div>
    </WebsiteLayout>
  );
}