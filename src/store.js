import { create } from "zustand";
import { R1, R2 } from "./data/posts";

// State shape matches SPEC.md §4:
// Decision { i, action, reason, ms, verified, correct, fake, name, why, signals }
// Campaign { aud, hook, head, match }
// State { round, i, r1, r2, campaign, artifacts, valeLog, reach, cred }

export const useStore = create((set, get) => ({
  phase: "intro", // intro | phase1 | interstitial | phase2 | profile | phase3
  round: 1,
  i: 0,
  r1: [],
  r2: [],
  campaign: { aud: "", hook: "", head: "", match: 0 },
  artifacts: [],
  valeLog: [],
  reach: 0,
  cred: 0,
  topArtifact: null,
  composerStep: "setup", // setup | composer — lifted so the navbar's back button can drive it

  posts: () => (get().round === 1 ? R1 : R2),
  currentRoundDecisions: () => (get().round === 1 ? get().r1 : get().r2),

  setPhase: (phase) => set({ phase }),
  setComposerStep: (composerStep) => set({ composerStep }),

  recordDecision: (decision) => {
    const key = get().round === 1 ? "r1" : "r2";
    set((s) => ({ [key]: [...s[key], decision] }));
  },

  advancePost: () => set((s) => ({ i: s.i + 1 })),

  startRoundTwo: () => set({ round: 2, i: 0 }),

  setCampaignField: (field, value) =>
    set((s) => ({ campaign: { ...s.campaign, [field]: value } })),

  setCampaign: (campaign) => set({ campaign }),

  addArtifact: (id) => set((s) => ({ artifacts: [...s.artifacts, id] })),

  logValeRequest: (intent) => set((s) => ({ valeLog: [...s.valeLog, intent] })),

  setReachAndCred: (reach, cred, topArtifact) => set({ reach, cred, topArtifact }),

  reset: () =>
    set({
      phase: "intro",
      round: 1,
      i: 0,
      r1: [],
      r2: [],
      campaign: { aud: "", hook: "", head: "", match: 0 },
      artifacts: [],
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
