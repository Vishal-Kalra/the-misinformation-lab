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
  store.js               Zustand store — round/decisions/campaign/artifacts/vale log/reach
  data/posts.js           All fixed content: R1/R2 post arrays, artifact defs, Vale's
                          headline options and rewrite rules, audience-match table
  services/valeService.js Vale's response logic, isolated behind getValeResponse()
  components/
    Navbar.jsx
    Intro.jsx / Interstitial.jsx / Profile.jsx
    phase1/*               FeedHeader, SwipeCard, ActionBar, VerifyButton, ReasonSheet, VerifySheet
    phase2/*               CampaignSetup, PostCanvas, ValeChat, ArtifactPalette, CredibilityMeter, SpreadView
    phase3/*               Phase3.jsx renders all 7 beats inline (each beat is a small
                            local component in the same file — they're one-off, not reused)
  styles/
    global.css             Shell layout, focus states, resets
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

`store.js` adds a couple of UI-orchestration fields on top (`phase`, `composerStep`, `topArtifact`) that aren't part of the pedagogical data model but are needed to drive routing and the navbar's back button.

## Vale — architecture for a future live API

`getValeResponse()` and friends in `src/services/valeService.js` are the **only** place that knows how Vale's responses are produced. Right now that's a keyword-matched rule table ported from the reference prototypes. When a Gemini key exists:

1. Add a serverless function (`/api/vale`) that calls Gemini Flash with the constraints from `SPEC.md` §6 (only rewrites the current draft, always states the tactic, never references real people/orgs, refuses off-scenario requests).
2. Replace the body of `getValeResponse()` with a `fetch('/api/vale', ...)` call.
3. Cache the demo path — run the flow once, save responses to JSON, fall back to that cache on network failure so a filmed demo never waits on an API call (§6).

No component should need to change — they only ever call `getValeResponse()` / `getOpeningOptions()` / `getAudienceMatch()`.

## What's deliberately not here

Auth, accounts, a database, image upload/generation, layers, undo — all explicitly out of scope per `SPEC.md` §8. This is a filmed prototype: "build only what the camera needs to see."
