import { useEffect, useState } from "react";
import { useStore, accuracyPct } from "../store";
import { ARTS } from "../data/posts";

export default function Profile({ onTakeRoundTwo, onSeeResult }) {
  const campaign = useStore((s) => s.campaign);
  const placedArtifacts = useStore((s) => s.placedArtifacts);
  const postSource = useStore((s) => s.postSource);
  const postImage = useStore((s) => s.postImage);
  const postImageCaption = useStore((s) => s.postImageCaption);
  const reach = useStore((s) => s.reach);
  const cred = useStore((s) => s.cred);
  const r1 = useStore((s) => s.r1);
  const r2 = useStore((s) => s.r2);

  const done2 = r2.length > 0;
  const acc1 = accuracyPct(r1);
  const acc2 = accuracyPct(r2);
  const delta = acc2 - acc1;

  const [bar1, setBar1] = useState(0);
  const [bar2, setBar2] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setBar1(acc1);
      setBar2(acc2);
    }, 120);
    return () => clearTimeout(t);
  }, [acc1, acc2]);

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
          <div className="prtop"><span className="prname">Round 1 — before</span><span className="prscore">{acc1}%</span></div>
          <div className="prbar"><i style={{ width: bar1 + "%" }} /></div>
        </div>
        <div className="presult">
          <div className="prtop">
            <span className="prname">Round 2 — after</span>
            <span className="prscore">{done2 ? acc2 + "%" : "—"}</span>
          </div>
          {done2 ? <div className="prbar"><i style={{ width: bar2 + "%" }} /></div> : <div className="prpend">Not taken yet</div>}
        </div>
        {done2 && (
          <div className="pdelta">
            <div className="n">{delta > 0 ? "+" : ""}{delta} points</div>
            <div className="l">change in detection accuracy</div>
          </div>
        )}
      </div>

      <button className="pbtn2" onClick={done2 ? onSeeResult : onTakeRoundTwo}>
        {done2 ? "See what it means" : "Take round two"}
      </button>
    </section>
  );
}
