'use client';
import { useMemo } from 'react';
import { Box, Cyl, Many, range, useMats, type V3 } from './kit';

/** Education: an M.2 NVMe SSD screwed into a board slice. */
export default function M2Ssd() {
  const m = useMats();
  const fingers = useMemo<V3[]>(
    () => range(22, -0.44, 0.44).filter((z) => Math.abs(z - 0.18) > 0.05).map((z) => [-1.74, 0.365, z]),
    [],
  );
  return (
    <group>
      {/* board slice + socket + standoff */}
      <Box s={[4.3, 0.12, 1.9]} p={[0, 0.06, 0]} m={m.pcb} />
      <Box s={[0.32, 0.24, 1.25]} p={[-1.95, 0.24, 0]} m={m.plastic} />
      <Cyl r={0.11} h={0.22} p={[1.85, 0.23, 0]} m={m.metal} seg={16} />
      {/* SSD */}
      <group position={[0.05, 0, 0]}>
        <Box s={[3.6, 0.05, 1.0]} p={[0, 0.33, 0]} m={m.plastic} />
        <Many s={[0.12, 0.012, 0.03]} at={fingers} m={m.gold} />
        {/* controller, DRAM, NAND */}
        <Box s={[0.62, 0.06, 0.62]} p={[-1.05, 0.385, 0]} m={m.chip} />
        <Box s={[0.42, 0.01, 0.42]} p={[-1.05, 0.42, 0]} m={m.metal} />
        <Box s={[0.32, 0.05, 0.46]} p={[-0.45, 0.38, 0]} m={m.chip} />
        <Box s={[0.72, 0.07, 0.7]} p={[0.25, 0.39, 0]} m={m.chip} />
        <Box s={[0.72, 0.07, 0.7]} p={[1.08, 0.39, 0]} m={m.chip} />
        {/* label */}
        <Box s={[1.75, 0.01, 0.8]} p={[0.66, 0.431, 0]} m={m.white} shadow={false} />
        <Box s={[1.75, 0.012, 0.13]} p={[0.66, 0.433, 0.24]} m={m.accent} shadow={false} />
        <Box s={[0.6, 0.012, 0.06]} p={[0.2, 0.433, -0.15]} m={m.chip} shadow={false} />
        {/* screw */}
        <Cyl r={0.13} h={0.06} p={[1.8, 0.37, 0]} m={m.metal} seg={18} />
        <Box s={[0.16, 0.02, 0.03]} p={[1.8, 0.405, 0]} m={m.chip} shadow={false} />
      </group>
    </group>
  );
}
