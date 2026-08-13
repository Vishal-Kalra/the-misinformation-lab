import { ARTS } from "../../data/posts";

// Signals are placed by dragging onto the canvas. Drag is pointer-only, so
// every tile is also a real button: activating it with Enter/Space places the
// signal at a sensible spot on the post via onPlace. Same result, no pointer.
export default function ArtifactPalette({ onShowWhy, onDragStart, onPlace }) {
  return (
    <>
      <div className="pal">
        {ARTS.map((a) => (
          <button
            key={a.id}
            className="pi"
            title={`${a.n} — drag onto the post, or press Enter to place it`}
            onMouseEnter={() => onShowWhy(a)}
            onFocus={() => onShowWhy(a)}
            onPointerDown={(e) => {
              e.preventDefault();
              onShowWhy(a);
              onDragStart(a);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPlace(a);
              }
            }}
          >
            <span className="i">{a.i}</span>
            <span className="n">{a.n}</span>
          </button>
        ))}
      </div>
      <p className="palhint">Drag onto the post — or press <kbd>Enter</kbd> on one to place it.</p>
    </>
  );
}
