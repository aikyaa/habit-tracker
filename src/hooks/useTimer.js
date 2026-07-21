import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "./useLocalStorage.js";
import { KEYS } from "../lib/storage.js";
import { todayStr } from "../lib/date.js";

export const FOCUS_MIN = 25;
export const BREAK_MIN = 5;

// The Pomodoro engine, lifted out of the FocusTimer component. Owns the
// ticking interval, the focus/break flip, and session logging so the view is
// just markup + button handlers.
export function useTimer() {
  const [mode, setMode] = useState("focus"); // "focus" | "break"
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MIN * 60);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useLocalStorage(KEYS.sessions, []);
  const intervalRef = useRef(null);

  // Exactly one interval, regardless of re-renders: the id lives in a ref and
  // cleanup clears it whenever `running` flips.
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  // At zero: log the focus minutes, then flip focus <-> break.
  useEffect(() => {
    if (secondsLeft > 0) return;
    setRunning(false);
    if (mode === "focus") {
      setSessions((prev) => [
        ...prev,
        { id: crypto.randomUUID(), minutes: FOCUS_MIN, date: todayStr() },
      ]);
      setMode("break");
      setSecondsLeft(BREAK_MIN * 60);
    } else {
      setMode("focus");
      setSecondsLeft(FOCUS_MIN * 60);
    }
  }, [secondsLeft, mode, setSessions]);

  function reset() {
    setRunning(false);
    setMode("focus");
    setSecondsLeft(FOCUS_MIN * 60);
  }

  const todayMinutes = sessions
    .filter((s) => s.date === todayStr())
    .reduce((sum, s) => sum + s.minutes, 0);

  return {
    mode,
    secondsLeft,
    running,
    toggle: () => setRunning((r) => !r),
    reset,
    todayMinutes,
  };
}
