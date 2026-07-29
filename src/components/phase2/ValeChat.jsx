import { useEffect, useRef, useState } from "react";

export default function ValeChat({ messages, options, selectedOption, onSelectOption, onSend }) {
  const [text, setText] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="tp on" id="t-va">
      <div className="chat" ref={chatRef}>
        {messages.map((m, idx) => (
          <div key={idx} className={`msg ${m.role === "user" ? "u" : "v"}`}>
            {m.role === "user" ? (
              m.text
            ) : (
              <>
                <span dangerouslySetInnerHTML={{ __html: m.strong ? `<strong>${m.text}</strong>` : m.text }} />
                {m.why && <span className="w">{m.why}</span>}
              </>
            )}
          </div>
        ))}
      </div>
      <div className="vbar">
        <input
          type="text"
          placeholder="Tell Vale what to change"
          autoComplete="off"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send}>↑</button>
      </div>
      {options.length > 0 && (
        <div style={{ marginTop: 10 }}>
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
    </div>
  );
}
