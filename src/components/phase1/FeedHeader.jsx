export default function FeedHeader({ index, total, round }) {
  return (
    <div className="bar">
      <span className="logo">stream</span>
      <span className="pmeta">
        <span className="rnd">Round {round}</span>
        <span className="dots">
          {Array.from({ length: total }).map((_, i) => (
            <i key={i} className={i < index ? "on" : ""} />
          ))}
        </span>
        <span className="cnt">{index}/{total}</span>
      </span>
    </div>
  );
}
