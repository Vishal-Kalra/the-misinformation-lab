// Phase 1 feed content — ported verbatim from misinformation-lab-full-flow-v2.html.
//
// R1 (Riverton) is round one, the fixed baseline. R2 (Eastvale) is round two:
// the same four tactics with different towns, names and claims, so the
// before/after delta measures tactic recognition rather than memory (SPEC.md
// §7). Each array is 3 fake / 2 genuine — the genuine ones are deliberately
// dull and checkable, because that's where false-positive data comes from.

// "AI generates a picture" — keyword-matches the headline to a theme, then
// hands back a pre-loaded illustration for it (services/valeService.js's
// generateVisualTheme()) instead of calling a real image-generation API.
// SPEC.md §7 is explicit that this stays illustrated/abstract — never
// photoreal, and it can't depict a real person, place, or event — so a
// small curated set, picked by keyword, is the deliberate ceiling here, not
// a placeholder for photoreal generation. If a real image model is ever
// wired in, it should be constrained to the same illustrated/abstract output.
import reservoirImg from "../assets/images/scenes/reservoir.svg";
import townhallImg from "../assets/images/scenes/townhall.svg";
import kitchenImg from "../assets/images/scenes/school-kitchen.svg";
import platformImg from "../assets/images/scenes/platform.svg";
import clinicImg from "../assets/images/scenes/clinic.svg";
import libraryImg from "../assets/images/scenes/library.svg";
import chartImg from "../assets/images/scenes/chart.svg";
import gatheringImg from "../assets/images/scenes/gathering.svg";
import documentImg from "../assets/images/scenes/document.svg";
import roadworksImg from "../assets/images/scenes/roadworks.svg";

// The curated illustrated set the composer offers, and the same set Phase 1's
// posts are drawn from. Ten scenes, one visual system.
//
// None of them settles anything. That's the design: a reservoir looks like a
// reservoir whether the caption under it is true or invented, and the same
// image appears in this app under two different claims in two different rounds.
// SPEC.md §7 — "same illustration, two captions, two different claims — that
// *is* the false-context lesson."
const DRAWN_SCENES = [
  { id: "reservoir", img: reservoirImg, label: "Water treatment works", k: ["water", "reservoir", "drink", "pipe", "tap", "supply"] },
  { id: "townhall",  img: townhallImg,  label: "Town hall",             k: ["council", "official", "hall", "meeting", "minutes", "vote"] },
  { id: "kitchen",   img: kitchenImg,   label: "School kitchens",       k: ["school", "kid", "child", "student", "meal", "food", "canteen"] },
  { id: "platform",  img: platformImg,  label: "Station platform",      k: ["train", "station", "commut", "transport", "bus", "delay"] },
  { id: "clinic",    img: clinicImg,    label: "Health centre",         k: ["health", "doctor", "clinic", "medical", "symptom", "nhs", "nurse"] },
  { id: "library",   img: libraryImg,   label: "Reading room",          k: ["library", "archive", "record", "book", "history"] },
  { id: "chart",     img: chartImg,     label: "Figures on paper",      k: ["chart", "number", "stat", "percent", "data", "figure", "study", "rise"] },
  { id: "gathering", img: gatheringImg, label: "A gathering",           k: ["crowd", "protest", "parent", "resident", "people", "everyone", "march"] },
  { id: "document",  img: documentImg,  label: "A document",            k: ["document", "memo", "leak", "internal", "report", "letter", "email"] },
  { id: "roadworks", img: roadworksImg, label: "Works in progress",     k: ["works", "build", "road", "site", "construc", "repair", "close"] },
];

// Drop-in photographs.
//
// Any .jpg/.jpeg/.png/.webp placed in `src/assets/images/photos/` is picked up
// automatically at build time and joins the set below — no code change needed.
// The drawn SVG scenes are a floor, not a ceiling: hand-authored vector art
// cannot reach the realism of an actual news photograph, and Phase 1 only works
// if a learner believes the post enough to be fooled by it. Real photography is
// the upgrade path, so the loader makes adding it a file-copy.
//
// Filename is the metadata. `water-reservoir.jpg` becomes the label "Water
// reservoir" and the keywords ["water", "reservoir"], which is what the
// composer's "match one to my headline" button searches. Photos sort first, so
// they take precedence in the picker.
//
// Only use images you have the right to use — see src/assets/images/photos/README.md.
const PHOTO_FILES = import.meta.glob("../assets/images/photos/*.{jpg,jpeg,png,webp}", {
  eager: true,
  query: "?url",
  import: "default",
});

const PHOTO_SCENES = Object.entries(PHOTO_FILES)
  .map(([path, img]) => {
    const base = path.split("/").pop().replace(/\.[^.]+$/, "");
    const words = base.split(/[-_\s]+/).filter(Boolean).map((w) => w.toLowerCase());
    return {
      id: `photo-${base}`,
      img,
      label: (words.join(" ") || base).replace(/^./, (c) => c.toUpperCase()),
      k: words,
      photo: true,
    };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

export const SCENES = [...PHOTO_SCENES, ...DRAWN_SCENES];

// Lookup so the post arrays above can name a scene directly. Falls back to the
// drawn scene when no photo has replaced it, so the fixed posts keep working
// whether or not the photos folder has anything in it.
const byId = Object.fromEntries(SCENES.map((s) => [s.id, s]));
const pick = (id) => byId[`photo-${id}`] || byId[id];
const SCENE = Object.fromEntries(
  DRAWN_SCENES.map((s) => [s.id, `url("${pick(s.id).img}") center/cover`])
);

export const sceneBackground = (scene) => `url("${scene.img}") center/cover`;

// The composer canvas starts on this. It used to fall back to a flat CSS
// gradient, which meant the post a learner builds looked nothing like the
// photographed posts they had just been judging — and the whole point of Phase 2
// is that they are building the same kind of object.
export const DEFAULT_POST_IMAGE = SCENE.reservoir;

// Keyword matching for the composer's "match one to my headline" button.
//
// Keywords come from the drawn set, which carries the richer synonym lists, but
// the image resolves through pick() so a photograph wins when one exists. Using
// SCENES directly matched the drawn SVG instead, which meant rewriting a
// headline swapped a photo for vector art mid-compose.
export const VISUAL_THEMES = DRAWN_SCENES.map((s) => ({ ...s, img: pick(s.id).img }));
export const VISUAL_THEME_DEFAULT = VISUAL_THEMES.find((s) => s.id === "townhall");

export const R1 = [
  {
    name: "Riverton Daily Report", sub: "2h · Sponsored", av: "linear-gradient(135deg,#C7D2FE,#8FA3EE)",
    txt: "Council quietly approved the reservoir change last month. Parents are only finding out now — share before this gets taken down.",
    img: SCENE.reservoir, cap: "Riverton water treatment works",
    eng: ["2.4K reactions", "1.1K shares"], fake: true, v: ["No record found", "4 days ago", "2019 — stock library"],
    why: "Fake outlet, registered four days before posting.", signals: ["Verified", "Source", "Numbers"],
  },
  {
    name: "Marisol Vance", sub: "5h", av: "linear-gradient(135deg,#FBCFE8,#F09AC4)",
    txt: "Third time this week the 6:40 has been cancelled with no notice. Anyone else just giving up and driving?",
    img: SCENE.platform, cap: "Riverton station, platform 2",
    eng: ["31 reactions", "2 shares"], fake: false, v: ["Personal account", "5 hours ago", "Original — 5 hours ago"],
    why: "Genuine. A real person, a real complaint.", signals: [],
  },
  {
    name: "Health Signal Weekly", sub: "1d · Sponsored", av: "linear-gradient(135deg,#BBF7D0,#6EE7A8)",
    txt: "Study finds 400% rise in reported symptoms since the change. Doctors 'not permitted' to discuss it publicly.",
    img: SCENE.chart, cap: "Figure 1 — reported cases",
    eng: ["8.9K reactions", "6.2K shares"], fake: true, v: ["Registered 3 weeks ago", "1 day ago", "Chart — axis starts at 380"],
    why: "Chart axis starts at 380. The rise is nine cases.", signals: ["Numbers", "Breaking", "Friends"],
  },
  {
    name: "Riverton Community Board", sub: "3h", av: "linear-gradient(135deg,#FDE68A,#F1C453)",
    txt: "Reminder: the water treatment consultation is open until Friday. Details and the full report are on the council site.",
    img: SCENE.townhall, cap: "Riverton town hall",
    eng: ["104 reactions", "18 shares"], fake: false, v: ["Registered 2011", "3 hours ago", "Original — 3 hours ago"],
    why: "Genuine. Dull, checkable, barely shared.", signals: [],
  },
  {
    name: "@insider_riverton", sub: "40m", av: "linear-gradient(135deg,#C3AFD9,#9179B6)",
    txt: "Screenshot before it's gone. Internal memo confirms what parents have been saying for weeks.",
    img: SCENE.document, cap: "Leaked — do not circulate",
    eng: ["5.1K reactions", "4.4K shares"], fake: true, v: ["Anonymous, 6 weeks old", "40 minutes ago", "Unrelated 2021 document"],
    why: "Real document, unrelated subject, reframed as a leak.", signals: ["Source", "Verified", "Friends"],
  },
];

export const R2 = [
  {
    name: "Eastvale Herald Online", sub: "1h · Sponsored", av: "linear-gradient(135deg,#BFDBFE,#7FA8E8)",
    txt: "School meals contract awarded to a firm with no food safety record. Parents were never consulted.",
    img: SCENE.kitchen, cap: "Eastvale primary kitchens",
    eng: ["3.3K reactions", "2.0K shares"], fake: true, v: ["No record found", "2 days ago", "2017 — stock library"],
    why: "Fake outlet. Same tactic as the Riverton one, different name.", signals: ["Verified", "Source"],
  },
  {
    name: "Dr Anita Rehal", sub: "6h", av: "linear-gradient(135deg,#DDD6FE,#A78BFA)",
    txt: "Our clinic is running free hearing checks on Saturday. No appointment needed, just come by before noon.",
    img: SCENE.clinic, cap: "Eastvale health centre",
    eng: ["58 reactions", "11 shares"], fake: false, v: ["Verified practitioner", "6 hours ago", "Original — 6 hours ago"],
    why: "Genuine. Checkable, local, unremarkable.", signals: [],
  },
  {
    name: "TruthMetrics Daily", sub: "22h · Sponsored", av: "linear-gradient(135deg,#FECACA,#F87171)",
    txt: "Crime up 300% in the district since the new policy. The council removed the figures from its own site.",
    img: SCENE.chart, cap: "Reported incidents, 2024–26",
    eng: ["11.2K reactions", "9.4K shares"], fake: true, v: ["Registered 5 weeks ago", "22 hours ago", "Chart — three-month window"],
    why: "Three-month window on a seasonal figure. The year-on-year change is flat.", signals: ["Numbers", "Breaking", "Friends"],
  },
  {
    name: "Eastvale Library", sub: "4h", av: "linear-gradient(135deg,#A7F3D0,#5EEAD4)",
    txt: "The local history archive is now searchable online. Link in comments, and the reading room is open as usual.",
    img: SCENE.library, cap: "Eastvale library reading room",
    eng: ["76 reactions", "9 shares"], fake: false, v: ["Registered 2009", "4 hours ago", "Original — 4 hours ago"],
    why: "Genuine. The kind of post nobody shares.", signals: [],
  },
  {
    name: "@eastvale_leaks", sub: "25m", av: "linear-gradient(135deg,#E9D5FF,#C084FC)",
    txt: "Posting this before it disappears. Photo shows exactly what they've been denying all month.",
    img: SCENE.gathering, cap: "Sent to us anonymously",
    eng: ["6.8K reactions", "5.9K shares"], fake: true, v: ["Anonymous, 3 weeks old", "25 minutes ago", "2022 — different county"],
    why: "Real photo, taken elsewhere, four years ago.", signals: ["Source", "Verified", "Friends"],
  },
];

// Five drag-to-canvas credibility signal artifacts (Phase 2 ArtifactPalette)
export const ARTS = [
  { id: "verified", i: "✓", n: "Verified", cls: "a-verified", h: "✓ Verified", w: 20,
    why: "A blue tick you drew yourself. Most people never check whether the platform issued it." },
  { id: "breaking", i: "◼", n: "Breaking", cls: "a-breaking", h: "BREAKING", w: 12,
    why: "Urgency stops people checking. The cheapest tactic here." },
  { id: "social", i: "◎", n: "Friends", cls: "a-social", h: "12 friends shared this", w: 16,
    why: "Social proof. You're only asked to notice that others already believed it." },
  { id: "source", i: "❏", n: "Source", cls: "a-source", h: "Source: internal document", w: 16,
    why: "Naming a source nobody can check works the same as having one." },
  { id: "engagement", i: "▲", n: "Numbers", cls: "a-engagement", h: "8.9K · 6.2K shares", w: 18,
    why: "Numbers you can't verify, describing people who don't exist." },
];

// Vale's three opening headline options per emotional hook, with the tactic explained
export const HEADS = {
  fear: [
    ["What the council isn't telling parents about the water", "Implies you already missed something. No claim you'd have to prove."],
    ["Reservoir change linked to symptoms in under-12s", "Children plus a vague medical word. Nobody checks a study about kids."],
    ["Families warned: 'do not drink' notice quietly withdrawn", "A retracted warning sounds worse than a warning."],
  ],
  outrage: [
    ["Approved in a closed session — then the minutes vanished", "Deletion implies guilt without naming what was approved."],
    ["Officials kept their bonuses while the works failed", "Two true-sounding facts, no stated link. The reader builds it."],
    ["Nobody has resigned. Nobody will.", "Fatalism travels further than anger."],
  ],
  belonging: [
    ["Everyone on your street already knows about this", "Not knowing feels like being left out."],
    ["Parents in Riverton are quietly switching to bottled", "Describes a movement that doesn't exist, so joining creates it."],
    ["If you grew up here, you remember what they said last time", "A membership test outsiders can't argue with."],
  ],
  pride: [
    ["The detail in the report that most people scrolled past", "Flatters you for reading. You'll share it to prove you did."],
    ["You won't see this on the six o'clock news", "Puts you above the mainstream without naming anyone."],
    ["Read the footnote. Then read it again.", "Implies a hidden layer. There isn't one."],
  ],
};

// Keyword-matched rewrite rules Vale uses to respond to free-text requests.
// Order matters: the first rule whose keywords appear in the request wins, so
// the more specific intents sit above the broader ones.
//
// Every entry states the tactic in `s` — that's both the pedagogy and the
// ethics boundary (SPEC.md §6). A rewrite that didn't name what it was doing
// would just be a misinformation generator.
export const RULES = [
  { k: ["scar", "fear", "afraid", "frighten", "worry", "danger", "terrif"], int: "Make it scarier", m: 94,
    h: "What the council isn't telling parents about the water",
    s: "Fear aimed at parents is the strongest pairing you have. Notice I made no claim at all — only the implication that you already missed something." },
  { k: ["angr", "outrage", "mad", "furious", "rage", "anger"], int: "Make it angrier", m: 88,
    h: "Approved in a closed session — then the minutes vanished",
    s: "Anger travels further than fear but burns out faster. I've implied a cover-up without naming what was covered up, so there's nothing here anyone can correct." },
  { k: ["number", "stat", "data", "percent", "study", "research", "figure"], int: "Add numbers", m: 84,
    h: "Reported symptoms up 400% since the treatment change",
    s: "A percentage without a baseline is the cheapest number available. 400% here is nine cases. Nobody will ask for the ninth." },
  { k: ["official", "credib", "legit", "believ", "authorit", "source"], int: "Make it look official", m: 79,
    h: "Internal review confirms treatment change — document seen",
    s: "'Document seen' names a source nobody can request. Readers treat that as equivalent to having one." },
  { k: ["urgen", "hurry", "breaking", "quick", "fast", "now", "deadline"], int: "Add urgency", m: 81,
    h: "Share before this is taken down — notice quietly withdrawn",
    s: "Urgency suppresses verification. The threat of deletion does the work; nothing is being deleted." },
  { k: ["personal", "someone", "story", "witness", "mother", "victim", "human"], int: "Make it personal", m: 86,
    h: "One Riverton mother says she was told to keep quiet",
    s: "A single unnamed witness beats a statistic. Nobody can check her, and nobody wants to be the person who doubts her." },
  { k: ["local", "nearby", "street", "neighbour", "neighbor", "area", "here"], int: "Make it feel local", m: 83,
    h: "If you live on the east side, you've already been drinking it",
    s: "Geography makes it theirs. A reader who recognises their own street stops evaluating and starts reacting." },
  { k: ["share", "viral", "spread", "tag", "repost", "reach"], int: "Make people share it", m: 90,
    h: "Tag someone who still drinks it from the tap",
    s: "An instruction outperforms an argument. Tagging spreads it through people who trust the tagger rather than the source." },
  { k: ["teen", "young", "school", "kids", "student", "child"], int: "Retarget to teenagers", m: 71,
    h: "Everyone at your school already knows about the water",
    s: "Teenagers don't respond to fear the way parents do — they respond to exclusion. Not knowing is the threat." },
  { k: ["short", "punch", "tight", "brief", "snapp", "concis"], int: "Make it shorter", m: 76,
    h: "Nobody told the parents.",
    s: "Short lines read as certainty. No verb is doing any claiming, so there is nothing to fact-check." },
  { k: ["soft", "calm", "gentl", "subtle", "less", "tone down", "milder"], int: "Soften it", m: 58,
    h: "Some Riverton parents are asking questions about the water",
    s: "Softer costs reach but survives moderation longer. 'Asking questions' is unfalsifiable — that's the trade." },
];

// SPEC.md §6: Vale "refuses anything outside the scenario" and "never
// references real people, real events, or real organisations." That constraint
// was specified but never implemented — these are the triggers for it.
//
// Deliberately matched BEFORE the rewrite rules above, so "write this about a
// real politician" refuses rather than matching on "real" and cheerfully
// rewriting. The refusal is a feature of the teaching, not an error state: it
// shows the learner the sandbox has a wall, and where it is.
export const REFUSALS = [
  { k: ["real person", "real politician", "real people", "real company", "real organisation",
        "real organization", "real event", "actual person", "someone real", "a real "],
    r: "reality" },
  { k: ["bbc", "cnn", "nhs", "fox news", "reuters", "guardian", "new york times", "trump",
        "biden", "modi", "putin", "musk", "pfizer", "wikipedia"],
    r: "named" },
  { k: ["phish", "scam", "malware", "password", "credit card", "bank detail", "hack",
        "steal", "bomb", "weapon", "drug"],
    r: "offscenario" },
];

export const REFUSAL_MESSAGES = {
  reality: "I don't work outside Riverton. Name a real person or organisation and I stop — that isn't caution, it's the boundary this desk operates inside. Give me the fictional scenario and I'll write you anything inside it.",
  named: "That's a real organisation. Everything I write stays inside Riverton — invented town, invented outlets, invented people. Ask me again without the real name and I'll write it.",
  offscenario: "No. I write headlines for a fictional town's water story, and that's the whole of it. Anything aimed at a real target or a real person's money is somebody else's desk.",
};

export const REFUSAL_WHY = "This is the wall, and it's worth noticing where it is: the tools that built your post would do this too if nobody had put one here.";

// The chips shown under Vale's input. Removes the "what am I supposed to type?"
// problem — the single biggest usability gap in the composer — and guarantees
// a request lands on a rule rather than the fallback.
export const VALE_SUGGESTIONS = [
  "Make it scarier",
  "Add numbers",
  "Make it personal",
  "Make it look official",
  "Make people share it",
  "Aim it at teenagers",
  "Soften it",
];

export const MATCH = {
  parents: { fear: 94, outrage: 71, belonging: 66, pride: 44 },
  teens: { fear: 48, outrage: 69, belonging: 92, pride: 74 },
  commuters: { fear: 62, outrage: 88, belonging: 57, pride: 53 },
  retired: { fear: 79, outrage: 74, belonging: 61, pride: 81 },
};

export const HOOKNAME = { fear: "protective fear", outrage: "outrage", belonging: "belonging", pride: "pride" };

export const PROFILE = {
  fear: ["Protective fear", "when a post makes you fear for someone else, check who benefits from your sharing it before you check whether it's true."],
  outrage: ["Borrowed anger", "when something makes you angry on someone else's behalf, find the original before you pass it on."],
  belonging: ["Fear of missing out", "when a post says everyone already knows, ask who 'everyone' is — the crowd is usually the claim."],
  pride: ["Flattered scepticism", "when something congratulates you for seeing through the mainstream, that's the manipulation."],
};

// Reach = AUD_BASE × match% × credibility% × SHARE_CASCADE (SPEC.md §4).
// Both constants live here so the arithmetic printed on the spread screen and
// the arithmetic used to compute reach can never drift apart.
export const AUD_BASE = 2400;
export const SHARE_CASCADE = 8;

// Floor. Credibility signals are optional, and with none placed the product is
// exactly zero — which reads on screen as a broken counter rather than as a
// result. Zero isn't true either: a post is still seen by the people who
// already follow the account, they just don't pass it on. So an unsignalled
// post bottoms out here instead of at nothing, and the spread screen says
// plainly that this is the floor rather than a spread.
export const ORGANIC_REACH = 310;

// The one place reach is calculated. Both the number on the spread screen and
// the arithmetic printed underneath it come from this, so they cannot disagree
// — which they previously did, by a factor of eight.
export function computeReach(match, cred) {
  const spread = Math.round(AUD_BASE * (match / 100) * (cred / 100) * SHARE_CASCADE);
  return { spread, reach: Math.max(ORGANIC_REACH, spread), organicOnly: spread < ORGANIC_REACH };
}
