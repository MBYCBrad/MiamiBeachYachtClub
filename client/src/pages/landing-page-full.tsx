import { Link } from "wouter";
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { ChevronDown, Anchor, Sparkles, Waves, Star, Users, Trophy, Shield, ArrowRight, Phone, Mail, MapPin, Clock, Check, Zap, Globe, Award, Calendar, DollarSign, Compass, Ship, Gem, Crown, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import starPattern from "@assets/PF0007919-big_1751025963434.jpg";
import { useState, useEffect, useRef } from "react";

// Custom cursor component
function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [cursorVariant, setCursorVariant] = useState("default");
  
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, []);
  
  return (
    <div 
      ref={cursorRef}
      className={`fixed w-8 h-8 pointer-events-none z-[9999] mix-blend-difference transition-transform duration-300 ${
        cursorVariant === "hover" ? "scale-150" : ""
      }`}
    >
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-white rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-white/20 rounded-full scale-150 animate-ping" />
      </div>
    </div>
  );
}

// Floating particles background
function FloatingParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-purple-500/30 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

// Hero Section with Revolutionary Video Background
function HeroSection() {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Video Background with Parallax */}
      <motion.div
        className="absolute inset-0 scale-110"
        style={{
          x: useTransform(mouseX, [0, window.innerWidth], [-20, 20]),
          y: useTransform(mouseY, [0, window.innerHeight], [-20, 20]),
        }}
      >
        {heroVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={(heroVideo as any).url} type={(heroVideo as any).mimetype} />
          </video>
        )}
      </motion.div>
      
      {/* Dynamic Gradient Overlay */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-indigo-900/20" />
      </div>

      {/* Content with 3D Transform */}
      <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateX: 45 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ perspective: 1000 }}
        >
          <motion.img 
            src="/api/media/MBYC-LOGO-WHITE (1)_1751027380901.png" 
            alt="Miami Beach Yacht Club" 
            className="mx-auto w-[500px] md:w-[700px] lg:w-[800px] mb-12"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            <span className="block">Experience</span>
            <span className="block bg-gradient-to-r from-purple-400 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Limitless Luxury
            </span>
          </h1>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
        >
          The world's most exclusive yacht club experience, now at your fingertips
        </motion.p>

        {/* CTA Buttons with Hover Effects */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="flex flex-col sm:flex-row gap-6 justify-center"
        >
          <Link href="/plans-pricing">
            <motion.button
              className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-lg font-semibold overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Become a Member</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </Link>
          
          <Link href="/fleet">
            <motion.button
              className="group relative px-10 py-5 border-2 border-white/30 text-white rounded-full text-lg font-semibold backdrop-blur-sm"
              whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.8)" }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Explore Fleet</span>
              <motion.span
                className="absolute inset-0 bg-white/10 rounded-full"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </Link>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <ChevronDown className="w-8 h-8 text-white/50" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Section 1: Revolutionary Experience Section with 3D Cards
function ExperienceSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  
  const experiences = [
    {
      icon: Anchor,
      title: "Instant Access",
      description: "Book any yacht in our fleet with just a tap. No ownership hassles.",
      gradient: "from-purple-600 to-indigo-600",
    },
    {
      icon: Sparkles,
      title: "White Glove Service", 
      description: "24/7 concierge handles every detail of your yacht experience.",
      gradient: "from-indigo-600 to-purple-600",
    },
    {
      icon: Crown,
      title: "Exclusive Events",
      description: "Members-only gatherings at the most prestigious venues.",
      gradient: "from-purple-600 to-pink-600",
    },
  ];
  
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black" />
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundImage: [
              'radial-gradient(circle at 20% 80%, purple 0%, transparent 50%)',
              'radial-gradient(circle at 80% 20%, indigo 0%, transparent 50%)',
              'radial-gradient(circle at 20% 80%, purple 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Why <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">MBYC</span>
          </h2>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
            Experience yachting redefined through innovation and luxury
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative"
            >
              <motion.div
                className="relative h-full p-8 rounded-2xl bg-gradient-to-b from-gray-900/80 to-gray-900/40 backdrop-blur-xl border border-white/10 overflow-hidden"
                animate={{
                  rotateY: hoveredCard === index ? 5 : 0,
                  z: hoveredCard === index ? 50 : 0,
                }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              >
                {/* Glow Effect */}
                <motion.div
                  className={`absolute inset-0 bg-gradient-to-r ${exp.gradient} opacity-0 blur-xl`}
                  animate={{ opacity: hoveredCard === index ? 0.3 : 0 }}
                  transition={{ duration: 0.3 }}
                />
                
                {/* Icon */}
                <motion.div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${exp.gradient} p-5 mb-6`}
                  animate={{
                    scale: hoveredCard === index ? 1.1 : 1,
                    rotate: hoveredCard === index ? 360 : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <exp.icon className="w-full h-full text-white" />
                </motion.div>
                
                <h3 className="text-3xl font-bold text-white mb-4">{exp.title}</h3>
                <p className="text-gray-400 text-lg">{exp.description}</p>
                
                {/* Interactive Particles */}
                <AnimatePresence>
                  {hoveredCard === index && (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-white/50 rounded-full"
                          initial={{
                            x: Math.random() * 200 - 100,
                            y: Math.random() * 200 - 100,
                            scale: 0,
                          }}
                          animate={{
                            x: Math.random() * 400 - 200,
                            y: Math.random() * 400 - 200,
                            scale: [0, 1, 0],
                          }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 2, delay: i * 0.1 }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 2: Revolutionary Fleet Showcase with Parallax
function FleetShowcase() {
  const { scrollY } = useScroll();
  const yachts = [
    { name: "Azure Dream", size: "120ft", image: "/api/media/pexels_rachel_34598_1750641586089_1129454299.jpg" },
    { name: "Midnight Pearl", size: "95ft", image: "/api/media/pexels_oliver_1750641749302_1136652598.jpg" },
    { name: "Royal Fortune", size: "150ft", image: "/api/media/pexels_rachel_42091_1750641619362_1213906641.jpg" },
  ];
  
  return (
    <section className="relative py-32 overflow-hidden bg-black">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Our <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Fleet</span>
          </h2>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
            40+ luxury yachts at your command
          </p>
        </motion.div>
        
        <div className="relative h-[600px]">
          {yachts.map((yacht, index) => (
            <motion.div
              key={index}
              className="absolute w-full h-[400px]"
              style={{
                top: `${index * 120}px`,
                y: useTransform(scrollY, [0, 1000], [0, -index * 50]),
                zIndex: yachts.length - index,
              }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="relative h-full rounded-3xl overflow-hidden group cursor-pointer"
              >
                <img 
                  src={yacht.image} 
                  alt={yacht.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-10">
                  <h3 className="text-4xl font-bold text-white mb-2">{yacht.name}</h3>
                  <p className="text-xl text-gray-300">{yacht.size} Luxury Yacht</p>
                </div>
                <motion.div
                  className="absolute inset-0 bg-purple-600/20"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-32"
        >
          <Link href="/fleet">
            <motion.button
              className="px-12 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-xl font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Explore Full Fleet
              <ArrowRight className="inline ml-3 w-6 h-6" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Section 3: Membership Tiers with 3D Flip Cards
function MembershipSection() {
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  
  const tiers = [
    {
      name: "Silver",
      price: "$5,000",
      perks: ["40ft Yachts", "Weekend Access", "Basic Concierge"],
      gradient: "from-gray-600 to-gray-400",
    },
    {
      name: "Gold",
      price: "$10,000",
      perks: ["70ft Yachts", "Anytime Access", "Premium Concierge"],
      gradient: "from-yellow-600 to-yellow-400",
      featured: true,
    },
    {
      name: "Platinum",
      price: "$25,000",
      perks: ["All Yachts", "Priority Booking", "White Glove Service"],
      gradient: "from-purple-600 to-indigo-600",
    },
  ];
  
  return (
    <section className="relative py-32 bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-bold text-white mb-6"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Membership <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Tiers</span>
          </h2>
          <p className="text-2xl text-gray-400 max-w-3xl mx-auto">
            Choose the perfect membership for your lifestyle
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative h-[500px]"
              style={{ perspective: 1000 }}
            >
              <motion.div
                className="relative w-full h-full"
                animate={{ rotateY: flippedCard === index ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front of card */}
                <div
                  className={`absolute inset-0 rounded-3xl p-8 ${
                    tier.featured ? 'bg-gradient-to-b from-gray-800 to-gray-900' : 'bg-gray-900'
                  } border border-gray-800 backface-hidden`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {tier.featured && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                        MOST POPULAR
                      </span>
                    </div>
                  )}
                  
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${tier.gradient} mx-auto mb-6`} />
                  
                  <h3 className="text-3xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-5xl font-bold text-white mb-8">
                    {tier.price}<span className="text-xl text-gray-400">/month</span>
                  </p>
                  
                  <ul className="space-y-4 mb-8">
                    {tier.perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-purple-400" />
                        <span className="text-gray-300">{perk}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <motion.button
                    className={`w-full py-4 rounded-full font-semibold text-white bg-gradient-to-r ${tier.gradient}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFlippedCard(index)}
                  >
                    Learn More
                  </motion.button>
                </div>
                
                {/* Back of card */}
                <div
                  className="absolute inset-0 rounded-3xl p-8 bg-gradient-to-b from-purple-900/20 to-indigo-900/20 backdrop-blur-xl border border-purple-500/30"
                  style={{ 
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)"
                  }}
                >
                  <h3 className="text-3xl font-bold text-white mb-6">Full Benefits</h3>
                  <p className="text-gray-300 mb-6">
                    Experience the ultimate in luxury yachting with {tier.name} membership.
                  </p>
                  <ul className="space-y-3 text-gray-300 mb-8">
                    <li>• Unlimited bookings per month</li>
                    <li>• Access to exclusive events</li>
                    <li>• Personal yacht consultant</li>
                    <li>• Complimentary catering</li>
                  </ul>
                  <motion.button
                    className="w-full py-4 rounded-full font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFlippedCard(null)}
                  >
                    Back
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Section 4: Stats Section with Counter Animation
function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const stats = [
    { value: 40, suffix: "+", label: "Luxury Yachts" },
    { value: 2500, suffix: "+", label: "Happy Members" },
    { value: 98, suffix: "%", label: "Satisfaction Rate" },
    { value: 24, suffix: "/7", label: "Concierge Service" },
  ];
  
  return (
    <section ref={ref} className="relative py-32 bg-black overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-indigo-900/10" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-6xl md:text-7xl font-bold text-white mb-2">
                {isVisible && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Counter from={0} to={stat.value} />
                    <span className="text-purple-400">{stat.suffix}</span>
                  </motion.span>
                )}
              </div>
              <p className="text-xl text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Counter component for stats animation
function Counter({ from, to }: { from: number; to: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    
    const controls = animate(from, to, {
      duration: 2,
      onUpdate(value) {
        node.textContent = Math.round(value).toString();
      },
    });
    
    return () => controls.stop();
  }, [from, to]);
  
  return <span ref={nodeRef} />;
}

// Section 5: CTA Section with Video Background
function CTASection() {
  const { data: heroVideo } = useQuery({
    queryKey: ['/api/media/hero/active'],
  });
  
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        {heroVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={(heroVideo as any).url} type={(heroVideo as any).mimetype} />
          </video>
        )}
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-6xl md:text-8xl font-bold text-white mb-8"
              style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>
            Ready to Set <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Sail?</span>
          </h2>
          <p className="text-2xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join Miami Beach Yacht Club today and experience luxury like never before
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/plans-pricing">
              <motion.button
                className="px-12 py-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-xl font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Membership
              </motion.button>
            </Link>
            <Link href="/book-tour">
              <motion.button
                className="px-12 py-6 border-2 border-white/30 text-white rounded-full text-xl font-semibold backdrop-blur-sm"
                whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.8)" }}
                whileTap={{ scale: 0.95 }}
              >
                Schedule Tour
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Choose Your Membership",
      description: "Select from Bronze, Silver, Gold, or Platinum tiers based on your yacht preferences",
      icon: Compass,
    },
    {
      number: "02",
      title: "Book Your Experience",
      description: "Use our app to instantly reserve any available yacht in our fleet",
      icon: Calendar,
    },
    {
      number: "03",
      title: "Enjoy Luxury Service",
      description: "Arrive at the marina and let our crew handle everything else",
      icon: Sparkles,
    },
  ];

  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            How It Works
          </h2>
          <p className="text-xl text-gray-400">Simple steps to extraordinary experiences</p>
        </motion.div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>
                <step.icon className="w-12 h-12 text-purple-400 mb-6 mt-4" />
                <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Fleet Section
function FleetSection() {
  const tiers = [
    {
      name: "Bronze",
      price: "$2,500",
      period: "per month",
      features: [
        "Access to yachts up to 40ft",
        "4 bookings per month",
        "Basic concierge service",
        "Member events access",
      ],
      gradient: "from-orange-600 to-amber-600",
    },
    {
      name: "Silver",
      price: "$5,000",
      period: "per month",
      features: [
        "Access to yachts up to 55ft",
        "8 bookings per month",
        "Priority concierge service",
        "Guest privileges (2 per booking)",
        "Exclusive member events",
      ],
      gradient: "from-gray-400 to-gray-600",
      popular: true,
    },
    {
      name: "Gold",
      price: "$10,000",
      period: "per month",
      features: [
        "Access to yachts up to 70ft",
        "Unlimited bookings",
        "24/7 VIP concierge",
        "Guest privileges (4 per booking)",
        "Private events & networking",
      ],
      gradient: "from-yellow-500 to-amber-500",
    },
    {
      name: "Platinum",
      price: "Custom",
      period: "pricing",
      features: [
        "Access to entire fleet",
        "Unlimited bookings",
        "Dedicated account manager",
        "Unlimited guest privileges",
        "Custom experiences",
        "International destinations",
      ],
      gradient: "from-purple-600 to-indigo-600",
    },
  ];

  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/5 to-black" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Membership Tiers
          </h2>
          <p className="text-xl text-gray-400">Choose the perfect level of luxury for your lifestyle</p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative ${tier.popular ? 'lg:-mt-8' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <div className={`bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 border ${tier.popular ? 'border-purple-500/50' : 'border-white/10'} hover:border-purple-500/50 transition-all h-full flex flex-col`}>
                <div className={`w-full h-2 bg-gradient-to-r ${tier.gradient} rounded-full mb-6`} />
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-gray-400 ml-2">{tier.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/auth">
                  <Button className={`w-full bg-gradient-to-r ${tier.gradient} text-white hover:opacity-90 transition-opacity`}>
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Fleet Preview Section
function FleetPreview() {
  const { data: yachts } = useQuery({
    queryKey: ['/api/yachts'],
  });

  const featuredYachts = yachts?.slice(0, 3) || [];

  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Our Premium Fleet
          </h2>
          <p className="text-xl text-gray-400 mb-8">Experience the finest yachts in Miami</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {featuredYachts.map((yacht: any, index: number) => (
            <motion.div
              key={yacht.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl">
                <img 
                  src={yacht.images?.[0] || '/api/media/pexels-mali-42091_1750537294323.jpg'}
                  alt={yacht.name}
                  className="w-full h-[300px] object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">{yacht.name}</h3>
                  <p className="text-gray-300">{yacht.length}ft • {yacht.capacity} guests</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/fleet">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
            >
              View Entire Fleet
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Services Section
function ServicesSection() {
  const services = [
    {
      icon: Users,
      title: "Professional Crew",
      description: "Experienced captains and crew for safe, luxurious journeys",
    },
    {
      icon: Shield,
      title: "Full Insurance",
      description: "Complete coverage for peace of mind on every trip",
    },
    {
      icon: Sparkles,
      title: "Concierge Service",
      description: "24/7 support for bookings, catering, and special requests",
    },
    {
      icon: Award,
      title: "Premium Amenities",
      description: "Water sports equipment, entertainment systems, and more",
    },
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-purple-900/10 to-black">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Premium Services
          </h2>
          <p className="text-xl text-gray-400">Everything you need for the perfect yacht experience</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <service.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-gray-400">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Events Section
function EventsSection() {
  const events = [
    {
      title: "Sunset Gala",
      date: "Every Saturday",
      image: "/api/media/pexels-goumbik-296278_1750537277229.jpg",
    },
    {
      title: "Wine & Yacht Tasting",
      date: "Monthly",
      image: "/api/media/pexels-mikebirdy-144634_1750537277230.jpg",
    },
    {
      title: "Regatta Racing",
      date: "Quarterly",
      image: "/api/media/pexels-pixabay-163236_1750537277230.jpg",
    },
  ];

  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Exclusive Events
          </h2>
          <p className="text-xl text-gray-400">Join our vibrant community of yacht enthusiasts</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-2xl">
                <img 
                  src={event.image}
                  alt={event.title}
                  className="w-full h-[250px] object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{event.title}</h3>
                  <p className="text-gray-300">{event.date}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    {
      name: "Michael Chen",
      role: "Platinum Member",
      content: "MBYC has completely transformed how I experience yachting. The convenience and luxury are unmatched.",
      rating: 5,
    },
    {
      name: "Sarah Williams",
      role: "Gold Member",
      content: "The variety of yachts and the professional crew make every trip memorable. Worth every penny!",
      rating: 5,
    },
    {
      name: "David Rodriguez",
      role: "Silver Member",
      content: "From booking to docking, the experience is seamless. The concierge service is exceptional.",
      rating: 5,
    },
  ];

  return (
    <section className="py-32 bg-gradient-to-b from-black to-purple-900/10">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Member Stories
          </h2>
          <p className="text-xl text-gray-400">Hear from our satisfied members</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 italic">"{testimonial.content}"</p>
              <div>
                <p className="text-white font-semibold">{testimonial.name}</p>
                <p className="text-purple-400">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Team Section
function TeamSection() {
  const team = [
    {
      name: "Captain James Morrison",
      role: "Head of Fleet Operations",
      image: "/api/media/pexels-mali-42092_1750537277229.jpg",
    },
    {
      name: "Elena Rodriguez",
      role: "Member Experience Director",
      image: "/api/media/pexels-goumbik-296278_1750537277229.jpg",
    },
    {
      name: "Michael Park",
      role: "Chief Concierge",
      image: "/api/media/pexels-pixabay-163236_1750537277230.jpg",
    },
  ];

  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-4"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Leadership Team
          </h2>
          <p className="text-xl text-gray-400">Meet the experts behind your perfect yacht experience</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="relative w-48 h-48 mx-auto mb-6">
                <img 
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover rounded-full"
                />
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/50" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
              <p className="text-purple-400">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Partners Section
function PartnersSection() {
  const partners = [
    "Azimut Yachts", "Sunseeker", "Princess Yachts", 
    "Ferretti", "Pershing", "Riva"
  ];

  return (
    <section className="py-20 bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-400 mb-8">Trusted by the world's leading yacht manufacturers</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {partners.map((partner, index) => (
              <motion.div
                key={partner}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-gray-500 text-lg font-semibold hover:text-white transition-colors"
              >
                {partner}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Secondary CTA Section
function SecondaryCTASection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-purple-900/30" />
        {/* Animated particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * 400,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * 400,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Anchor className="w-20 h-20 text-purple-400 mx-auto mb-8" />
          <h2 className="text-5xl md:text-7xl font-bold text-white mb-6"
            style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
          >
            Ready to Set Sail?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join Miami Beach Yacht Club today and discover a new way to experience luxury on the water.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 text-lg px-8 py-6"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button 
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm text-lg px-8 py-6"
              >
                Contact Sales
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer Section
function FooterSection() {
  return (
    <footer className="py-20 bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <img 
              src="/api/media/MBYC-LOGO-WHITE_1751029522037.png" 
              alt="MBYC" 
              className="w-32 h-32 mb-4"
            />
            <p className="text-gray-400">
              Where luxury meets the ocean. Experience yachting redefined.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/fleet" className="text-gray-400 hover:text-white transition-colors">Our Fleet</Link></li>
              <li><Link href="/events" className="text-gray-400 hover:text-white transition-colors">Events</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Membership</Link></li>
              <li><Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/invest" className="text-gray-400 hover:text-white transition-colors">Investors</Link></li>
              <li><Link href="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/press" className="text-gray-400 hover:text-white transition-colors">Press</Link></li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-400">
                <Phone className="w-4 h-4" />
                <span>+1 (305) 555-MBYC</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail className="w-4 h-4" />
                <span>hello@mbyc.com</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Miami Beach Marina</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            © 2025 Miami Beach Yacht Club. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page Component
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <HeroSection />
      <ExperienceSection />
      <FleetShowcase />
      <MembershipSection />
      <StatsSection />
      <CTASection />
      <HowItWorksSection />
      <ServicesSection />
      <FleetSection />
      <EventsSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  );
}