'use client';
import { useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Group } from 'three';
import { modelCount, type Stop as StopData } from '@/content/types';
import { useWorld } from '@/store/useWorld';
import { parts } from '../parts';
import { Cyl, useMats } from '../parts/kit';
import { hover } from './hover';
import { placeStop, PAD_RADIUS } from './track';
import ui from '../ui/ui.module.css';

function Stop({ i, n, data }: { i: number; n: number; data: StopData }) {
  const m = useMats();
  const { pos } = useMemo(() => placeStop(i, n), [i, n]);
  const mode = useWorld((s) => s.mode);
  const isHovered = useWorld((s) => s.hovered === i);
  const active = useWorld((s) => s.mode === 'stop' && s.current === i);
  const dive = useWorld((s) => s.dive);
  const root = useRef<Group>(null);
  const model = useRef<Group>(null);
  const Part = parts[data.part];

  useFrame(({ clock }, dt) => {
    const k = 1 - Math.exp(-dt * 8);
    const s = isHovered && mode === 'map' ? 1.07 : 1;
    if (root.current) root.current.scale.setScalar(root.current.scale.x + (s - root.current.scale.x) * k);
    if (model.current) {
      const want = active ? Math.sin(clock.elapsedTime * 0.6) * 0.45 : 0;
      model.current.rotation.y += (want - model.current.rotation.y) * (1 - Math.exp(-dt * 3));
    }
  });

  const interactive = mode === 'map';
  const onOver = (e: ThreeEvent<PointerEvent>) => { if (!interactive) return; e.stopPropagation(); hover.enterStop(i); document.body.style.cursor = 'pointer'; };
  const onOut = () => { hover.leaveStop(); document.body.style.cursor = ''; };
  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive) return;
    e.stopPropagation();
    if (e.pointerType === 'mouse') { document.body.style.cursor = ''; dive(i); }
    else hover.enterStop(i);
  };

  return (
    <group position={[pos.x, 0, pos.z]}>
      <group ref={root} onPointerOver={onOver} onPointerOut={onOut} onPointerDown={onDown}>
        <Cyl r={PAD_RADIUS} r2={PAD_RADIUS + 0.15} h={0.3} p={[0, 0.15, 0]} m={m.pad} seg={56} />
        <Cyl r={PAD_RADIUS - 0.35} h={0.02} p={[0, 0.31, 0]} m={m.groundEdge} seg={56} />
        <group ref={model} position={[0, 0.31, 0]} scale={1.3}>
          <Part count={modelCount(data)} active={active} />
        </group>
      </group>

      {mode === 'map' && !isHovered && (
        <Html position={[0, 0.3, PAD_RADIUS + 0.9]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
          <div className={ui.label}><b>{String(i + 1).padStart(2, '0')}</b>{data.title}</div>
        </Html>
      )}

      {mode === 'map' && isHovered && (
        <Html position={[0, 7.2, 0]} center zIndexRange={[20, 11]}>
          <div className={ui.card} onPointerEnter={hover.enterCard} onPointerLeave={hover.leaveCard} onClick={() => dive(i)}>
            <span className={ui.eyebrow}>Stop {String(i + 1).padStart(2, '0')} · {data.partName}</span>
            <strong className={ui.cardTitle}>{data.title}</strong>
            <button type="button" className={ui.btn}>
              {data.cta} <span aria-hidden="true">→</span>
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Stops({ stops }: { stops: StopData[] }) {
  return (
    <>
      {stops.map((s, i) => <Stop key={s.slug} i={i} n={stops.length} data={s} />)}
    </>
  );
}
