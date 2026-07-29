import { ARTS } from "../../data/posts";

export default function ArtifactPalette({ onShowWhy, onDragStart }) {
  return (
    <>
      <div className="pal">
        {ARTS.map((a) => (
          <button
            key={a.id}
            className="pi"
            onMouseEnter={() => onShowWhy(a)}
            onPointerDown={(e) => {
              e.preventDefault();
              onShowWhy(a);
              onDragStart(a);
            }}
          >
            <span className="i">{a.i}</span>
            <span className="n">{a.n}</span>
          </button>
        ))}
      </div>
    </>
  );
}
