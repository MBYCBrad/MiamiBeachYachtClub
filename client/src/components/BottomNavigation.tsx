import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { 
  Explore3DIcon, 
  Trips3DIcon, 
  Favorites3DIcon, 
  Messages3DIcon, 
  Menu3DIcon 
} from '@/components/Animated3DNavIcons';

interface BottomNavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function BottomNavigation({ currentView, setCurrentView }: BottomNavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  const navItems = [
    { id: 'explore', icon: Explore3DIcon, label: 'Explore' },
    { id: 'trips', icon: Trips3DIcon, label: 'Trips' },
    { id: 'favorites', icon: Favorites3DIcon, label: 'Favorites' },
    { id: 'messages', icon: Messages3DIcon, label: 'Messages' },
    { id: 'menu', icon: Menu3DIcon, label: '' }
  ];

  const menuItems = [
    { id: 'profile', icon: User, label: 'Profile', badge: null },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: 7 },
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
        <div className="flex justify-around items-center w-full px-4 py-2 pb-safe">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.id === 'menu' ? isMenuOpen : currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${
                  isActive 
                    ? 'text-purple-400' 
                    : 'text-white hover:text-purple-300'
                }`}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="mb-1">
                  <IconComponent 
                    isActive={isActive} 
                    size={28}
                    className="transition-all duration-300"
                  />
                </div>
                <span className="text-xs font-medium">{item.label}</span>
                
                {isActive && item.id !== 'menu' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 w-6 h-0.5 bg-purple-400 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
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
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-xl border-l border-gray-800 z-50"
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