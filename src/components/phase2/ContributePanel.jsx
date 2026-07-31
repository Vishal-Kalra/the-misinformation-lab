import { useRef, useState } from "react";
import { TACTICS, CONTRIBUTE_IMAGES, HOOKNAME } from "../../data/posts";
import { generateForTactic, generateGenuine, generateVisualTheme } from "../../services/valeService";
import { addToPool, buildCommunityPost, getPoolCount } from "../../services/communityPool";

const HOOKS = Object.keys(HOOKNAME); // fear | outrage | belonging | pride

// Contribute tool — build an extra post (fake, by explicit tactic, or
// genuine) that's saved to the local community pool and mixed into a future
// Round 2 on this browser. Ported from a teammate's prototype; see
// docs/TECH_STACK.md for why this stays local-only rather than shared.
//
// source/headline/image/imageLabel are owned by Phase2 (not local state)
// so the shared PostCanvas on the left can render this draft live while
// this tab is active — the same way it live-reflects Vale's rewrites.
export default function ContributePanel({ source, setSource, headline, setHeadline, image, setImage, imageLabel, setImageLabel }) {
  const [isFake, setIsFake] = useState(true);
  const [tacticId, setTacticId] = useState(TACTICS[0].id);
  const [hook, setHook] = useState(HOOKS[0]);
  const [status, setStatus] = useState("");
  const [poolCount, setPoolCount] = useState(getPoolCount());
  const fileInputRef = useRef(null);

  const tactic = TACTICS.find((t) => t.id === tacticId);

  const handleGenerate = () => {
    const result = isFake
      ? generateForTactic(tactic, { source: source.trim(), hook })
      : generateGenuine({ source: source.trim() });
    setHeadline(result.headline);
    if (!source.trim()) setSource(result.source);
    setStatus("Generated — edit freely before submitting.");
  };

  const handleGenerateVisual = () => {
    if (!headline.trim()) {
      setStatus("Write or generate a headline first.");
      return;
    }
    const theme = generateVisualTheme(headline);
    setImage(theme.grad);
    setImageLabel(theme.label);
    setStatus(`Visual theme applied: ${theme.label}. Pick a swatch or upload instead if you'd rather.`);
  };

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
        setImage(`url(${dataUrl}) center/cover`);
        setImageLabel("Uploaded image");
        setStatus("Image attached.");
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setSource("");
    setHeadline("");
    setImage(CONTRIBUTE_IMAGES[0][1]);
    setImageLabel(CONTRIBUTE_IMAGES[0][0]);
    setStatus("Cleared.");
  };

  const handleSubmit = () => {
    if (!source.trim() || !headline.trim()) {
      setStatus("Add a source and a headline first.");
      return;
    }
    const post = buildCommunityPost({
      isFake,
      source: source.trim(),
      headline: headline.trim(),
      tactic: isFake ? tactic : null,
      img: image,
      cap: imageLabel,
    });
    const count = addToPool(post);
    setPoolCount(count);
    setStatus("Submitted — it'll show up mixed into a future round two on this browser.");
    setSource("");
    setHeadline("");
  };

  return (
    <div className="tp on" id="t-contribute">
      <div className="c-toggle">
        <button className={isFake ? "on" : ""} onClick={() => setIsFake(true)}>Misinformation</button>
        <button className={!isFake ? "on" : ""} onClick={() => setIsFake(false)}>Genuine post</button>
      </div>

      {isFake && (
        <div className="c-row2">
          <div>
            <span className="lab">Tactic</span>
            <select value={tacticId} onChange={(e) => setTacticId(e.target.value)}>
              {TACTICS.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="lab">Emotional hook</span>
            <select value={hook} onChange={(e) => setHook(e.target.value)}>
              {HOOKS.map((h) => (
                <option key={h} value={h}>{HOOKNAME[h]}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <span className="lab">Source name</span>
      <input
        type="text"
        className="c-input"
        value={source}
        onChange={(e) => setSource(e.target.value)}
        placeholder={isFake ? "e.g. Riverton Weekly" : "e.g. Community Notice"}
      />

      <span className="lab">Headline</span>
      <textarea
        className="c-textarea"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
        placeholder="Write it yourself, or generate one"
        rows={3}
      />
      <div className="c-row2">
        <button className="pbtn" style={{ marginTop: 8 }} onClick={handleGenerate}>Generate with Vale</button>
        <button className="c-upload" style={{ marginTop: 8 }} onClick={handleClear}>Clear</button>
      </div>

      <span className="lab" style={{ marginTop: 14 }}>Image</span>
      <div className="c-imggrid">
        {CONTRIBUTE_IMAGES.map(([name, grad]) => (
          <button
            key={name}
            className={`c-img ${image === grad ? "on" : ""}`}
            style={{ background: grad }}
            aria-label={name}
            onClick={() => { setImage(grad); setImageLabel(name); }}
          />
        ))}
      </div>
      <div className="c-row2">
        <button className="c-upload" onClick={() => fileInputRef.current.click()}>Upload your own image</button>
        <button className="c-upload" onClick={handleGenerateVisual}>✦ AI Visual</button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <p className="c-note">
        AI Visual picks a themed gradient by matching keywords in your headline — no image-generation
        API involved, still never photoreal. Image upload is a deviation from the original build spec
        (which called for a curated illustrated set only) — added at the team's request.
      </p>

      <button className="pbtn" onClick={handleSubmit} disabled={!source.trim() || !headline.trim()}>
        Submit to community pool
      </button>
      {status && <p className="c-status">{status}</p>}
      <p className="c-poolcount">
        In your local pool: <b>{poolCount}</b> — mixed into a future round two, this browser only.
      </p>
    </div>
  );
}
