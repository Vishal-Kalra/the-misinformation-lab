import { ARTS } from "../../data/posts";

// Inline inspector for whichever placed credibility signal is selected.
// Rendered inside the merged Signals panel (ArtifactPalette above, this
// below) rather than as its own tab — see Phase2.jsx: the two used to be
// separate tabs and placing a signal silently jumped you from one to the
// other, which read as the UI moving on its own. Caller only renders this
// when `selected` is truthy (see the "why" fallback in Phase2.jsx).
export default function PropertiesPanel({ selected, onUpdate, onRemove }) {
  const art = ARTS.find((a) => a.id === selected.id);

  return (
    <div className="el-divider">
      <span className="lab" style={{ margin: "0 0 8px" }}>Editing this signal</span>
      <div className="pname">{art.n}</div>
      <div className="pwhy">{art.why}</div>

      <span className="lab">Text</span>
      <input
        type="text"
        className="c-input"
        value={selected.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
      />

      <div className="prow">
        <span className="k">Scale</span>
        <input
          type="range" min="0.6" max="2" step="0.05"
          value={selected.scale}
          onChange={(e) => onUpdate({ scale: +e.target.value })}
        />
        <span className="v">{selected.scale.toFixed(2)}×</span>
      </div>
      <div className="prow">
        <span className="k">Rotation</span>
        <input
          type="range" min="-25" max="25"
          value={selected.rotation}
          onChange={(e) => onUpdate({ rotation: +e.target.value })}
        />
        <span className="v">{selected.rotation}°</span>
      </div>
      <div className="prow">
        <span className="k">Opacity</span>
        <input
          type="range" min="20" max="100"
          value={selected.opacity}
          onChange={(e) => onUpdate({ opacity: +e.target.value })}
        />
        <span className="v">{selected.opacity}%</span>
      </div>

      <button className="pdel" onClick={onRemove}>Remove element</button>
    </div>
  );
}
