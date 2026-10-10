import { useWorld } from '@/store/useWorld';

/* Keeps the hover card open while the pointer moves from a stop onto the card. */
let timer: ReturnType<typeof setTimeout> | undefined;
let overCard = false;

export const hover = {
  enterStop(i: number) {
    clearTimeout(timer);
    useWorld.getState().setHovered(i);
  },
  leaveStop() {
    clearTimeout(timer);
    timer = setTimeout(() => { if (!overCard) useWorld.getState().setHovered(-1); }, 260);
  },
  enterCard() { overCard = true; clearTimeout(timer); },
  leaveCard() { overCard = false; hover.leaveStop(); },
};
