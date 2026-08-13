# Drop photographs here

Any `.jpg`, `.jpeg`, `.png` or `.webp` file in this folder is picked up automatically by
`src/data/posts.js` and appears in the composer's image picker. **No code change needed** — add the
file, save, and the dev server hot-reloads it in.

## Why this exists

The ten SVG scenes in `../scenes/` are hand-authored vector art. They're built to look photographic —
depth-of-field planes, a key light, vignette, grain — but vector code cannot reach the realism of an
actual news photograph, and Phase 1 only works if a learner believes the post enough to be fooled by
it. Real photography is the upgrade path.

## Naming: the filename is the metadata

`water-reservoir.jpg` becomes:

- **label** — "Water reservoir", shown under the thumbnail in the picker
- **keywords** — `["water", "reservoir"]`, which the composer's *"match one to my headline"* button
  searches against the learner's headline

So name files after what's in them, hyphen-separated, lowercase. `school-canteen-lunch.jpg`,
`town-hall-meeting.jpg`, `train-station-platform.jpg`.

## Replacing a drawn scene

Name a photo after one of the ten scene ids and every fixed Phase 1 post that used the drawing will
switch to your photograph automatically:

```
reservoir  townhall  kitchen  platform  clinic
library    chart     gathering document  roadworks
```

For example, dropping in `reservoir.jpg` replaces the drawn reservoir everywhere it appears —
including the round-one post about the water treatment change.

## Sizing

Aim for roughly **1200 × 800**, under ~300 KB each. They're served as static files and every one
counts toward the bundle the judges load. `.webp` gives the best size-to-quality ratio.

## Licensing — read this before adding anything

Only add images you actually have the right to redistribute. This repository is public and the build
is submitted to a competition, so a copyrighted press photo is a real problem, not a technicality.

Safe sources, all free for commercial use with no attribution required:

- [Unsplash](https://unsplash.com) · [Pexels](https://pexels.com) · [Openverse](https://openverse.org)
  (filter to CC0 / "modification allowed")

Two rules beyond licensing, both from `SPEC.md` §7 and both load-bearing for the ethics slide:

1. **No identifiable real people**, unless the licence explicitly covers a model release. Crowds from
   behind, hands, objects and places are fine; a recognisable face attached to a fabricated headline
   is not.
2. **No real, identifiable events.** The whole scenario is fictional — Riverton and Eastvale do not
   exist. A photo of a genuine named disaster or protest, captioned with an invented claim about an
   invented town, is exactly the harm this app is teaching students to recognise.

Generic, unremarkable, unbranded imagery is both the safest and the most pedagogically useful: the
point is that the picture never proves anything. The caption does.
