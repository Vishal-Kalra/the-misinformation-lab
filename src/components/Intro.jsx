export default function Intro({ onStart }) {
  return (
    <section id="intro" className="scr">
      <span className="k">The Misinformation Lab</span>
      <h1>Five posts.<br />Some are <em>real</em>.</h1>
      <p>Decide which. Flagging something genuine costs you the same as trusting something fake.</p>
      <button onClick={onStart}>Begin</button>
    </section>
  );
}
