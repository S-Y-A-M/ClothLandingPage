"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { memo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { storePoster } from "../../catalog";
import CameraController from "./camera-controller";
import CheckoutCounter from "./checkout-counter";
import ClothingRack, { shirtsForBay } from "./clothing-rack";
import DisplayTable from "./display-table";
import Mannequin from "./mannequin";
import { bayPositions, initialCamera, layout, type CameraMotion } from "./store-layout";
import StoreEnvironment from "./store-environment";

function SettleShadows() {
  const { gl } = useThree();
  const frames = useRef(0);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 10) gl.shadowMap.autoUpdate = false;
  });
  return null;
}

function StoreScene({
  motion,
  parallax,
  onReady,
}: {
  motion: React.RefObject<CameraMotion>;
  parallax: React.RefObject<{ x: number; y: number }>;
  onReady?: () => void;
}) {
  const [canvasReady, setCanvasReady] = useState(false);
  const [detailed, setDetailed] = useState(true);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDetailed(!window.matchMedia("(max-width: 760px)").matches);
    const element = host.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
        setCanvasReady(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasReady) return;
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 80);
    return () => window.clearTimeout(refresh);
  }, [canvasReady]);

  const leftBays = bayPositions(detailed ? 7 : 4, "left");
  const rightBays = bayPositions(detailed ? 3 : 2, "right");
  const backBays = bayPositions(detailed ? 2 : 1, "back");
  const shirtCount = detailed ? 7 : 5;

  return (
    <div className="store-canvas-host" ref={host}>
      {canvasReady && (
        <Canvas
          camera={{ position: [initialCamera.x, initialCamera.y, initialCamera.z], fov: detailed ? 48 : 54, near: 0.08, far: 40 }}
          dpr={detailed ? [1, 1.4] : [1, 1.1]}
          shadows
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance", stencil: false }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.shadowMap.type = THREE.PCFSoftShadowMap;
            window.requestAnimationFrame(() => onReady?.());
          }}
          fallback={
            <div
              className="store-canvas-fallback"
              role="img"
              aria-label="Atelier clothing boutique"
              style={{ backgroundImage: `url("${encodeURI(storePoster)}")` }}
            />
          }
        >
          <color attach="background" args={["#e4e2de"]} />
          <fog attach="fog" args={["#e4e2de", 11, 23]} />
          <StoreEnvironment detailed={detailed} />
          {leftBays.map((position, index) => (
            <ClothingRack key={`left-${position[2]}`} position={position} rotation={[0, Math.PI / 2, 0]} shirts={shirtsForBay(index, shirtCount)} seed={index} />
          ))}
          {rightBays.map((position, index) => (
            <ClothingRack key={`right-${position[2]}`} position={position} rotation={[0, -Math.PI / 2, 0]} shirts={shirtsForBay(index + 3, shirtCount)} seed={index + 4} />
          ))}
          {backBays.map((position, index) => (
            <ClothingRack key={`back-${position[0]}`} position={position} shirts={shirtsForBay(index + 6, shirtCount)} seed={index + 8} />
          ))}
          <DisplayTable variant="front" />
          <DisplayTable variant="rear" />
          <Mannequin position={layout.mannequin} />
          <CheckoutCounter position={layout.checkout} />
          <CameraController motion={motion} parallax={parallax} />
          <SettleShadows />
        </Canvas>
      )}
    </div>
  );
}

export default memo(StoreScene);
