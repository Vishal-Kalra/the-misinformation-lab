export default function ActionBar({ onFlag, onTrust, disabled }) {
  return (
    <div className="acts">
      <button className="act flag" onClick={onFlag} disabled={disabled}>Flag as fake</button>
      <button className="act trust" onClick={onTrust} disabled={disabled}>Looks genuine</button>
    </div>
  );
}
