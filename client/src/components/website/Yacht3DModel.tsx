import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';

// Sophisticated 3D Yacht Model with advanced geometry
export function LuxuryYacht3D({ scale = 1, rotation = [0, 0, 0], position = [0, 0, 0] }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = React.useState(false);
  
  // Animate rotation and floating effect
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  // Create yacht geometry programmatically
  return (
    <group 
      ref={groupRef} 
      scale={scale} 
      rotation={rotation} 
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Hull Base - Sleek V-shaped hull */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.8, 10]} />
        <meshStandardMaterial 
          color={hovered ? "#ffffff" : "#f5f5f5"} 
          metalness={0.9} 
          roughness={0.1} 
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Hull Front - Tapered bow */}
      <mesh position={[0, 0, 5.5]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[1.5, 2, 8]} />
        <meshStandardMaterial color="#f5f5f5" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Main Deck */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.1, 9.5]} />
        <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Main Cabin Structure */}
      <mesh position={[0, 1.5, -1]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.2, 5]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Bridge/Upper Deck */}
      <mesh position={[0, 2.7, -1]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.8, 3.5]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Flybridge */}
      <mesh position={[0, 3.5, -1]} castShadow>
        <boxGeometry args={[1.8, 0.6, 2.5]} />
        <meshStandardMaterial color="#f8f8f8" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Windows - Port Side */}
      {[...Array(5)].map((_, i) => (
        <mesh key={`port-window-${i}`} position={[1.26, 1.5, -2.5 + i * 0.8]} castShadow>
          <boxGeometry args={[0.05, 0.4, 0.6]} />
          <meshStandardMaterial 
            color="#000000" 
            metalness={0.95} 
            roughness={0.05} 
            transparent 
            opacity={0.7}
          />
        </mesh>
      ))}
      
      {/* Windows - Starboard Side */}
      {[...Array(5)].map((_, i) => (
        <mesh key={`starboard-window-${i}`} position={[-1.26, 1.5, -2.5 + i * 0.8]} castShadow>
          <boxGeometry args={[0.05, 0.4, 0.6]} />
          <meshStandardMaterial 
            color="#000000" 
            metalness={0.95} 
            roughness={0.05} 
            transparent 
            opacity={0.7}
          />
        </mesh>
      ))}
      
      {/* Radar Mast */}
      <mesh position={[0, 4.5, -1]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 2]} />
        <meshStandardMaterial color="#cccccc" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Radar Array */}
      <mesh position={[0, 5.5, -1]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.2, 0.05, 0.3]} />
        <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Satellite Domes */}
      <mesh position={[0.5, 4.2, -0.5]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[-0.5, 4.2, -0.5]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.7} roughness={0.3} />
      </mesh>
      
      {/* Railings */}
      {/* Port Rail */}
      <mesh position={[1.5, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 8]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Starboard Rail */}
      <mesh position={[-1.5, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 8]} />
        <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Swim Platform */}
      <mesh position={[0, -0.2, -5]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.1, 1.5]} />
        <meshStandardMaterial color="#8B4513" metalness={0.3} roughness={0.7} />
      </mesh>
      
      {/* Tender Garage Door */}
      <mesh position={[0, 0.5, -4.8]} castShadow>
        <boxGeometry args={[2, 0.8, 0.1]} />
        <meshStandardMaterial color="#333333" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Anchor */}
      <mesh position={[0, -0.3, 6.5]} rotation={[0, 0, Math.PI]} castShadow>
        <coneGeometry args={[0.15, 0.4, 4]} />
        <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.1} />
      </mesh>
      
      {/* Propellers */}
      <mesh position={[0.8, -0.5, -5]} rotation={[0, 0, Date.now() * 0.01]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 3]} />
        <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.05} />
      </mesh>
      <mesh position={[-0.8, -0.5, -5]} rotation={[0, 0, -Date.now() * 0.01]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 3]} />
        <meshStandardMaterial color="#FFD700" metalness={0.95} roughness={0.05} />
      </mesh>
      
      {/* Luxury Details */}
      {/* Hot Tub on Flybridge */}
      <mesh position={[0, 4.1, -0.5]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.2]} />
        <meshStandardMaterial color="#4169E1" metalness={0.8} roughness={0.2} transparent opacity={0.8} />
      </mesh>
      
      {/* Sun Loungers */}
      {[...Array(3)].map((_, i) => (
        <mesh key={`lounger-${i}`} position={[-0.8 + i * 0.8, 1, 2]} castShadow>
          <boxGeometry args={[0.5, 0.05, 1.2]} />
          <meshStandardMaterial color="#FFFAF0" metalness={0.2} roughness={0.8} />
        </mesh>
      ))}
      
      {/* Navigation Lights */}
      <mesh position={[1.5, 1, 5]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#00ff00" emissive="#00ff00" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-1.5, 1, 5]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0, 5.6, -1]}>
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
      </mesh>
    </group>
  );
}

// Simplified yacht for performance
export function SimpleYacht3D({ scale = 1, rotation = [0, 0, 0], position = [0, 0, 0] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} scale={scale} rotation={rotation} position={position} castShadow>
      <boxGeometry args={[2, 0.8, 5]} />
      <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
    </mesh>
  );
}