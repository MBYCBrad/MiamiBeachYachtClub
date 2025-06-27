import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleAuthClick = () => {
    if (isAuthenticated && user) {
      // Route to appropriate dashboard based on role
      if (user.role === "admin") {
        window.location.href = '/admin';
      } else if (user.role === "staff") {
        window.location.href = '/staff-portal';
      } else if (user.role === "yacht_owner") {
        window.location.href = '/yacht-owner';
      } else if (user.role === "service_provider") {
        window.location.href = '/service-provider';
      } else if (user.role === "member") {
        window.location.href = '/member';
      }
    } else {
      window.location.href = '/auth';
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  const navItems = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Plans & Pricing", href: "/pricing" },
    { label: "Events", href: "/events" },
    { label: "Services", href: "/services" },
    { label: "Fleet", href: "/fleet" },
    { label: "Book a Private Tour", href: "/book-tour" },
    { label: "FAQ", href: "/faq" },
    { label: "Invest", href: "/invest" },
    { label: "Contact Us", href: "/contact" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md">
      {/* White edge at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img 
                src="/api/media/MBYC-LOGO-WHITE_1751029522037.png" 
                alt="MBYC" 
                className="w-12 h-12 object-contain animate-subtle-glow" 
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
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white font-medium">{user.username}</span>
                  <span className="text-xs text-purple-300 uppercase px-2 py-1 bg-purple-500/20 rounded-full">
                    {user.role}
                  </span>
                </div>
                <Button
                  onClick={handleAuthClick}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  Dashboard
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
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
            
            <div className="px-6 py-4 space-y-3">
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
                  <div className="flex space-x-2">
                    <button
                      onClick={handleAuthClick}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-center"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2.5 border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-white rounded-lg transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
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