import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Helper function to create wood texture
function createWoodTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext('2d')!;
  
  // Create wood grain pattern
  const gradient = context.createLinearGradient(0, 0, 512, 0);
  gradient.addColorStop(0, '#8B4513');
  gradient.addColorStop(0.5, '#A0522D');
  gradient.addColorStop(1, '#8B4513');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);
  
  // Add wood grain lines
  context.strokeStyle = '#654321';
  context.lineWidth = 1;
  for (let i = 0; i < 512; i += 8) {
    context.beginPath();
    context.moveTo(0, i);
    context.lineTo(512, i);
    context.stroke();
  }
  
  return canvas;
}

export default function Yacht3DCustom({ 
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 10, 100);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(20, 10, 20);
    camera.lookAt(0, 0, 0);

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
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 20, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.mapSize.set(2048, 2048);
    scene.add(directionalLight);

    // Purple accent light
    const purpleLight = new THREE.PointLight(0x7c3aed, 2, 50);
    purpleLight.position.set(0, 5, 0);
    scene.add(purpleLight);

    // Blue accent lights
    const blueLight1 = new THREE.PointLight(0x3b82f6, 1, 30);
    blueLight1.position.set(10, 2, 0);
    scene.add(blueLight1);

    const blueLight2 = new THREE.PointLight(0x3b82f6, 1, 30);
    blueLight2.position.set(-10, 2, 0);
    scene.add(blueLight2);

    // LUXURY YACHT - EXACT REPLICA OF SKETCHFAB MODEL
    const yachtGroup = new THREE.Group();

    // PART 1: MAIN HULL BODY - Sleek white fiberglass hull
    const hullCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, 0, 0),
      new THREE.Vector3(-5.8, -0.3, 0),
      new THREE.Vector3(-4, -0.8, 0),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(4, -0.8, 0),
      new THREE.Vector3(5.8, -0.3, 0),
      new THREE.Vector3(6, 0.2, 0)
    ]);

    const hullShape = new THREE.Shape();
    hullShape.moveTo(0, 0);
    hullShape.bezierCurveTo(0, -1.2, 0.8, -1.5, 1.5, -1.5);
    hullShape.lineTo(1.5, 0.5);
    hullShape.bezierCurveTo(1.5, 0.8, 1.2, 1, 0.8, 1);
    hullShape.lineTo(-0.8, 1);
    hullShape.bezierCurveTo(-1.2, 1, -1.5, 0.8, -1.5, 0.5);
    hullShape.lineTo(-1.5, -1.5);
    hullShape.bezierCurveTo(-0.8, -1.5, 0, -1.2, 0, 0);

    const hullGeometry = new THREE.ExtrudeGeometry(hullShape, {
      steps: 100,
      extrudePath: hullCurve,
      bevelEnabled: false
    });

    const hullMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.4,
      roughness: 0.1,
      envMapIntensity: 2
    });

    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.rotation.y = Math.PI / 2;
    hull.castShadow = true;
    hull.receiveShadow = true;
    yachtGroup.add(hull);

    // PART 2: BLUE WATERLINE STRIPE
    const waterlineGeometry = new THREE.BoxGeometry(12, 0.08, 3.1);
    const waterlineMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      metalness: 0.8,
      roughness: 0.2
    });
    const waterline = new THREE.Mesh(waterlineGeometry, waterlineMaterial);
    waterline.position.set(0, -0.6, 0);
    yachtGroup.add(waterline);

    // PART 3: MAIN DECK - Teak wood decking with realistic texture
    const deckPlanks = new THREE.Group();
    const woodTexture = new THREE.CanvasTexture(createWoodTexture());
    const plankMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.7,
      metalness: 0.05
    });

    // Individual teak planks
    for (let i = 0; i < 40; i++) {
      const plankGeometry = new THREE.BoxGeometry(0.15, 0.02, 2.8);
      const plank = new THREE.Mesh(plankGeometry, plankMaterial);
      plank.position.set(-6 + i * 0.3, 0.5, 0);
      deckPlanks.add(plank);
    }
    yachtGroup.add(deckPlanks);

    // PART 4: BOW DECK - Forward deck area
    const bowDeckGeometry = new THREE.BoxGeometry(3, 0.1, 2.5);
    const bowDeck = new THREE.Mesh(bowDeckGeometry, plankMaterial);
    bowDeck.position.set(4.5, 0.55, 0);
    yachtGroup.add(bowDeck);

    // PART 5: SUPERSTRUCTURE BASE - Main cabin structure
    const cabinBase = new THREE.Group();
    
    // Lower cabin level
    const lowerCabinGeometry = new THREE.BoxGeometry(7, 1.8, 2.4);
    const cabinMaterial = new THREE.MeshStandardMaterial({
      color: 0xf8f8f8,
      metalness: 0.3,
      roughness: 0.4
    });
    const lowerCabin = new THREE.Mesh(lowerCabinGeometry, cabinMaterial);
    lowerCabin.position.set(-0.5, 1.5, 0);
    lowerCabin.castShadow = true;
    cabinBase.add(lowerCabin);

    // PART 6: PANORAMIC WINDOWS - Dark tinted glass
    const windowGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x000011,
      metalness: 0,
      roughness: 0,
      transmission: 0.3,
      opacity: 0.7,
      transparent: true,
      thickness: 0.5,
      ior: 1.5
    });

    // Front windshield - Curved panoramic
    const windshieldGeometry = new THREE.BoxGeometry(6.5, 1, 0.05);
    const windshield = new THREE.Mesh(windshieldGeometry, windowGlassMaterial);
    windshield.position.set(-0.5, 1.5, 1.23);
    windshield.rotation.x = -0.15;
    cabinBase.add(windshield);

    // Side windows - Port
    const portWindowGeometry = new THREE.BoxGeometry(0.05, 1, 2);
    const portWindow = new THREE.Mesh(portWindowGeometry, windowGlassMaterial);
    portWindow.position.set(-4, 1.5, 0);
    cabinBase.add(portWindow);

    // Side windows - Starboard
    const starboardWindow = new THREE.Mesh(portWindowGeometry, windowGlassMaterial);
    starboardWindow.position.set(3, 1.5, 0);
    cabinBase.add(starboardWindow);

    // PART 7: UPPER DECK STRUCTURE
    const upperDeckGeometry = new THREE.BoxGeometry(5, 1.2, 2);
    const upperDeck = new THREE.Mesh(upperDeckGeometry, cabinMaterial);
    upperDeck.position.set(-0.5, 2.8, 0);
    upperDeck.castShadow = true;
    cabinBase.add(upperDeck);

    // PART 8: FLYBRIDGE
    const flybridgeGeometry = new THREE.BoxGeometry(3.5, 1, 1.8);
    const flybridge = new THREE.Mesh(flybridgeGeometry, cabinMaterial);
    flybridge.position.set(-0.5, 4, 0);
    flybridge.castShadow = true;
    cabinBase.add(flybridge);

    // PART 9: FLYBRIDGE WINDSCREEN
    const flybridgeWindscreenGeometry = new THREE.BoxGeometry(3.2, 0.6, 0.05);
    const flybridgeWindscreen = new THREE.Mesh(flybridgeWindscreenGeometry, windowGlassMaterial);
    flybridgeWindscreen.position.set(-0.5, 4, 0.93);
    flybridgeWindscreen.rotation.x = -0.2;
    cabinBase.add(flybridgeWindscreen);

    yachtGroup.add(cabinBase);

    // PART 10: RADAR ARCH - Stainless steel
    const archMaterial = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      metalness: 0.9,
      roughness: 0.1
    });

    const archCurve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-1.5, 4.5, -1),
      new THREE.Vector3(-0.5, 5.5, 0),
      new THREE.Vector3(-1.5, 4.5, 1)
    );

    const archGeometry = new THREE.TubeGeometry(archCurve, 20, 0.08, 8, false);
    const arch = new THREE.Mesh(archGeometry, archMaterial);
    yachtGroup.add(arch);

    // PART 11: RADAR DOME
    const radarDomeGeometry = new THREE.SphereGeometry(0.35, 32, 16);
    const radarDomeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.6
    });
    const radarDome = new THREE.Mesh(radarDomeGeometry, radarDomeMaterial);
    radarDome.position.set(-0.5, 5.2, 0);
    yachtGroup.add(radarDome);

    // PART 12: COMMUNICATION ANTENNAS
    const antennaData = [
      { x: -0.2, y: 5.2, z: 0.5, height: 1.2 },
      { x: -0.8, y: 5.2, z: -0.5, height: 1.0 },
      { x: -0.5, y: 5.5, z: 0, height: 0.8 }
    ];

    antennaData.forEach(data => {
      const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, data.height);
      const antennaMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        metalness: 0.9,
        roughness: 0.1
      });
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.set(data.x, data.y + data.height/2, data.z);
      yachtGroup.add(antenna);
    });

    // PART 13: DECK RAILINGS - Stainless steel
    const railingPoints = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 19) * Math.PI;
      railingPoints.push(new THREE.Vector3(
        Math.cos(angle) * 1.4 + 4.5,
        1,
        Math.sin(angle) * 1.2
      ));
    }
    
    const railingCurve = new THREE.CatmullRomCurve3(railingPoints);
    const railingGeometry = new THREE.TubeGeometry(railingCurve, 50, 0.03, 8, false);
    const bowRailing = new THREE.Mesh(railingGeometry, archMaterial);
    yachtGroup.add(bowRailing);

    // PART 14: STERN PLATFORM
    const sternPlatformGeometry = new THREE.BoxGeometry(2, 0.1, 2.4);
    const sternPlatform = new THREE.Mesh(sternPlatformGeometry, plankMaterial);
    sternPlatform.position.set(-6.5, -0.3, 0);
    yachtGroup.add(sternPlatform);

    // PART 15: SWIM LADDER
    const ladderStep = new THREE.BoxGeometry(0.05, 0.02, 0.8);
    for (let i = 0; i < 4; i++) {
      const step = new THREE.Mesh(ladderStep, archMaterial);
      step.position.set(-7.5, -0.3 - i * 0.3, 0);
      yachtGroup.add(step);
    }

    // PART 16: DECK FURNITURE - Sun pads
    const sunpadMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5dc,
      roughness: 0.8
    });
    
    const forwardSunpadGeometry = new THREE.BoxGeometry(2, 0.3, 2.2);
    const forwardSunpad = new THREE.Mesh(forwardSunpadGeometry, sunpadMaterial);
    forwardSunpad.position.set(4, 0.8, 0);
    yachtGroup.add(forwardSunpad);

    // PART 17: ANCHOR WINDLASS
    const windlassGeometry = new THREE.CylinderGeometry(0.2, 0.25, 0.3);
    const windlassMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.3
    });
    const windlass = new THREE.Mesh(windlassGeometry, windlassMaterial);
    windlass.position.set(5.5, 0.7, 0);
    yachtGroup.add(windlass);

    // PART 18: NAVIGATION LIGHTS
    const navLightGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    
    // Port (red)
    const portLightMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    });
    const portLight = new THREE.Mesh(navLightGeometry, portLightMaterial);
    portLight.position.set(5.8, 0.8, -1);
    yachtGroup.add(portLight);

    // Starboard (green)
    const starboardLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5
    });
    const starboardLight = new THREE.Mesh(navLightGeometry, starboardLightMaterial);
    starboardLight.position.set(5.8, 0.8, 1);
    yachtGroup.add(starboardLight);

    // PART 19: LUXURY DECK FURNITURE
    const furnitureGroup = new THREE.Group();
    
    // Sun loungers on foredeck
    const loungerGeometry = new THREE.BoxGeometry(0.6, 0.1, 1.5);
    const loungerMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f0f0,
      roughness: 0.3
    });
    
    for (let i = 0; i < 2; i++) {
      const lounger = new THREE.Mesh(loungerGeometry, loungerMaterial);
      lounger.position.set(4, 0.7, -0.8 + i * 1.6);
      furnitureGroup.add(lounger);
      
      // Cushions
      const cushionGeometry = new THREE.BoxGeometry(0.55, 0.05, 1.4);
      const cushionMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a237e,
        roughness: 0.8
      });
      const cushion = new THREE.Mesh(cushionGeometry, cushionMaterial);
      cushion.position.set(4, 0.78, -0.8 + i * 1.6);
      furnitureGroup.add(cushion);
    }
    
    yachtGroup.add(furnitureGroup);
    
    // PART 20: SWIMMING PLATFORM
    const swimPlatformGeometry = new THREE.BoxGeometry(2, 0.05, 1.5);
    const swimPlatformMaterial = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.8,
      metalness: 0.1
    });
    const swimPlatform = new THREE.Mesh(swimPlatformGeometry, swimPlatformMaterial);
    swimPlatform.position.set(-6.5, -0.5, 0);
    yachtGroup.add(swimPlatform);
    
    // PART 21: STAINLESS STEEL DETAILS
    const stainlessMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8e8e8,
      metalness: 0.9,
      roughness: 0.1
    });
    
    // Cleats
    for (let i = 0; i < 4; i++) {
      const cleatGeometry = new THREE.CylinderGeometry(0.03, 0.05, 0.15, 8);
      const cleat = new THREE.Mesh(cleatGeometry, stainlessMaterial);
      cleat.position.set(-4 + i * 3, 0.6, i % 2 === 0 ? 1.3 : -1.3);
      yachtGroup.add(cleat);
    }
    
    // Bow pulpit
    const pulpitCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(5.5, 1, -1),
      new THREE.Vector3(6, 1, 0),
      new THREE.Vector3(5.5, 1, 1)
    ]);
    const pulpitGeometry = new THREE.TubeGeometry(pulpitCurve, 20, 0.03, 8, false);
    const pulpit = new THREE.Mesh(pulpitGeometry, stainlessMaterial);
    yachtGroup.add(pulpit);

    // Scale to match reference
    yachtGroup.scale.set(0.8, 0.8, 0.8);
    
    scene.add(yachtGroup);

    // Add a subtle platform/base instead of water
    const platformGeometry = new THREE.CylinderGeometry(15, 15, 0.2, 64);
    const platformMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2
    });
    const platform = new THREE.Mesh(platformGeometry, platformMaterial);
    platform.position.y = -1;
    platform.receiveShadow = true;
    scene.add(platform);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    
    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('mousemove', handleMouseMove);

    // Animation
    const clock = new THREE.Clock();
    
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();
      
      // Yacht floating animation
      if (yachtGroup) {
        yachtGroup.position.y = Math.sin(elapsedTime * 0.5) * 0.1;
        yachtGroup.rotation.z = Math.sin(elapsedTime * 0.3) * 0.02;
        
        // Auto rotation with mouse influence
        yachtGroup.rotation.y = elapsedTime * 0.1 + mouseX * 0.5;
      }
      
      // Update lights
      if (purpleLight) {
        purpleLight.intensity = 2 + Math.sin(elapsedTime * 2) * 0.5;
      }
      
      // Camera orbit
      camera.position.x = Math.cos(elapsedTime * 0.1 + mouseX) * 25;
      camera.position.z = Math.sin(elapsedTime * 0.1 + mouseX) * 25;
      camera.position.y = 10 + mouseY * 5;
      camera.lookAt(0, 0, 0);
      
      renderer.render(scene, camera);
    };

    // Start animation after a brief delay
    setTimeout(() => {
      setIsLoading(false);
      animate();
    }, 100);

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
    };
  }, []);

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

        {/* 3D Canvas Container */}
        <div className="relative h-[600px] rounded-lg overflow-hidden bg-gradient-to-b from-gray-900 to-black">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white text-center"
              >
                <div className="text-4xl font-thin mb-2">Loading...</div>
                <div className="text-sm text-gray-400">Preparing 3D Experience</div>
              </motion.div>
            </div>
          )}
          
          <div 
            ref={mountRef} 
            className={`w-full h-full transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          />

          {/* Overlay Controls */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-8 left-8 right-8 flex justify-between items-end pointer-events-none"
          >
            <div className="text-white">
              <p className="text-sm text-gray-400 mb-1">Interactive 3D Model</p>
              <p className="text-xs text-gray-500">Move your mouse to explore</p>
            </div>

            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:from-purple-700 hover:to-blue-700 transition-all pointer-events-auto">
              View Details
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}