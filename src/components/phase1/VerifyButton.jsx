// The old label said "Costs you 20 seconds", which isn't what happens — nothing
// is deducted. What actually costs you is real time on the clock that's already
// running, which is the honest version and the more interesting one.
export default function VerifyButton({ onClick, disabled }) {
  return (
    <button className="vbtn" onClick={onClick} disabled={disabled}>
      Check this post first
      <small>Shows you who published it and when. The clock keeps running.</small>
    </button>
  );
}
