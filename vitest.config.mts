import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/**",
        "**/*.test.{ts,tsx}",
        "**/*.config.{ts,mts,js}",
        "vitest.setup.ts",
        ".next/**",
        "public/**",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
