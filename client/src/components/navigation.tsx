import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "How It Works", href: "/how-it-works" },
    { label: "Plans & Pricing", href: "/pricing" },
    { label: "Events", href: "/events" },
    { label: "Fleet", href: "/fleet" },
    { label: "Book a Private Tour", href: "/book-tour" },
    { label: "FAQ", href: "/faq" },
    { label: "Invest", href: "/invest" },
    { label: "Contact Us", href: "/contact" }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <img src="/api/media/MBYC-LOGO-WHITE_1750553590720.png" alt="MBYC" className="w-12 h-12" />
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

          {/* Login Button */}
          <div className="hidden lg:block">
            <Link href="/auth">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                LOGIN
              </Button>
            </Link>
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
            className="lg:hidden overflow-hidden bg-black/95 backdrop-blur-md"
          >
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
              <Link href="/auth">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white mt-4">
                  LOGIN
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}