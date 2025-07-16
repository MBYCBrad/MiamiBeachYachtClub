import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, MessageCircle, Bell, Heart, LogOut, Calendar, Star } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

interface HamburgerMenuProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function HamburgerMenu({ currentView, setCurrentView }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const menuItems = [
    { id: 'profile', icon: User, label: 'Profile', badge: null, route: null },
    { id: 'my-events', icon: Calendar, label: 'My Events', badge: null, route: '/my-events' },
    { id: 'my-services', icon: Star, label: 'My Services', badge: null, route: '/my-services' },
    { id: 'messages', icon: MessageCircle, label: 'Messages', badge: 3, route: null },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: 7, route: null },
    { id: 'favorites', icon: Heart, label: 'Favorites', badge: null, route: null },
  ];

  const handleMenuItemClick = (itemId: string, route?: string) => {
    if (route) {
      window.location.href = route;
    } else {
      setCurrentView(itemId);
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:bg-white/10 rounded-full"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.div>
      </Button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 z-50"
            >
              {/* Menu Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-lg font-semibold">
                          {user?.username?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
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
                      onClick={() => handleMenuItemClick(item.id, item.route)}
                      className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${
                        isActive 
                          ? 'bg-purple-600/20 text-purple-400 border-r-2 border-purple-400' 
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
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
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