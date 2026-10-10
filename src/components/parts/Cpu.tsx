'use client';
import { Box, Cyl, Many, range, useMats, type V3 } from './kit';

/** Intro: a CPU sitting in its socket, with load plate and lever. */
export default function Cpu() {
  const m = useMats();
  const caps: V3[] = [
    ...range(6, -0.9, 0.9).map((x) => [x, 0.47, 1.15] as V3),
    ...range(6, -0.9, 0.9).map((x) => [x, 0.47, -1.15] as V3),
    ...range(6, -0.9, 0.9).map((z) => [1.15, 0.47, z] as V3),
  ];
  return (
    <group>
      {/* socket */}
      <Box s={[3.3, 0.3, 3.3]} p={[0, 0.15, 0]} m={m.plastic} />
      <Box s={[2.7, 0.02, 2.7]} p={[0, 0.31, 0]} m={m.dark} />
      {/* load plate frame */}
      <Box s={[3.4, 0.06, 0.26]} p={[0, 0.33, 1.6]} m={m.metal} />
      <Box s={[3.4, 0.06, 0.26]} p={[0, 0.33, -1.6]} m={m.metal} />
      <Box s={[0.26, 0.06, 3.4]} p={[-1.6, 0.33, 0]} m={m.metal} />
      <Box s={[0.26, 0.06, 3.4]} p={[1.6, 0.33, 0]} m={m.metal} />
      {/* lever */}
      <Cyl r={0.05} h={3.2} p={[1.95, 0.32, 0]} rot={[Math.PI / 2, 0, 0]} m={m.metal} seg={12} />
      <Box s={[0.5, 0.07, 0.09]} p={[2.15, 0.32, 1.6]} m={m.metal} />
      {/* substrate + small capacitors */}
      <Box s={[2.5, 0.12, 2.5]} p={[0, 0.39, 0]} m={m.pcb} />
      <Many s={[0.1, 0.05, 0.06]} at={caps} m={m.gold} />
      {/* heat spreader */}
      <Box s={[1.95, 0.16, 1.95]} p={[0, 0.53, 0]} m={m.metal} />
      <Box s={[1.75, 0.05, 1.75]} p={[0, 0.635, 0]} m={m.metal} />
      {/* engraved model lines */}
      <Box s={[1.1, 0.006, 0.07]} p={[-0.15, 0.663, -0.35]} m={m.chip} shadow={false} />
      <Box s={[0.8, 0.006, 0.05]} p={[-0.3, 0.663, -0.15]} m={m.chip} shadow={false} />
      <Box s={[0.5, 0.006, 0.05]} p={[-0.45, 0.663, 0.02]} m={m.chip} shadow={false} />
      {/* pin-1 marker */}
      <Cyl r={0.13} h={0.02} p={[-1.05, 0.46, 1.05]} m={m.gold} seg={3} />
    </group>
  );
}
