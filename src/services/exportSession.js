// Per-tester session export. SPEC.md §8 rules out a database: "export results
// as a downloadable JSON at the end of each session. For eight testers, collect
// eight files and put them in a spreadsheet." This is that export — it's the
// mechanism the before/after results slide is built from, so it carries both
// rounds and the delta rather than a summary.

import { accuracyPct } from "../store";

export function buildSessionRecord(state) {
  const { r1, r2, campaign, artifacts, valeLog, reach, cred, startedAt } = state;
  const before = accuracyPct(r1);
  const after = accuracyPct(r2);

  const avg = (list) => (list.length ? Math.round(list.reduce((s, d) => s + d.ms, 0) / list.length) : null);
  const wrong = [...r1, ...r2].filter((d) => !d.correct);
  const right = [...r1, ...r2].filter((d) => d.correct);

  return {
    schema: "misinfo-lab/session@2",
    exportedAt: new Date().toISOString(),
    startedAt: startedAt ? new Date(startedAt).toISOString() : null,
    durationMs: startedAt ? Date.now() - startedAt : null,
    accuracy: {
      before,
      after: r2.length ? after : null,
      delta: r2.length ? after - before : null,
    },
    decisionTimeMs: {
      onCorrect: avg(right),
      onWrong: avg(wrong),
    },
    rounds: { r1, r2 },
    campaign,
    artifacts,
    valeLog,
    reach,
    cred,
  };
}

export function downloadSession(state) {
  const record = buildSessionRecord(state);
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `misinfo-lab-session-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return record;
}
