# Ethics and governance

This app teaches manipulation by having students perform it, and its AI writes propaganda on request.
That is a deliberate design, and it needs a stated position rather than a disclaimer. This is the
document to quote from in the deck, the video, and any conversation with a teacher.

## The claim we make, and the one we don't

**We do not claim** this is "a sandbox that cannot produce a usable fake." That was true only while
photo upload was disabled. A student can attach a real photograph to an invented headline, and the
result would pass as a real post outside the exercise.

**We claim instead: it cannot be aimed at anything real.** Three constraints hold that up, and all
three are in the code rather than in a policy document.

| Constraint | Where it lives | What it prevents |
|---|---|---|
| The scenario is wholly invented | `src/data/posts.js` | No claim made here refers to a real place, outlet, person or event. Riverton and Eastvale do not exist. |
| The AI refuses real subjects | `REFUSALS` in `data/posts.js`, enforced in `valeService.js` | Naming a real person, organisation or event — or asking for something off-scenario entirely — is declined in character, before the rewrite rules are even consulted. |
| Nothing leaves the device | no backend exists | No account, no server, no analytics, no telemetry. Uploaded images are downscaled and re-encoded in a canvas and never transmitted. |

## Why the manipulation is the lesson

Pairing a real image with a false claim is the most common real-world tactic there is. A student who
has done it once — chosen the audience, picked the emotional lever, watched the reach number climb —
recognises it faster than a student who has been warned about it. Removing the capability would make
the app safer and materially less effective.

The safeguard is not that the tool is weak. It is that the tool has no target: every output is about
an invented town, and the reveal ends by naming the tactic the student just used on themselves.

## AI governance

Vale is a **constrained rule engine**, not a live model. Eleven rewrite intents, each permanently
paired with the tactic it demonstrates. There is no API key, no network call, and no path by which its
output can drift.

Three properties are load-bearing, and none should be traded away for fluency:

1. **It always names its own tactic.** An AI that produced manipulation silently would be a
   manipulation generator. Stating the technique is what converts the output into teaching.
2. **It refuses before it complies.** Refusal triggers are matched *ahead* of the rewrite rules,
   because several of them share keywords ("make it look real" versus "write this about a real
   politician"). Checking rules first would let the second one through.
3. **Refusals are not logged as requests.** `valeLog` feeds the Phase 3 transcript that is shown back
   to the student as evidence of what they asked for. Refusing is not something they asked for, and
   including it would misrepresent them to themselves.

**Determinism is a feature here, not a limitation.** Every student in a classroom gets the same lesson
from the same prompt, a teacher can predict what the tool will say before the lesson runs, and nothing
can generate something unanticipated in front of a fourteen-year-old.

### The disclosure

Under the chat, permanently visible and not dismissible:

> **Vale is an AI. It can be wrong.** It argues for whatever you ask it to argue for — that's the
> point of it. Everything it writes here is invented, about a town that doesn't exist. Treat anything
> a system like this tells you the same way.

An application whose subject is being misled by confident text cannot present its own AI as
authoritative. The warning is worded to invite scepticism about *Vale specifically*, not about AI in
the abstract, because the abstract version is the one people have learned to ignore.

**If a live model is ever wired in** (`TODO(vale-api)` in `valeService.js`), these constraints must be
enforced server-side in the system prompt and *also* retained as a client-side filter. A model that
can be talked out of its instructions is not a safeguard.

## Data and privacy

- No accounts, no login, no personal data collected, no third-party scripts, no analytics.
- Session state lives in memory and is destroyed on refresh.
- The only persistence is a `localStorage` pool of posts students published, used to seed a later
  round two on the same browser. "Reset for next tester" clears it.
- The session export is a file the user downloads. It is never uploaded, and it contains no
  identifying information — decisions, timings, and choices only.

## Content constraints

- Every town, outlet, person and event is invented.
- Post imagery is openly licensed (see `src/assets/images/photos/CREDITS.md`) and deliberately
  excludes identifiable faces and real identifiable events. A recognisable person under a fabricated
  headline is the precise harm this app teaches students to spot.
- The same chart image appears in both rounds under two unrelated fabricated claims. That reuse is
  intentional: it is the false-context lesson stated in the content itself.

## Accessibility

Audited, not asserted: zero WCAG 2.1 A/AA violations across all fourteen screens, verified with
axe-core. Every screen is keyboard-operable, decisions are announced to screen readers via a live
region, and `prefers-reduced-motion` is honoured throughout. See `docs/TECH_STACK.md` for the specific
traps worth not regressing.

## Classroom use

Intended for ages 14–18 with a teacher present. A session takes about ten minutes and ends with a
debrief naming every post and why it worked. The reveal is designed to land as a finding about the
student's own reflexes, not as a score — which is why Phase 3 has no pass mark and no leaderboard.

The one thing a teacher should say out loud afterwards: the tactics work on adults too, and knowing
their names is not the same as being immune to them.
