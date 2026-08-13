import { useEffect, useRef, useState } from "react";

// Pointer-driven swipe card. Swipe left = flag as fake, swipe right = looks genuine.
// Buttons remain visible at all times (SPEC.md §5 / phase1-swipe-prototype.html).
export default function SwipeCard({ post, locked, flyDir, onThreshold }) {
  const cardRef = useRef(null);
  const tlRef = useRef(null);
  const trRef = useRef(null);
  const dragState = useRef({ down: false, x0: 0, dx: 0 });
  const [transitionOn, setTransitionOn] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const move = (e) => {
      if (!dragState.current.down || locked) return;
      const dx = e.clientX - dragState.current.x0;
      dragState.current.dx = dx;
      el.style.transform = `translateX(${dx}px) rotate(${dx * 0.05}deg)`;
      if (tlRef.current) tlRef.current.style.opacity = dx < 0 ? Math.min(1, -dx / 85) : 0;
      if (trRef.current) trRef.current.style.opacity = dx > 0 ? Math.min(1, dx / 85) : 0;
    };
    const up = () => {
      if (!dragState.current.down) return;
      dragState.current.down = false;
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      const dx = dragState.current.dx;
      if (Math.abs(dx) > 85) {
        onThreshold(dx < 0 ? "flag" : "trust");
      } else {
        setTransitionOn(true);
        el.style.transform = "";
        if (tlRef.current) tlRef.current.style.opacity = 0;
        if (trRef.current) trRef.current.style.opacity = 0;
        setTimeout(() => setTransitionOn(false), 230);
      }
    };
    const down = (e) => {
      if (locked) return;
      dragState.current.down = true;
      dragState.current.x0 = e.clientX;
      dragState.current.dx = 0;
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };
    el.addEventListener("pointerdown", down);
    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, locked]);

  const flyStyle = flyDir
    ? {
        transition: "transform .34s, opacity .34s",
        transform: `translateX(${flyDir * 520}px) rotate(${flyDir * 22}deg)`,
        opacity: 0,
      }
    : { transition: transitionOn ? "transform .22s" : "" };

  return (
    <div className="card" ref={cardRef} style={flyStyle}>
      <div className="tag tl" ref={tlRef}>FAKE</div>
      <div className="tag tr" ref={trRef}>REAL</div>
      <div className="cmeta">
        <div className="av" style={{ background: post.av }} />
        <div>
          <div className="nm">{post.name}</div>
          <div className="sb">{post.sub}</div>
        </div>
      </div>
      <div className="ctxt">{post.txt}</div>
      <div className="cimg" style={{ background: post.img }}>
        <em>{post.cap}</em>
      </div>
      <div className="ceng">
        <span>{post.eng[0]}</span>
        <span>{post.eng[1]}</span>
      </div>
    </div>
  );
}
