import { useState } from "react";

// Reusable white-flash + one-line interstitial (SPEC.md §5).
export default function Interstitial({ kicker, headline, body, buttonLabel, onContinue }) {
  const [fading, setFading] = useState(false);

  const handleClick = () => {
    setFading(true);
    setTimeout(onContinue, 480);
  };

  return (
    <div className="inter" style={{ opacity: fading ? 0 : 1 }}>
      <span className="k">{kicker}</span>
      <h2>{headline}</h2>
      <p>{body}</p>
      <button onClick={handleClick}>{buttonLabel}</button>
    </div>
  );
}
