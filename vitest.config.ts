import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["src/renderer/test/setup.ts"],
    exclude: [
      ...configDefaults.exclude,
      ".worktrees/**",
      "out/**",
      "release/**"
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"]
    }
  }
});
