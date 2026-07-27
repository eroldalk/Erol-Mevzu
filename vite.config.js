import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Erol-Mevzu/", // GitHub Pages bu repo alt yolunda yayınlanıyor: eroldalk.github.io/Erol-Mevzu/
  server: { port: 5174, strictPort: true },
});
