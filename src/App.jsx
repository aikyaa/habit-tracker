import { useState } from "react";
import FocusTimer from "./components/FocusTimer.jsx";
import Deadlines from "./components/Deadlines.jsx";
import Habits from "./components/Habits.jsx";
import DailyIntention from "./components/DailyIntention.jsx";
import StatsBar from "./components/StatsBar.jsx";

// ---------------------------------------------------------------------------
// PHASE 1. The messy Phase-0 App.jsx has been split: date/storage/streak logic
// now lives in lib/, the timer + localStorage state in hooks/, and each feature
// UI in its own component under components/. App is back to being a thin shell —
// tabs + layout, nothing else.
// ---------------------------------------------------------------------------

export default function App() {
  const [view, setView] = useState("deadlines"); // "deadlines" | "habits"

  return (
    <div className="app">
      <header className="app__header">
        <h1>Momentum</h1>
        <nav className="tabs">
          <button
            className={view === "deadlines" ? "tab tab--active" : "tab"}
            onClick={() => setView("deadlines")}
          >
            Deadlines
          </button>
          <button
            className={view === "habits" ? "tab tab--active" : "tab"}
            onClick={() => setView("habits")}
          >
            Habits
          </button>
        </nav>
      </header>

      <DailyIntention />
      <StatsBar />

      {/* Timer sits above both views so a focus session keeps running even
          while you switch tabs. */}
      <FocusTimer />

      {view === "deadlines" ? <Deadlines /> : <Habits />}
    </div>
  );
}
