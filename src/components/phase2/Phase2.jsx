import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store";
import { ARTS, AUD_BASE } from "../../data/posts";
import { getAudienceMatch, getOpeningOptions, getOpeningIntroMessage, getValeResponse } from "../../services/valeService";
import { addToPool, buildCommunityPost, getPoolCount } from "../../services/communityPool";
import CampaignSetup from "./CampaignSetup";
import PostCanvas from "./PostCanvas";
import ValeChat from "./ValeChat";
import ArtifactPalette from "./ArtifactPalette";
import PropertiesPanel from "./PropertiesPanel";
import CredibilityMeter from "./CredibilityMeter";
import SpreadView from "./SpreadView";
import ImagePicker from "./ImagePicker";

// Signals and Props used to be two separate tabs (a drag-source library and
// an inspector for whatever you'd placed). Placing a signal silently jumped
// you from one to the other, which read as the UI moving on its own, and
// nothing explained that "Props" meant "the details panel for the thing you
// just placed." They're now one "Signals" tab: palette on top, inspector
// appears inline underneath the moment something's selected.
const TAB_HINTS = {
  va: "Chat with Vale to rewrite your headline for the audience you picked.",
  el: "Optional — drag a signal onto your post to raise its credibility score. Select one already placed to adjust or remove it.",
};

export default function Phase2({ onPublished }) {
  const campaign = useStore((s) => s.campaign);
  const setCampaignField = useStore((s) => s.setCampaignField);
  const setCampaign = useStore((s) => s.setCampaign);
  const artifacts = useStore((s) => s.artifacts);
  const placedArtifacts = useStore((s) => s.placedArtifacts);
  const addPlacedArtifact = useStore((s) => s.addPlacedArtifact);
  const updatePlacedArtifact = useStore((s) => s.updatePlacedArtifact);
  const removePlacedArtifact = useStore((s) => s.removePlacedArtifact);
  const postSource = useStore((s) => s.postSource);
  const setPostSource = useStore((s) => s.setPostSource);
  const postImage = useStore((s) => s.postImage);
  const postImageCaption = useStore((s) => s.postImageCaption);
  const setPostImage = useStore((s) => s.setPostImage);
  const logValeRequest = useStore((s) => s.logValeRequest);
  const setReachAndCred = useStore((s) => s.setReachAndCred);
  const reach = useStore((s) => s.reach);
  const topArtifact = useStore((s) => s.topArtifact);
  const step = useStore((s) => s.composerStep);
  const setStep = useStore((s) => s.setComposerStep);

  const [tab, setTab] = useState("va"); // va | el
  const [headline, setHeadline] = useState("Council reviews reservoir treatment schedule");
  const [headlineSwapping, setHeadlineSwapping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(0);
  const [why, setWhy] = useState({ n: "", why: "Tap a signal to see why it works, then drag it onto the post." });
  const [hot, setHot] = useState(false);
  const [showSpread, setShowSpread] = useState(false);
  const [selectedUid, setSelectedUid] = useState(null);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  // Publishing always adds the post to the shared pool too — no separate
  // "submit to the pool" button anymore, see launch() below. poolCount is
  // just for the confirmation line on the reach screen.
  const [poolCount, setPoolCount] = useState(getPoolCount());

  const canvasRef = useRef(null);
  const dragRef = useRef(null);

  const cred = Math.min(100, artifacts.reduce((sum, id) => sum + ARTS.find((a) => a.id === id).w, 0));

  const swapHeadline = (text) => {
    setHeadlineSwapping(true);
    setTimeout(() => {
      setHeadline(text);
      setHeadlineSwapping(false);
    }, 240);
  };

  // AI path — Vale (currently the rule-based stub in valeService.js, to be
  // swapped for a real API call later per the TODO(vale-api) there) writes
  // the opening headline options. This used to be the *only* door into the
  // composer, so building a post always meant going through Vale first.
  const openStrategist = () => {
    const match = getAudienceMatch(campaign.aud, campaign.hook);
    const opts = getOpeningOptions(campaign.hook);
    setCampaign({ aud: campaign.aud, hook: campaign.hook, head: opts[0].headline, match });
    setHeadline(opts[0].headline);
    setOptions(opts);
    setSelectedOption(0);
    const intro = getOpeningIntroMessage(campaign.hook);
    setMessages([{ role: "vale", text: intro.text, why: intro.why }]);
    setTab("va");
    setStep("composer");
  };

  // Manual path — skip Vale entirely and start from a blank post. Audience
  // match still uses the static MATCH lookup table (not an AI call — it's
  // just how well-targeted the pick is) so reach math on Publish is
  // unaffected by which path the learner took. Vale stays available in its
  // tab afterward in case they want a rewrite mid-way; it's just not the
  // only way in anymore.
  const openManualEditor = () => {
    const match = getAudienceMatch(campaign.aud, campaign.hook);
    setCampaign({ aud: campaign.aud, hook: campaign.hook, head: "", match });
    setHeadline("");
    setOptions([]);
    setSelectedOption(0);
    setMessages([]);
    setTab("el");
    setStep("composer");
  };

  const selectOption = (idx) => {
    setSelectedOption(idx);
    const h = options[idx].headline;
    setCampaignField("head", h);
    swapHeadline(h);
  };

  const sendToVale = (text) => {
    setMessages((m) => [...m, { role: "user", text }]);
    setTimeout(() => {
      const result = getValeResponse(text);
      if (result.matched) {
        setCampaignField("head", result.headline);
        setCampaignField("match", result.match);
        swapHeadline(result.headline);
        logValeRequest(result.intent);
      }
      setMessages((m) => [...m, { role: "vale", text: result.message.text, why: result.message.why, strong: result.matched }]);
    }, 620);
  };

  // Typed directly on the canvas — no fade transition, just a live edit.
  const editHeadline = (text) => {
    setHeadline(text);
    setCampaignField("head", text);
  };
  const editSource = (text) => setPostSource(text);

  // Selecting a signal (by dropping a new one, or grabbing one already on
  // the canvas) only needs to switch tabs if the user's on Vale — the
  // inspector lives inline inside the Signals tab now, so there's no more
  // hop between two similarly-named tool tabs to disorient them.
  const selectArtifact = (uid) => {
    setSelectedUid(uid);
    setTab("el");
  };
  const deselect = () => setSelectedUid(null);

  const pickImage = (grad, label) => {
    setPostImage(grad, label);
    setImagePickerOpen(false);
  };

  // drag-to-canvas for the artifact palette, plus dragging already-placed
  // signals around the post — two modes, matching phase2-composer-properties.html.
  useEffect(() => {
    const move = (e) => {
      const drag = dragRef.current;
      if (!drag || !canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      if (drag.mode === "new") {
        setHot(e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
      } else if (drag.mode === "move") {
        const x = Math.max(0, Math.min(e.clientX - r.left - drag.offsetX, r.width - 30));
        const y = Math.max(0, Math.min(e.clientY - r.top - drag.offsetY, r.height - 20));
        updatePlacedArtifact(drag.uid, { x, y });
      }
    };
    const up = (e) => {
      const drag = dragRef.current;
      if (!drag || !canvasRef.current) return;
      if (drag.mode === "new") {
        const r = canvasRef.current.getBoundingClientRect();
        if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) {
          const x = Math.max(4, Math.min(e.clientX - r.left - 24, r.width - 100));
          const y = Math.max(4, Math.min(e.clientY - r.top - 12, r.height - 28));
          const uid = `${drag.art.id}-${Date.now()}`;
          addPlacedArtifact({ uid, id: drag.art.id, x, y, scale: 1, rotation: 0, opacity: 100, text: drag.art.h });
          selectArtifact(uid);
        }
        setHot(false);
      }
      dragRef.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onArtifactPointerDown = (uid, e) => {
    const item = placedArtifacts.find((p) => p.uid === uid);
    if (!item || !canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    dragRef.current = { mode: "move", uid, offsetX: e.clientX - r.left - item.x, offsetY: e.clientY - r.top - item.y };
    selectArtifact(uid);
  };

  // Publish is the only button — signals are optional (credibility can
  // legitimately be 0%, which is itself the lesson), and there's no separate
  // "submit to the pool" step anymore. One click: shows the reach spread,
  // AND saves this exact post into the shared pool that a future learner's
  // Phase 1 draws its random 5 from.
  const launch = () => {
    const topId = artifacts.length
      ? [...artifacts].sort((x, y) => ARTS.find((a) => a.id === y).w - ARTS.find((a) => a.id === x).w)[0]
      : null;
    const topArt = topId ? ARTS.find((a) => a.id === topId) : null;
    const reach = Math.round(AUD_BASE * (campaign.match / 100) * (cred / 100) * 8);
    setReachAndCred(reach, cred, topArt ? topArt.n : null);

    const signalNames = [...new Set(artifacts.map((id) => ARTS.find((a) => a.id === id)?.n).filter(Boolean))];
    const post = buildCommunityPost({
      source: postSource.trim(),
      headline: headline.trim(),
      why: signalNames.length
        ? `Built by a fellow learner using: ${signalNames.join(", ")}.`
        : "Built by a fellow learner — no credibility signals added.",
      signals: signalNames,
      img: postImage,
      cap: postImageCaption,
    });
    setPoolCount(addToPool(post));

    setShowSpread(true);
  };

  const selected = placedArtifacts.find((p) => p.uid === selectedUid) || null;

  return (
    <section id="p2" className="scr">
      <div className="bar">
        <span className="brand">reach<span>desk</span></span>
        <span className="step">{step === "setup" ? "01 / 02" : "02 / 02"}</span>
      </div>

      {step === "setup" && (
        <CampaignSetup
          aud={campaign.aud}
          hook={campaign.hook}
          onAud={(v) => setCampaignField("aud", v)}
          onHook={(v) => setCampaignField("hook", v)}
          onOpenStrategist={openStrategist}
          onManual={openManualEditor}
        />
      )}

      {step === "composer" && (
        <div className="composer">
          {/* The one post — Publish uses exactly what's here, both for the
              profile and for the shared pool. */}
          <PostCanvas
            ref={canvasRef}
            hot={hot}
            editable
            selectedUid={selectedUid}
            onArtifactPointerDown={onArtifactPointerDown}
            onCanvasPointerDown={deselect}
            source={postSource}
            onSourceChange={editSource}
            headline={headline}
            headlineSwapping={headlineSwapping}
            onHeadlineChange={editHeadline}
            image={postImage}
            imageCaption={postImageCaption}
            onImageClick={() => setImagePickerOpen((o) => !o)}
            placed={placedArtifacts}
          />
          <div className="composer-tools">
            <div className="tabs">
              <button className={`tab ${tab === "va" ? "on" : ""}`} onClick={() => setTab("va")}>Vale</button>
              <button className={`tab ${tab === "el" ? "on" : ""}`} onClick={() => setTab("el")}>Signals</button>
            </div>
            <p className="tab-hint">{TAB_HINTS[tab]}</p>
            {tab === "va" && (
              <ValeChat
                messages={messages}
                options={options}
                selectedOption={selectedOption}
                onSelectOption={selectOption}
                onSend={sendToVale}
              />
            )}
            {tab === "el" && (
              <div className="tp on" id="t-el">
                <ArtifactPalette
                  onShowWhy={(a) => setWhy({ n: a.n, why: a.why })}
                  onDragStart={(a) => { dragRef.current = { mode: "new", art: a }; }}
                />
                {selected ? (
                  <PropertiesPanel
                    selected={selected}
                    onUpdate={(patch) => updatePlacedArtifact(selectedUid, patch)}
                    onRemove={() => { removePlacedArtifact(selectedUid); setSelectedUid(null); }}
                  />
                ) : (
                  <div className="why"><b>{why.n || "What this does"}</b>{why.why}</div>
                )}
              </div>
            )}
          </div>
          <CredibilityMeter cred={cred} onLaunch={launch} disabled={!postSource.trim() || !headline.trim()} />
        </div>
      )}

      {/* Rendered here, not inside the canvas's tiny image thumbnail — that
          was the whole bug: it used to be confined to a 118px-tall box,
          which is why it needed scrolling and felt cramped. */}
      {imagePickerOpen && (
        <ImagePicker
          headline={headline}
          onPick={pickImage}
          onClose={() => setImagePickerOpen(false)}
        />
      )}

      <SpreadView
        show={showSpread}
        reach={reach}
        match={campaign.match}
        cred={cred}
        topArtName={topArtifact}
        poolCount={poolCount}
        onContinue={onPublished}
      />
    </section>
  );
}
