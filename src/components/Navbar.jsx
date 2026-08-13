import { useStore, ROUND_SIZE } from "../store";

const STEPS = [
  { key: "phase1", label: "Detect" },
  { key: "phase2", label: "Campaign" },
  { key: "phase3", label: "Reveal" },
];

// Which step is "current" for breadcrumb purposes — profile sits between
// phase2 and phase3 the first time through, and after phase3 the second.
function activeIndex(phase, reflected) {
  if (phase === "phase1") return 0;
  if (phase === "phase2") return 1;
  if (phase === "phase3") return 2;
  if (phase === "profile") return reflected ? 2 : 1;
  return 0;
}

export default function Navbar({ onBack, onProfile }) {
  const phase = useStore((s) => s.phase);
  const r1 = useStore((s) => s.r1);
  const reflected = useStore((s) => s.reflected);
  const composerStep = useStore((s) => s.composerStep);

  const canGoBack = phase === "phase2" && composerStep === "composer";
  // Disabled mid-Phase-1 so jumping away can't strand an in-progress round
  // with unrecorded posts — only safe at a checkpoint. Round one has to be
  // complete for the profile to have anything to show.
  const canSeeProfile = phase !== "phase1" && r1.length >= ROUND_SIZE;
  const idx = activeIndex(phase, reflected);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          {canGoBack ? (
            <button className="navbar-back" onClick={onBack} aria-label="Back to campaign setup">
              <span aria-hidden="true">←</span> Back
            </button>
          ) : (
            <span className="navbar-brand">
              <span className="navbar-dot" />
              The Misinformation Lab
            </span>
          )}
        </div>

        <div className="navbar-steps">
          {STEPS.map((s, i) => (
            <span key={s.key} className={`navbar-step ${i === idx ? "on" : ""} ${i < idx ? "done" : ""}`}>
              <i>{i + 1}</i>
              {s.label}
            </span>
          ))}
        </div>

        <div className="navbar-right">
          <button
            className="navbar-avatar"
            onClick={onProfile}
            disabled={!canSeeProfile}
            aria-label="Your profile"
            title={canSeeProfile ? "Your profile" : "Finish Phase 1 to unlock your profile"}
          >
            <span>You</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
