import { useDailyIntention } from "../hooks/useDailyIntention.js";

// A single "what matters today" line that sits at the top. Deliberately light:
// no list, no history — just one thing to keep in view.
export default function DailyIntention() {
  const [text, setText] = useDailyIntention();

  return (
    <div className="card intention">
      <span className="intention__label">Today's intention</span>
      <input
        className="intention__input"
        placeholder="One thing that matters today…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}
