import { forwardRef, useEffect, useRef } from "react";
import { ARTS } from "../../data/posts";

// Editable text bound to an external value without fighting the cursor:
// only forces the DOM to match `value` when they've actually diverged
// (i.e. the change came from elsewhere — Vale, an option pick — not from
// the user's own keystroke, which already updated `value` to match).
function EditableText({ value, onChange, className, editable }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);
  if (!editable) return <div className={className}>{value}</div>;
  return (
    <div
      ref={ref}
      className={className}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => onChange(e.currentTarget.textContent)}
      onPointerDown={(e) => e.stopPropagation()}
    />
  );
}

// Live, accurate post preview — whatever tool is editing (Vale rewriting the
// campaign draft, or the Contribute tool building a separate post) is
// reflected here exactly as it will look. When `editable`, this also behaves
// like a small design-tool canvas: click straight into the headline/source
// to retype them, click the image to swap it, and drag credibility signals
// onto arbitrary positions — matching the drag/select/properties model from
// phase2-composer-properties.html (SPEC.md §5 PostCanvas + ArtifactPalette).
const PostCanvas = forwardRef(function PostCanvas(
  {
    source, onSourceChange,
    headline, headlineSwapping, onHeadlineChange,
    image, imageCaption, onImageClick,
    imagePicker,
    hot,
    placed, selectedUid,
    editable,
    onArtifactPointerDown,
    onCanvasPointerDown,
  },
  ref
) {
  return (
    <div className={`canvas ${hot ? "hot" : ""}`} ref={ref} onPointerDown={editable ? onCanvasPointerDown : undefined}>
      <EditableText className="k-src" value={source} onChange={onSourceChange} editable={editable} />
      <EditableText
        className={`k-hl ${headlineSwapping ? "sw" : ""}`}
        value={headline}
        onChange={onHeadlineChange}
        editable={editable}
      />
      <div
        className={`k-img ${editable ? "swap" : ""}`}
        style={image ? { background: image } : undefined}
        onClick={editable ? onImageClick : undefined}
        onPointerDown={editable ? (e) => e.stopPropagation() : undefined}
      >
        <em>{imageCaption}</em>
        {editable && <span className="k-img-hint">Click to swap image</span>}
        {imagePicker}
      </div>
      {placed.map((p) => {
        const art = ARTS.find((a) => a.id === p.id);
        return (
          <div
            key={p.uid}
            className={`art ${art.cls} ${selectedUid === p.uid ? "sel" : ""}`}
            style={{
              left: p.x,
              top: p.y,
              transform: `scale(${p.scale}) rotate(${p.rotation}deg)`,
              opacity: p.opacity / 100,
              cursor: editable ? "grab" : "default",
            }}
            onPointerDown={editable ? (e) => { e.stopPropagation(); onArtifactPointerDown(p.uid, e); } : undefined}
          >
            {p.text}
          </div>
        );
      })}
    </div>
  );
});

export default PostCanvas;
