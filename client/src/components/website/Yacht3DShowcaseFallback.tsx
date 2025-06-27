import React from 'react';
import { motion } from 'framer-motion';

interface Yacht3DShowcaseFallbackProps {
  yachtName?: string;
  yachtSpecs?: {
    length: string;
    cabins: number;
    baths: number;
  };
}

export default function Yacht3DShowcaseFallback({ 
  yachtName = "95ft Sunseeker", 
  yachtSpecs 
}: Yacht3DShowcaseFallbackProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative h-screen overflow-hidden bg-black"
    >
      {/* Background Video/Image */}
      <div className="absolute inset-0">
        <img 
          src="/api/media/pexels-pixabay-163236_1750537277230.jpg" 
          alt="Luxury Yacht"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80" />
      </div>

      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: 'reverse' 
          }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 80% 80%, #2563eb 0%, transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex items-end pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-black/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10"
          >
            <h3 className="text-4xl md:text-5xl font-thin text-white mb-4">
              {yachtName}
            </h3>
            {yachtSpecs && (
              <div className="flex flex-wrap gap-8 text-gray-300">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Length</p>
                  <p className="text-2xl font-light">{yachtSpecs.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Cabins</p>
                  <p className="text-2xl font-light">{yachtSpecs.cabins}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Bathrooms</p>
                  <p className="text-2xl font-light">{yachtSpecs.baths}</p>
                </div>
              </div>
            )}
            <p className="mt-6 text-gray-400 leading-relaxed">
              Experience the pinnacle of maritime luxury with our flagship yacht. 
              Scroll to explore every detail of this magnificent vessel.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Scroll Instruction */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 text-sm"
      >
        Scroll to explore
      </motion.div>
    </motion.div>
  );
}