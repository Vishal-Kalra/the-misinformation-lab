export default function CredibilityMeter({ cred, onLaunch, disabled }) {
  return (
    <div className="pad">
      <div className="meter">
        <span>Credibility</span>
        <span className="mb"><i style={{ background: "var(--go)", width: cred + "%" }} /></span>
        <span className="mv">{cred}%</span>
      </div>
      <button className="pbtn" style={{ marginBottom: 18 }} onClick={onLaunch} disabled={disabled}>
        Publish to your profile
      </button>
    </div>
  );
}
