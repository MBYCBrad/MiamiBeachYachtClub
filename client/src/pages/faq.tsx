import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { Footer } from "@/components/footer";
import { ApplicationModal } from "@/components/application-modal";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    category: "Membership",
    questions: [
      {
        question: "What types of memberships are available?",
        answer: "We offer several membership tiers, including Gold, Platinum, and Diamond. Each tier offers different benefits and access to our fleet of yachts."
      },
      {
        question: "How does the membership work?",
        answer: "Diamond membership offers you access to the entire fleet. Platinum membership offer access to yachts 80 feet and lower. Gold memberships to 70 feet and lower."
      },
      {
        question: "Can I pay my membership dues yearly?",
        answer: "Absolutely! If you do you will get a 10% discount."
      },
      {
        question: "What is included in the membership fee?",
        answer: "Your Membership covers the yacht usage, the captain and crew, fuel costs, exclusive club events, and concierge services, including transportation and private jet bookings. Tips are appreciated but at your discretion."
      },
      {
        question: "How do I renew my membership?",
        answer: "Membership can be renewed annually through our online portal or by speaking with our concierge team."
      }
    ]
  },
  {
    category: "Booking & Usage",
    questions: [
      {
        question: "How do I book a yacht?",
        answer: "You can book a yacht either through our concierge service or through our booking app."
      },
      {
        question: "Can I bring guests aboard the yacht?",
        answer: "Yes, members are welcome to bring guests according to the capacity limits of the booked yacht."
      },
      {
        question: "Can I buy a membership as a gift?",
        answer: "Yes you can as long as we do a background check on the club member."
      }
    ]
  }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

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


        </div>
      </section>

      {/* Video CTA */}
      <VideoCTA 
        onApplyClick={() => setIsApplicationModalOpen(true)}
      />
      
      {/* Footer */}
      <Footer />

      <AnimatePresence>
        <ApplicationModal 
          isOpen={isApplicationModalOpen} 
          onClose={() => setIsApplicationModalOpen(false)} 
        />
      </AnimatePresence>
    </div>
  );
}