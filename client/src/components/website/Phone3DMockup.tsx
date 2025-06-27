import React, { useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

function IPhoneMockup({ screenshot }: { screenshot: string }) {
  const phoneRef = useRef<THREE.Group>(null);

  return (
    <Float
      speed={4}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <group ref={phoneRef} scale={0.8}>
        {/* Phone Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.4, 5, 0.3]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.8} 
            roughness={0.2}
          />
        </mesh>
        
        {/* Screen */}
        <mesh position={[0, 0, 0.16]}>
          <planeGeometry args={[2.2, 4.8]} />
          <meshBasicMaterial>
            <texture attach="map" args={[new THREE.TextureLoader().load(screenshot)]} />
          </meshBasicMaterial>
        </mesh>
        
        {/* Screen Bezel */}
        <mesh position={[0, 0, 0.155]}>
          <boxGeometry args={[2.3, 4.9, 0.01]} />
          <meshStandardMaterial 
            color="#000000" 
            metalness={0.9} 
            roughness={0.1}
            transparent
            opacity={0.3}
          />
        </mesh>
        
        {/* Camera Notch */}
        <mesh position={[0, 2.3, 0.16]}>
          <cylinderGeometry args={[0.15, 0.15, 0.02]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        
        {/* Side Buttons */}
        <mesh position={[1.25, 1, 0]}>
          <boxGeometry args={[0.05, 0.4, 0.2]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} />
        </mesh>
        <mesh position={[1.25, 0.3, 0]}>
          <boxGeometry args={[0.05, 0.3, 0.2]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} />
        </mesh>
        <mesh position={[-1.25, 0.5, 0]}>
          <boxGeometry args={[0.05, 0.8, 0.2]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.7} />
        </mesh>
      </group>
    </Float>
  );
}

interface Phone3DMockupProps {
  screenshot?: string;
}

export default function Phone3DMockup({ 
  screenshot = '/api/media/Screenshot 2025-06-21 at 10.15.18 AM_1750526121299.png' 
}: Phone3DMockupProps) {
  return (
    <div className="relative w-full h-[600px]">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full">
          <div className="text-white/50">Loading 3D Phone...</div>
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 10], fov: 35 }}
          gl={{ antialias: true, alpha: true }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
        >
          <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={35} />
          
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />
          
          {/* Environment for reflections */}
          <Environment preset="studio" />
          
          {/* 3D Phone */}
          <Suspense fallback={null}>
            <IPhoneMockup screenshot={screenshot} />
          </Suspense>
        </Canvas>
      </Suspense>
      
      {/* Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />
    </div>
  );
}