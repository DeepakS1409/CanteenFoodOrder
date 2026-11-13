import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Three.js 3D Ambient Stage
 * Renders dynamic 3D lighting, floating ingredient particles, glowing energy rings, 
 * and interactive depth reactive to mouse/touch movement.
 */
export default function FoodCanvas3D({ themeColor = "#F59E0B", activeIndex = 0 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 24;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dynamic Color
    const activeColor = new THREE.Color(themeColor);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(activeColor, 4, 30);
    pointLight.position.set(0, 2, 10);
    scene.add(pointLight);

    const rimLight = new THREE.PointLight(0xff7700, 2.5, 40);
    rimLight.position.set(10, -5, -5);
    scene.add(rimLight);

    // Group for rotating 3D particles & aura
    const showcaseGroup = new THREE.Group();
    scene.add(showcaseGroup);

    // 1. Floating Spices & Herb Particles
    const particleCount = 70;
    const particleGeometry = new THREE.TetrahedronGeometry(0.18, 0);
    const particleMaterial = new THREE.MeshStandardMaterial({
      color: activeColor,
      roughness: 0.3,
      metalness: 0.8,
      emissive: activeColor,
      emissiveIntensity: 0.35,
    });

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const mesh = new THREE.Mesh(particleGeometry, particleMaterial.clone());
      const radius = 6 + Math.random() * 7;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.8;

      mesh.position.set(
        radius * Math.cos(theta) * Math.cos(phi),
        radius * Math.sin(phi),
        radius * Math.sin(theta) * Math.cos(phi) - 2
      );

      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      mesh.scale.setScalar(0.4 + Math.random() * 0.9);

      mesh.userData = {
        speedY: (Math.random() - 0.5) * 0.015,
        speedRot: (Math.random() - 0.5) * 0.03,
        theta,
        radius,
        orbitSpeed: (0.002 + Math.random() * 0.004) * (Math.random() > 0.5 ? 1 : -1)
      };

      showcaseGroup.add(mesh);
      particles.push(mesh);
    }

    // 2. Glowing Golden Base Ring (Plate Pedestal)
    const ringGeo = new THREE.TorusGeometry(7.2, 0.06, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: activeColor,
      transparent: true,
      opacity: 0.45
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    ringMesh.position.y = -4.5;
    showcaseGroup.add(ringMesh);

    // 3. Secondary Dotted Orbit Ring
    const orbitPoints = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      orbitPoints.push(new THREE.Vector3(Math.cos(angle) * 8.8, 0, Math.sin(angle) * 8.8));
    }
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMat = new THREE.LineDashedMaterial({
      color: 0xffffff,
      dashSize: 0.5,
      gapSize: 0.6,
      opacity: 0.25,
      transparent: true
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.computeLineDistances();
    orbitLine.rotation.x = Math.PI / 2.4;
    orbitLine.position.y = -4.6;
    showcaseGroup.add(orbitLine);

    // Mouse Interaction Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mouseX = x * 0.35;
      mouseY = y * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth camera / group rotation tracking mouse
      targetRotY += (mouseX - targetRotY) * 0.05;
      targetRotX += (mouseY - targetRotX) * 0.05;

      showcaseGroup.rotation.y = targetRotY + Math.sin(elapsed * 0.4) * 0.08;
      showcaseGroup.rotation.x = targetRotX + Math.cos(elapsed * 0.3) * 0.04;

      ringMesh.rotation.z = elapsed * 0.15;
      orbitLine.rotation.z = -elapsed * 0.1;

      // Animate floating particles
      particles.forEach((p) => {
        p.userData.theta += p.userData.orbitSpeed;
        p.position.x = p.userData.radius * Math.cos(p.userData.theta);
        p.position.z = p.userData.radius * Math.sin(p.userData.theta) - 2;
        p.position.y += Math.sin(elapsed * 2 + p.userData.radius) * 0.005;
        p.rotation.x += p.userData.speedRot;
        p.rotation.y += p.userData.speedRot;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      orbitGeo.dispose();
      orbitMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [themeColor, activeIndex]);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center"
      style={{ opacity: 0.95 }}
    />
  );
}

