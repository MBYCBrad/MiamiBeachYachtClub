import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Animated3DIconProps {
  isActive: boolean;
  size?: number;
  className?: string;
}

// 3D Explore Icon (Waves/Ocean)
export const Explore3DIcon: React.FC<Animated3DIconProps> = ({ isActive, size = 24, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        scale: [1, 1.1, 1],
        rotateY: [0, 10, -10, 0],
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
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#60a5fa" : "#6b7280"} />
            <stop offset="50%" stopColor={isActive ? "#3b82f6" : "#4b5563"} />
            <stop offset="100%" stopColor={isActive ? "#1d4ed8" : "#374151"} />
          </linearGradient>
        </defs>
        
        {/* Wave Layers */}
        <motion.path
          d="M2 20 Q8 16 16 20 T30 20 V28 H2 Z"
          fill="url(#waveGradient)"
          animate={isActive ? { d: ["M2 20 Q8 16 16 20 T30 20 V28 H2 Z", "M2 18 Q8 22 16 18 T30 18 V28 H2 Z", "M2 20 Q8 16 16 20 T30 20 V28 H2 Z"] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.path
          d="M2 24 Q8 20 16 24 T30 24 V28 H2 Z"
          fill={isActive ? "#3b82f6" : "#4b5563"}
          opacity="0.7"
          animate={isActive ? { d: ["M2 24 Q8 20 16 24 T30 24 V28 H2 Z", "M2 22 Q8 26 16 22 T30 22 V28 H2 Z", "M2 24 Q8 20 16 24 T30 24 V28 H2 Z"] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />

        {/* Floating Elements */}
        <motion.circle
          cx="10" cy="12" r="1.5"
          fill={isActive ? "#fbbf24" : "#6b7280"}
          animate={isActive ? { y: [0, -2, 0], opacity: [0.7, 1, 0.7] } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="22" cy="10" r="1"
          fill={isActive ? "#f59e0b" : "#6b7280"}
          animate={isActive ? { y: [0, -1, 0], opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </svg>
    </motion.div>
  );
};

// 3D Trips Icon (Calendar with 3D effect)
export const Trips3DIcon: React.FC<Animated3DIconProps> = ({ isActive, size = 24, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        scale: [1, 1.1, 1],
        rotateX: [0, 5, -5, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      });
    } else {
      controls.start({
        scale: 1,
        rotateX: 0,
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
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#f3f4f6" : "#6b7280"} />
            <stop offset="50%" stopColor={isActive ? "#e5e7eb" : "#4b5563"} />
            <stop offset="100%" stopColor={isActive ? "#d1d5db" : "#374151"} />
          </linearGradient>
        </defs>
        
        {/* Calendar Base */}
        <rect x="6" y="8" width="20" height="18" rx="2" fill="url(#calendarGradient)" />
        <rect x="6" y="8" width="20" height="5" rx="2" fill={isActive ? "#8b5cf6" : "#4b5563"} />
        
        {/* Calendar Rings */}
        <rect x="10" y="4" width="2" height="8" rx="1" fill={isActive ? "#6b7280" : "#4b5563"} />
        <rect x="20" y="4" width="2" height="8" rx="1" fill={isActive ? "#6b7280" : "#4b5563"} />
        
        {/* Calendar Dates */}
        <motion.circle
          cx="12" cy="18" r="1.5"
          fill={isActive ? "#8b5cf6" : "#6b7280"}
          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx="16" cy="18" r="1" fill={isActive ? "#d1d5db" : "#6b7280"} />
        <circle cx="20" cy="18" r="1" fill={isActive ? "#d1d5db" : "#6b7280"} />
        <circle cx="12" cy="22" r="1" fill={isActive ? "#d1d5db" : "#6b7280"} />
        <circle cx="16" cy="22" r="1" fill={isActive ? "#d1d5db" : "#6b7280"} />
        <circle cx="20" cy="22" r="1" fill={isActive ? "#d1d5db" : "#6b7280"} />
      </svg>
    </motion.div>
  );
};

// 3D Favorites Icon (Heart with pulse)
export const Favorites3DIcon: React.FC<Animated3DIconProps> = ({ isActive, size = 24, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        scale: [1, 1.2, 1],
        rotateZ: [0, 2, -2, 0],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
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
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#f87171" : "#6b7280"} />
            <stop offset="50%" stopColor={isActive ? "#ef4444" : "#4b5563"} />
            <stop offset="100%" stopColor={isActive ? "#dc2626" : "#374151"} />
          </linearGradient>
        </defs>
        
        {/* Heart Shape */}
        <motion.path
          d="M16 26 C12 22, 6 18, 6 12 C6 8, 9 6, 12 8 C14 6, 16 7, 16 10 C16 7, 18 6, 20 8 C23 6, 26 8, 26 12 C26 18, 20 22, 16 26 Z"
          fill="url(#heartGradient)"
          animate={isActive ? { 
            scale: [1, 1.1, 1],
            filter: ["drop-shadow(0 2px 4px rgba(0,0,0,0.3))", "drop-shadow(0 4px 8px rgba(239, 68, 68, 0.4))", "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Heart Shine */}
        {isActive && (
          <motion.ellipse
            cx="12" cy="12" rx="2" ry="3"
            fill="rgba(255,255,255,0.3)"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        
        {/* Floating Hearts */}
        {isActive && (
          <>
            <motion.circle
              cx="8" cy="8" r="1"
              fill="#f87171"
              animate={{ 
                y: [0, -3, 0], 
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.circle
              cx="24" cy="10" r="0.8"
              fill="#ef4444"
              animate={{ 
                y: [0, -2, 0], 
                opacity: [0, 1, 0],
                scale: [0.3, 0.8, 0.3]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
};

// 3D Messages Icon (Chat bubbles)
export const Messages3DIcon: React.FC<Animated3DIconProps> = ({ isActive, size = 24, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        scale: [1, 1.05, 1],
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
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id="chatGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#60a5fa" : "#6b7280"} />
            <stop offset="50%" stopColor={isActive ? "#3b82f6" : "#4b5563"} />
            <stop offset="100%" stopColor={isActive ? "#1d4ed8" : "#374151"} />
          </linearGradient>
          <linearGradient id="chatGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#a78bfa" : "#6b7280"} />
            <stop offset="50%" stopColor={isActive ? "#8b5cf6" : "#4b5563"} />
            <stop offset="100%" stopColor={isActive ? "#7c3aed" : "#374151"} />
          </linearGradient>
        </defs>
        
        {/* Main Chat Bubble */}
        <motion.path
          d="M6 8 Q6 6 8 6 H20 Q22 6 22 8 V16 Q22 18 20 18 H12 L8 22 V18 Q6 18 6 16 Z"
          fill="url(#chatGradient1)"
          animate={isActive ? { 
            scale: [1, 1.02, 1],
            y: [0, -0.5, 0]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Secondary Chat Bubble */}
        <motion.path
          d="M10 16 Q10 14 12 14 H24 Q26 14 26 16 V22 Q26 24 24 24 H18 L14 26 V24 Q10 24 10 22 Z"
          fill="url(#chatGradient2)"
          animate={isActive ? { 
            scale: [1, 1.02, 1],
            y: [0, 0.5, 0]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        
        {/* Chat Dots */}
        <motion.circle
          cx="12" cy="12" r="1"
          fill={isActive ? "#ffffff" : "#9ca3af"}
          animate={isActive ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="16" cy="12" r="1"
          fill={isActive ? "#ffffff" : "#9ca3af"}
          animate={isActive ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.circle
          cx="20" cy="12" r="1"
          fill={isActive ? "#ffffff" : "#9ca3af"}
          animate={isActive ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
        
        {/* Notification Dot */}
        {isActive && (
          <motion.circle
            cx="26" cy="8" r="3"
            fill="#ef4444"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </svg>
    </motion.div>
  );
};

// 3D Menu Icon (Hamburger with 3D layers)
export const Menu3DIcon: React.FC<Animated3DIconProps> = ({ isActive, size = 24, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        rotateZ: [0, 180, 360],
        scale: [1, 1.1, 1],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      });
    } else {
      controls.start({
        rotateZ: 0,
        scale: 1,
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
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id="menuGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isActive ? "#f3f4f6" : "#6b7280"} />
            <stop offset="50%" stopColor={isActive ? "#e5e7eb" : "#4b5563"} />
            <stop offset="100%" stopColor={isActive ? "#d1d5db" : "#374151"} />
          </linearGradient>
        </defs>
        
        {/* Menu Lines with 3D effect */}
        <motion.rect
          x="6" y="9" width="20" height="2.5" rx="1.25"
          fill="url(#menuGradient)"
          animate={isActive ? { 
            scaleX: [1, 0.8, 1],
            x: [6, 8, 6]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.rect
          x="6" y="15" width="20" height="2.5" rx="1.25"
          fill="url(#menuGradient)"
          animate={isActive ? { 
            scaleX: [1, 1.2, 1],
            x: [6, 4, 6]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        
        <motion.rect
          x="6" y="21" width="20" height="2.5" rx="1.25"
          fill="url(#menuGradient)"
          animate={isActive ? { 
            scaleX: [1, 0.9, 1],
            x: [6, 7, 6]
          } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
        
        {/* 3D Shadow Lines */}
        <rect x="7" y="10" width="20" height="2.5" rx="1.25" fill="rgba(0,0,0,0.1)" />
        <rect x="7" y="16" width="20" height="2.5" rx="1.25" fill="rgba(0,0,0,0.1)" />
        <rect x="7" y="22" width="20" height="2.5" rx="1.25" fill="rgba(0,0,0,0.1)" />
      </svg>
    </motion.div>
  );
};