import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Environment, ContactShadows } from "@react-three/drei";
import type { Mesh } from "three";

function LuxeOrb() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock, pointer }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.25 + pointer.x * 0.5;
    ref.current.rotation.x = pointer.y * 0.3;
  });
  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh ref={ref} scale={1.6}>
        <icosahedronGeometry args={[1, 16]} />
        <MeshDistortMaterial
          color="#e8c468"
          metalness={0.95}
          roughness={0.15}
          distort={0.35}
          speed={1.6}
          emissive="#553300"
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

export function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#fff5dc" />
      <directionalLight position={[-5, -2, -3]} intensity={0.6} color="#a785ff" />
      <Suspense fallback={null}>
        <LuxeOrb />
        <Environment preset="city" />
        <ContactShadows position={[0, -2, 0]} opacity={0.35} blur={3} far={4} />
      </Suspense>
    </Canvas>
  );
}
