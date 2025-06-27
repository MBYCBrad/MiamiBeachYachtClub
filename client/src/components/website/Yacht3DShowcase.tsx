import React, { useRef, useEffect, useState, Suspense } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';

// Fallback 3D Yacht Model Component
function YachtModel({ scrollProgress }: { scrollProgress: any }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      // Rotate based on scroll
      const unsubscribe = scrollProgress.onChange((latest: number) => {
        if (meshRef.current) {
          meshRef.current.rotation.y = -Math.PI * 2 * latest;
        }
      });
      return unsubscribe;
    }
  }, [scrollProgress]);

  // Create a simple yacht-like geometry as fallback
  return (
    <mesh ref={meshRef} position={[0, -0.5, 0]}>
      <group>
        {/* Hull */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2, 0.5, 5]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Cabin */}
        <mesh position={[0, 0.5, -0.5]}>
          <boxGeometry args={[1.5, 0.8, 2]} />
          <meshStandardMaterial color="#ffffff" metalness={0.6} roughness={0.3} />
        </mesh>
        
        {/* Upper Deck */}
        <mesh position={[0, 1, -0.5]}>
          <boxGeometry args={[1.2, 0.3, 1.5]} />
          <meshStandardMaterial color="#f0f0f0" metalness={0.7} roughness={0.2} />
        </mesh>
        
        {/* Mast */}
        <mesh position={[0, 2, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 3]} />
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>
    </mesh>
  );
}

interface Yacht3DShowcaseProps {
  yachtName?: string;
  yachtSpecs?: {
    length: string;
    cabins: number;
    baths: number;
  };
}

export default function Yacht3DShowcase({ yachtName = "95ft Sunseeker", yachtSpecs }: Yacht3DShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.8, 1, 1, 0.8]);

  return (
    <motion.div
      ref={containerRef}
      style={{ opacity, scale }}
      className="relative h-screen w-full bg-gradient-to-b from-black via-gray-950 to-black overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
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
            backgroundSize: '150% 150%',
          }}
        />
      </div>

      {/* 3D Canvas */}
      <div className="absolute inset-0 z-10">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-white/50">Loading 3D Model...</div>
          </div>
        }>
          <Canvas
            camera={{ position: [0, 2, 8], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
            onCreated={({ gl }) => {
              gl.setClearColor(0x000000, 0);
            }}
          >
            <PerspectiveCamera makeDefault position={[0, 2, 8]} fov={50} />
            
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <spotLight position={[-10, 10, -5]} intensity={0.5} angle={0.3} penumbra={1} />
            
            {/* Environment for reflections */}
            <Environment preset="sunset" />
            
            {/* 3D Yacht Model */}
            <Suspense fallback={null}>
              <YachtModel scrollProgress={scrollYProgress} />
            </Suspense>
            
            {/* Controls */}
            <OrbitControls 
              enableZoom={false} 
              enablePan={false}
              autoRotate={false}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={Math.PI / 2}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Overlay Content */}
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
              Scroll to explore every angle of this magnificent vessel.
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
        Scroll to rotate
      </motion.div>
    </motion.div>
  );
}