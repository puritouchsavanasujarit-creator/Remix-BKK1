import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { 
  Maximize2, 
  Eye, 
  Sliders, 
  RotateCcw, 
  Sun, 
  Sparkles, 
  Box, 
  Bike, 
  Palette,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

type ModelTheme = 'BOUQUET_ROSE' | 'BOUQUET_SUNFLOWER' | 'BOUQUET_LILY' | 'BKK_SCOOTER';
type LightingMood = 'STUDIO_WARM' | 'SUNSET_GOLD' | 'NIGHT_SHIFT_BLUE';

export default function Flower3DStudio() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<ModelTheme>('BOUQUET_ROSE');
  const [lighting, setLighting] = useState<LightingMood>('STUDIO_WARM');
  const [explodedVal, setExplodedVal] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<'HERO' | 'TOP' | 'CLOSEUP' | 'FRONT'>('HERO');

  // Internal mutable state for animation loop without causing re-renders
  const stateRef = useRef({
    theme: 'BOUQUET_ROSE' as ModelTheme,
    lighting: 'STUDIO_WARM' as LightingMood,
    exploded: 0,
    targetExploded: 0,
    autoRotate: true,
    cameraTarget: new THREE.Vector3(0, 1.2, 0),
    cameraPosTarget: new THREE.Vector3(3.2, 2.5, 3.8),
  });

  // Keep stateRef synced with React state
  useEffect(() => {
    stateRef.current.theme = theme;
  }, [theme]);
  useEffect(() => {
    stateRef.current.lighting = lighting;
  }, [lighting]);
  useEffect(() => {
    stateRef.current.targetExploded = explodedVal;
  }, [explodedVal]);
  useEffect(() => {
    stateRef.current.autoRotate = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL to adhere to skill guidelines
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Setup Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1117);
    scene.fog = new THREE.FogExp2(0x0f1117, 0.05);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(3.2, 2.5, 3.8);

    // Modern Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio Environment (PMREMGenerator + RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Orbit Controls with Damping
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1.2, 0);
    controls.maxPolarAngle = Math.PI / 2 + 0.05; // Do not go below floor
    controls.minDistance = 1.5;
    controls.maxDistance = 12;

    // Balanced 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff5ea, 2.5);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = !isSoftwareGl;
    if (!isSoftwareGl) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 20;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
      const d = 3;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
    }
    scene.add(keyLight);

    const fillLight = new THREE.HemisphereLight(0x90b0d8, 0x1f242e, 1.2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffd0a0, 1.5);
    rimLight.position.set(-4, 3, -4);
    scene.add(rimLight);

    // Ground Plane with Grid and Contact Shadow
    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x12151e,
      roughness: 0.85,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Circular contact shadow plane beneath models
    const contactShadowGeo = new THREE.PlaneGeometry(3.5, 3.5);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
    grad.addColorStop(0, 'rgba(0,0,0,0.75)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.3)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const shadowTex = new THREE.CanvasTexture(canvas);
    shadowTex.colorSpace = THREE.SRGBColorSpace;
    const contactMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.6,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.01;
    scene.add(contactShadow);

    // Procedural Marble Texture for Vase
    const marbleCanvas = document.createElement('canvas');
    marbleCanvas.width = 512;
    marbleCanvas.height = 512;
    const mctx = marbleCanvas.getContext('2d')!;
    mctx.fillStyle = '#f8f8fa';
    mctx.fillRect(0, 0, 512, 512);
    mctx.strokeStyle = '#e0ded8';
    mctx.lineWidth = 4;
    for (let i = 0; i < 15; i++) {
      mctx.beginPath();
      mctx.moveTo(Math.random() * 512, 0);
      mctx.bezierCurveTo(
        Math.random() * 512, 170,
        Math.random() * 512, 340,
        Math.random() * 512, 512
      );
      mctx.stroke();
    }
    const marbleTex = new THREE.CanvasTexture(marbleCanvas);
    marbleTex.colorSpace = THREE.SRGBColorSpace;
    marbleTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // Reusable Materials
    const goldRimMat = new THREE.MeshStandardMaterial({
      color: 0xdfb15b,
      metalness: 0.9,
      roughness: 0.18,
    });

    const porcelainMat = new THREE.MeshStandardMaterial({
      map: marbleTex,
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.1,
    });

    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x2e6930,
      roughness: 0.6,
      metalness: 0.1,
    });

    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x3b853e,
      roughness: 0.45,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });

    const ribbonMat = new THREE.MeshStandardMaterial({
      color: 0xb91c1c, // Crimson rose ribbon
      roughness: 0.35,
      metalness: 0.2,
      side: THREE.DoubleSide,
    });

    // Root Group for Models
    const modelRoot = new THREE.Group();
    scene.add(modelRoot);

    // Track movable parts for exploded view
    interface ExplodedPart {
      mesh: THREE.Object3D;
      basePos: THREE.Vector3;
      explodedDir: THREE.Vector3;
    }
    let explodedParts: ExplodedPart[] = [];

    // Builders for Procedural Composite Models
    function buildBouquet(flowerType: 'ROSE' | 'SUNFLOWER' | 'LILY') {
      modelRoot.clear();
      explodedParts = [];

      // 1. Primary Silhouette: Fluted Ceramic/Glass Vase (LatheGeometry)
      const vasePoints: THREE.Vector2[] = [];
      vasePoints.push(new THREE.Vector2(0, 0));
      vasePoints.push(new THREE.Vector2(0.55, 0));
      vasePoints.push(new THREE.Vector2(0.62, 0.2));
      vasePoints.push(new THREE.Vector2(0.38, 0.9));
      vasePoints.push(new THREE.Vector2(0.48, 1.3));
      vasePoints.push(new THREE.Vector2(0.42, 1.35));
      const vaseGeo = new THREE.LatheGeometry(vasePoints, 32);
      const vaseMesh = new THREE.Mesh(vaseGeo, porcelainMat);
      vaseMesh.castShadow = !isSoftwareGl;
      vaseMesh.receiveShadow = !isSoftwareGl;
      modelRoot.add(vaseMesh);

      // Gold Trim Ring around neck
      const goldRingGeo = new THREE.TorusGeometry(0.42, 0.035, 16, 32);
      const goldRing = new THREE.Mesh(goldRingGeo, goldRimMat);
      goldRing.rotation.x = Math.PI / 2;
      goldRing.position.y = 1.05;
      modelRoot.add(goldRing);

      // Silk Ribbon and Bow (Accent Detail)
      const ribbonGroup = new THREE.Group();
      ribbonGroup.position.set(0, 1.05, 0.42);
      const knotGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const knot = new THREE.Mesh(knotGeo, ribbonMat);
      ribbonGroup.add(knot);

      // Ribbon Loops
      const loopGeo = new THREE.TorusGeometry(0.18, 0.03, 12, 24, Math.PI * 1.5);
      const leftLoop = new THREE.Mesh(loopGeo, ribbonMat);
      leftLoop.rotation.z = Math.PI / 4;
      leftLoop.position.set(-0.16, 0.04, 0);
      const rightLoop = new THREE.Mesh(loopGeo, ribbonMat);
      rightLoop.rotation.z = -Math.PI / 4;
      rightLoop.position.set(0.16, 0.04, 0);
      ribbonGroup.add(leftLoop, rightLoop);
      modelRoot.add(ribbonGroup);

      explodedParts.push({
        mesh: ribbonGroup,
        basePos: ribbonGroup.position.clone(),
        explodedDir: new THREE.Vector3(0, 0, 0.6),
      });

      // 2. Secondary Silhouette: Stems Group
      const stemGroup = new THREE.Group();
      const stemCount = 9;
      for (let i = 0; i < stemCount; i++) {
        const angle = (i / stemCount) * Math.PI * 2;
        const radius = 0.12 + Math.random() * 0.1;
        const stemHeight = 0.9 + Math.random() * 0.3;
        const stemGeo = new THREE.CylinderGeometry(0.02, 0.025, stemHeight, 8);
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.set(
          Math.cos(angle) * radius,
          1.1 + stemHeight / 2,
          Math.sin(angle) * radius
        );
        stem.rotation.z = (Math.cos(angle) * 0.15);
        stem.rotation.x = (Math.sin(angle) * 0.15);
        stemGroup.add(stem);
      }
      modelRoot.add(stemGroup);

      // 3. Floral Cluster & Petal Geometries (Multi-part flowers)
      const flowerClusterGroup = new THREE.Group();
      flowerClusterGroup.position.set(0, 1.7, 0);

      // Flower petal colors based on theme
      let primaryColor = 0xe11d48; // Crimson Rose
      let secondaryColor = 0xf43f5e;
      let centerColor = 0x881337;

      if (flowerType === 'SUNFLOWER') {
        primaryColor = 0xf59e0b;
        secondaryColor = 0xfbbf24;
        centerColor = 0x451a03;
      } else if (flowerType === 'LILY') {
        primaryColor = 0xf8fafc;
        secondaryColor = 0xfbcfe8;
        centerColor = 0xca8a04;
      }

      const petalMat = new THREE.MeshStandardMaterial({
        color: primaryColor,
        roughness: 0.38,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });

      const petalSecondaryMat = new THREE.MeshStandardMaterial({
        color: secondaryColor,
        roughness: 0.42,
        metalness: 0.05,
        side: THREE.DoubleSide,
      });

      const centerMat = new THREE.MeshStandardMaterial({
        color: centerColor,
        roughness: 0.75,
        metalness: 0.1,
      });

      // Centerpiece Main Flower (Composite of 12 Petals + Pistil Center)
      function createFlower(scale: number): THREE.Group {
        const fGroup = new THREE.Group();
        // Pistil / Core
        const coreGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.08, 16);
        const core = new THREE.Mesh(coreGeo, centerMat);
        fGroup.add(core);

        // Petal Layers
        const petalShape = new THREE.Shape();
        petalShape.moveTo(0, 0);
        petalShape.quadraticCurveTo(0.15, 0.25, 0.08, 0.45);
        petalShape.quadraticCurveTo(0, 0.52, -0.08, 0.45);
        petalShape.quadraticCurveTo(-0.15, 0.25, 0, 0);

        const petalExtrude = new THREE.ExtrudeGeometry(petalShape, {
          depth: 0.02,
          bevelEnabled: true,
          bevelSegments: 3,
          steps: 1,
          bevelSize: 0.01,
          bevelThickness: 0.01,
        });

        // Layer 1: Outer Petals
        for (let p = 0; p < 8; p++) {
          const pAngle = (p / 8) * Math.PI * 2;
          const petalMesh = new THREE.Mesh(petalExtrude, petalMat);
          petalMesh.rotation.z = pAngle;
          petalMesh.rotation.x = 0.35;
          petalMesh.scale.set(0.7, 0.7, 0.7);
          fGroup.add(petalMesh);
        }

        // Layer 2: Inner Petals
        for (let p = 0; p < 6; p++) {
          const pAngle = (p / 6) * Math.PI * 2 + 0.3;
          const petalMesh = new THREE.Mesh(petalExtrude, petalSecondaryMat);
          petalMesh.rotation.z = pAngle;
          petalMesh.rotation.x = 0.18;
          petalMesh.scale.set(0.52, 0.52, 0.52);
          petalMesh.position.z = 0.02;
          fGroup.add(petalMesh);
        }

        fGroup.scale.set(scale, scale, scale);
        return fGroup;
      }

      // Arrange 7 flowers in spherical bouquet dome
      const flowerPositions = [
        { pos: new THREE.Vector3(0, 0.35, 0), rot: new THREE.Vector3(-Math.PI / 2, 0, 0), s: 1.15 },
        { pos: new THREE.Vector3(0.38, 0.2, 0.2), rot: new THREE.Vector3(-0.9, 0.5, 0), s: 0.95 },
        { pos: new THREE.Vector3(-0.38, 0.2, 0.2), rot: new THREE.Vector3(-0.9, -0.5, 0), s: 0.95 },
        { pos: new THREE.Vector3(0.42, 0.18, -0.2), rot: new THREE.Vector3(0.8, 0.6, 0), s: 0.9 },
        { pos: new THREE.Vector3(-0.42, 0.18, -0.2), rot: new THREE.Vector3(0.8, -0.6, 0), s: 0.9 },
        { pos: new THREE.Vector3(0, 0.25, 0.42), rot: new THREE.Vector3(-1.2, 0, 0), s: 1.0 },
        { pos: new THREE.Vector3(0, 0.22, -0.42), rot: new THREE.Vector3(1.2, 0, 0), s: 0.9 },
      ];

      flowerPositions.forEach((fp, idx) => {
        const fl = createFlower(fp.s);
        fl.position.copy(fp.pos);
        fl.rotation.set(fp.rot.x, fp.rot.y, fp.rot.z);
        flowerClusterGroup.add(fl);

        // Add foliage leaves below flowers
        const leafGeo = new THREE.SphereGeometry(0.18, 8, 8);
        leafGeo.scale(1.2, 0.3, 2.0);
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(fp.pos.x * 1.15, fp.pos.y - 0.1, fp.pos.z * 1.15);
        leaf.rotation.set(fp.rot.x * 0.8, fp.rot.y * 0.8, fp.rot.z);
        flowerClusterGroup.add(leaf);
      });

      modelRoot.add(flowerClusterGroup);

      // Exploded Parts registry
      explodedParts.push({
        mesh: flowerClusterGroup,
        basePos: flowerClusterGroup.position.clone(),
        explodedDir: new THREE.Vector3(0, 0.8, 0),
      });

      explodedParts.push({
        mesh: stemGroup,
        basePos: stemGroup.position.clone(),
        explodedDir: new THREE.Vector3(0, 0.35, 0),
      });
    }

    // Builder for BKK Courier Delivery Bike & Insulated Delivery Case
    function buildScooter() {
      modelRoot.clear();
      explodedParts = [];

      const scooterGroup = new THREE.Group();
      scooterGroup.position.set(0, 0.35, 0);

      const metalMat = new THREE.MeshStandardMaterial({
        color: 0x27272a,
        metalness: 0.85,
        roughness: 0.2,
      });

      const bodyPaintMat = new THREE.MeshStandardMaterial({
        color: 0xe11d48, // BKK Rose Crimson
        metalness: 0.6,
        roughness: 0.25,
      });

      const rubberMat = new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.9,
        metalness: 0.05,
      });

      const boxMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.1,
      });

      // 1. Wheels (Front & Rear)
      const wheelGeo = new THREE.TorusGeometry(0.35, 0.12, 16, 32);
      const rimGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.1, 16);

      const frontWheelGroup = new THREE.Group();
      frontWheelGroup.position.set(0, 0.1, 1.3);
      const frontTire = new THREE.Mesh(wheelGeo, rubberMat);
      frontTire.rotation.y = Math.PI / 2;
      const frontRim = new THREE.Mesh(rimGeo, metalMat);
      frontRim.rotation.z = Math.PI / 2;
      frontWheelGroup.add(frontTire, frontRim);
      scooterGroup.add(frontWheelGroup);

      const rearWheelGroup = new THREE.Group();
      rearWheelGroup.position.set(0, 0.1, -1.1);
      const rearTire = new THREE.Mesh(wheelGeo, rubberMat);
      rearTire.rotation.y = Math.PI / 2;
      const rearRim = new THREE.Mesh(rimGeo, metalMat);
      rearRim.rotation.z = Math.PI / 2;
      rearWheelGroup.add(rearTire, rearRim);
      scooterGroup.add(rearWheelGroup);

      // 2. Chassis / Frame
      const frameGeo = new THREE.BoxGeometry(0.45, 0.35, 1.8);
      const frame = new THREE.Mesh(frameGeo, bodyPaintMat);
      frame.position.set(0, 0.45, 0.1);
      scooterGroup.add(frame);

      // Floorboard
      const deckGeo = new THREE.BoxGeometry(0.65, 0.08, 0.8);
      const deck = new THREE.Mesh(deckGeo, rubberMat);
      deck.position.set(0, 0.32, 0.4);
      scooterGroup.add(deck);

      // Handlebars & Stem
      const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 12);
      const stem = new THREE.Mesh(stemGeo, metalMat);
      stem.position.set(0, 0.8, 1.1);
      stem.rotation.x = -0.25;
      scooterGroup.add(stem);

      const barGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.9, 12);
      const bar = new THREE.Mesh(barGeo, metalMat);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 1.22, 0.98);
      scooterGroup.add(bar);

      // Headlight
      const lightGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.15, 16);
      const lightMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xfff0aa,
        emissiveIntensity: 0.8,
        roughness: 0.1,
      });
      const light = new THREE.Mesh(lightGeo, lightMat);
      light.rotation.x = Math.PI / 2;
      light.position.set(0, 1.15, 1.15);
      scooterGroup.add(light);

      // 3. Flower Delivery Insulated Box (Hero Cargo Container)
      const cargoGroup = new THREE.Group();
      cargoGroup.position.set(0, 0.95, -0.85);

      const boxGeo = new THREE.BoxGeometry(0.85, 0.75, 0.75);
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.castShadow = !isSoftwareGl;
      cargoGroup.add(box);

      // Gold BKK Badge on Box
      const badgeGeo = new THREE.BoxGeometry(0.45, 0.25, 0.02);
      const badge = new THREE.Mesh(badgeGeo, goldRimMat);
      badge.position.set(0, 0, 0.38);
      cargoGroup.add(badge);

      scooterGroup.add(cargoGroup);
      modelRoot.add(scooterGroup);

      // Exploded Parts for Scooter
      explodedParts.push({
        mesh: cargoGroup,
        basePos: cargoGroup.position.clone(),
        explodedDir: new THREE.Vector3(0, 0.7, -0.4),
      });

      explodedParts.push({
        mesh: frontWheelGroup,
        basePos: frontWheelGroup.position.clone(),
        explodedDir: new THREE.Vector3(0, 0, 0.6),
      });

      explodedParts.push({
        mesh: rearWheelGroup,
        basePos: rearWheelGroup.position.clone(),
        explodedDir: new THREE.Vector3(0, 0, -0.6),
      });
    }

    // Initial Model Build
    if (theme === 'BKK_SCOOTER') {
      buildScooter();
    } else if (theme === 'BOUQUET_SUNFLOWER') {
      buildBouquet('SUNFLOWER');
    } else if (theme === 'BOUQUET_LILY') {
      buildBouquet('LILY');
    } else {
      buildBouquet('ROSE');
    }

    // Dynamic update when theme changes
    const currentTheme = theme;

    // Handle Lighting Moods
    function updateLightingMood(mood: LightingMood) {
      if (mood === 'SUNSET_GOLD') {
        scene.background = new THREE.Color(0x1a0f0d);
        scene.fog = new THREE.FogExp2(0x1a0f0d, 0.05);
        keyLight.color.setHex(0xffaa55);
        keyLight.intensity = 3.2;
        fillLight.color.setHex(0xd97706);
        rimLight.color.setHex(0xf43f5e);
      } else if (mood === 'NIGHT_SHIFT_BLUE') {
        scene.background = new THREE.Color(0x090d16);
        scene.fog = new THREE.FogExp2(0x090d16, 0.06);
        keyLight.color.setHex(0x60a5fa);
        keyLight.intensity = 2.0;
        fillLight.color.setHex(0x1e1b4b);
        rimLight.color.setHex(0xa855f7);
      } else {
        scene.background = new THREE.Color(0x0f1117);
        scene.fog = new THREE.FogExp2(0x0f1117, 0.05);
        keyLight.color.setHex(0xfff5ea);
        keyLight.intensity = 2.5;
        fillLight.color.setHex(0x90b0d8);
        rimLight.color.setHex(0xffd0a0);
      }
    }
    updateLightingMood(lighting);

    // Animation & Render Loop with Damping
    let frameId = 0;
    const clock = new THREE.Clock();

    function tick() {
      const delta = Math.min(clock.getDelta(), 0.1);

      // Smooth camera position and target transitions
      camera.position.lerp(stateRef.current.cameraPosTarget, 0.05);
      controls.target.lerp(stateRef.current.cameraTarget, 0.05);

      // Auto-rotation when idle
      if (stateRef.current.autoRotate) {
        modelRoot.rotation.y += delta * 0.35;
      }

      // Smooth exponential damping on Exploded View
      const targetExp = stateRef.current.targetExploded;
      stateRef.current.exploded = THREE.MathUtils.damp(
        stateRef.current.exploded,
        targetExp,
        8,
        delta
      );

      const exp = stateRef.current.exploded;
      for (const part of explodedParts) {
        part.mesh.position.copy(part.basePos).addScaledVector(part.explodedDir, exp);
      }

      controls.update();
      renderer.render(scene, camera);

      frameId = requestAnimationFrame(tick);
    }

    frameId = requestAnimationFrame(tick);

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [theme, lighting]);

  // Camera Presets
  const setPreset = (preset: 'HERO' | 'TOP' | 'CLOSEUP' | 'FRONT') => {
    setActivePreset(preset);
    if (preset === 'HERO') {
      stateRef.current.cameraPosTarget.set(3.2, 2.5, 3.8);
      stateRef.current.cameraTarget.set(0, 1.2, 0);
    } else if (preset === 'TOP') {
      stateRef.current.cameraPosTarget.set(0.1, 4.5, 0.2);
      stateRef.current.cameraTarget.set(0, 1.2, 0);
    } else if (preset === 'CLOSEUP') {
      stateRef.current.cameraPosTarget.set(1.4, 1.9, 1.6);
      stateRef.current.cameraTarget.set(0, 1.6, 0);
    } else if (preset === 'FRONT') {
      stateRef.current.cameraPosTarget.set(0, 1.5, 4.2);
      stateRef.current.cameraTarget.set(0, 1.2, 0);
    }
  };

  return (
    <div className="relative w-full h-[620px] lg:h-[720px] rounded-2xl overflow-hidden bg-neutral-950 border border-neutral-800 shadow-2xl select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Minimal Top Header Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-neutral-900/80 border border-neutral-700/60 px-3.5 py-1.5 rounded-full text-xs text-neutral-200">
        <Sparkles className="w-3.5 h-3.5 text-rose-400" />
        <span className="font-medium">สตูดิโอ 3D ช่อดอกไม้ & ระบบขนส่ง BKK</span>
        <span className="text-neutral-500">|</span>
        <span className="text-[11px] text-neutral-400">PBR Studio Preview</span>
      </div>

      {/* Top Right Quick Actions */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
            autoRotate
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
              : 'bg-neutral-900/80 border-neutral-700/60 text-neutral-400 hover:text-white'
          }`}
          title="เปิด/ปิดการหมุนอัตโนมัติ"
        >
          <RotateCcw className="w-3 h-3" />
          <span>{autoRotate ? 'หมุน 360°' : 'หยุดหมุน'}</span>
        </button>

        <button
          onClick={() => {
            setExplodedVal(0);
            setPreset('HERO');
          }}
          className="p-1.5 rounded-full bg-neutral-900/80 border border-neutral-700/60 text-neutral-400 hover:text-white"
          title="รีเซ็ตมุมมอง"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Unified Bottom Control Dock (Compliant with <= 15% viewport footprint) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-4xl">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-3 sm:p-4 text-xs">
          {/* Collapse Header Button */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2 text-neutral-300 font-semibold text-xs">
              <Sliders className="w-3.5 h-3.5 text-rose-500" />
              <span>แผงควบคุมการแสดงผล 3D (Interactive Dock)</span>
            </div>
            <button
              onClick={() => setIsDockCollapsed(!isDockCollapsed)}
              className="text-neutral-400 hover:text-white flex items-center gap-1 text-[11px]"
            >
              <span>{isDockCollapsed ? 'แสดงแผงควบคุม' : 'ย่อหน้าต่าง'}</span>
              {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {!isDockCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* 1. Theme Selector */}
              <div>
                <label className="text-[11px] text-neutral-400 font-medium block mb-1.5">
                  รูปแบบโมเดล 3D
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setTheme('BOUQUET_ROSE')}
                    className={`px-2 py-1.5 rounded text-[11px] font-medium transition-colors text-left truncate ${
                      theme === 'BOUQUET_ROSE'
                        ? 'bg-rose-600 text-white'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    กุหลาบแดงคลาสสิก
                  </button>
                  <button
                    onClick={() => setTheme('BOUQUET_SUNFLOWER')}
                    className={`px-2 py-1.5 rounded text-[11px] font-medium transition-colors text-left truncate ${
                      theme === 'BOUQUET_SUNFLOWER'
                        ? 'bg-amber-600 text-white'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    ทานตะวันสดใส
                  </button>
                  <button
                    onClick={() => setTheme('BOUQUET_LILY')}
                    className={`px-2 py-1.5 rounded text-[11px] font-medium transition-colors text-left truncate ${
                      theme === 'BOUQUET_LILY'
                        ? 'bg-pink-600 text-white'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    ลิลลี่ & กล้วยไม้
                  </button>
                  <button
                    onClick={() => setTheme('BKK_SCOOTER')}
                    className={`px-2 py-1.5 rounded text-[11px] font-medium transition-colors text-left truncate flex items-center gap-1 ${
                      theme === 'BKK_SCOOTER'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }`}
                  >
                    <Bike className="w-3 h-3" />
                    <span>รถไรเดอร์ BKK</span>
                  </button>
                </div>
              </div>

              {/* 2. Exploded / Layer Separation Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-neutral-400 font-medium">
                    แยกชิ้นส่วนโครงสร้าง (Exploded)
                  </label>
                  <span className="text-[10px] font-mono text-neutral-300">
                    {Math.round(explodedVal * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={explodedVal}
                  onChange={(e) => setExplodedVal(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-neutral-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
                  <span>ประกอบสมบูรณ์</span>
                  <span>แยกส่วนประกอบ</span>
                </div>
              </div>

              {/* 3. Camera View Angles */}
              <div>
                <label className="text-[11px] text-neutral-400 font-medium block mb-1.5">
                  มุมมองกล้อง
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setPreset('HERO')}
                    className={`px-2 py-1 rounded text-[11px] text-center ${
                      activePreset === 'HERO' ? 'bg-neutral-700 text-white font-medium' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    มุมมองหลัก 45°
                  </button>
                  <button
                    onClick={() => setPreset('TOP')}
                    className={`px-2 py-1 rounded text-[11px] text-center ${
                      activePreset === 'TOP' ? 'bg-neutral-700 text-white font-medium' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    มุมมองบน (Top)
                  </button>
                  <button
                    onClick={() => setPreset('CLOSEUP')}
                    className={`px-2 py-1 rounded text-[11px] text-center ${
                      activePreset === 'CLOSEUP' ? 'bg-neutral-700 text-white font-medium' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    ระยะประชิดดอก
                  </button>
                  <button
                    onClick={() => setPreset('FRONT')}
                    className={`px-2 py-1 rounded text-[11px] text-center ${
                      activePreset === 'FRONT' ? 'bg-neutral-700 text-white font-medium' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    ระนาบตรงหน้า
                  </button>
                </div>
              </div>

              {/* 4. Lighting Environment */}
              <div>
                <label className="text-[11px] text-neutral-400 font-medium block mb-1.5">
                  แสงสตูดิโอ & บรรยากาศ
                </label>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => setLighting('STUDIO_WARM')}
                    className={`px-2.5 py-1 rounded text-[11px] text-left flex items-center justify-between ${
                      lighting === 'STUDIO_WARM' ? 'bg-neutral-700 text-amber-300 font-medium' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Studio Softbox (กลางวัน)</span>
                    <Sun className="w-3 h-3 text-amber-400" />
                  </button>
                  <button
                    onClick={() => setLighting('SUNSET_GOLD')}
                    className={`px-2.5 py-1 rounded text-[11px] text-left flex items-center justify-between ${
                      lighting === 'SUNSET_GOLD' ? 'bg-neutral-700 text-orange-300 font-medium' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Golden Hour (กะ 17-20 น.)</span>
                    <Sparkles className="w-3 h-3 text-orange-400" />
                  </button>
                  <button
                    onClick={() => setLighting('NIGHT_SHIFT_BLUE')}
                    className={`px-2.5 py-1 rounded text-[11px] text-left flex items-center justify-between ${
                      lighting === 'NIGHT_SHIFT_BLUE' ? 'bg-neutral-700 text-blue-300 font-medium' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span>Night Shift (กะดึก 20-22 น.)</span>
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
