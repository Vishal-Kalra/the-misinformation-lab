import { forwardRef } from "react";

// Fixed post card; credibility-signal artifacts are dropped onto it as absolutely
// positioned elements (SPEC.md §5 PostCanvas).
const PostCanvas = forwardRef(function PostCanvas({ headline, headlineSwapping, hot, placed }, ref) {
  return (
    <div className={`canvas ${hot ? "hot" : ""}`} ref={ref}>
      <div className="k-src">Riverton Daily Report · Sponsored</div>
      <div className={`k-hl ${headlineSwapping ? "sw" : ""}`}>{headline}</div>
      <div className="k-img"><em>Riverton reservoir</em></div>
      {placed.map((p) => (
        <div
          key={p.uid}
          className={`art ${p.art.cls}`}
          style={{ left: p.x, top: p.y }}
        >
          {p.art.h}
        </div>
      ))}
    </div>
  );
});

export default PostCanvas;
