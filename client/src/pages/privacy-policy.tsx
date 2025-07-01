import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Menu, X, Phone, Mail, MapPin, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

// Navigation Component
function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <img 
                src="/api/media/MBYC-LOGO-WHITE_1750532808484.png" 
                alt="MBYC Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              MBYC
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/how-it-works" className="text-gray-300 hover:text-purple-400 transition-colors">
              How It Works
            </Link>
            <Link href="/fleet" className="text-gray-300 hover:text-purple-400 transition-colors">
              Fleet
            </Link>
            <Link href="/services" className="text-gray-300 hover:text-purple-400 transition-colors">
              Services
            </Link>
            <Link href="/events" className="text-gray-300 hover:text-purple-400 transition-colors">
              Events
            </Link>
            <Link href="/pricing" className="text-gray-300 hover:text-purple-400 transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-purple-400 transition-colors">
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-purple-400 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-800 py-4"
          >
            <div className="flex flex-col space-y-4">
              <Link href="/how-it-works" className="text-gray-300 hover:text-purple-400 transition-colors">
                How It Works
              </Link>
              <Link href="/fleet" className="text-gray-300 hover:text-purple-400 transition-colors">
                Fleet
              </Link>
              <Link href="/services" className="text-gray-300 hover:text-purple-400 transition-colors">
                Services
              </Link>
              <Link href="/events" className="text-gray-300 hover:text-purple-400 transition-colors">
                Events
              </Link>
              <Link href="/pricing" className="text-gray-300 hover:text-purple-400 transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-purple-400 transition-colors">
                Contact
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}

// Video Header Component
function VideoHeader() {
  const { data: heroVideo } = useQuery({
    queryKey: ["/api/media/hero/active"],
  });

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Video Background */}
      {heroVideo && (heroVideo as any).videoUrl && (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={(heroVideo as any).videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80"></div>
      
      {/* Bottom Blur Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/50 to-transparent backdrop-blur-sm"></div>

      {/* Header Content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-6">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-6xl md:text-8xl font-bold mb-6 tracking-tight"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif'
            }}
          >
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Privacy Policy
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed"
          >
            Your privacy and data protection are our highest priorities
          </motion.p>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap justify-center gap-6 mt-12"
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
              <Shield className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <div className="text-2xl font-bold text-white">SSL</div>
              <div className="text-sm text-gray-400">Encrypted</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold text-white">GDPR</div>
              <div className="text-sm text-gray-400">Compliant</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-sm text-gray-400">Protection</div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <VideoHeader />

      {/* Main Content */}
      <div className="relative z-10 -mt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-3xl p-8 md:p-12"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full mb-6"
              >
                <Shield className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              <p className="text-gray-400 text-lg">
                Miami Beach Yacht Club - Your Privacy Matters
              </p>
            </div>

            {/* Content */}
            <div className="prose prose-invert prose-purple max-w-none">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-8"
              >
                {/* Introduction */}
                <section>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    We take privacy issues seriously. By ensuring that you are aware of and understand the Privacy Policy, we can provide you with better service. The Miami Beach Yacht Club is referred to as "THIS SITE" in the rest of this document. Please take a moment to read the following policy to learn how we handle your personal information.
                  </p>
                </section>

                {/* Why do we collect personal information? */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    Why do we collect personal information?
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    THIS SITE collects personal information to improve the manner by which we operate, offer our products and services, communicate with you about those products and services, and provide effective, timely customer support when needed. We will never rent or sell any of the personal information we collect from you to third parties, and we do not share your personal information except as set forth in this Privacy Policy.
                  </p>
                </section>

                {/* What kind of personal information do we collect? */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    What kind of personal information do we collect?
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    This site collects personal information in a variety of ways when you interact with this site, including when you register or create an account with THIS SITE; when you place an order at THIS SITE; when you use THIS SITE's products or services; when you enter promotions or sweepstakes; when you subscribe to a newsletter or desire to be added to our mailing lists for other products or services; when you correspond or otherwise interact with us; and when you provide feedback in any format.
                  </p>
                </section>

                {/* What are cookies and how do we use them? */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    What are cookies and how do we use them?
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    Cookies are small data files that write to your hard drive for record keeping purposes when you visit a website. Cookies allow THIS SITE to measure traffic activity as well as to improve your user experience, for example by remembering your passwords and viewing preferences. Like other major websites, THIS SITE uses cookies to provide you with a tailored experience when visiting THIS SITE and using our products. We treat any personal information that may be contained in cookies with the same level of confidentiality as other personal information.
                  </p>
                </section>

                {/* How do we protect your personal information? */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    How do we protect your personal information?
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    THIS SITE safeguards the security of the data you send us with physical, electronic, and managerial procedures. We urge you to take every precaution to protect your personal data when you are on the Internet. To make purchases from THIS SITE, you must use an SSL-enabled browser. THIS SITE uses industry-standard Secure Sockets Layer (SSL) encryption on web pages used to complete a purchase. This protects the confidentiality of your personal and credit card information while it is transmitted over the Internet.
                  </p>
                </section>

                {/* How and when do we disclose the information we collect? */}
                <section>
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    How and when do we disclose the information we collect?
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    THIS SITE may send personal information about you to other companies or people when we need to share your information to provide the product or service you have requested, or to provide a product or service to you. However, these companies are only permitted to use the personal information for these purposes. THIS SITE may also disclose your personal information if required to do so by law or in the good faith belief that such action is necessary to: (a) comply with law or legal process; (b) protect and defend our rights and property; (c) protect against misuse or unauthorized use of THIS SITE; or (d) protect the personal safety or property of our users or the public.
                  </p>
                </section>

                {/* Contact Information */}
                <section className="mt-12 pt-8 border-t border-gray-700">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-8 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full"></span>
                    Questions about this Privacy Policy?
                  </h2>
                  <p className="text-gray-300 leading-relaxed">
                    If you have any questions about this Privacy Policy or our practices, please contact Miami Beach Yacht Club through our website's contact form or reach out to our member services team.
                  </p>
                  <div className="mt-6">
                    <Link 
                      href="/" 
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 py-3 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Return to Home
                    </Link>
                  </div>
                </section>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              ©2025 Miami Beach Yacht Club. All Rights Reserved.
            </p>
            <div className="flex justify-center gap-6 mt-4">
              <Link href="/privacy" className="text-purple-400 text-sm font-medium">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-500 hover:text-purple-400 text-sm transition-colors">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}