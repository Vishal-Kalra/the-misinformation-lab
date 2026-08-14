# Tech stack & architecture

## Why these choices

**Vite + React, no Next.js.** The app is entirely client-side — pointer-driven swipe, canvas drag, canvas-drawn network animation. Next's App Router would mean `"use client"` on nearly every file for no benefit, plus hydration friction on the drag layer. There's no server-rendered content that would benefit from Next, so it would add ceremony without adding capability.

**Zustand, not Redux/Context.** The state is genuinely small (see `src/store.js`) — a handful of arrays and a couple of nested objects. Zustand gives a single store with no providers, no boilerplate, and selector-based subscriptions so components only re-render when the slice they read changes.

**Plain CSS with custom properties, no Tailwind, no component library.** The three phases are deliberately three different visual languages (see below) — a utility framework would fight that rather than help it. One stylesheet per phase keeps each phase's design tokens colocated and easy to audit against the spec.

**No TypeScript.** The data model is small and stable (documented once in `SPEC.md` §4 and mirrored in JSDoc-style comments in `store.js`); the team tradeoff was shipping speed for a filmed prototype over type safety for a codebase expected to grow indefinitely.

## Structure

```
src/
  App.jsx                Top-level phase router + background-transition orchestration
  store.js               Zustand store — round/r1/r2/campaign/artifacts/vale log/reach,
                          plus drawRound() (the 3-fake/2-genuine stratified draw)
  data/posts.js           All fixed content: R1/R2 post arrays, artifact defs, Vale's
                          headline options, rewrite rules, refusal triggers and suggested
                          prompts, audience-match table, the SCENES image set
  services/
    valeService.js         Vale's response logic, isolated behind getValeResponse()
    communityPool.js        localStorage-backed pool of published posts (feeds round 2 only)
    exportSession.js         Per-tester JSON export — the before/after record (§8)
  assets/images/scenes/    The 10 generated post illustrations (see below)
  components/
    Navbar.jsx
    Intro.jsx / Interstitial.jsx / Profile.jsx
    phase1/*               FeedHeader, SwipeCard, ActionBar, VerifyButton, VerifySheet
    phase2/*               CampaignSetup, PostCanvas, ValeChat, ArtifactPalette,
                            PropertiesPanel, CredibilityMeter, SpreadView, ImagePicker
    phase3/*               Phase3.jsx renders all 7 beats inline (each beat is a small
                            local component in the same file — they're one-off, not reused)
  styles/
    global.css             Shell layout, focus states, sr-only, resets
    navbar.css              Global chrome (phase-agnostic on purpose)
    intro.css                Intro + Interstitial
    phase1.css                Phase 1 feed + Profile (they share the same visual language)
    phase2.css                 Phase 2 composer/dashboard
    phase3.css                  Phase 3 report
```

## The three visual systems (§3)

| | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| Reads as | ordinary social feed | friendly SaaS dashboard | printed report |
| Font | `system-ui` | Space Grotesk | Newsreader (serif) |
| Why | must be boring enough to fool you | real influence ops run on cheerful ad tools, not hacker terminals | remove the interface; this is a verdict |

Each phase's CSS file owns its own custom-property tokens (background/ink/muted/line/accent). `App.jsx` swaps `#app`'s `background` with a 0.6s transition when the phase changes, so the tonal shift is felt rather than hard-cut. Labels everywhere use IBM Plex Mono, uppercase, wide letter-spacing — the one constant across all three languages.

The navbar deliberately does **not** follow this per-phase palette — it's global product chrome (dark, neutral, always the same), wrapped around three screens that otherwise look like different products. That consistency is what makes the three phases read as one app rather than three demos stapled together.

## State model

Mirrors `SPEC.md` §4 exactly:

```ts
type Decision = {
  i: number; action: 'flag' | 'trust'; reason: string | null; ms: number;
  verified: boolean; correct: boolean; fake: boolean; name: string;
  why: string; signals: string[];
}
type Campaign = { aud: string; hook: string; head: string; match: number }
type State = {
  round: 1 | 2; i: number; r1: Decision[]; r2: Decision[];
  campaign: Campaign; artifacts: string[]; valeLog: string[];
  reach: number; cred: number;
}
```

`store.js` adds a couple of UI-orchestration fields on top (`phase`, `composerStep`, `topArtifact`, `placedArtifacts`, `startedAt`) that aren't part of the pedagogical data model but are needed to drive routing, the navbar's back button, the canvas, and the session export.

### Why the round split is load-bearing

`r1` and `r2` are not a convenience. SPEC.md §1 names three findings the app produces about a learner, and the first is *detection accuracy, before and after* — which is also slide 4 of the deck, the one §10 calls "the slide that wins it." Two things protect that number:

1. **Round 1 never draws from the community pool.** It's the fixed Riverton set every time, so eight testers' baselines are comparable to each other.
2. **Every round is stratified 3 fake / 2 genuine** (`drawRound()`). Pool posts are all fake by construction, so they may only displace fake slots — otherwise a learner could draw an all-fake feed and produce no false-positive data at all.

A single-round variant of this app existed briefly and could not produce the before/after finding. If the rounds are ever collapsed again, the results slide goes with them.

## Vale — a constrained rule engine, and the architecture for a future live API

`getValeResponse()` and friends in `src/services/valeService.js` are the **only** place that knows how Vale's responses are produced. Right now that's a keyword-matched rule table (`RULES` in `data/posts.js`) covering eleven rewrite intents, each of which names the tactic it used — that naming is both the pedagogy and the ethics boundary of §6.

`REFUSALS` implements the other half of §6: Vale declines anything naming a real person, organisation or event, or anything off-scenario entirely. Refusals are checked **before** the rewrite rules, because several refusal triggers contain words the rewrite rules also match on ("make it look real" vs. "write this about a real politician") — checking rules first would let the second one comply. A refusal returns `matched: false`, so it isn't written to `valeLog`: refusing isn't a manipulation the learner asked for, and it shouldn't appear in Phase 3's transcript as if it were.

`VALE_SUGGESTIONS` drives the prompt chips under the chat input. They exist because "type something to the AI" with no examples is the point where first-time users stall.

When a Gemini key exists:

1. Add a serverless function (`/api/vale`) that calls Gemini Flash with the constraints from `SPEC.md` §6 (only rewrites the current draft, always states the tactic, never references real people/orgs, refuses off-scenario requests).
2. Replace the body of `getValeResponse()` with a `fetch('/api/vale', ...)` call.
3. Cache the demo path — run the flow once, save responses to JSON, fall back to that cache on network failure so a filmed demo never waits on an API call (§6).

No component should need to change — they only ever call `getValeResponse()` / `getOpeningOptions()` / `getAudienceMatch()`.

## The community pool and image upload

A teammate built a separate prototype ("Live Scan") with a Phase 2 tool that let learners upload photos and submit posts to a shared feed backed by `window.storage` — an API that only exists inside Claude's own Artifacts sandbox, not a real browser. Both features were folded in, with changes.

- **The shared pool** (`src/services/communityPool.js`) doesn't call any backend — `window.storage` was replaced with `localStorage`, scoped to a single browser. Publishing in Phase 2 *is* submitting to the pool; there's no separate contribute step. Posts reappear mixed into **that same browser's next Round 2** (`store.js`'s `startRoundTwo()`), and only into its three fake slots. Round 1 is never touched by the pool — see above. A real cross-user shared feed would need an actual database, which §8 rules out; if the team wants that later, it's a real scope increase, not a tweak.
- **Image upload is enabled**, against `SPEC.md` §8's scope line and at the team's explicit request. `ImagePicker.jsx` offers three routes to a picture: the ten curated illustrations in `SCENES`, a keyword match against the current headline, or the learner's own photo (downscaled to 720px and re-encoded as JPEG in a canvas, so nothing large ends up in memory or `localStorage`; it is never transmitted).

  The consequence is worth stating plainly, because it changes how the project must be described: with upload on, the app **can** produce an artifact that would pass as evidence outside the exercise, so §7's line *"a manipulation sandbox that cannot produce a usable fake"* is no longer true and must not be used. The defensible claim is that it cannot be *aimed* at anything real — invented scenario, an AI that refuses every real name, and no network egress of any kind. See `docs/FEATURES.md` for the wording to reuse.

## What's deliberately not here

Auth, accounts, a real (cross-user) database, image generation, layers, undo — all explicitly out of scope per `SPEC.md` §8. This is a filmed prototype: "build only what the camera needs to see."

## The post image set

`src/assets/images/scenes/` holds ten SVGs referenced by `SCENES` in `data/posts.js`. They serve
double duty: the Phase 1 post cards and the composer's picker gallery both draw from the same set,
so a learner recognises the vocabulary of the feed while building their own post.

They are generated rather than drawn by hand, and built like photographs rather than diagrams:

- **three depth planes**, with the far plane gaussian-blurred (`filter="url(#far)"`) for depth of field
- **a directional key light** plus a matching warm/cool grade applied identically to all ten, so they
  read as one camera rather than ten clip-art tiles
- **atmospheric haze** that lightens with distance, a **vignette**, and **film grain** over the frame

That effort is not decorative. A flat vector scene reads as a wireframe placeholder on a social card,
and the whole of Phase 1 depends on the learner believing the post enough to be fooled by it.

Constraints that hold regardless: no real place, no identifiable face, nothing photoreal enough to be
mistaken for documentary evidence of a specific event. `chart.svg` is deliberately used **twice** —
once per round, under two unrelated fabricated claims — which is §7's false-context lesson stated in
the content itself rather than in a caption.

To change them, edit and re-run the generator (kept outside the repo; it writes straight into
`src/assets/images/scenes/`). Nothing at runtime depends on how they were produced — the app only
imports the `.svg` files.

### Replacing them with photographs

`data/posts.js` globs `src/assets/images/photos/*.{jpg,jpeg,png,webp}` with `import.meta.glob(...,
{ eager: true })`, so any file dropped in that folder joins `SCENES` at build time with no code
change. The filename supplies both the label and the keyword list, and photos sort ahead of drawn
scenes in the picker.

A photo named after a drawn scene's id **replaces** it: `pick(id)` prefers `photo-<id>` over `<id>`,
so `reservoir.jpg` swaps out the drawing in every fixed post that referenced it. When the folder is
empty everything falls back to the SVGs, so the app works either way.

This exists because the drawn scenes are a floor rather than a ceiling — vector art cannot reach
photographic realism, and Phase 1 only functions if the learner believes the post. Content and
licensing constraints (no identifiable people, no real events, redistributable licence only) are
documented in `src/assets/images/photos/README.md`.

## Layout invariants (read before touching the shell CSS)

Two rules in `global.css` are load-bearing and were both the cause of a real "the page won't scroll"
bug. Neither is obvious from reading the declaration:

1. **`#app` uses `overflow-x: clip`, never `hidden`.** Per CSS spec, setting *either* axis to a
   non-`visible` value forces the *other* axis to compute to `auto`. With `overflow-x: hidden`, `#app`
   silently became a scroll container clipped to `min-height: 100vh`, so any screen taller than the
   viewport could not be scrolled. `clip` constrains x without touching y.

2. **`.scr` uses `flex: 1 0 auto`, never `flex: 1`.** The `flex: 1` shorthand sets `flex-basis: 0`,
   which forces every screen to exactly the container height regardless of content. Combined with
   `justify-content: center` on the intro, content taller than the viewport then overflowed in *both*
   directions — and the overflow above the top edge is unreachable by scrolling. An `auto` basis makes
   each screen at least its content height, growing only to fill leftover space.

Related: overlays that cover a whole screen (`.sheet`, `.inter`, `#spread`, `.img-picker-overlay`) are
all `position: fixed`. As `absolute` children they were anchored to a document box that can exceed the
viewport, which put their centred content off-screen — the same failure in four places.

## Accessibility — audited, not asserted

Accessibility is 10% of the competition's judging criteria and the deck claims it explicitly, so it is
verified rather than assumed. An axe-core pass over all fourteen screens (seven app screens plus the
seven Phase 3 beats), restricted to `wcag2a / wcag2aa / wcag21a / wcag21aa`, reports **zero
violations**.

Things worth not regressing:

- **`role="button"` on a container is a trap.** Phase 3 briefly had `role="button"` + `tabIndex` on the
  whole section to make click-to-advance keyboard-operable. That section contains the Back/Next
  controls, and a button role with focusable descendants is invalid (`nested-interactive`). Those
  buttons plus the document key handler already provide the keyboard path; the container needs no role.
- **A styled `<span>` is not a label.** Both Phase 2 selects were announced as unnamed combo boxes,
  on the screen where the entire campaign is configured. They use `<label for>` now.
- **Opacity is not a colour.** The flag/trust hover sub-labels were dimmed with `opacity: .75`, which
  put them at 3.2:1. Anything that must clear a contrast floor needs an explicit colour.
- **A `<button>` with no `background` inherits the UA grey.** The debrief reflection chips rendered in
  Chrome's default `#efefef`, which both looked wrong and failed contrast.

To re-run: serve the app, then drive it with Playwright injecting `axe-core` at each screen. The
scripts used are not committed — the check takes a few minutes to reconstruct and is worth repeating
before submission rather than trusting this note.
