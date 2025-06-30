import React from 'react';
import { motion } from 'framer-motion';
import { Anchor, Phone, Mail, MapPin, Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { useLocation } from 'wouter';

export function MarketingFooter() {
  const [location, navigate] = useLocation();

  const quickLinks = [
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Fleet', href: '/fleet' },
    { name: 'Services', href: '/services' },
    { name: 'Events', href: '/events' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
  ];

  const membershipTiers = [
    { name: 'Silver Membership', href: '/pricing#silver' },
    { name: 'Gold Membership', href: '/pricing#gold' },
    { name: 'Platinum Membership', href: '/pricing#platinum' },
    { name: 'Private Tour', href: '/book-tour' },
  ];

  const legal = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Member Agreement', href: '/member-agreement' },
    { name: 'Cookie Policy', href: '/cookies' },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com/miamibeachyachtclub', label: 'Instagram' },
    { icon: Facebook, href: 'https://facebook.com/miamibeachyachtclub', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com/mbyc_miami', label: 'Twitter' },
    { icon: Youtube, href: 'https://youtube.com/miamibeachyachtclub', label: 'YouTube' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-black via-purple-900/5 to-black border-t border-purple-500/20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 md:grid-cols-3 sm:grid-cols-2 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <img 
                    src="/api/media/MBYC-LOGO-WHITE_1750553590720.png" 
                    alt="MBYC Logo" 
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white"
                    style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}
                  >
                    Miami Beach Yacht Club
                  </h3>
                  <p className="text-sm text-purple-400">Luxury Yacht Membership</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Experience the pinnacle of luxury yachting in Miami Beach. Join our exclusive members-only club and gain access to our premium fleet of luxury yachts.
              </p>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span>1 Washington Ave, Miami Beach, FL 33139</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-purple-400" />
                <a href="tel:+1-305-555-0199" className="hover:text-purple-400 transition-colors">
                  (305) 555-0199
                </a>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-purple-400" />
                <a href="mailto:info@miamibeachyachtclub.com" className="hover:text-purple-400 transition-colors">
                  info@mbyc.com
                </a>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <button
                      onClick={() => handleNavigation(link.href)}
                      className="text-gray-400 hover:text-purple-400 transition-colors text-left"
                    >
                      {link.name}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Membership */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-white mb-6">Membership</h4>
              <ul className="space-y-3">
                {membershipTiers.map((tier) => (
                  <li key={tier.name}>
                    <button
                      onClick={() => handleNavigation(tier.href)}
                      className="text-gray-400 hover:text-purple-400 transition-colors text-left"
                    >
                      {tier.name}
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Legal & Social */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-semibold text-white mb-6">Legal</h4>
              <ul className="space-y-3 mb-8">
                {legal.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => handleNavigation(item.href)}
                      className="text-gray-400 hover:text-purple-400 transition-colors text-left"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Social Links */}
              <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
              <div className="flex gap-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white hover:from-purple-700 hover:to-indigo-700 transition-all"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="border-t border-purple-500/20 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2025 Miami Beach Yacht Club. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <button
                onClick={() => handleNavigation('/invest')}
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Yacht Owners
              </button>
              <button
                onClick={() => handleNavigation('/contact')}
                className="text-gray-400 hover:text-purple-400 transition-colors"
              >
                Support
              </button>
              <span className="text-gray-600">|</span>
              <span className="text-purple-400">Miami Beach, FL</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}