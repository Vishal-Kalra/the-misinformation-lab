import { create } from "zustand";
import { R1, R2 } from "./data/posts";
import { getPool } from "./services/communityPool";

// State shape matches SPEC.md §4:
// Decision { i, action, reason, ms, verified, correct, fake, name, why, signals }
// Campaign { aud, hook, head, match }
// State { round, i, r1, r2, campaign, artifacts, valeLog, reach, cred }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useStore = create((set, get) => ({
  phase: "intro", // intro | phase1 | interstitial | phase2 | profile | phase3
  round: 1,
  i: 0,
  r1: [],
  r2: [],
  r2Feed: null, // computed once when round 2 starts — base R2 + local community pool, shuffled, capped at 5
  campaign: { aud: "", hook: "", head: "", match: 0 },
  artifacts: [], // §4 canonical: flat array of artifact ids, one entry per placement — drives credibility/reach math
  // Rich per-placement visual data for the canvas (position/scale/rotation/opacity/custom text) —
  // not part of §4's data model, but kept as the single source of truth so both the live canvas
  // and the Profile "your posts" preview render the *same* accurate result. `artifacts` above is
  // always kept in sync with this (one id per placedArtifacts entry) for the canonical cred/reach math.
  placedArtifacts: [],
  postSource: "Riverton Daily Report · Sponsored",
  postImage: null, // null = default CSS gradient from the stylesheet
  postImageCaption: "Riverton reservoir",
  valeLog: [],
  reach: 0,
  cred: 0,
  topArtifact: null,
  composerStep: "setup", // setup | composer — lifted so the navbar's back button can drive it

  posts: () => (get().round === 1 ? R1 : get().r2Feed || R2),
  currentRoundDecisions: () => (get().round === 1 ? get().r1 : get().r2),

  setPhase: (phase) => set({ phase }),
  setComposerStep: (composerStep) => set({ composerStep }),

  recordDecision: (decision) => {
    const key = get().round === 1 ? "r1" : "r2";
    set((s) => ({ [key]: [...s[key], decision] }));
  },

  advancePost: () => set((s) => ({ i: s.i + 1 })),

  // Round 1 is always the untouched baseline (its accuracy is the "before"
  // number Phase 3 measures against) — community posts only ever mix into
  // Round 2, so submitting a post can't distort the measurement it's later
  // compared to.
  startRoundTwo: () => {
    const pool = getPool();
    const feed = pool.length ? shuffle([...R2, ...pool]).slice(0, 5) : R2;
    set({ round: 2, i: 0, r2Feed: feed });
  },

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

  reset: () =>
    set({
      phase: "intro",
      round: 1,
      i: 0,
      r1: [],
      r2: [],
      r2Feed: null,
      campaign: { aud: "", hook: "", head: "", match: 0 },
      artifacts: [],
      placedArtifacts: [],
      postSource: "Riverton Daily Report · Sponsored",
      postImage: null,
      postImageCaption: "Riverton reservoir",
      valeLog: [],
      reach: 0,
      cred: 0,
      topArtifact: null,
      composerStep: "setup",
    }),
}));

export const accuracyPct = (decisions) =>
  decisions.length
    ? Math.round((decisions.filter((d) => d.correct).length / decisions.length) * 100)
    : 0;
