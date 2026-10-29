import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// publicDir padrão (public/). As imagens dos slides ficam em public/slides,
// e as fotos da equipe em public/fotos-equipe (junction -> ../fotos-equipe,
// mantendo a fonte única fora do projeto, sem cópia duplicada).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5500,
    open: true,
    // encaminha /api/* para o backend Node (porta 8787), evitando CORS
    proxy: {
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
});
