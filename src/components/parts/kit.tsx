'use client';
/*
 * Building blocks shared by every computer-part model:
 * matte materials from the palette, plus Box / Cyl / Many helpers.
 */
import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Palette } from '@/theme/palettes';

export type V3 = [number, number, number];

const matte = (color: string, roughness = 0.82, metalness = 0.04) =>
  new THREE.MeshStandardMaterial({ color, roughness, metalness });

export function createMaterials(p: Palette) {
  return {
    pcb: matte(p.pcb, 0.8),
    chip: matte(p.chip, 0.68, 0.08),
    gold: matte(p.gold, 0.42, 0.65),
    metal: matte(p.metal, 0.5, 0.55),
    plastic: matte(p.plastic, 0.78),
    accent: matte(p.accent, 0.78),
    accent2: matte(p.accent2, 0.75),
    white: matte('#F7F7F4', 0.85),
    dark: matte('#1E2226', 0.7),
    pad: matte(p.pad, 0.92),
    ground: matte(p.ground, 0.95),
    road: matte(p.road, 0.95),
    roadEdge: matte(p.roadEdge, 0.95),
    groundEdge: matte(p.groundEdge, 0.95),
    car: matte(p.car, 0.6, 0.1),
    screen: new THREE.MeshStandardMaterial({ color: p.accent, emissive: p.accent, emissiveIntensity: 0.25, roughness: 0.5 }),
    ledGreen: new THREE.MeshBasicMaterial({ color: '#7BE08F' }),
    ledAmber: new THREE.MeshBasicMaterial({ color: '#F6C35B' }),
    lamp: new THREE.MeshBasicMaterial({ color: '#FFF6DE' }),
    tail: new THREE.MeshBasicMaterial({ color: '#E66A5C' }),
  };
}
export type Mats = ReturnType<typeof createMaterials>;

const MatsContext = createContext<Mats | null>(null);

export function MaterialsProvider({ palette, children }: { palette: Palette; children: React.ReactNode }) {
  const mats = useMemo(() => createMaterials(palette), [palette]);
  useEffect(() => () => Object.values(mats).forEach((m) => m.dispose()), [mats]);
  return <MatsContext.Provider value={mats}>{children}</MatsContext.Provider>;
}

export function useMats(): Mats {
  const m = useContext(MatsContext);
  if (!m) throw new Error('useMats must be used inside <MaterialsProvider>');
  return m;
}

/* ---------- primitives ---------- */

interface BoxProps { s: V3; p?: V3; r?: V3; m: THREE.Material; shadow?: boolean }
export function Box({ s, p = [0, 0, 0], r, m, shadow = true }: BoxProps) {
  return (
    <mesh position={p} rotation={r} material={m} castShadow={shadow} receiveShadow>
      <boxGeometry args={s} />
    </mesh>
  );
}

interface CylProps { r: number; r2?: number; h: number; p?: V3; rot?: V3; m: THREE.Material; seg?: number }
export function Cyl({ r, r2, h, p = [0, 0, 0], rot, m, seg = 28 }: CylProps) {
  return (
    <mesh position={p} rotation={rot} material={m} castShadow receiveShadow>
      <cylinderGeometry args={[r, r2 ?? r, h, seg]} />
    </mesh>
  );
}

/** Many identical boxes in one draw call (chips, pins, fins, contacts). */
export function Many({ s, at, m, rot }: { s: V3; at: V3[]; m: THREE.Material; rot?: V3 }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => new THREE.BoxGeometry(...s), [s[0], s[1], s[2]]); // eslint-disable-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    at.forEach((pos, i) => {
      o.position.set(...pos);
      if (rot) o.rotation.set(...rot);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [at, rot]);
  useEffect(() => () => geo.dispose(), [geo]);
  return <instancedMesh ref={ref} args={[geo, m, at.length]} castShadow receiveShadow />;
}

/** evenly spaced numbers from a to b */
export const range = (n: number, a: number, b: number) =>
  Array.from({ length: n }, (_, i) => (n === 1 ? (a + b) / 2 : a + ((b - a) * i) / (n - 1)));
