import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Animated3DIconProps {
  isActive: boolean;
  size?: number;
  className?: string;
}

// 3D Explore Icon (Captain's Hat)
export const Explore3DIcon: React.FC<Animated3DIconProps> = ({ isActive, size = 24, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        rotateY: [0, 5, -5, 0],
        scale: [1, 1.05, 1],
        transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" }
      });
    } else {
      controls.start({
        rotateY: 0,
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
          <linearGradient id="hatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="visorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="50%" stopColor="#1f2937" />
            <stop offset="100%" stopColor="#374151" />
          </linearGradient>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        
        {/* Hat Crown (main body) */}
        <ellipse cx="16" cy="14" rx="12" ry="8" fill="url(#hatGradient)" />
        <ellipse cx="16" cy="14" rx="10" ry="6.5" fill="url(#hatGradient)" opacity="0.8" />
        
        {/* Hat Visor */}
        <ellipse cx="16" cy="20" rx="14" ry="3" fill="url(#visorGradient)" />
        <ellipse cx="16" cy="19.5" rx="13" ry="2.5" fill="url(#visorGradient)" opacity="0.9" />
        
        {/* Hat Band */}
        <rect x="6" y="16" width="20" height="3" rx="1.5" fill="url(#goldGradient)" />
        
        {/* Captain's Emblem/Badge */}
        <motion.circle
          cx="16" cy="12" r="3"
          fill="url(#goldGradient)"
          stroke="#fbbf24"
          strokeWidth="0.5"
          animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
        />
        
        {/* Anchor symbol on emblem */}
        <path
          d="M16 10 L16 14 M14 12 L18 12 M14 13.5 Q14 14.5 15 14.5 M18 13.5 Q18 14.5 17 14.5"
          stroke="#1e3a8a"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        
        {/* Hat Shine/Highlight */}
        <ellipse cx="13" cy="10" rx="3" ry="2" fill="rgba(255,255,255,0.2)" />
        
        {/* Captain's Stars */}
        <motion.g
          animate={isActive ? { opacity: [0.7, 1, 0.7] } : { opacity: 0.8 }}
          transition={{ duration: 1.8, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
        >
          <polygon points="10,17.5 10.5,18.5 9.5,18.5" fill="#fbbf24" />
          <polygon points="22,17.5 22.5,18.5 21.5,18.5" fill="#fbbf24" />
        </motion.g>
        
        {/* Floating particles when active */}
        {isActive && (
          <>
            <motion.circle
              cx="8" cy="8" r="0.8"
              fill="#fbbf24"
              animate={{ y: [0, -3, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
              cx="24" cy="6" r="0.6"
              fill="#f59e0b"
              animate={{ y: [0, -2, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
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
          animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
          transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
        />
        <motion.circle 
          cx="16" cy="18" r="1" 
          fill="#d1d5db"
          animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 1.8, repeat: isActive ? Infinity : 0, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.circle 
          cx="20" cy="18" r="1" 
          fill="#d1d5db"
          animate={isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0, ease: "easeInOut", delay: 0.4 }}
        />
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
            scale: [1, 1.1, 1]
          } : { scale: 1 }}
          transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
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

// 3D Services Icon (Concierge Bell)
export const Services3DIcon: React.FC<Animated3DIconProps> = ({ isActive, size = 24, className }) => {
  const controls = useAnimation();

  useEffect(() => {
    if (isActive) {
      controls.start({
        scale: [1, 1.08, 1],
        rotateY: [0, 8, -8, 0],
        transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
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
          <linearGradient id="bellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#374151" />
            <stop offset="50%" stopColor="#4b5563" />
            <stop offset="100%" stopColor="#6b7280" />
          </linearGradient>
        </defs>
        
        {/* Bell Base */}
        <ellipse cx="16" cy="25" rx="8" ry="2" fill="url(#baseGradient)" />
        <ellipse cx="16" cy="24.5" rx="7" ry="1.5" fill="url(#baseGradient)" opacity="0.8" />
        
        {/* Bell Body */}
        <motion.path
          d="M16 6 C12 6 8 9 8 14 C8 18 8 20 6 22 L26 22 C24 20 24 18 24 14 C24 9 20 6 16 6 Z"
          fill="url(#bellGradient)"
          animate={isActive ? { 
            scale: [1, 1.02, 1],
            rotateZ: [0, 1, -1, 0] 
          } : {}}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Bell Highlight */}
        <ellipse cx="13" cy="10" rx="2" ry="3" fill="rgba(255,255,255,0.3)" />
        
        {/* Bell Handle/Button */}
        <motion.circle
          cx="16" cy="6" r="2"
          fill="url(#baseGradient)"
          animate={isActive ? { 
            scale: [1, 1.1, 1],
            y: [0, -1, 0]
          } : {}}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Service Stars */}
        <motion.g
          animate={isActive ? { 
            opacity: [0.6, 1, 0.6],
            scale: [1, 1.1, 1]
          } : { opacity: 0.8 }}
          transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, ease: "easeInOut" }}
        >
          <polygon points="11,15 11.5,16.5 10,16.5" fill="#fbbf24" />
          <polygon points="21,15 21.5,16.5 20,16.5" fill="#fbbf24" />
          <polygon points="16,12 16.5,13.5 15,13.5" fill="#fbbf24" />
        </motion.g>
        
        {/* Bell Clapper */}
        <motion.circle
          cx="16" cy="18" r="1.5"
          fill="#8b5cf6"
          animate={isActive ? { 
            x: [0, 1, -1, 0],
            scale: [1, 1.1, 1]
          } : {}}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Service Sparkles */}
        <motion.g
          animate={isActive ? { 
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8]
          } : { opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <circle cx="10" cy="8" r="0.5" fill="#8b5cf6" />
          <circle cx="22" cy="10" r="0.5" fill="#8b5cf6" />
          <circle cx="8" cy="18" r="0.5" fill="#8b5cf6" />
          <circle cx="24" cy="16" r="0.5" fill="#8b5cf6" />
        </motion.g>
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