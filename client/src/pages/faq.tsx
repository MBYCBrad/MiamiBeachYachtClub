import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    category: "Membership",
    questions: [
      {
        question: "What are the different membership tiers?",
        answer: "MBYC offers four membership tiers: Bronze (access to yachts up to 40ft), Silver (up to 55ft), Gold (up to 70ft), and Platinum (unlimited access to all yachts including mega yachts over 100ft). Each tier includes different levels of concierge services and exclusive event access."
      },
      {
        question: "Can I upgrade my membership tier?",
        answer: "Yes, you can upgrade your membership tier at any time. The upgrade takes effect immediately, and you'll only pay the prorated difference for the remainder of your billing period. Contact our membership team to process your upgrade."
      },
      {
        question: "What's included in my membership?",
        answer: "All memberships include: yacht access based on your tier, professional crew for every voyage, comprehensive insurance, 24/7 concierge support, access to exclusive events, and priority booking. Higher tiers include additional benefits like extended booking windows and premium concierge services."
      },
      {
        question: "Is there a minimum commitment period?",
        answer: "We offer both annual and monthly membership options. Annual members receive a 15% discount and additional benefits. There's no long-term contract required, but we do require 30 days notice for cancellations."
      }
    ]
  },
  {
    category: "Booking & Availability",
    questions: [
      {
        question: "How far in advance can I book a yacht?",
        answer: "Booking windows vary by membership tier: Bronze members can book 30 days in advance, Silver 45 days, Gold 60 days, and Platinum members enjoy 90-day advance booking privileges. This ensures fair access for all members while rewarding higher tiers."
      },
      {
        question: "What if the yacht I want isn't available?",
        answer: "Our concierge team will work with you to find an alternative yacht that meets your needs. We can also add you to a waitlist and notify you immediately if your preferred yacht becomes available due to cancellations."
      },
      {
        question: "Can I book multiple yachts for an event?",
        answer: "Yes, we can arrange multi-yacht charters for special events. This service is available to Gold and Platinum members. Contact our events team at least 30 days in advance to coordinate your multi-yacht experience."
      },
      {
        question: "What's your cancellation policy?",
        answer: "Cancellations made more than 48 hours before your booking are free. Cancellations within 48 hours incur a 50% charge. No-shows are charged in full. Platinum members enjoy more flexible cancellation terms with only 24-hour notice required."
      }
    ]
  },
  {
    category: "Yacht Experience",
    questions: [
      {
        question: "Are crew members included with every booking?",
        answer: "Yes, every yacht booking includes a professional captain and appropriate crew based on the yacht size. Our crew members are fully licensed, insured, and trained to provide exceptional service while ensuring your safety."
      },
      {
        question: "Can I bring my own food and beverages?",
        answer: "Absolutely! You're welcome to bring your own provisions. We also offer premium catering services through our culinary partners, ranging from casual dining to Michelin-star chef experiences. Our concierge team can arrange everything."
      },
      {
        question: "What safety equipment is on board?",
        answer: "All yachts exceed USCG safety requirements with life jackets for all passengers, emergency beacons, first aid kits, fire suppression systems, and emergency rafts. Crew members are trained in emergency procedures and first aid."
      },
      {
        question: "Can I dock at other marinas during my charter?",
        answer: "Yes, you can visit other marinas during your charter. Docking fees at other marinas are additional and vary by location. Our crew can recommend popular destinations and handle docking arrangements."
      }
    ]
  },
  {
    category: "Payment & Pricing",
    questions: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards, ACH transfers, and wire transfers for membership fees. Yacht bookings and additional services can be charged to your card on file or invoiced monthly for Platinum members."
      },
      {
        question: "Are there any hidden fees?",
        answer: "No hidden fees. Your membership includes yacht access, crew, insurance, and standard fuel for day trips. Additional charges only apply for overnight trips, excessive fuel consumption, damage, or optional services like catering."
      },
      {
        question: "Do you offer corporate memberships?",
        answer: "Yes, we offer corporate membership packages with multiple user accounts, priority booking, and dedicated account management. Corporate members also receive tax-advantageous invoicing and can host client entertainment events."
      },
      {
        question: "Is there a referral program?",
        answer: "Yes! When you refer a friend who joins MBYC, you both receive a month of complimentary membership at your current tier. Platinum members receive additional benefits including priority booking credits."
      }
    ]
  }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <VideoHeader 
        title="Frequently Asked Questions" 
        subtitle="Everything you need to know about MBYC membership"
      />

      {/* FAQ Content */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6">
          {faqs.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              className="mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 pb-4 border-b border-purple-500/30">
                {category.category}
              </h2>
              
              <div className="space-y-4">
                {category.questions.map((item, index) => {
                  const key = `${categoryIndex}-${index}`;
                  const isOpen = openItems[key];
                  
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                      >
                        <span className="text-lg font-semibold text-white pr-4">{item.question}</span>
                        <ChevronDown 
                          className={`w-5 h-5 text-purple-400 transition-transform flex-shrink-0 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      
                      <motion.div
                        initial={false}
                        animate={{ height: isOpen ? 'auto' : 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-4 text-gray-300 leading-relaxed">
                          {item.answer}
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="mt-20 text-center bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-3xl p-12 border border-purple-500/20"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Our membership specialists are available to answer any questions and help you choose the perfect membership tier for your yachting lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+13055550692"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                Call Us: (305) 555-MBYC
              </a>
              <a 
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-3 border border-white/20 text-white font-semibold rounded-full hover:bg-white/10 transition-all"
              >
                Contact Form
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}