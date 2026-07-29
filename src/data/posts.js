// Round 1 and Round 2 feed content — ported verbatim from misinformation-lab-full-flow-v2.html
// Fictional town: Riverton (round 1) -> Eastvale (round 2). Same four tactics both rounds.
export const R1 = [
  {
    name: "Riverton Daily Report", sub: "2h · Sponsored", av: "linear-gradient(135deg,#C7D2FE,#8FA3EE)",
    txt: "Council quietly approved the reservoir change last month. Parents are only finding out now — share before this gets taken down.",
    img: "linear-gradient(150deg,#9DB4D6,#6E88B4)", cap: "Riverton water treatment works",
    eng: ["2.4K reactions", "1.1K shares"], fake: true, v: ["No record found", "4 days ago", "2019 — stock library"],
    why: "Fake outlet, registered four days before posting.", signals: ["Verified", "Source", "Numbers"],
  },
  {
    name: "Marisol Vance", sub: "5h", av: "linear-gradient(135deg,#FBCFE8,#F09AC4)",
    txt: "Third time this week the 6:40 has been cancelled with no notice. Anyone else just giving up and driving?",
    img: "linear-gradient(150deg,#CFCFD6,#9E9EA8)", cap: "Riverton station, platform 2",
    eng: ["31 reactions", "2 shares"], fake: false, v: ["Personal account", "5 hours ago", "Original — 5 hours ago"],
    why: "Genuine. A real person, a real complaint.", signals: [],
  },
  {
    name: "Health Signal Weekly", sub: "1d · Sponsored", av: "linear-gradient(135deg,#BBF7D0,#6EE7A8)",
    txt: "Study finds 400% rise in reported symptoms since the change. Doctors 'not permitted' to discuss it publicly.",
    img: "linear-gradient(150deg,#E0BBA8,#C08E76)", cap: "Figure 1 — reported cases",
    eng: ["8.9K reactions", "6.2K shares"], fake: true, v: ["Registered 3 weeks ago", "1 day ago", "Chart — axis starts at 380"],
    why: "Chart axis starts at 380. The rise is nine cases.", signals: ["Numbers", "Breaking", "Friends"],
  },
  {
    name: "Riverton Community Board", sub: "3h", av: "linear-gradient(135deg,#FDE68A,#F1C453)",
    txt: "Reminder: the water treatment consultation is open until Friday. Details and the full report are on the council site.",
    img: "linear-gradient(150deg,#D8C6A8,#B49B74)", cap: "Riverton town hall",
    eng: ["104 reactions", "18 shares"], fake: false, v: ["Registered 2011", "3 hours ago", "Original — 3 hours ago"],
    why: "Genuine. Dull, checkable, barely shared.", signals: [],
  },
  {
    name: "@insider_riverton", sub: "40m", av: "linear-gradient(135deg,#C3AFD9,#9179B6)",
    txt: "Screenshot before it's gone. Internal memo confirms what parents have been saying for weeks.",
    img: "linear-gradient(150deg,#A9C4B6,#7A9E8C)", cap: "Leaked — do not circulate",
    eng: ["5.1K reactions", "4.4K shares"], fake: true, v: ["Anonymous, 6 weeks old", "40 minutes ago", "Unrelated 2021 document"],
    why: "Real document, unrelated subject, reframed as a leak.", signals: ["Source", "Verified", "Friends"],
  },
];

export const R2 = [
  {
    name: "Eastvale Herald Online", sub: "1h · Sponsored", av: "linear-gradient(135deg,#BFDBFE,#7FA8E8)",
    txt: "School meals contract awarded to a firm with no food safety record. Parents were never consulted.",
    img: "linear-gradient(150deg,#A9C4B6,#7A9E8C)", cap: "Eastvale primary kitchens",
    eng: ["3.3K reactions", "2.0K shares"], fake: true, v: ["No record found", "2 days ago", "2017 — stock library"],
    why: "Fake outlet. Same tactic as round one, different name.", signals: ["Verified", "Source"],
  },
  {
    name: "Dr Anita Rehal", sub: "6h", av: "linear-gradient(135deg,#DDD6FE,#A78BFA)",
    txt: "Our clinic is running free hearing checks on Saturday. No appointment needed, just come by before noon.",
    img: "linear-gradient(150deg,#D8C6A8,#B49B74)", cap: "Eastvale health centre",
    eng: ["58 reactions", "11 shares"], fake: false, v: ["Verified practitioner", "6 hours ago", "Original — 6 hours ago"],
    why: "Genuine. Checkable, local, unremarkable.", signals: [],
  },
  {
    name: "TruthMetrics Daily", sub: "22h · Sponsored", av: "linear-gradient(135deg,#FECACA,#F87171)",
    txt: "Crime up 300% in the district since the new policy. The council removed the figures from its own site.",
    img: "linear-gradient(150deg,#E0BBA8,#C08E76)", cap: "Reported incidents, 2024–26",
    eng: ["11.2K reactions", "9.4K shares"], fake: true, v: ["Registered 5 weeks ago", "22 hours ago", "Chart — three-month window"],
    why: "Three-month window on a seasonal figure. The year-on-year change is flat.", signals: ["Numbers", "Breaking", "Friends"],
  },
  {
    name: "Eastvale Library", sub: "4h", av: "linear-gradient(135deg,#A7F3D0,#5EEAD4)",
    txt: "The local history archive is now searchable online. Link in comments, and the reading room is open as usual.",
    img: "linear-gradient(150deg,#CFCFD6,#9E9EA8)", cap: "Eastvale library reading room",
    eng: ["76 reactions", "9 shares"], fake: false, v: ["Registered 2009", "4 hours ago", "Original — 4 hours ago"],
    why: "Genuine. The kind of post nobody shares.", signals: [],
  },
  {
    name: "@eastvale_leaks", sub: "25m", av: "linear-gradient(135deg,#E9D5FF,#C084FC)",
    txt: "Posting this before it disappears. Photo shows exactly what they've been denying all month.",
    img: "linear-gradient(150deg,#9DB4D6,#6E88B4)", cap: "Sent to us anonymously",
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

// Keyword-matched rewrite rules Vale uses to respond to free-text requests
export const RULES = [
  { k: ["angr", "outrage", "mad", "furious", "rage"], int: "Make it angrier", m: 88,
    h: "Approved in a closed session — then the minutes vanished",
    s: "Anger travels further than fear but burns out faster. I've implied a cover-up without naming what was covered up." },
  { k: ["scar", "fear", "afraid", "frighten", "worry", "danger"], int: "Make it scarier", m: 94,
    h: "What the council isn't telling parents about the water",
    s: "Fear on parents is the strongest pairing available. Notice I made no claim — only the implication you missed something." },
  { k: ["urgen", "now", "fast", "hurry", "breaking", "quick"], int: "Add urgency", m: 81,
    h: "Share before this gets taken down — notice withdrawn",
    s: "Urgency stops verification. The threat of deletion does the work; nothing is being deleted." },
  { k: ["number", "stat", "data", "percent", "study", "research"], int: "Add numbers", m: 84,
    h: "Reported symptoms up 400% since the treatment change",
    s: "A percentage without a baseline is the cheapest number you can use. 400% here is nine cases." },
  { k: ["teen", "young", "school", "kids", "student"], int: "Retarget to teenagers", m: 71,
    h: "Everyone at your school already knows about the water",
    s: "Teenagers respond to belonging, not fear. Not knowing feels like exclusion." },
  { k: ["official", "credib", "trust", "real", "legit", "believ"], int: "Make it look official", m: 79,
    h: "Internal review confirms treatment change — document seen",
    s: "'Document seen' names a source nobody can request. Readers treat that as the same as having one." },
  { k: ["short", "punch", "tight", "brief", "snapp"], int: "Make it shorter", m: 76,
    h: "Nobody told the parents.",
    s: "Short lines read as certainty. No verb is doing any claiming, so there's nothing to fact-check." },
  { k: ["soft", "calm", "gentl", "subtle", "less"], int: "Soften it", m: 58,
    h: "Some Riverton parents are asking questions about the water",
    s: "Softer costs reach but survives moderation longer. 'Asking questions' is unfalsifiable — that's the trade." },
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

export const AUD_BASE = 2400;
