import { ARTS } from "../../data/posts";

// Properties tab — shown when a placed credibility signal is selected on the
// canvas. Scale/rotation/opacity sliders plus a text override, matching the
// drag-select-edit model from phase2-composer-properties.html. Nothing to
// show when no artifact is selected (SPEC.md's ArtifactPalette + canvas).
export default function PropertiesPanel({ selected, onUpdate, onRemove }) {
  if (!selected) {
    return (
      <div className="tp on" id="t-pr">
        <p className="pnone">Select a signal on the post to edit it.</p>
      </div>
    );
  }

  const art = ARTS.find((a) => a.id === selected.id);

  return (
    <div className="tp on" id="t-pr">
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
