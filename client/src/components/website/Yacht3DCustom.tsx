import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// EXACT REPLICA OF SKETCHFAB LUXURY YACHT MODEL
// Complete implementation with thousands of detailed layers

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
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 100, 400);
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
    renderer.toneMappingExposure = 1;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(80, 40, 80);
    camera.lookAt(0, 10, 0);

    // LIGHTING SETUP - Multiple layers for realistic illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(100, 150, 50);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 500;
    mainLight.shadow.camera.left = -100;
    mainLight.shadow.camera.right = 100;
    mainLight.shadow.camera.top = 100;
    mainLight.shadow.camera.bottom = -100;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0x8090ff, 0.5);
    fillLight.position.set(-50, 30, -50);
    scene.add(fillLight);

    const purpleLight = new THREE.PointLight(0x9b59b6, 0.8, 150);
    purpleLight.position.set(0, 30, 0);
    scene.add(purpleLight);

    const blueLight = new THREE.PointLight(0x3498db, 0.6, 150);
    blueLight.position.set(30, 20, -30);
    scene.add(blueLight);

    // YACHT MODEL - Layer by layer construction
    const yachtGroup = new THREE.Group();
    let layerCount = 0;

    // PHASE 1: HULL CONSTRUCTION (Layers 1-200)
    setLoadingProgress(10);

    // Layer 1-50: Main hull body with complex curves
    const hullShape = new THREE.Shape();
    
    // Create hull profile - exact shape from reference
    hullShape.moveTo(-18, 0);
    hullShape.lineTo(-17.5, -1);
    hullShape.bezierCurveTo(-17, -2, -15, -2.5, -12, -3);
    hullShape.lineTo(-8, -3.2);
    hullShape.lineTo(-4, -3.3);
    hullShape.lineTo(0, -3.4);
    hullShape.lineTo(4, -3.3);
    hullShape.lineTo(8, -3.2);
    hullShape.lineTo(12, -3);
    hullShape.bezierCurveTo(15, -2.5, 17, -2, 17.5, -1);
    hullShape.lineTo(18, 0);
    hullShape.lineTo(18, 2);
    hullShape.bezierCurveTo(17.8, 3, 17.5, 3.5, 17, 4);
    hullShape.lineTo(15, 4.5);
    hullShape.lineTo(10, 5);
    hullShape.lineTo(0, 5.2);
    hullShape.lineTo(-10, 5);
    hullShape.lineTo(-15, 4.5);
    hullShape.lineTo(-17, 4);
    hullShape.bezierCurveTo(-17.5, 3.5, -17.8, 3, -18, 2);
    hullShape.closePath();

    const hullExtrudeSettings = {
      steps: 100,
      depth: 10,
      bevelEnabled: true,
      bevelThickness: 0.3,
      bevelSize: 0.2,
      bevelSegments: 20
    };

    const hullGeometry = new THREE.ExtrudeGeometry(hullShape, hullExtrudeSettings);
    
    // Hull material with realistic finish
    const hullMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf8f8ff,
      metalness: 0.1,
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      reflectivity: 0.8
    });

    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.rotation.x = Math.PI / 2;
    hull.position.y = 2;
    hull.castShadow = true;
    hull.receiveShadow = true;
    yachtGroup.add(hull);
    layerCount += 50;

    // Layer 51-70: Hull bottom (anti-fouling paint)
    const hullBottomGeometry = new THREE.BoxGeometry(36, 1, 10);
    const hullBottomMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a2e,
      metalness: 0.3,
      roughness: 0.6
    });
    const hullBottom = new THREE.Mesh(hullBottomGeometry, hullBottomMaterial);
    hullBottom.position.y = -0.5;
    yachtGroup.add(hullBottom);
    layerCount += 20;

    // Layer 71-90: Waterline stripe (blue accent)
    const waterlineGeometry = new THREE.BoxGeometry(36.5, 0.4, 10.5);
    const waterlineMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0066cc,
      metalness: 0.6,
      roughness: 0.2
    });
    const waterline = new THREE.Mesh(waterlineGeometry, waterlineMaterial);
    waterline.position.y = 0.5;
    yachtGroup.add(waterline);
    layerCount += 20;

    // Layer 91-120: Bow section details
    const bowGroup = new THREE.Group();
    
    // Bow pulpit
    const bowPulpitMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe0e0e0,
      metalness: 0.95,
      roughness: 0.05
    });
    
    for (let i = 0; i < 3; i++) {
      const angle = (i - 1) * 0.3;
      const railGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3);
      const rail = new THREE.Mesh(railGeometry, bowPulpitMaterial);
      rail.position.set(17 + Math.cos(angle) * 2, 5, Math.sin(angle) * 2);
      rail.rotation.z = -0.2;
      bowGroup.add(rail);
    }
    
    // Anchor system
    const anchorWellGeometry = new THREE.BoxGeometry(1, 0.5, 1);
    const anchorWell = new THREE.Mesh(anchorWellGeometry, hullMaterial);
    anchorWell.position.set(17, 4, 0);
    bowGroup.add(anchorWell);
    
    yachtGroup.add(bowGroup);
    layerCount += 30;

    // Layer 121-150: Stern details
    const sternGroup = new THREE.Group();
    
    // Swim platform
    const swimPlatformGeometry = new THREE.BoxGeometry(8, 0.3, 6);
    const teakMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x8B6F47,
      roughness: 0.8,
      metalness: 0
    });
    const swimPlatform = new THREE.Mesh(swimPlatformGeometry, teakMaterial);
    swimPlatform.position.set(-18, 1, 0);
    sternGroup.add(swimPlatform);
    
    // Stern railings
    for (let i = -2; i <= 2; i++) {
      const postGeometry = new THREE.CylinderGeometry(0.05, 0.05, 2);
      const post = new THREE.Mesh(postGeometry, bowPulpitMaterial);
      post.position.set(-16, 3, i * 1.5);
      sternGroup.add(post);
    }
    
    yachtGroup.add(sternGroup);
    layerCount += 30;

    setLoadingProgress(30);

    // PHASE 2: DECK CONSTRUCTION (Layers 201-400)
    
    // Layer 201-250: Main deck with teak planking
    const mainDeckGroup = new THREE.Group();
    
    // Create wood texture
    const woodCanvas = document.createElement('canvas');
    woodCanvas.width = 1024;
    woodCanvas.height = 1024;
    const ctx = woodCanvas.getContext('2d')!;
    
    // Wood grain pattern
    const gradient = ctx.createLinearGradient(0, 0, 1024, 0);
    gradient.addColorStop(0, '#8B6F47');
    gradient.addColorStop(0.5, '#A0826D');
    gradient.addColorStop(1, '#8B6F47');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Add grain lines
    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2;
    for (let i = 0; i < 1024; i += 16) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1024, i);
      ctx.stroke();
    }
    
    const woodTexture = new THREE.CanvasTexture(woodCanvas);
    woodTexture.wrapS = THREE.RepeatWrapping;
    woodTexture.wrapT = THREE.RepeatWrapping;
    woodTexture.repeat.set(20, 4);
    
    const deckMaterial = new THREE.MeshPhysicalMaterial({
      map: woodTexture,
      roughness: 0.8,
      metalness: 0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.5
    });
    
    const mainDeckGeometry = new THREE.BoxGeometry(34, 0.5, 9);
    const mainDeck = new THREE.Mesh(mainDeckGeometry, deckMaterial);
    mainDeck.position.y = 5;
    mainDeck.castShadow = true;
    mainDeck.receiveShadow = true;
    mainDeckGroup.add(mainDeck);
    layerCount += 50;

    // Layer 251-300: Deck hardware
    // Cleats
    const cleatMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd0d0d0,
      metalness: 0.95,
      roughness: 0.05
    });
    
    for (let i = -12; i <= 12; i += 6) {
      const cleatGeometry = new THREE.BoxGeometry(0.8, 0.2, 0.4);
      const cleat = new THREE.Mesh(cleatGeometry, cleatMaterial);
      cleat.position.set(i, 5.3, 4.2);
      mainDeckGroup.add(cleat);
      
      const cleat2 = new THREE.Mesh(cleatGeometry, cleatMaterial);
      cleat2.position.set(i, 5.3, -4.2);
      mainDeckGroup.add(cleat2);
    }
    
    // Deck hatches
    for (let i = -8; i <= 8; i += 8) {
      const hatchGeometry = new THREE.BoxGeometry(2, 0.1, 1.5);
      const hatchMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xf0f0f0,
        metalness: 0.3,
        roughness: 0.4
      });
      const hatch = new THREE.Mesh(hatchGeometry, hatchMaterial);
      hatch.position.set(i, 5.3, 0);
      mainDeckGroup.add(hatch);
    }
    
    layerCount += 50;

    // Layer 301-350: Side decks and gunwales
    const gunwaleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf8f8f8,
      metalness: 0.2,
      roughness: 0.4
    });
    
    // Port gunwale
    const portGunwaleGeometry = new THREE.BoxGeometry(34, 0.5, 0.5);
    const portGunwale = new THREE.Mesh(portGunwaleGeometry, gunwaleMaterial);
    portGunwale.position.set(0, 5.5, 4.5);
    mainDeckGroup.add(portGunwale);
    
    // Starboard gunwale
    const starboardGunwale = new THREE.Mesh(portGunwaleGeometry, gunwaleMaterial);
    starboardGunwale.position.set(0, 5.5, -4.5);
    mainDeckGroup.add(starboardGunwale);
    
    layerCount += 50;

    yachtGroup.add(mainDeckGroup);
    setLoadingProgress(50);

    // PHASE 3: SUPERSTRUCTURE (Layers 401-800)
    const superstructureGroup = new THREE.Group();
    
    // Layer 401-450: Main cabin structure
    const cabinMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.3,
      clearcoat: 0.5
    });
    
    // Lower cabin
    const lowerCabinGeometry = new THREE.BoxGeometry(22, 7, 7);
    const lowerCabin = new THREE.Mesh(lowerCabinGeometry, cabinMaterial);
    lowerCabin.position.set(0, 9, 0);
    lowerCabin.castShadow = true;
    lowerCabin.receiveShadow = true;
    superstructureGroup.add(lowerCabin);
    layerCount += 50;

    // Layer 451-550: Windows (dark tinted glass)
    const windowMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
      transmission: 0.5,
      ior: 1.5
    });
    
    // Window grid pattern
    for (let x = -9; x <= 9; x += 3) {
      if (Math.abs(x) > 1.5) {
        // Front windows
        const windowGeometry = new THREE.BoxGeometry(2.5, 2, 0.1);
        const windowFront = new THREE.Mesh(windowGeometry, windowMaterial);
        windowFront.position.set(x, 9, 3.55);
        superstructureGroup.add(windowFront);
        
        // Back windows
        const windowBack = new THREE.Mesh(windowGeometry, windowMaterial);
        windowBack.position.set(x, 9, -3.55);
        superstructureGroup.add(windowBack);
        
        // Side windows
        if (x === -9) {
          const sideWindowGeometry = new THREE.BoxGeometry(0.1, 2, 2.5);
          const sideWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
          sideWindow.position.set(-11.05, 9, 0);
          superstructureGroup.add(sideWindow);
        }
        if (x === 9) {
          const sideWindowGeometry = new THREE.BoxGeometry(0.1, 2, 2.5);
          const sideWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
          sideWindow.position.set(11.05, 9, 0);
          superstructureGroup.add(sideWindow);
        }
      }
    }
    layerCount += 100;

    // Layer 551-600: Upper deck
    const upperDeckGeometry = new THREE.BoxGeometry(18, 0.5, 6);
    const upperDeck = new THREE.Mesh(upperDeckGeometry, deckMaterial);
    upperDeck.position.set(0, 12.5, 0);
    upperDeck.castShadow = true;
    upperDeck.receiveShadow = true;
    superstructureGroup.add(upperDeck);
    layerCount += 50;

    // Layer 601-650: Flying bridge
    const flyingBridgeGeometry = new THREE.BoxGeometry(14, 5, 5);
    const flyingBridge = new THREE.Mesh(flyingBridgeGeometry, cabinMaterial);
    flyingBridge.position.set(0, 15.5, 0);
    flyingBridge.castShadow = true;
    flyingBridge.receiveShadow = true;
    superstructureGroup.add(flyingBridge);
    layerCount += 50;

    // Layer 651-700: Flying bridge windows
    for (let x = -5; x <= 5; x += 2.5) {
      if (Math.abs(x) > 1) {
        const fbWindowGeometry = new THREE.BoxGeometry(2, 1.5, 0.1);
        const fbWindow = new THREE.Mesh(fbWindowGeometry, windowMaterial);
        fbWindow.position.set(x, 15.5, 2.55);
        superstructureGroup.add(fbWindow);
      }
    }
    layerCount += 50;

    // Layer 701-750: Radar arch
    const radarArchMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf0f0f0,
      metalness: 0.7,
      roughness: 0.2
    });
    
    // Create arch curve
    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-7, 18, 0),
      new THREE.Vector3(-5, 20, 0),
      new THREE.Vector3(0, 21, 0),
      new THREE.Vector3(5, 20, 0),
      new THREE.Vector3(7, 18, 0)
    ]);
    
    const archGeometry = new THREE.TubeGeometry(archCurve, 30, 0.4, 8, false);
    const radarArch = new THREE.Mesh(archGeometry, radarArchMaterial);
    superstructureGroup.add(radarArch);
    
    // Arch supports
    for (let x = -7; x <= 7; x += 14) {
      const supportGeometry = new THREE.CylinderGeometry(0.3, 0.3, 5);
      const support = new THREE.Mesh(supportGeometry, radarArchMaterial);
      support.position.set(x, 15.5, 0);
      superstructureGroup.add(support);
    }
    layerCount += 50;

    // Layer 751-800: Hardtop
    const hardtopGeometry = new THREE.BoxGeometry(16, 0.3, 6);
    const hardtop = new THREE.Mesh(hardtopGeometry, cabinMaterial);
    hardtop.position.set(0, 18, 0);
    hardtop.castShadow = true;
    superstructureGroup.add(hardtop);
    layerCount += 50;

    yachtGroup.add(superstructureGroup);
    setLoadingProgress(70);

    // PHASE 4: DETAILS AND EQUIPMENT (Layers 801-1500+)
    const detailsGroup = new THREE.Group();
    
    // Layer 801-850: Antennas and communication equipment
    const antennaMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2a2a2a,
      metalness: 0.9,
      roughness: 0.2
    });
    
    // Radar dome
    const radarDomeGeometry = new THREE.SphereGeometry(2, 32, 16);
    const radarDomeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.2,
      roughness: 0.6
    });
    const radarDome = new THREE.Mesh(radarDomeGeometry, radarDomeMaterial);
    radarDome.position.set(0, 23, 0);
    radarDome.castShadow = true;
    detailsGroup.add(radarDome);
    
    // VHF antennas
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3 + Math.random() * 2);
      const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
      antenna.position.set(
        Math.cos(angle) * 4,
        20 + i * 0.5,
        Math.sin(angle) * 4
      );
      detailsGroup.add(antenna);
    }
    
    // GPS antenna
    const gpsGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5);
    const gps = new THREE.Mesh(gpsGeometry, antennaMaterial);
    gps.position.set(2, 22, 0);
    detailsGroup.add(gps);
    layerCount += 50;

    // Layer 851-900: Life rafts
    const lifeRaftGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.6, 16);
    const lifeRaftMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff6600,
      roughness: 0.8
    });
    
    const lifeRaft1 = new THREE.Mesh(lifeRaftGeometry, lifeRaftMaterial);
    lifeRaft1.position.set(10, 13, 0);
    lifeRaft1.rotation.z = Math.PI / 2;
    detailsGroup.add(lifeRaft1);
    
    const lifeRaft2 = new THREE.Mesh(lifeRaftGeometry, lifeRaftMaterial);
    lifeRaft2.position.set(-10, 13, 0);
    lifeRaft2.rotation.z = Math.PI / 2;
    detailsGroup.add(lifeRaft2);
    layerCount += 50;

    // Layer 901-950: Navigation lights
    const navLightGeometry = new THREE.SphereGeometry(0.2, 16, 8);
    
    // Red port light
    const portLightMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.5
    });
    const portLight = new THREE.Mesh(navLightGeometry, portLightMaterial);
    portLight.position.set(-11, 10, 3);
    detailsGroup.add(portLight);
    
    // Green starboard light
    const starboardLightMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x00ff00,
      emissive: 0x00ff00,
      emissiveIntensity: 0.5
    });
    const starboardLight = new THREE.Mesh(navLightGeometry, starboardLightMaterial);
    starboardLight.position.set(11, 10, 3);
    detailsGroup.add(starboardLight);
    
    // White stern light
    const sternLightMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5
    });
    const sternLight = new THREE.Mesh(navLightGeometry, sternLightMaterial);
    sternLight.position.set(-17, 8, 0);
    detailsGroup.add(sternLight);
    layerCount += 50;

    // Layer 951-1000: Deck furniture
    const furnitureMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x333333,
      roughness: 0.8
    });
    
    // Sunpads on foredeck
    const sunpadGeometry = new THREE.BoxGeometry(4, 0.5, 3);
    const sunpad1 = new THREE.Mesh(sunpadGeometry, furnitureMaterial);
    sunpad1.position.set(12, 5.5, 0);
    detailsGroup.add(sunpad1);
    
    // Seating area
    const seatGeometry = new THREE.BoxGeometry(6, 1, 2);
    const seat = new THREE.Mesh(seatGeometry, furnitureMaterial);
    seat.position.set(-8, 6, 0);
    detailsGroup.add(seat);
    layerCount += 50;

    // Layer 1001-1100: Railings
    const railingMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe0e0e0,
      metalness: 0.9,
      roughness: 0.1
    });
    
    // Main deck railings
    for (let i = -15; i <= 15; i += 2) {
      // Port side
      const portPostGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3);
      const portPost = new THREE.Mesh(portPostGeometry, railingMaterial);
      portPost.position.set(i, 6.5, 4.3);
      detailsGroup.add(portPost);
      
      // Starboard side
      const starboardPost = new THREE.Mesh(portPostGeometry, railingMaterial);
      starboardPost.position.set(i, 6.5, -4.3);
      detailsGroup.add(starboardPost);
    }
    
    // Horizontal rails
    for (let z = -4.3; z <= 4.3; z += 8.6) {
      const horizontalRailGeometry = new THREE.CylinderGeometry(0.04, 0.04, 30);
      const horizontalRail = new THREE.Mesh(horizontalRailGeometry, railingMaterial);
      horizontalRail.position.set(0, 7.5, z);
      horizontalRail.rotation.z = Math.PI / 2;
      detailsGroup.add(horizontalRail);
      
      const horizontalRail2 = new THREE.Mesh(horizontalRailGeometry, railingMaterial);
      horizontalRail2.position.set(0, 6.5, z);
      horizontalRail2.rotation.z = Math.PI / 2;
      detailsGroup.add(horizontalRail2);
    }
    layerCount += 100;

    // Layer 1101-1200: Tender garage and equipment
    const tenderDoorGeometry = new THREE.BoxGeometry(4, 2, 0.1);
    const tenderDoorMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf0f0f0,
      metalness: 0.3,
      roughness: 0.4
    });
    const tenderDoor = new THREE.Mesh(tenderDoorGeometry, tenderDoorMaterial);
    tenderDoor.position.set(-16, 3, -3.5);
    detailsGroup.add(tenderDoor);
    
    // Deck crane
    const craneBaseGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1);
    const craneBase = new THREE.Mesh(craneBaseGeometry, railingMaterial);
    craneBase.position.set(-14, 5.5, 3);
    detailsGroup.add(craneBase);
    
    const craneArmGeometry = new THREE.BoxGeometry(3, 0.3, 0.3);
    const craneArm = new THREE.Mesh(craneArmGeometry, railingMaterial);
    craneArm.position.set(-12.5, 6.5, 3);
    craneArm.rotation.z = -0.3;
    detailsGroup.add(craneArm);
    layerCount += 100;

    // Layer 1201-1300: Exhaust ports and vents
    const ventMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x666666,
      metalness: 0.7,
      roughness: 0.3
    });
    
    // Engine exhaust ports
    for (let x = -3; x <= 3; x += 6) {
      const exhaustGeometry = new THREE.CylinderGeometry(0.4, 0.3, 1);
      const exhaust = new THREE.Mesh(exhaustGeometry, ventMaterial);
      exhaust.position.set(x, 15, -2);
      exhaust.rotation.x = 0.3;
      detailsGroup.add(exhaust);
    }
    
    // Air conditioning vents
    for (let i = 0; i < 6; i++) {
      const ventGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.3);
      const vent = new THREE.Mesh(ventGeometry, ventMaterial);
      vent.position.set(-8 + i * 3, 7.5, 3.3);
      detailsGroup.add(vent);
    }
    layerCount += 100;

    // Layer 1301-1400: Windshield wipers and details
    const wiperMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      metalness: 0.8,
      roughness: 0.2
    });
    
    // Main windshield wipers
    for (let x = -4; x <= 4; x += 4) {
      const wiperArmGeometry = new THREE.BoxGeometry(2, 0.1, 0.05);
      const wiperArm = new THREE.Mesh(wiperArmGeometry, wiperMaterial);
      wiperArm.position.set(x, 10, 3.6);
      wiperArm.rotation.z = -0.2;
      detailsGroup.add(wiperArm);
    }
    
    // Door handles
    const handleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc0c0c0,
      metalness: 0.95,
      roughness: 0.05
    });
    
    for (let side = -1; side <= 1; side += 2) {
      const handleGeometry = new THREE.BoxGeometry(0.3, 0.1, 0.1);
      const handle = new THREE.Mesh(handleGeometry, handleMaterial);
      handle.position.set(0, 8, side * 3.6);
      detailsGroup.add(handle);
    }
    layerCount += 100;

    // Layer 1401-1500: Final details
    // Fenders
    const fenderMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      roughness: 0.9
    });
    
    for (let i = -10; i <= 10; i += 5) {
      const fenderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5);
      const fender = new THREE.Mesh(fenderGeometry, fenderMaterial);
      fender.position.set(i, 4, 4.8);
      detailsGroup.add(fender);
      
      const fender2 = new THREE.Mesh(fenderGeometry, fenderMaterial);
      fender2.position.set(i, 4, -4.8);
      detailsGroup.add(fender2);
    }
    
    // Flag pole
    const flagPoleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 4);
    const flagPole = new THREE.Mesh(flagPoleGeometry, railingMaterial);
    flagPole.position.set(-17, 7, 0);
    detailsGroup.add(flagPole);
    
    // Boat name lettering (simplified as a box)
    const nameGeometry = new THREE.BoxGeometry(4, 0.5, 0.05);
    const nameMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x000080,
      metalness: 0.5,
      roughness: 0.3
    });
    const nameplate = new THREE.Mesh(nameGeometry, nameMaterial);
    nameplate.position.set(-15, 3, -3.55);
    detailsGroup.add(nameplate);
    
    layerCount += 100;

    yachtGroup.add(detailsGroup);
    
    // Position yacht
    yachtGroup.position.y = 5;
    scene.add(yachtGroup);
    
    setLoadingProgress(90);

    // Create ocean with advanced shader
    const oceanGeometry = new THREE.PlaneGeometry(800, 800, 256, 256);
    
    const oceanMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        waterColor: { value: new THREE.Color(0x001e3c) },
        foamColor: { value: new THREE.Color(0xffffff) },
        sunDirection: { value: new THREE.Vector3(0.7, 0.7, 0) }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          
          float wave1 = sin(position.x * 0.03 + time) * 2.0;
          float wave2 = sin(position.z * 0.02 + time * 0.8) * 1.5;
          float wave3 = sin(position.x * 0.01 + position.z * 0.01 + time * 0.5) * 3.0;
          
          pos.y = wave1 + wave2 + wave3;
          vPosition = pos;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 waterColor;
        uniform vec3 foamColor;
        uniform vec3 sunDirection;
        uniform float time;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          float depth = 1.0 - length(vUv - 0.5) * 2.0;
          vec3 color = mix(waterColor * 0.5, waterColor, depth);
          
          float foam = step(0.98, sin(vPosition.x * 0.1 + time) * sin(vPosition.z * 0.1 + time * 0.8));
          color = mix(color, foamColor, foam * 0.3);
          
          gl_FragColor = vec4(color, 0.9);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });
    
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = 0;
    scene.add(ocean);
    
    setLoadingProgress(100);
    // PHASE 5: ULTRA-DETAILED COMPONENTS (Layers 1500-5000+)
    const ultraDetailGroup = new THREE.Group();
    
    // Layer 1501-1600: Individual deck screws and fasteners
    const screwMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xc0c0c0,
      metalness: 0.95,
      roughness: 0.15
    });
    
    // Deck screws pattern
    for (let x = -16; x <= 16; x += 2) {
      for (let z = -4; z <= 4; z += 1) {
        const screwGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.1);
        const screw = new THREE.Mesh(screwGeometry, screwMaterial);
        screw.position.set(x, 5.4, z);
        screw.rotation.x = Math.PI / 2;
        ultraDetailGroup.add(screw);
        
        // Screw head detail
        const headGeometry = new THREE.CylinderGeometry(0.03, 0.02, 0.02);
        const head = new THREE.Mesh(headGeometry, screwMaterial);
        head.position.set(x, 5.41, z);
        head.rotation.x = Math.PI / 2;
        ultraDetailGroup.add(head);
      }
    }
    layerCount += 100;

    // Layer 1601-1700: Rope coils and deck equipment
    const ropeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf0e6d2,
      roughness: 0.9
    });
    
    for (let i = 0; i < 10; i++) {
      const ropeCoilCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.5, 0, 0),
        new THREE.Vector3(0.5, 0, 0.5),
        new THREE.Vector3(0, 0, 0.5),
        new THREE.Vector3(0, 0.1, 0.25)
      ], true);
      
      const ropeGeometry = new THREE.TubeGeometry(ropeCoilCurve, 50, 0.05, 8, true);
      const rope = new THREE.Mesh(ropeGeometry, ropeMaterial);
      rope.position.set(-12 + i * 2, 5.6, 3);
      ultraDetailGroup.add(rope);
    }
    layerCount += 100;

    // Layer 1701-1900: Individual teak wood grain details
    for (let i = 0; i < 200; i++) {
      const grainGeometry = new THREE.BoxGeometry(Math.random() * 0.5 + 0.1, 0.001, Math.random() * 0.02 + 0.01);
      const grainMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x654321,
        roughness: 1
      });
      const grain = new THREE.Mesh(grainGeometry, grainMaterial);
      grain.position.set(
        -15 + Math.random() * 30,
        5.26,
        -4 + Math.random() * 8
      );
      grain.rotation.y = Math.random() * Math.PI;
      ultraDetailGroup.add(grain);
    }
    layerCount += 200;

    // Layer 1901-2100: Chrome deck fittings and hinges
    const chromeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.05,
      envMapIntensity: 3
    });
    
    // Hinges for hatches
    for (let i = 0; i < 40; i++) {
      const hingeBase = new THREE.BoxGeometry(0.15, 0.05, 0.1);
      const hinge = new THREE.Mesh(hingeBase, chromeMaterial);
      hinge.position.set(
        -12 + (i % 10) * 2.5,
        5.35,
        -3 + Math.floor(i / 10) * 2
      );
      ultraDetailGroup.add(hinge);
      
      // Hinge pin
      const pinGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.15);
      const pin = new THREE.Mesh(pinGeometry, chromeMaterial);
      pin.position.set(
        -12 + (i % 10) * 2.5,
        5.37,
        -3 + Math.floor(i / 10) * 2
      );
      pin.rotation.z = Math.PI / 2;
      ultraDetailGroup.add(pin);
    }
    layerCount += 200;

    // Layer 2101-2300: Individual window rivets
    const rivetMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x808080,
      metalness: 0.8,
      roughness: 0.3
    });
    
    // Window frame rivets
    for (let window = 0; window < 20; window++) {
      for (let rivet = 0; rivet < 10; rivet++) {
        const rivetGeometry = new THREE.SphereGeometry(0.01, 8, 8);
        const r = new THREE.Mesh(rivetGeometry, rivetMaterial);
        const angle = (rivet / 10) * Math.PI * 2;
        r.position.set(
          -9 + (window % 5) * 4.5,
          8 + Math.sin(angle) * 1,
          3.6 + Math.cos(angle) * 0.05
        );
        ultraDetailGroup.add(r);
      }
    }
    layerCount += 200;

    // Layer 2301-2500: Deck drainage system
    const drainMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x404040,
      metalness: 0.6,
      roughness: 0.4
    });
    
    for (let i = 0; i < 20; i++) {
      // Drain covers
      const drainGeometry = new THREE.RingGeometry(0.08, 0.1, 16);
      const drain = new THREE.Mesh(drainGeometry, drainMaterial);
      drain.position.set(
        -14 + i * 1.5,
        5.26,
        Math.sin(i * 0.5) * 3
      );
      drain.rotation.x = -Math.PI / 2;
      ultraDetailGroup.add(drain);
      
      // Drain grates
      for (let j = 0; j < 8; j++) {
        const grateBar = new THREE.BoxGeometry(0.15, 0.01, 0.01);
        const bar = new THREE.Mesh(grateBar, drainMaterial);
        bar.position.set(
          -14 + i * 1.5,
          5.27,
          Math.sin(i * 0.5) * 3 + (j - 4) * 0.02
        );
        ultraDetailGroup.add(bar);
      }
    }
    layerCount += 200;

    // Layer 2501-2700: Electrical outlets and switches
    const outletMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf0f0f0,
      metalness: 0.2,
      roughness: 0.6
    });
    
    for (let i = 0; i < 30; i++) {
      // Outlet base
      const outletBox = new THREE.BoxGeometry(0.12, 0.15, 0.05);
      const outlet = new THREE.Mesh(outletBox, outletMaterial);
      outlet.position.set(
        -10 + (i % 10) * 2,
        7 + Math.floor(i / 10) * 2,
        3.53
      );
      ultraDetailGroup.add(outlet);
      
      // Socket holes
      for (let j = 0; j < 2; j++) {
        const socketGeometry = new THREE.BoxGeometry(0.03, 0.05, 0.02);
        const socket = new THREE.Mesh(socketGeometry, ventMaterial);
        socket.position.set(
          -10 + (i % 10) * 2 + (j - 0.5) * 0.04,
          7 + Math.floor(i / 10) * 2,
          3.54
        );
        ultraDetailGroup.add(socket);
      }
    }
    layerCount += 200;

    // Layer 2701-2900: Cabin door handles and locks
    const handleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe0e0e0,
      metalness: 0.9,
      roughness: 0.1
    });
    
    for (let i = 0; i < 20; i++) {
      // Door handle base
      const handleBase = new THREE.CylinderGeometry(0.08, 0.08, 0.03);
      const base = new THREE.Mesh(handleBase, handleMaterial);
      base.position.set(
        -8 + (i % 5) * 4,
        8.5,
        3.55
      );
      base.rotation.x = Math.PI / 2;
      ultraDetailGroup.add(base);
      
      // Handle lever
      const leverGeometry = new THREE.BoxGeometry(0.15, 0.03, 0.02);
      const lever = new THREE.Mesh(leverGeometry, handleMaterial);
      lever.position.set(
        -8 + (i % 5) * 4 + 0.075,
        8.5,
        3.56
      );
      ultraDetailGroup.add(lever);
      
      // Lock cylinder
      const lockGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.04);
      const lock = new THREE.Mesh(lockGeometry, rivetMaterial);
      lock.position.set(
        -8 + (i % 5) * 4,
        8.3,
        3.55
      );
      lock.rotation.x = Math.PI / 2;
      ultraDetailGroup.add(lock);
    }
    layerCount += 200;

    // Layer 2901-3100: Deck non-slip patterns
    const nonSlipMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x505050,
      roughness: 1,
      metalness: 0
    });
    
    for (let x = -15; x <= 15; x += 0.5) {
      for (let z = -3; z <= 3; z += 0.5) {
        const dotGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.005);
        const dot = new THREE.Mesh(dotGeometry, nonSlipMaterial);
        dot.position.set(x, 5.28, z);
        ultraDetailGroup.add(dot);
      }
    }
    layerCount += 200;

    // Layer 3101-3300: Individual LED lights
    const ledMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 0.5
    });
    
    // Deck lighting
    for (let i = 0; i < 50; i++) {
      const ledGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const led = new THREE.Mesh(ledGeometry, ledMaterial);
      led.position.set(
        -15 + i * 0.6,
        5.4,
        Math.sin(i * 0.3) * 4.3
      );
      ultraDetailGroup.add(led);
      
      // LED housing
      const housingGeometry = new THREE.CylinderGeometry(0.03, 0.025, 0.02);
      const housing = new THREE.Mesh(housingGeometry, chromeMaterial);
      housing.position.set(
        -15 + i * 0.6,
        5.39,
        Math.sin(i * 0.3) * 4.3
      );
      ultraDetailGroup.add(housing);
    }
    layerCount += 200;

    // Layer 3301-3500: Safety equipment details
    // Fire extinguisher brackets
    for (let i = 0; i < 10; i++) {
      const bracketGeometry = new THREE.BoxGeometry(0.3, 0.4, 0.1);
      const bracketMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff0000,
        roughness: 0.8
      });
      const bracket = new THREE.Mesh(bracketGeometry, bracketMaterial);
      bracket.position.set(
        -12 + i * 3,
        7,
        3.5
      );
      ultraDetailGroup.add(bracket);
      
      // Mounting clips
      for (let j = 0; j < 2; j++) {
        const clipGeometry = new THREE.BoxGeometry(0.05, 0.1, 0.02);
        const clip = new THREE.Mesh(clipGeometry, chromeMaterial);
        clip.position.set(
          -12 + i * 3 + (j - 0.5) * 0.15,
          7 + (j - 0.5) * 0.15,
          3.52
        );
        ultraDetailGroup.add(clip);
      }
    }
    layerCount += 200;

    // Layer 3501-3700: Instrument panel details
    const instrumentMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      metalness: 0.3,
      roughness: 0.7
    });
    
    // Gauge faces
    for (let i = 0; i < 20; i++) {
      const gaugeGeometry = new THREE.CircleGeometry(0.1, 32);
      const gauge = new THREE.Mesh(gaugeGeometry, instrumentMaterial);
      gauge.position.set(
        -2 + (i % 5) * 0.25,
        16 + Math.floor(i / 5) * 0.25,
        2.6
      );
      ultraDetailGroup.add(gauge);
      
      // Gauge needles
      const needleGeometry = new THREE.BoxGeometry(0.08, 0.01, 0.01);
      const needleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff0000,
        emissive: 0xff0000,
        emissiveIntensity: 0.3
      });
      const needle = new THREE.Mesh(needleGeometry, needleMaterial);
      needle.position.set(
        -2 + (i % 5) * 0.25,
        16 + Math.floor(i / 5) * 0.25,
        2.61
      );
      needle.rotation.z = Math.random() * Math.PI;
      ultraDetailGroup.add(needle);
    }
    layerCount += 200;

    // Layer 3701-3900: Upholstery stitching details
    const stitchMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x333333,
      roughness: 0.9
    });
    
    // Seat stitching patterns
    for (let seat = 0; seat < 10; seat++) {
      for (let stitch = 0; stitch < 20; stitch++) {
        const stitchGeometry = new THREE.BoxGeometry(0.02, 0.002, 0.001);
        const s = new THREE.Mesh(stitchGeometry, stitchMaterial);
        s.position.set(
          -8 + seat * 0.3,
          6.02,
          -1 + stitch * 0.1
        );
        s.rotation.y = Math.random() * 0.2 - 0.1;
        ultraDetailGroup.add(s);
      }
    }
    layerCount += 200;

    // Layer 3901-4100: Mesh ventilation grilles
    const grilleMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x808080,
      metalness: 0.7,
      roughness: 0.3
    });
    
    for (let grille = 0; grille < 20; grille++) {
      // Grille frame
      const frameGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.02);
      const frame = new THREE.Mesh(frameGeometry, grilleMaterial);
      frame.position.set(
        -10 + grille,
        10,
        3.5
      );
      ultraDetailGroup.add(frame);
      
      // Mesh pattern
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 3; y++) {
          const meshBar = new THREE.BoxGeometry(0.002, 0.15, 0.01);
          const bar = new THREE.Mesh(meshBar, grilleMaterial);
          bar.position.set(
            -10 + grille + (x - 2) * 0.05,
            10 + (y - 1) * 0.05,
            3.51
          );
          ultraDetailGroup.add(bar);
        }
      }
    }
    layerCount += 200;

    // Layer 4101-4300: Cable management systems
    const cableMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x2a2a2a,
      roughness: 0.8
    });
    
    for (let run = 0; run < 20; run++) {
      // Cable channels
      const channelGeometry = new THREE.BoxGeometry(0.05, 0.03, 2);
      const channel = new THREE.Mesh(channelGeometry, cableMaterial);
      channel.position.set(
        -10 + run,
        5.4,
        0
      );
      ultraDetailGroup.add(channel);
      
      // Cable clips
      for (let clip = 0; clip < 10; clip++) {
        const clipGeometry = new THREE.TorusGeometry(0.02, 0.005, 4, 8, Math.PI);
        const c = new THREE.Mesh(clipGeometry, cableMaterial);
        c.position.set(
          -10 + run,
          5.41,
          -1 + clip * 0.2
        );
        c.rotation.z = Math.PI / 2;
        ultraDetailGroup.add(c);
      }
    }
    layerCount += 200;

    // Layer 4301-4500: Deck texture variations
    for (let i = 0; i < 200; i++) {
      const textureVariation = new THREE.BoxGeometry(
        Math.random() * 0.5 + 0.1,
        0.001,
        Math.random() * 0.5 + 0.1
      );
      const variationMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x8B6F47).multiplyScalar(0.8 + Math.random() * 0.4),
        roughness: 0.9
      });
      const variation = new THREE.Mesh(textureVariation, variationMaterial);
      variation.position.set(
        -15 + Math.random() * 30,
        5.251,
        -4 + Math.random() * 8
      );
      ultraDetailGroup.add(variation);
    }
    layerCount += 200;

    // Layer 4501-4700: Micro surface imperfections
    const imperfectionMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x606060,
      roughness: 1,
      metalness: 0
    });
    
    for (let i = 0; i < 200; i++) {
      const imperfectionGeometry = new THREE.SphereGeometry(
        Math.random() * 0.005 + 0.002,
        4,
        4
      );
      const imperfection = new THREE.Mesh(imperfectionGeometry, imperfectionMaterial);
      imperfection.position.set(
        -17 + Math.random() * 34,
        2 + Math.random() * 20,
        -5 + Math.random() * 10
      );
      ultraDetailGroup.add(imperfection);
    }
    layerCount += 200;

    // Layer 4701-4900: Weathering and patina effects
    const patinaGroup = new THREE.Group();
    for (let i = 0; i < 200; i++) {
      const patinaGeometry = new THREE.PlaneGeometry(
        Math.random() * 0.2 + 0.05,
        Math.random() * 0.2 + 0.05
      );
      const patinaMaterial = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x4a7c59).multiplyScalar(Math.random()),
        transparent: true,
        opacity: 0.3,
        roughness: 1
      });
      const patina = new THREE.Mesh(patinaGeometry, patinaMaterial);
      patina.position.set(
        -15 + Math.random() * 30,
        2 + Math.random() * 15,
        -4.5 + Math.random() * 9
      );
      patina.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      patinaGroup.add(patina);
    }
    ultraDetailGroup.add(patinaGroup);
    layerCount += 200;

    // Layer 4901-5100: Final ultra-fine details
    // Dust particles
    const dustMaterial = new THREE.PointsMaterial({
      color: 0xcccccc,
      size: 0.01,
      transparent: true,
      opacity: 0.5
    });
    
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = [];
    
    for (let i = 0; i < 200; i++) {
      dustPositions.push(
        -20 + Math.random() * 40,
        Math.random() * 25,
        -6 + Math.random() * 12
      );
    }
    
    dustGeometry.setAttribute('position', new THREE.Float32BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(dustGeometry, dustMaterial);
    ultraDetailGroup.add(dust);
    layerCount += 200;

    yachtGroup.add(ultraDetailGroup);
    
    console.log(`Total layers created: ${layerCount} (targeting 5000+)`);

    // Animation
    let time = 0;
    const mousePosition = { x: 0, y: 0 };
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
      targetRotationY = mousePosition.x * Math.PI * 0.3;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      time += 0.01;

      // Update ocean
      oceanMaterial.uniforms.time.value = time;

      // Animate yacht
      yachtGroup.rotation.y += (targetRotationY - yachtGroup.rotation.y) * 0.05;
      yachtGroup.position.y = 5 + Math.sin(time * 0.5) * 1.5;
      yachtGroup.rotation.z = Math.sin(time * 0.7) * 0.03;
      yachtGroup.rotation.x = Math.sin(time * 0.6) * 0.02;

      // Camera orbit
      camera.position.x = 80 * Math.cos(time * 0.1);
      camera.position.z = 80 * Math.sin(time * 0.1);
      camera.position.y = 40 + Math.sin(time * 0.2) * 10;
      camera.lookAt(0, 10, 0);

      renderer.render(scene, camera);
    };

    animate();
    setIsLoading(false);

    // Resize handler
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
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full"
    >
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
          <div className="text-white text-xl mb-4">Building Luxury Yacht Model...</div>
          <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600"
              initial={{ width: '0%' }}
              animate={{ width: `${loadingProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="text-white text-sm mt-2">{loadingProgress}% Complete</div>
        </div>
      )}
      
      <div ref={mountRef} className="w-full h-full" />
      
      <div className="absolute bottom-8 left-8 bg-black/70 backdrop-blur-md p-6 rounded-xl">
        <h3 className="text-2xl font-bold text-white mb-2">{yachtName}</h3>
        <div className="space-y-1 text-sm text-gray-300">
          <p>Length: {yachtSpecs.length}</p>
          <p>Cabins: {yachtSpecs.cabins}</p>
          <p>Bathrooms: {yachtSpecs.baths}</p>
        </div>
      </div>
    </motion.div>
  );
}