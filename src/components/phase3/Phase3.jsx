import { useEffect, useMemo, useState } from "react";
import { useStore, accuracyPct } from "../../store";
import { ARTS, HOOKNAME, PROFILE } from "../../data/posts";

export default function Phase3({ onDone }) {
  const decisions = useStore((s) => s.decisions);
  const valeLog = useStore((s) => s.valeLog);
  const artifacts = useStore((s) => s.artifacts);
  const campaign = useStore((s) => s.campaign);
  const reach = useStore((s) => s.reach);

  const [b, setB] = useState(0);
  const [entered, setEntered] = useState(false);

  const data = useMemo(() => {
    const A = decisions;
    const wrong = A.filter((d) => !d.correct);
    const right = A.filter((d) => d.correct);
    const avgW = wrong.length ? wrong.reduce((s, d) => s + d.ms, 0) / wrong.length / 1000 : 0;
    const avgR = right.length ? right.reduce((s, d) => s + d.ms, 0) / right.length / 1000 : 0;
    const missed = [...new Set(wrong.flatMap((d) => d.signals))];
    const used = artifacts.map((id) => ARTS.find((a) => a.id === id).n);
    const overlap = used.filter((u) => missed.includes(u));
    const prof = PROFILE[campaign.hook];
    const trusted = A.find((d) => !d.correct && d.fake);
    const acc = accuracyPct(A);
    const seen = {};
    const vl = valeLog.filter((x) => (seen[x] = (seen[x] || 0) + 1) === 1).map((x) => {
      const c = valeLog.filter((y) => y === x).length;
      return c > 1 ? `${x} ×${c}` : x;
    });
    return { A, wrong, right, avgW, avgR, missed, used, overlap, prof, trusted, acc, vl };
  }, [decisions, valeLog, artifacts, campaign]);

  useEffect(() => {
    setEntered(false);
    const t = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(t);
  }, [b]);

  const advance = () => {
    if (b < 6) setB(b + 1);
    else onDone();
  };

  const labels = [
    "Your round", "Decision speed", "What you asked for", "Signals",
    "Side by side", "Your vulnerability", "Debrief",
  ];

  return (
    <section id="p3" className="scr" onClick={advance}>
      <div className="plab">{labels[b]}</div>
      <div className={`beat ${entered ? "in" : ""}`}>
        {b === 0 && <BeatBoth data={data} />}
        {b === 1 && <BeatSpeed data={data} />}
        {b === 2 && <BeatAsked data={data} />}
        {b === 3 && <BeatSignals data={data} />}
        {b === 4 && <BeatSideBySide data={data} campaign={campaign} reach={reach} />}
        {b === 5 && <BeatVulnerability data={data} campaign={campaign} />}
        {b === 6 && <BeatDebrief data={data} />}
      </div>
      <div className="pfoot">
        <span>
          {labels.map((_, i) => (
            <i key={i} className="dot" style={{ background: i <= b ? "#111" : "#DADADA" }} />
          ))}
        </span>
        <span className="adv">{b === 6 ? "BACK TO PROFILE →" : "TAP TO CONTINUE →"}</span>
      </div>
    </section>
  );
}

function BeatBoth({ data }) {
  const { A, wrong, acc } = data;
  return (
    <>
      <p className="lede">You reviewed five posts before you built one of your own.</p>
      <div className="g9">
        {A.map((d, i) => (
          <div key={i} className={`cell in ${d.correct ? "" : "bad"}`}>{String(i + 1).padStart(2, "0")}</div>
        ))}
      </div>
      <p className="lede">
        You got <b>{acc}%</b> right.{" "}
        {wrong.length
          ? `The ${wrong.length} you missed used the same tactics you reached for a few minutes later.`
          : "You caught every one — worth remembering once you see what you built next."}
      </p>
    </>
  );
}

function BeatSpeed({ data }) {
  const { A, wrong, avgW, avgR } = data;
  return (
    <>
      <p className="lede">How long each decision took.</p>
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
  const { vl } = data;
  return (
    <>
      <p className="lede">Every change you asked Vale to make.</p>
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
          <p className="sm">That's the same reflex the five posts you just reviewed were built for.</p>
        </>
      )}
    </>
  );
}

function BeatSignals({ data }) {
  const { missed, used, overlap } = data;
  return (
    <>
      <p className="lede">Signals on the posts that got past you.</p>
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
      <p className="lede">Read these next to each other.</p>
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

function BeatVulnerability({ campaign }) {
  const prof = PROFILE[campaign.hook];
  return (
    <>
      <p className="lede">Across five decisions and one campaign, one pattern held.</p>
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
      <p className="lede">All five posts, explained.</p>
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
