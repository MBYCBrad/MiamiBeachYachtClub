import React, { useState, useRef, Suspense } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import WebsiteLayout from '@/components/website/WebsiteLayout';
import { ChevronLeft, ChevronRight, Anchor, Users, Bed, Waves } from 'lucide-react';

// 3D Yacht Model Component
function Yacht3DModel({ selected }: { selected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <Float
      speed={selected ? 2 : 4}
      rotationIntensity={selected ? 0.5 : 0.3}
      floatIntensity={selected ? 0.8 : 0.5}
    >
      <group scale={selected ? 1.2 : 1}>
        {/* Hull */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.5, 0.6, 6]} />
          <meshStandardMaterial 
            color={selected ? "#ffffff" : "#e0e0e0"} 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
        
        {/* Cabin */}
        <mesh position={[0, 0.6, -0.5]}>
          <boxGeometry args={[2, 1, 3]} />
          <meshStandardMaterial 
            color={selected ? "#f8f8f8" : "#f0f0f0"} 
            metalness={0.7} 
            roughness={0.2} 
          />
        </mesh>
        
        {/* Windows */}
        <mesh position={[1.05, 0.6, -0.5]}>
          <boxGeometry args={[0.05, 0.5, 2]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.9} 
            roughness={0.1}
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh position={[-1.05, 0.6, -0.5]}>
          <boxGeometry args={[0.05, 0.5, 2]} />
          <meshStandardMaterial 
            color="#1a1a1a" 
            metalness={0.9} 
            roughness={0.1}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Upper Deck */}
        <mesh position={[0, 1.2, -0.5]}>
          <boxGeometry args={[1.5, 0.3, 2]} />
          <meshStandardMaterial 
            color="#ffffff" 
            metalness={0.8} 
            roughness={0.15} 
          />
        </mesh>
        
        {/* Mast */}
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 3]} />
          <meshStandardMaterial 
            color="#2a2a2a" 
            metalness={0.95} 
            roughness={0.05} 
          />
        </mesh>
        
        {/* Bow Details */}
        <mesh position={[0, 0, 3.2]}>
          <coneGeometry args={[1.2, 1, 4]} rotation={[Math.PI / 2, 0, 0]} />
          <meshStandardMaterial 
            color={selected ? "#ffffff" : "#e0e0e0"} 
            metalness={0.9} 
            roughness={0.1} 
          />
        </mesh>
      </group>
    </Float>
  );
}

export default function FleetPage() {
  const [selectedYacht, setSelectedYacht] = useState(0);
  const [filter, setFilter] = useState('all');
  
  // Fetch yachts data
  const { data: yachts = [] } = useQuery({
    queryKey: ['/api/yachts'],
  });

  const filteredYachts = filter === 'all' 
    ? yachts 
    : yachts.filter((yacht: any) => {
        const size = parseInt(yacht.size);
        if (filter === 'small') return size <= 50;
        if (filter === 'medium') return size > 50 && size <= 80;
        if (filter === 'large') return size > 80;
        return true;
      });

  const currentYacht = filteredYachts[selectedYacht] || filteredYachts[0];

  const nextYacht = () => {
    setSelectedYacht((prev) => (prev + 1) % filteredYachts.length);
  };

  const prevYacht = () => {
    setSelectedYacht((prev) => (prev - 1 + filteredYachts.length) % filteredYachts.length);
  };

  return (
    <WebsiteLayout>
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-center z-10"
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-thin text-white mb-6">
              Our Fleet
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
              Explore our collection of luxury yachts, each offering a unique experience on the water
            </p>
          </motion.div>
          
          {/* Animated Background */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black" />
            <motion.div
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{ 
                duration: 30, 
                repeat: Infinity, 
                repeatType: 'reverse' 
              }}
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, #7c3aed 0%, transparent 50%), radial-gradient(circle at 80% 80%, #2563eb 0%, transparent 50%)',
                backgroundSize: '200% 200%',
              }}
            />
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="py-8 px-4 border-b border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-center space-x-8">
              {['all', 'small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    setFilter(size);
                    setSelectedYacht(0);
                  }}
                  className={`px-8 py-3 text-sm font-medium rounded-full transition-all duration-300 ${
                    filter === size
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500'
                  }`}
                >
                  {size === 'all' ? 'All Yachts' : 
                   size === 'small' ? 'Up to 50ft' :
                   size === 'medium' ? '50ft - 80ft' : 
                   'Over 80ft'}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 3D Yacht Showcase */}
        <section className="relative py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* 3D Model */}
              <div className="relative h-[600px] order-2 lg:order-1">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-white/50">Loading 3D Model...</div>
                  </div>
                }>
                  <Canvas
                    camera={{ position: [0, 3, 10], fov: 45 }}
                    gl={{ antialias: true, alpha: true }}
                    onCreated={({ gl }) => {
                      gl.setClearColor(0x000000, 0);
                    }}
                  >
                    <PerspectiveCamera makeDefault position={[0, 3, 10]} fov={45} />
                    
                    {/* Lighting */}
                    <ambientLight intensity={0.4} />
                    <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                    <spotLight position={[-10, 10, -5]} intensity={0.5} angle={0.3} penumbra={1} />
                    <pointLight position={[0, -5, 0]} intensity={0.3} color="#4c1d95" />
                    
                    {/* Environment for reflections */}
                    <Environment preset="sunset" />
                    
                    {/* 3D Yacht Model */}
                    <Suspense fallback={null}>
                      <Yacht3DModel selected={true} />
                    </Suspense>
                    
                    {/* Controls */}
                    <OrbitControls 
                      enableZoom={false} 
                      enablePan={false}
                      autoRotate
                      autoRotateSpeed={0.5}
                      minPolarAngle={Math.PI / 3}
                      maxPolarAngle={Math.PI / 2}
                    />
                  </Canvas>
                </Suspense>
                
                {/* Navigation Arrows */}
                <button
                  onClick={prevYacht}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
                  aria-label="Previous yacht"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={nextYacht}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-all"
                  aria-label="Next yacht"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Yacht Details */}
              <AnimatePresence mode="wait">
                {currentYacht && (
                  <motion.div
                    key={currentYacht.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="order-1 lg:order-2"
                  >
                    <h2 className="text-5xl md:text-6xl font-thin text-white mb-6">
                      {currentYacht.name}
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="flex items-center space-x-3">
                        <Anchor className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-gray-500 text-sm">Length</p>
                          <p className="text-white text-xl">{currentYacht.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-gray-500 text-sm">Capacity</p>
                          <p className="text-white text-xl">{currentYacht.capacity} guests</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Bed className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-gray-500 text-sm">Cabins</p>
                          <p className="text-white text-xl">{currentYacht.cabins || 3}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Waves className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-gray-500 text-sm">Type</p>
                          <p className="text-white text-xl">{currentYacht.type}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-400 text-lg leading-relaxed mb-8">
                      {currentYacht.description}
                    </p>

                    <div className="mb-8">
                      <h3 className="text-white text-xl font-medium mb-4">Amenities</h3>
                      <div className="flex flex-wrap gap-3">
                        {(currentYacht.amenities || ['WiFi', 'Air Conditioning', 'Full Kitchen', 'Entertainment System']).map((amenity: string, index: number) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-gray-900 text-gray-300 rounded-full text-sm"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Link href={`/yachts/${currentYacht.id}`}>
                        <a className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all">
                          View Details
                        </a>
                      </Link>
                      <Link href="/auth">
                        <a className="px-8 py-4 border border-white/30 text-white rounded-full hover:bg-white/10 transition-all">
                          Sign In to Book
                        </a>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* Yacht Grid Gallery */}
        <section className="py-20 px-4 bg-gradient-to-b from-black to-gray-950">
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-thin text-white text-center mb-16"
            >
              Browse Our Collection
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredYachts.map((yacht: any, index: number) => (
                <motion.div
                  key={yacht.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer"
                  onClick={() => setSelectedYacht(index)}
                >
                  <div className="aspect-[4/3] bg-gray-900">
                    {yacht.images?.[0] ? (
                      <img
                        src={yacht.images[0]}
                        alt={yacht.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Anchor className="w-20 h-20 text-gray-700" />
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-2xl font-medium text-white mb-2">{yacht.name}</h3>
                    <p className="text-gray-300">{yacht.size} • {yacht.capacity} guests</p>
                  </div>

                  {selectedYacht === index && (
                    <div className="absolute top-4 right-4">
                      <div className="w-3 h-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-thin text-white mb-6">
                Ready to Set Sail?
              </h2>
              <p className="text-xl text-gray-400 mb-12">
                Join Miami Beach Yacht Club and access our entire fleet with exclusive member benefits.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/website/plans">
                  <a className="px-12 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg rounded-full hover:from-purple-700 hover:to-blue-700 transition-all">
                    View Membership Plans
                  </a>
                </Link>
                <Link href="/website/contact">
                  <a className="px-12 py-5 border-2 border-white/30 text-white text-lg rounded-full hover:bg-white/10 transition-all">
                    Schedule a Tour
                  </a>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </WebsiteLayout>
  );
}