import React from 'react';
import { motion } from 'framer-motion';
import { Waves, Wrench, Calendar } from 'lucide-react';

interface BottomNavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function BottomNavigation({ currentView, setCurrentView }: BottomNavigationProps) {
  const navItems = [
    { id: 'yachts', icon: Waves, label: 'Yachts' },
    { id: 'services', icon: Wrench, label: 'Services' },
    { id: 'events', icon: Calendar, label: 'Events' }
  ];

  return (
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
            const isActive = currentView === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                <Icon size={24} className="mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
                
                {isActive && (
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
  );
}