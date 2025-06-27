import { Navigation } from "@/components/navigation";
import { VideoHeader } from "@/components/video-header";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";
import { TrendingUp, Users, Globe, Shield, DollarSign, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function InvestPage() {
  const metrics = [
    { label: "Fleet Value", value: "$125M+", growth: "+18% YoY" },
    { label: "Active Members", value: "2,500+", growth: "+45% YoY" },
    { label: "Revenue", value: "$24M", growth: "+62% YoY" },
    { label: "Retention Rate", value: "94%", growth: "Industry Leading" },
  ];

  const benefits = [
    {
      icon: TrendingUp,
      title: "High Growth Market",
      description: "The luxury yacht membership market is growing at 25% annually as affluent consumers seek access over ownership.",
    },
    {
      icon: Users,
      title: "Proven Business Model",
      description: "Our membership model generates predictable recurring revenue with high margins and low customer acquisition costs.",
    },
    {
      icon: Globe,
      title: "Expansion Opportunities",
      description: "Plans to expand to key markets including Monaco, Dubai, and the Caribbean within the next 24 months.",
    },
    {
      icon: Shield,
      title: "Asset-Backed Security",
      description: "Our fleet of premium yachts provides tangible assets that appreciate over time with proper maintenance.",
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      
      <VideoHeader 
        title="Invest in MBYC" 
        subtitle="Join us in revolutionizing luxury yacht access"
      />

      {/* Investment Highlights */}
      <section className="py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <h3 className="text-gray-400 mb-2">{metric.label}</h3>
                <p className="text-4xl md:text-5xl font-bold text-white mb-2">{metric.value}</p>
                <p className="text-green-400 text-sm font-semibold">{metric.growth}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Opportunity */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">The Opportunity</h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              MBYC is transforming the $50B yacht industry by making luxury yachting accessible through 
              an innovative membership model that benefits both yacht owners and members.
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

      {/* Investment Terms */}
      <section className="py-32 bg-gradient-to-b from-purple-900/10 to-black">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <DollarSign className="w-16 h-16 text-purple-400 mx-auto mb-6" />
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">Investment Terms</h2>
            <p className="text-xl text-gray-400">Series B funding round now open</p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-3xl p-12 border border-purple-500/20"
            >
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h4 className="text-gray-400 mb-2">Funding Target</h4>
                  <p className="text-3xl font-bold text-white">$50M</p>
                </div>
                <div>
                  <h4 className="text-gray-400 mb-2">Minimum Investment</h4>
                  <p className="text-3xl font-bold text-white">$250K</p>
                </div>
                <div>
                  <h4 className="text-gray-400 mb-2">Pre-Money Valuation</h4>
                  <p className="text-3xl font-bold text-white">$200M</p>
                </div>
                <div>
                  <h4 className="text-gray-400 mb-2">Use of Funds</h4>
                  <p className="text-white">Fleet expansion & market growth</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300">Preferred equity with 8% cumulative dividend</p>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300">2x liquidation preference</p>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-purple-400 mt-1 flex-shrink-0" />
                  <p className="text-gray-300">Board observer rights for investments over $1M</p>
                </div>
              </div>

              <Link href="/contact">
                <Button 
                  size="lg"
                  className="w-full bg-white text-black hover:bg-gray-100 transition-colors"
                >
                  Request Investment Deck
                </Button>
              </Link>
            </motion.div>
          </div>
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

      <Footer />
    </div>
  );
}