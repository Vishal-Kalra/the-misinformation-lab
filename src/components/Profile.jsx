import { useEffect, useState } from "react";
import { useStore, accuracyPct } from "../store";
import { ARTS } from "../data/posts";
import { downloadSession } from "../services/exportSession";
import { clearPool } from "../services/communityPool";

export default function Profile({ onRoundTwo, onSeeResult }) {
  const campaign = useStore((s) => s.campaign);
  const placedArtifacts = useStore((s) => s.placedArtifacts);
  const postSource = useStore((s) => s.postSource);
  const postImage = useStore((s) => s.postImage);
  const postImageCaption = useStore((s) => s.postImageCaption);
  const reach = useStore((s) => s.reach);
  const cred = useStore((s) => s.cred);
  const r1 = useStore((s) => s.r1);
  const r2 = useStore((s) => s.r2);
  const reflected = useStore((s) => s.reflected);
  const restart = useStore((s) => s.reset);

  const before = accuracyPct(r1);
  const after = accuracyPct(r2);
  const hasRoundTwo = r2.length > 0;
  const delta = after - before;

  const [bars, setBars] = useState({ before: 0, after: 0 });

  useEffect(() => {
    const t = setTimeout(() => setBars({ before, after }), 120);
    return () => clearTimeout(t);
  }, [before, after]);

  // One tester's published fake lands in the pool that feeds the next tester's
  // round 2, so the reset between sessions has to clear it too — otherwise the
  // eight sessions aren't independent.
  const resetForNextTester = () => {
    clearPool();
    restart();
  };

  return (
    <section id="prof" className="scr">
      <div className="bar">
        <span className="logo">stream</span>
        <span className="cnt">Profile</span>
      </div>
      <div className="phead">
        <div className="prow">
          <div className="pav" />
          <div>
            <div className="pname">Riverton Daily Report <span className="ptick">✓</span></div>
            <div className="phandle">@riverton_daily · joined today</div>
          </div>
        </div>
        <div className="pstats">
          <div className="pstat"><div className="n">1</div><div className="l">posts</div></div>
          <div className="pstat"><div className="n">{reach.toLocaleString()}</div><div className="l">reached</div></div>
          <div className="pstat"><div className="n">{cred}%</div><div className="l">credibility</div></div>
        </div>
      </div>

      <div className="psec">
        <div className="psech">Your posts</div>
        <div className="ppost">
          <div className="cmeta">
            <div className="av" style={{ background: "linear-gradient(135deg,#C3AFD9,#7C63A8)" }} />
            <div>
              <div className="nm">{postSource}</div>
              <div className="sb">Published just now</div>
            </div>
          </div>
          <div className="ctxt" style={{ fontWeight: 600 }}>{campaign.head}</div>
          <div className="cimg" style={{ background: postImage || "linear-gradient(150deg,#9DB4D6,#6E88B4)", minHeight: 112 }}>
            <em>{postImageCaption}</em>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, padding: "9px 14px 0" }}>
            {placedArtifacts.map((p) => {
              const a = ARTS.find((x) => x.id === p.id);
              return <span key={p.uid} className={`art ${a.cls}`} style={{ position: "static" }}>{p.text}</span>;
            })}
          </div>
          <div className="ceng">
            <span>{Math.round(reach * 0.28).toLocaleString()} reactions</span>
            <span>{Math.round(reach * 0.19).toLocaleString()} shares</span>
          </div>
        </div>
      </div>

      <div className="psec">
        <div className="psech">Your test results</div>
        <div className="presult">
          <div className="prtop"><span className="prname">Round one — before</span><span className="prscore">{before}%</span></div>
          <div className="prbar"><i style={{ width: bars.before + "%" }} /></div>
        </div>
        {hasRoundTwo ? (
          <>
            <div className="presult">
              <div className="prtop"><span className="prname">Round two — after</span><span className="prscore">{after}%</span></div>
              <div className="prbar"><i style={{ width: bars.after + "%" }} /></div>
            </div>
            <div className={`pdelta ${delta > 0 ? "up" : delta < 0 ? "down" : ""}`}>
              <span className="pdn">{delta > 0 ? "+" : ""}{delta}</span>
              <span className="pdl">
                {delta > 0
                  ? "points, after you built one yourself"
                  : delta < 0
                    ? "points. Building one didn't make you harder to fool."
                    : "points. No change either way."}
              </span>
            </div>
          </>
        ) : (
          <p className="prnote">Round two is the other half of the measurement — take it to see whether building a fake changed how you read them.</p>
        )}
      </div>

      {!hasRoundTwo ? (
        <button className="pbtn2" onClick={onRoundTwo}>Take round two</button>
      ) : reflected ? (
        <div className="pactions">
          <button className="pbtn2" onClick={onSeeResult}>Replay the reveal</button>
          <button className="pbtn2 pbtn2-ghost" onClick={() => downloadSession(useStore.getState())}>
            Download session data
          </button>
          <button className="pbtn2 pbtn2-ghost" onClick={resetForNextTester}>Reset for next tester</button>
        </div>
      ) : (
        <button className="pbtn2" onClick={onSeeResult}>See what it means</button>
      )}
    </section>
  );
}
