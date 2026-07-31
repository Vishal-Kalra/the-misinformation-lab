// Local, single-browser "community pool" for learner-submitted posts.
//
// SPEC.md §8 is explicit: no database, session state in memory only. A real
// cross-user shared feed (like the teammate prototype's window.storage pool)
// would need a real backend — out of scope here. This is the local-only
// compromise: posts a learner submits in Phase 2's Contribute tool are saved
// to localStorage and mixed into *that same browser's* next Round 2, so the
// "the community's fakes show up in your feed" feeling works for repeat
// play/testing without standing up a database.

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

// Builds a full post object (same shape as the fixed R1/R2 posts) from
// Contribute-tool form state, ready to drop straight into a feed.
export function buildCommunityPost({ isFake, source, headline, tactic, img, cap }) {
  return {
    name: source || (isFake ? "Unverified account" : "Community notice"),
    sub: "Community submitted",
    av: randomFrom(AVATAR_GRADIENTS),
    txt: headline,
    img: img || "linear-gradient(150deg,#CFCFD6,#9E9EA8)",
    cap: cap || "Illustration",
    eng: isFake
      ? [`${(1 + Math.random() * 8).toFixed(1)}K reactions`, `${Math.round(200 + Math.random() * 4000)} shares`]
      : [`${Math.round(20 + Math.random() * 150)} reactions`, `${Math.round(2 + Math.random() * 20)} shares`],
    fake: isFake,
    v: isFake
      ? ["No record found", "Recently", "Unverified"]
      : ["Registered account", "Recently", "Original"],
    why: tactic ? tactic.why : "Genuine. Submitted by another learner practicing the opposite move — writing something true and checkable.",
    signals: tactic ? tactic.signals : [],
    community: true,
  };
}
