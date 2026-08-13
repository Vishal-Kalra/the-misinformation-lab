import { useEffect, useRef, useState } from "react";
import { VALE_SUGGESTIONS } from "../../data/posts";

export default function ValeChat({ messages, options, selectedOption, onSelectOption, onSend, thinking }) {
  const [text, setText] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, thinking]);

  const send = (value) => {
    const t = (value ?? text).trim();
    if (!t || thinking) return;
    onSend(t);
    setText("");
  };

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
        {VALE_SUGGESTIONS.map((s) => (
          <button key={s} className="vsugb" onClick={() => send(s)} disabled={thinking}>{s}</button>
        ))}
      </div>
    </div>
  );
}
