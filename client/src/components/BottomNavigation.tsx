import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  MessageCircle, 
  Heart, 
  User,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface BottomNavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

const navItems = [
  {
    id: 'home',
    label: 'Explore',
    icon: Home,
    activeColor: 'text-purple-500'
  },
  {
    id: 'search',
    label: 'Search',
    icon: Search,
    activeColor: 'text-blue-500'
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    activeColor: 'text-green-500',
    hasNotification: true
  },
  {
    id: 'favorites',
    label: 'Favorites',
    icon: Heart,
    activeColor: 'text-red-500'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    activeColor: 'text-cyan-500'
  }
];

export default function BottomNavigation({ currentView, setCurrentView }: BottomNavigationProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-t border-gray-800/50"
    >
      <div className="flex items-center justify-around px-2 py-3 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className="relative flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 min-w-[60px]"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Active Background */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl border border-purple-500/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              {/* Icon Container */}
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-6 w-6 transition-all duration-300",
                    isActive 
                      ? item.activeColor
                      : "text-gray-400 group-hover:text-gray-300"
                  )}
                />
                
                {/* Notification Badge */}
                {item.hasNotification && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2"
                  >
                    <Badge className="h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center rounded-full border-2 border-black">
                      3
                    </Badge>
                  </motion.div>
                )}
              </div>
              
              {/* Label */}
              <span 
                className={cn(
                  "text-xs mt-1 transition-all duration-300 font-medium",
                  isActive 
                    ? "text-white"
                    : "text-gray-500"
                )}
              >
                {item.label}
              </span>
              
              {/* Active Indicator Dot */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 w-1 h-1 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {/* iPhone-style Home Indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 bg-gray-600 rounded-full" />
      </div>
    </motion.div>
  );
}