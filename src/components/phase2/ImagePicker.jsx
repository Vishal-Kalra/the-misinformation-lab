import { useRef, useState } from "react";
import { generateVisualTheme } from "../../services/valeService";

// The post's picture picker — click the canvas image to open this. Two ways
// in, both producing an actual picture rather than a flat color block:
// attach your own, or have AI generate an illustrated one matched to your
// headline. Rendered as a full-screen modal (see Phase2.jsx) rather than
// nested inside the canvas's small image thumbnail — that's what used to
// make it cramped and force scrolling to read the note at the bottom.
export default function ImagePicker({ headline, onPick, onClose }) {
  const [status, setStatus] = useState("");
  const fileInputRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 320;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
        onPick(`url(${dataUrl}) center/cover`, "Uploaded image");
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleAiGenerate = () => {
    if (!headline || !headline.trim()) {
      setStatus("Write a headline first — AI generates a picture to match it.");
      return;
    }
    const { img, label } = generateVisualTheme(headline);
    onPick(img, label);
  };

  return (
    <div className="img-picker-overlay" onPointerDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="img-picker" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <div className="img-picker-head">
          <span className="lab" style={{ margin: 0 }}>Set the post's picture</span>
          <button className="ip-close" aria-label="Close" onClick={onClose}>×</button>
        </div>
        <div className="img-picker-actions">
          <button className="c-upload" onClick={() => fileInputRef.current.click()}>Attach your own picture</button>
          <button className="c-upload" onClick={handleAiGenerate}>✦ Generate one with AI</button>
        </div>
        {status && <p className="c-status">{status}</p>}
        <p className="c-note">
          AI generates an illustrated picture matched to your headline's theme — never photoreal, and it
          can't depict a real person, place, or event.
        </p>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
    </div>
  );
}
