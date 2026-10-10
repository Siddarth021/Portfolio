'use client';
import { useMemo } from 'react';
import { Box, Many, range, useMats, type V3 } from './kit';

/** Skills: an open CPU die. One core per skill group, with a shared cache strip. */
export default function Cores({ count = 4 }: { count?: number }) {
  const m = useMats();
  const { cores, cells, pads, size } = useMemo(() => {
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const area = 2.2, gap = 0.28;
    const size = Math.min((area - gap * (cols - 1)) / cols, (area - gap * (rows - 1)) / rows);
    const cores: V3[] = [];
    for (let i = 0; i < count; i++) {
      const c = i % cols, r = Math.floor(i / cols);
      cores.push([(c - (cols - 1) / 2) * (size + gap), 0.29, (r - (rows - 1) / 2) * (size + gap)]);
    }
    const cells: V3[] = [];
    cores.forEach(([x, , z]) =>
      range(3, -size / 3.2, size / 3.2).forEach((dx) =>
        range(3, -size / 3.2, size / 3.2).forEach((dz) => cells.push([x + dx, 0.33, z + dz])),
      ),
    );
    const pads: V3[] = [
      ...range(12, -1.25, 1.25).map((x) => [x, 0.27, 1.38] as V3),
      ...range(12, -1.25, 1.25).map((x) => [x, 0.27, -1.38] as V3),
    ];
    return { cores, cells, pads, size };
  }, [count]);

  return (
    <group>
      <Box s={[3.3, 0.16, 3.3]} p={[0, 0.08, 0]} m={m.pcb} />
      <Box s={[2.9, 0.1, 2.9]} p={[0, 0.21, 0]} m={m.chip} />
      <Many s={[0.1, 0.02, 0.1]} at={pads} m={m.gold} />
      {/* shared cache strip */}
      <Box s={[2.5, 0.04, 0.16]} p={[0, 0.28, 0]} m={m.accent2} />
      <Box s={[0.16, 0.04, 2.5]} p={[0, 0.28, 0]} m={m.accent2} />
      {cores.map((c, i) => (
        <Box key={i} s={[size, 0.06, size]} p={c} m={m.accent} />
      ))}
      <Many s={[size / 4.2, 0.03, size / 4.2]} at={cells} m={m.white} />
    </group>
  );
}
