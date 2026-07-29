export default function VerifySheet({ open, post, onClose }) {
  return (
    <div className={`sheet ${open ? "up" : ""}`}>
      <h4>Verification tools</h4>
      <p className="s">Real work, no verdict. You still decide.</p>
      <div className="vrow"><span>Outlet registered</span><span>{post?.v?.[0] ?? "—"}</span></div>
      <div className="vrow"><span>First published</span><span>{post?.v?.[1] ?? "—"}</span></div>
      <div className="vrow"><span>Image first seen</span><span>{post?.v?.[2] ?? "—"}</span></div>
      <button className="dark" onClick={onClose}>Back to the post</button>
    </div>
  );
}
