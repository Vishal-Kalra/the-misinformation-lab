# tools

One-off generators. Nothing here runs at build time or ships to the browser — the app only ever
imports the files these produce. They live in the repo so the deck and the artwork are reproducible
rather than being artefacts nobody can regenerate.

Each writes straight into the repo. Run them from anywhere; paths are absolute inside the scripts.

```bash
pip3 install --user python-pptx pillow
```

| Script | Produces | When to run it |
|---|---|---|
| `build_deck.py` | `docs/The-Misinformation-Lab-IEEE-2026.pptx` | Any time the deck's wording or figures change |
| `fetch_photos.py` | `src/assets/images/photos/*.jpg` + `CREDITS.md` | To re-source the ten post photographs |
| `generate_scenes.py` | `src/assets/images/scenes/*.svg` | To change the fallback illustrations |

## `build_deck.py`

Five slides, at the competition's maximum. Uses the app's own design tokens (`SPEC.md` §3) rather than
a template, so the deck and the product read as one thing.

**Slide 4 ships with placeholder dashes on purpose.** The before/after numbers must come from a real
tester run; the script will not invent them. There's a marked bar on the slide and a note in the
speaker notes — replace the dashes and delete the bar before submitting.

If you edit the deck by hand in PowerPoint, stop using this script, or re-running it will discard your
edits.

## `fetch_photos.py`

Searches Unsplash and downloads one landscape photograph per scene id, resized to 1200px and
re-encoded, then writes `CREDITS.md`.

Two filters matter and should not be removed:

- **Premium / Unsplash+ results are excluded.** They serve previews with a watermark tiled across the
  image, which is nearly invisible at thumbnail size and unusable in a submission.
- **Results whose description foregrounds an individual are skipped.** A recognisable face under a
  fabricated headline is the exact harm this app teaches students to spot (`SPEC.md` §7). The filter is
  a keyword heuristic on the alt text, not face detection — **look at what it downloaded** before
  committing.

Re-running overwrites all ten. Anything you hand-picked will be replaced.

## `generate_scenes.py`

Builds the ten SVG scenes used when no photograph is present for a given id. They're composed like
photographs — depth-of-field planes, a key light, vignette, grain — because a flat vector scene reads
as a placeholder on a social card, and Phase 1 only works if the learner believes the post.
