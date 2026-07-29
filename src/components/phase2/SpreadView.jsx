import { useEffect, useRef, useState } from "react";
import { AUD_BASE } from "../../data/posts";

export default function SpreadView({ show, reach, match, cred, topArtName, onContinue }) {
  const canvasRef = useRef(null);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const cx = 200, cy = 200;
    const take = (cred / 100) * 0.85;
    const nodes = Array.from({ length: 170 }, () => {
      const a = Math.random() * 6.28, r = Math.random() * 178;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, d: r, t: Math.random() < take };
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setDisplayed(reach);
      nodes.forEach((n) => {
        ctx.beginPath(); ctx.arc(n.x, n.y, 3, 0, 7);
        ctx.fillStyle = n.t ? "#4B32A8" : "#DAD4EC"; ctx.fill();
      });
      return;
    }

    let t = 0;
    let raf;
    const loop = () => {
      t += 2.4;
      ctx.clearRect(0, 0, 400, 400);
      for (let k = 0; k < 3; k++) {
        const r = t - k * 60;
        if (r < 0 || r > 200) continue;
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7);
        ctx.strokeStyle = `rgba(75,50,168,${0.28 * (1 - r / 200)})`;
        ctx.lineWidth = 1.5; ctx.stroke();
      }
      nodes.forEach((n) => {
        const on = t > n.d && n.t;
        ctx.beginPath(); ctx.arc(n.x, n.y, on ? 3 : 1.6, 0, 7);
        ctx.fillStyle = on ? "#4B32A8" : "#DAD4EC"; ctx.fill();
      });
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 7); ctx.fillStyle = "#0F9D58"; ctx.fill();
      setDisplayed(Math.min(reach, Math.round(reach * (t / 210))));
      if (t < 210) raf = requestAnimationFrame(loop);
      else setDisplayed(reach);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [show, reach, cred]);

  if (!show) return null;

  return (
    <div id="spread" className="show">
      <canvas id="cv" ref={canvasRef} width="400" height="400" />
      <div className="num">{displayed.toLocaleString()}</div>
      <div className="numsub">{AUD_BASE.toLocaleString()} × {match}% match × {cred}% credibility</div>
      <div className="numline">The {topArtName?.toLowerCase()} did the most work — and you drew it yourself.</div>
      <button className="pbtn" style={{ maxWidth: 220 }} onClick={onContinue}>
        Go to your profile
      </button>
    </div>
  );
}
