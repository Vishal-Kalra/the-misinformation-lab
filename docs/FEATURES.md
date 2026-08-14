# Features

What each screen does, in the order a learner hits them. Section numbers reference `SPEC.md`, the build spec this app was built from.

## Global chrome

- **Navbar** — persistent header on the "product" screens (Phase 1, Phase 2, Profile). Shows a phase breadcrumb (Detect / Campaign / Reveal), a contextual **back button** (only where going back can't corrupt recorded data — currently: Phase 2's composer step back to setup), and a **profile avatar** that jumps straight to the Profile screen once round one is finished. The avatar is disabled mid-round so you can't strand an in-progress round.
- Intro and Phase 3 intentionally have **no chrome** — Intro is a cold open, and Phase 3 is meant to read as a printed verdict, not an app screen (§3).
- Background color transitions (0.6s) between phases instead of hard-cutting, so the tonal shift from "ordinary feed" → "friendly SaaS tool" → "printed report" is felt.
- The Intro names all three phases as numbered steps, plus the rough time cost, so Phase 2 doesn't arrive as a surprise — being asked to build propaganda unannounced is what made testers hesitate rather than play along.

## Phase 1 — Detect (round 1 and round 2)

- A feed of 5 posts per round, swipeable left (fake) / right (real) via pointer events, with always-visible buttons and **arrow-key support** (← fake, → real) as equal alternatives — the on-screen hint names all three.
- **The question is stated on screen**: a task line above the card reads "Is this post real or fabricated?". The buttons say "This is fake" / "This is real" with the matching swipe direction underneath, rather than assuming platform vocabulary like *flag* and *trust* that a 14-year-old may not share.
- Post images come from the shared illustrated scene set — see the ethics note below, and `docs/TECH_STACK.md` for how they're built.
- **Every round is exactly 3 fake / 2 genuine** (`store.js`'s `drawRound()`). The genuine posts are where false-positive data comes from (§7), so a round that happened to contain none would measure nothing.
- **Decision time is logged in milliseconds** from the moment the card appears to the moment you commit — this is the data Phase 3's "decision speed" beat is built from.
- **Verify tools**: an optional sheet showing outlet registration, first-published date, and when the image was first seen — real signal, no verdict. Opening it is itself logged (`verified: true` on the decision). The button is honest about the cost: it says the clock keeps running, rather than the old "costs you 20 seconds", which implied a penalty that was never actually applied. Esc closes it; focus is trapped while open and returned afterwards.
- Each decision is announced to screen readers via a live region, since the card flying off-screen is otherwise the only feedback.
- **Zero WCAG 2.1 AA violations**, verified with axe-core across all fourteen screens (see `docs/TECH_STACK.md`).
- **Round 1 is the fixed baseline** — always the Riverton set, never touched by the community pool. That's what makes one tester's score comparable to another's, and what the round-2 delta is measured against.
- **Round 2** uses a **different fictional town** (Eastvale) with the **same four manipulation tactics**, so improvement measures tactic recognition rather than memorized answers (§7). Posts published through Phase 2 on this browser mix into round 2 only, and only into its three fake slots.

## Phase 2 — Campaign (Composer)

- **Audience + emotional hook selection** (parents/teens/commuters/retired × fear/outrage/belonging/pride), with a live "audience match" meter computed from a lookup table. Two ways into the composer — let Vale write the first draft, or start blank — both landing in the same editor with the same tools.
- **Vale**, the AI campaign strategist:
  - Opens with three headline options for your chosen hook, each with a one-line explanation of the manipulation tactic.
  - **Suggested prompt chips** sit under the input, so building a post never requires guessing what to type.
  - Free-text rewrite requests ("make it scarier", "add numbers", "make it personal", "make people share it"…) are keyword-matched against a rule set and rewrite the current headline, **always stating the tactic used**.
  - **Refuses anything outside the scenario** (§6) — naming a real person, organisation or event, or asking for something off-scenario entirely, gets an in-character decline rather than a rewrite. Refusals are not logged as requests, because refusing isn't a manipulation the learner asked for.
  - **Every accepted request is logged** (`valeLog`) — this is what Phase 3 beat 3 calls back to.
  - A **standing disclosure** sits under the chat, permanently visible: *"Vale is an AI. It can be wrong. It argues for whatever you ask it to argue for — that's the point of it."* An app about being misled by confident text cannot present its own AI as authoritative.
- **Credibility signal artifacts** (Verified tick, Breaking label, "N friends shared this", named source, engagement numbers) — drag from the palette onto the post canvas, **or press Enter on one to place it** without a pointer. Each explains *why* it works when you hover/select it.
- **The post itself is editable in place** — headline and source are click-to-type, with a persistent dashed underline marking them as editable (hover-only cues don't exist on touch).
- **Image**: a curated set of ten illustrated scenes, a keyword match against your headline, or **your own uploaded photo** (downscaled and re-encoded on-device; it never leaves the browser). Real photographs dropped into `src/assets/images/photos/` join the same picker automatically and take precedence over the drawings. See the ethics note below.
- **Credibility meter** — sum of dropped artifacts' weights, capped at 100%. Signals are optional; 0% credibility is a legitimate outcome and itself a lesson.
- **Launch**: computes reach as `AUD_BASE × audience-match% × credibility% × SHARE_CASCADE` (2,400 and 8, both exported from `data/posts.js` so the printed arithmetic and the computed figure cannot drift). The screen spells the sum out in full — *"2,400 followers × 84% match × 36% credibility × 8 reshares each"* — because it previously omitted the cascade and so displayed a sum resolving to an eighth of the number above it. It then animates a network spread on canvas; the fraction of nodes that light up is the same `match × credibility` product, so the animation agrees with the arithmetic, and ~15% deliberately stay unreached even at full strength because a post that reaches everyone looks invented (§4).
- Publishing also saves the post to a **local community pool** (`localStorage`), which feeds a later round 2 on the same browser. There's no separate "contribute" step — publishing and submitting are one action.

### Ethics note: what this can and cannot do

The app **can** produce a convincing fake — a learner may pair their own photograph with an invented headline — and that is deliberate. Attaching a real image to a false claim is the most common real-world tactic there is, and performing it once teaches it faster than reading about it.

So the accurate claim is **not** "a sandbox that cannot produce a usable fake" (§7's original wording, which held only while upload was disabled). It is a sandbox that **cannot be aimed at anything real**:

- Every town, outlet, person and event in the scenario is invented.
- Vale refuses any real name, organisation or event, and any off-scenario request.
- Nothing is transmitted anywhere: no account, no server, no analytics. Uploaded images are processed on the learner's own device.

Anyone describing this project — deck, video, write-up — should use that second framing, not the first. The full position, including AI governance and the standing disclosure shown under Vale, is in [`ETHICS.md`](ETHICS.md).

## Profile

- Styled **identically to the fake accounts from Phase 1**, including a self-added verified tick — this mirroring is the point, not an oversight.
- Shows your published post, reach, and credibility, alongside **round 1 (before) and round 2 (after) accuracy with the point delta** — the single number the results slide is built from.
- Entry point into round 2, forward into the Phase 3 reveal, and — once the reveal is done — **session export** and **reset for next tester**.
- **Session export** writes a JSON file per tester: both rounds' decisions, before/after/delta, decision times split by correct vs. wrong, campaign, Vale log, artifacts, reach, credibility (`services/exportSession.js`). §8 rules out a database, so eight testers means eight files and a spreadsheet.
- **Reset for next tester** clears the community pool as well as session state, so consecutive testers stay independent.

## Phase 3 — Reveal

Seven sequenced beats, each with its own entrance animation, and explicit **Back / Next** buttons — clicking anywhere still advances, but that was previously the *only* way forward and nothing said so, which could strand a first-timer on beat one. Enter / → also advance and ← steps back, so overshooting doesn't cost you the vulnerability beat. A "3 of 7" counter sits beside the beat label.

Each beat that uses colour to carry meaning now ships a legend — the red cells, the red timing bars and the filled signal chips previously encoded correct/incorrect and used/unused with nothing explaining either.

1. **Both rounds** — the two 5-cell grids side by side, each round's accuracy, and the delta between them. Every count on this screen derives from the actual decision arrays rather than being spelled out in the copy, so the wording can't drift from the data.
2. **Decision speed** — per-post timing bars across both rounds; the ones you got wrong are highlighted, with an average comparison to the ones you got right.
3. **What you asked for** — every Vale request you made, verbatim, deduplicated with counts.
4. **Signals** — which credibility signals appeared on posts that fooled you, cross-referenced against which ones you personally used when building your campaign.
5. **Side by side** — the post you trusted (or flagged), next to the headline you published, connected by the shared emotional lever.
6. **Your vulnerability** — a named pattern (e.g. "Protective fear", "Borrowed anger", "Fear of missing out", "Flattered scepticism") derived from your chosen campaign hook, with one concrete habit that counters it.
7. **Debrief** — all 10 posts from both rounds, explained in one line each, with an optional "in hindsight, why did you flag it?" reflection on the ones you flagged.

## Data model

Every decision, campaign choice, and Vale interaction is captured in a single Zustand store matching the shape in `SPEC.md` §4 (`Decision`, `Campaign`, `State`) — including the `round` / `r1` / `r2` split the before/after finding depends on. Nothing is persisted outside the browser tab except the community pool; refreshing resets the session, by design (§8: no database, no accounts).
