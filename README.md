# The Misinformation Lab

A media-literacy simulation built for the **IEEE Metaverse Grand Challenge 2026**. It teaches by role reversal: the learner is tested on spotting fake posts, then made complicit by running their own misinformation campaign, then shown the connection between the two.

> "Feel how it fools you — then watch yourself use the same trick."

Runs in any browser, no headset, no login. Built with Vite + React + Zustand.

---

## Quick start

Requires **Node.js 18+**.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Other scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve the production build locally to sanity-check it |
| `npm run lint` | Run Oxlint |

There is no test suite, database, or backend to configure — the whole app is client-side and session state lives in memory (it resets on refresh).

---

## The flow

```
Intro
  → Phase 1 · Round 1   (5 posts, swipe or buttons, decision time logged)
  → Interstitial         "Now you run the campaign"
  → Phase 2 · Composer    audience + hook → Vale (AI strategist) → credibility artifacts → publish
  → Profile               your fake post, your round 1 score, "take round two"
  → Phase 1 · Round 2    (5 new posts, same manipulation tactics, different town)
  → Phase 3 · Reveal      7-beat sequenced report: before/after accuracy, decision speed, the
                          tactic you reached for, and a named "vulnerability"
  → Profile               before / after / delta
```

See [`docs/FEATURES.md`](docs/FEATURES.md) for what each screen actually does, [`docs/TECH_STACK.md`](docs/TECH_STACK.md) for how it's built and why, and [`docs/SPEC.md`](docs/SPEC.md) for the original build spec everything above was built from.

---

## Project structure

```
src/
  App.jsx                 Phase routing, background transitions, navbar wiring
  store.js                Zustand store — the single source of truth for session state
  data/posts.js           All post content, artifacts, Vale's rewrite rules (§7 content)
  services/valeService.js Vale's rule-based "AI" — see note below
  components/
    Navbar.jsx             Persistent header: brand, phase breadcrumb, back, profile avatar
    Intro.jsx, Interstitial.jsx, Profile.jsx
    phase1/                Feed, swipe card, action bar, reason/verify sheets
    phase2/                Campaign setup, post canvas, Vale chat, artifact palette, spread view
    phase3/                The 7 reveal beats
  styles/                  One CSS file per phase (distinct fonts/colors), plus global + navbar
```

## Tech stack (short version)

- **Vite + React** — client-only, no server, no `"use client"` friction
- **Zustand** — one small store, no boilerplate
- **Plain CSS with custom properties** — one stylesheet per phase, swapped tokens instead of a component library
- No TypeScript, no Tailwind, no backend, no database

Full rationale in [`docs/TECH_STACK.md`](docs/TECH_STACK.md).

## The Vale AI is currently a stub

Vale ("the campaign strategist") is fully functional but **rule-based, not a live model call** — no API key is wired up yet. It lives behind one function, `getValeResponse()` in `src/services/valeService.js`, so swapping in a real Gemini Flash call later means editing that one file, not the components that use it. There's a `TODO(vale-api)` comment there marking exactly what to change.

## Deploying

Static build, deploys anywhere that serves static files — Vercel and Netlify both work with zero config (`npm run build`, publish `dist/`).

## Not included (by design)

Per the build spec, this is a filmed prototype, not a product: no auth, no accounts, no database, no image upload/generation, no undo. Session results are meant to be exported as JSON per tester rather than stored server-side — that export isn't wired up yet.
