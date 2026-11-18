"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { fabricMaterial, getPatterns, materials, palette } from "./store-materials";

export type HangingPiece = {
  color: string;
  length: number;
  pattern?: "floral" | "stripe";
};

function HangingGarment({ piece, index }: { piece: HangingPiece; index: number }) {
  const material = piece.pattern ? getPatterns()[piece.pattern] : fabricMaterial(piece.color);
  const sleeve = piece.length > 0.66 ? 0.16 : 0.12;
  return (
    <group rotation={[0, (index - 3) * 0.035, 0]}>
      <mesh position={[0, 0.04, 0]} rotation={[0.2, 0, 0]} material={materials.metal}>
        <torusGeometry args={[0.05, 0.006, 6, 14, Math.PI]} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={materials.metal}>
        <cylinderGeometry args={[0.007, 0.007, 0.32, 6]} />
      </mesh>
      <mesh position={[0, -piece.length / 2, 0]} castShadow material={material}>
        <boxGeometry args={[0.26, piece.length, 0.045]} />
      </mesh>
      <mesh position={[-0.16, -0.08, 0]} rotation={[0, 0, 0.55]} castShadow material={material}>
        <boxGeometry args={[sleeve, 0.09, 0.04]} />
      </mesh>
      <mesh position={[0.16, -0.08, 0]} rotation={[0, 0, -0.55]} castShadow material={material}>
        <boxGeometry args={[sleeve, 0.09, 0.04]} />
      </mesh>
      <mesh position={[0, -0.02, 0.028]} material={fabricMaterial("#f7f4ee")}>
        <boxGeometry args={[0.07, 0.045, 0.012]} />
      </mesh>
    </group>
  );
}

function ShelfStack({ color, position }: { color: string; position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow material={fabricMaterial(color)}>
      <boxGeometry args={[0.28, 0.1, 0.22]} />
    </mesh>
  );
}

const shelfPalette = [palette.cream, palette.navy, palette.rust, palette.mint, palette.mustard, palette.beige, palette.olive, palette.blush, palette.ink];

export function shirtsForBay(index: number, count: number): HangingPiece[] {
  const colors = [palette.cream, "#f7f4ee", palette.olive, "#c4493a", "#fbfbfa", palette.navy, palette.blush, palette.ink, "#d9d3ea", palette.beige];
  const patterns: HangingPiece["pattern"][] = [undefined, "floral", undefined, "floral", undefined, "stripe", undefined, undefined, "floral", undefined];
  const lengths = [0.56, 0.74, 0.64, 0.6, 0.48, 0.68, 0.76, 0.54, 0.62, 0.58];
  return Array.from({ length: count }, (_, shirt) => ({
    color: colors[(shirt + index * 2) % colors.length],
    length: lengths[(shirt + index) % lengths.length],
    pattern: patterns[(shirt + index) % patterns.length],
  }));
}

export default function ClothingRack({
  position,
  rotation = [0, 0, 0],
  shirts,
  seed = 0,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  shirts: HangingPiece[];
  seed?: number;
}) {
  const shelves = useMemo(() => [0.48, 1.08, 1.68, 2.18], []);
  return (
    <group position={position} rotation={rotation} name="clothing-rack">
      {[[-0.68, 0.04], [0.68, 0.04], [-0.68, 0.5], [0.68, 0.5]].map(([x, z]) => (
        <mesh key={`${x}-${z}`} position={[x, 1.22, z]} castShadow material={materials.frame}>
          <boxGeometry args={[0.035, 2.44, 0.035]} />
        </mesh>
      ))}
      {shelves.map((y, shelfIndex) => (
        <group key={y}>
          <mesh position={[0, y, 0.22]} receiveShadow material={materials.trim}>
            <boxGeometry args={[1.32, 0.028, 0.4]} />
          </mesh>
          {[-0.46, -0.15, 0.16, 0.47].map((x, stackIndex) => (
            <ShelfStack
              key={x}
              position={[x, y + 0.07, 0.2]}
              color={shelfPalette[(seed + shelfIndex + stackIndex) % shelfPalette.length]}
            />
          ))}
        </group>
      ))}
      <mesh position={[0, 1.34, 0.56]} rotation={[0, 0, Math.PI / 2]} material={materials.metal}>
        <cylinderGeometry args={[0.012, 0.012, 1.28, 8]} />
      </mesh>
      {shirts.map((piece, index) => {
        const x = (index - (shirts.length - 1) / 2) * (1.16 / Math.max(shirts.length - 1, 1));
        return (
          <group key={`${piece.color}-${index}`} position={[x, 1.34, 0.58]}>
            <HangingGarment piece={piece} index={index} />
          </group>
        );
      })}
    </group>
  );
}
