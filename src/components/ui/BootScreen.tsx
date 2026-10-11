'use client';
import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useWorld } from '@/store/useWorld';
import ui from './ui.module.css';

const FacePortrait = dynamic(() => import('../face/FacePortrait'), { ssr: false });

interface Props { projects: number; skills: number }

const MAP_LINE = 'Mapping components → Siddarth';

/** BIOS-style boot sequence shown once, before the road appears. Click or any key enters the map. */
export default function BootScreen({ projects, skills }: Props) {
  const setMode = useWorld((s) => s.setMode);
  const [mapChars, setMapChars] = useState(0);
  const [shown, setShown] = useState(0);
  const [gone, setGone] = useState(false);
  const [faceMounted, setFaceMounted] = useState(true);
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mapDone = mapChars >= MAP_LINE.length;

  const lines: [string, string][] = [
    ['POST check', ''],
    [`Memory · ${projects} projects ……`, 'OK'],
    [`Cores · ${skills} skill sets ……`, 'OK'],
    ['Display · design eye ……', 'OK'],
    ['Loading road.map ……', 'OK'],
  ];
  const total = lines.length + 1;

  // the face assembles while the lines load: typing = first 45%, checklist = the rest
  const progress = Math.min(1, (mapChars / MAP_LINE.length) * 0.45 + (shown / total) * 0.55);

  const doneRef = useRef(false);
  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setGone(true);
    setMode('map');
  };

  // free the face's GPU context once the boot screen has faded out
  useEffect(() => {
    if (!gone) return;
    const t = setTimeout(() => setFaceMounted(false), 900);
    return () => clearTimeout(t);
  }, [gone]);

  // big headline types in two letters at a time, slowly
  useEffect(() => {
    if (gone) return;
    if (reduced()) { setMapChars(MAP_LINE.length); return; }
    if (mapChars < MAP_LINE.length) {
      const t = setTimeout(() => setMapChars((n) => Math.min(n + 2, MAP_LINE.length)), 160);
      return () => clearTimeout(t);
    }
  }, [mapChars, gone]); // eslint-disable-line react-hooks/exhaustive-deps

  // then the POST checklist runs, one line at a time
  useEffect(() => {
    if (gone || !mapDone) return;
    if (reduced()) { setShown(total); return; }
    if (shown < total) { const t = setTimeout(() => setShown((n) => n + 1), shown === lines.length ? 480 : 340); return () => clearTimeout(t); }
    // all lines shown — wait for a click or key press, no auto-advance
  }, [shown, gone, mapDone]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const k = () => finish();
    addEventListener('keydown', k, { once: true });
    return () => removeEventListener('keydown', k);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`${ui.boot} ${gone ? ui.bootGone : ''}`} onClick={finish} aria-hidden={gone}>
      <div className={ui.bootGrid}>
        <div className={ui.bootInner}>
          <div>SG-BIOS v2.0</div>
          <p className={ui.bootMap} aria-label={MAP_LINE}>
            <span aria-hidden="true">{MAP_LINE.slice(0, mapChars)}</span>
            {!mapDone && <span className={ui.caret} aria-hidden="true" />}
            {mapDone && <b className={ui.bootMapOk}>OK</b>}
          </p>
          {mapDone && lines.slice(0, shown).map(([a, b]) => (
            <div key={a} className={ui.bootLine}>{a} {b && <b>{b}</b>}</div>
          ))}
          {shown >= total && <div className={ui.bootHello}>All parts mapped.<br />Meet <em>Siddarth</em>.</div>}
          <button type="button" className={`${ui.btn} ${ui.bootEnter}`} onClick={(e) => { e.stopPropagation(); finish(); }}>
            Enter the map <span aria-hidden="true">→</span>
          </button>
          <div className={ui.skip}>or click anywhere / press any key</div>
        </div>
        <div className={ui.bootFace} aria-hidden="true">
          {faceMounted && <FacePortrait progress={progress} />}
        </div>
      </div>
    </div>
  );
}
