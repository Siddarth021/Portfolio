/** Which 3D computer part a stop is drawn as. Add a key here + a model in components/parts to add a new part. */
export type PartKey =
  | 'cpu'
  | 'motherboard'
  | 'cores'
  | 'ram'
  | 'cache'
  | 'ssd'
  | 'coprocessor'
  | 'gpu'
  | 'psu'
  | 'io';

export interface Skill {
  name: string;
  /** logo key from src/lib/skillIcons.ts; leave empty to show the initials */
  icon?: string;
}

export interface Card {
  title: string;
  meta?: string;
  body?: string;
  tags?: string[];
  /** undefined = no button, null = "No link" placeholder */
  url?: string | null;
  linkLabel?: string;
}

export type ContactKind = 'email' | 'phone' | 'linkedin' | 'github';

/** A stop's content is a list of blocks. Each block type has its own layout in the side panel. */
export type Block =
  | { type: 'lead'; text: string }
  | { type: 'text'; text: string }
  | { type: 'checks'; items: { label: string; status: string }[] }
  | { type: 'skills'; groups: { name: string; note?: string; skills: Skill[] }[] }
  | { type: 'cards'; label?: string; items: Card[] }
  | { type: 'role'; title: string; org: string; period: string; points: string[] }
  | { type: 'facts'; items: { label: string; value: string }[] }
  | { type: 'tags'; label?: string; items: string[] }
  | { type: 'stats'; items: { value: string; label: string }[] }
  | { type: 'contact'; items: { kind: ContactKind; label: string; url: string }[] };

export interface Stop {
  slug: string;
  title: string;
  part: PartKey;
  /** Human name of the part, shown on cards */
  partName: string;
  /** Fake file name shown while the stop "loads" */
  file: string;
  /** Verb on the hover card button */
  cta: string;
  blocks: Block[];
}

export interface Role {
  label: string;
  kind: 'primary' | 'secondary' | 'learning';
}

export interface Profile {
  name: string;
  roles: Role[];
}

/** How many repeated items a stop's 3D model shows: RAM sticks = projects, cores = skill groups. */
export function modelCount(stop: Stop): number {
  if (stop.part === 'cores') {
    const b = stop.blocks.find((x) => x.type === 'skills');
    return b && b.type === 'skills' ? b.groups.length : 4;
  }
  const cards = stop.blocks.find((x) => x.type === 'cards');
  return cards && cards.type === 'cards' ? cards.items.length : 1;
}
