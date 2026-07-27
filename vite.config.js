import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/Mevzu-Erol/", // GitHub Pages bu repo alt yolunda yayınlanıyor: eroldalk.github.io/Mevzu-Erol/
  server: { port: 5174, strictPort: true },
});
