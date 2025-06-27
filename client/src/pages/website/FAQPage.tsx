import React, { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Search, Anchor, DollarSign, Calendar, Shield, Users, HelpCircle } from "lucide-react";

const faqCategories = [
  {
    name: "Membership",
    icon: Users,
    questions: [
      {
        question: "How does MBYC membership work?",
        answer: "MBYC uses a token-based system where members receive monthly tokens based on their membership tier. Tokens are used to book yacht trips, with standard 4-hour trips requiring 1 token and 8-hour trips requiring 2 tokens."
      },
      {
        question: "What are the membership tiers?",
        answer: "We offer four tiers: Silver ($3,000/month) for yachts up to 64ft, Gold ($5,000/month) for yachts up to 70ft, Platinum ($7,500/month) for yachts up to 80ft, and Diamond ($10,000/month) for access to our entire fleet including 100ft+ yachts."
      },
      {
        question: "Is there a one-time initiation fee?",
        answer: "Yes, each tier has a one-time initiation fee: Silver ($10,000), Gold ($25,000), Platinum ($50,000), and Diamond ($100,000). This fee helps maintain our fleet and exclusive member services."
      },
      {
        question: "Can I upgrade or downgrade my membership?",
        answer: "Yes, you can change your membership tier with 30 days notice. Upgrades take effect immediately, while downgrades become active at the start of your next billing cycle."
      }
    ]
  },
  {
    name: "Booking & Scheduling",
    icon: Calendar,
    questions: [
      {
        question: "How far in advance can I book?",
        answer: "Members can book up to 30 days in advance. Platinum and Diamond members enjoy priority booking privileges, allowing them to reserve prime dates before other tiers."
      },
      {
        question: "How many reservations can I have at once?",
        answer: "Silver and Gold members can have 4 active reservations (2 weekday, 2 weekend). Platinum and Diamond members can have 6 active reservations (3 weekday, 3 weekend)."
      },
      {
        question: "What's the cancellation policy?",
        answer: "Cancellations made 48+ hours in advance receive full token refunds. Cancellations within 24-48 hours receive 50% token refund. Less than 24 hours notice results in forfeited tokens."
      },
      {
        question: "Can I book back-to-back trips?",
        answer: "Yes, you can book consecutive 4-hour slots to create longer trips. This requires using multiple tokens accordingly."
      }
    ]
  },
  {
    name: "Yacht Experience",
    icon: Anchor,
    questions: [
      {
        question: "What's included in each trip?",
        answer: "Every trip includes a professional captain, crew, fuel, standard water toys, basic refreshments, and yacht insurance. Premium catering and special services can be arranged separately."
      },
      {
        question: "Can I bring guests?",
        answer: "Yes! The number of guests depends on the yacht's capacity. All guests must sign waivers and follow MBYC safety guidelines."
      },
      {
        question: "Are pets allowed on board?",
        answer: "Small, well-behaved pets are allowed on most yachts with prior approval. A pet cleaning fee may apply."
      },
      {
        question: "What happens in bad weather?",
        answer: "Safety is our priority. If weather conditions are unsafe, trips are cancelled with full token refunds. Our captains make the final decision based on marine forecasts."
      }
    ]
  },
  {
    name: "Pricing & Payment",
    icon: DollarSign,
    questions: [
      {
        question: "Are there any hidden fees?",
        answer: "Your membership covers yacht usage, captain, crew, and fuel. Additional costs may include premium catering, special event services, or damages beyond normal wear."
      },
      {
        question: "How does billing work?",
        answer: "Memberships are billed monthly in advance. We accept all major credit cards and ACH transfers. Annual prepayment receives a 10% discount."
      },
      {
        question: "What payment methods do you accept?",
        answer: "We accept Visa, Mastercard, American Express, ACH transfers, and wire transfers for annual payments."
      },
      {
        question: "Is there a referral program?",
        answer: "Yes! Refer a friend who joins and you both receive bonus tokens. Diamond members receive additional VIP referral benefits."
      }
    ]
  },
  {
    name: "Safety & Insurance",
    icon: Shield,
    questions: [
      {
        question: "Are the yachts insured?",
        answer: "Yes, all yachts carry comprehensive insurance including liability coverage. Members are covered under our policy during normal use."
      },
      {
        question: "What safety equipment is on board?",
        answer: "All yachts exceed USCG safety requirements with life jackets, emergency beacons, first aid kits, fire suppression systems, and emergency rafts."
      },
      {
        question: "Are the captains licensed?",
        answer: "All MBYC captains hold valid USCG licenses appropriate for the vessel size and are thoroughly vetted with extensive local knowledge."
      },
      {
        question: "What's the damage policy?",
        answer: "Members are responsible for damages beyond normal wear. We recommend reviewing our damage policy during onboarding. Optional damage waiver insurance is available."
      }
    ]
  },
  {
    name: "Getting Started",
    icon: HelpCircle,
    questions: [
      {
        question: "How do I join MBYC?",
        answer: "Start by selecting your membership tier and completing our online application. Once approved, pay your initiation fee and first month's dues to activate your account."
      },
      {
        question: "Is there an application process?",
        answer: "Yes, we have a brief application to ensure the best fit for our community. Most applications are approved within 24-48 hours."
      },
      {
        question: "Do you offer tours?",
        answer: "Absolutely! Schedule a complimentary tour of our fleet and facilities. Tours include meeting our team and experiencing a sample yacht."
      },
      {
        question: "What if I've never been on a yacht?",
        answer: "No experience necessary! Our crew provides orientation on your first trip and ensures you're comfortable. We also offer optional boating safety courses."
      }
    ]
  }
];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const toggleQuestion = (question: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(question)) {
      newExpanded.delete(question);
    } else {
      newExpanded.add(question);
    }
    setExpandedQuestions(newExpanded);
  };

  const filteredCategories = selectedCategory === "All Categories"
    ? faqCategories
    : faqCategories.filter(cat => cat.name === selectedCategory);

  const searchFilteredCategories = searchQuery
    ? filteredCategories.map(cat => ({
        ...cat,
        questions: cat.questions.filter(
          q => q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
               q.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(cat => cat.questions.length > 0)
    : filteredCategories;

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
              <Link href="/website/plans" className="text-gray-300 hover:text-white transition">Plans & Pricing</Link>
              <Link href="/website/events" className="text-gray-300 hover:text-white transition">Events</Link>
              <Link href="/website/fleet" className="text-gray-300 hover:text-white transition">Fleet</Link>
              <Link href="/website/faq" className="text-white font-semibold">FAQ</Link>
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
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-300">
              Everything you need to know about Miami Beach Yacht Club
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedCategory("All Categories")}
              className={`px-6 py-3 rounded-full transition ${
                selectedCategory === "All Categories"
                  ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              All Categories
            </button>
            {faqCategories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-full transition ${
                    selectedCategory === category.name
                      ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <Icon size={20} />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="px-6 pb-20">
        <div className="max-w-4xl mx-auto">
          {searchFilteredCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="mb-12"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">{category.name}</h2>
                </div>

                <div className="space-y-4">
                  {category.questions.map((item, questionIndex) => (
                    <motion.div
                      key={item.question}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: questionIndex * 0.05 }}
                      className="bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleQuestion(item.question)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition"
                      >
                        <span className="text-left font-semibold">{item.question}</span>
                        {expandedQuestions.has(item.question) ? (
                          <ChevronUp className="text-purple-400 flex-shrink-0" size={20} />
                        ) : (
                          <ChevronDown className="text-gray-400 flex-shrink-0" size={20} />
                        )}
                      </button>
                      
                      {expandedQuestions.has(item.question) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="px-6 pb-4"
                        >
                          <p className="text-gray-300">{item.answer}</p>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Our membership team is here to help you get started on your yachting journey
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/website/contact">
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full text-lg font-semibold hover:from-purple-700 hover:to-blue-600 transition transform hover:scale-105">
                Contact Us
              </button>
            </Link>
            <Link href="/website/tour">
              <button className="px-8 py-4 border-2 border-white rounded-full text-lg font-semibold hover:bg-white hover:text-gray-900 transition">
                Schedule a Tour
              </button>
            </Link>
          </div>

          <div className="mt-8 text-gray-300">
            <p>Call us directly at <span className="text-purple-400 font-semibold">786-981-3875</span></p>
            <p>Monday - Sunday, 9:00 AM - 6:00 PM EST</p>
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