'use client';
import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorld } from '@/store/useWorld';
import { curve, motion, placeStop, stopT } from './track';

/** Smoothly moves the camera between the map view, chase view and stop view. */
export default function CameraRig({ stopCount }: { stopCount: number }) {
  const { camera, size, pointer } = useThree();
  const look = useRef(new THREE.Vector3(0, 0, 2));
  const pos = useRef(new THREE.Vector3(0, 90, 80));
  const stops = useMemo(() => Array.from({ length: stopCount }, (_, i) => placeStop(i, stopCount)), [stopCount]);
  const tp = useMemo(() => new THREE.Vector3(), []);
  const tl = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const { mode, current } = useWorld.getState();
    const aspect = size.width / size.height;
    const narrow = size.width < 700;

    if (mode === 'map' || mode === 'boot') {
      const k = Math.max(1.12, 2.15 / aspect);
      tp.set(pointer.x * 3, 44 * k + pointer.y * 1.5, 60 * k);
      tl.set(0, 0, 4);
    } else if (mode === 'drive') {
      const p = curve.getPointAt(motion.carT), g = curve.getTangentAt(motion.carT);
      const dir = Math.sign(stopT(current, stopCount) - motion.carT) || 1;
      tp.set(p.x - g.x * 15 * dir, 10, p.z - g.z * 15 * dir + 4);
      tl.set(p.x, 0.5, p.z);
    } else {
      const s = stops[current].pos;
      if (narrow) { tp.set(s.x, 7, s.z + 14); tl.set(s.x, -2.2, s.z); }
      else { tp.set(s.x + pointer.x * 0.6, 4.8 + pointer.y * 0.4, s.z + 11.5); tl.set(s.x + 4.6, 1.3, s.z); }
    }
    const rate = mode === 'drive' ? 3.2 : 2.2;
    const k = 1 - Math.exp(-dt * rate);
    pos.current.lerp(tp, k);
    look.current.lerp(tl, Math.min(1, k * 1.3));
    camera.position.copy(pos.current);
    camera.lookAt(look.current);
  });
  return null;
}
