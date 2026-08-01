import { useEffect, useState } from "react";
import { useStore, accuracyPct } from "../store";
import { ARTS } from "../data/posts";

export default function Profile({ onSeeResult }) {
  const campaign = useStore((s) => s.campaign);
  const placedArtifacts = useStore((s) => s.placedArtifacts);
  const postSource = useStore((s) => s.postSource);
  const postImage = useStore((s) => s.postImage);
  const postImageCaption = useStore((s) => s.postImageCaption);
  const reach = useStore((s) => s.reach);
  const cred = useStore((s) => s.cred);
  const decisions = useStore((s) => s.decisions);
  const reflected = useStore((s) => s.reflected);
  const restart = useStore((s) => s.reset);

  const acc = accuracyPct(decisions);

  const [bar, setBar] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBar(acc), 120);
    return () => clearTimeout(t);
  }, [acc]);

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
          <div className="prtop"><span className="prname">Detection accuracy</span><span className="prscore">{acc}%</span></div>
          <div className="prbar"><i style={{ width: bar + "%" }} /></div>
        </div>
      </div>

      {reflected ? (
        <div className="pactions">
          <button className="pbtn2" onClick={onSeeResult}>Replay the reveal</button>
          <button className="pbtn2 pbtn2-ghost" onClick={restart}>Start over</button>
        </div>
      ) : (
        <button className="pbtn2" onClick={onSeeResult}>
          See what it means
        </button>
      )}
    </section>
  );
}
