import { useEffect, useRef, useState } from "react";
import { VALE_SUGGESTIONS } from "../../data/posts";

export default function ValeChat({ messages, options, selectedOption, onSelectOption, onSend, thinking }) {
  const [text, setText] = useState("");
  // Used suggestions drop out of the list, so the chips stay useful instead of
  // offering the same rewrite the learner already applied. Once they've all
  // been used the full set comes back rather than leaving an empty row.
  const [used, setUsed] = useState([]);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, thinking]);

  const send = (value) => {
    const t = (value ?? text).trim();
    if (!t || thinking) return;
    onSend(t);
    setText("");
    if (value) setUsed((u) => (u.length + 1 >= VALE_SUGGESTIONS.length ? [] : [...u, value]));
  };

  const suggestions = VALE_SUGGESTIONS.filter((s) => !used.includes(s));

  return (
    <div className="tp on" id="t-va">
      <div className="chat" ref={chatRef} aria-live="polite">
        {messages.length === 0 && (
          <p className="pnone" style={{ margin: 0 }}>
            Vale writes the headline. Pick one of its openings, or ask for a change —
            it always names the tactic it used.
          </p>
        )}
        {messages.map((m, idx) => (
          <div key={idx} className={`msg ${m.role === "user" ? "u" : "v"} ${m.refused ? "ref" : ""}`}>
            {m.role === "user" ? (
              m.text
            ) : (
              <>
                {m.strong ? <strong>{m.text}</strong> : m.text}
                {m.why && <span className="w">{m.why}</span>}
              </>
            )}
          </div>
        ))}
        {thinking && (
          <div className="msg v vthink" aria-label="Vale is writing">
            <i /><i /><i />
          </div>
        )}
      </div>

      {/* Vale's three openings are the primary action on first entry, so they
          sit above the input rather than below it. */}
      {options.length > 0 && (
        <div className="hopts">
          {options.map((o, idx) => (
            <button
              key={idx}
              className={`hopt ${idx === selectedOption ? "on" : ""}`}
              onClick={() => onSelectOption(idx)}
            >
              <div className="t">{o.headline}</div>
              <div className="w">{o.reason}</div>
            </button>
          ))}
        </div>
      )}

      <div className="vbar">
        <input
          type="text"
          placeholder="Tell Vale what to change"
          aria-label="Tell Vale what to change"
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={() => send()} disabled={thinking} aria-label="Send to Vale">↑</button>
      </div>

      {/* Removes the "what am I supposed to type?" problem entirely. */}
      <div className="vsug">
        {suggestions.map((s) => (
          <button key={s} className="vsugb" onClick={() => send(s)} disabled={thinking}>{s}</button>
        ))}
      </div>

      {/* Standing AI disclosure. An app whose entire subject is being misled by
          confident text cannot present its own AI as authoritative — the lesson
          has to apply to this screen too. Kept permanently visible rather than
          behind a tooltip, and deliberately worded to invite scepticism about
          Vale specifically, not just AI in the abstract. */}
      <p className="vdisc">
        Vale is AI and can make mistakes — it argues for whatever you ask it to. Everything here is
        invented. Double-check responses.
      </p>
    </div>
  );
}
