import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Box, 
  Cylinder, 
  RoundedBox,
  MeshReflectorMaterial,
  useGLTF
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Simple Yacht Model Component
function SimpleYachtModel() {
  const yachtRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (yachtRef.current) {
      // Gentle floating animation
      yachtRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      yachtRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <group ref={yachtRef}>
      {/* Main Hull */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 0.8, 8]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Upper Deck */}
      <mesh position={[0, 0.6, -1]} castShadow>
        <boxGeometry args={[2.5, 0.4, 5]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.6} roughness={0.3} />
      </mesh>
      
      {/* Cabin */}
      <mesh position={[0, 1, -1.5]} castShadow>
        <boxGeometry args={[2, 0.8, 3]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.5} roughness={0.4} />
      </mesh>
      
      {/* Mast */}
      <mesh position={[0, 2.5, -1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// Water Effect
function Water() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={2048}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        color="#001e4d"
        metalness={0.8}
        mirror={0.5}
      />
    </mesh>
  );
}

// Scene Component
function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-10, -10, -5]} intensity={0.3} />
      <spotLight position={[0, 20, 0]} intensity={0.5} angle={0.3} penumbra={1} />
      
      <Environment preset="sunset" background={false} />
      
      <SimpleYachtModel />
      <Water />
      
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </>
  );
}

export default function Yacht3DModel() {
  return (
    <div className="relative h-[600px] w-full bg-black rounded-2xl overflow-hidden">
      <Canvas
        shadows
        camera={{ position: [10, 5, 10], fov: 45 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          preserveDrawingBuffer: true,
          powerPreference: "high-performance"
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />
      
      {/* Loading Indicator */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute inset-0 flex items-center justify-center bg-black"
      >
        <div className="text-white">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-400">Loading 3D Model...</p>
        </div>
      </motion.div>
    </div>
  );
}