import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// All media lives in public/ (site media under public/v, the share image under public/assets) and is copied by Vite.
export default defineConfig({
  base: "/divi/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "./src") } },
  build: { outDir: "build", emptyOutDir: true },
});
