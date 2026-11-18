"use client";

import { ContactShadows } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { useThree } from "@react-three/fiber";
import { getPatterns, materials } from "./store-materials";
import { layout } from "./store-layout";

function IndoorReflections() {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    scene.environmentIntensity = 0.38;
    return () => {
      environment.texture.dispose();
      pmrem.dispose();
      room.traverse((object) => {
        const mesh = object as THREE.Mesh;
        mesh.geometry?.dispose();
        if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose());
        else mesh.material?.dispose();
      });
      if (scene.environment === environment.texture) scene.environment = null;
    };
  }, [gl, scene]);
  return null;
}

function CeilingLights() {
  const lights = useMemo(() => {
    const points: [number, number, number][] = [];
    for (let x = -2.4; x <= 2.4; x += 1.2) {
      for (let z = 2.2; z >= -9.4; z -= 1.45) points.push([x, layout.ceilingY - 0.02, z]);
    }
    return points;
  }, []);
  const practical = [
    [-1.2, 2.92, 1.5],
    [1.2, 2.92, 1.3],
    [0, 2.92, -1.3],
    [-1.3, 2.92, -3.3],
    [1.2, 2.92, -3.5],
    [0, 2.92, -6.4],
    [-1.1, 2.92, -8.5],
  ] as const;

  return (
    <group name="ceiling-lights">
      {lights.map((position) => (
        <group key={position.join(",")} position={position} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh material={materials.recess}>
            <ringGeometry args={[0.055, 0.095, 20]} />
          </mesh>
          <mesh position={[0, 0, 0.005]} material={materials.bulb}>
            <circleGeometry args={[0.05, 18]} />
          </mesh>
        </group>
      ))}
      {practical.map((position) => (
        <pointLight key={position.join(",")} position={position} intensity={16} distance={6.2} decay={2} color="#fff4e4" />
      ))}
    </group>
  );
}

function Balloon({ position, material }: { position: [number, number, number]; material: THREE.Material }) {
  return (
    <group position={position}>
      <mesh material={material} castShadow>
        <sphereGeometry args={[0.11, 18, 14]} />
      </mesh>
      <mesh position={[0, -0.12, 0]} material={material}>
        <coneGeometry args={[0.018, 0.04, 8]} />
      </mesh>
      <mesh position={[0, -0.42, 0]} material={materials.string}>
        <cylinderGeometry args={[0.003, 0.003, 0.58, 4]} />
      </mesh>
    </group>
  );
}

function ShadowLight({ detailed }: { detailed: boolean }) {
  const light = useRef<THREE.DirectionalLight>(null);
  useLayoutEffect(() => {
    const current = light.current;
    if (!current) return;
    current.target.position.set(0, 0.4, -3.2);
    current.target.updateMatrixWorld();
    const camera = current.shadow.camera;
    camera.near = 1;
    camera.far = 22;
    camera.left = -6.5;
    camera.right = 6.5;
    camera.top = 6.5;
    camera.bottom = -6.5;
    camera.updateProjectionMatrix();
  }, []);

  return (
    <directionalLight
      ref={light}
      position={[1.6, 8.4, 2.4]}
      intensity={2.45}
      color="#fff1df"
      castShadow={detailed}
      shadow-mapSize={detailed ? [2048, 2048] : [1024, 1024]}
      shadow-bias={-0.00028}
      shadow-normalBias={0.045}
    />
  );
}

function StorePlant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.16, 0]} material={materials.trim}>
        <cylinderGeometry args={[0.16, 0.13, 0.32, 16]} />
      </mesh>
      <mesh position={[0, 0.55, 0]} material={materials.leaf} castShadow>
        <sphereGeometry args={[0.28, 14, 12]} />
      </mesh>
      <mesh position={[0.16, 0.42, 0.05]} material={materials.leaf}>
        <sphereGeometry args={[0.16, 12, 10]} />
      </mesh>
      <mesh position={[-0.12, 0.4, -0.04]} material={materials.leaf}>
        <sphereGeometry args={[0.14, 12, 10]} />
      </mesh>
    </group>
  );
}

export default function StoreEnvironment({ detailed }: { detailed: boolean }) {
  const floorMaterial = useMemo(() => getPatterns().tile, []);
  return (
    <group name="store-environment">
      <IndoorReflections />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, layout.floor.centerZ]} receiveShadow material={floorMaterial}>
        <planeGeometry args={[layout.floor.width, layout.floor.depth]} />
      </mesh>
      <mesh position={[0, 3.2, layout.floor.centerZ]} material={materials.ceiling}>
        <boxGeometry args={[layout.wallX * 2 + 0.24, 0.16, layout.floor.depth]} />
      </mesh>
      <mesh position={[-layout.wallX, 1.6, layout.floor.centerZ]} material={materials.wall}>
        <boxGeometry args={[0.12, 3.24, layout.floor.depth]} />
      </mesh>
      <mesh position={[layout.wallX, 1.6, layout.floor.centerZ]} material={materials.wall}>
        <boxGeometry args={[0.12, 3.24, layout.floor.depth]} />
      </mesh>
      <mesh position={[0, 1.6, layout.backWallZ]} material={materials.wall}>
        <boxGeometry args={[layout.wallX * 2, 3.24, 0.12]} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (layout.wallX - 0.12), 0.08, layout.floor.centerZ]} material={materials.trim}>
          <boxGeometry args={[0.06, 0.16, layout.floor.depth - 0.3]} />
        </mesh>
      ))}
      <mesh position={[0, 0.08, layout.backWallZ + 0.1]} material={materials.trim}>
        <boxGeometry args={[layout.wallX * 2, 0.16, 0.06]} />
      </mesh>
      <mesh position={[0, 2.78, layout.entranceZ]} material={materials.frame}>
        <boxGeometry args={[2.86, 0.08, 0.1]} />
      </mesh>
      {[-1.35, 1.35].map((x) => (
        <mesh key={x} position={[x, 1.45, layout.entranceZ]} material={materials.frame}>
          <boxGeometry args={[0.08, 2.7, 0.1]} />
        </mesh>
      ))}
      <CeilingLights />
      <hemisphereLight args={["#fffaf6", "#9a9894", 0.72]} />
      <ambientLight intensity={0.34} color="#fff8f2" />
      <directionalLight position={[0.6, 4.2, 5.5]} intensity={0.9} color="#f7f4ef" />
      <ShadowLight detailed={detailed} />
      <Balloon position={[-2.42, 2.58, 1.42]} material={materials.gold} />
      <Balloon position={[-2.18, 2.74, 1.62]} material={materials.silver} />
      <Balloon position={[-2.58, 2.46, 1.2]} material={materials.gold} />
      <Balloon position={[-2.34, 2.62, -1.55]} material={materials.silver} />
      <Balloon position={[-2.55, 2.48, -1.78]} material={materials.gold} />
      <Balloon position={[2.62, 1.92, -0.72]} material={materials.gold} />
      <Balloon position={[2.84, 2.12, -0.5]} material={materials.silver} />
      <Balloon position={[2.48, 1.74, -0.95]} material={materials.silver} />
      {detailed && <Balloon position={[2.7, 2.28, -4.2]} material={materials.gold} />}
      <StorePlant position={[-2.35, 0, -0.85]} />
      <StorePlant position={[2.55, 0, -3.15]} scale={0.85} />
      <ContactShadows position={[0, 0.002, -3.1]} opacity={0.32} scale={14} blur={2.4} far={4.2} resolution={detailed ? 512 : 256} frames={1} color="#5f5d5a" />
    </group>
  );
}
