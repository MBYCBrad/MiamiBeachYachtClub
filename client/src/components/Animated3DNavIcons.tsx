import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Animated3DIconProps {
  isActive: boolean;
  size?: number;
  className?: string;
}

// 3D Explore Icon (Yacht Steering Wheel)
export const Explore3DIcon: React.FC<Animated3DIconProps> = ({ isActive, size = 24, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        rotateZ: [0, 360],
        scale: [1, 1.1, 1],
        transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
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
          <linearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="wheelCenter" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3f4f6" />
            <stop offset="50%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#d1d5db" />
          </linearGradient>
        </defs>
        
        {/* Outer Wheel Ring */}
        <circle cx="16" cy="16" r="12" fill="url(#wheelGradient)" stroke="#1e40af" strokeWidth="1" />
        <circle cx="16" cy="16" r="10" fill="none" stroke="#1e40af" strokeWidth="0.5" />
        
        {/* Wheel Spokes */}
        <g stroke="url(#wheelCenter)" strokeWidth="2" strokeLinecap="round">
          <line x1="16" y1="6" x2="16" y2="10" />
          <line x1="16" y1="22" x2="16" y2="26" />
          <line x1="6" y1="16" x2="10" y2="16" />
          <line x1="22" y1="16" x2="26" y2="16" />
          <line x1="10.3" y1="10.3" x2="12.6" y2="12.6" />
          <line x1="19.4" y1="19.4" x2="21.7" y2="21.7" />
          <line x1="21.7" y1="10.3" x2="19.4" y2="12.6" />
          <line x1="12.6" y1="19.4" x2="10.3" y2="21.7" />
        </g>
        
        {/* Center Hub */}
        <circle cx="16" cy="16" r="4" fill="url(#wheelCenter)" stroke="#6b7280" strokeWidth="1" />
        <circle cx="16" cy="16" r="2" fill="#374151" />
        
        {/* Wheel Grips */}
        <circle cx="16" cy="6" r="1.5" fill="#f59e0b" />
        <circle cx="26" cy="16" r="1.5" fill="#f59e0b" />
        <circle cx="16" cy="26" r="1.5" fill="#f59e0b" />
        <circle cx="6" cy="16" r="1.5" fill="#f59e0b" />
        
        {/* Animation Effects */}
        {isActive && (
          <>
            <motion.circle
              cx="16" cy="16" r="14"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="0.5"
              opacity="0.5"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
              cx="16" cy="16" r="1"
              fill="#fbbf24"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </>
        )}
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
            <stop offset="0%" stopColor="#f3f4f6" />
            <stop offset="50%" stopColor="#e5e7eb" />
            <stop offset="100%" stopColor="#d1d5db" />
          </linearGradient>
        </defs>
        
        {/* Calendar Base */}
        <rect x="6" y="8" width="20" height="18" rx="2" fill="url(#calendarGradient)" />
        <rect x="6" y="8" width="20" height="5" rx="2" fill="#8b5cf6" />
        
        {/* Calendar Rings */}
        <rect x="10" y="4" width="2" height="8" rx="1" fill="#6b7280" />
        <rect x="20" y="4" width="2" height="8" rx="1" fill="#6b7280" />
        
        {/* Calendar Dates */}
        <motion.circle
          cx="12" cy="18" r="1.5"
          fill="#8b5cf6"
          animate={isActive ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx="16" cy="18" r="1" fill="#d1d5db" />
        <circle cx="20" cy="18" r="1" fill="#d1d5db" />
        <circle cx="12" cy="22" r="1" fill="#d1d5db" />
        <circle cx="16" cy="22" r="1" fill="#d1d5db" />
        <circle cx="20" cy="22" r="1" fill="#d1d5db" />
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
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#dc2626" />
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
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="chatGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
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
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#7c3aed" />
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