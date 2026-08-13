// "Flag" / "Trust" assumed platform vocabulary a 14-year-old may not share.
// The verbs are now the decision itself, with the gesture named underneath so
// the swipe direction is learnable rather than guessable.
export default function ActionBar({ onFlag, onTrust, disabled }) {
  return (
    <div className="acts">
      <button className="act flag" onClick={onFlag} disabled={disabled}>
        This is fake
        <small>swipe left</small>
      </button>
      <button className="act trust" onClick={onTrust} disabled={disabled}>
        This is real
        <small>swipe right</small>
      </button>
    </div>
  );
}
