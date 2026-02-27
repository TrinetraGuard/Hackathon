import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { defineConfig } from "vite";

const root = resolve(__dirname, "src");

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    manifest: true,
  },
  plugins: [react()],
  server: {
    cors: true,
    port: 3000,
    origin: "http://localhost:3000",
  },
  resolve: {
    alias: {
      "@": resolve(root, ""),
      "pages": resolve(root, "pages"),
    },
  },
});
