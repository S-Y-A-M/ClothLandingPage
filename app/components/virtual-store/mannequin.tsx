"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { materials } from "./store-materials";

function CapsuleLimb({
  from,
  to,
  radius,
  material,
}: {
  from: readonly [number, number, number];
  to: readonly [number, number, number];
  radius: number;
  material: THREE.Material;
}) {
  const pose = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = end.clone().sub(start);
    const distance = direction.length();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    return {
      position: start.clone().add(end).multiplyScalar(0.5).toArray() as [number, number, number],
      quaternion,
      length: Math.max(0.02, distance - radius * 2),
    };
  }, [from, to, radius]);

  return (
    <mesh position={pose.position} quaternion={pose.quaternion} material={material} castShadow>
      <capsuleGeometry args={[radius, pose.length, 4, 10]} />
    </mesh>
  );
}

const limbs = [
  { from: [0.2, 1.38, 0.02], to: [0.33, 1.08, 0.06], radius: 0.055, cloth: true },
  { from: [0.33, 1.08, 0.06], to: [0.24, 0.86, 0.08], radius: 0.046, cloth: true },
  { from: [-0.2, 1.38, 0.02], to: [-0.33, 1.08, 0.06], radius: 0.055, cloth: true },
  { from: [-0.33, 1.08, 0.06], to: [-0.24, 0.86, 0.08], radius: 0.046, cloth: true },
  { from: [0.09, 0.78, 0], to: [0.1, 0.06, 0.02], radius: 0.055, cloth: false },
  { from: [-0.09, 0.78, 0], to: [-0.1, 0.06, 0.02], radius: 0.055, cloth: false },
] as const;

export default function Mannequin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} name="mannequin">
      {limbs.map((limb) => (
        <CapsuleLimb
          key={`${limb.from[0]}-${limb.from[1]}-${limb.cloth}`}
          from={limb.from}
          to={limb.to}
          radius={limb.radius}
          material={limb.cloth ? materials.rust : materials.mannequin}
        />
      ))}
      <mesh position={[0, 0.9, 0]} material={materials.rustDeep} castShadow>
        <cylinderGeometry args={[0.19, 0.205, 0.09, 18]} />
      </mesh>
      <mesh position={[0, 1.18, 0]} castShadow material={materials.rust}>
        <capsuleGeometry args={[0.155, 0.34, 4, 14]} />
      </mesh>
      <mesh position={[0, 1.38, 0]} scale={[1.45, 0.42, 0.85]} castShadow material={materials.rust}>
        <sphereGeometry args={[0.16, 18, 14]} />
      </mesh>
      <mesh position={[0, 1.5, 0.02]} rotation={[Math.PI / 2.4, 0, 0]} material={materials.rustDeep}>
        <torusGeometry args={[0.062, 0.018, 8, 18]} />
      </mesh>
      <mesh position={[0, 1.56, 0]} material={materials.mannequin}>
        <cylinderGeometry args={[0.045, 0.05, 0.1, 12]} />
      </mesh>
      <mesh position={[0, 1.7, 0]} scale={[0.94, 1.06, 0.9]} castShadow material={materials.mannequin}>
        <sphereGeometry args={[0.105, 24, 18]} />
      </mesh>
      {[0.24, -0.24].map((x) => (
        <mesh key={x} position={[x, 0.82, 0.1]} material={materials.mannequin} castShadow>
          <sphereGeometry args={[0.042, 14, 12]} />
        </mesh>
      ))}
      {[0.1, -0.1].map((x) => (
        <mesh key={x} position={[x, 0.03, 0.04]} material={materials.mannequin}>
          <boxGeometry args={[0.09, 0.04, 0.16]} />
        </mesh>
      ))}
    </group>
  );
}
