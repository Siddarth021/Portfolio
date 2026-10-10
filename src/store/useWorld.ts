import { create } from 'zustand';
import { defaultPalette, palettes, type PaletteKey } from '@/theme/palettes';

export type Mode = 'boot' | 'map' | 'drive' | 'stop';

interface WorldState {
  mode: Mode;
  /** stop the car is heading to / parked at */
  current: number;
  hovered: number;
  paletteKey: PaletteKey;
  setMode: (m: Mode) => void;
  setHovered: (i: number) => void;
  setPalette: (k: PaletteKey) => void;
  /** start driving to a stop */
  dive: (i: number) => void;
  openMap: () => void;
}

export const useWorld = create<WorldState>((set) => ({
  mode: 'boot',
  current: -1,
  hovered: -1,
  paletteKey: defaultPalette,
  setMode: (mode) => set({ mode }),
  setHovered: (hovered) => set({ hovered }),
  setPalette: (paletteKey) => {
    try { localStorage.setItem('palette', paletteKey); } catch { /* storage blocked */ }
    set({ paletteKey });
  },
  dive: (current) => set({ current, hovered: -1, mode: 'drive' }),
  openMap: () => set({ mode: 'map' }),
}));

export const usePalette = () => palettes[useWorld((s) => s.paletteKey)];
