import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite is our dev server + build tool. The React plugin lets us write JSX.
export default defineConfig({
  plugins: [react()],
});
