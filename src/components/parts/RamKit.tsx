'use client';
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Group } from 'three';
import { Box, Many, range, useMats, type V3 } from './kit';

const PITCH = 0.48;

/** Projects: one RAM stick per project, each clipped into its own DIMM slot. */
export default function RamKit({ count = 6, active = false }: { count?: number; active?: boolean }) {
  const m = useMats();
  const n = Math.max(1, count);
  const zs = useMemo(() => range(n, -((n - 1) * PITCH) / 2, ((n - 1) * PITCH) / 2), [n]);

  const { chips, fingers } = useMemo(() => {
    const chips: V3[] = [], fingers: V3[] = [];
    const chipX = range(8, -1.45, 1.45);
    const fingerX = range(40, -1.7, 1.7).filter((x) => Math.abs(x - 0.25) > 0.07); // key notch
    zs.forEach((z) => {
      chipX.forEach((x) => { chips.push([x, 0.92, z + 0.045]); chips.push([x, 0.92, z - 0.045]); });
      fingerX.forEach((x) => { fingers.push([x, 0.47, z + 0.03]); fingers.push([x, 0.47, z - 0.03]); });
    });
    return { chips, fingers };
  }, [zs]);

  // sticks gently rise one after another while this stop is open
  const sticks = useRef<(Group | null)[]>([]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    sticks.current.forEach((g, i) => {
      if (!g) return;
      const target = active ? Math.max(0, Math.sin(t * 1.6 - i * 0.55)) * 0.12 : 0;
      g.position.y += (target - g.position.y) * 0.1;
    });
  });

  return (
    <group>
      <Box s={[4.1, 0.12, n * PITCH + 0.7]} p={[0, 0.06, 0]} m={m.pcb} />
      {zs.map((z, i) => (
        <group key={z}>
          <Box s={[3.75, 0.28, 0.17]} p={[0, 0.26, z]} m={i % 2 ? m.accent : m.plastic} />
          <Box s={[0.13, 0.46, 0.2]} p={[-1.96, 0.35, z]} m={m.white} />
          <Box s={[0.13, 0.46, 0.2]} p={[1.96, 0.35, z]} m={m.white} />
          <group ref={(g) => { sticks.current[i] = g; }}>
            <Box s={[3.6, 0.86, 0.05]} p={[0, 0.84, z]} m={m.pcb} />
            <Box s={[1.5, 0.09, 0.012]} p={[-0.9, 1.2, z + 0.031]} m={m.white} shadow={false} />
          </group>
        </group>
      ))}
      <Many s={[0.32, 0.4, 0.03]} at={chips} m={m.chip} />
      <Many s={[0.055, 0.1, 0.012]} at={fingers} m={m.gold} />
    </group>
  );
}
