import React from 'react';
import { motion } from 'framer-motion';

interface Phone3DMockupFallbackProps {
  screenshot?: string;
}

export default function Phone3DMockupFallback({ 
  screenshot = '/api/media/Screenshot 2025-06-21 at 10.15.18 AM_1750526121299.png' 
}: Phone3DMockupFallbackProps) {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      {/* Phone Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {/* Phone Frame */}
        <div className="relative w-[280px] h-[580px] bg-gray-900 rounded-[40px] p-[10px] shadow-2xl">
          {/* Screen */}
          <div className="relative w-full h-full bg-black rounded-[30px] overflow-hidden">
            <img 
              src={screenshot} 
              alt="MBYC App Screenshot"
              className="w-full h-full object-cover"
            />
            
            {/* Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[150px] h-[28px] bg-gray-900 rounded-b-[20px]" />
            
            {/* Screen Reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
          </div>
          
          {/* Side Buttons */}
          <div className="absolute right-[-2px] top-[100px] w-[4px] h-[60px] bg-gray-800 rounded-l-sm" />
          <div className="absolute left-[-2px] top-[120px] w-[4px] h-[40px] bg-gray-800 rounded-r-sm" />
          <div className="absolute left-[-2px] top-[180px] w-[4px] h-[40px] bg-gray-800 rounded-r-sm" />
        </div>
        
        {/* Shadow */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-[200px] h-[40px] bg-black/20 rounded-full blur-2xl" />
      </motion.div>
      
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
    </div>
  );
}