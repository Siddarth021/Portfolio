# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/); versions follow
[semver](https://semver.org) (see the **Versioning** section in `README.md`
for what counts as a major/minor/patch change here).

## [1.3.0] — 2026-10-11

### Changed
- Face portrait: hair, ears and neck rebuilt for likeness (~11,600 facets).
  - Hair: 4x finer around the head, hairline traced column by column from the
    photo, outline fitted to the photo's hair silhouette in finer steps, ~30 locks
    that run back from the hairline with a sheen along each, crisper hairline colour.
  - Ears: each ear's height and how far it sticks out measured row by row from the
    photo; shaped with helix rim, antihelix ridge, concha, lobe and a back.
  - Neck: width per height measured from the photo, throat and neck-muscle ridges,
    a flare toward the shoulders and a V-shaped cut; shirt collar and its shadow no
    longer leak into the skin colour.
- Camera moved a little closer so the head keeps its size with the longer neck.
- Face portrait is now a bust: shoulders, chest, the shirt's collar (stand + both
  collar points traced from the photo) and the top button, coloured from the photo
  (~16,300 facets).

### Added
- Skills stop: every skill floats over its CPU core as a ball with its logo. Balls
  rise out of the cores when the stop opens and bob gently; hover to lift one and
  see its name, click to bounce it, drag to throw it — it springs back and knocks
  the others aside (`components/parts/SkillBalls.tsx`, no physics library).

## [1.2.0] — 2026-10-11

### Changed
- Face portrait rebuilt for likeness: every facet now carries the real colour
  sampled from the photo (skin, eyes, brows, moustache, lips, hair), detail is
  concentrated where faces are recognised (extra facets on the photo's edges,
  a fine grid inside the eyes, adaptive splitting), hairline and hair outline are
  traced from the photo, ears/neck measured from it. ~4,300 facets.
- Portrait shown closer to front-on with a longer-lens camera (less distortion).
- Boot screen: explicit "Enter the map" button; slower headline typing,
  checklist and facet assembly.

## [1.1.0] — 2026-10-10

### Added
- Faceted 3D portrait on the right half of the boot screen, built from ~1,000
  flat-shaded planes fitted to a photo (face landmarks + generated hair, ears,
  neck). Facets fly in and assemble as the boot lines load, then the head turns
  gently toward the cursor. Palette-aware colours.
- `scripts/face/` with the mesh builder and preview tool.

### Changed
- Boot screen: "Mapping components → Siddarth" types in as a large headline,
  then the POST checklist; ends on "All parts mapped. Meet Siddarth."
- Boot screen waits for a click or key press instead of auto-entering the map.

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
