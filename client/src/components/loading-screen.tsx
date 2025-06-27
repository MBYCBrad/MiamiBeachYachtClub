import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface LoadingScreenProps {
  isVisible: boolean;
  message?: string;
}

export function LoadingScreen({ isVisible, message = "Loading..." }: LoadingScreenProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return "";
        return prev + ".";
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-purple-500/20 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  scale: 0,
                }}
                animate={{
                  y: Math.random() * window.innerHeight,
                  scale: [0, 1, 0],
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          {/* Main loading content */}
          <div className="relative z-10 flex flex-col items-center space-y-8">
            
            {/* 3D Rotating Logo Container */}
            <motion.div
              className="relative"
              animate={{ 
                rotateY: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              {/* Outer ring */}
              <motion.div
                className="w-24 h-24 border-2 border-purple-500/30 rounded-full absolute"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Middle ring */}
              <motion.div
                className="w-20 h-20 border-2 border-indigo-500/40 rounded-full absolute top-2 left-2"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              {/* Inner glow */}
              <motion.div
                className="w-16 h-16 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-full absolute top-4 left-4 blur-sm"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.7, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              
              {/* Center logo placeholder */}
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full absolute top-6 left-6 flex items-center justify-center"
                animate={{ 
                  boxShadow: [
                    "0 0 20px rgba(147, 51, 234, 0.3)",
                    "0 0 40px rgba(147, 51, 234, 0.6)",
                    "0 0 20px rgba(147, 51, 234, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  className="text-white font-bold text-xl"
                  animate={{ rotateY: [-360, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  M
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Loading text */}
            <motion.div
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.h2 
                className="text-2xl font-bold text-white tracking-wide"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                style={{
                  backgroundImage: "linear-gradient(90deg, #ffffff, #a855f7, #6366f1, #ffffff)",
                  backgroundSize: "300% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                Miami Beach Yacht Club
              </motion.h2>
              
              <motion.p 
                className="text-purple-300 text-lg font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {message}{dots}
              </motion.p>
            </motion.div>

            {/* Progress indicator */}
            <motion.div 
              className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600"
                animate={{ 
                  x: ["-100%", "100%"],
                  scaleX: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.div>
          </div>

          {/* Corner gradients */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-radial from-purple-600/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-radial from-indigo-600/10 to-transparent rounded-full blur-3xl" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for managing loading states during authentication transitions
export function useAuthLoadingState() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  const showLoading = (message: string = "Loading...") => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  return {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
  };
}