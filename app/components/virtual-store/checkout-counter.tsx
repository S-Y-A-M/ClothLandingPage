"use client";

import { getPatterns, materials } from "./store-materials";

export default function CheckoutCounter({ position }: { position: [number, number, number] }) {
  const width = 1.55;
  const depth = 0.68;
  const patterns = getPatterns();
  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]} name="checkout-counter">
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow material={materials.trim}>
        <boxGeometry args={[width, 1.0, depth]} />
      </mesh>
      <mesh position={[0, 0.55, depth / 2 + 0.012]} material={patterns.flute}>
        <boxGeometry args={[width * 0.96, 0.86, 0.02]} />
      </mesh>
      <mesh position={[0, 1.02, 0]} receiveShadow material={materials.trim}>
        <boxGeometry args={[width + 0.04, 0.045, depth + 0.04]} />
      </mesh>
      <mesh position={[0, 0.97, depth / 2 + 0.02]} material={materials.led}>
        <boxGeometry args={[width * 0.84, 0.012, 0.012]} />
      </mesh>
      <mesh position={[0, 0.08, depth / 2 + 0.02]} material={materials.led}>
        <boxGeometry args={[width * 0.9, 0.02, 0.014]} />
      </mesh>
      <mesh position={[0, 0.58, depth / 2 + 0.03]}>
        <planeGeometry args={[0.16, 0.16]} />
        <primitive object={patterns.mark} attach="material" />
      </mesh>
      <pointLight position={[0, 0.45, depth / 2 + 0.28]} color="#9ad8ff" intensity={8} distance={2.6} decay={2} />
    </group>
  );
}
