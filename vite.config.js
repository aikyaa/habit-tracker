import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite is our dev server + build tool. The React plugin lets us write JSX.
// Vitest reads this same config; `test` configures the test runner. Our current
// tests are pure functions, so the lightweight "node" environment is enough.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.{js,jsx}"],
  },
});
