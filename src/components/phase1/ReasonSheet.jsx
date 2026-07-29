const REASONS = [
  { label: "The source isn't real", value: "Fake source" },
  { label: "Real image, wrong story", value: "False context" },
  { label: "The numbers are bent", value: "Misleading numbers" },
  { label: "Built to make me feel something", value: "Emotional pull" },
];

export default function ReasonSheet({ open, onSelect }) {
  return (
    <div className={`sheet ${open ? "up" : ""}`}>
      <h4>Why did you flag it?</h4>
      <p className="s">This shows whether you actually saw it.</p>
      {REASONS.map((r) => (
        <button key={r.value} className="opt" onClick={() => onSelect(r.value)}>
          {r.label}
        </button>
      ))}
    </div>
  );
}
