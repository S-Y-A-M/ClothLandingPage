export const layout = {
  wallX: 3.62,
  backWallZ: -10.55,
  ceilingY: 3.08,
  entranceZ: 3.05,
  floor: { width: 8.4, depth: 16.2, centerZ: -3.15 },
  mannequin: [0, 0, -2.52] as [number, number, number],
  frontTable: {
    position: [0, 0, -1.55] as [number, number, number],
    size: [1.56, 1.06] as [number, number],
  },
  rearTable: {
    position: [0, 0, -3.42] as [number, number, number],
    size: [1.48, 0.78] as [number, number],
  },
  checkout: [3.08, 0, -1.42] as [number, number, number],
  rackDepth: 0.52,
};

export const cameraKeys = [
  { t: 0, x: 0.04, y: 1.6, z: 3.72, lx: 0, ly: 1.28, lz: -1.15 },
  { t: 0.12, x: 0.02, y: 1.59, z: 3.12, lx: 0, ly: 1.24, lz: -1.35 },
  { t: 0.3, x: 0, y: 1.57, z: 1.28, lx: 0, ly: 1.14, lz: -1.6 },
  { t: 0.44, x: 0.05, y: 1.44, z: 0.18, lx: 0, ly: 0.94, lz: -1.58 },
  { t: 0.58, x: -0.03, y: 1.55, z: -0.38, lx: 0, ly: 1.5, lz: -2.52 },
  { t: 0.68, x: 0.06, y: 1.56, z: -0.52, lx: 0.03, ly: 1.54, lz: -2.52 },
  { t: 0.8, x: 1.08, y: 1.57, z: -0.82, lx: 0.12, ly: 1.28, lz: -3.5 },
  { t: 0.91, x: 1.16, y: 1.58, z: -3.85, lx: 0.08, ly: 1.3, lz: -8.4 },
  { t: 1, x: 0.38, y: 1.6, z: -5.2, lx: 0, ly: 1.34, lz: -9.7 },
];

export type CameraMotion = {
  x: number;
  y: number;
  z: number;
  lx: number;
  ly: number;
  lz: number;
};

export const initialCamera: CameraMotion = cameraKeys[0];

export function bayPositions(count: number, side: "left" | "right" | "back") {
  if (side === "back") {
    return [-1.2, 1.2].slice(0, count).map((x) => [x, 0, -10.05] as [number, number, number]);
  }
  const start = side === "left" ? 1.48 : -4.05;
  const step = side === "left" ? -1.6 : -1.75;
  const x = side === "left" ? -3.22 : 3.22;
  return Array.from({ length: count }, (_, index) => [x, 0, start + index * step] as [number, number, number]);
}
