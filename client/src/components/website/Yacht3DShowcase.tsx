import React, { useRef, Suspense, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Box, Sphere, Cylinder, MeshReflectorMaterial, Float, useTexture } from '@react-three/drei';
import { useScroll, useTransform } from 'framer-motion';
import * as THREE from 'three';

// World-class Luxury Yacht 3D Model
function YachtModel({ scrollProgress }: { scrollProgress: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const propellerRef1 = useRef<THREE.Mesh>(null);
  const propellerRef2 = useRef<THREE.Mesh>(null);
  
  // Animate yacht rotation and floating
  useFrame((state) => {
    if (groupRef.current) {
      // Smooth rotation based on scroll
      if (scrollProgress) {
        const progress = scrollProgress.get();
        groupRef.current.rotation.y = progress * Math.PI * 0.5;
      }
      // Gentle floating motion
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.2) * 0.01;
    }
    
    // Animate propellers
    if (propellerRef1.current) {
      propellerRef1.current.rotation.z += 0.1;
    }
    if (propellerRef2.current) {
      propellerRef2.current.rotation.z -= 0.1;
    }
  });

  // Create hull geometry
  const hullGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(1.5, 0);
    shape.quadraticCurveTo(1.8, 0.3, 1.5, 0.6);
    shape.lineTo(0, 0.6);
    shape.quadraticCurveTo(-0.3, 0.3, 0, 0);
    
    const extrudeSettings = {
      steps: 2,
      depth: 12,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 5
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  return (
    <group ref={groupRef} scale={0.8}>
      {/* Primary Hull - Sleek modern design */}
      <mesh position={[0, -0.5, 0]} geometry={hullGeometry} castShadow receiveShadow>
        <meshStandardMaterial 
          color="#f8f9fa" 
          metalness={0.95} 
          roughness={0.05}
          envMapIntensity={2}
        />
      </mesh>
      
      {/* Hull Bottom - Dark anti-fouling paint */}
      <Box args={[3.6, 0.2, 12]} position={[0, -0.7, 0]} castShadow>
        <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.8} />
      </Box>
      
      {/* Main Deck - Teak wood finish */}
      <Box args={[3.4, 0.1, 11.5]} position={[0, 0.4, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#8B6F47" 
          metalness={0.1} 
          roughness={0.9}
          map={null}
        />
      </Box>
      
      {/* Superstructure - Main Cabin */}
      <group position={[0, 1.2, -1.5]}>
        {/* Lower Salon */}
        <Box args={[3, 1.6, 5.5]} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </Box>
        
        {/* Upper Bridge */}
        <Box args={[2.6, 1.2, 4]} position={[0, 1.4, 0.5]} castShadow receiveShadow>
          <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
        </Box>
        
        {/* Flybridge */}
        <Box args={[2.2, 0.8, 3]} position={[0, 2.4, 0.5]} castShadow>
          <meshStandardMaterial color="#f8f9fa" metalness={0.85} roughness={0.15} />
        </Box>
      </group>
      
      {/* Windows - Panoramic wraparound */}
      {/* Main Deck Windows */}
      {[...Array(8)].map((_, i) => (
        <group key={`window-${i}`}>
          <Box 
            args={[0.05, 0.8, 0.6]} 
            position={[1.51, 1.2, -3.5 + i * 0.8]} 
            castShadow
          >
            <meshStandardMaterial 
              color="#000000" 
              metalness={0.98} 
              roughness={0.02} 
              transparent 
              opacity={0.6}
              envMapIntensity={3}
            />
          </Box>
          <Box 
            args={[0.05, 0.8, 0.6]} 
            position={[-1.51, 1.2, -3.5 + i * 0.8]} 
            castShadow
          >
            <meshStandardMaterial 
              color="#000000" 
              metalness={0.98} 
              roughness={0.02} 
              transparent 
              opacity={0.6}
              envMapIntensity={3}
            />
          </Box>
        </group>
      ))}
      
      {/* Bridge Windows - Wraparound */}
      <Box args={[2.5, 0.6, 0.05]} position={[0, 2.8, 0.5]} castShadow>
        <meshStandardMaterial 
          color="#000000" 
          metalness={0.98} 
          roughness={0.02} 
          transparent 
          opacity={0.7}
        />
      </Box>
      
      {/* Radar & Communication Array */}
      <group position={[0, 4.5, -1]}>
        {/* Main Mast */}
        <Cylinder args={[0.1, 0.15, 2.5]} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
        </Cylinder>
        
        {/* Radar Dome */}
        <Sphere args={[0.4, 32, 32]} position={[0, 1.5, 0]} castShadow>
          <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
        </Sphere>
        
        {/* Satellite Domes */}
        <Sphere args={[0.25, 32, 32]} position={[0.6, 1, 0]} castShadow>
          <meshStandardMaterial color="#f8f9fa" metalness={0.8} roughness={0.2} />
        </Sphere>
        <Sphere args={[0.25, 32, 32]} position={[-0.6, 1, 0]} castShadow>
          <meshStandardMaterial color="#f8f9fa" metalness={0.8} roughness={0.2} />
        </Sphere>
        
        {/* GPS/VHF Antennas */}
        <Cylinder args={[0.02, 0.02, 1]} position={[0.3, 2, 0]} castShadow>
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
        </Cylinder>
        <Cylinder args={[0.02, 0.02, 0.8]} position={[-0.3, 2, 0]} castShadow>
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
        </Cylinder>
      </group>
      
      {/* Luxury Features */}
      {/* Jacuzzi on Foredeck */}
      <Cylinder args={[0.8, 0.8, 0.3, 32]} position={[0, 0.6, 3.5]} castShadow>
        <meshStandardMaterial 
          color="#4169E1" 
          metalness={0.9} 
          roughness={0.1} 
          transparent 
          opacity={0.8}
        />
      </Cylinder>
      
      {/* Sun Pads */}
      {[...Array(4)].map((_, i) => (
        <Box 
          key={`sunpad-${i}`} 
          args={[0.8, 0.1, 1.8]} 
          position={[-1.2 + i * 0.8, 0.5, 2]} 
          castShadow
        >
          <meshStandardMaterial color="#F5F5DC" metalness={0.1} roughness={0.9} />
        </Box>
      ))}
      
      {/* Swim Platform with Teak */}
      <Box args={[3.2, 0.15, 2]} position={[0, -0.3, -6]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B6F47" metalness={0.1} roughness={0.9} />
      </Box>
      
      {/* Tender Garage Door */}
      <Box args={[2.5, 1, 0.1]} position={[0, 0.2, -5.9]} castShadow>
        <meshStandardMaterial 
          color="#333333" 
          metalness={0.95} 
          roughness={0.05}
        />
      </Box>
      
      {/* Stainless Steel Railings */}
      {/* Port Side */}
      <group>
        {[...Array(20)].map((_, i) => (
          <Cylinder 
            key={`port-rail-${i}`}
            args={[0.02, 0.02, 0.8]} 
            position={[1.7, 0.9, -5 + i * 0.5]} 
            castShadow
          >
            <meshStandardMaterial 
              color="#e0e0e0" 
              metalness={0.95} 
              roughness={0.05}
            />
          </Cylinder>
        ))}
        <Cylinder args={[0.03, 0.03, 10]} position={[1.7, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
        </Cylinder>
      </group>
      
      {/* Starboard Side */}
      <group>
        {[...Array(20)].map((_, i) => (
          <Cylinder 
            key={`starboard-rail-${i}`}
            args={[0.02, 0.02, 0.8]} 
            position={[-1.7, 0.9, -5 + i * 0.5]} 
            castShadow
          >
            <meshStandardMaterial 
              color="#e0e0e0" 
              metalness={0.95} 
              roughness={0.05}
            />
          </Cylinder>
        ))}
        <Cylinder args={[0.03, 0.03, 10]} position={[-1.7, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <meshStandardMaterial color="#e0e0e0" metalness={0.95} roughness={0.05} />
        </Cylinder>
      </group>
      
      {/* Navigation Lights */}
      <Sphere args={[0.06]} position={[1.8, 1, 5.5]}>
        <meshStandardMaterial 
          color="#00ff00" 
          emissive="#00ff00" 
          emissiveIntensity={2}
        />
      </Sphere>
      <Sphere args={[0.06]} position={[-1.8, 1, 5.5]}>
        <meshStandardMaterial 
          color="#ff0000" 
          emissive="#ff0000" 
          emissiveIntensity={2}
        />
      </Sphere>
      <Sphere args={[0.06]} position={[0, 6.5, -1]}>
        <meshStandardMaterial 
          color="#ffffff" 
          emissive="#ffffff" 
          emissiveIntensity={2}
        />
      </Sphere>
      
      {/* Anchor System */}
      <group position={[0, -0.2, 6]}>
        <Box args={[0.3, 0.3, 0.1]} castShadow>
          <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.1} />
        </Box>
        <Cylinder args={[0.02, 0.02, 0.5]} position={[0, -0.25, 0]} castShadow>
          <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
        </Cylinder>
      </group>
      
      {/* Propulsion System */}
      <group position={[0.8, -0.8, -6]}>
        <Cylinder args={[0.15, 0.15, 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.05} />
        </Cylinder>
        <mesh ref={propellerRef1} position={[0, 0, -0.2]}>
          <boxGeometry args={[0.8, 0.05, 0.2]} />
          <meshStandardMaterial color="#FFD700" metalness={0.98} roughness={0.02} />
        </mesh>
      </group>
      <group position={[-0.8, -0.8, -6]}>
        <Cylinder args={[0.15, 0.15, 0.3]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.05} />
        </Cylinder>
        <mesh ref={propellerRef2} position={[0, 0, -0.2]}>
          <boxGeometry args={[0.8, 0.05, 0.2]} />
          <meshStandardMaterial color="#FFD700" metalness={0.98} roughness={0.02} />
        </mesh>
      </group>
      
      {/* Deck Furniture */}
      {/* Flybridge Seating */}
      <Box args={[1.8, 0.3, 0.8]} position={[0, 3.3, -0.5]} castShadow>
        <meshStandardMaterial color="#F5F5DC" metalness={0.1} roughness={0.9} />
      </Box>
      
      {/* Aft Deck Dining Table */}
      <Cylinder args={[0.8, 0.8, 0.05]} position={[0, 0.5, -3.5]} castShadow>
        <meshStandardMaterial 
          color="#8B6F47" 
          metalness={0.3} 
          roughness={0.7}
        />
      </Cylinder>
    </group>
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
  const { scrollYProgress } = useScroll();
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div 
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative h-screen overflow-hidden bg-black"
    >
      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          shadows
          camera={{ position: [10, 5, 10], fov: 45 }}
          style={{ background: 'transparent' }}
        >
          <Suspense fallback={null}>
            {/* Lighting */}
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />
            <directionalLight position={[-10, -10, -5]} intensity={0.3} />
            <spotLight position={[0, 20, 0]} intensity={0.5} angle={0.3} penumbra={1} />
            
            {/* Environment */}
            <Environment preset="sunset" background={false} />
            
            {/* Yacht Model */}
            <YachtModel scrollProgress={scrollYProgress} />
            
            {/* Controls */}
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2.5}
              autoRotate
              autoRotateSpeed={0.5}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 pointer-events-none" />

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex items-end pb-20">
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

      {/* Scroll Indicator */}
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