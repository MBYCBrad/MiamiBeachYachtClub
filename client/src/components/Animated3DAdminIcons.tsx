import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Animated3DAdminIconProps {
  size?: number;
  className?: string;
}

// Overview/Dashboard Icon
export const Overview3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="overviewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Grid squares */}
        <motion.rect
          x="6" y="6" width="8" height="8" rx="2"
          fill="url(#overviewGradient)"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.rect
          x="18" y="6" width="8" height="8" rx="2"
          fill="url(#overviewGradient)"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.rect
          x="6" y="18" width="8" height="8" rx="2"
          fill="url(#overviewGradient)"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.rect
          x="18" y="18" width="8" height="8" rx="2"
          fill="url(#overviewGradient)"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
        
        {/* Center connecting lines */}
        <motion.circle
          cx="16" cy="16" r="1"
          fill="rgba(139, 92, 246, 0.8)"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
};

// Users Icon
export const Users3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="userGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Main User */}
        <motion.circle
          cx="16" cy="12" r="4"
          fill="url(#userGradient)"
          animate={{
            scale: [1, 1.05, 1],
            y: [0, -0.5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
          d="M8 25c0-4.4 3.6-8 8-8s8 3.6 8 8"
          stroke="url(#userGradient)"
          strokeWidth="2"
          fill="none"
          animate={{
            strokeDasharray: [0, 24],
            strokeDashoffset: [0, -24]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Secondary Users */}
        <motion.circle
          cx="24" cy="10" r="3"
          fill="rgba(255,255,255,0.7)"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 0.5, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.circle
          cx="8" cy="10" r="3"
          fill="rgba(255,255,255,0.7)"
          animate={{
            scale: [1, 1.1, 1],
            x: [0, -0.5, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </svg>
    </motion.div>
  );
};

// Yacht/Ship Icon
export const Yacht3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="yachtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Hull */}
        <motion.path
          d="M6 20 L26 20 L24 24 L8 24 Z"
          fill="url(#yachtGradient)"
          animate={{
            y: [0, -1, 0],
            scaleX: [1, 1.02, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Mast */}
        <motion.rect
          x="15" y="8" width="2" height="12"
          fill="url(#yachtGradient)"
          animate={{
            scaleY: [1, 1.05, 1],
            x: [15, 15.2, 15]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        
        {/* Sail */}
        <motion.path
          d="M16 8 L24 12 L16 16 Z"
          fill="rgba(255,255,255,0.8)"
          animate={{
            scaleX: [1, 0.95, 1],
            x: [0, 0.5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.1 }}
        />
      </svg>
    </motion.div>
  );
};

// Services Icon
export const Services3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="serviceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Service Circle */}
        <motion.circle
          cx="16" cy="16" r="8"
          stroke="url(#serviceGradient)"
          strokeWidth="2"
          fill="none"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Service Dots */}
        <motion.circle
          cx="16" cy="10" r="1.5"
          fill="url(#serviceGradient)"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="22" cy="16" r="1.5"
          fill="url(#serviceGradient)"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.circle
          cx="16" cy="22" r="1.5"
          fill="url(#serviceGradient)"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
        <motion.circle
          cx="10" cy="16" r="1.5"
          fill="url(#serviceGradient)"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
        />
      </svg>
    </motion.div>
  );
};

// Events Icon
export const Events3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="eventGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Calendar Base */}
        <motion.rect
          x="6" y="8" width="20" height="18" rx="2"
          fill="url(#eventGradient)"
          animate={{
            scale: [1, 1.02, 1],
            y: [0, -0.5, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Calendar Header */}
        <rect x="6" y="8" width="20" height="5" rx="2" fill="rgba(139, 92, 246, 0.8)" />
        
        {/* Calendar Rings */}
        <rect x="10" y="4" width="2" height="8" rx="1" fill="url(#eventGradient)" />
        <rect x="20" y="4" width="2" height="8" rx="1" fill="url(#eventGradient)" />
        
        {/* Calendar Dots */}
        <motion.circle
          cx="12" cy="18" r="1.5"
          fill="rgba(139, 92, 246, 0.8)"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="16" cy="18" r="1"
          fill="url(#eventGradient)"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.circle
          cx="20" cy="18" r="1"
          fill="url(#eventGradient)"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [1, 0.8, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </svg>
    </motion.div>
  );
};

// Bookings Icon
export const Bookings3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="bookingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Clipboard */}
        <motion.rect
          x="8" y="6" width="16" height="20" rx="2"
          fill="url(#bookingGradient)"
          animate={{
            y: [0, -0.5, 0],
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Clip */}
        <rect x="12" y="4" width="8" height="4" rx="1" fill="rgba(139, 92, 246, 0.8)" />
        
        {/* Lines */}
        <motion.rect
          x="11" y="12" width="10" height="1.5" rx="0.75"
          fill="rgba(139, 92, 246, 0.6)"
          animate={{
            scaleX: [1, 1.1, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.rect
          x="11" y="16" width="8" height="1.5" rx="0.75"
          fill="rgba(139, 92, 246, 0.6)"
          animate={{
            scaleX: [1, 1.1, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.rect
          x="11" y="20" width="6" height="1.5" rx="0.75"
          fill="rgba(139, 92, 246, 0.6)"
          animate={{
            scaleX: [1, 1.1, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </svg>
    </motion.div>
  );
};

// Analytics Icon
export const Analytics3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="analyticsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Chart Bars */}
        <motion.rect
          x="6" y="20" width="3" height="6" rx="1.5"
          fill="url(#analyticsGradient)"
          animate={{
            scaleY: [1, 1.2, 1],
            y: [20, 19, 20]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.rect
          x="12" y="16" width="3" height="10" rx="1.5"
          fill="url(#analyticsGradient)"
          animate={{
            scaleY: [1, 1.1, 1],
            y: [16, 15.5, 16]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.rect
          x="18" y="12" width="3" height="14" rx="1.5"
          fill="url(#analyticsGradient)"
          animate={{
            scaleY: [1, 1.15, 1],
            y: [12, 11, 12]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.rect
          x="24" y="8" width="3" height="18" rx="1.5"
          fill="url(#analyticsGradient)"
          animate={{
            scaleY: [1, 1.05, 1],
            y: [8, 7.5, 8]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
        
        {/* Trend Line */}
        <motion.path
          d="M7.5 22 L13.5 18 L19.5 14 L25.5 10"
          stroke="rgba(139, 92, 246, 0.8)"
          strokeWidth="2"
          fill="none"
          animate={{
            strokeDasharray: [0, 26],
            strokeDashoffset: [0, -26]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </motion.div>
  );
};

// Payments Icon
export const Payments3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="paymentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Credit Card */}
        <motion.rect
          x="4" y="10" width="24" height="12" rx="3"
          fill="url(#paymentGradient)"
          animate={{
            scale: [1, 1.02, 1],
            y: [0, -0.5, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Magnetic Strip */}
        <rect x="4" y="14" width="24" height="2" fill="rgba(139, 92, 246, 0.8)" />
        
        {/* Chip */}
        <motion.rect
          x="8" y="17" width="3" height="2.5" rx="0.5"
          fill="rgba(139, 92, 246, 0.6)"
          animate={{
            opacity: [1, 0.7, 1],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Numbers */}
        <motion.rect
          x="15" y="17" width="1" height="1" rx="0.5"
          fill="rgba(139, 92, 246, 0.4)"
          animate={{
            opacity: [1, 0.5, 1],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.rect
          x="17" y="17" width="1" height="1" rx="0.5"
          fill="rgba(139, 92, 246, 0.4)"
          animate={{
            opacity: [1, 0.5, 1],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.rect
          x="19" y="17" width="1" height="1" rx="0.5"
          fill="rgba(139, 92, 246, 0.4)"
          animate={{
            opacity: [1, 0.5, 1],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </svg>
    </motion.div>
  );
};

// Staff Icon
export const Staff3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="staffGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Staff Badge */}
        <motion.rect
          x="8" y="8" width="16" height="16" rx="8"
          fill="url(#staffGradient)"
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Staff Person */}
        <motion.circle
          cx="16" cy="14" r="3"
          fill="rgba(139, 92, 246, 0.8)"
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -0.3, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Staff Body */}
        <motion.path
          d="M12 20c0-2.2 1.8-4 4-4s4 1.8 4 4"
          stroke="rgba(139, 92, 246, 0.8)"
          strokeWidth="1.5"
          fill="none"
          animate={{
            strokeDasharray: [0, 12],
            strokeDashoffset: [0, -12]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Badge Elements */}
        <motion.circle
          cx="20" cy="12" r="1"
          fill="rgba(139, 92, 246, 0.6)"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.6, 1]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.circle
          cx="12" cy="12" r="1"
          fill="rgba(139, 92, 246, 0.6)"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.6, 1]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
      </svg>
    </motion.div>
  );
};

// Calendar Icon
export const Calendar3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Calendar Base */}
        <motion.rect
          x="6" y="8" width="20" height="18" rx="2"
          fill="url(#calendarGradient)"
          animate={{
            scale: [1, 1.02, 1],
            y: [0, -0.5, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Calendar Header */}
        <rect x="6" y="8" width="20" height="5" rx="2" fill="rgba(139, 92, 246, 0.8)" />
        
        {/* Calendar Rings */}
        <rect x="10" y="4" width="2" height="8" rx="1" fill="url(#calendarGradient)" />
        <rect x="20" y="4" width="2" height="8" rx="1" fill="url(#calendarGradient)" />
        
        {/* Calendar Grid */}
        <motion.rect
          x="9" y="16" width="2" height="2" rx="1"
          fill="rgba(139, 92, 246, 0.6)"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.rect
          x="13" y="16" width="2" height="2" rx="1"
          fill="rgba(139, 92, 246, 0.4)"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.rect
          x="17" y="16" width="2" height="2" rx="1"
          fill="rgba(139, 92, 246, 0.4)"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.rect
          x="21" y="16" width="2" height="2" rx="1"
          fill="rgba(139, 92, 246, 0.4)"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </svg>
    </motion.div>
  );
};

// Notifications Icon
export const Notifications3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="notificationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Bell Body */}
        <motion.path
          d="M16 6c-3.5 0-6 2.5-6 6v4l-2 2v1h16v-1l-2-2v-4c0-3.5-2.5-6-6-6z"
          fill="url(#notificationGradient)"
          animate={{
            scale: [1, 1.05, 1],
            y: [0, -0.3, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Bell Bottom */}
        <motion.path
          d="M14 20c0 1.1 0.9 2 2 2s2-0.9 2-2"
          stroke="url(#notificationGradient)"
          strokeWidth="1.5"
          fill="none"
          animate={{
            scaleX: [1, 1.1, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Notification Indicator */}
        <motion.circle
          cx="22" cy="8" r="3"
          fill="rgba(139, 92, 246, 0.8)"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.6, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Sound Waves */}
        <motion.path
          d="M24 12c1.5-1.5 1.5-3.5 0-5"
          stroke="rgba(139, 92, 246, 0.4)"
          strokeWidth="1.5"
          fill="none"
          animate={{
            opacity: [0, 1, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
      </svg>
    </motion.div>
  );
};

// Maintenance Icon
export const Maintenance3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="maintenanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Wrench */}
        <motion.path
          d="M6 16l4-4 2 2-4 4-2-2zm6-6l8-8c1-1 3-1 4 0s1 3 0 4l-8 8-4-4z"
          fill="url(#maintenanceGradient)"
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Gear */}
        <motion.circle
          cx="22" cy="22" r="6"
          stroke="url(#maintenanceGradient)"
          strokeWidth="2"
          fill="none"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Gear Teeth */}
        <motion.rect
          x="21" y="16" width="2" height="2"
          fill="url(#maintenanceGradient)"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '22px 22px' }}
        />
        <motion.rect
          x="26" y="21" width="2" height="2"
          fill="url(#maintenanceGradient)"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '22px 22px' }}
        />
        <motion.rect
          x="21" y="26" width="2" height="2"
          fill="url(#maintenanceGradient)"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '22px 22px' }}
        />
        <motion.rect
          x="16" y="21" width="2" height="2"
          fill="url(#maintenanceGradient)"
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: '22px 22px' }}
        />
      </svg>
    </motion.div>
  );
};

// Customer Service Icon
export const CustomerService3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="customerServiceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Headset */}
        <motion.path
          d="M8 14c0-4.4 3.6-8 8-8s8 3.6 8 8v8h-2v-8c0-3.3-2.7-6-6-6s-6 2.7-6 6v8H8v-8z"
          fill="url(#customerServiceGradient)"
          animate={{
            scale: [1, 1.02, 1],
            y: [0, -0.3, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Left Earpiece */}
        <motion.rect
          x="6" y="16" width="4" height="6" rx="2"
          fill="url(#customerServiceGradient)"
          animate={{
            scaleY: [1, 1.1, 1],
            x: [6, 5.8, 6]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Right Earpiece */}
        <motion.rect
          x="22" y="16" width="4" height="6" rx="2"
          fill="url(#customerServiceGradient)"
          animate={{
            scaleY: [1, 1.1, 1],
            x: [22, 22.2, 22]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        
        {/* Microphone */}
        <motion.path
          d="M14 18h4v2h-4z"
          fill="rgba(139, 92, 246, 0.8)"
          animate={{
            scaleX: [1, 1.1, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="16" cy="21" r="1.5"
          fill="rgba(139, 92, 246, 0.6)"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.6, 1]
          }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
      </svg>
    </motion.div>
  );
};

// Crew Management Icon
export const CrewManagement3DIcon: React.FC<Animated3DAdminIconProps> = ({ size = 32, className }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
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
          <linearGradient id="crewGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#f3f4f6" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>
        
        {/* Captain Hat */}
        <motion.path
          d="M8 14c0-4.4 3.6-8 8-8s8 3.6 8 8v2H8v-2z"
          fill="url(#crewGradient)"
          animate={{
            scale: [1, 1.03, 1],
            y: [0, -0.3, 0]
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Hat Band */}
        <rect x="8" y="16" width="16" height="2" fill="rgba(139, 92, 246, 0.8)" />
        
        {/* Anchor Symbol */}
        <motion.path
          d="M16 8v8m-2-6h4m-4 4c-1.1 0-2 .9-2 2s.9 2 2 2m4-4c1.1 0 2 .9 2 2s-.9 2-2 2"
          stroke="rgba(139, 92, 246, 0.6)"
          strokeWidth="1.5"
          fill="none"
          animate={{
            strokeDasharray: [0, 20],
            strokeDashoffset: [0, -20]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Crew Members */}
        <motion.circle
          cx="12" cy="22" r="2"
          fill="rgba(255, 255, 255, 0.7)"
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -0.2, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        />
        <motion.circle
          cx="20" cy="22" r="2"
          fill="rgba(255, 255, 255, 0.7)"
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -0.2, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.circle
          cx="16" cy="26" r="2"
          fill="rgba(255, 255, 255, 0.7)"
          animate={{
            scale: [1, 1.1, 1],
            y: [0, -0.2, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
      </svg>
    </motion.div>
  );
};