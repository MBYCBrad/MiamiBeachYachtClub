import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// OPTIMIZED LUXURY YACHT MODEL - High detail with performance
export default function Yacht3DOptimized({ 
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
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);
  const yachtRef = useRef<THREE.Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    scene.fog = new THREE.Fog(0x000814, 50, 200);
    sceneRef.current = scene;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      500
    );
    camera.position.set(60, 30, 60);
    camera.lookAt(0, 10, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(50, 100, 30);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x4080ff, 0.4);
    fillLight.position.set(-30, 50, -20);
    scene.add(fillLight);

    // Purple/blue accent lights
    const purpleLight = new THREE.PointLight(0x9b59b6, 0.6, 100);
    purpleLight.position.set(0, 20, 0);
    scene.add(purpleLight);

    const blueLight = new THREE.PointLight(0x3498db, 0.5, 100);
    blueLight.position.set(20, 15, -20);
    scene.add(blueLight);

    // Create optimized yacht model
    const yachtGroup = new THREE.Group();
    yachtRef.current = yachtGroup;
    
    // Hull material - luxury white with subtle blue tint
    const hullMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf8f9fa,
      metalness: 0.3,
      roughness: 0.1,
      clearcoat: 1,
      clearcoatRoughness: 0.1
    });

    // Blue accent material
    const accentMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0077be,
      metalness: 0.6,
      roughness: 0.2
    });

    // Glass material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      metalness: 0.1,
      roughness: 0,
      transmission: 0.9,
      transparent: true,
      opacity: 0.7
    });

    // Chrome material
    const chromeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.05
    });

    setLoadingProgress(20);

    // HULL CONSTRUCTION
    // Main hull body
    const hullGeometry = new THREE.BufferGeometry();
    const hullVertices = [];
    const hullIndices = [];
    
    // Create hull shape with proper yacht curves
    const segments = 40;
    const levels = 20;
    
    for (let j = 0; j <= levels; j++) {
      const y = j / levels * 8;
      const levelRadius = Math.sin((j / levels) * Math.PI * 0.7) * 4;
      const levelLength = 1 - Math.pow(j / levels, 2) * 0.3;
      
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments - 0.5) * Math.PI;
        const x = Math.sin(angle) * levelRadius;
        const z = (i / segments - 0.5) * 40 * levelLength;
        
        hullVertices.push(x, y, z);
      }
    }
    
    // Create hull faces
    for (let j = 0; j < levels; j++) {
      for (let i = 0; i < segments; i++) {
        const a = j * (segments + 1) + i;
        const b = j * (segments + 1) + i + 1;
        const c = (j + 1) * (segments + 1) + i;
        const d = (j + 1) * (segments + 1) + i + 1;
        
        hullIndices.push(a, b, c);
        hullIndices.push(b, d, c);
      }
    }
    
    hullGeometry.setAttribute('position', new THREE.Float32BufferAttribute(hullVertices, 3));
    hullGeometry.setIndex(hullIndices);
    hullGeometry.computeVertexNormals();
    
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.castShadow = true;
    hull.receiveShadow = true;
    yachtGroup.add(hull);

    setLoadingProgress(40);

    // DECK AND SUPERSTRUCTURE
    // Main deck
    const deckGeometry = new THREE.BoxGeometry(35, 0.5, 8);
    const deck = new THREE.Mesh(deckGeometry, hullMaterial);
    deck.position.set(0, 8.2, 0);
    deck.castShadow = true;
    yachtGroup.add(deck);

    // Forward deck
    const forwardDeckGeometry = new THREE.BoxGeometry(10, 0.5, 6);
    const forwardDeck = new THREE.Mesh(forwardDeckGeometry, hullMaterial);
    forwardDeck.position.set(15, 8.2, 0);
    yachtGroup.add(forwardDeck);

    // Aft deck
    const aftDeckGeometry = new THREE.BoxGeometry(12, 0.5, 7);
    const aftDeck = new THREE.Mesh(aftDeckGeometry, hullMaterial);
    aftDeck.position.set(-15, 8.2, 0);
    yachtGroup.add(aftDeck);

    // Blue stripe along hull
    const stripeGeometry = new THREE.BoxGeometry(36, 0.8, 8.2);
    const stripe = new THREE.Mesh(stripeGeometry, accentMaterial);
    stripe.position.set(0, 6, 0);
    yachtGroup.add(stripe);

    setLoadingProgress(60);

    // CABIN STRUCTURE
    // Main cabin
    const cabinGeometry = new THREE.BoxGeometry(20, 6, 6);
    const cabin = new THREE.Mesh(cabinGeometry, hullMaterial);
    cabin.position.set(0, 11.5, 0);
    cabin.castShadow = true;
    yachtGroup.add(cabin);

    // Cabin windows
    const windowGeometry = new THREE.BoxGeometry(2, 2, 6.1);
    for (let i = -8; i <= 8; i += 4) {
      const window = new THREE.Mesh(windowGeometry, glassMaterial);
      window.position.set(i, 11.5, 0);
      yachtGroup.add(window);
    }

    // Bridge
    const bridgeGeometry = new THREE.BoxGeometry(12, 4, 5);
    const bridge = new THREE.Mesh(bridgeGeometry, hullMaterial);
    bridge.position.set(5, 15, 0);
    bridge.castShadow = true;
    yachtGroup.add(bridge);

    // Bridge windows
    const bridgeWindowGeometry = new THREE.BoxGeometry(10, 2, 5.1);
    const bridgeWindow = new THREE.Mesh(bridgeWindowGeometry, glassMaterial);
    bridgeWindow.position.set(5, 15.5, 0);
    yachtGroup.add(bridgeWindow);

    setLoadingProgress(80);

    // DETAILS
    // Railings
    const railingMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1
    });

    // Side railings
    const railingGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1);
    for (let i = -18; i <= 18; i += 2) {
      const leftRail = new THREE.Mesh(railingGeometry, railingMaterial);
      leftRail.position.set(i, 9, 4);
      yachtGroup.add(leftRail);
      
      const rightRail = new THREE.Mesh(railingGeometry, railingMaterial);
      rightRail.position.set(i, 9, -4);
      yachtGroup.add(rightRail);
    }

    // Radar dome
    const radarGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const radar = new THREE.Mesh(radarGeometry, hullMaterial);
    radar.position.set(5, 18, 0);
    radar.castShadow = true;
    yachtGroup.add(radar);

    // Antennas
    const antennaGeometry = new THREE.CylinderGeometry(0.03, 0.03, 3);
    const antennaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2a2a2a,
      metalness: 0.9,
      roughness: 0.2
    });
    
    const antenna1 = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna1.position.set(3, 19, 1);
    yachtGroup.add(antenna1);
    
    const antenna2 = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna2.position.set(7, 19, -1);
    yachtGroup.add(antenna2);

    // Life boats
    const lifeBoatGeometry = new THREE.BoxGeometry(3, 1, 1.5);
    const lifeBoatMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff6b35,
      roughness: 0.5
    });
    
    const lifeBoat1 = new THREE.Mesh(lifeBoatGeometry, lifeBoatMaterial);
    lifeBoat1.position.set(-10, 10, 3.5);
    yachtGroup.add(lifeBoat1);
    
    const lifeBoat2 = new THREE.Mesh(lifeBoatGeometry, lifeBoatMaterial);
    lifeBoat2.position.set(-10, 10, -3.5);
    yachtGroup.add(lifeBoat2);

    // Yacht name plate
    const namePlateGeometry = new THREE.BoxGeometry(4, 0.5, 0.05);
    const namePlateMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x000080,
      metalness: 0.5,
      roughness: 0.3
    });
    const namePlate = new THREE.Mesh(namePlateGeometry, namePlateMaterial);
    namePlate.position.set(-15, 5, -4.05);
    yachtGroup.add(namePlate);

    scene.add(yachtGroup);

    // OCEAN
    const oceanGeometry = new THREE.PlaneGeometry(300, 300, 50, 50);
    const oceanMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x006994,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.9
    });
    
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = 0;
    ocean.receiveShadow = true;
    
    // Animate ocean vertices
    const oceanVertices = oceanGeometry.attributes.position;
    const originalPositions = Float32Array.from(oceanVertices.array);
    
    scene.add(ocean);

    setLoadingProgress(100);
    setTimeout(() => setIsLoading(false), 500);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      
      // Animate yacht
      if (yachtRef.current) {
        yachtRef.current.rotation.y = elapsedTime * 0.05 + mouseX * 0.5;
        yachtRef.current.position.y = Math.sin(elapsedTime * 0.5) * 0.5 + 2;
        yachtRef.current.rotation.z = Math.sin(elapsedTime * 0.3) * 0.02;
        yachtRef.current.rotation.x = Math.sin(elapsedTime * 0.4) * 0.01 + mouseY * 0.1;
      }
      
      // Animate ocean
      for (let i = 0; i < oceanVertices.count; i++) {
        const x = originalPositions[i * 3];
        const z = originalPositions[i * 3 + 2];
        
        const wave1 = Math.sin(x * 0.03 + elapsedTime) * 1.5;
        const wave2 = Math.sin(z * 0.02 + elapsedTime * 0.8) * 1.2;
        const wave3 = Math.sin(x * 0.01 + z * 0.01 + elapsedTime * 0.5) * 2;
        
        oceanVertices.setY(i, wave1 + wave2 + wave3);
      }
      oceanVertices.needsUpdate = true;
      
      // Update camera
      camera.position.x = 60 * Math.cos(elapsedTime * 0.1);
      camera.position.z = 60 * Math.sin(elapsedTime * 0.1);
      camera.lookAt(0, 10, 0);
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      scene.clear();
    };
  }, []);

  return (
    <div className="relative w-full h-full" ref={mountRef}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-4 relative">
              <div className="absolute inset-0 border-4 border-purple-600/20 rounded-full"></div>
              <div 
                className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"
                style={{ animationDuration: '1s' }}
              ></div>
            </div>
            <p className="text-white text-xl mb-2">Loading Luxury Yacht</p>
            <p className="text-gray-400">{loadingProgress}%</p>
          </div>
        </div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
        className="absolute bottom-8 left-8 bg-black/70 backdrop-blur-md p-6 rounded-xl border border-purple-600/20"
      >
        <h3 className="text-white text-2xl font-thin mb-2">{yachtName}</h3>
        <div className="text-gray-400 space-y-1">
          <p>Length: {yachtSpecs.length}</p>
          <p>Cabins: {yachtSpecs.cabins}</p>
          <p>Bathrooms: {yachtSpecs.baths}</p>
        </div>
        <p className="text-purple-400 text-sm mt-3">Move mouse to explore</p>
      </motion.div>
    </div>
  );
}