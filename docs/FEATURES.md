# Features

What each screen does, in the order a learner hits them. Section numbers reference `SPEC.md`, the build spec this app was built from.

## Global chrome

- **Navbar** — persistent header on the "product" screens (Phase 1, Phase 2, Profile). Shows a phase breadcrumb (Detect / Campaign / Reveal), a contextual **back button** (only where going back can't corrupt recorded data — currently: Phase 2's composer step back to setup), and a **profile avatar** that jumps straight to the Profile screen once round one is finished. The avatar is disabled mid-round so you can't strand an in-progress round.
- Intro and Phase 3 intentionally have **no chrome** — Intro is a cold open, and Phase 3 is meant to read as a printed verdict, not an app screen (§3).
- Background color transitions (0.6s) between phases instead of hard-cutting, so the tonal shift from "ordinary feed" → "friendly SaaS tool" → "printed report" is felt.

## Phase 1 — Detect (round 1 and round 2)

- A feed of 5 posts per round (3 fake, 2 genuine), swipeable left (flag) / right (trust) via pointer events, with always-visible buttons as a fallback.
- **Decision time is logged in milliseconds** from the moment the card appears to the moment you commit — this is the data Phase 3's "decision speed" beat is built from.
- Flagging a post opens a **reason sheet** (fake source / false context / misleading numbers / emotional pull) — this is what proves you actually engaged rather than guessing.
- **Verify tools**: optional sheet showing outlet registration, first-published date, and when the image was first seen — real signal, no verdict. Opening it is itself logged (`verified: true` on the decision) and costs you time.
- Round 2 uses a **different fictional town** (Eastvale, not Riverton) with the **same four manipulation tactics**, so improvement measures tactic recognition rather than memorized answers (§7).

## Phase 2 — Campaign (Composer)

- **Audience + emotional hook selection** (parents/teens/commuters/retired × fear/outrage/belonging/pride), with a live "audience match" meter computed from a lookup table.
- **Vale**, the AI campaign strategist:
  - Opens with three headline options for your chosen hook, each with a one-line explanation of the manipulation tactic.
  - Free-text rewrite requests ("make it angrier", "add numbers", "make it look official"...) are keyword-matched against a rule set and rewrite the current headline, always stating the tactic used.
  - **Every request is logged** (`valeLog`) — this is what Phase 3 beat 3 calls back to ("You asked Vale to make it angrier. Twice.").
- **Credibility signal artifacts** (Verified tick, Breaking label, "N friends shared this", named source, engagement numbers) — drag from the palette onto the post canvas. Each one explains *why* it works when you hover/select it.
- **Credibility meter** — sum of dropped artifacts' weights, capped at 100%.
- **Launch**: computes reach as `2,400 × audience-match% × credibility% × 8`, shown on screen with its own arithmetic (not hidden), then animates a network-spread visualization on canvas. ~15% of nodes deliberately stay unreached — a post that reaches everyone would look invented.

## Profile

- Styled **identically to the fake accounts from Phase 1**, including a self-added verified tick — this mirroring is the point, not an oversight.
- Shows your published post, reach, credibility, and round 1 / round 2 accuracy side by side once both are available, plus the point delta.
- Entry point back into round 2, or forward into the Phase 3 reveal once both rounds are done.

## Phase 3 — Reveal

Seven sequenced beats, tap (or click) to advance, each with its own entrance animation:

1. **Both rounds** — a 10-cell grid of every decision, correct vs. wrong, with the accuracy delta.
2. **Decision speed** — per-post timing bars; the ones you got wrong are highlighted, with an average comparison to the ones you got right.
3. **What you asked for** — every Vale request you made, verbatim, deduplicated with counts.
4. **Signals** — which credibility signals appeared on posts that fooled you, cross-referenced against which ones you personally used when building your campaign.
5. **Side by side** — the post you trusted (or flagged) in round 1, next to the headline you published, connected by the shared emotional lever.
6. **Your vulnerability** — a named pattern (e.g. "Protective fear", "Borrowed anger", "Fear of missing out", "Flattered scepticism") derived from your chosen campaign hook, with one concrete habit that counters it.
7. **Debrief** — all 10 posts from both rounds, explained in one line each.

## Data model

Every decision, campaign choice, and Vale interaction is captured in a single Zustand store matching the shape in `SPEC.md` §4 (`Decision`, `Campaign`, `State`). Nothing is persisted outside the browser tab — refreshing resets the session, by design (§8: no database, no accounts).
