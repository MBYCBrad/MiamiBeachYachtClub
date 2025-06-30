import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Anchor, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface MarketingHeaderProps {
  onApplyClick?: () => void;
}

export function MarketingHeader({ onApplyClick }: MarketingHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, navigate] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Fleet', href: '/fleet' },
    { name: 'Services', href: '/services' },
    { name: 'Events', href: '/events' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Invest', href: '/invest' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    setIsMenuOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/95 backdrop-blur-lg border-b border-purple-500/20' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleNavigation('/')}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                <img 
                  src="/api/media/MBYC-LOGO-WHITE_1750553590720.png" 
                  alt="MBYC Logo" 
                  className="w-8 h-8"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-white"
                  style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
                >
                  Miami Beach Yacht Club
                </h1>
                <p className="text-xs text-purple-400">Luxury Yacht Membership</p>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navigationItems.map((item) => (
                <motion.button
                  key={item.name}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleNavigation(item.href)}
                  className={`text-sm font-medium transition-colors ${
                    location === item.href
                      ? 'text-purple-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {item.name}
                </motion.button>
              ))}
            </nav>

            {/* Contact Info & CTA */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <a href="tel:+1-305-555-0199" className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                  <Phone className="w-4 h-4" />
                  (305) 555-0199
                </a>
                <a href="mailto:info@miamibeachyachtclub.com" className="flex items-center gap-1 hover:text-purple-400 transition-colors">
                  <Mail className="w-4 h-4" />
                  info@mbyc.com
                </a>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={onApplyClick || (() => handleNavigation('/book-tour'))}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold px-6 py-2 rounded-full transition-all"
                >
                  Apply Now
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-purple-400 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-lg" />
            <div className="absolute right-0 top-0 h-full w-80 bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-xl border-l border-purple-500/20">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <img 
                        src="/api/media/MBYC-LOGO-WHITE_1750553590720.png" 
                        alt="MBYC Logo" 
                        className="w-6 h-6"
                      />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">MBYC</h2>
                      <p className="text-xs text-purple-400">Luxury Yacht Club</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-white hover:text-purple-400 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 p-6">
                  <div className="space-y-4">
                    {navigationItems.map((item, index) => (
                      <motion.button
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ x: 10 }}
                        onClick={() => handleNavigation(item.href)}
                        className={`block w-full text-left px-4 py-3 rounded-lg transition-all ${
                          location === item.href
                            ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                            : 'text-gray-300 hover:bg-purple-600/10 hover:text-white'
                        }`}
                      >
                        {item.name}
                      </motion.button>
                    ))}
                  </div>
                </nav>

                {/* Mobile Contact & CTA */}
                <div className="p-6 border-t border-purple-500/20">
                  <div className="space-y-4 mb-6">
                    <a href="tel:+1-305-555-0199" className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors">
                      <Phone className="w-5 h-5" />
                      <span>(305) 555-0199</span>
                    </a>
                    <a href="mailto:info@miamibeachyachtclub.com" className="flex items-center gap-3 text-gray-300 hover:text-purple-400 transition-colors">
                      <Mail className="w-5 h-5" />
                      <span>info@mbyc.com</span>
                    </a>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={onApplyClick || (() => handleNavigation('/book-tour'))}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-full transition-all"
                    >
                      Apply for Membership
                    </Button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}