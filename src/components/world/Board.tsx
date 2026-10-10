'use client';
import { RoundedBox } from '@react-three/drei';
import { Box, Cyl, useMats } from '../parts/kit';

const W = 118, D = 68, Z = 0;

/** The circuit board the whole world sits on. */
export default function Board() {
  const m = useMats();
  const corners: [number, number][] = [[-W / 2 + 3, -D / 2 + 3], [W / 2 - 3, -D / 2 + 3], [-W / 2 + 3, D / 2 - 3], [W / 2 - 3, D / 2 - 3]];
  return (
    <group position={[0, 0, Z]}>
      <RoundedBox args={[W, 2.4, D]} radius={1} smoothness={4} position={[0, -1.2, 0]} material={m.ground} receiveShadow />
      {/* silkscreen outline */}
      <Box s={[W - 8, 0.02, 0.25]} p={[0, 0.01, -D / 2 + 5.5]} m={m.groundEdge} shadow={false} />
      <Box s={[W - 8, 0.02, 0.25]} p={[0, 0.01, D / 2 - 5.5]} m={m.groundEdge} shadow={false} />
      <Box s={[0.25, 0.02, D - 11]} p={[-W / 2 + 4, 0.01, 0]} m={m.groundEdge} shadow={false} />
      <Box s={[0.25, 0.02, D - 11]} p={[W / 2 - 4, 0.01, 0]} m={m.groundEdge} shadow={false} />
      {/* mounting holes */}
      {corners.map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, 0, z]}>
          <Cyl r={1.1} h={0.06} p={[0, 0.02, 0]} m={m.gold} seg={32} />
          <Cyl r={0.6} h={0.08} p={[0, 0.03, 0]} m={m.dark} seg={32} />
        </group>
      ))}
    </group>
  );
}
