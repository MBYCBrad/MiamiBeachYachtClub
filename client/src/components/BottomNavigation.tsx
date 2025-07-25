import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Bell, LogOut, Calendar, MessageCircle, Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CustomerServiceModal from '@/components/CustomerServiceModal';
import NotificationDropdown from '@/components/NotificationDropdown';
import { 
  Explore3DIcon, 
  Trips3DIcon, 
  Services3DIcon,
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
  const [isCustomerServiceOpen, setIsCustomerServiceOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user, logoutMutation } = useAuth();

  // Get unread notification count for badge
  const { data: notifications = [] } = useQuery({
    queryKey: user?.role === 'staff' ? ['/api/staff/notifications'] : ['/api/notifications'],
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: 60000,
  });

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n: any) => !n.read).length : 0;
  
  // Swipe gesture states
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const navItems = [
    { id: 'explore', icon: Explore3DIcon, label: 'Explore' },
    { id: 'trips', icon: Trips3DIcon, label: 'Trips' },
    { id: 'services', icon: Services3DIcon, label: 'Services' },
    { id: 'favorites', icon: Favorites3DIcon, label: 'Favorites' },
    { id: 'messages', icon: Messages3DIcon, label: 'Messages' },
    { id: 'menu', icon: Menu3DIcon, label: '' }
  ];

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setCurrentX(touch.clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setCurrentX(touch.clientX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const deltaX = currentX - startX;
    const threshold = 50; // Minimum swipe distance
    
    if (Math.abs(deltaX) > threshold) {
      const currentIndex = navItems.findIndex(item => item.id === currentView);
      const navigationItems = navItems.filter(item => item.id !== 'menu'); // Exclude menu from navigation
      const currentNavIndex = navigationItems.findIndex(item => item.id === currentView);
      
      if (deltaX > 0 && currentNavIndex > 0) {
        // Swipe right - go to previous tab
        setCurrentView(navigationItems[currentNavIndex - 1].id);
      } else if (deltaX < 0 && currentNavIndex < navigationItems.length - 1) {
        // Swipe left - go to next tab
        setCurrentView(navigationItems[currentNavIndex + 1].id);
      }
    }
    
    setStartX(0);
    setCurrentX(0);
  };

  const menuItems = [
    { id: 'profile', icon: User, label: 'Profile', badge: null },
    { id: 'events', icon: Calendar, label: 'My Events', badge: null },
    { id: 'services', icon: Star, label: 'My Services', badge: null },
    { id: 'notifications', icon: Bell, label: 'Notifications', badge: unreadCount, action: () => setIsNotificationOpen(true) },
    { id: 'messages', icon: MessageCircle, label: 'Messages', badge: null, action: () => setCurrentView('messages') },
  ];

  const handleNavClick = (itemId: string) => {
    if (itemId === 'menu') {
      setIsMenuOpen(!isMenuOpen);
    } else {
      setCurrentView(itemId);
      setIsMenuOpen(false);
    }
  };

  const handleMenuItemClick = (itemId: string, action?: () => void) => {
    if (action) {
      action();
    } else {
      setCurrentView(itemId);
    }
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
        className={`fixed bottom-0 left-0 right-0 z-40 glass-dark border-t border-white/10 rounded-t-2xl transition-transform duration-200 ${
          isDragging ? 'swipe-active' : ''
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: isDragging ? `translateX(${(currentX - startX) * 0.1}px)` : 'translateX(0px)'
        }}
      >
        {/* Swipe Direction Indicators */}
        {isDragging && (
          <>
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-purple-400 opacity-60">
              ←
            </div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-400 opacity-60">
              →
            </div>
          </>
        )}
        
        <div className="flex justify-around items-center w-full px-4 py-2 pb-safe">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = item.id === 'menu' ? isMenuOpen : currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center p-2 transition-all duration-300 touch-friendly ${
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 h-full w-80 bg-black/95 backdrop-blur-2xl border-l border-white/10 z-[60]"
            >
              {/* Menu Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-white" />
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
                      onClick={() => handleMenuItemClick(item.id, item.action)}
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
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                          {item.badge}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Logout Button */}
              <div className="p-6 border-t border-white/10">
                <Button
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium border-none rounded-xl py-3 shadow-lg"
                >
                  <LogOut size={18} className="mr-2" />
                  {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Customer Service Modal */}
      <CustomerServiceModal 
        isOpen={isCustomerServiceOpen} 
        onClose={() => setIsCustomerServiceOpen(false)} 
      />

      {/* Notification Dropdown */}
      <NotificationDropdown 
        isOpen={isNotificationOpen} 
        onClose={() => setIsNotificationOpen(false)} 
      />
    </>
  );
}