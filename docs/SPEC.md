# The Misinformation Lab — Build Specification

**Competition:** IEEE Metaverse Grand Challenge 2026
**Theme:** Advanced Learning in Educational or Classroom Environment
**Deliverable:** 5-slide PowerPoint + 5–7 min MP4. Deadline **15 August 2026**.
**Team:** 3 people. **Users:** high-school students, 14–18.

**Guiding rule:** build only what the camera needs to see. Everything else is claimed in the slides and voiceover. This is a filmed prototype, not a product.

---

## 1. Concept

A media-literacy simulation that teaches by role reversal. The learner is tested, then made complicit, then shown the connection between the two.

Not "read about fake news." **"Feel how it fools you — then watch yourself use the same trick."**

**The three findings the app produces about each learner:**
1. Their detection accuracy, before and after
2. Their decision speed on the ones they got wrong
3. The manipulation tactic they reached for when given the tools

---

## 2. Flow

```
Intro
  ↓
Phase 1 · Round 1        5 posts, swipe or buttons, ms timing logged
  ↓                       → baseline score
Interstitial             "Now you run the campaign"
  ↓
Phase 2 · Composer       audience + hook → Vale (AI) → artifacts → publish
  ↓                       → campaign + reach + vale request log
Profile                  published post + round 1 score + "take round two"
  ↓
Phase 1 · Round 2        5 different posts, same tactics
  ↓                       → after score
Phase 3 · Reveal         7 sequenced beats, tap to advance
  ↓
Profile                  before / after / delta
```

The **profile is the spine.** It is styled identically to the fake accounts from Phase 1 — including the verified tick the learner added themselves. That mirroring is deliberate and must not be softened.

---

## 3. Visual system

Three phases, three different kinds of software. This is the core design decision.

| | Phase 1 | Phase 2 | Phase 3 |
|---|---|---|---|
| **Reads as** | ordinary social feed | friendly SaaS dashboard | printed report |
| **Why** | must be boring enough to fool them | real influence ops run on cheerful ad tools, not hacker terminals | remove the interface; this is a verdict |
| **Font** | `system-ui` | Space Grotesk | Newsreader (serif) |
| **Background** | `#FBFBFD` | `#F1EFF8` | `#FFFFFF` |
| **Ink** | `#16181C` | `#241A47` | `#111111` |
| **Muted** | `#65686D` | `#6F6791` | `#7A7A7A` |
| **Line** | `#E4E6EB` | `#E3DFF2` | `#E6E6E6` |
| **Accent** | `#1D6FF2` | `#4B32A8` | `#B4522A` (used 3× only) |
| **Success** | `#12A55E` | `#0F9D58` | — |

Labels everywhere in `IBM Plex Mono`, 9–10px, `letter-spacing: .13em`, uppercase.

The container background animates between phases (`transition: background .6s`). The tonal shift should be felt, not announced.

**Do not** use a dark terminal aesthetic anywhere. It signals "exercise," which destroys the Phase 1 baseline.

---

## 4. Data model

```ts
type Decision = {
  i: number            // post index
  action: 'flag' | 'trust'
  reason: string | null      // only when flagged
  ms: number                 // decision time — the key metric
  verified: boolean          // did they open verification tools
  correct: boolean
  fake: boolean
  name: string
  why: string                // debrief explanation
  signals: string[]          // credibility signals present on this post
}

type Campaign = {
  aud: 'parents' | 'teens' | 'commuters' | 'retired'
  hook: 'fear' | 'outrage' | 'belonging' | 'pride'
  head: string               // final headline
  match: number              // 0–100
}

type State = {
  round: 1 | 2
  i: number
  r1: Decision[]
  r2: Decision[]
  campaign: Campaign
  artifacts: string[]        // artifact ids dragged onto the post
  valeLog: string[]          // every rewrite intent requested
  reach: number
  cred: number
}
```

**Reach must show its arithmetic:** `2400 × match% × credibility% × 8`, displayed on screen as `2,400 × 71% match × 64% credibility`. Roughly 15% of network nodes stay grey in the animation. A post that reaches everyone looks invented.

---

## 5. Component tree

```
App                      state store, phase routing, background transition
├── Intro
├── Phase1
│   ├── FeedHeader        round label, progress dots, counter
│   ├── SwipeCard         pointer events; swipe on touch, buttons always visible
│   ├── ActionBar         Flag / Trust
│   ├── VerifyButton      opens tools, costs visible time
│   ├── ReasonSheet       4 options, only on flag
│   └── VerifySheet       facts, no verdict
├── Interstitial          reusable; white flash + one line
├── Phase2
│   ├── CampaignSetup     audience + hook selects, match meter
│   ├── PostCanvas        fixed card, artifacts positioned absolutely
│   ├── ValeChat          AI strategist — see §6
│   ├── ArtifactPalette   5 signals, drag to canvas
│   ├── CredibilityMeter
│   └── SpreadView        canvas animation + arithmetic
├── Profile               post + results + delta
└── Phase3
    └── Beat ×7           sequenced reveal, tap to advance
```

---

## 6. The AI layer — Vale

**Persona:** a campaign strategist. Calm, professional, complicit. Never enthusiastic.

**Three jobs only:**
1. Generate 3 headline options from `{audience, hook}`, each with a one-line reason
2. Rewrite the current draft on request ("make it angrier", "add numbers")
3. Write the Phase 3 vulnerability profile from the learner's actual choices

**Hard constraints in the system prompt:**
- Only rewrites the *current draft* inside the fictional Riverton/Eastvale scenario
- Always states the tactic used — this is both the pedagogy and the ethics boundary
- Never references real people, real events, or real organisations
- Refuses anything outside the scenario

**Every request is logged to `valeLog` and surfaced in Phase 3 beat 3:** *"You asked Vale to make it angrier. Twice."* The transcript is evidence, not a feature. This is what makes the chat structural rather than decorative.

**Model:** Gemini Flash. Two calls per session, so rate limits are irrelevant and writing quality wins. Key stays in a serverless function, never the bundle.

**Cache the demo path.** Run the flow the night before filming, save responses to JSON, serve from cache on network failure. The video must never wait on an API call.

---

## 7. Content rules

**The nine/ten posts are the foundation.** Everything else — Vale's rules, Phase 3's callbacks, the debrief — depends on them.

- All sources, towns, people and events are **fictional**
- Imagery is **illustrated or abstract**, never photoreal
- Each round: **3 fake, 2 genuine**
- The genuine posts are the hardest to write. They must be plausible enough to flag wrongly — that's where false-positive data comes from. Make them dull and checkable.
- Round 2 uses the **same tactics with different content** (Riverton → Eastvale), so improvement measures tactic recognition rather than memory

**Tactics covered:** fake source · false context · misleading numbers · emotional manipulation

**No image generation.** The composer supplies a curated illustrated set; learners write captions. Same illustration, two captions, two different claims — that *is* the false-context lesson, and nothing produced can pass as a photograph of a real person or event. State this on the ethics slide: *"a manipulation sandbox that cannot produce a usable fake."*

---

## 8. Tech stack

- **Vite + React** — the app is entirely client-side (pointer events, canvas, drag). Next.js App Router would mean `"use client"` on nearly every file and hydration friction on the drag layer. Use Next only if the team already knows it.
- **State:** Zustand, or `useState` in App. The state is small.
- **CSS variables per phase**, swapped by a wrapper class. No Tailwind, no component library.
- **One serverless function** (`/api/vale`) to hide the Gemini key. That is the entire backend.
- **No database.** Session state in memory; export results as a downloadable JSON at the end of each session. For eight testers, collect eight files and put them in a spreadsheet.
- **Deploy:** Vercel or Netlify free tier.

**Skip entirely:** auth, accounts, RAG, vector DB, ORM, Postgres, image upload, layers, undo.

---

## 9. Build order

**Phase 3 first.** It is the shot the video ends on and the one thing that must not be rushed. Then Phase 1, then Phase 2. If time runs out, Phase 2 becomes a slide.

| Days | Task |
|---|---|
| Jul 29–31 | Write the 10 posts. Lock which are real. **Gates everything.** |
| Aug 1–3 | Phase 3 built and beautiful |
| Aug 4–6 | Phase 1 + timing + rounds |
| Aug 7–8 | Phase 2 + Vale + artifacts |
| **Aug 9–10** | **Test on 8 people. Before/after score.** |
| Aug 11–12 | Slides, built around the number |
| Aug 13–14 | Film and edit |
| Aug 15 | Buffer, submit |

---

## 10. The five slides

1. **Problem** — only 11% of 11–17s reliably tell real from fake; misinformation is WEF's #1 short-term global risk
2. **How it works** — three phases, one image
3. **The reveal** — the Phase 3 screen, full bleed
4. **Results** — before/after from the 8 testers ← *this is the slide that wins it*
5. **Access + ethics** — runs in any browser, no headset, classroom-ready; cannot generate a usable fake

Slide 4 is why the Aug 9–10 test round is non-negotiable. Every competitor poster that placed in 2025 led with a measured number.

---

## 11. Reference implementations

Working prototypes, all single-file HTML, no build step:

| File | Covers |
|---|---|
| `misinformation-lab-full-flow-v2.html` | **the whole flow — use this as the primary spec** |
| `phase1-swipe-prototype.html` | swipe mechanics, timing capture |
| `phase2-artifact-composer.html` | artifact drag, credibility meter |
| `phase2-composer-properties.html` | properties panel, tabbed tools |
| `phase2-vale-chat.html` | Vale chat, request logging |
| `phase3-reveal-prototype.html` | sequenced beats |
| `misinformation-lab-ui-direction.html` | visual system, all three phases |

Port the v2 flow to React. The prototypes are the specification — read them rather than reimplementing from this document alone.

---

## 12. First task for Cowork

> Port `misinformation-lab-full-flow-v2.html` to Vite + React. One component per phase per §5. Shared state in a Zustand store matching §4. Keep the exact visual tokens from §3. Expand each round from 5 posts to 5 (round 1) + 5 (round 2) using the content rules in §7. Add `/api/vale` as a serverless function calling Gemini Flash with the constraints in §6, with a cached-response fallback.
