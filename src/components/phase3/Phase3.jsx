import { useEffect, useMemo, useState } from "react";
import { useStore, accuracyPct } from "../../store";
import { ARTS, HOOKNAME, PROFILE } from "../../data/posts";

const LABELS = [
  "Both rounds", "Decision speed", "What you asked for", "Signals",
  "Side by side", "Your vulnerability", "Debrief",
];
const LAST = LABELS.length - 1;

export default function Phase3({ onDone }) {
  const r1 = useStore((s) => s.r1);
  const r2 = useStore((s) => s.r2);
  const valeLog = useStore((s) => s.valeLog);
  const artifacts = useStore((s) => s.artifacts);
  const campaign = useStore((s) => s.campaign);
  const reach = useStore((s) => s.reach);

  const [b, setB] = useState(0);
  const [entered, setEntered] = useState(false);

  const data = useMemo(() => {
    const A = [...r1, ...r2];
    const wrong = A.filter((d) => !d.correct);
    const right = A.filter((d) => d.correct);
    const avgW = wrong.length ? wrong.reduce((s, d) => s + d.ms, 0) / wrong.length / 1000 : 0;
    const avgR = right.length ? right.reduce((s, d) => s + d.ms, 0) / right.length / 1000 : 0;
    const missed = [...new Set(wrong.flatMap((d) => d.signals))];
    const used = artifacts.map((id) => ARTS.find((a) => a.id === id).n);
    const overlap = used.filter((u) => missed.includes(u));
    const trusted = A.find((d) => !d.correct && d.fake);
    const before = accuracyPct(r1);
    const after = accuracyPct(r2);
    const seen = {};
    const vl = valeLog.filter((x) => (seen[x] = (seen[x] || 0) + 1) === 1).map((x) => {
      const c = valeLog.filter((y) => y === x).length;
      return c > 1 ? `${x} ×${c}` : x;
    });
    return { A, r1, r2, wrong, right, avgW, avgR, missed, used, overlap, trusted, before, after, vl };
  }, [r1, r2, valeLog, artifacts]);

  useEffect(() => {
    setEntered(false);
    const t = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(t);
  }, [b]);

  const advance = () => {
    if (b < LAST) setB(b + 1);
    else onDone();
  };
  const back = () => setB((n) => Math.max(0, n - 1));

  // The reveal is the screen the whole app builds toward, so it can't be
  // mouse-only. Enter/Space advance, ← steps back for anyone who overshoots
  // and would otherwise lose the vulnerability beat with no way to return.
  useEffect(() => {
    const onKey = (e) => {
      // The debrief beat has its own buttons. Enter/Space on one of those means
      // "pick this reason", not "advance the reveal" — without this guard a
      // keyboard user answering the reflection question also skips the beat.
      if (e.target.closest?.("button")) return;
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        advance();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b]);

  return (
    <section
      id="p3"
      className="scr"
      onClick={advance}
      role="button"
      tabIndex={0}
      aria-label={`${LABELS[b]}. Beat ${b + 1} of ${LABELS.length}. Press Enter to continue.`}
    >
      <div className="plab">
        {LABELS[b]}
        <span className="pcount">{b + 1} of {LABELS.length}</span>
      </div>
      <div className={`beat ${entered ? "in" : ""}`}>
        {b === 0 && <BeatBoth data={data} />}
        {b === 1 && <BeatSpeed data={data} />}
        {b === 2 && <BeatAsked data={data} />}
        {b === 3 && <BeatSignals data={data} />}
        {b === 4 && <BeatSideBySide data={data} campaign={campaign} reach={reach} />}
        {b === 5 && <BeatVulnerability data={data} campaign={campaign} />}
        {b === 6 && <BeatDebrief data={data} />}
      </div>
      {/* Advancing by clicking anywhere was the only way forward and nothing
          said so, so the reveal could stall on its first screen. There's now a
          real button, and stepping back is visible rather than a hidden key. */}
      <div className="pfoot">
        <span className="pdots">
          {LABELS.map((_, i) => (
            <i key={i} className="dot" style={{ background: i <= b ? "#111" : "#DADADA" }} />
          ))}
        </span>
        <span className="pnav">
          <button
            className="pnavb"
            onClick={(e) => { e.stopPropagation(); back(); }}
            disabled={b === 0}
          >
            ← Back
          </button>
          <button className="pnavb pnavb-go" onClick={(e) => { e.stopPropagation(); advance(); }}>
            {b === LAST ? "Back to profile" : "Next"} →
          </button>
        </span>
      </div>
    </section>
  );
}

function BeatBoth({ data }) {
  const { r1, r2, before, after } = data;
  const delta = after - before;
  return (
    <>
      <p className="lede">
        Each square is one post you judged. Round one was before you built a fake of your own;
        round two was after.
      </p>
      <div className="legend">
        <span><i className="sw" /> Got it right</span>
        <span><i className="sw bad" /> Got it wrong</span>
      </div>
      <div className="rgrid">
        <div className="rg">
          <div className="rgk">Round one — before · {before}% right</div>
          <div className="g9">
            {r1.map((d, i) => (
              <div key={i} className={`cell in ${d.correct ? "" : "bad"}`}>{String(i + 1).padStart(2, "0")}</div>
            ))}
          </div>
        </div>
        <div className="rg">
          <div className="rgk">Round two — after · {after}% right</div>
          <div className="g9">
            {r2.map((d, i) => (
              <div key={i} className={`cell in ${d.correct ? "" : "bad"}`}>{String(r1.length + i + 1).padStart(2, "0")}</div>
            ))}
          </div>
        </div>
      </div>
      <p className="big">
        {delta > 0 ? (
          <>You went from {before}% to {after}%. <em>{delta} points better</em> after you built one yourself.</>
        ) : delta < 0 ? (
          <>You went from {before}% to {after}%. Building one made you <em>{Math.abs(delta)} points worse</em>.</>
        ) : (
          <>You scored <em>{before}% both times</em>. Building one changed nothing.</>
        )}
      </p>
      <p className="sm">
        Same four tactics both rounds. Different town, different names — so this measures whether you
        learned the tactic, not whether you remembered the answer.
      </p>
    </>
  );
}

function BeatSpeed({ data }) {
  const { A, wrong, avgW, avgR } = data;
  return (
    <>
      <p className="lede">
        How long you spent on each post before deciding. Longer bar, longer thought.
      </p>
      <div className="legend">
        <span><i className="sw grey" /> Got it right</span>
        <span><i className="sw bad" /> Got it wrong</span>
      </div>
      <div>
        {A.map((d, i) => (
          <div key={i} className={`tmr ${d.correct ? "" : "bad"}`}>
            <span className="n">{String(i + 1).padStart(2, "0")}</span>
            <span className="tmb"><i style={{ width: Math.min(100, (d.ms / 8000) * 100) + "%" }} /></span>
            <span className="v">{(d.ms / 1000).toFixed(1)}s</span>
          </div>
        ))}
      </div>
      {wrong.length ? (
        <>
          <p className="big">The ones you got wrong took <em>{avgW.toFixed(1)} seconds</em>. The ones you got right took {avgR.toFixed(1)}.</p>
          <p className="sm">You weren't fooled because you couldn't tell. You were fooled because you didn't stop.</p>
        </>
      ) : (
        <p className="big">You slowed down on every one — average <em>{avgR.toFixed(1)} seconds</em>.</p>
      )}
    </>
  );
}

function BeatAsked({ data }) {
  const { vl, A } = data;
  return (
    <>
      <p className="lede">
        When you built your own post, Vale did what you told it to. This is the list of
        what you told it.
      </p>
      <div className="chips">
        {vl.length ? vl.map((x, i) => <span key={i} className="chip hit">{x}</span>) : <span className="chip">You took the first option</span>}
      </div>
      {vl.length ? (
        <>
          <p className="big">Nobody made you ask for that. <em>You asked</em>, and it took four words.</p>
          <p className="sm">Vale told you the tactic every time. You kept going.</p>
        </>
      ) : (
        <>
          <p className="big">You took what was offered <em>without asking questions</em>.</p>
          <p className="sm">That's the same reflex the {A.length} posts you just reviewed were built for.</p>
        </>
      )}
    </>
  );
}

function BeatSignals({ data }) {
  const { missed, used, overlap } = data;
  return (
    <>
      <p className="lede">
        These are the credibility signals — verified ticks, named sources, big numbers —
        that were sitting on the posts you got wrong.
      </p>
      <div className="legend">
        <span><i className="sw bad" /> You used this one too</span>
        <span><i className="sw out" /> You didn't</span>
      </div>
      <div className="chips">
        {missed.length ? missed.map((s, i) => <span key={i} className={`chip ${used.includes(s) ? "hit" : ""}`}>{s}</span>) : <span className="chip">None got past you</span>}
      </div>
      <p className="big">
        {overlap.length ? <>You used <em>{overlap.length} of the same</em> when it was your turn.</> : <>You built with <em>{used.length} signals</em> of your own.</>}
      </p>
      <p className="sm">
        {overlap.length ? `The ${overlap[0].toLowerCase()} took one drag. So did theirs.` : "Each one took a single drag."}
      </p>
    </>
  );
}

function BeatSideBySide({ data, campaign, reach }) {
  const { trusted, A } = data;
  const shown = trusted || A[0];
  return (
    <>
      <p className="lede">
        On the left, a post from the feed. On the right, the one you wrote. Read them next
        to each other.
      </p>
      <div className="pair">
        <div className="half">
          <div className="k">{trusted ? "You trusted" : "You flagged"}</div>
          <div className="v">"{shown?.name}"</div>
        </div>
        <div className="half">
          <div className="k">You then published</div>
          <div className="v">"{campaign.head}"</div>
        </div>
      </div>
      <p className="big">The {HOOKNAME[campaign.hook]} you used to reach <em>{reach.toLocaleString()} people</em> is the same lever pulled on you.</p>
    </>
  );
}

function BeatVulnerability({ data, campaign }) {
  const prof = PROFILE[campaign.hook];
  const total = data.A.length;
  return (
    <>
      <p className="lede">Across {total} decisions and one campaign, one pattern held.</p>
      <p className="sm" style={{ marginBottom: 22 }}>
        You reached for {HOOKNAME[campaign.hook]} the moment you had the tools — and it was the fastest thing to reach for.
      </p>
      <div className="profb">
        <div className="pk">Your vulnerability</div>
        <div className="pv">{prof[0]}</div>
        <div className="habit"><b>One habit that works:</b> {prof[1]}</div>
      </div>
    </>
  );
}

const REASONS = [
  { label: "The source isn't real", value: "Fake source" },
  { label: "Real image, wrong story", value: "False context" },
  { label: "The numbers are bent", value: "Misleading numbers" },
  { label: "Built to make me feel something", value: "Emotional pull" },
];

function BeatDebrief({ data }) {
  const { A } = data;
  const [picked, setPicked] = useState({});
  return (
    <>
      <p className="lede">All {A.length} posts, explained.</p>
      {A.map((d, i) => (
        <div key={i} className="debrow">
          <span className="debidx">{String(i + 1).padStart(2, "0")}</span>
          <span className="debtxt">
            {d.name}
            <span className="debwhy">{d.why}</span>
            {d.action === "flag" && (
              <span className="debreason">
                <span className="debreasonq">In hindsight, why did you flag it?</span>
                <span className="chips">
                  {REASONS.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      className={`chip ${picked[i] === r.value ? "hit" : ""}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPicked((p) => ({ ...p, [i]: r.value }));
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </span>
              </span>
            )}
          </span>
        </div>
      ))}
    </>
  );
}
