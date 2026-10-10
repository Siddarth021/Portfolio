# Siddarth Gundeti · Portfolio

A 3D road-trip portfolio. A small car drives a winding road across a circuit board.
Each stop is a computer part (RAM, GPU, SSD …) that opens a section of the portfolio.

Built with Next.js 14, React Three Fiber, drei and Zustand.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Other scripts:

| Script | What it does |
| --- | --- |
| `npm run build` / `npm start` | Production build (this is what Vercel runs) |
| `npm run preview:export` | Static copy in `./out` that opens from any folder or file host |

Tip: `http://localhost:3000/#projects` opens a stop directly. Every stop's slug works.

## Where things live

```
src/
  app/                  Next.js entry (layout, page, global CSS)
  content/
    types.ts            Content schema: Stop, Block (lead/text/checks/skills/
                         cards/role/facts/tags/stats/contact), Profile
    portfolio.ts         ALL TEXT AND LINKS  ← edit this for now
  theme/palettes.ts     Light matte palettes (every colour comes from here)
  store/useWorld.ts     App state: boot → map → drive → stop
  lib/skillIcons.ts     Inlined brand-logo SVGs for the skill flip-cards
  components/
    world/              The 3D scene
      Experience.tsx    Canvas, lights, soft shadows, ambient occlusion
      track.ts          Road curve + automatic stop placement
      Board.tsx Road.tsx Car.tsx Stops.tsx CameraRig.tsx
    parts/              One file per computer part
      kit.tsx           Shared matte materials + Box / Cyl / Many helpers
      Cpu  Motherboard  Cores  RamKit  CacheStack
      M2Ssd  AiChip  GpuCard  PowerSupply  IoPanel
      index.ts          part key → model
    ui/                 Boot screen, brand header, palette switch
      StopPanel.tsx      Side panel shell (header / scrollable body / nav)
      blocks/Blocks.tsx  Renders a stop's Block[] (one layout per type)
scripts/fix-preview.mjs Fixes font paths in the static preview
```

Folders you'll see on disk but **not** in git (see `.gitignore`): `_old-draft/`
(your original single-file version, kept for reference) and `_backups/` (zip
snapshots taken while this was being rebuilt). Neither is part of the project
going forward — safe to ignore or delete whenever you like.

## Editing content (today)

Open `src/content/portfolio.ts`. Each stop is a `title`, `part`, and a list of
typed `blocks` — the same building blocks the side panel already knows how to
render, so a new stop never needs new UI code:

| Block type | Renders as |
| --- | --- |
| `lead` | Big self-typing headline |
| `text` | A paragraph |
| `checks` | POST-style checklist |
| `skills` | Grouped flip-cards (front: name, back: logo) |
| `cards` | Project/certificate cards, linked or not |
| `role` | Experience/education entry (title, org, period, points) |
| `facts` / `stats` | Small stat grid |
| `tags` | Pill list |
| `contact` | Icon rows with copy-to-clipboard |

- Add a project: add a `card` to the **Projects** stop's `cards` block. A new
  RAM stick appears automatically (`modelCount` counts cards/groups for you).
- Add a skill: add it to a group in the **Skills** stop's `skills` block.
- Add a stop: add an entry to `stops` in `portfolio.ts` and a line to `PartKey`
  if it needs a new 3D part. The road places it automatically.

The planned next step replaces this file with a Supabase table and a private
`/admin` page, so projects/skills/positions can be added from a form instead
of code — see **Versioning** below for how that fits in without a rewrite.

## Adding a new 3D part

1. Create `src/components/parts/MyPart.tsx` using the helpers in `kit.tsx`.
2. Add its key to `PartKey` in `src/content/types.ts`.
3. Register it in `src/components/parts/index.ts`.
4. Set `part: 'mypart'` on a stop.

## Versioning

This repo follows [semver](https://semver.org) (`MAJOR.MINOR.PATCH`, in
`package.json`). See `CHANGELOG.md` for what shipped in each version.

- **v1.x — current.** Content lives in `src/content/portfolio.ts` (a plain
  TypeScript file you edit and redeploy). Everything downstream — the 3D
  scene, the side panel, the skill cards — reads from the typed `Stop[]` /
  `Profile` shape in `src/content/types.ts`, never from the file layout. That
  boundary is the whole point: it's what makes v2 a drop-in, not a rewrite.
- **v2 — planned.** Swap `portfolio.ts` for a Supabase table and a private
  `/admin` page that writes to it. The migration is: write a fetch function
  that returns the same `Stop[]` / `Profile` shape `portfolio.ts` exports
  today, point `src/app/page.tsx` at it instead, seed the table from the
  current `portfolio.ts` content, done. No component below `types.ts` has to
  change. Bump to `2.0.0` once `/admin` is live.
- Day-to-day content edits (new project, new skill) are **not** a version
  bump — only a structural change (new block type, schema change, new stop
  part) is. Patch (`0.0.x`) for fixes, minor (`0.x.0`) for new content-schema
  features that stay backward compatible, major (`x.0.0`) for a breaking
  change like the Supabase swap.
