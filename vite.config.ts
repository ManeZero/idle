import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// При деплое на GitHub Pages игра живёт по URL https://manezero.github.io/idle/
// поэтому prod-сборка должна знать что её ассеты лежат под `/idle/`.
// В dev-режиме (pnpm dev) base остаётся `/`.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/idle/" : "/",
  plugins: [react()],
  resolve: {
    alias: { "@": "/src" },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/setupTests.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["src/main.tsx", "src/vite-env.d.ts", "**/*.d.ts"],
    },
  },
}));
