import gsap from "gsap";
import { cameraKeys, type CameraMotion } from "./store-layout";

export function applyCameraTimeline(timeline: gsap.core.Timeline, motion: CameraMotion) {
  const first = cameraKeys[0];
  gsap.set(motion, { x: first.x, y: first.y, z: first.z, lx: first.lx, ly: first.ly, lz: first.lz });
  for (let index = 1; index < cameraKeys.length; index += 1) {
    const previous = cameraKeys[index - 1];
    const key = cameraKeys[index];
    timeline.to(
      motion,
      {
        x: key.x,
        y: key.y,
        z: key.z,
        lx: key.lx,
        ly: key.ly,
        lz: key.lz,
        duration: key.t - previous.t,
        ease: index < 3 ? "power1.inOut" : "sine.inOut",
      },
      previous.t,
    );
  }
}

export function chapterFromProgress(progress: number) {
  if (progress < 0.12) return 0;
  if (progress < 0.4) return 1;
  if (progress < 0.68) return 2;
  if (progress < 0.86) return 3;
  return 4;
}
