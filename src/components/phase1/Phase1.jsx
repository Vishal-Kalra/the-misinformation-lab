import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store";
import FeedHeader from "./FeedHeader";
import SwipeCard from "./SwipeCard";
import ActionBar from "./ActionBar";
import VerifyButton from "./VerifyButton";
import VerifySheet from "./VerifySheet";

export default function Phase1({ onRoundOneDone, onRoundTwoDone }) {
  const round = useStore((s) => s.round);
  const i = useStore((s) => s.i);
  const posts = useStore((s) => s.posts)();
  const recordDecision = useStore((s) => s.recordDecision);
  const advancePost = useStore((s) => s.advancePost);

  const [locked, setLocked] = useState(false);
  const [verified, setVerified] = useState(false);
  const [flyDir, setFlyDir] = useState(null);
  const [verifyOpen, setVerifyOpen] = useState(false);
  const t0 = useRef(0);

  const post = posts[i];

  useEffect(() => {
    setLocked(false);
    setVerified(false);
    setFlyDir(null);
    setVerifyOpen(false);
    t0.current = performance.now();
  }, [i, round]);

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
        if (round === 1) onRoundOneDone();
        else onRoundTwoDone();
      } else {
        advancePost();
      }
    }, 350);
  };

  const decide = (action) => {
    if (locked || !post) return;
    setLocked(true);
    const ms = Math.round(performance.now() - t0.current);
    setFlyDir(action === "flag" ? -1 : 1);
    record(action, null, ms);
    goNext();
  };

  const handleVerify = () => {
    setVerified(true);
    setVerifyOpen(true);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") decide("flag");
      if (e.key === "ArrowRight") decide("trust");
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locked, post, verified]);

  if (!post) return null;

  return (
    <section id="p1" className="scr">
      <FeedHeader round={round} index={i} total={posts.length} />
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
      <p className="hint">Swipe the card, or use the buttons</p>
      <VerifySheet open={verifyOpen} post={post} onClose={() => setVerifyOpen(false)} />
    </section>
  );
}
