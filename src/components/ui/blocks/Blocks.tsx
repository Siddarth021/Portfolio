'use client';
import { useEffect, useState, type CSSProperties } from 'react';
import type { Block, Card, ContactKind, Skill } from '@/content/types';
import { skillIcons } from '@/lib/skillIcons';
import s from './blocks.module.css';

const reduced = () => typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const delay = (i: number): CSSProperties => ({ animationDelay: `${120 + i * 90}ms` });

/* ---------- lead line types itself out ---------- */
function Lead({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduced()) { setN(text.length); return; }
    setN(0);
    const id = setInterval(() => setN((v) => { if (v >= text.length) { clearInterval(id); return v; } return v + 1; }), 28);
    return () => clearInterval(id);
  }, [text]);
  return (
    <p className={s.lead} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, n)}</span>
      {n < text.length && <span className={s.caret} aria-hidden="true" />}
    </p>
  );
}

/* ---------- skill chip that flips to its logo ---------- */
function SkillChip({ skill }: { skill: Skill }) {
  const icon = skill.icon ? skillIcons[skill.icon] : undefined;
  const [flipped, setFlipped] = useState(false);
  const initials = skill.name.replace(/[^A-Za-z0-9+#]/g, '').slice(0, 2).toUpperCase();
  return (
    <button
      type="button"
      className={`${s.flip} ${flipped ? s.flipped : ''}`}
      onClick={() => setFlipped((f) => !f)}
      aria-label={skill.name}
    >
      <span className={s.flipInner}>
        <span className={s.front}>{skill.name}</span>
        <span className={s.back} style={{ ['--brand' as string]: icon ? `#${icon.hex}` : 'var(--accent)' }}>
          {icon ? (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} /></svg>
          ) : (
            <b>{initials}</b>
          )}
        </span>
      </span>
    </button>
  );
}

/* ---------- cards ---------- */
function CardItem({ card }: { card: Card }) {
  const body = (
    <>
      <div className={s.cardHead}>
        <strong>{card.title}</strong>
        {card.url && <span className={s.arrow} aria-hidden="true">↗</span>}
      </div>
      {card.meta && <span className={s.meta}>{card.meta}</span>}
      {card.body && <p>{card.body}</p>}
      {card.tags && card.tags.length > 0 && (
        <div className={s.miniTags}>{card.tags.map((t) => <span key={t}>{t}</span>)}</div>
      )}
      {card.url === null && <span className={s.nolink}>No link yet</span>}
      {card.url && <span className={s.linkLabel}>{card.linkLabel ?? 'Open'}</span>}
    </>
  );
  return card.url ? (
    <a className={`${s.card} ${s.cardLink}`} href={card.url} target="_blank" rel="noopener noreferrer">{body}</a>
  ) : (
    <div className={s.card}>{body}</div>
  );
}

/* ---------- contact rows ---------- */
const glyph: Record<ContactKind, JSX.Element> = {
  email: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3z" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m3.5 6 8.5 7 8.5-7" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>,
  phone: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5 9.5 3l1.6 4.2-2 1.4a12 12 0 0 0 6.3 6.3l1.4-2 4.2 1.6-.5 2.9c-.2 1-1 1.6-2 1.6A16.5 16.5 0 0 1 3 5.5c0-1 .6-1.8 1.6-2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>,
  linkedin: <svg viewBox="0 0 24 24" aria-hidden="true"><path d={skillIcons.linkedin.path} fill="currentColor" /></svg>,
  github: <svg viewBox="0 0 24 24" aria-hidden="true"><path d={skillIcons.github.path} fill="currentColor" /></svg>,
};
const kindName: Record<ContactKind, string> = { email: 'Email', phone: 'Phone', linkedin: 'LinkedIn', github: 'GitHub' };

function ContactRow({ kind, label, url }: { kind: ContactKind; label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(kind === 'email' || kind === 'phone' ? label : url); setCopied(true); setTimeout(() => setCopied(false), 1400); }
    catch { /* clipboard blocked */ }
  };
  return (
    <div className={s.contact}>
      <span className={s.contactIcon}>{glyph[kind]}</span>
      <a href={url} target={url.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
        <small>{kindName[kind]}</small>
        <span>{label}</span>
      </a>
      <button type="button" className={s.copy} onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
    </div>
  );
}

/* ---------- one block ---------- */
function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'lead':
      return <Lead text={block.text} />;
    case 'text':
      return <p className={s.text}>{block.text}</p>;
    case 'checks':
      return (
        <ul className={s.checks}>
          <li className={s.post}>POST check</li>
          {block.items.map((c) => (
            <li key={c.label}><span>{c.label}</span><i /><b>{c.status}</b></li>
          ))}
        </ul>
      );
    case 'skills':
      return (
        <div className={s.groups}>
          {block.groups.map((g, gi) => (
            <section key={g.name} className={s.group}>
              <h4><span>Core {gi + 1}</span>{g.name}{g.note && <em>{g.note}</em>}</h4>
              <div className={s.chips}>{g.skills.map((k) => <SkillChip key={k.name} skill={k} />)}</div>
            </section>
          ))}
        </div>
      );
    case 'cards':
      return (
        <div>
          {block.label && <h4 className={s.label}>{block.label}</h4>}
          <div className={s.cards}>{block.items.map((c) => <CardItem key={c.title} card={c} />)}</div>
        </div>
      );
    case 'role':
      return (
        <div className={s.role}>
          <span className={s.period}>{block.period}</span>
          <h3>{block.title}</h3>
          <div className={s.org}>{block.org}</div>
          {block.points.length > 0 && (
            <ol className={s.points}>{block.points.map((p, i) => <li key={i}><span>L{i + 1}</span>{p}</li>)}</ol>
          )}
        </div>
      );
    case 'facts':
      return (
        <div className={s.facts}>
          {block.items.map((f) => <div key={f.label}><b>{f.value}</b><span>{f.label}</span></div>)}
        </div>
      );
    case 'stats':
      return (
        <div className={s.stats}>
          {block.items.map((f) => <div key={f.label}><b>{f.value}</b><span>{f.label}</span></div>)}
        </div>
      );
    case 'tags':
      return (
        <div>
          {block.label && <h4 className={s.label}>{block.label}</h4>}
          <div className={s.tags}>{block.items.map((t) => <span key={t}>{t}</span>)}</div>
        </div>
      );
    case 'contact':
      return <div className={s.contacts}>{block.items.map((c) => <ContactRow key={c.kind} {...c} />)}</div>;
  }
}

/** Renders a stop's blocks with a staggered entrance. */
export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className={s.stack}>
      {blocks.map((b, i) => (
        <div key={i} className={s.enter} style={delay(i)}>
          <BlockView block={b} />
        </div>
      ))}
    </div>
  );
}
