"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useRef } from "react";
import * as THREE from "three";
import type { CameraMotion } from "./store-layout";
import { initialCamera } from "./store-layout";

export default function CameraController({
  motion,
  parallax,
}: {
  motion: React.RefObject<CameraMotion>;
  parallax: React.RefObject<{ x: number; y: number }>;
}) {
  const { camera } = useThree();
  const desiredPosition = useRef(new THREE.Vector3(initialCamera.x, initialCamera.y, initialCamera.z));
  const desiredLook = useRef(new THREE.Vector3(initialCamera.lx, initialCamera.ly, initialCamera.lz));
  const look = useRef(desiredLook.current.clone());

  useLayoutEffect(() => {
    camera.position.copy(desiredPosition.current);
    camera.lookAt(desiredLook.current);
  }, [camera]);

  useFrame((state, delta) => {
    const current = motion.current;
    const offset = parallax.current;
    if (!current || !offset) return;
    const sway = Math.sin(state.clock.elapsedTime * 0.4) * 0.008;
    desiredPosition.current.set(current.x + offset.x * 0.045, current.y + offset.y * 0.03 + sway, current.z);
    desiredLook.current.set(current.lx + offset.x * 0.26, current.ly + offset.y * 0.1, current.lz);
    const alpha = 1 - Math.exp(-delta * 4.2);
    camera.position.lerp(desiredPosition.current, alpha);
    look.current.lerp(desiredLook.current, alpha);
    camera.lookAt(look.current);
  });

  return null;
}
