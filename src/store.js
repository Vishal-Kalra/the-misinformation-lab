import { create } from "zustand";
import { R1, R2, DEFAULT_POST_IMAGE } from "./data/posts";
import { getPool } from "./services/communityPool";

// State shape — SPEC.md §4. Two rounds, because the before/after delta is the
// finding the whole app exists to produce:
// Decision { i, action, reason, ms, verified, correct, fake, name, why, signals }
// Campaign { aud, hook, head, match }
// State { round, i, r1, r2, feed, campaign, artifacts, valeLog, reach, cred }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// SPEC.md §7: every round is exactly 3 fake / 2 genuine. The genuine posts are
// where false-positive data comes from, so a round that happens to contain none
// measures nothing. Community-pool posts are all fake by construction (see
// communityPool.js), which is why they can only ever displace fake slots —
// letting them into the draw unstratified was what allowed a five-fake feed.
export const FAKE_PER_ROUND = 3;
export const GENUINE_PER_ROUND = 2;
export const ROUND_SIZE = FAKE_PER_ROUND + GENUINE_PER_ROUND;

export function drawRound(seed, pool = []) {
  const genuine = shuffle(seed.filter((p) => !p.fake)).slice(0, GENUINE_PER_ROUND);
  const fake = shuffle([...seed.filter((p) => p.fake), ...pool]).slice(0, FAKE_PER_ROUND);
  return shuffle([...fake, ...genuine]);
}

const BASE = {
  phase: "intro", // intro | phase1 | phase2 | profile | phase3
  round: 1,
  i: 0,
  r1: [],
  r2: [],
  feed: null, // the current round's 5 — set by startRoundOne() / startRoundTwo()
  campaign: { aud: "", hook: "", head: "", match: 0 },
  artifacts: [], // §4 canonical: flat array of artifact ids, one per placement — drives credibility/reach math
  // Rich per-placement visual data for the canvas (position/scale/rotation/opacity/custom text) —
  // not part of §4's data model, but kept as the single source of truth so both the live canvas
  // and the Profile "your posts" preview render the *same* accurate result. `artifacts` above is
  // always kept in sync with this (one id per placedArtifacts entry) for the canonical cred/reach math.
  placedArtifacts: [],
  postSource: "Riverton Daily Report · Sponsored",
  postImage: DEFAULT_POST_IMAGE,
  postImageCaption: "Riverton reservoir",
  valeLog: [],
  reach: 0,
  cred: 0,
  topArtifact: null,
  composerStep: "setup", // setup | composer — lifted so the navbar's back button can drive it
  reflected: false, // has this session been through Phase 3 yet — drives the profile/navbar breadcrumb
  startedAt: null,
};

export const useStore = create((set, get) => ({
  ...BASE,

  posts: () => get().feed || [],

  setPhase: (phase) => set({ phase }),
  setComposerStep: (composerStep) => set({ composerStep }),
  markReflected: () => set({ reflected: true }),

  recordDecision: (decision) =>
    set((s) => (s.round === 1 ? { r1: [...s.r1, decision] } : { r2: [...s.r2, decision] })),

  advancePost: () => set((s) => ({ i: s.i + 1 })),

  // Round 1 is the baseline every tester is measured against, so it draws from
  // the fixed Riverton set only — never the community pool. Keeping it
  // identical session to session is what makes the eight testers' numbers
  // comparable to each other, and what makes the round-2 delta mean anything.
  startRoundOne: () =>
    set({ phase: "phase1", round: 1, i: 0, r1: [], feed: drawRound(R1), startedAt: Date.now() }),

  // Round 2 uses the same four tactics with different content (Eastvale, not
  // Riverton) so improvement measures tactic recognition rather than memory —
  // SPEC.md §7. Posts other learners published in Phase 2 mix in here, and
  // only here.
  startRoundTwo: () => set({ phase: "phase1", round: 2, i: 0, r2: [], feed: drawRound(R2, getPool()) }),

  setCampaignField: (field, value) =>
    set((s) => ({ campaign: { ...s.campaign, [field]: value } })),

  setCampaign: (campaign) => set({ campaign }),

  // Drop a new artifact onto the canvas at (x, y). Keeps `artifacts` (ids,
  // canonical) and `placedArtifacts` (rich visual data) in lockstep.
  addPlacedArtifact: (item) =>
    set((s) => ({
      artifacts: [...s.artifacts, item.id],
      placedArtifacts: [...s.placedArtifacts, item],
    })),

  updatePlacedArtifact: (uid, patch) =>
    set((s) => ({
      placedArtifacts: s.placedArtifacts.map((p) => (p.uid === uid ? { ...p, ...patch } : p)),
    })),

  removePlacedArtifact: (uid) =>
    set((s) => {
      const item = s.placedArtifacts.find((p) => p.uid === uid);
      if (!item) return {};
      const idx = s.artifacts.indexOf(item.id);
      const artifacts = idx === -1 ? s.artifacts : [...s.artifacts.slice(0, idx), ...s.artifacts.slice(idx + 1)];
      return { artifacts, placedArtifacts: s.placedArtifacts.filter((p) => p.uid !== uid) };
    }),

  setPostSource: (postSource) => set({ postSource }),
  setPostImage: (postImage, postImageCaption) => set({ postImage, postImageCaption }),

  logValeRequest: (intent) => set((s) => ({ valeLog: [...s.valeLog, intent] })),

  setReachAndCred: (reach, cred, topArtifact) => set({ reach, cred, topArtifact }),

  reset: () => set({ ...BASE }),
}));

export const accuracyPct = (decisions) =>
  decisions.length
    ? Math.round((decisions.filter((d) => d.correct).length / decisions.length) * 100)
    : 0;
