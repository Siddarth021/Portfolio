'use client';
import { useEffect, useRef, useState } from 'react';
import { paletteKeys, palettes, type Palette } from '@/theme/palettes';
import { useWorld } from '@/store/useWorld';
import ui from './ui.module.css';

const dot = (p: Palette) => ({ background: `linear-gradient(135deg, ${p.accent} 50%, ${p.accent2} 50%)` });

/** Collapsed palette picker: one button that opens a small menu. */
export default function PaletteSwitch() {
  const active = useWorld((s) => s.paletteKey);
  const setPalette = useWorld((s) => s.setPalette);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    addEventListener('pointerdown', close);
    addEventListener('keydown', esc);
    return () => { removeEventListener('pointerdown', close); removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div className={ui.palettes} ref={root}>
      <button type="button" className={ui.palToggle} aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}>
        <i className={ui.dot} style={dot(palettes[active])} />
        <span>Palette</span>
      </button>
      {open && (
        <div className={ui.palMenu} role="menu">
          {paletteKeys.map((k) => (
            <button key={k} type="button" role="menuitemradio" aria-checked={k === active} aria-pressed={k === active}
              className={ui.swatch} onClick={() => { setPalette(k); setOpen(false); }}>
              <i className={ui.dot} style={dot(palettes[k])} />
              {palettes[k].name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
