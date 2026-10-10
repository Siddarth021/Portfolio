'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import type { Group } from 'three';
import { useWorld } from '@/store/useWorld';
import { Box, Cyl, useMats } from '../parts/kit';
import { curve, motion, stopT } from './track';

/** A small matte coupe that drives the road between stops. */
export default function Car({ stopCount }: { stopCount: number }) {
  const m = useMats();
  const car = useRef<Group>(null);
  const wheels = useRef<(Group | null)[]>([]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const { mode, current, setMode } = useWorld.getState();
    let moved = 0;
    if (mode === 'drive' && current >= 0) {
      const goal = stopT(current, stopCount);
      const d = goal - motion.carT;
      const step = Math.min(Math.max(Math.abs(d) * 0.6, 0.02), 0.12) * dt;
      if (Math.abs(d) <= step + 0.0008) { moved = Math.abs(d); motion.carT = goal; setMode('stop'); }
      else { moved = step * Math.sign(d); motion.carT += moved; }
    }
    const p = curve.getPointAt(motion.carT), g = curve.getTangentAt(motion.carT);
    if (car.current) {
      car.current.position.set(p.x, 0.06, p.z);
      car.current.rotation.y = Math.atan2(-g.z, g.x);
    }
    const spin = (moved * curve.getLength()) / 0.32;
    wheels.current.forEach((w) => { if (w) w.rotation.z -= spin; });
  });

  return (
    <group ref={car} scale={1.35}>
      <RoundedBox args={[2.5, 0.55, 1.25]} radius={0.22} smoothness={4} position={[0, 0.58, 0]} material={m.car} castShadow receiveShadow />
      <RoundedBox args={[1.35, 0.5, 1.08]} radius={0.2} smoothness={4} position={[-0.15, 1.02, 0]} material={m.white} castShadow />
      <Box s={[0.05, 0.36, 0.96]} p={[0.53, 1.03, 0]} r={[0, 0, -0.5]} m={m.chip} shadow={false} />
      <Box s={[0.05, 0.32, 0.96]} p={[-0.83, 1.03, 0]} r={[0, 0, 0.5]} m={m.chip} shadow={false} />
      <Box s={[0.9, 0.28, 0.02]} p={[-0.15, 1.05, 0.55]} m={m.chip} shadow={false} />
      <Box s={[0.9, 0.28, 0.02]} p={[-0.15, 1.05, -0.55]} m={m.chip} shadow={false} />
      <Box s={[0.04, 0.1, 0.24]} p={[1.25, 0.66, 0.38]} m={m.lamp} shadow={false} />
      <Box s={[0.04, 0.1, 0.24]} p={[1.25, 0.66, -0.38]} m={m.lamp} shadow={false} />
      <Box s={[0.04, 0.09, 0.28]} p={[-1.25, 0.68, 0.38]} m={m.tail} shadow={false} />
      <Box s={[0.04, 0.09, 0.28]} p={[-1.25, 0.68, -0.38]} m={m.tail} shadow={false} />
      {[[0.75, 0.6], [0.75, -0.6], [-0.75, 0.6], [-0.75, -0.6]].map(([x, z], i) => (
        <group key={i} position={[x, 0.32, z]} ref={(g) => { wheels.current[i] = g; }}>
          <Cyl r={0.32} h={0.24} rot={[Math.PI / 2, 0, 0]} m={m.dark} seg={20} />
          <Cyl r={0.17} h={0.25} rot={[Math.PI / 2, 0, 0]} m={m.metal} seg={6} />
        </group>
      ))}
    </group>
  );
}
