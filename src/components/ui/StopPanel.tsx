'use client';
import { useEffect, useRef } from 'react';
import type { Stop } from '@/content/types';
import { useWorld } from '@/store/useWorld';
import Blocks from './blocks/Blocks';
import ui from './ui.module.css';

/** Side panel that opens when the car arrives at a stop. */
export default function StopPanel({ stops }: { stops: Stop[] }) {
  const mode = useWorld((s) => s.mode);
  const current = useWorld((s) => s.current);
  const dive = useWorld((s) => s.dive);
  const openMap = useWorld((s) => s.openMap);
  const body = useRef<HTMLDivElement>(null);
  const open = mode === 'stop' && current >= 0;
  const stop = current >= 0 ? stops[current] : null;
  const last = current === stops.length - 1;

  useEffect(() => { if (open && body.current) body.current.scrollTop = 0; }, [open, current]);

  return (
    <aside className={`${ui.panel} ${open ? ui.open : ''}`} aria-live="polite" aria-hidden={!open}>
      {stop && (
        <>
          <header className={ui.panelHead}>
            <div className={ui.file}>&gt; loading {stop.file}</div>
            <h2>{stop.title}</h2>
            <div className={ui.part}>
              Component <b>{stop.partName}</b>
              <span className={ui.stepCount}>{String(current + 1).padStart(2, '0')} / {String(stops.length).padStart(2, '0')}</span>
            </div>
          </header>
          <div className={ui.panelBody} ref={body}>
            {/* key restarts the entrance animation for every stop */}
            {open && <Blocks key={stop.slug} blocks={stop.blocks} />}
          </div>
          <nav className={ui.nav}>
            <button type="button" className={`${ui.btn} ${ui.ghost}`} onClick={openMap}>
              <span aria-hidden="true">←</span> Open map
            </button>
            <button type="button" className={ui.btn} onClick={() => dive(last ? 0 : current + 1)}>
              {last ? 'Back to start' : `Next: ${stops[current + 1].title}`} <span aria-hidden="true">→</span>
            </button>
          </nav>
        </>
      )}
    </aside>
  );
}
