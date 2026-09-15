"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface UniverseSceneProps {
  photoUrl: string;
  isAutoRotate: boolean;
  orbitSpeed: number;
  bloomIntensity: number;
  onPhotoClick?: () => void;
  onFlowerClick?: () => void;
}

export default function UniverseScene({
  photoUrl,
  isAutoRotate,
  orbitSpeed,
  bloomIntensity = 1,
  onPhotoClick,
  onFlowerClick,
}: UniverseSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const photoTextureRef = useRef<THREE.Texture | null>(null);
  const photoMeshRef = useRef<THREE.Mesh | null>(null);
  const flowersGroupRef = useRef<THREE.Group | null>(null);
  const petalsGroupRef = useRef<THREE.Points | null>(null);
  const requestRef = useRef<number | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Helper function to create an undistorted cover texture from any image aspect ratio
  const loadCoverTexture = (url: string, onLoad: (tex: THREE.CanvasTexture) => void) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imgAspect = img.width / img.height;
      let sx = 0;
      let sy = 0;
      let sWidth = img.width;
      let sHeight = img.height;

      if (imgAspect > 1) {
        // Horizontal: crop sides symmetrically
        sWidth = img.height;
        sx = (img.width - sWidth) / 2;
      } else {
        // Vertical: crop top/bottom with slight focus on top-center for faces
        sHeight = img.width;
        sy = Math.max(0, (img.height - sHeight) * 0.2);
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      texture.needsUpdate = true;

      onLoad(texture);
    };
    img.onerror = (err) => {
      console.warn("Could not load image for cover texture:", err);
    };
    img.src = url;
  };

  // Custom photo texture updater
  useEffect(() => {
    if (!photoMeshRef.current || !photoUrl) return;

    loadCoverTexture(photoUrl, (texture) => {
      if (photoMeshRef.current) {
        const mat = photoMeshRef.current.material as THREE.MeshBasicMaterial;
        mat.map = texture;
        mat.needsUpdate = true;
      }
      photoTextureRef.current = texture;
    });
  }, [photoUrl]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x05020c, 0.015);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 3, 24);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xfff0d0, 0.7);
    scene.add(ambientLight);

    const centralLight = new THREE.PointLight(0xffd700, 1.1, 35);
    centralLight.position.set(0, 0, 3);
    scene.add(centralLight);

    const warmBackLight = new THREE.PointLight(0xff8c00, 1.6, 40);
    warmBackLight.position.set(0, 0, -4);
    scene.add(warmBackLight);

    const purpleCosmicLight = new THREE.PointLight(0xaa44ff, 1.8, 60);
    purpleCosmicLight.position.set(15, 12, -15);
    scene.add(purpleCosmicLight);

    // --- 1. STARFIELD & COSMIC DUST ---
    const starCount = 3800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);

    const colorPalette = [
      new THREE.Color(0xfff5c0), // Golden starlight
      new THREE.Color(0xffd700), // Pure Gold
      new THREE.Color(0xffffff), // Diamond White
      new THREE.Color(0xffb86c), // Amber Warm
      new THREE.Color(0x8be9fd), // Stellar Cyan
    ];

    for (let i = 0; i < starCount; i++) {
      const radius = 25 + Math.random() * 110;
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);

      starPos[i * 3] = radius * Math.sin(theta) * Math.cos(phi);
      starPos[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      starPos[i * 3 + 2] = radius * Math.cos(theta);

      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      starColors[i * 3] = color.r;
      starColors[i * 3 + 1] = color.g;
      starColors[i * 3 + 2] = color.b;

      starSizes[i] = Math.random() * 2.5 + 0.8;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));

    // Star point texture generator
    const starCanvas = document.createElement("canvas");
    starCanvas.width = 64;
    starCanvas.height = 64;
    const sCtx = starCanvas.getContext("2d");
    if (sCtx) {
      const grad = sCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.25, "rgba(255, 230, 140, 0.8)");
      grad.addColorStop(0.6, "rgba(255, 180, 50, 0.2)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 64, 64);
    }
    const starTexture = new THREE.CanvasTexture(starCanvas);

    const starMat = new THREE.PointsMaterial({
      size: 1.8,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // --- 2. NEBULA CLOUDS ---
    const nebulaGroup = new THREE.Group();
    const nebulaCount = 18;
    const nebulaGeo = new THREE.PlaneGeometry(35, 35);

    const nebCanvas = document.createElement("canvas");
    nebCanvas.width = 128;
    nebCanvas.height = 128;
    const nCtx = nebCanvas.getContext("2d");
    if (nCtx) {
      const nGrad = nCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      nGrad.addColorStop(0, "rgba(255, 190, 40, 0.35)");
      nGrad.addColorStop(0.4, "rgba(220, 100, 30, 0.15)");
      nGrad.addColorStop(0.7, "rgba(100, 20, 120, 0.08)");
      nGrad.addColorStop(1, "rgba(0,0,0,0)");
      nCtx.fillStyle = nGrad;
      nCtx.fillRect(0, 0, 128, 128);
    }
    const nebTexture = new THREE.CanvasTexture(nebCanvas);

    for (let i = 0; i < nebulaCount; i++) {
      const nebMat = new THREE.MeshBasicMaterial({
        map: nebTexture,
        transparent: true,
        opacity: 0.35 + Math.random() * 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const nebMesh = new THREE.Mesh(nebulaGeo, nebMat);
      const dist = 30 + Math.random() * 45;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 35;
      nebMesh.position.set(Math.cos(angle) * dist, y, Math.sin(angle) * dist);
      nebMesh.rotation.z = Math.random() * Math.PI * 2;
      nebMesh.scale.setScalar(1 + Math.random() * 1.5);
      nebulaGroup.add(nebMesh);
    }
    scene.add(nebulaGroup);

    // --- 3. CENTRAL CELESTIAL PORTAL & WOMAN PHOTO ---
    const centerGroup = new THREE.Group();
    scene.add(centerGroup);

    const photoRadius = 3.6;
    const photoGeo = new THREE.CircleGeometry(photoRadius, 64);

    // Initial placeholder texture while loading
    const defaultTexCanvas = document.createElement("canvas");
    defaultTexCanvas.width = 512;
    defaultTexCanvas.height = 512;
    const dtCtx = defaultTexCanvas.getContext("2d");
    if (dtCtx) {
      dtCtx.fillStyle = "#1e102d";
      dtCtx.fillRect(0, 0, 512, 512);
      dtCtx.fillStyle = "#ffd700";
      dtCtx.font = "bold 32px sans-serif";
      dtCtx.textAlign = "center";
      dtCtx.fillText("Cargando...", 256, 256);
    }
    const placeholderTexture = new THREE.CanvasTexture(defaultTexCanvas);

    const photoMat = new THREE.MeshBasicMaterial({
      map: placeholderTexture,
      side: THREE.DoubleSide,
    });
    const photoMesh = new THREE.Mesh(photoGeo, photoMat);
    photoMeshRef.current = photoMesh;
    centerGroup.add(photoMesh);

    // Load initial photo with undistorted aspect ratio
    loadCoverTexture(photoUrl, (loadedTex) => {
      photoMat.map = loadedTex;
      photoMat.needsUpdate = true;
      photoTextureRef.current = loadedTex;
    });

    // Golden Halo Ring around Photo
    const ringInnerGeo = new THREE.RingGeometry(photoRadius * 0.98, photoRadius * 1.05, 64);
    const ringInnerMat = new THREE.MeshBasicMaterial({
      color: 0xffe066,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const ringInner = new THREE.Mesh(ringInnerGeo, ringInnerMat);
    ringInner.position.z = 0.02;
    centerGroup.add(ringInner);

    // Outer Celestial Orbit Rings around Portal (Saturn style celestial rings)
    const ring1Geo = new THREE.RingGeometry(photoRadius * 1.15, photoRadius * 1.25, 80);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    centerGroup.add(ring1);

    const ring2Geo = new THREE.RingGeometry(photoRadius * 1.35, photoRadius * 1.48, 80);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI * 0.2;
    centerGroup.add(ring2);

    // Celestial Halo Glow Sprite (Outer rim corona halo behind photo)
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = 256;
    glowCanvas.height = 256;
    const gCtx = glowCanvas.getContext("2d");
    if (gCtx) {
      const gGrad = gCtx.createRadialGradient(128, 128, 55, 128, 128, 128);
      gGrad.addColorStop(0, "rgba(255, 215, 0, 0)"); // 100% clear at center
      gGrad.addColorStop(0.3, "rgba(255, 220, 80, 0.35)");
      gGrad.addColorStop(0.7, "rgba(255, 160, 20, 0.12)");
      gGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      gCtx.fillStyle = gGrad;
      gCtx.fillRect(0, 0, 256, 256);
    }
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    const glowSpriteMat = new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffe877,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0.35,
    });
    const glowSprite = new THREE.Sprite(glowSpriteMat);
    glowSprite.scale.set(photoRadius * 3.2, photoRadius * 3.2, 1);
    glowSprite.position.z = -0.35;
    centerGroup.add(glowSprite);

    // Orbiting Golden Particle Sparkles around the Portal
    const portalSparkleCount = 180;
    const portalSparkleGeo = new THREE.BufferGeometry();
    const portalSparklePos = new Float32Array(portalSparkleCount * 3);
    const portalSparkleAngles = new Float32Array(portalSparkleCount);
    const portalSparkleRadii = new Float32Array(portalSparkleCount);
    const portalSparkleSpeeds = new Float32Array(portalSparkleCount);

    for (let i = 0; i < portalSparkleCount; i++) {
      portalSparkleAngles[i] = Math.random() * Math.PI * 2;
      portalSparkleRadii[i] = photoRadius * (1.05 + Math.random() * 0.7);
      portalSparkleSpeeds[i] = (0.5 + Math.random() * 1.5) * (Math.random() > 0.5 ? 1 : -1);

      portalSparklePos[i * 3] = Math.cos(portalSparkleAngles[i]) * portalSparkleRadii[i];
      portalSparklePos[i * 3 + 1] = Math.sin(portalSparkleAngles[i]) * portalSparkleRadii[i];
      portalSparklePos[i * 3 + 2] = (Math.random() - 0.5) * 1.5;
    }
    portalSparkleGeo.setAttribute("position", new THREE.BufferAttribute(portalSparklePos, 3));
    const portalSparkleMat = new THREE.PointsMaterial({
      size: 0.6,
      map: starTexture,
      color: 0xffea77,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const portalSparkles = new THREE.Points(portalSparkleGeo, portalSparkleMat);
    centerGroup.add(portalSparkles);

    // --- 4. PROCEDURAL 3D YELLOW FLOWERS BUILDER ---
    const flowerGroup = new THREE.Group();
    flowersGroupRef.current = flowerGroup;
    scene.add(flowerGroup);

    // Create a 3D Yellow Flower (Sunflower / Golden Daisy)
    function createFlower3D(scale = 1) {
      const flower = new THREE.Group();

      // Flower Center (Amber-brown seed disc with dome)
      const centerGeo = new THREE.SphereGeometry(0.55 * scale, 24, 16);
      centerGeo.scale(1, 0.4, 1);
      const centerMat = new THREE.MeshStandardMaterial({
        color: 0x6e3c08,
        roughness: 0.75,
        metalness: 0.1,
        emissive: 0x422002,
        emissiveIntensity: 0.4,
      });
      const centerMesh = new THREE.Mesh(centerGeo, centerMat);
      flower.add(centerMesh);

      // Gold Glowing Core Rim
      const coreRimGeo = new THREE.TorusGeometry(0.52 * scale, 0.08 * scale, 12, 32);
      const coreRimMat = new THREE.MeshBasicMaterial({
        color: 0xffa500,
      });
      const coreRim = new THREE.Mesh(coreRimGeo, coreRimMat);
      coreRim.rotation.x = Math.PI / 2;
      flower.add(coreRim);

      // Yellow Petals (Layered in 2 concentric rings)
      const petalLayers = [
        { count: 18, length: 1.4 * scale, width: 0.28 * scale, color: 0xffd700, angleOffset: 0, tilt: 0.12 },
        { count: 18, length: 1.15 * scale, width: 0.24 * scale, color: 0xffc400, angleOffset: Math.PI / 18, tilt: 0.22 },
      ];

      // Petal geometry (sculpted curved petal)
      petalLayers.forEach((layer) => {
        const petalShape = new THREE.Shape();
        petalShape.moveTo(0, 0);
        petalShape.quadraticCurveTo(layer.width, layer.length * 0.5, 0, layer.length);
        petalShape.quadraticCurveTo(-layer.width, layer.length * 0.5, 0, 0);

        const extrudeSettings = {
          depth: 0.03 * scale,
          bevelEnabled: true,
          bevelSegments: 2,
          steps: 1,
          bevelSize: 0.02 * scale,
          bevelThickness: 0.02 * scale,
        };
        const petalGeo = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);

        const petalMat = new THREE.MeshStandardMaterial({
          color: layer.color,
          roughness: 0.35,
          metalness: 0.15,
          emissive: 0xffaa00,
          emissiveIntensity: 0.25,
          side: THREE.DoubleSide,
        });

        for (let i = 0; i < layer.count; i++) {
          const petalMesh = new THREE.Mesh(petalGeo, petalMat);
          const angle = (i / layer.count) * Math.PI * 2 + layer.angleOffset;

          petalMesh.position.set(0, 0, 0);
          petalMesh.rotation.z = angle;
          petalMesh.rotation.x = layer.tilt;
          petalMesh.translateY(0.42 * scale);
          flower.add(petalMesh);
        }
      });

      // Stem & Calyx (Small golden-green back)
      const calyxGeo = new THREE.ConeGeometry(0.4 * scale, 0.3 * scale, 12);
      const calyxMat = new THREE.MeshStandardMaterial({
        color: 0x4d7c0f,
        roughness: 0.6,
      });
      const calyx = new THREE.Mesh(calyxGeo, calyxMat);
      calyx.position.z = -0.15 * scale;
      calyx.rotation.x = -Math.PI / 2;
      flower.add(calyx);

      // Subtle warm local point light on larger flowers
      if (scale > 1.1) {
        const flowerLight = new THREE.PointLight(0xffd700, 0.4, 4 * scale);
        flowerLight.position.set(0, 0, 0.5 * scale);
        flower.add(flowerLight);
      }

      flower.userData = {
        baseScale: scale,
        wobbleSpeed: 1 + Math.random() * 2,
        wobblePhase: Math.random() * Math.PI * 2,
      };

      return flower;
    }

    // Populate Flowers in Orbiting Cosmic Constellations
    const flowerInstances: {
      mesh: THREE.Group;
      orbitRadius: number;
      orbitAngle: number;
      orbitSpeed: number;
      orbitTiltX: number;
      orbitTiltZ: number;
      yOffset: number;
      selfRotationSpeed: { x: number; y: number; z: number };
    }[] = [];

    // Layer 1: Inner Constellation Ring (8 flowers, close & fast)
    for (let i = 0; i < 8; i++) {
      const scale = 0.75 + Math.random() * 0.3;
      const flower = createFlower3D(scale);
      const radius = 6.2 + Math.random() * 2.2;
      const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;

      flowerGroup.add(flower);
      flowerInstances.push({
        mesh: flower,
        orbitRadius: radius,
        orbitAngle: angle,
        orbitSpeed: (0.35 + Math.random() * 0.25) * (Math.random() > 0.4 ? 1 : -1),
        orbitTiltX: (Math.random() - 0.5) * 0.8,
        orbitTiltZ: (Math.random() - 0.5) * 0.8,
        yOffset: (Math.random() - 0.5) * 2.5,
        selfRotationSpeed: {
          x: (Math.random() - 0.5) * 0.8,
          y: (Math.random() - 0.5) * 0.8,
          z: 0.5 + Math.random() * 0.8,
        },
      });
    }

    // Layer 2: Main Cosmic Spiral Belt (16 flowers)
    for (let i = 0; i < 16; i++) {
      const scale = 0.9 + Math.random() * 0.45;
      const flower = createFlower3D(scale);
      const radius = 10.5 + Math.random() * 4.5;
      const angle = (i / 16) * Math.PI * 2;

      flowerGroup.add(flower);
      flowerInstances.push({
        mesh: flower,
        orbitRadius: radius,
        orbitAngle: angle,
        orbitSpeed: 0.18 + Math.random() * 0.15,
        orbitTiltX: 0.35 + (Math.random() - 0.5) * 0.3,
        orbitTiltZ: (Math.random() - 0.5) * 0.4,
        yOffset: Math.sin(i) * 3,
        selfRotationSpeed: {
          x: (Math.random() - 0.5) * 0.6,
          y: (Math.random() - 0.5) * 0.6,
          z: 0.4 + Math.random() * 0.5,
        },
      });
    }

    // Layer 3: Deep Outer Universe Flowers (14 flowers, majestically floating)
    for (let i = 0; i < 14; i++) {
      const scale = 1.2 + Math.random() * 0.6;
      const flower = createFlower3D(scale);
      const radius = 16.5 + Math.random() * 8.5;
      const angle = (i / 14) * Math.PI * 2;

      flowerGroup.add(flower);
      flowerInstances.push({
        mesh: flower,
        orbitRadius: radius,
        orbitAngle: angle,
        orbitSpeed: 0.08 + Math.random() * 0.07,
        orbitTiltX: (Math.random() - 0.5) * 0.9,
        orbitTiltZ: (Math.random() - 0.5) * 0.9,
        yOffset: (Math.random() - 0.5) * 9,
        selfRotationSpeed: {
          x: (Math.random() - 0.5) * 0.4,
          y: (Math.random() - 0.5) * 0.4,
          z: 0.2 + Math.random() * 0.4,
        },
      });
    }

    // --- 5. FLOATING GOLDEN PETALS CLOUD ---
    const petalCount = 450;
    const petalGeo = new THREE.BufferGeometry();
    const petalPositions = new Float32Array(petalCount * 3);
    const petalVelocities: { x: number; y: number; z: number; rotX: number; rotY: number; rotZ: number }[] = [];

    // Petal texture
    const petalCanvas = document.createElement("canvas");
    petalCanvas.width = 64;
    petalCanvas.height = 64;
    const pCtx = petalCanvas.getContext("2d");
    if (pCtx) {
      pCtx.beginPath();
      pCtx.ellipse(32, 32, 28, 14, Math.PI / 4, 0, Math.PI * 2);
      const pGrad = pCtx.createLinearGradient(0, 0, 64, 64);
      pGrad.addColorStop(0, "#ffe066");
      pGrad.addColorStop(0.6, "#ffb703");
      pGrad.addColorStop(1, "#fb8500");
      pCtx.fillStyle = pGrad;
      pCtx.fill();
    }
    const petalTex = new THREE.CanvasTexture(petalCanvas);

    for (let i = 0; i < petalCount; i++) {
      petalPositions[i * 3] = (Math.random() - 0.5) * 45;
      petalPositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
      petalPositions[i * 3 + 2] = (Math.random() - 0.5) * 35;

      petalVelocities.push({
        x: (Math.random() - 0.5) * 0.025,
        y: -0.015 - Math.random() * 0.03,
        z: (Math.random() - 0.5) * 0.025,
        rotX: (Math.random() - 0.5) * 0.03,
        rotY: (Math.random() - 0.5) * 0.03,
        rotZ: (Math.random() - 0.5) * 0.03,
      });
    }
    petalGeo.setAttribute("position", new THREE.BufferAttribute(petalPositions, 3));

    const petalMat = new THREE.PointsMaterial({
      size: 1.4,
      map: petalTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const petalsPoints = new THREE.Points(petalGeo, petalMat);
    petalsGroupRef.current = petalsPoints;
    scene.add(petalsPoints);

    // --- 6. SHOOTING STARS ---
    const shootingStarCount = 3;
    const shootingStars: {
      mesh: THREE.Line;
      active: boolean;
      speed: THREE.Vector3;
      timer: number;
    }[] = [];

    for (let i = 0; i < shootingStarCount; i++) {
      const lineGeo = new THREE.BufferGeometry();
      const linePos = new Float32Array([0, 0, 0, -3, 2, -3]);
      lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));

      const lineMat = new THREE.LineBasicMaterial({
        color: 0xfff0a0,
        transparent: true,
        opacity: 0,
        linewidth: 2,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);

      shootingStars.push({
        mesh: line,
        active: false,
        speed: new THREE.Vector3(),
        timer: Math.random() * 5 + 2,
      });
    }

    // --- 7. MOUSE & TOUCH INTERACTION CONTROLS ---
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };
    const currentRotation = { x: 0, y: 0 };
    let mouseParallax = { x: 0, y: 0 };
    let targetCameraDistance = 24;
    let currentCameraDistance = 24;

    const raycaster = new THREE.Raycaster();
    const mouseVector = new THREE.Vector2();

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseParallax = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: -(e.clientY / window.innerHeight - 0.5) * 2,
      };

      if (!isDragging) return;

      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      targetRotation.y += deltaX * 0.005;
      targetRotation.x += deltaY * 0.005;

      // Limit pitch
      targetRotation.x = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, targetRotation.x));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = (e: MouseEvent) => {
      // Check click without drag
      if (isDragging) {
        const deltaX = Math.abs(e.clientX - previousMousePosition.x);
        const deltaY = Math.abs(e.clientY - previousMousePosition.y);
        if (deltaX < 5 && deltaY < 5) {
          // Raycast click
          mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
          mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
          raycaster.setFromCamera(mouseVector, camera);

          if (photoMeshRef.current) {
            const intersects = raycaster.intersectObject(photoMeshRef.current);
            if (intersects.length > 0) {
              onPhotoClick?.();
            }
          }
        }
      }
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      targetCameraDistance += e.deltaY * 0.015;
      targetCameraDistance = Math.max(9, Math.min(48, targetCameraDistance));
    };

    // Touch Support for mobile
    let touchStartDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDragging) {
        const deltaX = e.touches[0].clientX - previousMousePosition.x;
        const deltaY = e.touches[0].clientY - previousMousePosition.y;

        targetRotation.y += deltaX * 0.006;
        targetRotation.x += deltaY * 0.006;
        targetRotation.x = Math.max(-Math.PI * 0.45, Math.min(Math.PI * 0.45, targetRotation.x));

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = touchStartDist - dist;
        targetCameraDistance += diff * 0.04;
        targetCameraDistance = Math.max(9, Math.min(48, targetCameraDistance));
        touchStartDist = dist;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    // Resize handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // --- 8. ANIMATION LOOP ---
    const clock = new THREE.Clock();

    const animate = () => {
      requestRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera orbit damping
      if (isAutoRotate) {
        targetRotation.y += orbitSpeed * 0.006;
      }

      currentRotation.x += (targetRotation.x - currentRotation.x) * 0.06;
      currentRotation.y += (targetRotation.y - currentRotation.y) * 0.06;
      currentCameraDistance += (targetCameraDistance - currentCameraDistance) * 0.08;

      // Position camera spherically
      const camX =
        currentCameraDistance *
        Math.sin(currentRotation.y) *
        Math.cos(currentRotation.x) +
        mouseParallax.x * 0.6;
      const camY =
        currentCameraDistance * Math.sin(currentRotation.x) +
        mouseParallax.y * 0.6 +
        Math.sin(elapsedTime * 0.6) * 0.4;
      const camZ =
        currentCameraDistance *
        Math.cos(currentRotation.y) *
        Math.cos(currentRotation.x);

      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 0, 0);

      // Central Portal Animations
      if (photoMeshRef.current) {
        // Face camera gently with slight harmonic tilt
        photoMeshRef.current.lookAt(camera.position);
      }

      // Rotate Celestial Rings
      ring1.rotation.z += 0.008;
      ring2.rotation.z -= 0.005;
      ring2.rotation.x = Math.PI * 0.2 + Math.sin(elapsedTime * 0.8) * 0.08;

      // Pulse Central Halo & Glow softly
      const glowScale = (photoRadius * 3.2) * (1 + Math.sin(elapsedTime * 1.5) * 0.04) * bloomIntensity;
      glowSprite.scale.set(glowScale, glowScale, 1);
      glowSpriteMat.opacity = (0.28 + Math.sin(elapsedTime * 1.5) * 0.06) * bloomIntensity;

      // Animate Portal Sparkles
      const pPositions = portalSparkles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < portalSparkleCount; i++) {
        portalSparkleAngles[i] += portalSparkleSpeeds[i] * delta * 0.8;
        pPositions[i * 3] = Math.cos(portalSparkleAngles[i]) * portalSparkleRadii[i];
        pPositions[i * 3 + 1] = Math.sin(portalSparkleAngles[i]) * portalSparkleRadii[i];
        pPositions[i * 3 + 2] = Math.sin(elapsedTime * 2 + i) * 0.5;
      }
      portalSparkles.geometry.attributes.position.needsUpdate = true;

      // Rotate Starfield and Nebulae slowly
      starField.rotation.y = elapsedTime * 0.012;
      nebulaGroup.rotation.y = -elapsedTime * 0.006;

      // Animate 3D Flowers
      flowerInstances.forEach((f, idx) => {
        f.orbitAngle += f.orbitSpeed * delta * 0.6;

        // Calculate 3D Orbital position with tilt
        const rawX = Math.cos(f.orbitAngle) * f.orbitRadius;
        const rawZ = Math.sin(f.orbitAngle) * f.orbitRadius;
        const rawY = f.yOffset + Math.sin(elapsedTime * f.mesh.userData.wobbleSpeed + f.mesh.userData.wobblePhase) * 1.2;

        // Apply orbit tilt matrix
        const tiltedY = rawY * Math.cos(f.orbitTiltX) - rawZ * Math.sin(f.orbitTiltX);
        const tiltedZ = rawY * Math.sin(f.orbitTiltX) + rawZ * Math.cos(f.orbitTiltX);
        const tiltedX = rawX * Math.cos(f.orbitTiltZ) - tiltedY * Math.sin(f.orbitTiltZ);

        f.mesh.position.set(tiltedX, tiltedY, tiltedZ);

        // Self rotation and wobbling
        f.mesh.rotation.x += f.selfRotationSpeed.x * delta;
        f.mesh.rotation.y += f.selfRotationSpeed.y * delta;
        f.mesh.rotation.z += f.selfRotationSpeed.z * delta;

        // Make flower face somewhat towards outer space/central light
        f.mesh.lookAt(f.mesh.position.x * 1.5, f.mesh.position.y * 1.5 + 1, f.mesh.position.z * 1.5);
      });

      // Animate Floating Petals
      const petPos = petalsPoints.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < petalCount; i++) {
        const vel = petalVelocities[i];
        petPos[i * 3] += vel.x + Math.sin(elapsedTime + i) * 0.01;
        petPos[i * 3 + 1] += vel.y;
        petPos[i * 3 + 2] += vel.z + Math.cos(elapsedTime + i) * 0.01;

        // Wrap around bounds
        if (petPos[i * 3 + 1] < -18) petPos[i * 3 + 1] = 18;
        if (petPos[i * 3] < -25) petPos[i * 3] = 25;
        if (petPos[i * 3] > 25) petPos[i * 3] = -25;
        if (petPos[i * 3 + 2] < -25) petPos[i * 3 + 2] = 25;
        if (petPos[i * 3 + 2] > 25) petPos[i * 3 + 2] = -25;
      }
      petalsPoints.geometry.attributes.position.needsUpdate = true;

      // Animate Shooting Stars
      shootingStars.forEach((star) => {
        star.timer -= delta;
        if (star.timer <= 0 && !star.active) {
          star.active = true;
          const startRadius = 40 + Math.random() * 20;
          const theta = Math.random() * Math.PI * 2;
          const startPos = new THREE.Vector3(
            Math.cos(theta) * startRadius,
            (Math.random() - 0.2) * 30,
            Math.sin(theta) * startRadius
          );
          star.mesh.position.copy(startPos);
          star.speed.set(
            -(startPos.x / startRadius) * (25 + Math.random() * 20),
            -15 - Math.random() * 15,
            -(startPos.z / startRadius) * (25 + Math.random() * 20)
          );
          (star.mesh.material as THREE.LineBasicMaterial).opacity = 0.9;
        }

        if (star.active) {
          star.mesh.position.addScaledVector(star.speed, delta);
          const currentMat = star.mesh.material as THREE.LineBasicMaterial;
          currentMat.opacity -= delta * 0.8;

          if (currentMat.opacity <= 0) {
            star.active = false;
            star.timer = Math.random() * 8 + 3;
          }
        }
      });

      renderer.render(scene, camera);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", handleResize);

      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
      style={{ touchAction: "none" }}
    />
  );
}
