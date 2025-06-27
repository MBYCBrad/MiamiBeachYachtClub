import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { VideoCTA } from "@/components/video-cta";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { Anchor, DollarSign, Shield, Users, Settings, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function InvestPage() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Passive Income",
      description: "Receive a stable monthly lease payment while your yacht is professionally managed, maintained, and chartered exclusively to MBYC members.",
    },
    {
      icon: Anchor,
      title: "Unlock Elite Membership",
      description: "As a fleet partner, you become a top-tier member of MBYC—enjoying access to our entire collection of luxury yachts across all locations, not just your own vessel.",
    },
    {
      icon: Settings,
      title: "No Hassle Ownership",
      description: "We handle everything—crew, maintenance, insurance, bookings, logistics, and more. You enjoy your yacht when you want it, and we take care of the rest.",
    },
    {
      icon: TrendingUp,
      title: "Be Part of the Expansion",
      description: "We're growing fast. From Miami Beach to Palm Beach, the Hamptons, Newport, San Diego, and Cabo, our port-by-port expansion is designed to build the most exclusive, asset-light yacht club in the world.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Submit Your Yacht",
      description: "Submit your yacht for consideration (typically 65 ft. and up)",
    },
    {
      number: "02",
      title: "Evaluation",
      description: "We evaluate and onboard select yachts into the MBYC fleet",
    },
    {
      number: "03",
      title: "Agreement",
      description: "You receive a lease agreement with monthly income and membership access",
    },
    {
      number: "04",
      title: "Management",
      description: "We promote and manage your yacht within our high-end member network",
    },
    {
      number: "05",
      title: "Stay in Control",
      description: "You stay in control—your yacht, your benefits, our expertise",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <VideoHeader 
        title="Invest" 
        subtitle="Say Goodbye to Yacht Costs. Say Hello to Revenue and Unlimited Access."
      />

      {/* Hero Content */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Earn income. Get exclusive access. Be part of the fastest-growing luxury yacht club in the world.
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              At Miami Beach Yacht Club (MBYC), we're redefining luxury yachting—and you can be a part of it.
            </p>
            <p className="text-lg text-gray-400 mb-8">
              We're inviting select yacht owners and investors to join our elite fleet program and enjoy the benefits of ownership without the hassle.
            </p>
            <p className="text-lg text-gray-300">
              Whether you own a yacht or are looking to invest, MBYC offers a unique opportunity: Place your yacht into our fleet and receive guaranteed monthly lease income, full service management, and a luxury membership granting you access to our growing national fleet.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">Why Partner with MBYC?</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join our exclusive fleet program and transform your yacht from a cost center into a revenue generator
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 bg-gradient-to-b from-purple-900/10 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-xl text-gray-400">Simple process to join our exclusive fleet program</p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl p-8 border border-purple-500/20"
              >
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2">{step.title}</h3>
                    <p className="text-gray-300 text-lg">{step.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Join the Fleet. Live the Club.
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              This is more than a yacht program—it's a partnership. As we scale MBYC into new harbors and luxury destinations, we're offering a chance to grow with us, benefit from our brand, and enjoy the ultimate lifestyle access.
            </p>
            <p className="text-lg text-purple-400 font-semibold mb-12">
              Limited fleet partner spots available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-tour">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 px-8"
                >
                  Submit Your Yacht
                </Button>
              </Link>
              <Link href="/contact">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/10 transition-all duration-300 px-8"
                >
                  Contact Us to Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Investor Testimonials */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">Investor Testimonials</h2>
            <p className="text-xl text-gray-400">What our investors say about MBYC</p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                name: "Alexandra Chen",
                role: "Partner, Venture Capital Fund",
                quote: "MBYC's unit economics are exceptional. The recurring revenue model combined with high member retention creates a compelling investment opportunity.",
              },
              {
                name: "Marcus Wellington",
                role: "Family Office Director",
                quote: "We invested in MBYC because they're solving a real problem in the luxury market. Their growth trajectory has exceeded our expectations.",
              },
              {
                name: "Isabella Rodriguez",
                role: "Angel Investor",
                quote: "The team's execution has been flawless. They've built a premium brand that resonates with their target market while maintaining operational excellence.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-purple-400">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <VideoCTA 
        title="Ready to Transform Your Yacht Investment?"
        description="Join Miami Beach Yacht Club's exclusive fleet program and turn your yacht into a revenue-generating asset while enjoying unlimited access to our growing luxury fleet."
        primaryButtonText="Submit Your Yacht"
        primaryButtonLink="/book-tour"
        secondaryButtonText="Contact Us"
        secondaryButtonLink="/contact"
      />
      
      <Footer />
    </div>
  );
}