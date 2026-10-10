'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { modelCount, type Profile, type Stop } from '@/content/types';
import { useWorld, usePalette } from '@/store/useWorld';
import { palettes, type PaletteKey } from '@/theme/palettes';
import { motion, stopT } from '../world/track';
import BootScreen from './BootScreen';
import PaletteSwitch from './PaletteSwitch';
import StopPanel from './StopPanel';
import ui from './ui.module.css';

const Experience = dynamic(() => import('../world/Experience'), { ssr: false });

const hexA = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

export default function Home({ profile, stops }: { profile: Profile; stops: Stop[] }) {
  const pal = usePalette();
  const mode = useWorld((s) => s.mode);

  // restore the palette chosen last time
  useEffect(() => {
    try {
      const k = localStorage.getItem('palette') as PaletteKey | null;
      if (k && k in palettes) useWorld.getState().setPalette(k);
    } catch { /* storage blocked */ }
  }, []);

  // palette -> CSS variables for the overlay UI
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--bg', pal.bg);
    r.setProperty('--ink', pal.ink);
    r.setProperty('--muted', pal.muted);
    r.setProperty('--accent', pal.accent);
    r.setProperty('--accent2', pal.accent2);
    r.setProperty('--surface', hexA(pal.ground, 0.82));
    r.setProperty('--surface-strong', hexA(pal.ground, 0.94));
    r.setProperty('--line', hexA(pal.ink, 0.1));
    r.setProperty('--line-strong', hexA(pal.ink, 0.18));
  }, [pal]);

  // deep links: /#projects opens that stop directly after the boot screen
  const booted = mode !== 'boot';
  useEffect(() => {
    if (!booted) return;
    const i = stops.findIndex((s) => `#${s.slug}` === location.hash);
    if (i >= 0) { motion.carT = stopT(i, stops.length); useWorld.setState({ current: i, mode: 'stop' }); }
  }, [booted]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep the address bar in sync so a stop can be shared
  const current = useWorld((s) => s.current);
  useEffect(() => {
    if (mode === 'boot') return;
    const hash = mode === 'stop' && current >= 0 ? `#${stops[current].slug}` : '';
    if (location.hash !== hash) history.replaceState(null, '', hash || location.pathname + location.search);
  }, [mode, current, stops]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape' && useWorld.getState().mode !== 'boot') useWorld.getState().openMap(); };
    addEventListener('keydown', h);
    return () => removeEventListener('keydown', h);
  }, []);

  const ram = stops.find((s) => s.part === 'ram');
  const cores = stops.find((s) => s.part === 'cores');
  const projects = ram ? modelCount(ram) : 0;
  const skills = cores ? modelCount(cores) : 0;

  return (
    <main>
      <div style={{ position: 'fixed', inset: 0 }}>
        <Experience stops={stops} />
      </div>
      <header className={ui.brand}>
        <h1>{profile.name}</h1>
        <div className={ui.roles}>
          {profile.roles.map((r) => <span key={r.label} className={`${ui.role} ${ui[r.kind]}`}>{r.label}</span>)}
        </div>
      </header>
      <PaletteSwitch />
      <div className={ui.hint} style={{ opacity: mode === 'map' ? 1 : 0 }}>Hover a stop · click to drive there</div>
      <StopPanel stops={stops} />
      <BootScreen projects={projects} skills={skills} />
    </main>
  );
}
