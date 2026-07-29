import { useEffect, useState } from "react";
import { useStore } from "./store";
import Navbar from "./components/Navbar";
import Intro from "./components/Intro";
import Interstitial from "./components/Interstitial";
import Phase1 from "./components/phase1/Phase1";
import Phase2 from "./components/phase2/Phase2";
import Profile from "./components/Profile";
import Phase3 from "./components/phase3/Phase3";

const BG = { intro: "#0B0B0F", p1: "var(--p1bg)", p2: "var(--p2bg)", prof: "var(--p1bg)", p3: "#fff" };

const TITLES = {
  intro: "The Misinformation Lab",
  phase1: "Detect — The Misinformation Lab",
  phase2: "Campaign — The Misinformation Lab",
  profile: "Profile — The Misinformation Lab",
  phase3: "Reveal — The Misinformation Lab",
};

// The navbar is global chrome, so it's only shown on the "product" screens.
// Intro is a deliberate cold open and Phase 3 is a chrome-free verdict per
// SPEC.md §3 ("remove the interface; this is a verdict") — both stay bare.
const SHOW_NAV = new Set(["phase1", "phase2", "profile"]);

export default function App() {
  const phase = useStore((s) => s.phase);
  const setPhase = useStore((s) => s.setPhase);
  const startRoundTwo = useStore((s) => s.startRoundTwo);
  const setComposerStep = useStore((s) => s.setComposerStep);
  const [interstitial, setInterstitial] = useState(null);

  useEffect(() => {
    document.title = TITLES[phase] ?? TITLES.intro;
  }, [phase]);

  const bg =
    phase === "intro" ? BG.intro :
    phase === "phase1" ? BG.p1 :
    phase === "phase2" ? BG.p2 :
    phase === "profile" ? BG.prof :
    BG.p3;

  const goPhase2 = () =>
    setInterstitial({
      kicker: "Phase 2", headline: "Now you run the campaign.",
      body: "Same tools. Other side of the screen.", buttonLabel: "Open the desk",
      next: () => setPhase("phase2"),
    });

  const goPhase3AfterRoundTwo = () =>
    setInterstitial({
      kicker: "Round two complete", headline: "Let's look at what happened.",
      body: "Both rounds, plus the campaign you built.", buttonLabel: "See the result",
      next: () => setPhase("phase3"),
    });

  const goRoundTwo = () =>
    setInterstitial({
      kicker: "Round two", headline: "Five more posts.",
      body: "Different town. Same tactics. Let's see if anything changed.", buttonLabel: "Begin",
      next: () => { startRoundTwo(); setPhase("phase1"); },
    });

  const finishInterstitial = () => {
    const next = interstitial.next;
    setInterstitial(null);
    next();
  };

  return (
    <div id="app" style={{ background: bg }}>
      {SHOW_NAV.has(phase) && (
        <Navbar
          onBack={() => setComposerStep("setup")}
          onProfile={() => setPhase("profile")}
        />
      )}
      {phase === "intro" && <Intro onStart={() => setPhase("phase1")} />}
      {phase === "phase1" && <Phase1 onRoundOneDone={goPhase2} onRoundTwoDone={goPhase3AfterRoundTwo} />}
      {phase === "phase2" && <Phase2 onPublished={() => setPhase("profile")} />}
      {phase === "profile" && <Profile onTakeRoundTwo={goRoundTwo} onSeeResult={() => setPhase("phase3")} />}
      {phase === "phase3" && <Phase3 onDone={() => setPhase("profile")} />}
      {interstitial && (
        <Interstitial
          kicker={interstitial.kicker}
          headline={interstitial.headline}
          body={interstitial.body}
          buttonLabel={interstitial.buttonLabel}
          onContinue={finishInterstitial}
        />
      )}
    </div>
  );
}
