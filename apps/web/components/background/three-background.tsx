"use client";

import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamically import Three.js components to ensure they only load on client
const ThreeJSCanvas = dynamic(
  () => import("@react-three/fiber").then((mod) => mod.Canvas),
  { ssr: false }
);
const ThreeJSFloat = dynamic(
  () => import("@react-three/drei").then((mod) => mod.Float),
  { ssr: false }
);
const ThreeJSPreload = dynamic(
  () => import("@react-three/drei").then((mod) => mod.Preload),
  { ssr: false }
);
const ThreeJSUseDetectGPU = dynamic(
  () => import("@react-three/drei").then((mod) => mod.useDetectGPU),
  { ssr: false }
);

// Dynamic import of THREE
const THREE = dynamic(() => import("three"), { ssr: false });

// Simple fallback component to render when Three.js is loading
function SimpleFallback() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-900 to-purple-900" />
  );
}

function FloatingShape({ position, rotation, scale, color, speed = 1 }) {
  const mesh = useRef(null);
  const [hovered, setHover] = useState(false);

  // Safe version of useFrame that only runs on client
  const useFrame = dynamic(
    () => import("@react-three/fiber").then((mod) => mod.useFrame),
    { ssr: false }
  );

  if (typeof useFrame !== "function") return null;

  useFrame?.((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime() * speed;
    mesh.current.rotation.x = Math.sin(t / 4) / 8;
    mesh.current.rotation.y = Math.sin(t / 4) / 8;
    mesh.current.rotation.z = Math.sin(t / 4) / 8;
    mesh.current.position.y = Math.sin(t / 2) / 10;
    if (THREE?.MathUtils) {
      mesh.current.scale.x = THREE.MathUtils.lerp(
        mesh.current.scale.x,
        hovered ? scale * 1.2 : scale,
        0.1
      );
      mesh.current.scale.y = THREE.MathUtils.lerp(
        mesh.current.scale.y,
        hovered ? scale * 1.2 : scale,
        0.1
      );
      mesh.current.scale.z = THREE.MathUtils.lerp(
        mesh.current.scale.z,
        hovered ? scale * 1.2 : scale,
        0.1
      );
    }
  });

  return (
    <mesh
      ref={mesh}
      position={position}
      rotation={rotation}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.6}
        roughness={0.5}
        metalness={0.8}
      />
    </mesh>
  );
}

function FloatingParticles({
  count = 50,
  colors = ["#4361ee", "#3a0ca3", "#7209b7"],
}) {
  const particles = useRef<THREE.Points>(null!);
  const [positions, setPositions] = useState<Float32Array | null>(null);

  useEffect(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 10;
      positions[i3 + 1] = (Math.random() - 0.5) * 10;
      positions[i3 + 2] = (Math.random() - 0.5) * 10;
    }
    setPositions(positions);
  }, [count]);

  useFrame((state) => {
    if (particles.current) {
      const time = state.clock.getElapsedTime();
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        particles.current.geometry.attributes.position.array[i3 + 1] +=
          Math.sin(time + i) * 0.002;
      }
      particles.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (!positions) return null;

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function Scene() {
  const gpu = useDetectGPU();
  const isLowEnd = gpu.tier < 2;

  // Reduce complexity for low-end devices
  const shapeCount = isLowEnd ? 3 : 6;
  const particleCount = isLowEnd ? 30 : 80;

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={0.3} />

      {Array.from({ length: shapeCount }).map((_, i) => (
        <ThreeJSFloat
          key={i}
          speed={1}
          rotationIntensity={1}
          floatIntensity={2}
        >
          <FloatingShape
            position={[
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 8,
              (Math.random() - 0.5) * 5 - 5,
            ]}
            rotation={[
              Math.random() * Math.PI,
              Math.random() * Math.PI,
              Math.random() * Math.PI,
            ]}
            scale={Math.random() * 0.5 + 0.3}
            color={`hsl(${Math.random() * 60 + 210}, 80%, 50%)`}
            speed={Math.random() * 0.5 + 0.5}
          />
        </ThreeJSFloat>
      ))}

      <FloatingParticles count={particleCount} />
      <ThreeJSPreload all />
    </>
  );
}

export function ThreeBackground() {
  const [mounted, setMounted] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsClient(typeof window !== "undefined");
  }, []);

  if (!mounted || !isClient) return <SimpleFallback />;

  // Using a simpler fallback approach
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900" />
    </div>
  );
}
