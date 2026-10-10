'use client';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Cyl, useMats, type V3 } from '../parts/kit';
import { curve, placeStop, ROAD_HALF, PAD_RADIUS, STOP_OFFSET } from './track';

function ribbon(half: number, y: number, segments = 400) {
  const pos: number[] = [], nrm: number[] = [], idx: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments, p = curve.getPointAt(t), g = curve.getTangentAt(t);
    const sx = -g.z * half, sz = g.x * half;
    pos.push(p.x - sx, y, p.z - sz, p.x + sx, y, p.z + sz);
    nrm.push(0, 1, 0, 0, 1, 0);
    if (i < segments) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  geo.setIndex(idx);
  return geo;
}

/** Road, centre dashes and a PCB trace from the road to every stop. */
export default function Road({ stopCount }: { stopCount: number }) {
  const m = useMats();
  const { shoulder, asphalt, dashes, dashRots } = useMemo(() => {
    const len = curve.getLength();
    const n = Math.floor(len / 2.6);
    const dashes: { p: V3; r: number }[] = [];
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n, p = curve.getPointAt(t), g = curve.getTangentAt(t);
      dashes.push({ p: [p.x, 0.075, p.z], r: Math.atan2(-g.z, g.x) });
    }
    return { shoulder: ribbon(ROAD_HALF + 0.3, 0.03), asphalt: ribbon(ROAD_HALF, 0.05), dashes, dashRots: dashes.map((d) => d.r) };
  }, []);

  const traces = useMemo(() => Array.from({ length: stopCount }, (_, i) => {
    const { road, side } = placeStop(i, stopCount);
    const start = ROAD_HALF + 0.3, end = STOP_OFFSET - PAD_RADIUS + 0.2;
    const mid = road.clone().addScaledVector(side, (start + end) / 2);
    const via = road.clone().addScaledVector(side, start + 0.5);
    return { mid, via, len: end - start, yaw: Math.atan2(-side.z, side.x) };
  }), [stopCount]);

  return (
    <group>
      <mesh geometry={shoulder} material={m.roadEdge} receiveShadow />
      <mesh geometry={asphalt} material={m.road} receiveShadow />
      {dashes.map((d, i) => (
        <mesh key={i} position={d.p} rotation={[0, dashRots[i], 0]} material={m.roadEdge} receiveShadow>
          <boxGeometry args={[1.2, 0.02, 0.18]} />
        </mesh>
      ))}
      {traces.map((tr, i) => (
        <group key={i}>
          <mesh position={[tr.mid.x, 0.02, tr.mid.z]} rotation={[0, tr.yaw, 0]} material={m.groundEdge} receiveShadow>
            <boxGeometry args={[tr.len, 0.03, 0.55]} />
          </mesh>
          <Cyl r={0.42} h={0.05} p={[tr.via.x, 0.03, tr.via.z]} m={m.gold} seg={24} />
        </group>
      ))}
    </group>
  );
}
