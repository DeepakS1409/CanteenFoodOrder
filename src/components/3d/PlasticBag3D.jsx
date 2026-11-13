import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

/**
 * Procedural Normal Map Generator for Crinkly Plastic Takeaway Bags
 * Generates realistic wrinkles and folds without needing external texture files.
 */
function createPlasticWrinkleTexture() {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Fill with neutral normal color (RGB: 128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);

  // Draw smooth crease lines and wrinkles
  ctx.lineWidth = 3;
  for (let i = 0; i < 40; i++) {
    const y = Math.random() * size;
    const alpha = 0.15 + Math.random() * 0.25;
    ctx.strokeStyle = `rgba(180, 180, 255, ${alpha})`;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(
      size * 0.3, y + (Math.random() - 0.5) * 60,
      size * 0.7, y + (Math.random() - 0.5) * 60,
      size, y + (Math.random() - 0.5) * 30
    );
    ctx.stroke();

    // Dark crease shadow
    ctx.strokeStyle = `rgba(80, 80, 200, ${alpha * 0.7})`;
    ctx.beginPath();
    ctx.moveTo(0, y + 2);
    ctx.bezierCurveTo(
      size * 0.3, y + 2 + (Math.random() - 0.5) * 60,
      size * 0.7, y + 2 + (Math.random() - 0.5) * 60,
      size, y + 2 + (Math.random() - 0.5) * 30
    );
    ctx.stroke();
  }

  // Vertical gusset folds
  for (let x = 80; x < size; x += 120) {
    ctx.strokeStyle = 'rgba(100, 100, 220, 0.2)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() - 0.5) * 20, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

/**
 * Creates CampusBite brand decal for the plastic bag
 */
function createBagLogoTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 512);

  // Canteen Brand Stamp
  ctx.save();
  ctx.translate(256, 256);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Rounded emblem outline
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.roundRect(-160, -110, 320, 220, 30);
  ctx.stroke();

  // Logo Text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 44px Outfit, sans-serif';
  ctx.fillText('CampusBite', 0, -35);

  ctx.fillStyle = '#F59E0B';
  ctx.font = 'bold 22px Outfit, sans-serif';
  ctx.fillText('COLLEGE CANTEEN EXPRESS', 0, 15);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = '16px Plus Jakarta Sans, sans-serif';
  ctx.fillText('100% Recyclable • Zero Waste', 0, 55);
  ctx.restore();

  return new THREE.CanvasTexture(canvas);
}

/**
 * Realistic 3D Translucent Plastic Takeaway Carry Bag
 * Handles 3 phases: 'open', 'drop', and 'sealed'
 */
export default function PlasticBag3D({ phase = 'open', foodImage = null, quantity = 1 }) {
  const containerRef = useRef(null);
  const bagGroupRef = useRef(null);
  const handleLeftRef = useRef(null);
  const handleRightRef = useRef(null);
  const foodMeshRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(5, 8, 8);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 2.5);
    rimLight.position.set(-6, -4, 4);
    scene.add(rimLight);

    const backRimLight = new THREE.PointLight(0xffffff, 3, 20);
    backRimLight.position.set(0, 4, -5);
    scene.add(backRimLight);

    // Textures
    const wrinkleTexture = createPlasticWrinkleTexture();
    const logoTexture = createBagLogoTexture();

    // Translucent Plastic Carry Bag Material
    // High transmission + clearcoat gives realistic polyethylene plastic look
    const plasticMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.68, // translucent plastic sheen
      opacity: 0.88,
      transparent: true,
      roughness: 0.22,
      ior: 1.46, // plastic index of refraction
      thickness: 0.6,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
      clearcoat: 0.65,
      clearcoatRoughness: 0.25,
      normalMap: wrinkleTexture,
      normalScale: new THREE.Vector2(0.35, 0.35),
      side: THREE.DoubleSide,
      depthWrite: false
    });

    // Whole Bag Master Group
    const bagGroup = new THREE.Group();
    bagGroup.position.y = -0.5;
    scene.add(bagGroup);
    bagGroupRef.current = bagGroup;

    // 1. Bag Body: Curved, hollow rectangular pouch with open mouth
    // Custom curved profile
    const bagWidth = 4.4;
    const bagHeight = 5.2;
    const bagDepth = 2.4;

    const bagGeo = new THREE.CylinderGeometry(
      bagWidth * 0.48, // top radius (mouth)
      bagWidth * 0.52, // bottom radius (slightly wider belly)
      bagHeight,
      32,
      12,
      true // open-ended cylinder to receive food!
    );
    // Flatten cylinder into a realistic tote / carry bag depth
    bagGeo.scale(1.0, 1.0, bagDepth / bagWidth);

    const bagMesh = new THREE.Mesh(bagGeo, plasticMaterial);
    bagMesh.position.y = 0;
    bagGroup.add(bagMesh);

    // Bottom Seam / Fold
    const bottomGeo = new THREE.PlaneGeometry(bagWidth * 0.95, bagDepth * 0.9);
    const bottomMesh = new THREE.Mesh(bottomGeo, plasticMaterial);
    bottomMesh.rotation.x = Math.PI / 2;
    bottomMesh.position.y = -bagHeight / 2;
    bagGroup.add(bottomMesh);

    // Front Brand Stamp Quad
    const logoGeo = new THREE.PlaneGeometry(3.2, 3.2);
    const logoMat = new THREE.MeshBasicMaterial({
      map: logoTexture,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.position.set(0, 0.2, (bagDepth / 2) * 0.95);
    bagGroup.add(logoMesh);

    // 2. Plastic Handles: Left and Right Looped Straps
    const createHandle = (isLeft) => {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(isLeft ? -1.4 : 1.4, bagHeight / 2 - 0.2, 0),
        new THREE.Vector3(isLeft ? -1.8 : 1.8, bagHeight / 2 + 1.2, 0),
        new THREE.Vector3(isLeft ? -1.3 : 1.3, bagHeight / 2 + 2.4, 0),
        new THREE.Vector3(isLeft ? -0.8 : 0.8, bagHeight / 2 + 1.4, 0),
        new THREE.Vector3(isLeft ? -0.5 : 0.5, bagHeight / 2 - 0.2, 0),
      ]);
      const handleGeo = new THREE.TubeGeometry(curve, 24, 0.12, 8, false);
      const handleMesh = new THREE.Mesh(handleGeo, plasticMaterial);
      return handleMesh;
    };

    const handleLeft = createHandle(true);
    const handleRight = createHandle(false);
    bagGroup.add(handleLeft);
    bagGroup.add(handleRight);

    handleLeftRef.current = handleLeft;
    handleRightRef.current = handleRight;

    // 3. Packed Food Texture Mesh inside the bag (revealed once packed)
    if (foodImage) {
      const loader = new THREE.TextureLoader();
      loader.load(foodImage, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const foodGeo = new THREE.CylinderGeometry(1.6, 1.8, 1.6, 24);
        const foodMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.4,
          metalness: 0.1
        });
        const foodMesh = new THREE.Mesh(foodGeo, foodMat);
        foodMesh.position.set(0, -1.2, 0);
        foodMesh.scale.set(0.001, 0.001, 0.001); // starts invisible until dropped
        bagGroup.add(foodMesh);
        foodMeshRef.current = foodMesh;
      });
    }

    // 4. Ground Shadow Disc
    const shadowGeo = new THREE.PlaneGeometry(6, 3);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = -bagHeight / 2 - 0.05;
    bagGroup.add(shadowMesh);

    // Initial Entrance Animation with GSAP
    gsap.fromTo(
      bagGroup.scale,
      { x: 0.7, y: 0.7, z: 0.7 },
      { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(1.5)' }
    );
    gsap.fromTo(
      bagGroup.position,
      { y: -3 },
      { y: -0.5, duration: 0.6, ease: 'power2.out' }
    );

    // Mouse Parallax Interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.25;
      mouseY = y * 0.15;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Render Loop
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Gentle floating sway
      bagGroup.rotation.y += (mouseX - bagGroup.rotation.y) * 0.05 + Math.sin(elapsed * 1.5) * 0.003;
      bagGroup.rotation.x += (mouseY - bagGroup.rotation.x) * 0.05 + Math.cos(elapsed * 1.2) * 0.002;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      renderer.dispose();
      bagGeo.dispose();
      bottomGeo.dispose();
      logoGeo.dispose();
      plasticMaterial.dispose();
      wrinkleTexture.dispose();
      logoTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [foodImage]);

  // Reactive updates when Phase changes ('open' -> 'drop' -> 'sealed')
  useEffect(() => {
    const bagGroup = bagGroupRef.current;
    const handleL = handleLeftRef.current;
    const handleR = handleRightRef.current;
    const foodMesh = foodMeshRef.current;

    if (!bagGroup || !handleL || !handleR) return;

    if (phase === 'open') {
      // Handles spread apart waiting for food
      gsap.to(handleL.position, { x: -0.35, duration: 0.4, ease: 'power2.out' });
      gsap.to(handleR.position, { x: 0.35, duration: 0.4, ease: 'power2.out' });
      gsap.to(handleL.rotation, { z: -0.15, duration: 0.4 });
      gsap.to(handleR.rotation, { z: 0.15, duration: 0.4 });
    } else if (phase === 'drop') {
      // Impact compression & sag as food lands inside
      gsap.to(bagGroup.scale, {
        y: 0.88,
        x: 1.08,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: 'power1.inOut'
      });
      gsap.to(bagGroup.position, {
        y: -0.9,
        duration: 0.18,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });

      // Internal food becomes visible through translucent plastic
      if (foodMesh) {
        gsap.to(foodMesh.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.4,
          delay: 0.1,
          ease: 'back.out(1.2)'
        });
      }
    } else if (phase === 'sealed') {
      // Handles come together and bag gently settles
      gsap.to(handleL.position, { x: 0.4, duration: 0.5, ease: 'power2.inOut' });
      gsap.to(handleR.position, { x: -0.4, duration: 0.5, ease: 'power2.inOut' });
      gsap.to(handleL.rotation, { z: 0.08, duration: 0.5 });
      gsap.to(handleR.rotation, { z: -0.08, duration: 0.5 });

      // Settling bounce
      gsap.to(bagGroup.position, {
        y: -0.65,
        duration: 0.4,
        ease: 'bounce.out'
      });
    }
  }, [phase]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full min-h-[360px] sm:min-h-[440px] flex items-center justify-center pointer-events-auto"
    />
  );
}
