import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Box, Cylinder, useTexture, Text } from '@react-three/drei';
import * as THREE from 'three';

// 3D iPhone Model Component
function IPhoneModel({ scale = 1 }: { scale?: number }) {
  const phoneRef = useRef<THREE.Group>(null);
  
  // Animate phone floating and rotation
  useFrame((state) => {
    if (phoneRef.current) {
      phoneRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      phoneRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={phoneRef} scale={scale}>
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
      
      {/* Screen Content - App Preview */}
      <group position={[0, 0, 0.051]}>
        {/* Status Bar */}
        <Box args={[0.7, 0.08, 0.001]} position={[0, 0.72, 0]}>
          <meshBasicMaterial color="#333333" />
        </Box>
        
        {/* App Header */}
        <Box args={[0.7, 0.12, 0.001]} position={[0, 0.6, 0]}>
          <meshBasicMaterial color="#6B46C1" />
        </Box>
        
        {/* App Content */}
        <Box args={[0.7, 1.2, 0.001]} position={[0, -0.05, 0]}>
          <meshBasicMaterial color="#1F2937" />
        </Box>
        
        {/* MBYC Logo Area */}
        <Box args={[0.3, 0.3, 0.001]} position={[0, 0.3, 0.001]}>
          <meshBasicMaterial color="#4C1D95" />
        </Box>
        
        {/* Text Elements */}
        <Text
          position={[0, 0.1, 0.002]}
          fontSize={0.06}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          MIAMI BEACH
        </Text>
        <Text
          position={[0, 0.05, 0.002]}
          fontSize={0.05}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          YACHT CLUB
        </Text>
        
        {/* Menu Items */}
        {['Explore Yachts', 'Book Experience', 'Member Benefits'].map((text, i) => (
          <group key={text} position={[0, -0.2 - i * 0.15, 0.002]}>
            <Box args={[0.6, 0.1, 0.001]}>
              <meshBasicMaterial color="#374151" />
            </Box>
            <Text
              fontSize={0.04}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {text}
            </Text>
          </group>
        ))}
      </group>
      
      {/* Camera Bump */}
      <group position={[0.25, 0.65, -0.05]}>
        <RoundedBox args={[0.2, 0.2, 0.02]} radius={0.05} smoothness={4} castShadow>
          <meshStandardMaterial 
            color="#2a2a2a" 
            metalness={0.9} 
            roughness={0.1}
          />
        </RoundedBox>
        
        {/* Camera Lenses */}
        <Cylinder args={[0.06, 0.06, 0.01]} position={[-0.05, 0.05, 0.015]} castShadow>
          <meshStandardMaterial 
            color="#000000" 
            metalness={0.98} 
            roughness={0.02}
          />
        </Cylinder>
        <Cylinder args={[0.06, 0.06, 0.01]} position={[0.05, 0.05, 0.015]} castShadow>
          <meshStandardMaterial 
            color="#000000" 
            metalness={0.98} 
            roughness={0.02}
          />
        </Cylinder>
        <Cylinder args={[0.06, 0.06, 0.01]} position={[0, -0.05, 0.015]} castShadow>
          <meshStandardMaterial 
            color="#000000" 
            metalness={0.98} 
            roughness={0.02}
          />
        </Cylinder>
        
        {/* Flash */}
        <Cylinder args={[0.03, 0.03, 0.01]} position={[0.05, -0.05, 0.015]} castShadow>
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.8} 
            roughness={0.2}
          />
        </Cylinder>
      </group>
      
      {/* Side Buttons */}
      {/* Power Button */}
      <Box args={[0.01, 0.15, 0.04]} position={[0.41, 0.3, 0]} castShadow>
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.9} 
          roughness={0.1}
        />
      </Box>
      
      {/* Volume Buttons */}
      <Box args={[0.01, 0.1, 0.04]} position={[-0.41, 0.4, 0]} castShadow>
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.9} 
          roughness={0.1}
        />
      </Box>
      <Box args={[0.01, 0.1, 0.04]} position={[-0.41, 0.25, 0]} castShadow>
        <meshStandardMaterial 
          color="#2a2a2a" 
          metalness={0.9} 
          roughness={0.1}
        />
      </Box>
      
      {/* Mute Switch */}
      <Box args={[0.01, 0.06, 0.03]} position={[-0.41, 0.55, 0]} castShadow>
        <meshStandardMaterial 
          color="#ff6b6b" 
          metalness={0.8} 
          roughness={0.2}
        />
      </Box>
      
      {/* Speaker Grille */}
      <Box args={[0.3, 0.01, 0.02]} position={[0, -0.78, 0.04]} castShadow>
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.7} 
          roughness={0.3}
        />
      </Box>
      
      {/* Home Indicator */}
      <Box args={[0.15, 0.004, 0.001]} position={[0, -0.7, 0.051]}>
        <meshBasicMaterial color="#666666" />
      </Box>
    </group>
  );
}

export default function Phone3DMockup() {
  return (
    <div className="h-[600px] w-full relative">
      <Canvas
        shadows
        camera={{ position: [0, 0, 3], fov: 45 }}
        className="bg-transparent"
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight position={[-5, 3, -5]} intensity={0.5} />
          <spotLight position={[0, 10, 0]} intensity={0.3} angle={0.3} penumbra={1} />
          
          {/* iPhone Model */}
          <IPhoneModel scale={1.5} />
          
          {/* Controls */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.5}
            autoRotate
            autoRotateSpeed={2}
          />
        </Suspense>
      </Canvas>
      
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
    </div>
  );
}