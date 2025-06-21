import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Wrench, Calendar, Menu, X, User, MessageCircle, Bell, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

interface BottomNavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function BottomNavigation({ currentView, setCurrentView }: BottomNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const navItems = [
    { id: 'home', icon: Waves, label: 'Yachts' },
    { id: 'home', icon: Wrench, label: 'Services' },
    { id: 'home', icon: Calendar, label: 'Events' },
    { id: 'menu', icon: Menu, label: 'Menu' }
  ];

  const menuItems = [
    { id: 'profile', icon: User, label: 'Profile', badge: null },
    { id: 'messages', icon: MessageCircle, label: 'Messages', badge: 3 },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: 7 },
    { id: 'favorites', icon: Heart, label: 'Favorites', badge: null },
  ];

  const handleNavClick = (itemId: string) => {
    if (itemId === 'menu') {
      setIsMenuOpen(!isMenuOpen);
    } else {
      setCurrentView(itemId);
      setIsMenuOpen(false);
    }
  };

  const handleMenuItemClick = (itemId: string) => {
    setCurrentView(itemId);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Navigation */}
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-0 left-0 right-0 z-50 glass-dark border-t border-white/10"
      >
        <div className="flex justify-center items-center px-4 py-2 pb-safe">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === 'menu' ? isMenuOpen : currentView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    animate={{ rotate: item.id === 'menu' && isMenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon size={24} className="mb-1" />
                  </motion.div>
                  <span className="text-xs font-medium">{item.label}</span>
                  
                  {isActive && item.id !== 'menu' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 w-8 h-1 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Hamburger Menu Panel */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, y: 300 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-20 left-4 right-4 bg-gray-900/95 backdrop-blur-xl border border-gray-800 rounded-2xl z-50"
            >
              {/* Menu Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{user?.username}</h3>
                    <p className="text-gray-400 text-sm capitalize">{user?.membershipTier} Member</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-4">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleMenuItemClick(item.id)}
                      className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
                        isActive 
                          ? 'bg-purple-600/20 text-purple-400' 
                          : 'text-gray-300 hover:bg-white/5 hover:text-white'
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={20} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge && (
                        <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                          {item.badge}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Logout Button */}
              <div className="p-6 border-t border-gray-800">
                <Button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-600/30 rounded-xl py-3"
                >
                  <LogOut size={18} className="mr-2" />
                  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}