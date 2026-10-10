'use client';
import { Box, Cyl, Many, range, useMats, type V3 } from './kit';

/** About me: a compact motherboard with socket, RAM slots, VRM, PCIe slots and I/O shroud. */
export default function Motherboard() {
  const m = useMats();
  const holes: V3[] = [[-1.85, 0, -1.5], [1.85, 0, -1.5], [-1.85, 0, 1.5], [1.85, 0, 1.5], [0.4, 0, -1.5], [0.4, 0, 1.5]];
  const vrmFins: V3[] = range(9, -0.95, 0.15).map((x) => [x, 0.47, -1.25]);
  const caps: V3[] = range(5, -1.0, -0.2).map((z) => [0.3, 0.23, z]);
  return (
    <group>
      <Box s={[4.1, 0.12, 3.4]} p={[0, 0.06, 0]} m={m.pcb} />
      {holes.map((h, i) => (
        <Cyl key={i} r={0.09} h={0.13} p={[h[0], 0.07, h[2]]} m={m.metal} seg={16} />
      ))}
      {/* CPU socket with chip */}
      <Box s={[1.05, 0.12, 1.05]} p={[-0.4, 0.18, -0.45]} m={m.plastic} />
      <Box s={[0.72, 0.08, 0.72]} p={[-0.4, 0.28, -0.45]} m={m.metal} />
      {/* VRM heatsinks */}
      <Box s={[1.3, 0.28, 0.32]} p={[-0.4, 0.26, -1.25]} m={m.metal} />
      <Many s={[0.05, 0.12, 0.32]} at={vrmFins} m={m.metal} />
      <Box s={[0.32, 0.28, 1.1]} p={[-1.3, 0.26, -0.45]} m={m.metal} />
      {/* I/O shroud */}
      <Box s={[0.46, 0.55, 1.3]} p={[-1.78, 0.39, -0.95]} m={m.plastic} />
      <Box s={[0.47, 0.06, 1.31]} p={[-1.78, 0.55, -0.95]} m={m.accent2} />
      {/* RAM slots */}
      {[0.55, 0.72, 0.89, 1.06].map((x, i) => (
        <group key={x}>
          <Box s={[0.09, 0.16, 2.0]} p={[x, 0.2, -0.3]} m={i % 2 ? m.accent : m.plastic} />
          <Box s={[0.11, 0.2, 0.08]} p={[x, 0.22, 0.72]} m={m.white} />
        </group>
      ))}
      {/* capacitors */}
      {caps.map((c, i) => (
        <group key={i}>
          <Cyl r={0.075} h={0.22} p={c} m={m.chip} seg={14} />
          <Cyl r={0.076} h={0.01} p={[c[0], 0.345, c[2]]} m={m.metal} seg={14} />
        </group>
      ))}
      {/* PCIe slots */}
      <Box s={[2.7, 0.14, 0.13]} p={[-0.35, 0.19, 0.7]} m={m.plastic} />
      <Box s={[0.8, 0.14, 0.13]} p={[-1.3, 0.19, 1.0]} m={m.plastic} />
      <Box s={[2.7, 0.14, 0.13]} p={[-0.35, 0.19, 1.3]} m={m.plastic} />
      {/* chipset heatsink */}
      <Box s={[0.8, 0.1, 0.8]} p={[1.2, 0.17, 1.15]} m={m.metal} />
      <Box s={[0.56, 0.02, 0.56]} p={[1.2, 0.23, 1.15]} m={m.accent} />
      {/* 24-pin power + CMOS battery */}
      <Box s={[0.18, 0.24, 0.95]} p={[1.85, 0.24, -0.4]} m={m.plastic} />
      <Cyl r={0.17} h={0.05} p={[1.35, 0.15, 0.35]} m={m.metal} />
      {/* M.2 heatsink */}
      <Box s={[1.4, 0.06, 0.32]} p={[0.25, 0.15, 1.0]} m={m.metal} />
    </group>
  );
}
