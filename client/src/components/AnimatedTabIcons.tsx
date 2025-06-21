import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedIconProps {
  isActive: boolean;
  size?: number;
  className?: string;
}

// 3D Yacht Icon with Animation
export const YachtIcon: React.FC<AnimatedIconProps> = ({ isActive, size = 24, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        scale: [1, 1.1, 1],
        rotateY: [0, 5, -5, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      });
    } else {
      controls.start({
        scale: 1,
        rotateY: 0,
        transition: { duration: 0.3 }
      });
    }
  }, [isActive, controls]);

  return (
    <motion.div
      animate={controls}
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      >
        {/* Yacht Hull - Main Body */}
        <defs>
          <linearGradient id="yachtHull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#e6e6fa" : "#a0a0a0"} />
            <stop offset="50%" stopColor={isActive ? "#d8d8ff" : "#888888"} />
            <stop offset="100%" stopColor={isActive ? "#c0c0ff" : "#666666"} />
          </linearGradient>
          
          <linearGradient id="yachtDeck" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#f0f8ff" : "#b0b0b0"} />
            <stop offset="100%" stopColor={isActive ? "#e0e6ff" : "#909090"} />
          </linearGradient>

          <linearGradient id="yachtSail" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#ffffff" : "#cccccc"} />
            <stop offset="100%" stopColor={isActive ? "#f5f5ff" : "#aaaaaa"} />
          </linearGradient>
        </defs>

        {/* Water Waves */}
        <motion.path
          d="M2 24 Q6 22 10 24 T18 24 T26 24 T30 24"
          stroke={isActive ? "#4dabf7" : "#999999"}
          strokeWidth="1.5"
          fill="none"
          opacity={isActive ? 0.6 : 0.3}
          animate={isActive ? {
            d: [
              "M2 24 Q6 22 10 24 T18 24 T26 24 T30 24",
              "M2 24 Q6 26 10 24 T18 24 T26 24 T30 24",
              "M2 24 Q6 22 10 24 T18 24 T26 24 T30 24"
            ]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.path
          d="M1 26 Q5 24 9 26 T17 26 T25 26 T31 26"
          stroke={isActive ? "#74c0fc" : "#aaaaaa"}
          strokeWidth="1"
          fill="none"
          opacity={isActive ? 0.4 : 0.2}
          animate={isActive ? {
            d: [
              "M1 26 Q5 24 9 26 T17 26 T25 26 T31 26",
              "M1 26 Q5 28 9 26 T17 26 T25 26 T31 26",
              "M1 26 Q5 24 9 26 T17 26 T25 26 T31 26"
            ]
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Yacht Hull */}
        <motion.path
          d="M6 20 Q8 18 12 18 L20 18 Q24 18 26 20 L24 22 L8 22 Z"
          fill="url(#yachtHull)"
          stroke={isActive ? "#9c88ff" : "#777777"}
          strokeWidth="0.5"
          animate={isActive ? {
            y: [0, -0.5, 0.5, 0]
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Yacht Deck */}
        <motion.ellipse
          cx="16"
          cy="18"
          rx="8"
          ry="2"
          fill="url(#yachtDeck)"
          stroke={isActive ? "#b19cd9" : "#888888"}
          strokeWidth="0.3"
          animate={isActive ? {
            y: [0, -0.5, 0.5, 0]
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Mast */}
        <motion.line
          x1="16"
          y1="18"
          x2="16"
          y2="6"
          stroke={isActive ? "#d6d6d6" : "#999999"}
          strokeWidth="1"
          animate={isActive ? {
            y1: [18, 17.5, 18.5, 18],
            y2: [6, 5.5, 6.5, 6]
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Sail */}
        <motion.path
          d="M16 6 Q20 8 22 12 Q20 16 16 18 Z"
          fill="url(#yachtSail)"
          stroke={isActive ? "#e0e0e0" : "#aaaaaa"}
          strokeWidth="0.5"
          animate={isActive ? {
            d: [
              "M16 6 Q20 8 22 12 Q20 16 16 18 Z",
              "M16 6 Q21 9 23 12 Q21 15 16 18 Z",
              "M16 6 Q20 8 22 12 Q20 16 16 18 Z"
            ]
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Yacht Details */}
        <motion.circle
          cx="12"
          cy="17"
          r="0.5"
          fill={isActive ? "#ff6b6b" : "#888888"}
          animate={isActive ? {
            opacity: [0.6, 1, 0.6]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <motion.circle
          cx="20"
          cy="17"
          r="0.5"
          fill={isActive ? "#4ecdc4" : "#888888"}
          animate={isActive ? {
            opacity: [1, 0.6, 1]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
      </svg>
    </motion.div>
  );
};

// 3D Services Bell Icon with Animation
export const ServicesIcon: React.FC<AnimatedIconProps> = ({ isActive, size = 24, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        scale: [1, 1.05, 1],
        rotateZ: [0, -2, 2, 0],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
      });
    } else {
      controls.start({
        scale: 1,
        rotateZ: 0,
        transition: { duration: 0.3 }
      });
    }
  }, [isActive, controls]);

  return (
    <motion.div
      animate={controls}
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      >
        <defs>
          <linearGradient id="bellBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#ffd700" : "#b8b8b8"} />
            <stop offset="50%" stopColor={isActive ? "#ffed4e" : "#a0a0a0"} />
            <stop offset="100%" stopColor={isActive ? "#ffc107" : "#888888"} />
          </linearGradient>
          
          <linearGradient id="bellBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#8d5524" : "#777777"} />
            <stop offset="100%" stopColor={isActive ? "#6f4518" : "#555555"} />
          </linearGradient>

          <radialGradient id="bellHighlight" cx="30%" cy="30%">
            <stop offset="0%" stopColor={isActive ? "#ffffff" : "#cccccc"} stopOpacity="0.8" />
            <stop offset="100%" stopColor={isActive ? "#ffffff" : "#cccccc"} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Bell Base/Stand */}
        <motion.ellipse
          cx="16"
          cy="26"
          rx="6"
          ry="1.5"
          fill="url(#bellBase)"
          animate={isActive ? {
            scaleX: [1, 1.05, 1]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bell Body */}
        <motion.path
          d="M16 8 Q10 8 8 14 Q8 18 10 22 L22 22 Q24 18 24 14 Q22 8 16 8 Z"
          fill="url(#bellBody)"
          stroke={isActive ? "#e6ac00" : "#999999"}
          strokeWidth="0.5"
          animate={isActive ? {
            d: [
              "M16 8 Q10 8 8 14 Q8 18 10 22 L22 22 Q24 18 24 14 Q22 8 16 8 Z",
              "M16 8 Q10.5 8 8.5 14 Q8.5 18 10.5 22 L21.5 22 Q23.5 18 23.5 14 Q21.5 8 16 8 Z",
              "M16 8 Q10 8 8 14 Q8 18 10 22 L22 22 Q24 18 24 14 Q22 8 16 8 Z"
            ]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bell Highlight */}
        <motion.ellipse
          cx="13"
          cy="12"
          rx="2"
          ry="3"
          fill="url(#bellHighlight)"
          animate={isActive ? {
            opacity: [0.6, 0.9, 0.6]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bell Handle/Top */}
        <motion.rect
          x="15"
          y="6"
          width="2"
          height="3"
          rx="1"
          fill={isActive ? "#b8860b" : "#888888"}
          animate={isActive ? {
            scaleY: [1, 0.9, 1]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Bell Clapper */}
        <motion.circle
          cx="16"
          cy="18"
          r="1"
          fill={isActive ? "#cd853f" : "#777777"}
          animate={isActive ? {
            x: [0, -1, 1, 0],
            y: [0, 0.5, 0.5, 0]
          } : {}}
          transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Service Stars */}
        <motion.g
          animate={isActive ? {
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            rotate: [0, 180, 360]
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M6 10 L7 12 L9 12 L7.5 13.5 L8 16 L6 14.5 L4 16 L4.5 13.5 L3 12 L5 12 Z"
            fill={isActive ? "#ff6b9d" : "#aaaaaa"}
            opacity="0.7"
          />
          <path
            d="M26 14 L27 16 L29 16 L27.5 17.5 L28 20 L26 18.5 L24 20 L24.5 17.5 L23 16 L25 16 Z"
            fill={isActive ? "#4ecdc4" : "#aaaaaa"}
            opacity="0.7"
          />
        </motion.g>
      </svg>
    </motion.div>
  );
};

// 3D Events/Experiences Icon with Animation  
export const EventsIcon: React.FC<AnimatedIconProps> = ({ isActive, size = 24, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        scale: [1, 1.1, 1],
        rotateY: [0, 10, -10, 0],
        transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
      });
    } else {
      controls.start({
        scale: 1,
        rotateY: 0,
        transition: { duration: 0.3 }
      });
    }
  }, [isActive, controls]);

  return (
    <motion.div
      animate={controls}
      className={cn("relative", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
      >
        <defs>
          <linearGradient id="balloonRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#ff6b6b" : "#999999"} />
            <stop offset="50%" stopColor={isActive ? "#ff5252" : "#888888"} />
            <stop offset="100%" stopColor={isActive ? "#f44336" : "#777777"} />
          </linearGradient>
          
          <linearGradient id="balloonBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#4ecdc4" : "#888888"} />
            <stop offset="50%" stopColor={isActive ? "#26a69a" : "#777777"} />
            <stop offset="100%" stopColor={isActive ? "#00796b" : "#666666"} />
          </linearGradient>

          <linearGradient id="balloonYellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#ffeb3b" : "#aaaaaa"} />
            <stop offset="50%" stopColor={isActive ? "#fdd835" : "#999999"} />
            <stop offset="100%" stopColor={isActive ? "#f57f17" : "#888888"} />
          </linearGradient>

          <radialGradient id="balloonHighlight" cx="25%" cy="25%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Balloon Strings */}
        <motion.line
          x1="8"
          y1="16"
          x2="10"
          y2="26"
          stroke={isActive ? "#8d6e63" : "#888888"}
          strokeWidth="0.5"
          animate={isActive ? {
            x1: [8, 7.5, 8.5, 8],
            x2: [10, 9.5, 10.5, 10]
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.line
          x1="16"
          y1="14"
          x2="16"
          y2="26"
          stroke={isActive ? "#8d6e63" : "#888888"}
          strokeWidth="0.5"
          animate={isActive ? {
            x1: [16, 15.8, 16.2, 16],
            x2: [16, 15.8, 16.2, 16]
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        
        <motion.line
          x1="24"
          y1="18"
          x2="22"
          y2="26"
          stroke={isActive ? "#8d6e63" : "#888888"}
          strokeWidth="0.5"
          animate={isActive ? {
            x1: [24, 24.5, 23.5, 24],
            x2: [22, 22.5, 21.5, 22]
          } : {}}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Red Balloon */}
        <motion.ellipse
          cx="8"
          cy="12"
          rx="3"
          ry="4"
          fill="url(#balloonRed)"
          stroke={isActive ? "#d32f2f" : "#777777"}
          strokeWidth="0.3"
          animate={isActive ? {
            cy: [12, 10, 14, 12],
            rx: [3, 3.2, 2.8, 3],
            ry: [4, 4.3, 3.7, 4]
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Blue Balloon */}
        <motion.ellipse
          cx="16"
          cy="10"
          rx="3.5"
          ry="4.5"
          fill="url(#balloonBlue)"
          stroke={isActive ? "#00695c" : "#777777"}
          strokeWidth="0.3"
          animate={isActive ? {
            cy: [10, 8, 12, 10],
            rx: [3.5, 3.8, 3.2, 3.5],
            ry: [4.5, 4.8, 4.2, 4.5]
          } : {}}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        {/* Yellow Balloon */}
        <motion.ellipse
          cx="24"
          cy="14"
          rx="3"
          ry="4"
          fill="url(#balloonYellow)"
          stroke={isActive ? "#f9a825" : "#777777"}
          strokeWidth="0.3"
          animate={isActive ? {
            cy: [14, 12, 16, 14],
            rx: [3, 3.3, 2.7, 3],
            ry: [4, 4.4, 3.6, 4]
          } : {}}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Balloon Highlights */}
        <motion.ellipse
          cx="7"
          cy="10"
          rx="0.8"
          ry="1.2"
          fill="url(#balloonHighlight)"
          animate={isActive ? {
            opacity: [0.4, 0.8, 0.4]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.ellipse
          cx="15"
          cy="8"
          rx="1"
          ry="1.5"
          fill="url(#balloonHighlight)"
          animate={isActive ? {
            opacity: [0.8, 0.4, 0.8]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        
        <motion.ellipse
          cx="23"
          cy="12"
          rx="0.8"
          ry="1.2"
          fill="url(#balloonHighlight)"
          animate={isActive ? {
            opacity: [0.6, 1, 0.6]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Sparkles/Confetti */}
        <motion.g
          animate={isActive ? {
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
            rotate: [0, 360]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", staggerChildren: 0.2 }}
        >
          <motion.circle cx="4" cy="6" r="0.5" fill={isActive ? "#ff9800" : "#aaaaaa"} />
          <motion.circle cx="28" cy="8" r="0.5" fill={isActive ? "#e91e63" : "#aaaaaa"} />
          <motion.circle cx="6" cy="22" r="0.5" fill={isActive ? "#9c27b0" : "#aaaaaa"} />
          <motion.circle cx="26" cy="24" r="0.5" fill={isActive ? "#00bcd4" : "#aaaaaa"} />
        </motion.g>
      </svg>
    </motion.div>
  );
};

// Tab Navigation Component with 3D Icons
interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  className 
}) => {
  const tabs = [
    { id: 'yachts', label: 'Yachts', icon: YachtIcon },
    { id: 'services', label: 'Services', icon: ServicesIcon },
    { id: 'events', label: 'Events', icon: EventsIcon },
  ];

  return (
    <div className={cn("flex space-x-12", className)}>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center space-y-4 px-8 py-6 rounded-2xl transition-all duration-300",
              isActive 
                ? "text-white" 
                : "text-gray-400 hover:text-gray-300"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <IconComponent 
              isActive={isActive} 
              size={160}
              className="transition-all duration-300"
            />
            <span className={cn(
              "text-lg font-medium transition-colors duration-300",
              isActive ? "text-white" : "text-gray-400"
            )}>
              {tab.label}
            </span>
            
            {/* Active Indicator */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="w-16 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
};