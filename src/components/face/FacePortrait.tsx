'use client';
import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import mesh from './faceMesh.json';

/**
 * Siddarth's head as flat cut planes, each coloured from his photo.
 * Geometry + colours come from scripts/face/build_face.py (face-mesh landmarks of a
 * front photo -> faceted head, every facet = mean colour of the photo pixels it covers).
 * `progress` (0..1) drives the facets flying into place, so the boot screen can
 * assemble the face while its lines load.
 */

// small deterministic hash -> [0,1)
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function Head({ progress, pointer }: { progress: number; pointer: React.MutableRefObject<[number, number]> }) {
  const group = useRef<THREE.Group>(null);
  const shown = useRef(0);

  // static data: target positions, per-triangle centroid, fly-in offsets, order
  const data = useMemo(() => {
    const pos = mesh.positions as number[];
    const tri = mesh.triangles as number[];
    const n = tri.length / 3;
    const target = new Float32Array(n * 9);
    const centroid = new Float32Array(n * 3);
    const offset = new Float32Array(n * 3);
    const order = new Float32Array(n);
    const nose = new THREE.Vector3(0, 0.05, 0.75);
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), cen = new THREE.Vector3();
    const dists: number[] = [];
    for (let i = 0; i < n; i++) {
      for (let k = 0; k < 3; k++) {
        const v = tri[i * 3 + k] * 3;
        target.set([pos[v], pos[v + 1], pos[v + 2]], i * 9 + k * 3);
      }
      a.fromArray(target, i * 9); b.fromArray(target, i * 9 + 3); c.fromArray(target, i * 9 + 6);
      cen.copy(a).add(b).add(c).divideScalar(3);
      centroid.set([cen.x, cen.y, cen.z], i * 3);
      // fly in from outside along the facet's own direction, with a little scatter
      const dir = cen.clone().setY(cen.y * 0.6).normalize();
      const r = 0.9 + hash(i) * 1.0;
      offset.set([dir.x * r + (hash(i + 7) - 0.5) * 0.5, dir.y * r * 0.8 + (hash(i + 13) - 0.5) * 0.5, dir.z * r + 0.9], i * 3);
      dists.push(cen.distanceTo(nose));
    }
    const maxD = Math.max(...dists);
    for (let i = 0; i < n; i++) order[i] = (dists[i] / maxD) * 0.75 + hash(i + 3) * 0.12;
    return { n, target, centroid, offset, order };
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(data.target.slice(), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(data.n * 9), 3));
    return g;
  }, [data]);

  // per-facet colours sampled from the photo, with a gentle baked shade per facet so
  // the cut sheets read while the true photo colour stays (photo already has its light)
  useEffect(() => {
    const attr = geometry.getAttribute('color') as THREE.BufferAttribute;
    const tmp = new THREE.Color();
    const hexes = mesh.colors as string[];
    const light = new THREE.Vector3(-0.45, 0.55, 0.7).normalize();
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
    const t = data.target;
    for (let i = 0; i < data.n; i++) {
      a.fromArray(t, i * 9); b.fromArray(t, i * 9 + 3); c.fromArray(t, i * 9 + 6);
      const nrm = b.sub(a).cross(c.sub(a)).normalize();
      const lit = Math.abs(nrm.dot(light));
      const shade = 0.84 + 0.26 * lit;
      tmp.set('#' + hexes[i]);
      tmp.offsetHSL(0, 0.04, 0);                       // a touch of life back into the matte colours
      tmp.multiplyScalar(shade);
      for (let k = 0; k < 3; k++) attr.setXYZ(i * 3 + k, tmp.r, tmp.g, tmp.b);
    }
    attr.needsUpdate = true;
  }, [geometry, data]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, dt) => {
    // smooth toward the boot progress
    const goal = progress;
    const prev = shown.current;
    shown.current = prev + (goal - prev) * Math.min(1, dt * 2.0);
    if (Math.abs(goal - shown.current) < 0.0005) shown.current = goal;
    const p = shown.current;

    if (p !== prev || p < 1) {
      const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr = attr.array as Float32Array;
      const { n, target, centroid, offset, order } = data;
      for (let i = 0; i < n; i++) {
        const local = Math.min(1, Math.max(0, (p * 1.45 - order[i]) / 0.55));
        const e = ease(local);
        const s = 0.25 + 0.75 * e; // facet grows as it lands
        const ox = offset[i * 3] * (1 - e), oy = offset[i * 3 + 1] * (1 - e), oz = offset[i * 3 + 2] * (1 - e);
        const cx = centroid[i * 3], cy = centroid[i * 3 + 1], cz = centroid[i * 3 + 2];
        for (let k = 0; k < 3; k++) {
          const j = i * 9 + k * 3;
          arr[j] = cx + (target[j] - cx) * s + ox;
          arr[j + 1] = cy + (target[j + 1] - cy) * s + oy;
          arr[j + 2] = cz + (target[j + 2] - cz) * s + oz;
        }
      }
      attr.needsUpdate = true;
    }

    // three-quarter pose, turning a little toward the cursor, gentle idle sway
    const g = group.current;
    if (g) {
      const t = state.clock.elapsedTime;
      const [px, py] = pointer.current;
      const yaw = -0.16 + px * 0.3 + Math.sin(t * 0.4) * 0.04;
      const pitch = -0.02 + py * 0.12 + Math.sin(t * 0.55) * 0.015;
      g.rotation.y += (yaw - g.rotation.y) * Math.min(1, dt * 2.5);
      g.rotation.x += (pitch - g.rotation.x) * Math.min(1, dt * 2.5);
      g.position.y = Math.sin(t * 0.8) * 0.015;
    }
  });

  return (
    <group ref={group} rotation={[-0.02, -0.16, 0]}>
      <mesh geometry={geometry}>
        <meshBasicMaterial vertexColors side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function FacePortrait({ progress }: { progress: number }) {
  const pointer = useRef<[number, number]>([0, 0]);
  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current = [(e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1];
    };
    addEventListener('pointermove', move);
    return () => removeEventListener('pointermove', move);
  }, []);

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 19, near: 0.1, far: 50, position: [0, -0.03, 7.9] }}
      flat
      gl={{ antialias: true, alpha: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <Head progress={progress} pointer={pointer} />
    </Canvas>
  );
}
