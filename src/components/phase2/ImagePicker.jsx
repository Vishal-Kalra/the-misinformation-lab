import { useEffect, useRef, useState } from "react";
import { generateVisualTheme } from "../../services/valeService";
import { SCENES, sceneBackground } from "../../data/posts";

// The post's picture picker — click the canvas image to open this. Three ways
// in: the curated illustrated set, a keyword match against the headline, or the
// learner's own photo.
//
// Note on upload, because it matters for how this project is described: with it
// enabled, a learner *can* pair a real photograph with a fabricated headline, so
// the app can no longer claim it "cannot produce a usable fake" (SPEC.md §7).
// It's kept because attaching a real photo to a false claim is the single most
// common real-world tactic, and doing it yourself teaches it faster than reading
// about it. The honest framing is a sandbox that shows you how easy the real
// thing is — not one that is incapable of it. Uploads are compressed client-side
// and never leave the browser.
export default function ImagePicker({ headline, onPick, onClose }) {
  const [status, setStatus] = useState("");
  const panelRef = useRef(null);
  const firstRef = useRef(null);
  const fileInputRef = useRef(null);
  const returnFocusRef = useRef(null);

  // Esc to close, focus into the modal on open and back to wherever it came
  // from on close, and Tab kept inside while it's open.
  useEffect(() => {
    returnFocusRef.current = document.activeElement;
    firstRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnFocusRef.current?.focus?.();
    };
  }, [onClose]);

  // Downscaled to 720px wide and re-encoded as JPEG before it goes anywhere, so
  // a 12MP phone photo doesn't sit in memory (or localStorage, if the post is
  // published to the pool) at full size.
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 720;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        onPick(`url("${canvas.toDataURL("image/jpeg", 0.72)}") center/cover`, "Your photo");
      };
      img.onerror = () => setStatus("That file couldn't be read as an image.");
      img.src = ev.target.result;
    };
    reader.onerror = () => setStatus("That file couldn't be read.");
    reader.readAsDataURL(file);
  };

  const handleAiGenerate = () => {
    if (!headline || !headline.trim()) {
      setStatus("Write a headline first — the picture is matched to it.");
      return;
    }
    const { img, label } = generateVisualTheme(headline);
    onPick(img, label);
  };

  return (
    <div className="img-picker-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="img-picker"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Set the post's picture"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="img-picker-head">
          <span className="lab" style={{ margin: 0 }}>Set the post's picture</span>
          <button className="ip-close" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="img-picker-actions">
          <button ref={firstRef} className="c-upload" onClick={handleAiGenerate}>
            ✦ Match one to my headline
          </button>
          <button className="c-upload" onClick={() => fileInputRef.current.click()}>
            Upload your own photo
          </button>
        </div>
        {status && <p className="c-status">{status}</p>}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />

        <div className="scene-grid">
          {SCENES.map((s) => (
            <button
              key={s.id}
              className="scene"
              onClick={() => onPick(sceneBackground(s), s.label)}
              title={s.label}
            >
              <span className="scene-img" style={{ background: sceneBackground(s) }} />
              <span className="scene-lab">{s.label}</span>
            </button>
          ))}
        </div>

        <p className="c-note">
          {SCENES.length} illustrations, all invented — or bring your own photo. Either way, notice that
          the picture proves nothing: the same image works under a true caption or a false one. That's
          the whole trick. Pictures are used as evidence far more often than they are evidence.
        </p>
      </div>
    </div>
  );
}
