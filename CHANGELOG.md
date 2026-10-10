# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/); versions follow
[semver](https://semver.org) (see the **Versioning** section in `README.md`
for what counts as a major/minor/patch change here).

## [1.0.0] — 2026-10-10

First end-deployment build, rebuilt from the original single-file draft
(kept locally in `_old-draft/`, not part of this repo).

### Added
- Full Next.js 14 + React Three Fiber scene: road, car, and a detailed
  3D model per "computer part" stop (CPU, motherboard, cores, RAM, cache,
  SSD, AI co-processor, GPU, PSU, I/O panel), built from shared matte
  materials in `components/parts/kit.tsx`.
- Light, matte color palette system (`theme/palettes.ts`), switchable at
  runtime and remembered across visits.
- Automatic stop placement along the road (`world/track.ts`) that scores
  left/right clearance so stops never overlap as content grows.
- BIOS-style boot sequence gating entry to the map.
- Content-as-data architecture: `content/types.ts` (schema) +
  `content/portfolio.ts` (actual content), with a typed `Block` union
  (lead/text/checks/skills/cards/role/facts/tags/stats/contact) so the side
  panel never needs new UI code for new content — see README → Versioning
  for why this is the seam the v2 Supabase admin panel will slot into.
- Deep-linking via URL hash (`#slug`) straight to a stop.
- Interactive skill chips that flip on hover/click to reveal the real brand
  logo (inlined SVGs in `lib/skillIcons.ts`, no runtime dependency).
- Static export (`npm run preview:export`) for hosting the build from any
  file host, with a font-path fixup script.

### Known follow-ups (tracked, not yet started)
- `/admin` page + Supabase-backed content (the planned v2 — see README).
- Deploy to a `vercel.app` link.
