import { useLocalStorage } from "./useLocalStorage.js";
import { KEYS } from "../lib/storage.js";
import { todayStr } from "../lib/date.js";

// One intention per day. If the stored intention is from a previous day we
// treat it as empty — each morning starts with a blank slate rather than
// yesterday's leftover.
export function useDailyIntention() {
  const [stored, setStored] = useLocalStorage(KEYS.intention, {
    date: "",
    text: "",
  });

  const text = stored.date === todayStr() ? stored.text : "";
  const setText = (next) => setStored({ date: todayStr(), text: next });

  return [text, setText];
}
