import { MATCH } from "../../data/posts";

export default function CampaignSetup({ aud, hook, onAud, onHook, onOpenStrategist, onManual }) {
  const match = aud && hook ? MATCH[aud][hook] : 0;

  return (
    <div className="pad" id="p2a">
      <label className="lab" htmlFor="aud-select">Audience</label>
      <select id="aud-select" value={aud} onChange={(e) => onAud(e.target.value)}>
        <option value="">Choose an audience</option>
        <option value="parents">Parents, 30–50, small towns</option>
        <option value="teens">Teenagers, 14–18</option>
        <option value="commuters">Commuters, 25–60</option>
        <option value="retired">Retired residents, 65+</option>
      </select>
      <label className="lab" htmlFor="hook-select">Emotional hook</label>
      <select id="hook-select" value={hook} onChange={(e) => onHook(e.target.value)}>
        <option value="">Choose a hook</option>
        <option value="fear">Fear — something is being hidden</option>
        <option value="outrage">Outrage — someone got away with it</option>
        <option value="belonging">Belonging — people like you already know</option>
        <option value="pride">Pride — you're smarter than the rest</option>
      </select>
      <div className="meter" role="group" aria-label="Audience match">
        <span>Audience match</span>
        <span className="mb"><i style={{ background: "var(--p2act)", width: match + "%" }} /></span>
        <span className="mv" role="status" aria-live="polite">{match ? match + "%" : "—"}</span>
      </div>

      {/* Two ways in — Vale writes the opening draft for you, or you start
          from a blank post and write it yourself. Both land in the same
          composer with the same tools available afterward; this only
          decides how the first draft gets written. */}
      <span className="lab">How do you want to build it?</span>
      <p className="setup-note">
        Either way you land in the same composer, with Vale and the credibility signals available.
        This only decides who writes the first line.
      </p>
      <button className="pbtn" disabled={!match} onClick={onOpenStrategist}>
        Let Vale write it
      </button>
      <button className="pbtn pbtn-ghost" disabled={!match} onClick={onManual}>
        Write it yourself
      </button>
      {!match && <p className="pblock">Pick an audience and a hook first.</p>}
    </div>
  );
}
