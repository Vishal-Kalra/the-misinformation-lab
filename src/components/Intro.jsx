import { ROUND_SIZE } from "../store";

const STEPS = [
  ["01", "Spot the fakes", `${ROUND_SIZE} posts. Some are real. You decide which, and the clock is running.`],
  ["02", "Build one yourself", "Pick an audience, pick an emotion, and let a campaign strategist write it for you."],
  ["03", "See what you did", "Your score before and after, and every instruction you gave, quoted back to you."],
];

export default function Intro({ onStart }) {
  return (
    <section id="intro" className="scr">
      <div className="intro-wrap">
        <span className="k">The Misinformation Lab</span>

        <h1>
          You already know<br />
          fake news exists.<br />
          <em>It works anyway.</em>
        </h1>

        <p className="intro-lead">
          Ten minutes, three parts. Flagging something genuine costs you exactly as much as
          trusting something fake — so take your time, or don't, and find out which one you are.
        </p>

        {/* The three phases, up front. Phase 2 asks the learner to do something
            fairly startling; arriving at it unannounced is what made people
            hesitate rather than play along. */}
        <ol className="intro-steps">
          {STEPS.map(([n, title, body]) => (
            <li key={n}>
              <span className="isn">{n}</span>
              <span className="ist">{title}</span>
              <span className="isb">{body}</span>
            </li>
          ))}
        </ol>

        <div className="intro-cta">
          <button onClick={onStart}>Start the first round</button>
          <span className="intro-meta">No account. Nothing saved. Works in any browser.</span>
        </div>
      </div>
    </section>
  );
}
