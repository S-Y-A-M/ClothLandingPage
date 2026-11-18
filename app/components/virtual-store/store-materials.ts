"use client";

import * as THREE from "three";

export const palette = {
  wall: "#e7e6e2",
  ceiling: "#f4f3f0",
  trim: "#f7f6f3",
  wood: "#e3d0b4",
  rust: "#c45c32",
  rustDeep: "#a34b2a",
  mannequin: "#f5f2ec",
  metal: "#eceae6",
  gold: "#d4a322",
  silver: "#d8dbe0",
  led: "#8fd6ff",
  leaf: "#3d6a46",
  pot: "#c6a15b",
  navy: "#1c3b72",
  mint: "#7ecfc0",
  mustard: "#e2b23a",
  beige: "#c9b394",
  cream: "#f3efe6",
  olive: "#6a7544",
  blush: "#e0b2a8",
  ink: "#2a2c31",
};

function solid(color: string, roughness: number, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness });
}

export const materials = {
  wall: solid(palette.wall, 0.94),
  ceiling: solid(palette.ceiling, 0.9),
  trim: solid(palette.trim, 0.48, 0.08),
  wood: solid(palette.wood, 0.62, 0.02),
  rust: solid(palette.rust, 0.9),
  rustDeep: solid(palette.rustDeep, 0.88),
  mannequin: new THREE.MeshStandardMaterial({ color: palette.mannequin, roughness: 0.36, metalness: 0.04 }),
  metal: solid(palette.metal, 0.32, 0.34),
  gold: new THREE.MeshPhysicalMaterial({ color: palette.gold, roughness: 0.2, metalness: 0.88, clearcoat: 0.45, reflectivity: 0.6 }),
  silver: new THREE.MeshPhysicalMaterial({ color: palette.silver, roughness: 0.14, metalness: 0.94, clearcoat: 0.55, reflectivity: 0.7 }),
  led: new THREE.MeshStandardMaterial({ color: "#e7f7ff", emissive: palette.led, emissiveIntensity: 2.8, roughness: 0.35 }),
  bulb: new THREE.MeshStandardMaterial({ color: "#fffaf3", emissive: "#fff3dc", emissiveIntensity: 3.4, roughness: 0.45 }),
  recess: solid("#c9c7c2", 0.7, 0.1),
  leaf: solid(palette.leaf, 0.74),
  pot: new THREE.MeshStandardMaterial({ color: palette.pot, roughness: 0.32, metalness: 0.74 }),
  string: solid("#c8c4bc", 0.6),
  frame: solid("#fbfbfa", 0.4, 0.16),
};

const fabricCache = new Map<string, THREE.MeshStandardMaterial>();

export function fabricMaterial(color: string) {
  let material = fabricCache.get(color);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color, roughness: 0.94, metalness: 0 });
    fabricCache.set(color, material);
  }
  return material;
}

function drawCanvas(draw: (context: CanvasRenderingContext2D, size: number) => void, repeat: [number, number]) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.MeshStandardMaterial({ color: "#cccccc" });
  draw(context, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat[0], repeat[1]);
  texture.anisotropy = 8;
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.9, metalness: 0 });
}

let patterns: { quilt: THREE.Material; stripe: THREE.Material; floral: THREE.Material; tile: THREE.MeshStandardMaterial; flute: THREE.MeshStandardMaterial; mark: THREE.MeshStandardMaterial } | null = null;

export function getPatterns() {
  if (patterns) return patterns;
  if (typeof document === "undefined") {
    const fallback = fabricMaterial(palette.navy);
    patterns = { quilt: fallback, stripe: fallback, floral: fallback, tile: materials.wall, flute: materials.trim, mark: materials.trim };
    return patterns;
  }

  patterns = {
    quilt: drawCanvas((context, size) => {
      context.fillStyle = "#1a3668";
      context.fillRect(0, 0, size, size);
      context.strokeStyle = "#24457f";
      context.lineWidth = 3;
      for (let i = -size; i < size * 2; i += 28) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i + size, size);
        context.stroke();
        context.beginPath();
        context.moveTo(i, size);
        context.lineTo(i + size, 0);
        context.stroke();
      }
    }, [1, 1]),
    stripe: drawCanvas((context, size) => {
      context.fillStyle = "#1e3d78";
      context.fillRect(0, 0, size, size);
      context.fillStyle = "#f4f0e6";
      for (let y = 8; y < size; y += 22) context.fillRect(0, y, size, 4);
    }, [1, 1]),
    floral: drawCanvas((context, size) => {
      context.fillStyle = "#f6f1e8";
      context.fillRect(0, 0, size, size);
      const dots: [number, number, string, number][] = [
        [40, 48, "#d4534a", 7],
        [70, 36, "#6d8a45", 5],
        [96, 70, "#31548f", 6],
        [150, 40, "#d4534a", 8],
        [180, 86, "#e0b23a", 5],
        [48, 120, "#31548f", 6],
        [120, 140, "#d4534a", 7],
        [200, 160, "#6d8a45", 6],
        [80, 190, "#c45c32", 5],
        [170, 200, "#31548f", 7],
      ];
      dots.forEach(([x, y, color, radius]) => {
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      });
    }, [1.4, 2]),
    tile: drawCanvas((context, size) => {
      context.fillStyle = "#b7b6b1";
      context.fillRect(0, 0, size, size);
      for (let i = 0; i < 90; i += 1) {
        const shade = 150 + Math.floor(Math.random() * 28);
        context.fillStyle = `rgba(${shade}, ${shade - 1}, ${shade - 3}, 0.18)`;
        context.fillRect(Math.random() * size, Math.random() * size, 30 + Math.random() * 70, 18 + Math.random() * 40);
      }
      context.strokeStyle = "#9e9c98";
      context.lineWidth = 7;
      context.strokeRect(3, 3, size - 6, size - 6);
    }, [9.2, 17.6]) as THREE.MeshStandardMaterial,
    flute: drawCanvas((context, size) => {
      context.fillStyle = "#f7f6f3";
      context.fillRect(0, 0, size, size);
      for (let x = 0; x < size; x += 10) {
        context.fillStyle = x % 20 === 0 ? "#e1dfdb" : "#ffffff";
        context.fillRect(x, 0, 5, size);
      }
    }, [1, 1]) as THREE.MeshStandardMaterial,
    mark: drawCanvas((context, size) => {
      context.fillStyle = "#2f6fe0";
      context.fillRect(0, 0, size, size);
      context.fillStyle = "#ffffff";
      context.font = "italic 132px Georgia";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("A.", size / 2, size / 2 + 8);
    }, [1, 1]) as THREE.MeshStandardMaterial,
  };
  patterns.flute.roughness = 0.55;
  patterns.tile.roughness = 0.4;
  patterns.tile.metalness = 0.06;
  return patterns;
}
