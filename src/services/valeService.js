// Vale — the campaign-strategist AI. See SPEC.md §6.
//
// This module is the ONLY place that knows how Vale's responses are produced.
// Right now it's a keyword-matched rule engine ported from the HTML prototypes
// (phase2-vale-chat.html / misinformation-lab-full-flow-v2.html) so the app is
// fully functional with no API key.
//
// TODO(vale-api): once a Gemini key exists, replace the body of getValeResponse()
// with a call to a serverless function `/api/vale` (Gemini Flash) that enforces
// the same constraints from §6:
//   - only rewrites the *current draft*, inside the fictional Riverton/Eastvale scenario
//   - always states the tactic used
//   - never references real people, events, or organisations
//   - refuses anything outside the scenario
// Cache the demo path (§6): run the flow once, save responses to JSON, and fall
// back to that cache on network failure so a filmed demo never waits on an API call.
// Component code should not need to change — it only calls getValeResponse().

import {
  HEADS, RULES, MATCH, HOOKNAME, VISUAL_THEMES, VISUAL_THEME_DEFAULT,
  REFUSALS, REFUSAL_MESSAGES, REFUSAL_WHY,
} from "../data/posts";

export function getAudienceMatch(aud, hook) {
  if (!aud || !hook) return 0;
  return MATCH[aud][hook];
}

// Job 1: three opening headline options for {audience, hook}
export function getOpeningOptions(hook) {
  return HEADS[hook].map(([headline, reason]) => ({ headline, reason }));
}

export function getOpeningIntroMessage(hook) {
  return {
    role: "vale",
    text: `Three openings for ${HOOKNAME[hook]}. Pick one, or tell me what to change.`,
    why: "I'll always name the tactic I used.",
  };
}

// Job 2: rewrite the current draft on request, e.g. "make it angrier".
//
// Refusals are checked first and deliberately so — SPEC.md §6 requires Vale to
// refuse anything outside the fictional scenario, and several refusal triggers
// ("a real company", "make it look real") contain words the rewrite rules also
// match on. Checking rules first would let "write this about a real politician"
// hit the "make it look official" rule and comply.
//
// A refusal returns matched:false, so nothing is logged to valeLog and the
// headline is left alone — refusing isn't a manipulation the learner asked for,
// and it shouldn't appear in Phase 3's "what you asked for" transcript as if it were.
export function getValeResponse(userText) {
  const lower = userText.toLowerCase();

  const refusal = REFUSALS.find((r) => r.k.some((kw) => lower.includes(kw)));
  if (refusal) {
    return {
      matched: false,
      refused: true,
      message: { role: "vale", text: REFUSAL_MESSAGES[refusal.r], why: REFUSAL_WHY },
    };
  }

  const rule = RULES.find((r) => r.k.some((kw) => lower.includes(kw)));
  if (!rule) {
    return {
      matched: false,
      message: {
        role: "vale",
        text: "Tell me what to change and I'll rewrite this draft — scarier, angrier, more official, aimed younger. Use one of the suggestions below if it's easier.",
      },
    };
  }
  return {
    matched: true,
    intent: rule.int,
    headline: rule.h,
    match: rule.m,
    message: {
      role: "vale",
      text: rule.h,
      why: rule.s,
    },
  };
}

// Job 4: keyword-match the headline to a theme, then hand back a pre-loaded
// illustration for it — the "generate one with AI" option in the post image
// picker — instead of calling a real image-generation API. This is a
// client-side stand-in exactly like the rest of Vale in this file: no key,
// no network call, no risk of ever producing something photoreal. If a real
// image model is wired in later, keep the same illustrated/abstract-only
// constraint from SPEC.md §7 — this app is meant to stay "a manipulation
// sandbox that cannot produce a usable fake."
//
// TODO(image-api): if a real (illustration-only, non-photoreal) image model
// is ever wired in, swap the lookup below for that call and keep this
// function's signature — callers only use the returned { img, label }.
export function generateVisualTheme(headline) {
  const lower = (headline || "").toLowerCase();
  const theme = VISUAL_THEMES.find((t) => t.k.some((kw) => lower.includes(kw))) || VISUAL_THEME_DEFAULT;
  return { img: `url("${theme.img}") center/cover`, label: theme.label };
}
