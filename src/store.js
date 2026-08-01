import { create } from "zustand";
import { SEED_POSTS } from "./data/posts";
import { getPool } from "./services/communityPool";

// State shape — one round now, no Round 1 / Round 2 split:
// Decision { i, action, reason, ms, verified, correct, fake, name, why, signals }
// Campaign { aud, hook, head, match }
// State { i, decisions, feed, campaign, artifacts, valeLog, reach, cred }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const useStore = create((set, get) => ({
  phase: "intro", // intro | phase1 | phase2 | profile | phase3
  i: 0,
  decisions: [],
  feed: null, // this session's random 5 — set once by startPhase1()
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
  reflected: false, // has this session been through Phase 3 yet — just for the profile/navbar breadcrumb

  posts: () => get().feed || [],

  setPhase: (phase) => set({ phase }),
  setComposerStep: (composerStep) => set({ composerStep }),
  markReflected: () => set({ reflected: true }),

  recordDecision: (decision) => set((s) => ({ decisions: [...s.decisions, decision] })),

  advancePost: () => set((s) => ({ i: s.i + 1 })),

  // Draws this session's one Phase 1 round: a random 5 from the fixed seed
  // content plus whatever other learners (or this learner, in an earlier
  // session) have published in Phase 2 — see services/communityPool.js.
  // Replaces the old fixed Round 1 / Round 2 split entirely.
  startPhase1: () => {
    const pool = getPool();
    const feed = shuffle([...SEED_POSTS, ...pool]).slice(0, 5);
    set({ phase: "phase1", i: 0, decisions: [], feed });
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
      i: 0,
      decisions: [],
      feed: null,
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
      reflected: false,
    }),
}));

export const accuracyPct = (decisions) =>
  decisions.length
    ? Math.round((decisions.filter((d) => d.correct).length / decisions.length) * 100)
    : 0;
