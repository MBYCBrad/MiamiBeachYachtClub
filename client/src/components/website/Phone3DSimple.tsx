import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Box, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Simple Phone Model
function SimplePhone() {
  const phoneRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (phoneRef.current) {
      phoneRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      phoneRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={phoneRef} scale={1.5}>
      {/* Phone Body */}
      <RoundedBox args={[0.8, 1.6, 0.08]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.9} 
          roughness={0.1}
          envMapIntensity={2}
        />
      </RoundedBox>
      
      {/* Screen */}
      <Box args={[0.72, 1.52, 0.01]} position={[0, 0, 0.045]} castShadow>
        <meshStandardMaterial 
          color="#000000" 
          metalness={0.95} 
          roughness={0.05}
          envMapIntensity={3}
        />
      </Box>
      
      {/* App Content Preview */}
      <group position={[0, 0, 0.051]}>
        {/* Status Bar */}
        <Box args={[0.7, 0.08, 0.001]} position={[0, 0.72, 0]}>
          <meshBasicMaterial color="#333333" />
        </Box>
        
        {/* App Header */}
        <Box args={[0.7, 0.12, 0.001]} position={[0, 0.6, 0]}>
          <meshBasicMaterial color="#6B46C1" />
        </Box>
        
        {/* Content Areas */}
        <Box args={[0.7, 0.4, 0.001]} position={[0, 0.2, 0]}>
          <meshBasicMaterial color="#1e1e1e" />
        </Box>
        
        <Box args={[0.7, 0.3, 0.001]} position={[0, -0.2, 0]}>
          <meshBasicMaterial color="#2a2a2a" />
        </Box>
        
        {/* Bottom Navigation */}
        <Box args={[0.7, 0.1, 0.001]} position={[0, -0.65, 0]}>
          <meshBasicMaterial color="#333333" />
        </Box>
      </group>
    </group>
  );
}

// Scene Component
function PhoneScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} />
      <spotLight position={[0, 10, 0]} intensity={0.3} angle={0.3} penumbra={1} />
      
      <SimplePhone />
      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
        autoRotate
        autoRotateSpeed={2}
      />
    </>
  );
}

export default function Phone3DSimple() {
  return (
    <div className="h-[600px] w-full relative">
      <Canvas
        shadows
        camera={{ position: [0, 0, 3], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance"
        }}
        className="bg-transparent"
      >
        <Suspense fallback={null}>
          <PhoneScene />
        </Suspense>
      </Canvas>
      
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
      
      {/* Loading Indicator */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute inset-0 flex items-center justify-center bg-black pointer-events-none"
      >
        <div className="text-white">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">Loading 3D Model...</p>
        </div>
      </motion.div>
    </div>
  );
}