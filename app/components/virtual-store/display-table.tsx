"use client";

import { fabricMaterial, getPatterns, materials, palette } from "./store-materials";
import { layout } from "./store-layout";

function FoldStack({
  position,
  color,
  layers,
  pattern,
}: {
  position: [number, number, number];
  color: string;
  layers: number;
  pattern?: "quilt" | "stripe";
}) {
  const material = pattern ? getPatterns()[pattern] : fabricMaterial(color);
  return (
    <group position={position}>
      {Array.from({ length: layers }, (_, index) => (
        <mesh
          key={index}
          position={[((index % 3) - 1) * 0.005, index * 0.03, ((index % 2) - 0.5) * 0.004]}
          rotation={[0, (index - layers / 2) * 0.012, 0]}
          castShadow={index === layers - 1}
          material={material}
        >
          <boxGeometry args={[0.34, 0.026, 0.24]} />
        </mesh>
      ))}
    </group>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.07, 0]} material={materials.pot} castShadow>
        <cylinderGeometry args={[0.055, 0.042, 0.13, 16]} />
      </mesh>
      <mesh position={[0, 0.2, 0]} material={materials.leaf} castShadow>
        <sphereGeometry args={[0.085, 12, 10]} />
      </mesh>
      <mesh position={[0.05, 0.16, 0.02]} scale={[0.8, 0.65, 0.6]} material={materials.leaf}>
        <sphereGeometry args={[0.06, 10, 8]} />
      </mesh>
      <mesh position={[-0.04, 0.15, -0.02]} scale={[0.7, 0.55, 0.55]} material={materials.leaf}>
        <sphereGeometry args={[0.05, 10, 8]} />
      </mesh>
    </group>
  );
}

function TableFrame({ size }: { size: [number, number] }) {
  const [width, depth] = size;
  const posts: [number, number][] = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ];
  return (
    <group>
      {posts.map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[(width / 2 - 0.08) * x, 0.48, (depth / 2 - 0.08) * z]} material={materials.trim}>
          <boxGeometry args={[0.045, 0.96, 0.045]} />
        </mesh>
      ))}
      <mesh position={[0, 0.46, 0]} receiveShadow material={materials.trim}>
        <boxGeometry args={[width - 0.08, 0.03, depth - 0.08]} />
      </mesh>
      <mesh position={[0, 0.96, 0]} receiveShadow castShadow material={materials.trim}>
        <boxGeometry args={[width, 0.04, depth]} />
      </mesh>
      <mesh position={[0, 0.985, 0]} receiveShadow material={materials.wood}>
        <boxGeometry args={[width - 0.05, 0.018, depth - 0.05]} />
      </mesh>
    </group>
  );
}

const frontStacks = [
  { position: [-0.48, 0.5, 0.24] as [number, number, number], color: palette.navy, layers: 5 },
  { position: [0, 0.5, 0.24] as [number, number, number], color: palette.mint, layers: 5 },
  { position: [0.48, 0.5, 0.24] as [number, number, number], color: palette.mustard, layers: 5 },
  { position: [-0.48, 0.5, -0.16] as [number, number, number], color: palette.navy, layers: 5, pattern: "quilt" as const },
  { position: [0, 0.5, -0.16] as [number, number, number], color: palette.navy, layers: 5, pattern: "stripe" as const },
  { position: [0.48, 0.5, -0.16] as [number, number, number], color: palette.rust, layers: 5 },
  { position: [-0.48, 1.03, 0.22] as [number, number, number], color: palette.navy, layers: 4, pattern: "quilt" as const },
  { position: [0, 1.03, 0.22] as [number, number, number], color: palette.navy, layers: 4, pattern: "stripe" as const },
  { position: [0.48, 1.03, 0.22] as [number, number, number], color: palette.rust, layers: 4 },
  { position: [-0.48, 1.03, -0.18] as [number, number, number], color: palette.cream, layers: 4 },
  { position: [0.46, 1.03, -0.18] as [number, number, number], color: palette.beige, layers: 4 },
];

const rearStacks = [
  { position: [-0.42, 1.03, 0.08] as [number, number, number], color: palette.cream, layers: 5 },
  { position: [0.08, 1.03, 0.1] as [number, number, number], color: "#f7f5f1", layers: 4 },
  { position: [0.46, 1.03, -0.08] as [number, number, number], color: palette.beige, layers: 5 },
  { position: [-0.36, 0.5, 0] as [number, number, number], color: palette.navy, layers: 4 },
  { position: [0.28, 0.5, 0.05] as [number, number, number], color: palette.rust, layers: 4 },
];

export default function DisplayTable({ variant }: { variant: "front" | "rear" }) {
  const spec = variant === "front" ? layout.frontTable : layout.rearTable;
  const stacks = variant === "front" ? frontStacks : rearStacks;
  return (
    <group position={spec.position} name={`${variant}-display-table`}>
      <TableFrame size={spec.size} />
      {stacks.map((stack) => (
        <FoldStack key={stack.position.join(",")} {...stack} />
      ))}
      {variant === "front" && <Plant position={[0.02, 1.02, -0.16]} />}
    </group>
  );
}
