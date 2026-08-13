// Local, single-browser "database of posts" that Phase 1 draws from.
//
// SPEC.md §8 is explicit: no database, session state in memory only. A real
// cross-user shared feed would need a real backend — out of scope here. This
// is the local-only compromise: every campaign post published in Phase 2 is
// saved to localStorage and mixed into a later **round two**.
//
// Round one never draws from this pool. It is the fixed baseline every
// tester's before/after is measured against, so polluting it with
// learner-authored posts would make the eight sessions incomparable and the
// delta meaningless. See store.js's startRoundOne() / startRoundTwo().
//
// There's no separate "Contribute" step anymore — publishing to the profile
// and adding the post to this pool are the same action (Phase2.jsx's launch()).

const KEY = "misinfo-lab:community-pool";

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#C7D2FE,#8FA3EE)",
  "linear-gradient(135deg,#FBCFE8,#F09AC4)",
  "linear-gradient(135deg,#BBF7D0,#6EE7A8)",
  "linear-gradient(135deg,#FDE68A,#F1C453)",
  "linear-gradient(135deg,#C3AFD9,#9179B6)",
  "linear-gradient(135deg,#FECACA,#F87171)",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getPool() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getPoolCount() {
  return getPool().length;
}

export function addToPool(post) {
  const pool = getPool();
  pool.push(post);
  try {
    localStorage.setItem(KEY, JSON.stringify(pool));
  } catch {
    // localStorage full or unavailable — the submission just won't persist.
  }
  return pool.length;
}

export function clearPool() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

// Builds a full post object (same shape as the fixed R1/R2 posts) from the
// campaign post the learner already built in the main composer — source,
// headline, image, and whichever credibility signals they actually placed
// (`signals`/`why` describe those, rather than a separately-chosen tactic
// label). Every submitted post is a misinformation campaign post by
// definition — that's what Phase 2 is — so there's no genuine/fake choice.
export function buildCommunityPost({ source, headline, why, signals, img, cap }) {
  return {
    name: source || "Unverified account",
    sub: "Community submitted",
    av: randomFrom(AVATAR_GRADIENTS),
    txt: headline,
    img: img || "linear-gradient(150deg,#CFCFD6,#9E9EA8)",
    cap: cap || "Illustration",
    eng: [`${(1 + Math.random() * 8).toFixed(1)}K reactions`, `${Math.round(200 + Math.random() * 4000)} shares`],
    fake: true,
    v: ["No record found", "Recently", "Unverified"],
    why: why || "Built by a fellow learner.",
    signals: signals || [],
    community: true,
  };
}
