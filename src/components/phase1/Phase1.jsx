import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store";
import FeedHeader from "./FeedHeader";
import SwipeCard from "./SwipeCard";
import ActionBar from "./ActionBar";
import VerifyButton from "./VerifyButton";
import VerifySheet from "./VerifySheet";

export default function Phase1({ onDone }) {
  const i = useStore((s) => s.i);
  const round = useStore((s) => s.round);
  const posts = useStore((s) => s.posts)();
  const recordDecision = useStore((s) => s.recordDecision);
  const advancePost = useStore((s) => s.advancePost);

  const [locked, setLocked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [flyDir, setFlyDir] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  // Announced to screen readers on every decision — the card flying off is the
  // only feedback sighted users get, and it isn't available non-visually.
  const [announcement, setAnnouncement] = useState("");
  const t0 = useRef(0);

  const post = posts[i];

  useEffect(() => {
    setLocked(false);
    setVerified(false);
    setFlyDir(null);
    setVerifyOpen(false);
    t0.current = performance.now();
  }, [i]);

  const record = (action, reason, ms) => {
    recordDecision({
      i,
      action,
      reason: reason ?? null,
      ms,
      verified,
      correct: (action === "flag") === post.fake,
      fake: post.fake,
      name: post.name,
      why: post.why,
      signals: post.signals,
    });
  };

  const goNext = () => {
    setTimeout(() => {
      if (i + 1 >= posts.length) {
        onDone();
      } else {
        advancePost();
      }
    }, 350);
  };

  const decide = (action) => {
    if (locked || !post) return;
    setLocked(true);
    // The per-post reset lives in the effect on `i`, but the last post of a
    // round never advances `i` — it calls onDone() instead. Without closing
    // here, deciding the fifth post while the verify sheet is open left the
    // sheet on screen underneath the interstitial.
    setVerifyOpen(false);
    const ms = Math.round(performance.now() - t0.current);
    setFlyDir(action === "flag" ? -1 : 1);
    setAnnouncement(
      `${action === "flag" ? "Flagged" : "Trusted"}. ${
        i + 1 >= posts.length ? "Round complete." : `Post ${i + 2} of ${posts.length}.`
      }`
    );
    record(action, null, ms);
    goNext();
  };

  const handleVerify = () => {
    setVerified(true);
    setVerifyOpen(true);
  };

  useEffect(() => {
    const onKey = (e) => {
      // Don't steal the arrows while the verify sheet has focus.
      if (verifyOpen) return;
      if (e.key === "ArrowLeft") decide("flag");
      if (e.key === "ArrowRight") decide("trust");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, post, verified, verifyOpen]);

  if (!post) return null;

  return (
    <section id="p1" className="scr">
      <FeedHeader index={i} total={posts.length} round={round} />
      {/* The task was never stated on screen — the feed just appeared and the
          learner had to infer what the two buttons meant. */}
      <div className="taskline">
        <b>Is this post real or fabricated?</b>
        <span>{posts.length} posts in this round. Some are genuine, some aren't.</span>
      </div>
      <div className="deck">
        <SwipeCard
          post={post}
          locked={locked}
          flyDir={flyDir}
          onThreshold={decide}
        />
      </div>
      <ActionBar onFlag={() => decide("flag")} onTrust={() => decide("trust")} disabled={locked} />
      <VerifyButton onClick={handleVerify} disabled={locked} />
      <p className="hint">
        Swipe the card, use the buttons, or press <kbd>←</kbd> to flag and <kbd>→</kbd> to trust
      </p>
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      <VerifySheet open={verifyOpen} post={post} onClose={() => setVerifyOpen(false)} />
    </section>
  );
}
