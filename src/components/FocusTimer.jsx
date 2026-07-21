import { useTimer } from "../hooks/useTimer.js";

export default function FocusTimer() {
  const { mode, secondsLeft, running, toggle, reset, todayMinutes } = useTimer();

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  return (
    <div className={`card timer timer--${mode}`}>
      <div className="timer__left">
        <span className="timer__mode">
          {mode === "focus" ? "Focus" : "Break"}
        </span>
        <span className="timer__clock">
          {mm}:{ss}
        </span>
      </div>
      <div className="timer__controls">
        <button onClick={toggle}>{running ? "Pause" : "Start"}</button>
        <button className="btn--ghost" onClick={reset}>
          Reset
        </button>
      </div>
      <div className="timer__today">
        <span className="timer__todaynum">{todayMinutes}</span>
        <span className="timer__todaylabel">min focused today</span>
      </div>
    </div>
  );
}
