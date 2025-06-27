import React, { useRef, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  Box, 
  Cylinder, 
  RoundedBox,
  MeshReflectorMaterial,
  useGLTF,
  PresentationControls,
  Stage,
  Float,
  ContactShadows,
  Html,
  useProgress
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// World-class 3D Yacht Model Component
function LuxuryYachtModel() {
  const yachtRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (yachtRef.current) {
      // Gentle floating animation
      yachtRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      yachtRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
      
      // Smooth rotation based on scroll
      const scrollY = window.scrollY;
      yachtRef.current.rotation.y = scrollY * 0.001;
    }
  });

  return (
    <group 
      ref={yachtRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.05 : 1}
    >
      {/* Main Hull - Luxury Design */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[8, 1.5, 2.5]} />
        <meshStandardMaterial 
          color="#1a1a1a" 
          metalness={0.9} 
          roughness={0.1}
          envMapIntensity={1}
        />
      </mesh>
      
      {/* Hull Accent Strip */}
      <mesh position={[0, 0.3, 1.26]}>
        <boxGeometry args={[8, 0.1, 0.02]} />
        <meshStandardMaterial 
          color="#7C3AED" 
          emissive="#7C3AED"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Superstructure - Multi-level */}
      <group position={[0, 1.2, 0]}>
        {/* Main Deck */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 1, 2]} />
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.7} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Upper Deck */}
        <mesh castShadow receiveShadow position={[0, 0.8, 0]}>
          <boxGeometry args={[4, 0.8, 1.5]} />
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.7} 
            roughness={0.3}
          />
        </mesh>
        
        {/* Flybridge */}
        <mesh castShadow receiveShadow position={[0, 1.4, 0]}>
          <boxGeometry args={[2.5, 0.6, 1]} />
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.7} 
            roughness={0.3}
          />
        </mesh>
      </group>
      
      {/* Windows - Tinted Glass */}
      {[-2, -1, 0, 1, 2].map((x, i) => (
        <mesh key={i} position={[x * 0.8, 1.2, 1.01]}>
          <planeGeometry args={[0.6, 0.4]} />
          <meshPhysicalMaterial 
            color="#000033"
            metalness={0.9}
            roughness={0}
            transmission={0.5}
            thickness={0.5}
          />
        </mesh>
      ))}
      
      {/* Radar Dome */}
      <mesh position={[0, 3.2, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffffff" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Antennas */}
      <mesh position={[-0.5, 3.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      <mesh position={[0.5, 3.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8]} />
        <meshStandardMaterial color="#333333" />
      </mesh>
      
      {/* Ambient Lights on Yacht */}
      <pointLight position={[0, 2, 0]} intensity={0.5} color="#7C3AED" />
      <pointLight position={[3, 0.5, 0]} intensity={0.3} color="#3B82F6" />
      <pointLight position={[-3, 0.5, 0]} intensity={0.3} color="#3B82F6" />
    </group>
  );
}

// Loading Component
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="text-white text-center">
        <div className="text-4xl font-thin mb-2">{progress.toFixed(0)}%</div>
        <div className="text-sm text-gray-400">Loading Experience...</div>
      </div>
    </Html>
  );
}

// Water Component
function Ocean() {
  const waterRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.material.uniforms.time.value = state.clock.elapsedTime;
    }
  });
  
  return (
    <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]}>
      <planeGeometry args={[100, 100, 128, 128]} />
      <shaderMaterial
        uniforms={{
          time: { value: 0 },
          color: { value: new THREE.Color("#001030") }
        }}
        vertexShader={`
          uniform float time;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 pos = position;
            pos.z += sin(pos.x * 0.5 + time) * 0.3;
            pos.z += sin(pos.y * 0.5 + time * 0.5) * 0.3;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 color;
          varying vec2 vUv;
          void main() {
            vec3 finalColor = mix(color, vec3(0.0, 0.2, 0.5), vUv.y);
            gl_FragColor = vec4(finalColor, 0.95);
          }
        `}
        transparent
      />
    </mesh>
  );
}

// Main 3D Scene Component
function Scene() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <spotLight
        position={[-10, 10, -5]}
        intensity={0.5}
        angle={0.5}
        penumbra={1}
        color="#7C3AED"
      />
      
      {/* Environment */}
      <Environment preset="sunset" />
      <fog attach="fog" args={['#001030', 10, 50]} />
      
      {/* Ocean */}
      <Ocean />
      
      {/* Yacht Model */}
      <Float
        speed={2}
        rotationIntensity={0.2}
        floatIntensity={0.5}
      >
        <LuxuryYachtModel />
      </Float>
      
      {/* Camera Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.5}
        autoRotate
        autoRotateSpeed={0.5}
      />
      
      {/* Contact Shadows */}
      <ContactShadows
        position={[0, -0.75, 0]}
        opacity={0.5}
        scale={20}
        blur={2}
        far={10}
      />
    </>
  );
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Main Component
export default function Yacht3DShowcase({ 
  yachtName, 
  yachtSpecs 
}: { 
  yachtName: string; 
  yachtSpecs: { 
    length: string; 
    cabins: number; 
    baths: number; 
  } 
}) {
  const [webGLSupported, setWebGLSupported] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebGLSupported(false);
      }
    } catch (e) {
      setWebGLSupported(false);
    }
  }, []);

  // Fallback UI
  const fallbackUI = (
    <div className="relative h-[600px] bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-[url('/api/media/yacht-hero.jpg')] bg-cover bg-center opacity-50" />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-thin text-white mb-4"
        >
          {yachtName}
        </motion.h3>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center space-x-6 text-gray-300"
        >
          <span>Length: {yachtSpecs.length}</span>
          <span>•</span>
          <span>Cabins: {yachtSpecs.cabins}</span>
          <span>•</span>
          <span>Baths: {yachtSpecs.baths}</span>
        </motion.div>
      </div>
    </div>
  );

  if (!webGLSupported) {
    return fallbackUI;
  }

  return (
    <section className="relative py-32">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-thin text-white mb-4">
            {yachtName}
          </h2>
          <div className="flex items-center justify-center space-x-6 text-xl text-gray-400">
            <span>Length: {yachtSpecs.length}</span>
            <span>•</span>
            <span>Cabins: {yachtSpecs.cabins}</span>
            <span>•</span>
            <span>Baths: {yachtSpecs.baths}</span>
          </div>
        </motion.div>

        {/* 3D Canvas */}
        <div className="relative h-[600px] rounded-lg overflow-hidden">
          <ErrorBoundary fallback={fallbackUI}>
            <Canvas
              shadows
              camera={{ position: [15, 8, 15], fov: 45 }}
              className="bg-gradient-to-b from-gray-900 to-black"
            >
              <Suspense fallback={<Loader />}>
                <Scene />
              </Suspense>
            </Canvas>
          </ErrorBoundary>

          {/* Overlay Controls */}
          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="text-white"
            >
              <p className="text-sm text-gray-400 mb-1">Interactive 3D Model</p>
              <p className="text-xs text-gray-500">Drag to rotate • Scroll to zoom</p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              onClick={() => setShowDetails(!showDetails)}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              View Details
            </motion.button>
          </div>
        </div>

        {/* Details Panel */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {/* Add yacht details here */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}