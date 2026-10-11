'use client';
/*
 * Skills stop: every skill is a ball floating over its CPU core.
 * Balls bob gently, rise out of the cores when the stop opens, and can be played with:
 * hover to lift one, click to bounce it, drag to throw it — it springs back to its core
 * and knocks the others out of the way.
 * Physics is a few lines of springs + ball-ball collisions (no physics engine).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { Skill } from '@/content/types';
import { skillIcons } from '@/lib/skillIcons';
import ui from '../ui/ui.module.css';

export interface BallGroup { name: string; at: [number, number]; skills: Skill[] }

const R = 0.23;              // ball radius (model units)
const FLOOR = 0.36;          // top of the die
const LIFT = 0.72;           // resting height of the lowest ball above the die

/** logo painted twice (front and back) on a light tint of the brand colour */
function ballTexture(skill: Skill): THREE.CanvasTexture {
  const icon = skill.icon ? skillIcons[skill.icon] : undefined;
  const brand = new THREE.Color('#' + (icon?.hex ?? '5B7F6A'));
  const tint = brand.clone().lerp(new THREE.Color('#FFFFFF'), 0.84);
  const W = 512, H = 256;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d')!;
  g.fillStyle = '#' + tint.getHexString();
  g.fillRect(0, 0, W, H);
  // a thin band in the brand colour around the "equator" seam-free
  g.fillStyle = '#' + brand.clone().lerp(new THREE.Color('#FFFFFF'), 0.55).getHexString();
  g.fillRect(0, H * 0.5 - 2, W, 4);
  // sphere UV: u = 0.25 faces +z (the viewer), u = 0.75 faces away
  for (const u of [0.25, 0.75]) {
    const cx = u * W, cy = H / 2, size = 128;
    g.fillStyle = '#' + tint.getHexString();
    g.beginPath(); g.arc(cx, cy, size * 0.68, 0, Math.PI * 2); g.fill();
    if (icon) {
      g.save();
      g.translate(cx - size / 2, cy - size / 2);
      g.scale(size / 24, size / 24);
      g.fillStyle = '#' + brand.getHexString();
      g.fill(new Path2D(icon.path));
      g.restore();
    } else {
      const initials = skill.name.replace(/[^A-Za-z0-9+#]/g, '').slice(0, 2);
      g.fillStyle = '#' + brand.getHexString();
      g.font = '700 70px system-ui, sans-serif';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(initials, cx, cy + 4);
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

interface Body {
  home: THREE.Vector3; p: THREE.Vector3; v: THREE.Vector3;
  phase: number; spin: number; spinV: number; s: number; born: number;
}

export default function SkillBalls({ groups, active }: { groups: BallGroup[]; active: boolean }) {
  const flat = useMemo(() => groups.flatMap((g, gi) => g.skills.map((s, si) => ({ skill: s, group: g.name, gi, si, n: g.skills.length, at: g.at }))), [groups]);
  const container = useRef<THREE.Group>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const { camera, pointer, raycaster } = useThree();
  const [hovered, setHovered] = useState(-1);
  const drag = useRef<{ i: number; plane: THREE.Plane; offset: THREE.Vector3; moved: number } | null>(null);
  const opened = useRef(0);

  // resting spots: a small ring over each core, staggered in height so every logo shows
  const bodies = useMemo<Body[]>(() => {
    const homes = flat.map(({ si, n, gi, at }) => {
      const ring = n <= 1 ? 0 : Math.min(0.46, 0.2 + n * 0.045);
      const a = (si / n) * Math.PI * 2 + 0.6 + gi;
      return new THREE.Vector3(at[0] + Math.cos(a) * ring, FLOOR + LIFT + (si % 2) * 0.46 + (gi % 2) * 0.2, at[1] + Math.sin(a) * ring * 0.8);
    });
    // relax: push resting spots apart so no two balls overlap, while each stays near its core
    const anchors = flat.map(({ at }) => new THREE.Vector3(at[0], FLOOR + LIFT + 0.3, at[1]));
    const MIN = R * 2.25, d = new THREE.Vector3();
    for (let it = 0; it < 240; it++) {
      for (let i = 0; i < homes.length; i++) {
        for (let j = i + 1; j < homes.length; j++) {
          d.copy(homes[j]).sub(homes[i]);
          const l = d.length();
          if (l < MIN && l > 1e-6) { d.multiplyScalar((MIN - l) / l / 2); homes[i].sub(d); homes[j].add(d); }
        }
        homes[i].lerp(anchors[i], 0.004);
        homes[i].y = Math.min(FLOOR + 2.0, Math.max(FLOOR + LIFT, homes[i].y));
      }
    }
    return flat.map(({ at }, k) => ({
      home: homes[k], p: new THREE.Vector3(at[0], FLOOR, at[1]), v: new THREE.Vector3(),
      phase: k * 1.7, spin: 0, spinV: 0, s: 0, born: (k / Math.max(1, flat.length)) * 0.5,
    }));
  }, [flat]);

  const materials = useMemo(() => flat.map(({ skill }) => new THREE.MeshStandardMaterial({ map: ballTexture(skill), roughness: 0.5, metalness: 0.02 })), [flat]);
  useEffect(() => () => materials.forEach((m) => { m.map?.dispose(); m.dispose(); }), [materials]);
  const geo = useMemo(() => new THREE.SphereGeometry(R, 40, 28), []);
  useEffect(() => () => geo.dispose(), [geo]);

  // release a drag anywhere on the page
  useEffect(() => {
    const up = () => {
      const d = drag.current;
      if (!d) return;
      if (d.moved < 0.04) {                     // a click, not a throw: bounce
        bodies[d.i].v.y += 3.2; bodies[d.i].spinV += 14;
      }
      drag.current = null;
      document.body.style.cursor = '';
    };
    addEventListener('pointerup', up);
    return () => removeEventListener('pointerup', up);
  }, [bodies]);

  const tmpW = useMemo(() => new THREE.Vector3(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const parentQ = useMemo(() => new THREE.Quaternion(), []);
  const spinQ = useMemo(() => new THREE.Quaternion(), []);
  const yAxis = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const n_ = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const t = state.clock.elapsedTime;
    const c = container.current;
    if (!c) return;
    opened.current = active ? Math.min(1, opened.current + dt * 0.9) : Math.max(0, opened.current - dt * 2.5);
    c.visible = opened.current > 0;
    if (!c.visible) return;

    // dragging: move the held ball along a plane facing the camera
    const d = drag.current;
    if (d) {
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(d.plane, hit)) {
        const local = c.worldToLocal(hit.clone()).add(d.offset);
        const b = bodies[d.i];
        local.y = Math.max(FLOOR + R, local.y);
        d.moved += local.distanceTo(b.p);
        b.v.copy(local).sub(b.p).divideScalar(Math.max(dt, 1e-3)).clampLength(0, 9);
        b.p.copy(local);
      }
    }

    // springs back home, with a gentle bob
    bodies.forEach((b, i) => {
      const o = Math.min(1, Math.max(0, (opened.current - b.born) / 0.45));
      b.s += ((o > 0 ? (hovered === i ? 1.22 : 1) : 0) * (1 - Math.pow(1 - o, 3)) - b.s) * Math.min(1, dt * 10);
      if (d && d.i === i) return;
      const bobY = Math.sin(t * 1.25 + b.phase) * 0.07 + (hovered === i ? 0.12 : 0);
      const tx = b.home.x, ty = b.home.y + bobY, tz = b.home.z;
      b.v.x += ((tx - b.p.x) * 16 - b.v.x * 2.6) * dt;
      b.v.y += ((ty - b.p.y) * 16 - b.v.y * 2.6) * dt;
      b.v.z += ((tz - b.p.z) * 16 - b.v.z * 2.6) * dt;
      b.p.addScaledVector(b.v, dt);
      if (b.p.y < FLOOR + R) { b.p.y = FLOOR + R; if (b.v.y < 0) b.v.y *= -0.55; }
    });

    // ball-ball collisions (a thrown ball knocks the others)
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i], b = bodies[j];
        n_.copy(b.p).sub(a.p);
        const dist = n_.length(), min = R * (a.s + b.s) * 0.98;
        if (dist >= min || dist < 1e-5) continue;
        n_.divideScalar(dist);
        const push = min - dist;
        const ha = d && d.i === i, hb = d && d.i === j;
        const wa = ha ? 0 : hb ? 1 : 0.5, wb = hb ? 0 : ha ? 1 : 0.5;
        a.p.addScaledVector(n_, -push * wa);
        b.p.addScaledVector(n_, push * wb);
        const rel = b.v.clone().sub(a.v).dot(n_);
        if (rel < 0) {
          a.v.addScaledVector(n_, rel * 0.9 * wa * 2);
          b.v.addScaledVector(n_, -rel * 0.9 * wb * 2);
          a.spinV += rel * 3; b.spinV -= rel * 3;
        }
      }
    }

    // write transforms; logos keep facing the viewer while the die sways underneath
    c.getWorldQuaternion(parentQ).invert();
    bodies.forEach((b, i) => {
      const m = meshes.current[i];
      if (!m) return;
      b.spinV *= Math.exp(-dt * 1.6);
      b.spin += b.spinV * dt;
      m.position.copy(b.p);
      m.scale.setScalar(Math.max(0.0001, b.s));
      spinQ.setFromAxisAngle(yAxis, b.spin + Math.sin(t * 0.7 + b.phase) * 0.25);
      m.quaternion.copy(parentQ).multiply(spinQ);
    });
  });

  const onDown = (i: number) => (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const c = container.current, m = meshes.current[i];
    if (!c || !m) return;
    m.getWorldPosition(tmpW);
    const normal = camera.getWorldDirection(new THREE.Vector3()).negate();
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, tmpW);
    const grab = c.worldToLocal(e.point.clone());
    drag.current = { i, plane, offset: bodies[i].p.clone().sub(grab), moved: 0 };
    document.body.style.cursor = 'grabbing';
  };

  // dev-only: lets automated screenshots find a ball on screen
  const { size } = useThree();
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    (window as unknown as { __skillBalls?: () => number[][] }).__skillBalls = () => meshes.current.map((m) => {
      if (!m) return [-1, -1];
      const v = m.getWorldPosition(new THREE.Vector3()).project(camera);
      return [(v.x + 1) / 2 * size.width, (1 - v.y) / 2 * size.height];
    });
  }, [camera, size]);

  const hb = hovered >= 0 ? flat[hovered] : null;
  return (
    <group ref={container} visible={false}>
      {flat.map((f, i) => (
        <mesh
          key={f.group + f.skill.name}
          ref={(el) => { meshes.current[i] = el; }}
          geometry={geo}
          material={materials[i]}
          castShadow
          onPointerOver={(e) => { e.stopPropagation(); setHovered(i); if (!drag.current) document.body.style.cursor = 'grab'; }}
          onPointerOut={() => { setHovered((h) => (h === i ? -1 : h)); if (!drag.current) document.body.style.cursor = ''; }}
          onPointerDown={onDown(i)}
        />
      ))}
      {hb && active && (
        <BallLabel body={bodies[hovered]} text={hb.skill.name} sub={hb.group} />
      )}
    </group>
  );
}

function BallLabel({ body, text, sub }: { body: Body; text: string; sub: string }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => { ref.current?.position.set(body.p.x, body.p.y + R * 1.9, body.p.z); });
  return (
    <group ref={ref}>
      <Html center zIndexRange={[12, 0]} style={{ pointerEvents: 'none' }}>
        <div className={ui.label}><b>{sub}</b>{text}</div>
      </Html>
    </group>
  );
}
