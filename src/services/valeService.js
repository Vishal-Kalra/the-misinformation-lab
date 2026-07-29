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

import { HEADS, RULES, MATCH, HOOKNAME } from "../data/posts";

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

// Job 2: rewrite the current draft on request, e.g. "make it angrier"
export function getValeResponse(userText) {
  const lower = userText.toLowerCase();
  const rule = RULES.find((r) => r.k.some((kw) => lower.includes(kw)));
  if (!rule) {
    return {
      matched: false,
      message: {
        role: "vale",
        text: "Tell me what to change — angrier, more urgent, aimed younger, more official. I only work on this draft.",
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
