import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';

interface WebsiteLayoutProps {
  children: React.ReactNode;
}

export default function WebsiteLayout({ children }: WebsiteLayoutProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { path: '/', label: 'Home' },
    { path: '/fleet', label: 'Fleet' },
    { path: '/plans', label: 'Plans & Pricing' },
    { path: '/events', label: 'Events' },
    { path: '/faq', label: 'FAQ' },
    { path: '/contact', label: 'Contact' }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation - Apple-style slim navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-xl' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="/api/media/MBYC-LOGO-WHITE_1750978675231.png" 
                alt="MBYC" 
                className="h-10 w-10 filter brightness-0 invert"
              />
              <span className="text-white text-sm font-light tracking-wider hidden sm:block">
                MIAMI BEACH YACHT CLUB
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`text-sm font-light transition-all duration-300 relative group ${
                    location === item.path 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                  <span className={`absolute -bottom-1 left-0 h-px bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ${
                    location === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>
              ))}
              
              {/* CTA Buttons */}
              <div className="flex items-center space-x-4">
                <a 
                  href="tel:+13055551234" 
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Call us"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <Link 
                  href="/auth"
                  className="text-sm font-light text-gray-400 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/plans"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-full hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Apply Now
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden text-white p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-black z-40 lg:hidden"
          >
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              {menuItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-2xl font-light transition-colors ${
                    location === item.path 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link 
                href="/auth"
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-light text-gray-400 hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/website/plans"
                onClick={() => setIsMenuOpen(false)}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xl font-medium rounded-full"
              >
                Apply Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <img 
                src="/api/media/MBYC-LOGO-WHITE_1750978675231.png" 
                alt="MBYC" 
                className="h-12 w-12 mb-4 filter brightness-0 invert"
              />
              <p className="text-gray-400 text-sm">
                Experience luxury yachting at its finest with Miami Beach Yacht Club.
              </p>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.path}>
                    <Link 
                      href={item.path}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>300 Alton Rd</li>
                <li>Miami Beach, FL 33139</li>
                <li className="pt-2">
                  <a href="tel:+13055551234" className="hover:text-white transition-colors">
                    +1 (305) 555-1234
                  </a>
                </li>
                <li>
                  <a href="mailto:info@miamibeachyachtclub.com" className="hover:text-white transition-colors">
                    info@miamibeachyachtclub.com
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    Membership Agreement
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>&copy; 2024 Miami Beach Yacht Club. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}