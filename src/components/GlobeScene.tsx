'use client';

import { useRef, useMemo, useCallback, useState } from 'react';
import { Canvas, useFrame, extend, type ThreeElements } from '@react-three/fiber';
import { useTexture, shaderMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { globeMarkers } from '@/lib/data';

function latLngToPosition(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(-radius * Math.sin(phi) * Math.cos(theta), radius * Math.cos(phi), radius * Math.sin(phi) * Math.sin(theta));
}

function createGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.1, 'rgba(180,230,255,0.9)');
  g.addColorStop(0.3, 'rgba(80,180,255,0.5)');
  g.addColorStop(1, 'rgba(80,180,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function createSoftGlowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, 'rgba(255,255,255,0.3)');
  g.addColorStop(0.3, 'rgba(100,200,255,0.15)');
  g.addColorStop(1, 'rgba(100,200,255,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(canvas);
}

function Stars() {
  const count = 3000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 50 + Math.random() * 150;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.3} color="#ffffff" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

function SceneContent({ onMarkerClick }: { onMarkerClick: (url: string) => void }) {
  const groupRef = useRef<THREE.Group>(null!);
  const glowRef = useRef<THREE.Sprite>(null!);
  const markerTexture = useMemo(() => createGlowTexture(), []);
  const softGlow = useMemo(() => createSoftGlowTexture(), []);

  const [earthTex] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
    ]);

  const handleClick = useCallback((e: any) => {
    if (e.distance > 5) return;
    const p = e.point.clone().normalize();
    const lat = 90 - (Math.acos(p.y) * 180) / Math.PI;
    const lng = ((Math.atan2(-p.x, p.z) * 180) / Math.PI) % 360;
    for (const marker of globeMarkers) {
      const dLat = lat - marker.coordinates.lat;
      const dLng = lng - marker.coordinates.lng;
      if (dLat * dLat + dLng * dLng < 400) {
        onMarkerClick(marker.targetUrl);
        return;
      }
    }
  }, [onMarkerClick]);

  // 整个地球组一起旋转，光点随地球同步
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.06;
    }
    // 云层单独旋转，比地球稍快
    // 标记呼吸动画（极慢）
    if (glowRef.current) {
      const s = 0.35 + Math.sin(Date.now() * 0.0005) * 0.03;
      glowRef.current.scale.set(s, s, 1);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 地球 */}
      <mesh onClick={handleClick}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial map={earthTex} />
      </mesh>

      {/* 云层 */}
      {/* 大气辉光 */}
      {/* 中国区域大光晕 */}
      {globeMarkers.map((marker) => {
        const pos = latLngToPosition(marker.coordinates.lat, marker.coordinates.lng, 2.15);
        return (
          <sprite key={'glow-' + marker.id} position={pos} scale={[0.8, 0.8, 1]}>
            <spriteMaterial map={softGlow} transparent depthTest={true} opacity={0.6} />
          </sprite>
        );
      })}

      {/* 标记光点 */}
      {globeMarkers.map((marker) => {
        const pos = latLngToPosition(marker.coordinates.lat, marker.coordinates.lng, 2.15);
        return (
          <sprite
            key={marker.id}
            ref={marker.id === 'china' ? glowRef : undefined}
            position={pos}
            scale={[0.32, 0.32, 1]}
            onClick={() => onMarkerClick(marker.targetUrl)}
          >
            <spriteMaterial map={markerTexture} transparent depthTest={true} />
          </sprite>
        );
      })}

      {/* 中国标签 */}
      {globeMarkers.map((marker) => {
        const pos = latLngToPosition(marker.coordinates.lat, marker.coordinates.lng, 2.35);
        return (
          <sprite key={'label-' + marker.id} position={pos} scale={[0.8, 0.35, 1]}>
            <spriteMaterial map={useMemo(() => {
              const c = document.createElement('canvas');
              c.width = 256; c.height = 80;
              const ctx = c.getContext('2d')!;
              ctx.clearRect(0, 0, 256, 80);
              ctx.fillStyle = 'rgba(255,255,255,0.85)';
              ctx.font = 'bold 36px sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(marker.label, 128, 42);
              const tex = new THREE.CanvasTexture(c);
              tex.needsUpdate = true;
              return tex;
            }, [])} transparent depthTest={true} opacity={0.7} />
          </sprite>
        );
      })}

      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 3, 5]} intensity={3.5} />
      <pointLight position={[-5, -3, -5]} intensity={0.8} color="#4488ff" />
    </group>
  );
}

export default function GlobeScene() {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);
  const [, setTargetUrl] = useState('');

  const handleMarkerClick = useCallback((url: string) => {
    setTargetUrl(url);
    setTransitioning(true);
    setTimeout(() => { router.push(url); }, 1400);
  }, [router]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0e1a]">
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
          <Stars />
          <SceneContent onMarkerClick={handleMarkerClick} />
          <OrbitControls enableZoom enablePan={false} minDistance={3.5} maxDistance={8} rotateSpeed={0.5} zoomSpeed={0.8} />
        </Canvas>
      </div>
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center pointer-events-none z-10">
        <h1 className="text-white/80 text-2xl sm:text-3xl font-light tracking-[0.3em]">影展地图</h1>
        <p className="text-white/30 text-sm mt-2 tracking-widest">探索世界的每个角落</p>
      </div>
      <AnimatePresence>
        {transitioning && (
          <motion.div
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            animate={{ clipPath: 'circle(150% at 50% 50%)' }}
            exit={{ clipPath: 'circle(0% at 50% 50%)' }}
            transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-black z-50 flex items-center justify-center"
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }} className="text-center">
              <div className="w-16 h-16 border-2 border-white/20 border-t-blue-400 rounded-full animate-spin mx-auto mb-6" />
              <p className="text-white/60 text-sm tracking-[0.3em]">进入探索</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/25 text-xs tracking-[0.2em]">拖动旋转 | 滚轮缩放 | 点击光点探索</div>
    </div>
  );
}
