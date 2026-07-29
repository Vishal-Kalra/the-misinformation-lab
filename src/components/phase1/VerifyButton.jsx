export default function VerifyButton({ onClick, disabled }) {
  return (
    <button className="vbtn" onClick={onClick} disabled={disabled}>
      Verify this post
      <small>Costs you 20 seconds</small>
    </button>
  );
}
