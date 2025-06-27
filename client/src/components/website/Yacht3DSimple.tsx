import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// SIMPLE FAST 3D YACHT - Optimized for instant loading
export default function Yacht3DSimple({ 
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

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    sceneRef.current = scene;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: false,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(1);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(25, 15, 25);
    camera.lookAt(0, 5, 0);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    // Simple yacht model
    const yachtGroup = new THREE.Group();
    
    // Hull
    const hullGeometry = new THREE.BoxGeometry(20, 3, 5);
    const hullMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.position.y = 1.5;
    yachtGroup.add(hull);

    // Cabin
    const cabinGeometry = new THREE.BoxGeometry(12, 3, 4);
    const cabin = new THREE.Mesh(cabinGeometry, hullMaterial);
    cabin.position.set(0, 4.5, 0);
    yachtGroup.add(cabin);

    // Windows
    const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x3498db });
    const windowGeometry = new THREE.BoxGeometry(1.5, 1, 4.1);
    
    for (let i = -4; i <= 4; i += 2) {
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(i, 4.5, 0);
      yachtGroup.add(window);
    }

    // Blue stripe
    const stripeGeometry = new THREE.BoxGeometry(20, 0.5, 5.1);
    const stripeMaterial = new THREE.MeshPhongMaterial({ color: 0x0077be });
    const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    stripe.position.y = 2.5;
    yachtGroup.add(stripe);

    scene.add(yachtGroup);

    // Ocean
    const oceanGeometry = new THREE.PlaneGeometry(100, 100);
    const oceanMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x006994,
      opacity: 0.8,
      transparent: true
    });
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    scene.add(ocean);

    // Animation
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      
      yachtGroup.rotation.y += 0.005;
      yachtGroup.position.y = Math.sin(Date.now() * 0.001) * 0.5;
      
      renderer.render(scene, camera);
    };
    
    animate();

    // Resize
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      
      rendererRef.current.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full" ref={mountRef}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute bottom-8 left-8 bg-black/70 backdrop-blur-md p-6 rounded-xl border border-purple-600/20"
      >
        <h3 className="text-white text-2xl font-thin mb-2">{yachtName}</h3>
        <div className="text-gray-400 space-y-1">
          <p>Length: {yachtSpecs.length}</p>
          <p>Cabins: {yachtSpecs.cabins}</p>
          <p>Bathrooms: {yachtSpecs.baths}</p>
        </div>
      </motion.div>
    </div>
  );
}