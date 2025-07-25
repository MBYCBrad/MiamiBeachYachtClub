import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  const handleAuthClick = () => {
    if (isAuthenticated && user) {
      // Route to appropriate dashboard based on role
      if (user.role === "admin") {
        setLocation('/admin');
      } else if (user.role === "staff") {
        setLocation('/staff-portal');
      } else if (user.role === "yacht_owner") {
        setLocation('/yacht-owner');
      } else if (user.role === "service_provider") {
        setLocation('/service-provider');
      } else if (user.role === "member") {
        setLocation('/member');
      }
    } else {
      setLocation('/auth');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
      setLocation('/');
    }
  };

  const navItems = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Plans & Pricing", href: "/pricing" },
    { label: "Fleet", href: "/fleet" },
    { label: "Events", href: "/events" },
    { label: "Services", href: "/services" },
    { label: "Book a Private Tour", href: "/book-tour" },
    { label: "FAQ", href: "/faq" },
    { label: "Partner", href: "/partner" },
    { label: "Contact Us", href: "/contact" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer">
              <img 
                src="/api/media/MBYC-LOGO-WHITE_1751029522037.png" 
                alt="MBYC" 
                className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 object-contain animate-subtle-glow" 
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href}>
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer inline-block"
                >
                  {item.label}
                </motion.span>
              </Link>
            ))}
          </div>

          {/* Authentication Button */}
          <div className="hidden lg:block">
            {isLoading ? (
              <Button 
                disabled
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
              >
                <User className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </Button>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-2 lg:space-x-3">
                <div className="flex items-center space-x-2 px-2 py-1 lg:px-3 lg:py-2">
                  <span className="text-xs lg:text-sm text-white font-medium">{user.username}</span>
                </div>
                <Button
                  onClick={handleAuthClick}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-2 lg:px-4 lg:py-2 text-sm"
                >
                  Dashboard
                </Button>
              </div>
            ) : (
              <Button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                onClick={handleAuthClick}
              >
                LOGIN
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-white p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="lg:hidden overflow-hidden bg-black/95 backdrop-blur-md relative"
          >
            {/* White edge at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
            
            <div className="px-4 sm:px-6 py-4 space-y-3">
              {navItems.map((item) => (
                <Link key={item.label} href={item.href}>
                  <div
                    className="block text-white/80 hover:text-white py-2 transition-colors cursor-pointer"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </div>
                </Link>
              ))}
              {isLoading ? (
                <div className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white mt-4 px-6 py-2.5 rounded-lg font-medium text-center flex items-center justify-center space-x-2">
                  <User className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : isAuthenticated && user ? (
                <div className="mt-4 space-y-3">
                  <div className="bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-4 py-3">
                    <div className="flex items-center space-x-2 text-white">
                      <User className="w-4 h-4 text-purple-400" />
                      <span className="font-medium">{user.username}</span>
                      <span className="text-xs text-purple-300 uppercase px-2 py-1 bg-purple-500/20 rounded-full">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleAuthClick}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-center"
                  >
                    Dashboard
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white mt-4 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer text-center"
                >
                  LOGIN
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}