import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

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

    // Create yacht group
    const yachtGroup = new THREE.Group();

    // Hull - Main body
    const hullGeometry = new THREE.BoxGeometry(8, 1.5, 2.5);
    hullGeometry.translate(0, 0, 0);
    
    // Modify hull vertices for yacht shape
    const hullPositions = hullGeometry.attributes.position;
    for (let i = 0; i < hullPositions.count; i++) {
      const x = hullPositions.getX(i);
      const y = hullPositions.getY(i);
      const z = hullPositions.getZ(i);
      
      // Taper the front
      if (x > 3) {
        hullPositions.setZ(i, z * (1 - (x - 3) / 5) * 0.7);
        hullPositions.setY(i, y + (x - 3) * 0.1);
      }
      
      // Round the bottom
      if (y < -0.5) {
        hullPositions.setZ(i, z * 0.9);
      }
    }
    hullGeometry.computeVertexNormals();

    const hullMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1
    });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.castShadow = true;
    hull.receiveShadow = true;
    yachtGroup.add(hull);

    // Hull stripe
    const stripeGeometry = new THREE.BoxGeometry(8, 0.1, 0.02);
    const stripeMaterial = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.5
    });
    const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe.position.set(0, 0.3, 1.26);
    yachtGroup.add(stripe);

    // Superstructure
    const superstructureGroup = new THREE.Group();
    superstructureGroup.position.set(0, 1.2, 0);

    // Main deck
    const mainDeckGeometry = new THREE.BoxGeometry(6, 1, 2);
    const deckMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.7,
      roughness: 0.3
    });
    const mainDeck = new THREE.Mesh(mainDeckGeometry, deckMaterial);
    mainDeck.castShadow = true;
    mainDeck.receiveShadow = true;
    superstructureGroup.add(mainDeck);

    // Upper deck
    const upperDeckGeometry = new THREE.BoxGeometry(4, 0.8, 1.5);
    const upperDeck = new THREE.Mesh(upperDeckGeometry, deckMaterial);
    upperDeck.position.set(0, 0.8, 0);
    upperDeck.castShadow = true;
    upperDeck.receiveShadow = true;
    superstructureGroup.add(upperDeck);

    // Flybridge
    const flybridgeGeometry = new THREE.BoxGeometry(2.5, 0.6, 1);
    const flybridge = new THREE.Mesh(flybridgeGeometry, deckMaterial);
    flybridge.position.set(0, 1.4, 0);
    flybridge.castShadow = true;
    flybridge.receiveShadow = true;
    superstructureGroup.add(flybridge);

    yachtGroup.add(superstructureGroup);

    // Windows
    const windowMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x000033,
      metalness: 0.9,
      roughness: 0,
      transmission: 0.5,
      thickness: 0.5
    });

    for (let i = -2; i <= 2; i++) {
      const windowGeometry = new THREE.PlaneGeometry(0.6, 0.4);
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(i * 0.8, 1.2, 1.01);
      yachtGroup.add(window);
    }

    // Radar dome
    const radarGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const radarMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.8,
      roughness: 0.2
    });
    const radar = new THREE.Mesh(radarGeometry, radarMaterial);
    radar.position.set(0, 3.2, 0);
    radar.castShadow = true;
    yachtGroup.add(radar);

    // Antennas
    const antennaGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.8);
    const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    
    const antenna1 = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna1.position.set(-0.5, 3.5, 0);
    yachtGroup.add(antenna1);

    const antenna2 = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna2.position.set(0.5, 3.5, 0);
    yachtGroup.add(antenna2);

    scene.add(yachtGroup);

    // Ocean
    const oceanGeometry = new THREE.PlaneGeometry(100, 100, 64, 64);
    const oceanMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x001030) },
        color2: { value: new THREE.Color(0x002050) }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vWave;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          float wave = sin(pos.x * 0.1 + time) * 2.0;
          wave += sin(pos.y * 0.1 + time * 0.5) * 2.0;
          pos.z += wave;
          vWave = wave;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        varying float vWave;
        
        void main() {
          vec3 color = mix(color1, color2, vUv.y + vWave * 0.1);
          gl_FragColor = vec4(color, 0.95);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -0.75;
    ocean.receiveShadow = true;
    scene.add(ocean);

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
      yachtGroup.position.y = Math.sin(elapsedTime * 0.5) * 0.1;
      yachtGroup.rotation.z = Math.sin(elapsedTime * 0.3) * 0.02;
      
      // Auto rotation with mouse influence
      yachtGroup.rotation.y = elapsedTime * 0.1 + mouseX * 0.5;
      
      // Update ocean
      if (oceanMaterial.uniforms) {
        oceanMaterial.uniforms.time.value = elapsedTime;
      }
      
      // Update lights
      purpleLight.intensity = 2 + Math.sin(elapsedTime * 2) * 0.5;
      
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