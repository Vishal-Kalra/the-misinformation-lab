# The Misinformation Lab

A media-literacy simulation built for the **IEEE Metaverse Grand Challenge 2026**. It teaches by role reversal: the learner is tested on spotting fake posts, then made complicit by running their own misinformation campaign, then shown the connection between the two.

> "Feel how it fools you — then watch yourself use the same trick."

Runs in any browser, no headset, no login, no account. Entirely client-side — 88 KB gzipped of code and styles, plus ~1.5 MB of photography. Built with Vite + React + Zustand.

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

There is no test suite, database, or backend to configure — the whole app is client-side and session state lives in memory (it resets on refresh). The one thing that does persist is the community pool in `localStorage`; "Reset for next tester" on the Profile screen clears it.

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

See [`docs/FEATURES.md`](docs/FEATURES.md) for what each screen actually does, [`docs/TECH_STACK.md`](docs/TECH_STACK.md) for how it's built and why, [`docs/ETHICS.md`](docs/ETHICS.md) for the ethics and AI-governance position, [`docs/VIDEO_SCRIPT.md`](docs/VIDEO_SCRIPT.md) for the submission video, and [`docs/SPEC.md`](docs/SPEC.md) for the original build spec.

---

## Project structure

```
src/
  App.jsx                 Phase routing, background transitions, navbar wiring
  store.js                Zustand store — the single source of truth for session state
  data/posts.js           All fixed content: the two 5-post rounds, credibility artifacts,
                          Vale's headlines / rewrite rules / refusal triggers, the scene set
  services/
    valeService.js         Vale's rule-based "AI" — see note below
    communityPool.js       localStorage pool of published posts (feeds round 2 only)
    exportSession.js       Per-tester JSON export — the before/after record
  assets/images/scenes/    10 illustrated post images, generated as SVG (see below)
  components/
    Navbar.jsx             Persistent header: brand, phase breadcrumb, back, profile avatar
    Intro.jsx, Interstitial.jsx, Profile.jsx
    phase1/                Feed, swipe card, action bar, verify button + sheet
    phase2/                Campaign setup, post canvas, Vale chat, artifact palette,
                           properties panel, credibility meter, image picker, spread view
    phase3/                The 7 reveal beats
  styles/                  One CSS file per phase (distinct fonts/colors), plus global + navbar
```

## Tech stack (short version)

- **Vite + React 19** — client-only, no server, no `"use client"` friction
- **Zustand** — one small store, no boilerplate
- **Plain CSS with custom properties** — one stylesheet per phase, swapped tokens instead of a component library
- No TypeScript, no Tailwind, no backend, no database
- Keyboard-complete on every screen, with live-region announcements and `prefers-reduced-motion` honoured throughout

Full rationale in [`docs/TECH_STACK.md`](docs/TECH_STACK.md).

## Vale is a constrained rule engine, not a live model

Vale ("the campaign strategist") is fully functional but **rule-based, not a live model call** — no API key is wired up. It covers eleven rewrite intents, always names the manipulation tactic it used, and **refuses** anything naming a real person, organisation or event, or anything outside the fictional Riverton scenario (`SPEC.md` §6). Suggested prompt chips under the input mean a learner never has to guess what to type.

It all lives behind one function, `getValeResponse()` in `src/services/valeService.js`, so swapping in a real Gemini Flash call later means editing that one file, not the components that use it. There's a `TODO(vale-api)` comment there marking exactly what to change.

## The post images

The ten scenes in `src/assets/images/scenes/` are generated SVGs, not stock photography. They're
built like photographs rather than diagrams — three depth planes with the far plane gaussian-blurred,
a directional key light, atmospheric haze, a vignette and film grain, sharing one colour grade so
they read as one camera. A flat vector scene looks like a wireframe placeholder on a social card,
and the learner has to believe the post before it can fool them.

None of them depicts a real place and none contains an identifiable face. Note that `chart.svg` is
used **twice** — once in each round, under two different fabricated claims. That reuse is the
false-context lesson stated directly (§7): the picture never proves anything, the caption does.

**Ten real photographs ship in `src/assets/images/photos/`** and override the drawings automatically —
that's what the app actually displays. They're Unsplash images under the
[Unsplash License](https://unsplash.com/license) (free commercial use, no attribution required),
credited in [`CREDITS.md`](src/assets/images/photos/CREDITS.md). Premium/Unsplash+ results are
excluded deliberately: they serve watermarked previews.

To swap any of them, drop a replacement into that folder — anything named after a scene id
(`reservoir.jpg`, `townhall.jpg`, …) is picked up automatically with no code change. Content rules
that matter for the ethics claim (no identifiable faces, no real identifiable events) are in
[`src/assets/images/photos/README.md`](src/assets/images/photos/README.md).

Learners can also attach their own photo in the composer, which is processed on-device (downscaled
to 720px, re-encoded as JPEG) and never transmitted.

## Deploying

Static build, deploys anywhere that serves static files — Vercel and Netlify both work with zero config (`npm run build`, publish `dist/`).

## Not included (by design)

Per the build spec, this is a filmed prototype, not a product: no auth, no accounts, no database, no server, no undo, no test suite.

**On the ethics claim:** because photo upload is enabled, the app *can* produce a convincing fake — that is deliberate, since pairing a real image with a false claim is the most common real-world tactic and doing it once teaches it faster than reading about it. So do not describe this as "a sandbox that cannot produce a usable fake" (`SPEC.md` §7's original wording, true only while upload was disabled). The accurate claim is that it **cannot be aimed at anything real**: the scenario is wholly invented, Vale refuses every real name, and nothing leaves the browser. See [`docs/FEATURES.md`](docs/FEATURES.md) for the wording to reuse.

Session results are exported as a JSON file per tester from the Profile screen (`src/services/exportSession.js`) rather than stored server-side — both rounds, the before/after delta, decision times, and the full Vale log. "Reset for next tester" clears session state *and* the community pool, so consecutive testers stay independent. For eight testers, collect eight files and put them in a spreadsheet.
