export default function CredibilityMeter({ cred, onLaunch, disabled, blockedReason }) {
  return (
    <div className="pad">
      <div className="meter">
        <span>Credibility</span>
        <span className="mb"><i style={{ background: "var(--go)", width: cred + "%" }} /></span>
        <span className="mv">{cred}%</span>
      </div>
      <button className="pbtn" onClick={onLaunch} disabled={disabled}>
        Publish to your profile
      </button>
      {/* A disabled primary button with no stated reason is the most common way
          a first-timer gets stuck here. */}
      <p className="pblock">{blockedReason || " "}</p>
    </div>
  );
}
