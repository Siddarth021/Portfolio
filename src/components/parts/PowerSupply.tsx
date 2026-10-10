'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { Box, Cyl, Many, range, useMats, type V3 } from './kit';

/** Achievements: a power supply with fan grille, honeycomb vent and modular sockets. */
export default function PowerSupply({ active = false }: { active?: boolean }) {
  const m = useMats();
  const rotor = useRef<Group>(null);
  useFrame((_, dt) => { if (rotor.current) rotor.current.rotation.y -= dt * (active ? 7 : 2); });
  const { vents, sockets } = useMemo(() => {
    const vents: V3[] = [];
    range(5, 0.35, 1.25).forEach((y, r) => range(7, -0.75, 0.75).forEach((z) => vents.push([-1.63, y, z + (r % 2 ? 0.06 : -0.06)])));
    const sockets: V3[] = range(3, 0.4, 1.15).flatMap((y) => [[1.63, y, -0.35], [1.63, y, 0.35]] as V3[]);
    return { vents, sockets };
  }, []);
  return (
    <group>
      <Box s={[3.2, 1.5, 1.9]} p={[0, 0.75, 0]} m={m.metal} />
      {/* fan + grille */}
      <Cyl r={0.78} h={0.02} p={[0, 1.505, 0]} m={m.dark} seg={40} />
      <group ref={rotor} position={[0, 1.52, 0]}>
        {range(7, 0, Math.PI * 2 * (6 / 7)).map((a) => (
          <group key={a} rotation={[0, a, 0]}>
            <Box s={[0.5, 0.012, 0.18]} p={[0.4, 0, 0]} r={[0.4, 0, 0]} m={m.plastic} />
          </group>
        ))}
      </group>
      {[0.78, 0.55, 0.32].map((r) => (
        <mesh key={r} position={[0, 1.56, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.metal} castShadow>
          <torusGeometry args={[r, 0.025, 8, 48]} />
        </mesh>
      ))}
      <Box s={[1.56, 0.03, 0.05]} p={[0, 1.56, 0]} m={m.metal} />
      <Box s={[0.05, 0.03, 1.56]} p={[0, 1.56, 0]} m={m.metal} />
      <Cyl r={0.15} h={0.05} p={[0, 1.57, 0]} m={m.accent2} />
      {/* sticker */}
      <Box s={[1.3, 0.62, 0.01]} p={[0.55, 0.78, 0.955]} m={m.white} shadow={false} />
      <Box s={[1.3, 0.12, 0.012]} p={[0.55, 1.02, 0.957]} m={m.accent} shadow={false} />
      <Box s={[0.7, 0.05, 0.012]} p={[0.35, 0.75, 0.957]} m={m.chip} shadow={false} />
      <Box s={[0.5, 0.05, 0.012]} p={[0.25, 0.62, 0.957]} m={m.chip} shadow={false} />
      {/* back: honeycomb vent, switch, socket */}
      <Many s={[0.012, 0.11, 0.11]} at={vents} m={m.dark} />
      <Box s={[0.04, 0.18, 0.11]} p={[-1.62, 1.18, 0.62]} m={m.accent2} />
      <Box s={[0.05, 0.3, 0.42]} p={[-1.62, 1.18, 0.15]} m={m.plastic} />
      {/* front: modular sockets */}
      <Many s={[0.03, 0.18, 0.5]} at={sockets} m={m.plastic} />
    </group>
  );
}
