import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshTransmissionMaterial, Environment, ContactShadows } from "@react-three/drei";
import type { Mesh, Group } from "three";
import { useSiteConfig } from "@/config/SiteConfigProvider";

function GoldOrb() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock, pointer }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.18 + pointer.x * 0.4;
    ref.current.rotation.x = pointer.y * 0.25;
  });
  return (
    <Float speed={1.1} rotationIntensity={0.5} floatIntensity={1.2}>
      <mesh ref={ref} scale={1.7} position={[0.4, 0.1, 0]}>
        <icosahedronGeometry args={[1, 24]} />
        <MeshDistortMaterial
          color="#e8c468"
          metalness={0.95}
          roughness={0.12}
          distort={0.32}
          speed={1.3}
          emissive="#3a2200"
          emissiveIntensity={0.25}
        />
      </mesh>
    </Float>
  );
}

function GlassRing() {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.z = t * 0.2;
    ref.current.rotation.x = Math.sin(t * 0.4) * 0.3;
  });
  return (
    <Float speed={0.8} floatIntensity={0.6}>
      <group ref={ref} position={[-0.8, -0.3, -0.5]}>
        <mesh scale={2.4}>
          <torusGeometry args={[1, 0.04, 32, 128]} />
          <MeshTransmissionMaterial
            thickness={0.5}
            roughness={0.05}
            transmission={1}
            ior={1.4}
            chromaticAberration={0.06}
            color="#fff5dc"
          />
        </mesh>
      </group>
    </Float>
  );
}

function FloatingShard() {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.rotation.y = t * 0.4;
    ref.current.rotation.x = t * 0.3;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.8} floatIntensity={1.6}>
      <mesh ref={ref} position={[1.8, 1.2, 0.4]} scale={0.35}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#a785ff" metalness={0.8} roughness={0.2} emissive="#3a1f8a" emissiveIntensity={0.5} />
      </mesh>
    </Float>
  );
}

export function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} color="#fff5dc" />
      <directionalLight position={[-5, -2, -3]} intensity={0.7} color="#a785ff" />
      <pointLight position={[0, -3, 2]} intensity={0.6} color="#e8c468" />
      <Suspense fallback={null}>
        <GoldOrb />
        <GlassRing />
        <FloatingShard />
        <Environment preset="city" />
        <ContactShadows position={[0, -2.2, 0]} opacity={0.4} blur={3.5} far={5} />
      </Suspense>
    </Canvas>
  );
}
