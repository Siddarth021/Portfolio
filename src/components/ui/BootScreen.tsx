'use client';
import { useEffect, useRef, useState } from 'react';
import { useWorld } from '@/store/useWorld';
import ui from './ui.module.css';

interface Props { projects: number; skills: number }

/** BIOS-style boot sequence shown once, before the road appears. Click or any key skips it. */
export default function BootScreen({ projects, skills }: Props) {
  const setMode = useWorld((s) => s.setMode);
  const [shown, setShown] = useState(0);
  const [gone, setGone] = useState(false);
  const lines: [string, string][] = [
    ['POST check', ''],
    [`Memory · ${projects} projects ……`, 'OK'],
    [`Cores · ${skills} skill sets ……`, 'OK'],
    ['Display · design eye ……', 'OK'],
    ['Loading road.map ……', 'OK'],
  ];
  const total = lines.length + 1;

  const doneRef = useRef(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setGone(true);
    setMode('map');
  };

  useEffect(() => {
    if (gone) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(total); const t = setTimeout(finish, 600); return () => clearTimeout(t); }
    if (shown < total) { const t = setTimeout(() => setShown((n) => n + 1), shown === lines.length ? 380 : 230); return () => clearTimeout(t); }
    const t = setTimeout(finish, 1100);
    return () => clearTimeout(t);
  }, [shown, gone]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const k = () => finish();
    addEventListener('keydown', k, { once: true });
    return () => removeEventListener('keydown', k);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`${ui.boot} ${gone ? ui.bootGone : ''}`} onClick={finish} aria-hidden={gone}>
      <div className={ui.bootInner}>
        <div>SG-BIOS v2.0</div>
        {lines.slice(0, shown).map(([a, b]) => (
          <div key={a}>{a} {b && <b>{b}</b>}</div>
        ))}
        {shown >= total && <div className={ui.bootHello}>Hello, world.<br />I&apos;m <em>Siddarth</em>.</div>}
        <div className={ui.skip}>Click anywhere to skip</div>
      </div>
    </div>
  );
}
