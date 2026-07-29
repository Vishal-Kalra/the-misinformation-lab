import { useEffect, useRef, useState } from "react";
import { useStore } from "../../store";
import { ARTS, AUD_BASE } from "../../data/posts";
import { getAudienceMatch, getOpeningOptions, getOpeningIntroMessage, getValeResponse } from "../../services/valeService";
import CampaignSetup from "./CampaignSetup";
import PostCanvas from "./PostCanvas";
import ValeChat from "./ValeChat";
import ArtifactPalette from "./ArtifactPalette";
import CredibilityMeter from "./CredibilityMeter";
import SpreadView from "./SpreadView";

export default function Phase2({ onPublished }) {
  const campaign = useStore((s) => s.campaign);
  const setCampaignField = useStore((s) => s.setCampaignField);
  const setCampaign = useStore((s) => s.setCampaign);
  const artifacts = useStore((s) => s.artifacts);
  const addArtifact = useStore((s) => s.addArtifact);
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
  const [placed, setPlaced] = useState([]);
  const [hot, setHot] = useState(false);
  const [showSpread, setShowSpread] = useState(false);

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

  const openStrategist = () => {
    const match = getAudienceMatch(campaign.aud, campaign.hook);
    const opts = getOpeningOptions(campaign.hook);
    setCampaign({ aud: campaign.aud, hook: campaign.hook, head: opts[0].headline, match });
    setHeadline(opts[0].headline);
    setOptions(opts);
    setSelectedOption(0);
    const intro = getOpeningIntroMessage(campaign.hook);
    setMessages([{ role: "vale", text: intro.text, why: intro.why }]);
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

  // drag-to-canvas for artifact palette
  useEffect(() => {
    const move = (e) => {
      const drag = dragRef.current;
      if (!drag || !canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      setHot(e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom);
    };
    const up = (e) => {
      const drag = dragRef.current;
      if (!drag || !canvasRef.current) return;
      const r = canvasRef.current.getBoundingClientRect();
      if (e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom) {
        const x = Math.max(4, Math.min(e.clientX - r.left - 24, r.width - 100));
        const y = Math.max(4, Math.min(e.clientY - r.top - 12, r.height - 28));
        setPlaced((p) => [...p, { uid: `${drag.id}-${Date.now()}`, art: drag, x, y }]);
        addArtifact(drag.id);
      }
      setHot(false);
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

  const launch = () => {
    const topId = [...artifacts].sort((x, y) => ARTS.find((a) => a.id === y).w - ARTS.find((a) => a.id === x).w)[0];
    const topArt = ARTS.find((a) => a.id === topId);
    const reach = Math.round(AUD_BASE * (campaign.match / 100) * (cred / 100) * 8);
    setReachAndCred(reach, cred, topArt.n);
    setShowSpread(true);
  };

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
        />
      )}

      {step === "composer" && (
        <div className="composer">
          <PostCanvas ref={canvasRef} headline={headline} headlineSwapping={headlineSwapping} hot={hot} placed={placed} />
          <div className="composer-tools">
            <div className="tabs">
              <button className={`tab ${tab === "va" ? "on" : ""}`} onClick={() => setTab("va")}>Vale</button>
              <button className={`tab ${tab === "el" ? "on" : ""}`} onClick={() => setTab("el")}>Signals</button>
            </div>
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
                  onDragStart={(a) => { dragRef.current = a; }}
                />
                <div className="why"><b>{why.n || "What this does"}</b>{why.why}</div>
              </div>
            )}
          </div>
          <CredibilityMeter cred={cred} onLaunch={launch} disabled={artifacts.length === 0} />
        </div>
      )}

      <SpreadView
        show={showSpread}
        reach={reach}
        match={campaign.match}
        cred={cred}
        topArtName={topArtifact}
        onContinue={onPublished}
      />
    </section>
  );
}
