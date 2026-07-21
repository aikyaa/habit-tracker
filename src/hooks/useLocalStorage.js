import { useEffect, useState } from "react";
import { load, save } from "../lib/storage.js";

// State that mirrors itself into localStorage. Replaces the repeated
// useState(() => load(...)) + useEffect(() => save(...)) pattern in App.jsx.
export function useLocalStorage(key, fallback) {
  const [value, setValue] = useState(() => load(key, fallback));

  useEffect(() => {
    save(key, value);
  }, [key, value]);

  return [value, setValue];
}
