'use client';
import { useMemo } from 'react';
import { Box, Many, range, useMats, type V3 } from './kit';

/** Research: an AI accelerator package, a big compute die surrounded by stacked HBM memory. */
export default function AiChip() {
  const m = useMats();
  const { hbmDark, hbmLight, caps } = useMemo(() => {
    const stacks: [number, number][] = [];
    [-1.0, 1.0].forEach((x) => range(3, -0.62, 0.62).forEach((z) => stacks.push([x, z])));
    const hbmDark: V3[] = [], hbmLight: V3[] = [];
    stacks.forEach(([x, z]) =>
      range(5, 0.23, 0.47).forEach((y, k) => (k % 2 ? hbmLight : hbmDark).push([x, y, z])),
    );
    const caps: V3[] = [
      ...range(14, -1.45, 1.45).flatMap((x) => [[x, 0.17, 1.52], [x, 0.17, -1.52]] as V3[]),
      ...range(12, -1.25, 1.25).flatMap((z) => [[1.52, 0.17, z], [-1.52, 0.17, z]] as V3[]),
    ];
    return { hbmDark, hbmLight, caps };
  }, []);
  return (
    <group>
      <Box s={[3.5, 0.14, 3.5]} p={[0, 0.07, 0]} m={m.pcb} />
      {/* stiffener ring */}
      <Box s={[3.5, 0.1, 0.12]} p={[0, 0.19, 1.69]} m={m.metal} />
      <Box s={[3.5, 0.1, 0.12]} p={[0, 0.19, -1.69]} m={m.metal} />
      <Box s={[0.12, 0.1, 3.5]} p={[1.69, 0.19, 0]} m={m.metal} />
      <Box s={[0.12, 0.1, 3.5]} p={[-1.69, 0.19, 0]} m={m.metal} />
      <Many s={[0.08, 0.05, 0.05]} at={caps} m={m.gold} />
      {/* interposer + compute die */}
      <Box s={[2.7, 0.06, 2.05]} p={[0, 0.17, 0]} m={m.metal} />
      <Box s={[1.25, 0.16, 1.55]} p={[0, 0.28, 0]} m={m.chip} />
      <Box s={[1.05, 0.01, 1.35]} p={[0, 0.365, 0]} m={m.accent} shadow={false} />
      {range(4, -0.45, 0.45).map((z) => (
        <Box key={z} s={[0.9, 0.012, 0.05]} p={[0, 0.372, z]} m={m.accent2} shadow={false} />
      ))}
      {/* HBM stacks */}
      <Many s={[0.42, 0.05, 0.42]} at={hbmDark} m={m.chip} />
      <Many s={[0.42, 0.05, 0.42]} at={hbmLight} m={m.metal} />
    </group>
  );
}
