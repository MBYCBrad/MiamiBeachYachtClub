import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Yacht3DDetailedProps {
  yachtName?: string;
  yachtSpecs?: {
    length: string;
    cabins: number;
    baths: number;
  };
}

export default function Yacht3DDetailed({ yachtName, yachtSpecs }: Yacht3DDetailedProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      50,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(40, 25, 40);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minDistance = 20;
    controls.maxDistance = 100;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(50, 50, 50);
    mainLight.castShadow = true;
    mainLight.shadow.camera.left = -50;
    mainLight.shadow.camera.right = 50;
    mainLight.shadow.camera.top = 50;
    mainLight.shadow.camera.bottom = -50;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Purple accent light
    const purpleLight = new THREE.PointLight(0x9b59b6, 0.5, 100);
    purpleLight.position.set(-20, 20, 20);
    scene.add(purpleLight);

    // Blue accent light
    const blueLight = new THREE.PointLight(0x3498db, 0.5, 100);
    blueLight.position.set(20, 20, -20);
    scene.add(blueLight);

    // Create yacht group
    const yacht = new THREE.Group();

    // Materials
    const hullMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });

    const deckMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd4a574,
      metalness: 0.1,
      roughness: 0.6,
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      metalness: 0.1,
      roughness: 0,
      transmission: 0.9,
      thickness: 0.5,
      opacity: 0.7,
      transparent: true,
    });

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.2,
    });

    const interiorWallMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5f5f5,
      metalness: 0,
      roughness: 0.8,
    });

    const luxuryFloorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8b4513,
      metalness: 0.1,
      roughness: 0.3,
    });

    // Hull (main body)
    const hullGeometry = new THREE.BufferGeometry();
    const hullVertices = [];
    const hullIndices = [];

    // Create hull shape with proper bow and stern
    const hullLength = 30;
    const hullWidth = 8;
    const hullHeight = 6;
    const segments = 20;

    // Generate hull vertices
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = (t - 0.5) * hullLength;
      
      // Hull profile - narrower at bow and stern
      const widthFactor = 1 - Math.pow(Math.abs(t - 0.5) * 2, 2) * 0.3;
      const w = hullWidth * widthFactor;
      
      // Bottom curve
      for (let j = 0; j <= 10; j++) {
        const angle = (j / 10) * Math.PI;
        const y = -Math.sin(angle) * hullHeight * 0.5;
        const z = Math.cos(angle) * w * 0.5;
        hullVertices.push(x, y, z);
      }
    }

    // Create hull faces
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < 10; j++) {
        const a = i * 11 + j;
        const b = i * 11 + j + 1;
        const c = (i + 1) * 11 + j;
        const d = (i + 1) * 11 + j + 1;
        
        hullIndices.push(a, b, d);
        hullIndices.push(a, d, c);
      }
    }

    hullGeometry.setAttribute('position', new THREE.Float32BufferAttribute(hullVertices, 3));
    hullGeometry.setIndex(hullIndices);
    hullGeometry.computeVertexNormals();

    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.castShadow = true;
    hull.receiveShadow = true;
    yacht.add(hull);

    // Main Deck
    const deckGeometry = new THREE.BoxGeometry(hullLength * 0.95, 0.5, hullWidth * 0.9);
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.y = 0;
    deck.castShadow = true;
    deck.receiveShadow = true;
    yacht.add(deck);

    // Superstructure with multiple levels
    const superstructure = new THREE.Group();

    // Lower deck cabin
    const lowerCabinGeometry = new THREE.BoxGeometry(20, 3, 6);
    const lowerCabin = new THREE.Mesh(lowerCabinGeometry, interiorWallMaterial);
    lowerCabin.position.set(0, 1.75, 0);
    superstructure.add(lowerCabin);

    // Main deck windows
    const windowPositions = [-8, -4, 0, 4, 8];
    windowPositions.forEach(x => {
      const windowGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
      const windowMesh = new THREE.Mesh(windowGeometry, glassMaterial);
      windowMesh.position.set(x, 1.75, 3.05);
      superstructure.add(windowMesh);
      
      const windowMesh2 = windowMesh.clone();
      windowMesh2.position.z = -3.05;
      superstructure.add(windowMesh2);
    });

    // Upper deck
    const upperDeckGeometry = new THREE.BoxGeometry(16, 0.3, 5);
    const upperDeck = new THREE.Mesh(upperDeckGeometry, deckMaterial);
    upperDeck.position.set(0, 3.5, 0);
    superstructure.add(upperDeck);

    // Bridge
    const bridgeGeometry = new THREE.BoxGeometry(10, 2.5, 4);
    const bridge = new THREE.Mesh(bridgeGeometry, interiorWallMaterial);
    bridge.position.set(2, 5, 0);
    superstructure.add(bridge);

    // Bridge windows
    const bridgeWindowGeometry = new THREE.BoxGeometry(8, 1.5, 0.1);
    const bridgeWindow = new THREE.Mesh(bridgeWindowGeometry, glassMaterial);
    bridgeWindow.position.set(2, 5, 2.05);
    superstructure.add(bridgeWindow);

    // Interior Details - Multiple Floors
    const createInteriorFloor = (yOffset: number, floorName: string) => {
      const floorGroup = new THREE.Group();
      
      // Floor
      const floorGeometry = new THREE.BoxGeometry(18, 0.1, 5.5);
      const floor = new THREE.Mesh(floorGeometry, luxuryFloorMaterial);
      floor.position.y = yOffset;
      floorGroup.add(floor);

      // Interior walls creating rooms
      const wallThickness = 0.1;
      const wallHeight = 2.5;
      
      // Longitudinal walls
      const longWallGeometry = new THREE.BoxGeometry(18, wallHeight, wallThickness);
      const frontWall = new THREE.Mesh(longWallGeometry, interiorWallMaterial);
      frontWall.position.set(0, yOffset + wallHeight/2, 2.75);
      floorGroup.add(frontWall);

      const backWall = frontWall.clone();
      backWall.position.z = -2.75;
      floorGroup.add(backWall);

      // Create individual rooms
      const roomPositions = [-6, -2, 2, 6];
      roomPositions.forEach((x, index) => {
        // Room divider walls
        if (index < roomPositions.length - 1) {
          const dividerGeometry = new THREE.BoxGeometry(wallThickness, wallHeight, 5.5);
          const divider = new THREE.Mesh(dividerGeometry, interiorWallMaterial);
          divider.position.set(x + 2, yOffset + wallHeight/2, 0);
          floorGroup.add(divider);
        }

        // Furniture based on room type
        if (index === 0) {
          // Master bedroom
          const bedGeometry = new THREE.BoxGeometry(2, 0.6, 3);
          const bed = new THREE.Mesh(bedGeometry, new THREE.MeshPhysicalMaterial({ color: 0x8b4513 }));
          bed.position.set(x, yOffset + 0.3, 0);
          floorGroup.add(bed);
        } else if (index === 1) {
          // Bathroom
          const bathGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.4, 16);
          const bath = new THREE.Mesh(bathGeometry, new THREE.MeshPhysicalMaterial({ color: 0xffffff }));
          bath.position.set(x, yOffset + 0.2, 0);
          floorGroup.add(bath);
        } else if (index === 2) {
          // Living area
          const sofaGeometry = new THREE.BoxGeometry(2.5, 0.5, 1);
          const sofa = new THREE.Mesh(sofaGeometry, new THREE.MeshPhysicalMaterial({ color: 0x4a4a4a }));
          sofa.position.set(x, yOffset + 0.25, 1);
          floorGroup.add(sofa);
        } else {
          // Kitchen
          const counterGeometry = new THREE.BoxGeometry(2, 0.8, 0.6);
          const counter = new THREE.Mesh(counterGeometry, new THREE.MeshPhysicalMaterial({ color: 0x333333 }));
          counter.position.set(x, yOffset + 0.4, -2);
          floorGroup.add(counter);
        }
      });

      return floorGroup;
    };

    // Add multiple interior floors
    const lowerDeckInterior = createInteriorFloor(-1.5, "Lower Deck");
    superstructure.add(lowerDeckInterior);

    const mainDeckInterior = createInteriorFloor(0.5, "Main Deck");
    superstructure.add(mainDeckInterior);

    const upperDeckInterior = createInteriorFloor(3.8, "Upper Deck");
    superstructure.add(upperDeckInterior);

    // Add superstructure to yacht
    yacht.add(superstructure);

    // Additional Details
    // Radar dome
    const radarGeometry = new THREE.SphereGeometry(1, 16, 16);
    const radar = new THREE.Mesh(radarGeometry, metalMaterial);
    radar.position.set(2, 8, 0);
    yacht.add(radar);

    // Mast
    const mastGeometry = new THREE.CylinderGeometry(0.2, 0.2, 10);
    const mast = new THREE.Mesh(mastGeometry, metalMaterial);
    mast.position.set(2, 10, 0);
    yacht.add(mast);

    // Swimming platform
    const platformGeometry = new THREE.BoxGeometry(6, 0.2, 3);
    const platform = new THREE.Mesh(platformGeometry, deckMaterial);
    platform.position.set(-16, -2, 0);
    yacht.add(platform);

    // Add yacht to scene
    scene.add(yacht);

    // Ocean
    const oceanGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const oceanMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x006994,
      metalness: 0.8,
      roughness: 0.2,
      transmission: 0.5,
      thickness: 0.5,
    });

    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = -3;
    ocean.receiveShadow = true;

    // Animate ocean waves
    const oceanVertices = oceanGeometry.attributes.position;
    const waveData = [];
    for (let i = 0; i < oceanVertices.count; i++) {
      waveData.push({
        initialY: oceanVertices.getY(i),
        randomOffset: Math.random() * Math.PI * 2,
        amplitude: Math.random() * 0.5 + 0.2
      });
    }

    scene.add(ocean);

    // Animation
    let time = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Animate ocean
      for (let i = 0; i < oceanVertices.count; i++) {
        const wave = waveData[i];
        const y = wave.initialY + Math.sin(time + wave.randomOffset) * wave.amplitude;
        oceanVertices.setY(i, y);
      }
      oceanVertices.needsUpdate = true;

      // Gentle yacht rocking
      yacht.rotation.z = Math.sin(time * 0.5) * 0.02;
      yacht.rotation.x = Math.sin(time * 0.3) * 0.01;
      yacht.position.y = Math.sin(time * 0.4) * 0.2;

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

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
      window.removeEventListener('resize', handleResize);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      controls.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Overlay UI */}
      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md p-4 rounded-xl">
        <h3 className="text-white text-lg font-semibold mb-2">{yachtName || "Luxury Yacht"}</h3>
        {yachtSpecs && (
          <div className="text-gray-300 text-sm space-y-1">
            <p>Length: {yachtSpecs.length}</p>
            <p>Cabins: {yachtSpecs.cabins}</p>
            <p>Bathrooms: {yachtSpecs.baths}</p>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-white/50 text-sm">
          Drag to rotate • Scroll to zoom
        </div>
      </div>
    </div>
  );
}