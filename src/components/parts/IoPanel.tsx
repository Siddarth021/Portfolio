'use client';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Box, Cyl, useMats } from './kit';

function UsbA({ x, y }: { x: number; y: number }) {
  const m = useMats();
  return (
    <group position={[x, y, 0.06]}>
      <Box s={[0.42, 0.17, 0.06]} m={m.metal} />
      <Box s={[0.36, 0.12, 0.065]} m={m.dark} shadow={false} />
      <Box s={[0.3, 0.04, 0.07]} p={[0, 0.02, 0]} m={m.accent} shadow={false} />
    </group>
  );
}

/** Contact: a rear I/O panel with USB, USB-C, HDMI, Ethernet (cable plugged in) and audio jacks. */
export default function IoPanel() {
  const m = useMats();
  const cable = useMemo(
    () =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0.75, 1.12, 0.55),
          new THREE.Vector3(0.8, 1.05, 1.2),
          new THREE.Vector3(1.2, 0.4, 1.7),
          new THREE.Vector3(2.0, 0.06, 1.9),
          new THREE.Vector3(2.9, 0.06, 1.5),
        ]),
        48, 0.07, 10, false,
      ),
    [],
  );
  return (
    <group position={[-0.2, 0, -0.4]}>
      <Box s={[3.9, 0.16, 0.7]} p={[0, 0.08, 0]} m={m.pcb} />
      <Box s={[3.7, 1.7, 0.08]} p={[0, 1.0, 0]} m={m.metal} />
      {[[-1.7, 1.75], [1.7, 1.75], [-1.7, 0.25], [1.7, 0.25]].map(([x, y]) => (
        <Cyl key={`${x}${y}`} r={0.06} h={0.04} p={[x, y, 0.05]} rot={[Math.PI / 2, 0, 0]} m={m.chip} seg={12} />
      ))}
      <UsbA x={-1.25} y={1.4} />
      <UsbA x={-1.25} y={1.1} />
      <UsbA x={-1.25} y={0.8} />
      {/* USB-C */}
      {[1.4, 1.1].map((y) => (
        <group key={y} position={[-0.6, y, 0.06]}>
          <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]} material={m.metal} castShadow>
            <capsuleGeometry args={[0.055, 0.2, 4, 12]} />
          </mesh>
          <Box s={[0.16, 0.025, 0.07]} m={m.dark} shadow={false} />
        </group>
      ))}
      {/* HDMI + DisplayPort */}
      <Box s={[0.48, 0.15, 0.06]} p={[-0.05, 1.4, 0.06]} m={m.metal} />
      <Box s={[0.42, 0.09, 0.065]} p={[-0.05, 1.41, 0.06]} m={m.dark} shadow={false} />
      <Box s={[0.42, 0.15, 0.06]} p={[-0.05, 1.08, 0.06]} m={m.metal} />
      <Box s={[0.36, 0.09, 0.065]} p={[-0.05, 1.09, 0.06]} m={m.dark} shadow={false} />
      {/* Ethernet with cable */}
      <Box s={[0.44, 0.4, 0.12]} p={[0.75, 1.15, 0.07]} m={m.chip} />
      <Box s={[0.08, 0.05, 0.01]} p={[0.6, 1.39, 0.135]} m={m.ledGreen} shadow={false} />
      <Box s={[0.08, 0.05, 0.01]} p={[0.9, 1.39, 0.135]} m={m.ledAmber} shadow={false} />
      <Box s={[0.32, 0.26, 0.32]} p={[0.75, 1.12, 0.3]} m={m.accent2} />
      <Box s={[0.14, 0.04, 0.22]} p={[0.75, 1.27, 0.26]} m={m.accent2} />
      <mesh geometry={cable} material={m.accent2} castShadow receiveShadow />
      {/* audio jacks */}
      {([[1.45, 1.45, m.accent], [1.45, 1.15, m.accent2], [1.45, 0.85, m.white]] as const).map(([x, y, mat]) => (
        <group key={y} position={[x, y, 0.07]} rotation={[Math.PI / 2, 0, 0]}>
          <Cyl r={0.1} h={0.07} m={mat} seg={20} />
          <Cyl r={0.04} h={0.075} m={m.dark} seg={12} />
        </group>
      ))}
    </group>
  );
}
