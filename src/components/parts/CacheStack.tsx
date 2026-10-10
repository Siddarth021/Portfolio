'use client';
import { useMemo } from 'react';
import { Box, Many, range, useMats, type V3 } from './kit';

/** Experience: three stacked cache dies (L3, L2, L1) joined by through-silicon pillars. */
export default function CacheStack() {
  const m = useMats();
  const layers = [
    { w: 2.5, h: 0.18, y: 0.24, mat: m.chip },
    { w: 1.85, h: 0.16, y: 0.6, mat: m.accent },
    { w: 1.2, h: 0.14, y: 0.94, mat: m.accent2 },
  ];
  const { tsv1, tsv2, cells, caps } = useMemo(() => {
    const grid = (n: number, s: number, y: number) =>
      range(n, -s, s).flatMap((x) => range(n, -s, s).map((z) => [x, y, z] as V3));
    const cells: V3[] = [
      ...range(10, -1.1, 1.1).flatMap((x) => [[x, 0.335, 1.1], [x, 0.335, -1.1]] as V3[]),
      ...range(8, -0.85, 0.85).flatMap((z) => [[1.1, 0.335, z], [-1.1, 0.335, z]] as V3[]),
    ];
    const caps: V3[] = range(9, -1.3, 1.3).flatMap((x) => [[x, 0.17, 1.42], [x, 0.17, -1.42]] as V3[]);
    return { tsv1: grid(4, 0.75, 0.42), tsv2: grid(3, 0.5, 0.77), cells, caps };
  }, []);
  return (
    <group>
      <Box s={[3.1, 0.14, 3.1]} p={[0, 0.07, 0]} m={m.pcb} />
      <Many s={[0.1, 0.05, 0.06]} at={caps} m={m.gold} />
      {layers.map((l, i) => (
        <group key={i}>
          <Box s={[l.w + 0.06, 0.02, l.w + 0.06]} p={[0, l.y - l.h / 2 - 0.01, 0]} m={m.gold} />
          <Box s={[l.w, l.h, l.w]} p={[0, l.y, 0]} m={l.mat} />
        </group>
      ))}
      <Many s={[0.08, 0.02, 0.08]} at={cells} m={m.white} />
      <Many s={[0.06, 0.2, 0.06]} at={tsv1} m={m.metal} />
      <Many s={[0.06, 0.2, 0.06]} at={tsv2} m={m.metal} />
    </group>
  );
}
