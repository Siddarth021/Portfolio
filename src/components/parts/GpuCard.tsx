'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { Box, Cyl, Many, range, useMats, type V3 } from './kit';

function Fan({ x, speed }: { x: number; speed: number }) {
  const m = useMats();
  const rotor = useRef<Group>(null);
  useFrame((_, dt) => { if (rotor.current) rotor.current.rotation.y -= dt * speed; });
  const blades = range(9, 0, Math.PI * 2 * (8 / 9));
  return (
    <group position={[x, 0.56, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={m.plastic} castShadow receiveShadow>
        <torusGeometry args={[0.58, 0.06, 10, 40]} />
      </mesh>
      <Cyl r={0.56} h={0.02} p={[0, -0.03, 0]} m={m.dark} seg={36} />
      <group ref={rotor}>
        {blades.map((a) => (
          <group key={a} rotation={[0, a, 0]}>
            <Box s={[0.38, 0.015, 0.15]} p={[0.32, 0, 0]} r={[0.45, 0, 0]} m={m.plastic} />
          </group>
        ))}
        <Cyl r={0.17} h={0.06} p={[0, 0.01, 0]} m={m.plastic} />
        <Cyl r={0.11} h={0.065} p={[0, 0.015, 0]} m={m.accent2} />
      </group>
    </group>
  );
}

/** Creative: a graphics card with three spinning fans, fin stack and I/O bracket. */
export default function GpuCard({ active = false }: { active?: boolean }) {
  const m = useMats();
  const { fins, fingers } = useMemo(() => ({
    fins: range(30, -1.75, 1.75).map((x) => [x, 0.36, 0.05] as V3),
    fingers: range(26, -0.95, 0.95).map((x) => [x, 0.2, 0.82] as V3),
  }), []);
  const speed = active ? 9 : 3;
  return (
    <group position={[0.1, 0, 0]}>
      <Box s={[3.9, 0.03, 1.5]} p={[0, 0.15, 0]} m={m.metal} />
      <Box s={[3.9, 0.08, 1.5]} p={[0, 0.2, 0]} m={m.pcb} />
      <Many s={[0.04, 0.22, 1.3]} at={fins} m={m.metal} />
      <Many s={[0.05, 0.07, 0.12]} at={fingers} m={m.gold} />
      {/* shroud */}
      <Box s={[3.95, 0.08, 1.55]} p={[0, 0.5, 0]} m={m.accent} />
      <Box s={[3.95, 0.05, 0.14]} p={[0, 0.555, -0.72]} m={m.accent2} />
      {[-1.28, 0, 1.28].map((x) => <Fan key={x} x={x} speed={speed} />)}
      {/* I/O bracket */}
      <Box s={[0.05, 0.72, 1.62]} p={[-2.0, 0.4, 0]} m={m.metal} />
      {range(4, -0.55, 0.55).map((z) => (
        <Box key={z} s={[0.04, 0.13, 0.26]} p={[-2.03, 0.33, z]} m={m.dark} />
      ))}
      {range(5, -0.6, 0.6).map((z) => (
        <Box key={z} s={[0.04, 0.03, 0.18]} p={[-2.03, 0.62, z]} m={m.dark} shadow={false} />
      ))}
      {/* power connector */}
      <Box s={[0.4, 0.18, 0.22]} p={[1.45, 0.63, -0.55]} m={m.plastic} />
    </group>
  );
}
