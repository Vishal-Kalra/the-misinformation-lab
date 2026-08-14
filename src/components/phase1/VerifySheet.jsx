import { useEffect, useRef } from "react";

export default function VerifySheet({ open, post, onClose }) {
  const closeRef = useRef(null);
  const returnFocusRef = useRef(null);

  // The sheet stays mounted (it slides in/out), so focus is only moved when it
  // actually opens, and handed back to whatever opened it on close.
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      returnFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <>
      {/* Click-anywhere-outside to dismiss. A sheet you can only close with its
          own button is a small trap — and the scrim also stops clicks landing
          on the card underneath while the sheet is up. */}
      <div
        className={`sheet-scrim ${open ? "on" : ""}`}
        onPointerDown={onClose}
        aria-hidden="true"
      />
    <div
      className={`sheet ${open ? "up" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Verification tools"
      aria-hidden={!open}
      inert={!open}
    >
      <h4>Verification tools</h4>
      <p className="s">Real work, no verdict. You still decide.</p>
      <div className="vrow"><span>Outlet registered</span><span>{post?.v?.[0] ?? "—"}</span></div>
      <div className="vrow"><span>First published</span><span>{post?.v?.[1] ?? "—"}</span></div>
      <div className="vrow"><span>Image first seen</span><span>{post?.v?.[2] ?? "—"}</span></div>
      <button className="dark" ref={closeRef} onClick={onClose}>Back to the post</button>
    </div>
    </>
  );
}
